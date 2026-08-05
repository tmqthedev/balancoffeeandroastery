const { getPostgresPool, query } = require('../config/postgres');

function legacyId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function mapOrderItemRow(row) {
  return {
    _id: row.legacy_mongo_id || String(row.id),
    id: row.legacy_mongo_id || String(row.id),
    productId: row.product_legacy_mongo_id,
    productName: row.product_name,
    productNameVi: row.product_name_vi,
    sku: row.sku,
    price: toNumber(row.price),
    quantity: row.quantity || 0,
    subtotal: toNumber(row.subtotal),
    image: row.image,
    variant: row.variant || {}
  };
}

function mapOrderRow(row, items = []) {
  if (!row) return null;

  const payment = row.payment || {
    method: row.payment_method || 'cod',
    status: row.payment_status || 'pending'
  };

  return {
    _id: row.legacy_mongo_id,
    id: row.legacy_mongo_id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    userId: row.customer_id,
    customerInfo: row.customer_info || {
      email: row.customer_email,
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      fullName: row.customer_full_name,
      phone: row.customer_phone
    },
    items,
    subtotal: toNumber(row.subtotal),
    shippingFee: toNumber(row.shipping_fee),
    taxAmount: toNumber(row.tax_amount),
    discountAmount: toNumber(row.discount_amount),
    total: toNumber(row.total),
    billingAddress: row.billing_address || {},
    shippingAddress: row.shipping_address || {},
    payment,
    paymentMethod: payment.method || row.payment_method,
    paymentStatus: payment.status || row.payment_status,
    status: row.status,
    fulfillmentStatus: row.fulfillment_status,
    notes: row.notes,
    tags: row.tags || [],
    channel: row.channel,
    timeline: row.timeline || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getOrderItems(orderId) {
  const result = await query(`
    SELECT *
    FROM order_items
    WHERE order_id = $1
    ORDER BY id ASC
  `, [orderId]);

  return result.rows.map(mapOrderItemRow);
}

async function getOrderByNumber(orderNumber) {
  const result = await query(
    'SELECT * FROM orders WHERE order_number = $1 LIMIT 1',
    [orderNumber]
  );
  const row = result.rows[0];
  if (!row) return null;

  const items = await getOrderItems(row.id);
  return mapOrderRow(row, items);
}

async function createOrder(orderData) {
  const pool = await getPostgresPool();
  const client = await pool.connect();
  const now = new Date();

  try {
    await client.query('BEGIN');

    const customerInfo = orderData.customerInfo || {};
    const payment = orderData.payment || {};
    const orderResult = await client.query(`
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
      RETURNING *
    `, [
      legacyId('order'),
      orderData.orderNumber,
      orderData.customerId || 'guest',
      customerInfo,
      customerInfo.email || null,
      customerInfo.firstName || null,
      customerInfo.lastName || null,
      customerInfo.fullName || null,
      customerInfo.phone || null,
      toNumber(orderData.subtotal),
      toNumber(orderData.shippingFee),
      toNumber(orderData.taxAmount),
      toNumber(orderData.discountAmount),
      toNumber(orderData.total),
      orderData.billingAddress || {},
      orderData.shippingAddress || {},
      payment,
      payment.method || null,
      payment.status || null,
      orderData.status || 'pending',
      orderData.fulfillmentStatus || 'unfulfilled',
      orderData.notes || '',
      orderData.tags || [],
      orderData.channel || 'website',
      orderData.timeline || [],
      orderData.createdAt || now,
      orderData.updatedAt || now
    ]);

    const orderRow = orderResult.rows[0];
    const insertedItems = [];

    for (const item of orderData.items || []) {
      const itemResult = await client.query(`
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
        RETURNING *
      `, [
        legacyId('order_item'),
        orderRow.id,
        item.productId || null,
        item.productName || item.name || null,
        item.productNameVi || item.name || null,
        item.sku || '',
        toNumber(item.price),
        item.quantity || 0,
        toNumber(item.subtotal, toNumber(item.price) * (item.quantity || 0)),
        item.image || '',
        item.variant || {}
      ]);
      insertedItems.push(mapOrderItemRow(itemResult.rows[0]));
    }

    await client.query('COMMIT');
    return mapOrderRow(orderRow, insertedItems);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function listOrdersForCustomer(customerId, { page = 1, limit = 10, status } = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const actualLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
  const offset = (currentPage - 1) * actualLimit;
  const params = [customerId];
  const where = ['customer_id = $1'];

  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }

  const whereSql = where.join(' AND ');
  const countResult = await query(
    `SELECT COUNT(*)::int AS count FROM orders WHERE ${whereSql}`,
    params
  );

  const ordersResult = await query(`
    SELECT *
    FROM orders
    WHERE ${whereSql}
    ORDER BY created_at DESC NULLS LAST, id DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
  `, [...params, actualLimit, offset]);

  const orders = [];
  for (const orderRow of ordersResult.rows) {
    const items = await getOrderItems(orderRow.id);
    orders.push(mapOrderRow(orderRow, items));
  }

  const total = countResult.rows[0]?.count || 0;
  return {
    orders,
    pagination: {
      page: currentPage,
      limit: actualLimit,
      total,
      totalPages: Math.ceil(total / actualLimit)
    }
  };
}

async function cancelOrder(orderNumber, { reason, cancelledBy } = {}) {
  const event = [{
    type: 'cancelled',
    reason: reason || 'KhÃ¡ch hÃ ng yÃªu cáº§u huá»·',
    cancelledAt: new Date().toISOString(),
    cancelledBy
  }];

  const result = await query(`
    UPDATE orders
    SET status = 'cancelled',
        timeline = COALESCE(timeline, '[]'::jsonb) || $2::jsonb,
        updated_at = $3
    WHERE order_number = $1
    RETURNING *
  `, [orderNumber, JSON.stringify(event), new Date()]);

  if (!result.rows[0]) return null;
  const items = await getOrderItems(result.rows[0].id);
  return mapOrderRow(result.rows[0], items);
}

async function updatePayment(orderNumber, { method, status = 'pending' } = {}) {
  const existing = await getOrderByNumber(orderNumber);
  if (!existing) return null;

  const payment = {
    ...(existing.payment || {}),
    method,
    status
  };

  const result = await query(`
    UPDATE orders
    SET payment = $2,
        payment_method = $3,
        payment_status = $4,
        updated_at = $5
    WHERE order_number = $1
    RETURNING *
  `, [orderNumber, payment, method, status, new Date()]);

  const items = await getOrderItems(result.rows[0].id);
  return mapOrderRow(result.rows[0], items);
}

async function getPublicOrder(orderNumber) {
  const result = await query(`
    SELECT
      order_number,
      total,
      status,
      payment,
      payment_method,
      payment_status,
      created_at
    FROM orders
    WHERE order_number = $1
    LIMIT 1
  `, [orderNumber]);

  const row = result.rows[0];
  if (!row) return null;

  const payment = row.payment || {};
  return {
    orderNumber: row.order_number,
    total: toNumber(row.total),
    status: row.status,
    paymentStatus: payment.status || row.payment_status || 'pending',
    paymentMethod: payment.method || row.payment_method || 'cod',
    createdAt: row.created_at
  };
}

async function getRecentOrders(limit = 5) {
  const result = await query(`
    SELECT *
    FROM orders
    ORDER BY created_at DESC NULLS LAST, id DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map((row) => mapOrderRow(row));
}

async function countOrders() {
  const result = await query('SELECT COUNT(*)::int AS count FROM orders');
  return result.rows[0]?.count || 0;
}

module.exports = {
  createOrder,
  listOrdersForCustomer,
  getOrderByNumber,
  cancelOrder,
  updatePayment,
  getPublicOrder,
  getRecentOrders,
  countOrders
};
