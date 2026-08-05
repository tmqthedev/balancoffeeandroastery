const { query } = require('../config/postgres');

function legacyId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function mapContactRow(row) {
  if (!row) return null;

  return {
    _id: row.legacy_mongo_id || String(row.id),
    id: row.legacy_mongo_id || String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    type: row.type,
    status: row.status,
    priority: row.priority,
    source: row.source,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    referrer: row.referrer,
    tags: row.tags || [],
    followUpRequired: row.follow_up_required,
    emailSent: row.email_sent,
    consentToContact: row.consent_to_contact,
    responses: row.responses || [],
    internalNotes: row.internal_notes || [],
    dataRetentionDate: row.data_retention_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBlogRow(row) {
  if (!row) return null;

  return {
    _id: row.legacy_mongo_id || String(row.id),
    id: row.legacy_mongo_id || String(row.id),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    featuredImage: row.featured_image,
    image: row.featured_image,
    category: row.category,
    author: row.author,
    readingTime: row.reading_time,
    status: row.status,
    viewCount: row.view_count,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function extractCategoryName(category) {
  if (!category) return null;
  if (typeof category === 'string') return category;
  if (typeof category.name === 'string') return category.name;
  if (category.name?.vi) return category.name.vi;
  return null;
}

async function createContact(data) {
  const now = new Date();
  const result = await query(`
    INSERT INTO contacts (
      legacy_mongo_id,
      name,
      email,
      phone,
      subject,
      message,
      type,
      status,
      priority,
      source,
      ip_address,
      user_agent,
      referrer,
      tags,
      follow_up_required,
      email_sent,
      consent_to_contact,
      responses,
      internal_notes,
      data_retention_date,
      created_at,
      updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16,
      $17, $18, $19, $20, $21, $22
    )
    RETURNING *
  `, [
    legacyId('contact'),
    data.name || null,
    data.email || null,
    data.phone || null,
    data.subject || null,
    data.message || null,
    data.type || 'inquiry',
    data.status || 'new',
    data.priority || 'medium',
    data.source || 'website',
    data.ipAddress || null,
    data.userAgent || null,
    data.referrer || null,
    data.tags || [],
    Boolean(data.followUpRequired),
    Boolean(data.emailSent),
    data.consentToContact !== undefined ? Boolean(data.consentToContact) : true,
    data.responses || [],
    data.internalNotes || [],
    data.dataRetentionDate || null,
    data.createdAt || now,
    data.updatedAt || now
  ]);

  return mapContactRow(result.rows[0]);
}

async function findSubscriptionByEmail(email) {
  const result = await query(
    'SELECT * FROM subscriptions WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] || null;
}

async function createSubscription(email) {
  const now = new Date();
  const result = await query(`
    INSERT INTO subscriptions (
      legacy_mongo_id,
      email,
      is_active,
      created_at,
      updated_at
    )
    VALUES ($1, $2, TRUE, $3, $3)
    RETURNING *
  `, [
    legacyId('subscription'),
    email,
    now
  ]);

  return result.rows[0];
}

async function unsubscribe(email) {
  const result = await query(`
    UPDATE subscriptions
    SET is_active = FALSE,
        updated_at = $2
    WHERE email = $1
    RETURNING id
  `, [email, new Date()]);

  return result.rowCount > 0;
}

async function listBlogs({ page = 1, limit = 6, search = '', category = '' } = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const actualLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);
  const offset = (currentPage - 1) * actualLimit;
  const searchTerm = search ? `%${search}%` : null;
  const categoryTerm = category ? `%${category}%` : null;

  const where = ['status = $1'];
  const params = ['published'];

  if (searchTerm) {
    params.push(searchTerm);
    const index = params.length;
    where.push(`(
      title::text ILIKE $${index}
      OR excerpt::text ILIKE $${index}
      OR content::text ILIKE $${index}
    )`);
  }

  if (categoryTerm) {
    params.push(categoryTerm);
    where.push(`category::text ILIKE $${params.length}`);
  }

  const whereSql = where.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM blogs WHERE ${whereSql}`,
    params
  );

  const blogsResult = await query(`
    SELECT
      id,
      legacy_mongo_id,
      title,
      slug,
      excerpt,
      featured_image,
      category,
      author,
      reading_time,
      status,
      published_at,
      created_at,
      updated_at
    FROM blogs
    WHERE ${whereSql}
    ORDER BY COALESCE(published_at, created_at) DESC NULLS LAST, id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `, [...params, actualLimit, offset]);

  const totalBlogs = countResult.rows[0]?.count || 0;
  const totalPages = Math.ceil(totalBlogs / actualLimit);

  return {
    blogs: blogsResult.rows.map(mapBlogRow),
    pagination: {
      currentPage,
      totalPages,
      totalBlogs,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    }
  };
}

async function listBlogCategories() {
  const result = await query(`
    SELECT category
    FROM blogs
    WHERE status = 'published'
  `);

  return Array.from(new Set(
    result.rows
      .map(row => extractCategoryName(row.category))
      .filter(Boolean)
  ));
}

async function getBlogBySlug(slug) {
  const result = await query(
    "SELECT * FROM blogs WHERE slug = $1 AND status = 'published' LIMIT 1",
    [slug]
  );

  const blog = mapBlogRow(result.rows[0]);
  if (!blog) {
    return { blog: null, relatedBlogs: [] };
  }

  await query(
    'UPDATE blogs SET view_count = COALESCE(view_count, 0) + 1 WHERE slug = $1',
    [slug]
  );

  const relatedResult = await query(`
    SELECT
      id,
      legacy_mongo_id,
      title,
      slug,
      excerpt,
      featured_image,
      category,
      author,
      reading_time,
      status,
      published_at,
      created_at,
      updated_at
    FROM blogs
    WHERE id <> $1
      AND status = 'published'
      AND category::text = $2
    ORDER BY COALESCE(published_at, created_at) DESC NULLS LAST, id DESC
    LIMIT 3
  `, [result.rows[0].id, JSON.stringify(result.rows[0].category)]);

  return {
    blog,
    relatedBlogs: relatedResult.rows.map(mapBlogRow)
  };
}

module.exports = {
  createContact,
  findSubscriptionByEmail,
  createSubscription,
  unsubscribe,
  listBlogs,
  listBlogCategories,
  getBlogBySlug
};
