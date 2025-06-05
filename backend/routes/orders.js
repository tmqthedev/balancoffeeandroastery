const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const fetch = require('node-fetch');

// Middleware to authenticate token (required for getting orders)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

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

// GET all orders for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get orders for the authenticated user
    const orders = await db.query(`
      SELECT 
        o.id, o.orderNumber, o.customerEmail, o.customerName, o.customerPhone,
        o.shippingAddress, o.shippingCity, o.shippingPostalCode,
        o.subtotal, o.shippingFee, o.tax, o.discount, o.total,
        o.status, o.paymentMethod, o.paymentStatus, o.notes,
        o.createdAt, o.updatedAt
      FROM Orders o
      WHERE o.userId = @userId
      ORDER BY o.createdAt DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `, {
      userId: req.user.userId,
      offset,
      limit
    });

    // Get total count for pagination
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM Orders WHERE userId = @userId',
      { userId: req.user.userId }
    );

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      error: 'Không thể lấy danh sách đơn hàng',
      message: error.message 
    });
  }
});

// GET specific order by ID or orderNumber
router.get('/:identifier', authenticateTokenOptional, async (req, res) => {
  try {
    const { identifier } = req.params;
    const isOrderNumber = identifier.startsWith('ORD');

    let whereClause = isOrderNumber ? 'o.orderNumber = @identifier' : 'o.id = @identifier';
    let params = { identifier };

    // If user is authenticated, also check userId
    if (req.user) {
      whereClause += ' AND o.userId = @userId';
      params.userId = req.user.userId;
    }

    // Get order details
    const orderResult = await db.query(`
      SELECT 
        o.id, o.orderNumber, o.userId, o.customerEmail, o.customerName, o.customerPhone,
        o.shippingAddress, o.shippingCity, o.shippingPostalCode,
        o.billingAddress, o.billingCity, o.billingPostalCode,
        o.subtotal, o.shippingFee, o.tax, o.discount, o.total,
        o.status, o.paymentMethod, o.paymentStatus, o.notes,
        o.createdAt, o.updatedAt
      FROM Orders o
      WHERE ${whereClause}
    `, params);

    if (orderResult.length === 0) {
      return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
    }

    const order = orderResult[0];

    // Get order items
    const orderItems = await db.query(`
      SELECT 
        op.id, op.productId, op.quantity, op.price,
        op.productName, op.productSku,
        p.imageUrl, p.description, p.category
      FROM OrderProducts op
      LEFT JOIN Products p ON op.productId = p.id
      WHERE op.orderId = @orderId
    `, { orderId: order.id });

    res.json({
      ...order,
      items: orderItems
    });

  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ 
      error: 'Không thể lấy thông tin đơn hàng',
      message: error.message 
    });
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

// iPOS API Configuration
const IPOS_API_URL = process.env.IPOS_API_URL || 'https://api.ipos.vn';
const IPOS_API_KEY = process.env.IPOS_API_KEY;
const IPOS_MERCHANT_ID = process.env.IPOS_MERCHANT_ID;

// Create payment order with iPOS
router.post('/create-payment', authenticateTokenOptional, [
  body('items').isArray({ min: 1 }).withMessage('Order items are required'),
  body('items.*.product_id').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('total_price').isFloat({ min: 0 }).withMessage('Valid total price is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, total_price, customer_info } = req.body;
    const userId = req.user ? req.user.id : null;

    // Generate order data
    const orderNumber = generateOrderNumber();
    const orderData = {
      merchant_id: IPOS_MERCHANT_ID,
      order_id: orderNumber,
      amount: total_price,
      description: `Đơn hàng cà phê Balan Coffee - ${orderNumber}`,
      customer_name: customer_info.name,
      customer_email: customer_info.email,
      customer_phone: customer_info.phone,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      webhook_url: `${process.env.BACKEND_URL}/api/orders/ipos-webhook`
    };

    // Call iPOS API to create payment
    const iposResponse = await fetch(`${IPOS_API_URL}/v1/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${IPOS_API_KEY}`
      },
      body: JSON.stringify(orderData)
    });

    const iposResult = await iposResponse.json();

    if (!iposResponse.ok) {
      throw new Error(iposResult.message || 'iPOS API error');
    }

    // Save order to database
    const orderQuery = `
      INSERT INTO Orders (user_id, order_number, total_price, status, ipos_order_id, customer_email, customer_name, customer_phone, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, GETDATE(), GETDATE())
    `;

    const orderResult = await db.query(orderQuery, [
      userId,
      orderNumber,
      total_price,
      iposResult.order_id,
      customer_info.email,
      customer_info.name,
      customer_info.phone || null
    ]);

    const orderId = orderResult.recordset[0].id;

    // Save order items
    for (const item of items) {
      await db.query(
        'INSERT INTO Order_Products (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.json({
      success: true,
      order: {
        id: orderId,
        order_number: orderNumber,
        total_price: total_price
      },
      ipos_order_id: iposResult.order_id,
      qr_code_url: iposResult.qr_code_url || iposResult.payment_url,
      payment_url: iposResult.payment_url
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Không thể tạo đơn hàng thanh toán',
      error: error.message 
    });
  }
});

// Check payment status
router.get('/payment-status/:iposOrderId', async (req, res) => {
  try {
    const { iposOrderId } = req.params;

    // Check payment status from iPOS
    const iposResponse = await fetch(`${IPOS_API_URL}/v1/payments/${iposOrderId}/status`, {
      headers: {
        'Authorization': `Bearer ${IPOS_API_KEY}`
      }
    });

    const iposResult = await iposResponse.json();

    if (!iposResponse.ok) {
      throw new Error(iposResult.message || 'iPOS API error');
    }

    // Update order status in database if completed
    if (iposResult.status === 'completed') {
      await db.query(
        'UPDATE Orders SET status = ?, updated_at = GETDATE() WHERE ipos_order_id = ?',
        ['completed', iposOrderId]
      );
    }

    res.json({
      status: iposResult.status,
      payment_method: iposResult.payment_method,
      paid_at: iposResult.paid_at
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Không thể kiểm tra trạng thái thanh toán',
      error: error.message 
    });
  }
});

// iPOS Webhook endpoint
router.post('/ipos-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-ipos-signature'];

    // Verify webhook signature (implement according to iPOS documentation)
    // const isValid = verifyWebhookSignature(payload, signature, IPOS_WEBHOOK_SECRET);
    // if (!isValid) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    const data = JSON.parse(payload);
    
    if (data.event === 'payment.completed') {
      // Update order status
      await db.query(
        'UPDATE Orders SET status = ?, updated_at = GETDATE() WHERE ipos_order_id = ?',
        ['completed', data.order_id]
      );

      console.log(`Order ${data.order_id} payment completed via webhook`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('iPOS webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
