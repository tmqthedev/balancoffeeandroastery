const axios = require('axios');
const crypto = require('crypto');

/**
 * iPOS API Service for payment processing
 * Handles order creation, QR code generation, and payment confirmation
 */
class IPosService {
    constructor() {
        this.baseURL = process.env.IPOS_API_URL || 'https://api.ipos.vn';
        this.apiKey = process.env.IPOS_API_KEY;
        this.secretKey = process.env.IPOS_SECRET_KEY;
        this.merchantId = process.env.IPOS_MERCHANT_ID;
        this.useMockMode = process.env.USE_MOCK_DB === 'true'; // Use mock mode when mock DB is enabled
        
        if (!this.apiKey || !this.secretKey || !this.merchantId) {
            console.warn('iPOS credentials not configured. Payment features may not work.');
            if (!this.useMockMode) {
                console.warn('💡 Tip: Set USE_MOCK_DB=true to enable mock payment mode for development');
            }
        }

        if (this.useMockMode) {
            console.log('🔄 iPOS Mock Mode enabled for development');
        }

        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey
            }
        });
    }

    /**
     * Generate signature for iPOS API requests
     */
    generateSignature(data, timestamp) {
        const signString = JSON.stringify(data) + timestamp + this.secretKey;
        return crypto.createHash('sha256').update(signString).digest('hex');
    }

    /**
     * Create order in iPOS system and get payment QR code
     */
    async createPaymentOrder(orderData) {
        try {
            // Mock mode for development
            if (this.useMockMode) {
                console.log('🔄 Using iPOS Mock Mode for order:', orderData.orderNumber);
                
                // Generate mock response similar to real iPOS
                const mockResponse = {
                    success: true,
                    data: {
                        order_id: orderData.orderNumber,
                        payment_id: `MOCK_${orderData.orderNumber}_${Date.now()}`,
                        qr_code: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`, // 1x1 transparent PNG
                        payment_url: `http://localhost:3000/payment/mock?orderId=${orderData.orderNumber}`,
                        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
                        amount: Math.round(orderData.total),
                        currency: 'VND',
                        status: 'pending'
                    },
                    message: 'Mock payment order created successfully'
                };

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return mockResponse;
            }

            // Real iPOS API call
            const timestamp = Date.now().toString();
            const payload = {
                merchant_id: this.merchantId,
                order_id: orderData.orderNumber,
                amount: Math.round(orderData.total), // iPOS expects integer amount in VND
                currency: 'VND',
                description: `Đơn hàng ${orderData.orderNumber} - Balan Coffee`,
                customer_name: orderData.customerName,
                customer_email: orderData.customerEmail,
                customer_phone: orderData.customerPhone,
                callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
                return_url: `${process.env.FRONTEND_URL}/payment/result`,
                timestamp: timestamp,
                items: orderData.items.map(item => ({
                    name: item.productName,
                    quantity: item.quantity,
                    price: Math.round(item.price),
                    sku: item.productSku || ''
                }))
            };

            const signature = this.generateSignature(payload, timestamp);
            payload.signature = signature;

            console.log('Creating iPOS order:', {
                order_id: payload.order_id,
                amount: payload.amount,
                customer_email: payload.customer_email
            });

            const response = await this.client.post('/v1/orders/create', payload);
            
            if (response.data.success) {
                return {
                    success: true,
                    data: {
                        iposOrderId: response.data.data.order_id,
                        qrCode: response.data.data.qr_code,
                        qrCodeUrl: response.data.data.qr_code_url,
                        paymentUrl: response.data.data.payment_url,
                        expiresAt: response.data.data.expires_at
                    }
                };
            } else {
                throw new Error(response.data.message || 'Failed to create iPOS order');
            }

        } catch (error) {
            console.error('iPOS create order error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create payment order'
            };
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(iposOrderId) {
        try {
            const timestamp = Date.now().toString();
            const payload = {
                merchant_id: this.merchantId,
                order_id: iposOrderId,
                timestamp: timestamp
            };

            const signature = this.generateSignature(payload, timestamp);
            payload.signature = signature;

            const response = await this.client.post('/v1/orders/status', payload);

            return {
                success: true,
                data: {
                    status: response.data.data.status, // 'pending', 'paid', 'failed', 'expired'
                    paidAt: response.data.data.paid_at,
                    amount: response.data.data.amount,
                    transactionId: response.data.data.transaction_id
                }
            };

        } catch (error) {
            console.error('iPOS check status error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to check payment status'
            };
        }
    }

    /**
     * Trigger invoice printing
     */
    async printInvoice(iposOrderId) {
        try {
            const timestamp = Date.now().toString();
            const payload = {
                merchant_id: this.merchantId,
                order_id: iposOrderId,
                timestamp: timestamp
            };

            const signature = this.generateSignature(payload, timestamp);
            payload.signature = signature;

            const response = await this.client.post('/v1/orders/print', payload);

            return {
                success: response.data.success,
                message: response.data.message || 'Invoice print request sent'
            };

        } catch (error) {
            console.error('iPOS print invoice error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to print invoice'
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature, timestamp) {
        const expectedSignature = this.generateSignature(payload, timestamp);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }
}

module.exports = new IPosService();
