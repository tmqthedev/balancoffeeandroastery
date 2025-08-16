const crypto = require('crypto');

/**
 * MoMo Payment Service for Balan Coffee
 * Handles MoMo QR payment integration
 */
class MoMoService {
    constructor() {
        this.partnerCode = process.env.MOMO_PARTNER_CODE;
        this.accessKey = process.env.MOMO_ACCESS_KEY;
        this.secretKey = process.env.MOMO_SECRET_KEY;
        this.endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
        this.isDevelopment = process.env.NODE_ENV === 'development';
        
        if (!this.partnerCode || !this.accessKey || !this.secretKey) {
            console.warn('MoMo credentials not configured. Using development mode.');
            if (this.isDevelopment) {
                console.log('💡 Development mode: MoMo will return mock responses');
            }
        }

        if (this.isDevelopment) {
            console.log('🔄 MoMo Development Mode enabled');
        }
    }

    /**
     * Generate signature for MoMo API requests
     */
    generateSignature(rawSignature) {
        return crypto.createHmac('sha256', this.secretKey)
            .update(rawSignature)
            .digest('hex');
    }

    /**
     * Create MoMo payment request
     */
    async createPayment(orderData) {
        try {
            // Development mode for testing without real API
            if (this.isDevelopment || !this.partnerCode) {
                console.log('🔄 Using MoMo Development Mode for order:', orderData.orderNumber);
                
                // Generate mock response similar to real MoMo
                const mockResponse = {
                    success: true,
                    data: {
                        payUrl: `https://test-payment.momo.vn/gw_payment/transtoken?token=mock_${orderData.orderNumber}`,
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=mock_momo_${orderData.orderNumber}`,
                        deeplink: `momo://payment?token=mock_${orderData.orderNumber}`,
                        requestId: `MOMO_${orderData.orderNumber}_${Date.now()}`,
                        orderId: orderData.orderNumber,
                        amount: orderData.total,
                        signature: 'mock_signature'
                    },
                    message: 'Mock MoMo payment created successfully'
                };
                
                console.log('✅ Mock MoMo response generated:', mockResponse);
                return mockResponse;
            }

            // Real MoMo API call
            const requestId = `MOMO_${orderData.orderNumber}_${Date.now()}`;
            const orderId = orderData.orderNumber;
            const orderInfo = `Thanh toán đơn hàng ${orderId} - Balan Coffee`;
            const redirectUrl = process.env.FRONTEND_URL + '/payment/result';
            const ipnUrl = process.env.BACKEND_URL + '/api/payments/momo/webhook';
            const amount = Math.round(orderData.total); // MoMo expects integer amount in VND
            const requestType = 'captureWallet';
            const extraData = '';

            // Create raw signature string
            const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
            
            const signature = this.generateSignature(rawSignature);

            const requestBody = {
                partnerCode: this.partnerCode,
                accessKey: this.accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'vi'
            };

            console.log('Creating MoMo payment:', {
                orderId: orderId,
                amount: amount,
                requestId: requestId
            });

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (result.resultCode === 0) {
                return {
                    success: true,
                    data: {
                        payUrl: result.payUrl,
                        qrCodeUrl: result.qrCodeUrl,
                        deeplink: result.deeplink,
                        requestId: requestId,
                        orderId: orderId,
                        amount: amount,
                        signature: signature
                    },
                    message: 'MoMo payment created successfully'
                };
            } else {
                throw new Error(result.message || 'Failed to create MoMo payment');
            }

        } catch (error) {
            console.error('MoMo create payment error:', error.message);
            return {
                success: false,
                error: error.message,
                message: 'Failed to create MoMo payment'
            };
        }
    }

    /**
     * Verify MoMo callback signature
     */
    verifySignature(data) {
        try {
            const {
                accessKey,
                amount,
                extraData,
                message,
                orderId,
                orderInfo,
                orderType,
                partnerCode,
                payType,
                requestId,
                responseTime,
                resultCode,
                transId,
                signature
            } = data;

            const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
            
            const expectedSignature = this.generateSignature(rawSignature);
            
            return expectedSignature === signature;
        } catch (error) {
            console.error('MoMo signature verification error:', error);
            return false;
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(requestId) {
        try {
            if (this.isDevelopment || !this.partnerCode) {
                // Mock response for development
                return {
                    success: true,
                    data: {
                        resultCode: 0,
                        message: 'Mock payment successful',
                        requestId: requestId,
                        amount: 100000,
                        orderId: requestId.split('_')[1],
                        transId: `mock_trans_${Date.now()}`
                    }
                };
            }

            // Real MoMo status check API call would go here
            // For now, return mock response
            return {
                success: true,
                data: {
                    resultCode: 0,
                    message: 'Payment successful',
                    requestId: requestId,
                    amount: 100000,
                    orderId: requestId.split('_')[1],
                    transId: `trans_${Date.now()}`
                }
            };
        } catch (error) {
            console.error('MoMo check payment status error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to check payment status'
            };
        }
    }
}

// Export singleton instance
module.exports = new MoMoService();
