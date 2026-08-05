const crypto = require('crypto');
const { query } = require('../config/postgres');

function newLegacyId() {
  return crypto.randomBytes(12).toString('hex');
}

function toJson(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return value;
}

function mapWeightPricing(row) {
  return {
    _id: row.legacy_mongo_id,
    weight: row.weight,
    weightDisplay: row.weight_display,
    price: Number(row.price || 0),
    stockQuantity: row.stock_quantity || 0,
    isAvailable: !!row.is_available,
    isDefault: !!row.is_default,
    discount: toJson(row.discount, {})
  };
}

function mapProduct(row) {
  const weightPricing = (row.weight_pricing || []).map(mapWeightPricing);
  const defaultPrice = weightPricing.find((item) => item.isDefault)?.price
    ?? weightPricing[0]?.price
    ?? 0;
  const stockQuantity = row.stock_quantity ?? weightPricing.reduce((sum, item) => sum + (item.stockQuantity || 0), 0);

  return {
    _id: row.legacy_mongo_id,
    id: row.legacy_mongo_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    pricingType: row.pricing_type,
    weightPricing,
    price: defaultPrice,
    lowStockThreshold: row.low_stock_threshold,
    image_url: row.image_url,
    thumbnail: row.thumbnail,
    categoryId: row.category_id,
    category: toJson(row.category, {}),
    tags: toJson(row.tags, []),
    origin: row.origin,
    region: row.region,
    altitude: row.altitude,
    varietals: toJson(row.varietals, []),
    roast_level: row.roast_level,
    roast_date: row.roast_date,
    flavor_profile: toJson(row.flavor_profile, []),
    aroma: toJson(row.aroma, []),
    acidity: row.acidity,
    body: row.body,
    sweetness: row.sweetness,
    brewing_methods: toJson(row.brewing_methods, []),
    processing_method: row.processing_method,
    harvest_season: row.harvest_season,
    certification: toJson(row.certification, []),
    status: row.status,
    isFeatured: !!row.is_featured,
    featured: !!row.is_featured,
    isActive: !!row.is_active,
    inStock: stockQuantity > 0,
    isDigital: !!row.is_digital,
    requiresShipping: !!row.requires_shipping,
    promotion: toJson(row.promotion, {}),
    seo: toJson(row.seo, {}),
    rating: toJson(row.rating, {}),
    stats: toJson(row.stats, {}),
    dimensions: toJson(row.dimensions, {}),
    images: toJson(row.images, []),
    stockQuantity,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapCategory(row) {
  return {
    _id: row.legacy_mongo_id,
    id: row.legacy_mongo_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getProductRows({ where = [], params = [], sort = 'p.created_at DESC', limit, offset } = {}) {
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const paginationSql = [
    limit ? `LIMIT ${Number(limit)}` : '',
    offset ? `OFFSET ${Number(offset)}` : ''
  ].filter(Boolean).join(' ');

  const result = await query(`
    SELECT
      p.*,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'legacy_mongo_id', wp.legacy_mongo_id,
            'weight', wp.weight,
            'weight_display', wp.weight_display,
            'price', wp.price,
            'stock_quantity', wp.stock_quantity,
            'is_available', wp.is_available,
            'is_default', wp.is_default,
            'discount', wp.discount
          )
          ORDER BY wp.weight
        ) FILTER (WHERE wp.id IS NOT NULL),
        '[]'::jsonb
      ) AS weight_pricing
    FROM products p
    LEFT JOIN product_weight_pricing wp ON wp.product_id = p.id
    ${whereSql}
    GROUP BY p.id
    ORDER BY ${sort}
    ${paginationSql}
  `, params);

  return result.rows;
}

function buildProductWhere(filters = {}) {
  const where = [];
  const params = [];

  if (filters.search) {
    params.push(`%${filters.search}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
  }

  if (filters.category) {
    params.push(filters.category);
    where.push(`(p.category_id = $${params.length} OR p.category->>'slug' = $${params.length} OR p.category->>'name' = $${params.length})`);
  }

  if (filters.featured === 'true') {
    where.push('p.is_featured = TRUE');
  }

  if (filters.minPrice) {
    params.push(Number(filters.minPrice));
    where.push(`EXISTS (
      SELECT 1 FROM product_weight_pricing price_filter
      WHERE price_filter.product_id = p.id AND price_filter.price >= $${params.length}
    )`);
  }

  if (filters.maxPrice) {
    params.push(Number(filters.maxPrice));
    where.push(`EXISTS (
      SELECT 1 FROM product_weight_pricing price_filter
      WHERE price_filter.product_id = p.id AND price_filter.price <= $${params.length}
    )`);
  }

  return { where, params };
}

function buildProductSort(sort) {
  switch (sort) {
    case 'price_asc':
      return '(SELECT MIN(price) FROM product_weight_pricing wp_sort WHERE wp_sort.product_id = p.id) ASC NULLS LAST';
    case 'price_desc':
      return '(SELECT MIN(price) FROM product_weight_pricing wp_sort WHERE wp_sort.product_id = p.id) DESC NULLS LAST';
    case 'name':
    case 'name_asc':
      return 'p.name ASC';
    case 'name_desc':
      return 'p.name DESC';
    case 'oldest':
      return 'p.created_at ASC';
    case 'newest':
    default:
      return 'p.created_at DESC';
  }
}

async function listProducts(filters) {
  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 12), 1), 100);
  const offset = (page - 1) * limit;
  const { where, params } = buildProductWhere(filters);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*)::int AS count FROM products p ${whereSql}`, params);
  const totalProducts = countResult.rows[0].count;

  const rows = await getProductRows({
    where,
    params,
    sort: buildProductSort(filters.sort),
    limit,
    offset
  });

  return {
    products: rows.map(mapProduct),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      hasNextPage: page < Math.ceil(totalProducts / limit),
      hasPrevPage: page > 1,
      limit
    }
  };
}

async function listFeaturedProducts(limit = 8) {
  const rows = await getProductRows({
    where: ['p.is_featured = TRUE'],
    params: [],
    sort: 'p.created_at DESC',
    limit
  });
  return rows.map(mapProduct);
}

async function listProductCategories() {
  const result = await query(`
    SELECT DISTINCT COALESCE(category_id, category->>'slug', category->>'name') AS category
    FROM products
    WHERE COALESCE(category_id, category->>'slug', category->>'name') IS NOT NULL
    ORDER BY category ASC
  `);
  return result.rows.map((row) => row.category);
}

async function getProductByLegacyId(legacyMongoId) {
  const rows = await getProductRows({
    where: ['p.legacy_mongo_id = $1'],
    params: [legacyMongoId],
    limit: 1
  });
  return rows[0] ? mapProduct(rows[0]) : null;
}

async function getRelatedProducts(product, limit = 4) {
  const categorySlug = product.categoryId || product.category?.slug || product.category?.name;
  if (!categorySlug) return [];

  const rows = await getProductRows({
    where: [
      'p.legacy_mongo_id <> $1',
      '(p.category_id = $2 OR p.category->>\'slug\' = $2 OR p.category->>\'name\' = $2)'
    ],
    params: [product._id, categorySlug],
    limit
  });

  return rows.map(mapProduct);
}

function productColumnsFromPayload(payload, { isCreate = false } = {}) {
  const now = new Date();
  const data = {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    short_description: payload.shortDescription,
    pricing_type: payload.pricingType,
    low_stock_threshold: payload.lowStockThreshold,
    image_url: payload.image_url || payload.imageUrl,
    thumbnail: payload.thumbnail,
    category_id: payload.categoryId || payload.category,
    category: payload.category && typeof payload.category === 'object' ? payload.category : undefined,
    tags: payload.tags,
    origin: payload.origin,
    region: payload.region,
    altitude: payload.altitude,
    varietals: payload.varietals,
    roast_level: payload.roast_level,
    roast_date: payload.roast_date,
    flavor_profile: payload.flavor_profile,
    aroma: payload.aroma,
    acidity: payload.acidity,
    body: payload.body,
    sweetness: payload.sweetness,
    brewing_methods: payload.brewing_methods,
    processing_method: payload.processing_method,
    harvest_season: payload.harvest_season,
    certification: payload.certification,
    status: payload.status,
    is_featured: payload.isFeatured ?? payload.featured,
    is_active: payload.isActive,
    is_digital: payload.isDigital,
    requires_shipping: payload.requiresShipping,
    promotion: payload.promotion,
    seo: payload.seo,
    rating: payload.rating,
    stats: payload.stats,
    dimensions: payload.dimensions,
    images: payload.images,
    stock_quantity: payload.stockQuantity,
    published_at: payload.publishedAt,
    updated_at: now
  };

  if (isCreate) {
    data.legacy_mongo_id = payload.legacyMongoId || payload._id || newLegacyId();
    data.created_at = payload.createdAt || now;
  }

  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

async function replaceProductWeightPricing(productId, weightPricing = []) {
  await query('DELETE FROM product_weight_pricing WHERE product_id = $1', [productId]);

  for (const option of weightPricing) {
    await query(`
      INSERT INTO product_weight_pricing (
        legacy_mongo_id,
        product_id,
        weight,
        weight_display,
        price,
        stock_quantity,
        is_available,
        is_default,
        discount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      option.legacyMongoId || option._id || newLegacyId(),
      productId,
      option.weight ?? null,
      option.weightDisplay || null,
      option.price ?? null,
      option.stockQuantity ?? null,
      boolish(option.isAvailable, true),
      boolish(option.isDefault),
      JSON.stringify(option.discount || {})
    ]);
  }
}

function boolish(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return value === true || value === 'true';
}

async function createProduct(payload) {
  const columns = productColumnsFromPayload(payload, { isCreate: true });
  const columnNames = Object.keys(columns);
  const values = Object.values(columns).map((value) => (
    value && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value
  ));
  const placeholders = columnNames.map((_, index) => `$${index + 1}`);

  const result = await query(`
    INSERT INTO products (${columnNames.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING id, legacy_mongo_id
  `, values);

  if (payload.weightPricing) {
    await replaceProductWeightPricing(result.rows[0].id, payload.weightPricing);
  }

  return getProductByLegacyId(result.rows[0].legacy_mongo_id);
}

async function updateProduct(legacyMongoId, payload) {
  const existing = await query('SELECT id FROM products WHERE legacy_mongo_id = $1', [legacyMongoId]);
  if (existing.rowCount === 0) return null;

  const columns = productColumnsFromPayload(payload);
  const columnNames = Object.keys(columns);

  if (columnNames.length > 0) {
    const values = Object.values(columns).map((value) => (
      value && typeof value === 'object' && !(value instanceof Date) ? JSON.stringify(value) : value
    ));
    const sets = columnNames.map((column, index) => `${column} = $${index + 1}`);
    await query(`
      UPDATE products
      SET ${sets.join(', ')}
      WHERE legacy_mongo_id = $${values.length + 1}
    `, [...values, legacyMongoId]);
  }

  if (payload.weightPricing) {
    await replaceProductWeightPricing(existing.rows[0].id, payload.weightPricing);
  }

  return getProductByLegacyId(legacyMongoId);
}

async function deleteProduct(legacyMongoId) {
  const result = await query('DELETE FROM products WHERE legacy_mongo_id = $1', [legacyMongoId]);
  return result.rowCount;
}

async function listCategories() {
  const result = await query(`
    SELECT *
    FROM categories
    WHERE is_active = TRUE
    ORDER BY name ASC
  `);
  return result.rows.map(mapCategory);
}

module.exports = {
  listProducts,
  listFeaturedProducts,
  listProductCategories,
  getProductByLegacyId,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories
};
