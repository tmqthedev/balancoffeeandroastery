const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const momoService = require('../services/momoService');
const database = require('../config/database');

/**
 * @route POST /api/payments/momo/create
 * @desc Create MoMo payment
 */
router.post('/create', [
    body('orderNumber').notEmpty().withMessage('Order number is required'),
    body('total').isNumeric().withMessage('Total amount must be a number'),
    body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
    body('customerInfo.phone').notEmpty().withMessage('Customer phone is required'),
    body('items').isArray().withMessage('Items must be an array')
], async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { orderNumber, total, customerInfo, items } = req.body;

        console.log('Creating MoMo payment for order:', orderNumber);

        // Verify order exists in database
        const order = await database.getOrder(orderNumber);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Create MoMo payment
        const paymentResult = await momoService.createPayment({
            orderNumber,
            total,
            customerInfo,
            items
        });

        if (paymentResult.success) {
            // Update order with payment info
            await database.updateOrderPaymentInfo(orderNumber, {
                paymentMethod: 'momo',
                paymentStatus: 'pending',
                paymentData: {
                    requestId: paymentResult.data.requestId,
                    signature: paymentResult.data.signature
                }
            });

            res.json({
                success: true,
                data: paymentResult.data,
                message: 'MoMo payment created successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: paymentResult.message,
                error: paymentResult.error
            });
        }

    } catch (error) {
        console.error('MoMo create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route POST /api/payments/momo/webhook
 * @desc MoMo payment webhook/IPN handler
 */
router.post('/webhook', async (req, res) => {
    try {
        console.log('MoMo webhook received:', req.body);

        // Verify signature
        const isValidSignature = momoService.verifySignature(req.body);
        if (!isValidSignature) {
            console.error('Invalid MoMo signature');
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        const { orderId, resultCode, transId, amount, message } = req.body;

        // Update order based on payment result
        if (resultCode === 0) {
            // Payment successful
            await database.updateOrderPaymentStatus(orderId, 'completed', {
                transactionId: transId,
                amount: amount,
                message: message,
                completedAt: new Date().toISOString()
            });

            console.log(`✅ MoMo payment successful for order ${orderId}, transaction: ${transId}`);
        } else {
            // Payment failed
            await database.updateOrderPaymentStatus(orderId, 'failed', {
                errorCode: resultCode,
                message: message,
                failedAt: new Date().toISOString()
            });

            console.log(`❌ MoMo payment failed for order ${orderId}, error: ${message}`);
        }

        // Respond to MoMo
        res.json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('MoMo webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
});

/**
 * @route GET /api/payments/momo/status/:requestId
 * @desc Check MoMo payment status
 */
router.get('/status/:requestId', async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: 'Request ID is required'
            });
        }

        const statusResult = await momoService.checkPaymentStatus(requestId);

        if (statusResult.success) {
            res.json({
                success: true,
                data: statusResult.data,
                message: 'Payment status retrieved successfully'
            });
        } else {
            res.status(400).json({
                success: false,
                message: statusResult.message,
                error: statusResult.error
            });
        }

    } catch (error) {
        console.error('MoMo status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route POST /api/payments/momo/return
 * @desc Handle MoMo return URL (user redirected back from MoMo)
 */
router.post('/return', async (req, res) => {
    try {
        console.log('MoMo return URL hit:', req.body);

        const { orderId, resultCode, message } = req.body;

        // Get order info
        const order = await database.getOrder(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Return payment result info
        res.json({
            success: true,
            data: {
                orderId: orderId,
                resultCode: resultCode,
                message: message,
                paymentStatus: resultCode === 0 ? 'success' : 'failed',
                order: {
                    orderNumber: order.orderNumber,
                    total: order.total,
                    status: order.status
                }
            }
        });

    } catch (error) {
        console.error('MoMo return URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process return URL',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
