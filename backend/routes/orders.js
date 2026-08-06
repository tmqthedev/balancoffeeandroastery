const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { orderValidationRules } = require('../middleware/validation');
const { authenticateToken, optionalAuth } = require('../middleware/auth'); // Use centralized auth middleware
const emailService = require('../services/emailService');
const postgresOrders = require('../repositories/postgresOrdersRepository');
const {
  getCollection,
  toObjectId,
  createDocument,
  updateDocument,
  paginateQuery,
  buildSort,
  handleDatabaseError,
  validateRequired,
  cleanData
} = require('../middleware/mongoHelpers');

function buildEmailOrderData(order) {
  const customerName = order.customerInfo.fullName || `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim();
  return {
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    total: order.total,
    totalAmount: order.total,
    paymentMethod: order.payment?.method,
    items: (order.items || []).map(item => ({
      productName: item.productName,
      name: item.productName,
      quantity: item.quantity,
      price: item.price
    })),
    customerName,
    name: customerName,
    customerEmail: order.customerInfo.email,
    email: order.customerInfo.email,
    customerPhone: order.customerInfo.phone,
    phone: order.customerInfo.phone,
    shippingAddress: `${order.shippingAddress.street || ''}, ${order.shippingAddress.wardCommune || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.province || ''}`.replace(/^,\s*|,\s*$/g, ''),
    notes: order.notes
  };
}

async function sendOrderEmails(order, contextLabel = 'order') {
  try {
    const emailOrderData = buildEmailOrderData(order);

    const customerEmailResult = await emailService.sendOrderConfirmationEmail(
      order.customerInfo.email,
      emailOrderData,
      order.customerInfo.fullName || order.customerInfo.firstName
    );

    if (customerEmailResult.success) {
      console.log(`âœ… Customer ${contextLabel} confirmation email sent successfully`);
    } else {
      console.error(`âŒ Failed to send customer ${contextLabel} confirmation email:`, customerEmailResult.error);
    }

    const adminEmailResult = await emailService.sendNewOrderNotificationToAdmin(emailOrderData);

    if (adminEmailResult.success) {
      console.log(`âœ… Admin ${contextLabel} notifications sent: ${adminEmailResult.totalSent}/${adminEmailResult.totalSent + adminEmailResult.totalFailed}`);
    } else {
      console.error(`âŒ Failed to send admin ${contextLabel} notifications:`, adminEmailResult.error);
    }
  } catch (emailError) {
    console.error(`âŒ ${contextLabel} email notification error (order still created):`, emailError);
  }
}

console.log('🛍️ Backend: Orders router loading');

/**
 * @route POST /api/orders/debug
 * @desc Debug order creation
 * @access Public
 */
router.post('/debug', async (req, res) => {
  try {
    console.log('🛍️ === DEBUG ORDER CREATION ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Create test order data
    const testOrderData = {
      orderNumber: `TEST-${Date.now()}`,
      customerInfo: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        phone: '0123456789'
      },
      shippingAddress: {
        street: 'Test Street',
        wardCommune: 'Test Ward',
        district: 'Test District',
        province: 'Test Province',
        country: 'Việt Nam'
      },
      items: [{
        productId: 'test-product',
        productName: 'Test Coffee',
        price: 100000,
        quantity: 1,
        subtotal: 100000
      }],
      subtotal: 100000,
      total: 100000,
      payment: {
        method: 'cod',
        status: 'pending'
      },
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('🛍️ Attempting to save order...');
    const result = await ordersCollection.insertOne(testOrderData);
    console.log('✅ Order saved successfully:', result.insertedId);
    
    res.json({
      success: true,
      message: 'Debug order created successfully',
      orderId: result.insertedId.toString(),
      orderNumber: testOrderData.orderNumber
    });
    
  } catch (error) {
    console.error('❌ === DEBUG ORDER ERROR ===');
    console.error('Error details:', error);
    return handleDatabaseError(error, res, 'Debug order creation');
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
    console.log('Creating order for customer:', customerInfo.email);

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
        fullName: customerInfo.fullName, // Add fullName support
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

    if (req.databaseProvider === 'postgres') {
      if (paymentMethod === 'contact') {
        orderData.payment.method = 'contact';
        orderData.payment.status = 'pending';
      } else if (paymentMethod === 'cod') {
        orderData.payment.method = 'cod';
        orderData.payment.status = 'pending';
      }

      const order = await postgresOrders.createOrder({
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await sendOrderEmails(order, paymentMethod === 'contact' ? 'contact payment order' : 'order');

      return res.status(201).json({
        success: true,
        message: paymentMethod === 'contact'
          ? 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng. ChÃºng tÃ´i sáº½ liÃªn há»‡ vá»›i báº¡n Ä‘á»ƒ hÆ°á»›ng dáº«n thanh toÃ¡n.'
          : 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c táº¡o thÃ nh cÃ´ng',
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          payment: order.payment,
          createdAt: order.createdAt
        }
      });
    }

    console.log('🛍️ Creating order:', orderNumber);

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Handle different payment methods
    if (paymentMethod === 'contact') {
      // For contact payment, set status to pending and send notification
      orderData.payment.method = 'contact';
      orderData.payment.status = 'pending';
    } else if (paymentMethod === 'cod') {
      orderData.payment.method = 'cod';
      orderData.payment.status = 'pending';
    }

    // Create order document with timestamps
    const orderDoc = createDocument(orderData);
    
    // Insert order into MongoDB
    const result = await ordersCollection.insertOne(orderDoc);
    const order = { ...orderDoc, _id: result.insertedId };

    console.log('✅ Order created successfully:', orderNumber);

    // Send email notifications based on payment method
    if (paymentMethod === 'contact') {
      // Send email notifications for contact orders
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
          customerName: order.customerInfo.fullName || `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim(),
          name: order.customerInfo.fullName || `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim(),
          customerEmail: order.customerInfo.email,
          email: order.customerInfo.email,
          customerPhone: order.customerInfo.phone,
          phone: order.customerInfo.phone,
          shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.wardCommune}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`.replace(/^,\s*|,\s*$/g, ''),
          notes: order.notes
        };

        // Send confirmation email to customer
        console.log('📧 Sending contact payment order confirmation email to customer...');
        const customerEmailResult = await emailService.sendOrderConfirmationEmail(
          order.customerInfo.email,
          emailOrderData,
          order.customerInfo.fullName || order.customerInfo.firstName
        );

        if (customerEmailResult.success) {
          console.log('✅ Customer contact confirmation email sent successfully');
        } else {
          console.error('❌ Failed to send customer contact confirmation email:', customerEmailResult.error);
        }

        // Send notification to admins
        console.log('📧 Sending contact payment order notification to admins...');
        const adminEmailResult = await emailService.sendNewOrderNotificationToAdmin(emailOrderData);

        if (adminEmailResult.success) {
          console.log(`✅ Admin contact notifications sent: ${adminEmailResult.totalSent}/${adminEmailResult.totalSent + adminEmailResult.totalFailed}`);
        } else {
          console.error('❌ Failed to send admin contact notifications:', adminEmailResult.error);
        }

      } catch (emailError) {
        // Don't fail the order creation if email fails
        console.error('❌ Contact email notification error (order still created):', emailError);
      }

      return res.status(201).json({
        success: true,
        message: 'Đơn hàng đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn để hướng dẫn thanh toán.',
        order: {
          _id: order._id.toString(),
          orderNumber: order.orderNumber,
          total: order.total,
          status: order.status,
          payment: order.payment,
          createdAt: order.createdAt
        }
      });
    }

    // COD payment or other payment methods - continue with email notifications
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
        customerName: order.customerInfo.fullName || `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim(),
        name: order.customerInfo.fullName || `${order.customerInfo.firstName || ''} ${order.customerInfo.lastName || ''}`.trim(),
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
        order.customerInfo.fullName || order.customerInfo.firstName
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
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        payment: order.payment,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Order creation error:', error);
    return handleDatabaseError(error, res, 'Create order');
  }
});

/**
 * @route GET /api/orders
 * @desc Get orders for authenticated user
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🛍️ Getting orders');
    
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;

    if (req.databaseProvider === 'postgres') {
      const result = await postgresOrders.listOrdersForCustomer(userId, { page, limit, status });
      return res.json({
        success: true,
        data: {
          orders: result.orders,
          pagination: result.pagination
        }
      });
    }

    console.log(`📋 Getting orders for user ${userId}`);

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Build query conditions
    const conditions = { customerId: userId };
    if (status) {
      conditions.status = status;
    }

    // Calculate pagination
    const { skip, limit: actualLimit } = paginateQuery(page, limit);

    // Get orders from MongoDB
    const orders = await ordersCollection
      .find(conditions)
      .sort({ createdAt: -1 }) // Newest first
      .limit(actualLimit)
      .skip(skip)
      .toArray();

    // Get total count for pagination
    const totalOrders = await ordersCollection.countDocuments(conditions);

    // Add id field for frontend compatibility
    const ordersWithId = orders.map(order => ({
      ...order,
      id: order._id.toString()
    }));

    console.log(`📋 Found ${orders.length} orders for user ${userId}`);

    res.json({
      success: true,
      data: {
        orders: ordersWithId,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / actualLimit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get orders error:', error);
    return handleDatabaseError(error, res, 'Get orders');
  }
});

/**
 * @route GET /api/orders/:orderNumber
 * @desc Get specific order details
 * @access Private
 */
router.get('/:orderNumber', authenticateToken, async (req, res) => {
  try {
    console.log('🛍️ Getting order by number');
    
    const { orderNumber } = req.params;
    const userId = req.user.userId;

    if (req.databaseProvider === 'postgres') {
      const order = await postgresOrders.getOrderByNumber(orderNumber);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng'
        });
      }

      if (order.customerId !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'KhÃ´ng cÃ³ quyá»n truy cáº­p Ä‘Æ¡n hÃ ng nÃ y'
        });
      }

      return res.json({
        success: true,
        data: order
      });
    }

    console.log(`📋 Getting order ${orderNumber} for user ${userId}`);

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Get order from MongoDB
    const order = await ordersCollection.findOne({ orderNumber });

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

    // Add id field for frontend compatibility
    const orderWithId = { ...order, id: order._id.toString() };

    res.json({
      success: true,
      data: orderWithId
    });

  } catch (error) {
    console.error('❌ Get order error:', error);
    return handleDatabaseError(error, res, 'Get order by number');
  }
});

/**
 * @route PUT /api/orders/:orderNumber/cancel
 * @desc Cancel an order
 * @access Private
 */
router.put('/:orderNumber/cancel', authenticateToken, async (req, res) => {
  try {
    console.log('🛍️ Cancelling order');
    
    const { orderNumber } = req.params;
    const userId = req.user.userId;

    if (req.databaseProvider === 'postgres') {
      const order = await postgresOrders.getOrderByNumber(orderNumber);

      if (!order) {
        console.log('❌ Order not found:', orderNumber);
        return res.status(404).json({
          success: false,
          message: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng'
        });
      }

      if (order.customerId !== userId && !req.user.isAdmin) {
        console.log('❌ User not authorized to cancel order:', userId);
        return res.status(403).json({
          success: false,
          message: 'KhÃ´ng cÃ³ quyá»n huá»· Ä‘Æ¡n hÃ ng nÃ y'
        });
      }

      if (order.status === 'delivered' || order.status === 'cancelled') {
        console.log('❌ Order cannot be cancelled, status:', order.status);
        return res.status(400).json({
          success: false,
          message: 'KhÃ´ng thá»ƒ huá»· Ä‘Æ¡n hÃ ng nÃ y'
        });
      }

      await postgresOrders.cancelOrder(orderNumber, {
        reason: req.body.reason || 'KhÃ¡ch hÃ ng yÃªu cáº§u huá»·',
        cancelledBy: userId
      });

      console.log('✅ Order cancelled successfully:', orderNumber);
      return res.json({
        success: true,
        message: 'ÄÆ¡n hÃ ng Ä‘Ã£ Ä‘Æ°á»£c huá»· thÃ nh cÃ´ng'
      });
    }

    console.log(`❌ Cancelling order ${orderNumber} for user ${userId}`);

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Get order from MongoDB
    const order = await ordersCollection.findOne({ orderNumber });

    if (!order) {
      console.log('❌ Order not found:', orderNumber);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Check if user owns this order
    if (order.customerId !== userId && !req.user.isAdmin) {
      console.log('❌ User not authorized to cancel order:', userId);
      return res.status(403).json({
        success: false,
        message: 'Không có quyền huỷ đơn hàng này'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'delivered' || order.status === 'cancelled') {
      console.log('❌ Order cannot be cancelled, status:', order.status);
      return res.status(400).json({
        success: false,
        message: 'Không thể huỷ đơn hàng này'
      });
    }

    // Update order status
    const updateData = {
      status: 'cancelled',
      cancellation: {
        reason: req.body.reason || 'Khách hàng yêu cầu huỷ',
        cancelledAt: new Date(),
        cancelledBy: userId
      },
      updatedAt: new Date()
    };

    const result = await ordersCollection.updateOne(
      { orderNumber },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      console.log('❌ Failed to update order:', orderNumber);
      return res.status(404).json({
        success: false,
        message: 'Không thể cập nhật đơn hàng'
      });
    }

    console.log('✅ Order cancelled successfully:', orderNumber);
    res.json({
      success: true,
      message: 'Đơn hàng đã được huỷ thành công'
    });

  } catch (error) {
    console.error('❌ Cancel order error:', error);
    return handleDatabaseError(error, res, 'Cancel order');
  }
});

/**
 * @route GET /api/orders/public/:orderNumber
 * @desc Get order details by order number (public access for payment verification)
 * @access Public
 */
router.get('/public/:orderNumber', async (req, res) => {
  try {
    console.log('🛍️ Getting public order');
    
    const { orderNumber } = req.params;

    if (req.databaseProvider === 'postgres') {
      const order = await postgresOrders.getPublicOrder(orderNumber);

      if (!order) {
        console.log('❌ Public order not found:', orderNumber);
        return res.status(404).json({
          success: false,
          message: 'KhÃ´ng tÃ¬m tháº¥y Ä‘Æ¡n hÃ ng'
        });
      }

      console.log('✅ Public order retrieved successfully:', orderNumber);
      return res.json({
        success: true,
        data: order
      });
    }

    console.log(`🔍 Getting public order details for ${orderNumber}`);

    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Get order from MongoDB
    const order = await ordersCollection.findOne(
      { orderNumber },
      { 
        projection: {
          orderNumber: 1,
          total: 1,
          status: 1,
          'payment.status': 1,
          'payment.method': 1,
          createdAt: 1
        }
      }
    );

    if (!order) {
      console.log('❌ Public order not found:', orderNumber);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    console.log('✅ Public order retrieved successfully:', orderNumber);

    // Return limited info for public access
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentStatus: order.payment?.status || 'pending',
        paymentMethod: order.payment?.method || 'cod',
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Get public order error:', error);
    return handleDatabaseError(error, res, 'Get public order');
  }
});

/**
 * @route GET /api/orders/test/mongodb
 * @desc Test MongoDB connection for orders
 * @access Public (for testing)
 */
router.get('/test/mongodb', async (req, res) => {
  try {
    console.log('🛍️ Testing MongoDB connection');
    
    // Get orders collection
    const ordersCollection = getCollection(req, 'orders');

    // Test MongoDB connection
    const orderCount = await ordersCollection.countDocuments();
    const recentOrders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    console.log('✅ MongoDB connection test successful');
    
    res.json({
      success: true,
      message: 'MongoDB connection working',
      data: {
        totalOrders: orderCount,
        recentOrders: recentOrders.map(order => ({
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    return handleDatabaseError(error, res, 'Test MongoDB connection');
  }
});

module.exports = router;
