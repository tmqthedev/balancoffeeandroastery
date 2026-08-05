const { MongoClient, ObjectId } = require('mongodb');
const { Pool } = require('pg');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;
const postgresUri = process.env.POSTGRES_URI;

const SOURCE_DB = process.env.MONGODB_DATABASE || 'balancoffee';
const POSTGRES_SSLMODE = process.env.POSTGRES_SSLMODE || 'no-verify';

function requiredEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
}

function mongoId(value) {
  if (!value) return null;
  if (value instanceof ObjectId) return value.toString();
  if (typeof value === 'object' && value.$oid) return value.$oid;
  return String(value);
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && value.$date) return new Date(value.$date);
  return new Date(value);
}

function toDateOnly(value) {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : null;
}

function json(value, fallback) {
  if (value === undefined || value === null) {
    return JSON.stringify(fallback);
  }

  return JSON.stringify(value);
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

function normalizePostgresConnectionString(uri) {
  const url = new URL(uri);
  const sslMode = url.searchParams.get('sslmode');

  if (!sslMode || ['prefer', 'require', 'verify-ca', 'verify-full'].includes(sslMode)) {
    url.searchParams.set('sslmode', POSTGRES_SSLMODE);
  }

  return url.toString();
}

async function query(pg, text, params = []) {
  return pg.query(text, params);
}

async function resetPostgres(pg) {
  await query(pg, `
    TRUNCATE TABLE
      user_addresses,
      product_weight_pricing,
      cart_items,
      order_items,
      users,
      categories,
      products,
      carts,
      orders,
      contacts,
      blogs,
      subscriptions
    RESTART IDENTITY CASCADE
  `);
}

async function migrateUsers(db, pg) {
  const docs = await db.collection('users').find({}).toArray();
  const userIdMap = new Map();
  let addressCount = 0;

  for (const user of docs) {
    const result = await query(pg, `
      INSERT INTO users (
        legacy_mongo_id,
        cognito_sub,
        email,
        first_name,
        last_name,
        full_name,
        phone,
        role,
        status,
        email_verified,
        phone_verified,
        date_of_birth,
        gender,
        providers,
        preferences,
        stats,
        security,
        metadata,
        last_activity_at,
        last_tested,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22
      )
      RETURNING id
    `, [
      mongoId(user._id),
      user.cognitoSub || null,
      user.email,
      user.firstName || null,
      user.lastName || null,
      user.fullName || null,
      user.phone || null,
      user.role || 'customer',
      user.status || 'active',
      bool(user.emailVerified),
      bool(user.phoneVerified),
      toDateOnly(user.dateOfBirth),
      user.gender || null,
      json(user.providers, {}),
      json(user.preferences, {}),
      json(user.stats, {}),
      json(user.security, {}),
      json(user.metadata, {}),
      toDate(user.lastActivityAt),
      toDate(user.lastTested),
      toDate(user.createdAt),
      toDate(user.updatedAt)
    ]);

    const postgresUserId = result.rows[0].id;
    userIdMap.set(mongoId(user._id), postgresUserId);

    for (const address of user.addresses || []) {
      await query(pg, `
        INSERT INTO user_addresses (
          legacy_mongo_id,
          user_id,
          type,
          first_name,
          last_name,
          address1,
          street,
          ward_commune,
          district,
          city,
          province,
          postal_code,
          country,
          phone,
          is_default
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        mongoId(address._id),
        postgresUserId,
        address.type || null,
        address.firstName || null,
        address.lastName || null,
        address.address1 || null,
        address.street || null,
        address.wardCommune || null,
        address.district || null,
        address.city || null,
        address.province || null,
        address.postalCode || null,
        address.country || null,
        address.phone || null,
        bool(address.isDefault)
      ]);
      addressCount += 1;
    }
  }

  return { users: docs.length, user_addresses: addressCount, userIdMap };
}

async function migrateCategories(db, pg) {
  const docs = await db.collection('categories').find({}).toArray();

  for (const category of docs) {
    await query(pg, `
      INSERT INTO categories (
        legacy_mongo_id,
        name,
        slug,
        description,
        image,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      mongoId(category._id),
      category.name,
      category.slug,
      category.description || null,
      category.image || null,
      bool(category.isActive, true),
      toDate(category.createdAt),
      toDate(category.updatedAt)
    ]);
  }

  return { categories: docs.length };
}

async function migrateProducts(db, pg) {
  const docs = await db.collection('products').find({}).toArray();
  let weightPricingCount = 0;

  for (const product of docs) {
    const result = await query(pg, `
      INSERT INTO products (
        legacy_mongo_id,
        name,
        slug,
        description,
        short_description,
        pricing_type,
        low_stock_threshold,
        image_url,
        thumbnail,
        category_id,
        category,
        tags,
        origin,
        region,
        altitude,
        varietals,
        roast_level,
        roast_date,
        flavor_profile,
        aroma,
        acidity,
        body,
        sweetness,
        brewing_methods,
        processing_method,
        harvest_season,
        certification,
        status,
        is_featured,
        is_active,
        is_digital,
        requires_shipping,
        promotion,
        seo,
        rating,
        stats,
        dimensions,
        images,
        stock_quantity,
        published_at,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29, $30, $31, $32,
        $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42
      )
      RETURNING id
    `, [
      mongoId(product._id),
      product.name,
      product.slug || null,
      product.description || null,
      product.shortDescription || null,
      product.pricingType || null,
      product.lowStockThreshold ?? null,
      product.image_url || null,
      product.thumbnail || null,
      product.categoryId || null,
      json(product.category, {}),
      json(product.tags, []),
      product.origin || null,
      product.region || null,
      product.altitude ?? null,
      json(product.varietals, []),
      product.roast_level || null,
      toDate(product.roast_date),
      json(product.flavor_profile, []),
      json(product.aroma, []),
      product.acidity || null,
      product.body || null,
      product.sweetness || null,
      json(product.brewing_methods, []),
      product.processing_method || null,
      product.harvest_season || null,
      json(product.certification, []),
      product.status || 'active',
      bool(product.isFeatured),
      bool(product.isActive, true),
      bool(product.isDigital),
      bool(product.requiresShipping, true),
      json(product.promotion, {}),
      json(product.seo, {}),
      json(product.rating, {}),
      json(product.stats, {}),
      json(product.dimensions, {}),
      json(product.images, []),
      product.stockQuantity ?? null,
      toDate(product.publishedAt),
      toDate(product.createdAt),
      toDate(product.updatedAt)
    ]);

    const postgresProductId = result.rows[0].id;
    for (const option of product.weightPricing || []) {
      await query(pg, `
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
        mongoId(option._id),
        postgresProductId,
        option.weight ?? null,
        option.weightDisplay || null,
        option.price ?? null,
        option.stockQuantity ?? null,
        bool(option.isAvailable, true),
        bool(option.isDefault),
        json(option.discount, {})
      ]);
      weightPricingCount += 1;
    }
  }

  return { products: docs.length, product_weight_pricing: weightPricingCount };
}

async function migrateOneCartCollection(db, pg, collectionName) {
  const docs = await db.collection(collectionName).find({}).toArray();
  let itemCount = 0;

  for (const cart of docs) {
    const result = await query(pg, `
      INSERT INTO carts (
        legacy_mongo_id,
        source_collection,
        customer_id,
        item_count,
        subtotal,
        checkout,
        last_activity,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      mongoId(cart._id),
      collectionName,
      mongoId(cart.customerId),
      cart.itemCount ?? 0,
      number(cart.subtotal),
      json(cart.checkout, {}),
      toDate(cart.lastActivity),
      toDate(cart.createdAt),
      toDate(cart.updatedAt)
    ]);

    const postgresCartId = result.rows[0].id;
    for (const item of cart.items || []) {
      await query(pg, `
        INSERT INTO cart_items (
          legacy_mongo_id,
          cart_id,
          product_legacy_mongo_id,
          quantity,
          price,
          variant,
          added_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        mongoId(item._id),
        postgresCartId,
        mongoId(item.productId),
        item.quantity ?? null,
        item.price ?? null,
        json(item.variant, {}),
        toDate(item.addedAt),
        toDate(item.updatedAt)
      ]);
      itemCount += 1;
    }
  }

  return { carts: docs.length, cart_items: itemCount };
}

async function migrateCarts(db, pg) {
  const current = await migrateOneCartCollection(db, pg, 'cart');
  const legacy = await migrateOneCartCollection(db, pg, 'carts');

  return {
    carts: current.carts + legacy.carts,
    cart_items: current.cart_items + legacy.cart_items,
    cart_source_counts: {
      cart: current.carts,
      carts: legacy.carts
    }
  };
}

async function migrateOrders(db, pg) {
  const docs = await db.collection('orders').find({}).toArray();
  let itemCount = 0;

  for (const order of docs) {
    const customerInfo = order.customerInfo || {};
    const payment = order.payment || {};

    const result = await query(pg, `
      INSERT INTO orders (
        legacy_mongo_id,
        order_number,
        customer_id,
        customer_info,
        customer_email,
        customer_first_name,
        customer_last_name,
        customer_full_name,
        customer_phone,
        subtotal,
        shipping_fee,
        tax_amount,
        discount_amount,
        total,
        billing_address,
        shipping_address,
        payment,
        payment_method,
        payment_status,
        status,
        fulfillment_status,
        notes,
        tags,
        channel,
        timeline,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27
      )
      RETURNING id
    `, [
      mongoId(order._id),
      order.orderNumber,
      mongoId(order.customerId),
      json(customerInfo, {}),
      customerInfo.email || null,
      customerInfo.firstName || null,
      customerInfo.lastName || null,
      customerInfo.fullName || null,
      customerInfo.phone || null,
      order.subtotal ?? null,
      order.shippingFee ?? 0,
      order.taxAmount ?? 0,
      order.discountAmount ?? 0,
      order.total ?? null,
      json(order.billingAddress, {}),
      json(order.shippingAddress, {}),
      json(payment, {}),
      payment.method || null,
      payment.status || null,
      order.status || null,
      order.fulfillmentStatus || null,
      order.notes || null,
      json(order.tags, []),
      order.channel || null,
      json(order.timeline, []),
      toDate(order.createdAt),
      toDate(order.updatedAt)
    ]);

    const postgresOrderId = result.rows[0].id;
    for (const item of order.items || []) {
      await query(pg, `
        INSERT INTO order_items (
          legacy_mongo_id,
          order_id,
          product_legacy_mongo_id,
          product_name,
          product_name_vi,
          sku,
          price,
          quantity,
          subtotal,
          image,
          variant
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        mongoId(item._id),
        postgresOrderId,
        mongoId(item.productId),
        item.productName || null,
        item.productNameVi || null,
        item.sku || null,
        item.price ?? null,
        item.quantity ?? null,
        item.subtotal ?? null,
        item.image || null,
        json(item.variant, {})
      ]);
      itemCount += 1;
    }
  }

  return { orders: docs.length, order_items: itemCount };
}

async function migrateContacts(db, pg) {
  const docs = await db.collection('contacts').find({}).toArray();

  for (const contact of docs) {
    await query(pg, `
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
    `, [
      mongoId(contact._id),
      contact.name || null,
      contact.email || null,
      contact.phone || null,
      contact.subject || null,
      contact.message || null,
      contact.type || null,
      contact.status || null,
      contact.priority || null,
      contact.source || null,
      contact.ipAddress || null,
      contact.userAgent || null,
      contact.referrer || null,
      json(contact.tags, []),
      bool(contact.followUpRequired),
      bool(contact.emailSent),
      bool(contact.consentToContact),
      json(contact.responses, []),
      json(contact.internalNotes, []),
      toDate(contact.dataRetentionDate),
      toDate(contact.createdAt),
      toDate(contact.updatedAt)
    ]);
  }

  return { contacts: docs.length };
}

async function getPostgresCounts(pg) {
  const tables = [
    'users',
    'user_addresses',
    'categories',
    'products',
    'product_weight_pricing',
    'carts',
    'cart_items',
    'orders',
    'order_items',
    'contacts',
    'blogs',
    'subscriptions'
  ];

  const counts = {};
  for (const table of tables) {
    const result = await query(pg, `SELECT COUNT(*)::int AS count FROM ${table}`);
    counts[table] = result.rows[0].count;
  }

  return counts;
}

async function main() {
  requiredEnv('MONGODB_URI', mongoUri);
  requiredEnv('POSTGRES_URI', postgresUri);

  const mongo = new MongoClient(mongoUri);
  const pg = new Pool({
    connectionString: normalizePostgresConnectionString(postgresUri)
  });

  const summary = {};

  try {
    console.log(`Connecting to MongoDB source database: ${SOURCE_DB}`);
    await mongo.connect();
    const db = mongo.db(SOURCE_DB);

    console.log('Connecting to PostgreSQL target');
    await pg.query('SELECT 1');

    console.log('Resetting PostgreSQL target tables');
    await resetPostgres(pg);

    console.log('Migrating users');
    Object.assign(summary, await migrateUsers(db, pg));
    delete summary.userIdMap;

    console.log('Migrating categories');
    Object.assign(summary, await migrateCategories(db, pg));

    console.log('Migrating products');
    Object.assign(summary, await migrateProducts(db, pg));

    console.log('Migrating carts from cart and carts collections');
    Object.assign(summary, await migrateCarts(db, pg));

    console.log('Migrating orders');
    Object.assign(summary, await migrateOrders(db, pg));

    console.log('Migrating contacts');
    Object.assign(summary, await migrateContacts(db, pg));

    summary.blogs = 0;
    summary.subscriptions = 0;

    const postgresCounts = await getPostgresCounts(pg);

    console.log('\nMigration summary:');
    console.table(summary);

    console.log('\nPostgreSQL row counts:');
    console.table(postgresCounts);

    console.log('\nMigration completed successfully.');
  } finally {
    await pg.end();
    await mongo.close();
  }
}

main().catch((error) => {
  console.error('Migration failed:', {
    name: error.name,
    message: error.message
  });
  process.exit(1);
});
