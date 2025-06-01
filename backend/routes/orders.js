const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

// Middleware to authenticate token (optional for guest orders)
const authenticateTokenOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

// Create new order
router.post('/', authenticateTokenOptional, [
  body('customerEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('customerName').trim().isLength({ min: 1 }).withMessage('Customer name is required'),
  body('customerPhone').optional().isMobilePhone('vi-VN').withMessage('Invalid phone number'),
  body('shippingAddress').trim().isLength({ min: 1 }).withMessage('Shipping address is required'),
  body('shippingCity').trim().isLength({ min: 1 }).withMessage('Shipping city is required'),
  body('items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('paymentMethod').isIn(['momo', 'vnpay', 'cod']).withMessage('Invalid payment method'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      billingAddress,
      billingCity,
      billingPostalCode,
      items,
      paymentMethod,
      notes
    } = req.body;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const products = await db.query(
        'SELECT id, name, price, stockQuantity, sku FROM Products WHERE id = @productId AND isActive = 1',
        { productId: item.productId }
      );

      if (products.length === 0) {
        return res.status(400).json({ error: `Product with ID ${item.productId} not found` });
      }

      const product = products[0];

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product: ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Calculate fees and total
    const shippingFee = subtotal >= 500000 ? 0 : 30000; // Free shipping over 500k VND
    const tax = 0; // No tax for now
    const discount = 0; // No discount for now
    const total = subtotal + shippingFee + tax - discount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order
    const orderResult = await db.execute(`
      INSERT INTO Orders (
        orderNumber, userId, customerEmail, customerName, customerPhone,
        shippingAddress, shippingCity, shippingPostalCode,
        billingAddress, billingCity, billingPostalCode,
        subtotal, shippingFee, tax, discount, total,
        status, paymentMethod, paymentStatus, notes, createdAt, updatedAt
      )
      OUTPUT INSERTED.*
      VALUES (
        @orderNumber, @userId, @customerEmail, @customerName, @customerPhone,
        @shippingAddress, @shippingCity, @shippingPostalCode,
        @billingAddress, @billingCity, @billingPostalCode,
        @subtotal, @shippingFee, @tax, @discount, @total,
        'pending', @paymentMethod, 'pending', @notes, GETDATE(), GETDATE()
      )
    `, {
      orderNumber,
      userId: req.user ? req.user.userId : null,
      customerEmail,
      customerName,
      customerPhone: customerPhone || null,
      shippingAddress,
      shippingCity,
      shippingPostalCode: shippingPostalCode || null,
      billingAddress: billingAddress || shippingAddress,
      billingCity: billingCity || shippingCity,
      billingPostalCode: billingPostalCode || shippingPostalCode || null,
      subtotal,
      shippingFee,
      tax,
      discount,
      total,
      paymentMethod,
      notes: notes || null
    });

    const order = orderResult.recordset[0];

    // Add order items
    for (const item of orderItems) {
      await db.execute(`
        INSERT INTO OrderProducts (orderId, productId, quantity, price, productName, productSku)
        VALUES (@orderId, @productId, @quantity, @price, @productName, @productSku)
      `, {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productName,
        productSku: item.productSku
      });

      // Update product stock
      await db.execute(
        'UPDATE Products SET stockQuantity = stockQuantity - @quantity WHERE id = @productId',
        { quantity: item.quantity, productId: item.productId }
      );
    }

    // Clear user cart if logged in
    if (req.user) {
      await db.execute(
        'DELETE FROM CartItems WHERE userId = @userId',
        { userId: req.user.userId }
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by order number
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const orderQuery = `
      SELECT * FROM Orders WHERE orderNumber = @orderNumber
    `;

    const orders = await db.query(orderQuery, { orderNumber });

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        op.*,
        p.images,
        p.slug
      FROM OrderProducts op
      LEFT JOIN Products p ON op.productId = p.id
      WHERE op.orderId = @orderId
    `;

    const items = await db.query(itemsQuery, { orderId: order.id });

    // Parse images for each item
    const processedItems = items.map(item => ({
      ...item,
      images: item.images ? JSON.parse(item.images) : []
    }));

    res.json({
      ...order,
      items: processedItems
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (admin only - this should be in admin routes)
router.put('/:id/status', async (req, res) => {
  try {
    // This endpoint should have admin authentication
    // For now, we'll implement basic functionality
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.execute(
      'UPDATE Orders SET status = @status, updatedAt = GETDATE() WHERE id = @id',
      { status, id: parseInt(id) }
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully' });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
