const { query } = require('../config/postgres');
const postgresCatalog = require('./postgresCatalogRepository');

function legacyId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function sameVariant(left = {}, right = {}) {
  return JSON.stringify(left || {}) === JSON.stringify(right || {});
}

function selectedWeightToNumber(selectedWeight) {
  if (!selectedWeight || typeof selectedWeight !== 'string') return null;
  return selectedWeight.includes('kg')
    ? parseFloat(selectedWeight.replace('kg', '')) * 1000
    : parseInt(selectedWeight.replace('g', ''), 10);
}

function calculateProductPrice(product, variant = {}) {
  if (product.pricingType === 'weight-based') {
    const selectedWeight = variant.weight;
    if (!selectedWeight) {
      const error = new Error('Weight selection is required for this product');
      error.statusCode = 400;
      throw error;
    }

    const weightValue = selectedWeightToNumber(selectedWeight);
    const weightOption = (product.weightPricing || []).find((option) => (
      option.weight === weightValue && option.isAvailable
    ));

    if (!weightOption) {
      const error = new Error('Selected weight option is not available');
      error.statusCode = 400;
      throw error;
    }

    return Number(weightOption.price || 0);
  }

  return Number(product.price || 0);
}

async function findCartForCustomer(customerId) {
  const result = await query(`
    SELECT *
    FROM carts
    WHERE customer_id = $1
    ORDER BY
      CASE WHEN source_collection = 'cart' THEN 0 ELSE 1 END,
      updated_at DESC NULLS LAST,
      id DESC
    LIMIT 1
  `, [customerId]);

  return result.rows[0] || null;
}

async function createCart(customerId) {
  const now = new Date();
  const result = await query(`
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
    VALUES ($1, 'cart', $2, 0, 0, '{}'::jsonb, $3, $3, $3)
    RETURNING *
  `, [
    legacyId('cart'),
    customerId,
    now
  ]);

  return result.rows[0];
}

async function getOrCreateCartRow(customerId) {
  return await findCartForCustomer(customerId) || await createCart(customerId);
}

async function getCartItemRows(cartId) {
  const result = await query(`
    SELECT
      ci.*,
      p.name AS product_name,
      p.description AS product_description,
      p.image_url AS product_image_url
    FROM cart_items ci
    LEFT JOIN products p ON p.legacy_mongo_id = ci.product_legacy_mongo_id
    WHERE ci.cart_id = $1
    ORDER BY ci.id ASC
  `, [cartId]);

  return result.rows;
}

function mapCart(cart, itemRows = []) {
  return {
    _id: cart.legacy_mongo_id,
    id: cart.legacy_mongo_id,
    customerId: cart.customer_id,
    items: itemRows.map((item) => ({
      _id: item.legacy_mongo_id || String(item.id),
      productId: item.product_legacy_mongo_id,
      product_id: item.product_legacy_mongo_id,
      name: item.product_name || 'Sáº£n pháº©m khÃ´ng tá»“n táº¡i',
      price: Number(item.price || 0),
      quantity: item.quantity || 0,
      image_url: item.product_image_url || '',
      description: item.product_description || '',
      variant: item.variant || {},
      addedAt: item.added_at,
      updatedAt: item.updated_at
    })),
    itemCount: cart.item_count || 0,
    subtotal: Number(cart.subtotal || 0),
    checkout: cart.checkout || {},
    lastActivity: cart.last_activity,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at
  };
}

async function recalculateCart(cartId) {
  await query(`
    UPDATE carts
    SET item_count = COALESCE((
          SELECT SUM(quantity)::int
          FROM cart_items
          WHERE cart_id = $1
        ), 0),
        subtotal = COALESCE((
          SELECT SUM(price * quantity)
          FROM cart_items
          WHERE cart_id = $1
        ), 0),
        last_activity = $2,
        updated_at = $2
    WHERE id = $1
  `, [cartId, new Date()]);
}

async function getCart(customerId) {
  const cart = await getOrCreateCartRow(customerId);
  const items = await getCartItemRows(cart.id);
  return mapCart(cart, items);
}

async function addItem(customerId, { productId, quantity = 1, variant = {} }) {
  const product = await postgresCatalog.getProductByLegacyId(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const productPrice = calculateProductPrice(product, variant);
  if (!Number.isFinite(productPrice) || productPrice < 0) {
    const error = new Error('Product price is not valid');
    error.statusCode = 500;
    throw error;
  }

  const cart = await getOrCreateCartRow(customerId);
  const items = await getCartItemRows(cart.id);
  const existingItem = items.find((item) => (
    item.product_legacy_mongo_id === productId && sameVariant(item.variant, variant)
  ));

  if (existingItem) {
    await query(`
      UPDATE cart_items
      SET quantity = quantity + $2,
          price = $3,
          updated_at = $4
      WHERE id = $1
    `, [existingItem.id, quantity, productPrice, new Date()]);
  } else {
    await query(`
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
    `, [
      legacyId('cart_item'),
      cart.id,
      productId,
      quantity,
      productPrice,
      variant || {},
      new Date()
    ]);
  }

  await recalculateCart(cart.id);
  return getCart(customerId);
}

async function updateItem(customerId, { productId, quantity, variant = {} }) {
  const cart = await findCartForCustomer(customerId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const items = await getCartItemRows(cart.id);
  const item = items.find((row) => (
    row.product_legacy_mongo_id === productId && sameVariant(row.variant, variant)
  ));

  if (!item) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  if (quantity === 0) {
    await query('DELETE FROM cart_items WHERE id = $1', [item.id]);
  } else {
    await query(`
      UPDATE cart_items
      SET quantity = $2,
          updated_at = $3
      WHERE id = $1
    `, [item.id, quantity, new Date()]);
  }

  await recalculateCart(cart.id);
  return getCart(customerId);
}

async function removeItem(customerId, { productId, variant = {} }) {
  const cart = await findCartForCustomer(customerId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  const items = await getCartItemRows(cart.id);
  const item = items.find((row) => (
    row.product_legacy_mongo_id === productId && sameVariant(row.variant, variant)
  ));

  if (!item) {
    const error = new Error('Item not found in cart');
    error.statusCode = 404;
    throw error;
  }

  await query('DELETE FROM cart_items WHERE id = $1', [item.id]);
  await recalculateCart(cart.id);
  return getCart(customerId);
}

async function clearCart(customerId) {
  const cart = await findCartForCustomer(customerId);
  if (!cart) {
    const error = new Error('Cart not found');
    error.statusCode = 404;
    throw error;
  }

  await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  await recalculateCart(cart.id);
  return getCart(customerId);
}

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
