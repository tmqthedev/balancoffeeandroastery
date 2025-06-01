const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { authenticateToken } = require('../middleware/auth');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Momo Payment Configuration
const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/result',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payments/momo/callback'
};

// VN-Pay Configuration
const VNPAY_CONFIG = {
    tmnCode: process.env.VNPAY_TMN_CODE,
    secretKey: process.env.VNPAY_SECRET_KEY,
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/result',
    version: '2.1.0',
    currCode: 'VND',
    locale: 'vn'
};

// Create Momo Payment
router.post('/momo/create', authenticateToken, async (req, res) => {
    try {
        const { orderId, amount, orderInfo } = req.body;

        // Validate order belongs to user
        const orderQuery = `
            SELECT o.*, u.email, u.full_name 
            FROM Orders o 
            JOIN Users u ON o.user_id = u.user_id 
            WHERE o.order_id = @orderId AND o.user_id = @userId AND o.status = 'pending'
        `;
        const orderResult = await executeQuery(orderQuery, { orderId, userId: req.user.userId });

        if (orderResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or already processed' });
        }

        const order = orderResult[0];
        const requestId = orderId + new Date().getTime();
        const requestType = 'captureWallet';
        const extraData = '';

        // Create signature
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${MOMO_CONFIG.redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode: MOMO_CONFIG.partnerCode,
            accessKey: MOMO_CONFIG.accessKey,
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: MOMO_CONFIG.redirectUrl,
            ipnUrl: MOMO_CONFIG.ipnUrl,
            extraData: extraData,
            requestType: requestType,
            signature: signature,
            lang: 'en'
        };

        // Send request to Momo
        const response = await axios.post(MOMO_CONFIG.endpoint, requestBody);

        if (response.data.resultCode === 0) {
            // Update order with payment info
            await executeQuery(`
                UPDATE Orders 
                SET payment_method = 'momo', payment_reference = @requestId, updated_at = GETDATE()
                WHERE order_id = @orderId
            `, { requestId, orderId });

            res.json({
                success: true,
                payUrl: response.data.payUrl,
                requestId: requestId
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to create Momo payment',
                error: response.data.message
            });
        }
    } catch (error) {
        console.error('Momo payment creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Momo IPN Callback
router.post('/momo/callback', async (req, res) => {
    try {
        const {
            partnerCode, orderId, requestId, amount, orderInfo, orderType,
            transId, resultCode, message, payType, responseTime, extraData, signature
        } = req.body;

        // Verify signature
        const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
        const expectedSignature = crypto.createHmac('sha256', MOMO_CONFIG.secretKey).update(rawSignature).digest('hex');

        if (signature === expectedSignature) {
            if (resultCode === 0) {
                // Payment successful
                await executeQuery(`
                    UPDATE Orders 
                    SET status = 'paid', payment_status = 'completed', payment_reference = @transId, updated_at = GETDATE()
                    WHERE order_id = @orderId
                `, { transId, orderId });

                // Update product stock
                await executeQuery(`
                    UPDATE Products 
                    SET stock_quantity = stock_quantity - op.quantity
                    FROM Products p
                    JOIN Order_Products op ON p.product_id = op.product_id
                    WHERE op.order_id = @orderId
                `, { orderId });
            } else {
                // Payment failed
                await executeQuery(`
                    UPDATE Orders 
                    SET status = 'cancelled', payment_status = 'failed', updated_at = GETDATE()
                    WHERE order_id = @orderId
                `, { orderId });
            }
        }

        res.status(200).json({ RspCode: '00', Message: 'success' });
    } catch (error) {
        console.error('Momo callback error:', error);
        res.status(500).json({ RspCode: '99', Message: 'error' });
    }
});

// Create VN-Pay Payment
router.post('/vnpay/create', authenticateToken, async (req, res) => {
    try {
        const { orderId, amount, orderInfo, bankCode } = req.body;

        // Validate order belongs to user
        const orderQuery = `
            SELECT o.*, u.email, u.full_name 
            FROM Orders o 
            JOIN Users u ON o.user_id = u.user_id 
            WHERE o.order_id = @orderId AND o.user_id = @userId AND o.status = 'pending'
        `;
        const orderResult = await executeQuery(orderQuery, { orderId, userId: req.user.userId });

        if (orderResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found or already processed' });
        }

        const createDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z/, '');
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = VNPAY_CONFIG.version;
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = VNPAY_CONFIG.tmnCode;
        vnp_Params['vnp_Locale'] = VNPAY_CONFIG.locale;
        vnp_Params['vnp_CurrCode'] = VNPAY_CONFIG.currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VN-Pay requires amount in VND cents
        vnp_Params['vnp_ReturnUrl'] = VNPAY_CONFIG.returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sort parameters
        vnp_Params = sortObject(vnp_Params);

        // Create signature
        const signData = new URLSearchParams(vnp_Params).toString();
        const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
        vnp_Params['vnp_SecureHash'] = signed;

        // Create payment URL
        const paymentUrl = VNPAY_CONFIG.url + '?' + new URLSearchParams(vnp_Params).toString();

        // Update order with payment info
        await executeQuery(`
            UPDATE Orders 
            SET payment_method = 'vnpay', payment_reference = @orderId, updated_at = GETDATE()
            WHERE order_id = @orderId
        `, { orderId });

        res.json({
            success: true,
            payUrl: paymentUrl,
            orderId: orderId
        });
    } catch (error) {
        console.error('VN-Pay payment creation error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// VN-Pay Return/IPN Handler
router.get('/vnpay/return', async (req, res) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        // Verify signature
        const signData = new URLSearchParams(vnp_Params).toString();
        const hmac = crypto.createHmac('sha512', VNPAY_CONFIG.secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

        if (secureHash === signed) {
            const orderId = vnp_Params['vnp_TxnRef'];
            const responseCode = vnp_Params['vnp_ResponseCode'];

            if (responseCode === '00') {
                // Payment successful
                await executeQuery(`
                    UPDATE Orders 
                    SET status = 'paid', payment_status = 'completed', payment_reference = @transactionNo, updated_at = GETDATE()
                    WHERE order_id = @orderId
                `, { transactionNo: vnp_Params['vnp_TransactionNo'], orderId });

                // Update product stock
                await executeQuery(`
                    UPDATE Products 
                    SET stock_quantity = stock_quantity - op.quantity
                    FROM Products p
                    JOIN Order_Products op ON p.product_id = op.product_id
                    WHERE op.order_id = @orderId
                `, { orderId });

                res.json({ success: true, message: 'Payment successful', orderId });
            } else {
                // Payment failed
                await executeQuery(`
                    UPDATE Orders 
                    SET status = 'cancelled', payment_status = 'failed', updated_at = GETDATE()
                    WHERE order_id = @orderId
                `, { orderId });

                res.json({ success: false, message: 'Payment failed', orderId });
            }
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('VN-Pay return error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Get payment status
router.get('/status/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        const query = `
            SELECT order_id, status, payment_status, payment_method, payment_reference, total_amount
            FROM Orders 
            WHERE order_id = @orderId AND user_id = @userId
        `;
        const result = await executeQuery(query, { orderId, userId: req.user.userId });

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, order: result[0] });
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Helper function to sort object keys
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

module.exports = router;
