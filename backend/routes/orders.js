const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const momoService = require('../services/momoService');
const emailService = require('../services/emailService');

// Middleware to authenticate token (required for getting orders)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Optional authentication middleware (for optional token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

/**
 * @route POST /api/orders
 * @desc Create a new order
 * @access Public (with optional authentication)
 */
router.post('/', [
  body('customerInfo.name').trim().isLength({ min: 2 }).withMessage('Tên khách hàng phải có ít nhất 2 ký tự'),
  body('customerInfo.phone').trim().isLength({ min: 10 }).withMessage('Số điện thoại không hợp lệ'),
  body('customerInfo.email').isEmail().withMessage('Email không hợp lệ'),
  body('customerInfo.address').trim().isLength({ min: 10 }).withMessage('Địa chỉ phải có ít nhất 10 ký tự'),
  body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm'),
  body('paymentMethod').isIn(['cod', 'momo']).withMessage('Phương thức thanh toán không hợp lệ'),
  body('total').isNumeric({ min: 1 }).withMessage('Tổng tiền không hợp lệ')
], optionalAuth, async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu đầu vào không hợp lệ',
        errors: errors.array()
      });
    }

    const { customerInfo, items, paymentMethod, total, notes } = req.body;

    // Generate order number
    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

    // Prepare order data
    const orderData = {
      orderNumber,
      customerInfo,
      items,
      total,
      paymentMethod,
      notes: notes || '',
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'waiting',
      createdAt: new Date().toISOString(),
      userId: req.user?.userId || null
    };

    console.log('Creating order:', orderNumber);

    // Create order in database
    const order = await db.createOrder(orderData);

    // Handle MoMo payment
    if (paymentMethod === 'momo') {
      try {
        const momoResult = await momoService.createPayment({
          orderNumber,
          total,
          customerInfo,
          items
        });

        if (momoResult.success) {
          // Update order with MoMo payment info
          await db.updateOrderPaymentInfo(orderNumber, {
            paymentMethod: 'momo',
            paymentStatus: 'pending',
            momoData: momoResult.data
          });

          return res.status(201).json({
            success: true,
            message: 'Đơn hàng đã được tạo thành công',
            order: {
              ...order,
              momoData: momoResult.data
            }
          });
        } else {
          // MoMo failed, but order is created - can switch to COD
          console.error('MoMo payment creation failed:', momoResult.error);
          return res.status(400).json({
            success: false,
            message: 'Không thể tạo thanh toán MoMo. Vui lòng chọn thanh toán khi nhận hàng.',
            error: momoResult.error,
            order: order
          });
        }
      } catch (momoError) {
        console.error('MoMo service error:', momoError);
        return res.status(400).json({
          success: false,
          message: 'Lỗi kết nối MoMo. Vui lòng chọn thanh toán khi nhận hàng.',
          error: momoError.message,
          order: order
        });
      }
    }

    // COD payment - order is ready
    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      order: order
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi tạo đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/orders
 * @desc Get orders for authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;

    console.log(`Getting orders for user ${userId}`);

    // Build query conditions
    const conditions = { userId };
    if (status) {
      conditions.status = status;
    }

    // Get orders from database
    const orders = await db.query('orders', conditions);

    // Sort by creation date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: orders.length,
          totalPages: Math.ceil(orders.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/orders/:orderNumber
 * @desc Get specific order details
 * @access Private
 */
router.get('/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user.userId;

    console.log(`Getting order ${orderNumber} for user ${userId}`);

    // Get order from database
    const order = await db.getOrder(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order (or is admin)
    if (order.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập đơn hàng này'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route PUT /api/orders/:orderNumber/cancel
 * @desc Cancel an order
 * @access Private
 */
router.put('/:orderNumber/cancel', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const userId = req.user.userId;

    console.log(`Cancelling order ${orderNumber} for user ${userId}`);

    // Get order from database
    const order = await db.getOrder(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order
    if (order.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền huỷ đơn hàng này'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Không thể huỷ đơn hàng này'
      });
    }

    // Update order status
    await db.updateOrderPaymentStatus(orderNumber, 'cancelled', {
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId
    });

    res.json({
      success: true,
      message: 'Đơn hàng đã được huỷ thành công'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể huỷ đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route GET /api/orders/public/:orderNumber
 * @desc Get order details by order number (public access for payment verification)
 * @access Public
 */
router.get('/public/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    console.log(`Getting public order details for ${orderNumber}`);

    // Get order from database
    const order = await db.getOrder(orderNumber);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Return limited info for public access
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Get public order error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin đơn hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
