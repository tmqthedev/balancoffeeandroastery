const express = require('express');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware/auth');
const { execute, query } = require('../config/database');
const router = express.Router();

console.log('✅ Payments router loaded successfully');

// SIMPLE TEST ROUTE
router.get('/simple-test', (req, res) => {
    console.log('🎯 Simple test route hit!');
    res.json({ message: 'Simple test works!' });
});

/**
 * @route GET /api/payments/methods
 * @desc Get available payment methods
 * @access Public
 */
router.get('/methods', (req, res) => {
    try {
        const paymentMethods = [
            {
                id: 'contact',
                name: 'Liên hệ trực tiếp để thanh toán',
                description: 'Chúng tôi sẽ hướng dẫn bạn thanh toán qua các phương thức an toàn',
                icon: '�',
                enabled: true,
                fee: 0
            },
            {
                id: 'cod',
                name: 'Thanh toán khi nhận hàng',
                description: 'Thanh toán bằng tiền mặt khi nhận hàng',
                icon: '�',
                enabled: true,
                fee: 0
            }
        ];

        res.json({
            success: true,
            data: paymentMethods,
            message: 'Payment methods retrieved successfully'
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment methods',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route POST /api/payments/create
 * @desc Create payment for an order
 * @access Private
 */
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { orderNumber, paymentMethod } = req.body;

        if (!orderNumber || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Order number and payment method are required'
            });
        }

        // Get order details (mock for development)
        const order = await db.getOrder(orderNumber);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to order'
            });
        }

        // Handle different payment methods
        if (paymentMethod === 'contact') {
            // Contact payment - just update status
            await db.updateOrderPaymentInfo(orderNumber, {
                paymentMethod: 'contact',
                paymentStatus: 'pending'
            });

            return res.json({
                success: true,
                data: {
                    paymentMethod: 'contact',
                    message: 'Order confirmed. We will contact you for payment instructions.'
                },
                message: 'Contact payment confirmed'
            });
        } else if (paymentMethod === 'cod') {
            // COD payment - just update status
            await db.updateOrderPaymentInfo(orderNumber, {
                paymentMethod: 'cod',
                paymentStatus: 'pending'
            });

            return res.json({
                success: true,
                data: {
                    paymentMethod: 'cod',
                    message: 'Order confirmed with cash on delivery'
                },
                message: 'COD payment confirmed'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported payment method'
            });
        }

    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route GET /api/payments/status/:orderNumber
 * @desc Check payment status for an order
 * @access Private
 */
router.get('/status/:orderNumber', authenticateToken, async (req, res) => {
    try {
        const { orderNumber } = req.params;

        // Get order details
        const order = await db.getOrder(orderNumber);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to order'
            });
        }

        res.json({
            success: true,
            data: {
                orderNumber: order.orderNumber,
                paymentMethod: order.paymentMethod,
                paymentStatus: order.paymentStatus,
                total: order.total,
                lastUpdated: order.updatedAt || order.createdAt
            },
            message: 'Payment status retrieved successfully'
        });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * @route POST /api/payments/verify
 * @desc Verify payment completion
 * @access Private
 */
router.post('/verify', authenticateToken, async (req, res) => {
    try {
        const { orderNumber, paymentMethod } = req.body;

        if (!orderNumber || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Order number and payment method are required'
            });
        }

        // Get order details
        const order = await db.getOrder(orderNumber);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user owns this order
        if (order.userId !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to order'
            });
        }

        // Verify payment based on method
        if (paymentMethod === 'contact') {
            // Contact payment verification (would be done by admin)
            return res.json({
                success: true,
                data: {
                    paymentStatus: order.paymentStatus,
                    message: 'Contact payment will be arranged by our team'
                },
                message: 'Contact payment confirmed'
            });
        } else if (paymentMethod === 'cod') {
            // COD verification (would be done by admin/delivery staff)
            return res.json({
                success: true,
                data: {
                    paymentStatus: order.paymentStatus,
                    message: 'COD payment will be collected on delivery'
                },
                message: 'COD payment confirmed'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method or missing payment data'
            });
        }

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Test development route
router.get('/test', (req, res) => {
    console.log('📊 Payments test route accessed');
    res.json({
        success: true,
        message: 'Payments service is working!',
        supportedMethods: ['contact', 'cod'],
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
