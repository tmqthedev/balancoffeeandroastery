const nodemailer = require('nodemailer');

/**
 * Email Service for sending payment notifications
 */
class EmailService {
    constructor() {
        // Only initialize email transporter if SMTP credentials are provided
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });

            // Verify transporter configuration
            this.transporter.verify((error, success) => {
                if (error) {
                    console.warn('Email transporter verification failed:', error.message);
                } else {
                    console.log('✅ Email service ready');
                }
            });
        } else {
            console.warn('⚠️ Email service not configured (SMTP credentials missing)');
            this.transporter = null;
        }
    }    /**
     * Send payment confirmation email to admin
     */
    async sendPaymentNotificationToAdmin(orderData, paymentData) {
        try {
            if (!this.transporter) {
                console.warn('Email service not configured, skipping admin notification');
                return { success: false, error: 'Email service not configured' };
            }

            const adminEmail = process.env.ADMIN_EMAIL || 'admin@balancoffee.com';
            
            const mailOptions = {
                from: `"Balan Coffee System" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                subject: `💰 Thanh toán thành công - Đơn hàng ${orderData.orderNumber}`,
                html: this.generateAdminPaymentTemplate(orderData, paymentData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Admin payment notification sent:', result.messageId);
            
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Failed to send admin payment notification:', error);
            return { success: false, error: error.message };
        }
    }    /**
     * Send payment confirmation email to customer
     */
    async sendPaymentConfirmationToCustomer(orderData, paymentData) {
        try {
            if (!this.transporter) {
                console.warn('Email service not configured, skipping customer notification');
                return { success: false, error: 'Email service not configured' };
            }

            const mailOptions = {
                from: `"Balan Coffee & Roastery" <${process.env.SMTP_USER}>`,
                to: orderData.customerEmail,
                subject: `✅ Xác nhận thanh toán - Đơn hàng ${orderData.orderNumber}`,
                html: this.generateCustomerPaymentTemplate(orderData, paymentData)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Customer payment confirmation sent:', result.messageId);
            
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Failed to send customer payment confirmation:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate admin payment notification email template
     */
    generateAdminPaymentTemplate(orderData, paymentData) {
        const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .payment-info { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; }
                .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total-row { font-weight: bold; background-color: #f8f9fa; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Thanh Toán Thành Công</h1>
                    <p>Đơn hàng mới đã được thanh toán</p>
                </div>
                <div class="content">
                    <div class="payment-info">
                        <h3>💰 Thông Tin Thanh Toán</h3>
                        <p><strong>Mã giao dịch:</strong> ${paymentData.transactionId}</p>
                        <p><strong>Số tiền:</strong> ${formatCurrency(paymentData.amount)}</p>
                        <p><strong>Thời gian:</strong> ${new Date(paymentData.paidAt).toLocaleString('vi-VN')}</p>
                        <p><strong>Phương thức:</strong> iPOS QR Code</p>
                    </div>

                    <div class="order-info">
                        <h3>📦 Thông Tin Đơn Hàng</h3>
                        <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                        <p><strong>Khách hàng:</strong> ${orderData.customerName}</p>
                        <p><strong>Email:</strong> ${orderData.customerEmail}</p>
                        <p><strong>Điện thoại:</strong> ${orderData.customerPhone}</p>
                        <p><strong>Địa chỉ giao hàng:</strong> ${orderData.shippingAddress}</p>
                    </div>

                    <h3>📋 Chi Tiết Sản Phẩm</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price)}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="3">Tạm tính</td>
                                <td>${formatCurrency(orderData.subtotal)}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3">Phí vận chuyển</td>
                                <td>${formatCurrency(orderData.shippingFee)}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3"><strong>Tổng cộng</strong></td>
                                <td><strong>${formatCurrency(orderData.total)}</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                        <strong>⚡ Hành động cần thực hiện:</strong><br>
                        • Chuẩn bị đơn hàng để giao<br>
                        • In hóa đơn đã được tự động gửi đến máy in iPOS<br>
                        • Liên hệ khách hàng nếu cần thiết
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Generate customer payment confirmation email template
     */
    generateCustomerPaymentTemplate(orderData, paymentData) {
        const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .header { background: #8B4513; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .success-message { background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #28a745; text-align: center; }
                .order-summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .items-table th { background-color: #f2f2f2; }
                .total-row { font-weight: bold; background-color: #f8f9fa; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>☕ Balan Coffee & Roastery</h1>
                    <p>Cảm ơn bạn đã đặt hàng!</p>
                </div>
                <div class="content">
                    <div class="success-message">
                        <h2>✅ Thanh toán thành công!</h2>
                        <p>Đơn hàng <strong>${orderData.orderNumber}</strong> đã được thanh toán thành công.</p>
                    </div>

                    <div class="order-summary">
                        <h3>📄 Thông Tin Đơn Hàng</h3>
                        <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                        <p><strong>Ngày đặt:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
                        <p><strong>Tổng tiền:</strong> ${formatCurrency(orderData.total)}</p>
                        <p><strong>Phương thức thanh toán:</strong> iPOS QR Code</p>
                    </div>

                    <h3>📦 Chi Tiết Sản Phẩm</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>SL</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderData.items.map(item => `
                                <tr>
                                    <td>${item.productName}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td colspan="2"><strong>Tổng cộng</strong></td>
                                <td><strong>${formatCurrency(orderData.total)}</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-radius: 5px; border-left: 4px solid #007bff;">
                        <h4>📍 Thông Tin Giao Hàng</h4>
                        <p><strong>Người nhận:</strong> ${orderData.customerName}</p>
                        <p><strong>Địa chỉ:</strong> ${orderData.shippingAddress}</p>
                        <p><strong>Điện thoại:</strong> ${orderData.customerPhone}</p>
                    </div>

                    <p style="text-align: center; margin-top: 30px; color: #666;">
                        Cảm ơn bạn đã tin tưởng <strong>Balan Coffee & Roastery</strong>!<br>
                        Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để giao hàng.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();
