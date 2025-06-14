const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { execute } = require('../config/database');
const iposService = require('../services/iposService');
const router = express.Router();

console.log('💳 iPOS payment router loaded');

// iPOS Create QR Payment
router.post('/create-qr', authenticateToken, async (req, res) => {
    try {
        console.log('🎯 iPOS Payment Request:', { 
            body: req.body, 
            user: { userId: req.user.userId, email: req.user.email } 
        });
        
        const { orderId, amount, orderInfo } = req.body;

        // Validate order belongs to user
        const orderQuery = `
            SELECT o.*, u.email, u.firstName, u.lastName 
            FROM Orders o 
            JOIN Users u ON o.userId = u.id 
            WHERE o.orderNumber = @orderId AND o.userId = @userId AND o.status = 'pending'
        `;        
        
        console.log('🔍 Executing order query with params:', { orderId, userId: req.user.userId });
        const orderResult = await execute(orderQuery, { orderId, userId: req.user.userId });
        
        console.log('📊 Order query result:', { 
            hasRecordset: !!orderResult.recordset,
            recordsetLength: orderResult.recordset?.length || 0,
            directLength: orderResult.length || 0,
            result: orderResult 
        });

        // Handle both mock DB (recordset) and real DB (direct array) formats
        const orders = orderResult.recordset || orderResult;
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or already processed' });
        }

        // Extract order data from result
        const order = orders[0];
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order data not found' });
        }

        console.log('📝 Order data:', order);

        // Send request to iPOS API using service
        const orderData = {
            orderNumber: orderId,
            total: amount,
            customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Customer',
            customerEmail: order.email || order.customerEmail || 'customer@example.com',
            customerPhone: order.customerPhone || order.phone || '',
            items: [] // This would normally come from OrderProducts join
        };        

        console.log('📤 Sending to iPOS service:', orderData);
        const response = await iposService.createPaymentOrder(orderData);
        console.log('📥 iPOS service response:', response);
        
        const requestId = `IPOS_${orderId}_${Date.now()}`;

        if (response.success) {
            // In mock mode, just return success without updating database
            if (process.env.USE_MOCK_DB === 'true') {
                console.log('✅ Mock mode: Skipping database update');
                return res.json({
                    success: true,
                    qrCode: response.data.qr_code,
                    paymentUrl: response.data.payment_url,
                    requestId: requestId,
                    expiryTime: response.data.expiryTime || 900, // 15 minutes default
                    message: 'Payment QR generated successfully (Mock Mode)'
                });
            }

            // Update order with payment info (for real database)
            try {
                await execute(`
                    UPDATE Orders 
                    SET paymentMethod = 'ipos_momo_qr', 
                        iposOrderId = @paymentId,
                        qrCode = @qrCode,
                        paymentUrl = @paymentUrl,
                        expiresAt = @expiresAt,
                        updatedAt = GETDATE()
                    WHERE orderNumber = @orderId
                `, { 
                    paymentId: response.data.payment_id,
                    qrCode: response.data.qr_code,
                    paymentUrl: response.data.payment_url,
                    expiresAt: response.data.expires_at,
                    orderId 
                });

                res.json({
                    success: true,
                    qrCode: response.data.qr_code,
                    paymentUrl: response.data.payment_url,
                    requestId: requestId,
                    expiryTime: response.data.expiryTime
                });
            } catch (updateError) {
                console.error('❌ Database update error:', updateError);
                // Still return success since payment was created
                res.json({
                    success: true,
                    qrCode: response.data.qr_code,
                    paymentUrl: response.data.payment_url,
                    requestId: requestId,
                    expiryTime: response.data.expiryTime,
                    warning: 'Payment created but database update failed'
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create iPOS payment',
                error: response.message || 'Unknown error'
            });
        }
    } catch (error) {
        console.error('❌ iPOS payment creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

console.log('✅ iPOS payment router routes registered');

module.exports = router;
