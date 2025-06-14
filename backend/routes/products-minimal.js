// Minimal products router to test route ordering
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const iposService = require('../services/iposService');

console.log('🔧 MINIMAL Products router loading...');

// Root route
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Products API called');
    const products = await db.query('SELECT * FROM Products WHERE isActive = 1 LIMIT 5');
    res.json({ success: true, products: products || [] });
  } catch (error) {
    console.error('❌ Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// SPECIFIC ROUTES FIRST
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query('SELECT * FROM Categories WHERE isActive = 1');
    res.json({ success: true, categories: categories || [] });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Test routes
router.get('/test-simple', (req, res) => {
    console.log('🎯 MINIMAL: test-simple route hit!');
    res.json({ success: true, message: 'MINIMAL test-simple works!' });
});

router.get('/working-test', (req, res) => {
    console.log('🎯 MINIMAL: working-test route hit!');
    res.json({ success: true, message: 'MINIMAL working-test works!' });
});

// iPOS Payment endpoint
router.post('/payment/ipos/create-qr', authenticateToken, async (req, res) => {
    try {
        console.log('💳 MINIMAL iPOS Payment Request:', req.body);
        const { orderId, amount } = req.body;

        const orderQuery = `
            SELECT o.*, u.email, u.firstName, u.lastName 
            FROM Orders o 
            JOIN Users u ON o.userId = u.id 
            WHERE o.orderNumber = @orderId AND o.userId = @userId AND o.status = 'pending'
        `;        
        
        const orderResult = await db.execute(orderQuery, { orderId, userId: req.user.userId });
        const orders = orderResult.recordset || orderResult;
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const order = orders[0];
        const orderData = {
            orderNumber: orderId,
            total: amount,
            customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
            customerEmail: order.email || 'customer@example.com',
            customerPhone: order.customerPhone || order.phone || '',
            items: []
        };        

        const response = await iposService.createPaymentOrder(orderData);
        
        if (response.success) {
            res.json({
                success: true,
                qrCode: response.data.qr_code,
                paymentUrl: response.data.payment_url,
                requestId: `IPOS_${orderId}_${Date.now()}`,
                message: 'MINIMAL Payment QR generated successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create iPOS payment',
                error: response.message
            });
        }
    } catch (error) {
        console.error('❌ MINIMAL iPOS payment error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PARAMETERIZED ROUTE LAST
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🎯 MINIMAL: /:id route hit with id:', id);

    const product = await db.query('SELECT * FROM Products WHERE id = @id AND isActive = 1', { id });

    if (!product || product.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product: product[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

console.log('✅ MINIMAL Products router loaded');
module.exports = router;
