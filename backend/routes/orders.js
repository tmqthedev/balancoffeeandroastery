const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { orderValidationRules } = require('../middleware/validation');
const db = require('../config/database');
const Order = require('../models/Order');
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
 * @route POST /api/orders/debug
 * @desc Debug order creation
 * @access Public
 */
router.post('/debug', async (req, res) => {
  try {
    console.log('=== DEBUG ORDER CREATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    console.log('Attempting to save order...');
    const savedOrder = await testOrder.save();
    console.log('Order saved successfully:', savedOrder._id);
    
    res.json({
      success: true,
      message: 'Debug order created successfully',
      orderId: savedOrder._id
    });
    
  } catch (error) {
    console.error('=== DEBUG ORDER ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', Object.keys(error.errors));
      for (const field in error.errors) {
        console.error(`${field}: ${error.errors[field].message}`);
      }
    }
    res.status(400).json({
      success: false,
      message: 'Debug order creation failed',
      error: error.message,
      details: error.errors
    });
  }
});

/**
 * @route POST /api/orders
 * @desc Create a new order
 * @access Public (with optional authentication)
 */
router.post('/', orderValidationRules, optionalAuth, async (req, res) => {
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

    const { customerInfo, shippingAddress, items, paymentMethod, subtotal, total, notes } = req.body;
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('PaymentMethod:', paymentMethod);

    // Generate order number
    const orderNumber = 'ORD' + Date.now() + Math.floor(Math.random() * 1000);

    // Calculate subtotal from items if not provided
    const calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Prepare order data to match Order schema
    const orderData = {
      orderNumber,
      customerId: req.user?.userId || 'guest',
      customerInfo: {
        email: customerInfo.email,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        phone: customerInfo.phone
      },
      // Shipping address
      shippingAddress: {
        street: shippingAddress.street,
        wardCommune: shippingAddress.wardCommune,
        district: shippingAddress.district || '',
        province: shippingAddress.province,
        postalCode: shippingAddress.postalCode || '',
        country: shippingAddress.country || 'Việt Nam'
      },
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName || item.name,
        productNameVi: item.productNameVi || item.name,
        sku: item.sku || '',
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal || (item.price * item.quantity),
        image: item.image || '',
        variant: item.variant || {}
      })),
      subtotal: calculatedSubtotal,
      total: total,
      payment: {
        method: paymentMethod || 'cod',
        status: 'pending'
      },
      notes: notes || '',
      status: 'pending'
    };

    console.log('Creating order:', orderNumber);
    console.log('Order data:', JSON.stringify(orderData, null, 2));

    // Create order in database using Mongoose
    const order = new Order(orderData);
    
    // Debug: validate before saving
    console.log('Validating order...');
    const validationError = order.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: 'Lỗi validation Mongoose',
        error: validationError.message,
        details: validationError.errors
      });
    }
    
    console.log('Mongoose validation passed, attempting to save to MongoDB...');
    await order.save();

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
          order.payment.method = 'momo';
          order.payment.status = 'pending';
          order.payment.gatewayResponse = momoResult.data;
          await order.save();

          console.log('✅ MoMo order created successfully:', orderNumber);

          // Send email notifications for MoMo orders
          try {
            // Prepare email data
            const emailOrderData = {
              orderNumber: order.orderNumber,
              createdAt: order.createdAt,
              total: order.total,
              totalAmount: order.total,
              paymentMethod: order.payment.method,
              items: order.items.map(item => ({
                productName: item.productName,
                name: item.productName,
                quantity: item.quantity,
                price: item.price
              })),
              customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim(),
              name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim(),
              customerEmail: order.customerInfo.email,
              email: order.customerInfo.email,
              customerPhone: order.customerInfo.phone,
              phone: order.customerInfo.phone,
              shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.wardCommune}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`.replace(/^,\s*|,\s*$/g, ''),
              notes: order.notes
            };

            // Send confirmation email to customer
            console.log('📧 Sending MoMo order confirmation email to customer...');
            const customerEmailResult = await emailService.sendOrderConfirmationEmail(
              order.customerInfo.email,
              emailOrderData,
              order.customerInfo.firstName
            );

            if (customerEmailResult.success) {
              console.log('✅ Customer MoMo confirmation email sent successfully');
            } else {
              console.error('❌ Failed to send customer MoMo confirmation email:', customerEmailResult.error);
            }

            // Send notification to admins
            console.log('📧 Sending MoMo order notification to admins...');
            const adminEmailResult = await emailService.sendNewOrderNotificationToAdmin(emailOrderData);

            if (adminEmailResult.success) {
              console.log(`✅ Admin MoMo notifications sent: ${adminEmailResult.totalSent}/${adminEmailResult.totalSent + adminEmailResult.totalFailed}`);
            } else {
              console.error('❌ Failed to send admin MoMo notifications:', adminEmailResult.error);
            }

          } catch (emailError) {
            // Don't fail the order creation if email fails
            console.error('❌ MoMo email notification error (order still created):', emailError);
          }

          return res.status(201).json({
            success: true,
            message: 'Đơn hàng đã được tạo thành công',
            order: {
              ...order.toObject(),
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
    console.log('✅ Order created successfully:', orderNumber);

    // Send email notifications
    try {
      // Prepare email data
      const emailOrderData = {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        total: order.total,
        totalAmount: order.total,
        paymentMethod: order.payment.method,
        items: order.items.map(item => ({
          productName: item.productName,
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim(),
        name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.trim(),
        customerEmail: order.customerInfo.email,
        email: order.customerInfo.email,
        customerPhone: order.customerInfo.phone,
        phone: order.customerInfo.phone,
        shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.wardCommune}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`.replace(/^,\s*|,\s*$/g, ''),
        notes: order.notes
      };

      // Send confirmation email to customer
      console.log('📧 Sending order confirmation email to customer...');
      const customerEmailResult = await emailService.sendOrderConfirmationEmail(
        order.customerInfo.email,
        emailOrderData,
        order.customerInfo.firstName
      );

      if (customerEmailResult.success) {
        console.log('✅ Customer confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send customer confirmation email:', customerEmailResult.error);
      }

      // Send notification to admins
      console.log('📧 Sending new order notification to admins...');
      const adminEmailResult = await emailService.sendNewOrderNotificationToAdmin(emailOrderData);

      if (adminEmailResult.success) {
        console.log(`✅ Admin notifications sent: ${adminEmailResult.totalSent}/${adminEmailResult.totalSent + adminEmailResult.totalFailed}`);
      } else {
        console.error('❌ Failed to send admin notifications:', adminEmailResult.error);
      }

    } catch (emailError) {
      // Don't fail the order creation if email fails
      console.error('❌ Email notification error (order still created):', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo thành công',
      order: order.toObject()
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
    const conditions = { customerId: userId };
    if (status) {
      conditions.status = status;
    }

    // Get orders from MongoDB using Mongoose
    const orders = await Order.find(conditions)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalOrders = await Order.countDocuments(conditions);

    console.log(`Found ${orders.length} orders for user ${userId}`);

    res.json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit)
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

    // Get order from MongoDB
    const order = await Order.findOne({ orderNumber }).exec();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order (or is admin)
    if (order.customerId !== userId && !req.user.isAdmin) {
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

    // Get order from MongoDB
    const order = await Order.findOne({ orderNumber }).exec();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order
    if (order.customerId !== userId && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền huỷ đơn hàng này'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Không thể huỷ đơn hàng này'
      });
    }

    // Update order status using Mongoose
    order.status = 'cancelled';
    order.cancellation = {
      reason: req.body.reason || 'Khách hàng yêu cầu huỷ',
      cancelledAt: new Date(),
      cancelledBy: userId
    };
    order.updateStatus('cancelled', req.body.reason || 'Khách hàng yêu cầu huỷ', userId);
    await order.save();

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

/**
 * @route GET /api/orders/test/mongodb
 * @desc Test MongoDB connection for orders
 * @access Public (for testing)
 */
router.get('/test/mongodb', async (req, res) => {
  try {
    // Test MongoDB connection
    const orderCount = await Order.countDocuments();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    
    res.json({
      success: true,
      message: 'MongoDB connection working',
      data: {
        totalOrders: orderCount,
        recentOrders: recentOrders.map(order => ({
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'MongoDB connection failed',
      error: error.message
    });
  }
});

module.exports = router;
