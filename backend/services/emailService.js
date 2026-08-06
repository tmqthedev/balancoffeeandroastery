const nodemailer = require('nodemailer');
const { getRuntimeConfig } = require('../config/runtimeConfig');

/**
 * Email Service for sending notifications and system emails
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializingPromise = null;
        this.emailUser = null;
    }

    async ensureTransport() {
        if (this.transporter) {
            return this.transporter;
        }

        if (this.initializingPromise) {
            return this.initializingPromise;
        }

        this.initializingPromise = (async () => {
            try {
                const runtimeConfig = await getRuntimeConfig();
                const { emailHost, emailPort, emailUser, emailPassword } = runtimeConfig;

                this.emailUser = emailUser;

                if (!emailUser || !emailPassword) {
                    console.warn('⚠️ Email service not configured (SMTP credentials missing)');
                    this.transporter = null;
                    return null;
                }

                this.transporter = nodemailer.createTransport({
                    host: emailHost,
                    port: emailPort,
                    secure: false,
                    auth: {
                        user: emailUser,
                        pass: emailPassword
                    },
                });

                console.log('📧 Email config:', {
                    host: emailHost,
                    port: emailPort,
                    user: emailUser,
                    hasPassword: !!emailPassword
                });

                return this.transporter;
            } catch (error) {
                this.transporter = null;
                throw error;
            } finally {
                this.initializingPromise = null;
            }
        })();

        return this.initializingPromise;
    }

    /**
     * Generic email sending method
     */
    async sendEmail(to, subject, html, text = null) {
        try {
            await this.ensureTransport();

            if (!this.transporter) {
                console.warn('Email service not configured, cannot send email');
                return { success: false, error: 'Email service not configured' };
            }

            const mailOptions = {
                from: {
                    name: 'Balan Coffee & Roastery',
                    address: this.emailUser
                },
                to,
                subject,
                html,
                text: text || this.stripHtml(html)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', {
                to,
                subject,
                messageId: result.messageId
            });
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Email send failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Strip HTML tags for plain text version
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    /**
        * Currently unused.
        * Verification emails are handled by AWS Cognito.
     
    async sendEmailVerificationEmail(email, verificationLink, userName = '') {
        try {
            if (!this.transporter) {
                console.warn('Email service not configured, cannot send verification email');
                return { success: false, error: 'Email service not configured' };
            }

            const subject = 'Xác thực email - Balan Coffee & Roastery';
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .title { color: #1A3C34; font-size: 24px; font-weight: bold; margin: 20px 0; }
                        .content { color: #333; margin-bottom: 30px; }
                        .button { display: inline-block; background-color: #1A3C34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                        .button:hover { background-color: #2a5a4f; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
                        .welcome { background-color: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; color: #0c5460; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 class="title">🎉 Chào mừng đến với Balan Coffee!</h1>
                        </div>
                        
                        <div class="content">
                            <p>Xin chào ${userName || 'Quý khách'},</p>
                            
                            <div class="welcome">
                                <h3>💚 Cảm ơn bạn đã đăng ký tài khoản!</h3>
                                <p>Chúng tôi rất vui mừng chào đón bạn trở thành thành viên của <strong>Balan Coffee & Roastery</strong> - nơi mang đến những hạt cà phê rang mộc chất lượng cao nhất.</p>
                            </div>
                            
                            <p>Để hoàn tất quá trình đăng ký và bảo vệ tài khoản của bạn, vui lòng xác thực địa chỉ email <strong>${email}</strong> bằng cách nhấn vào nút bên dưới:</p>
                            
                            <div style="text-align: center;">
                                <a href="${verificationLink}" class="button">Xác thực Email</a>
                            </div>
                            
                            <p>Hoặc copy và dán link sau vào trình duyệt:</p>
                            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${verificationLink}</p>
                            
                            <div class="warning">
                                <strong>⚠️ Lưu ý quan trọng:</strong>
                                <ul>
                                    <li>Link xác thực chỉ có hiệu lực trong <strong>24 giờ</strong></li>
                                    <li>Sau khi xác thực, bạn có thể đăng nhập và sử dụng đầy đủ tính năng</li>
                                    <li>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email</li>
                                    <li>Không chia sẻ link này với bất kỳ ai khác</li>
                                </ul>
                            </div>
                            
                            <h3 style="color: #1A3C34;">☕ Những gì bạn sẽ nhận được:</h3>
                            <ul>
                                <li>🎯 Ưu đãi đặc biệt dành riêng cho thành viên</li>
                                <li>📦 Miễn phí giao hàng cho đơn hàng từ 300.000đ</li>
                                <li>🔔 Thông báo sớm về sản phẩm mới và khuyến mãi</li>
                                <li>⭐ Tích điểm và đổi quà hấp dẫn</li>
                                <li>📞 Hỗ trợ khách hàng 24/7</li>
                            </ul>
                            
                            <p>Nếu bạn gặp khó khăn trong việc xác thực email, vui lòng liên hệ với chúng tôi:</p>
                            <ul>
                                <li>📧 Email: support@balancoffeeroastery.com.vn</li>
                                <li>📞 Điện thoại: (028) 1234 5678</li>
                                <li>💬 Live Chat: Trên website của chúng tôi</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Balan Coffee & Roastery</strong></p>
                            <p>Cà phê rang mộc chất lượng cao | Premium Hand-roasted Coffee</p>
                            <p style="font-size: 12px; color: #999;">
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await this.sendEmail(email, subject, html);
        } catch (error) {
            console.error('Email verification failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    */
    
    /**
     * Send forgot password email
     */
    async sendForgotPasswordEmail(email, resetLink, userName = '') {
        try {
            const subject = 'Đặt lại mật khẩu - Balan Coffee & Roastery';
            
            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .title { color: #1A3C34; font-size: 24px; font-weight: bold; margin: 20px 0; }
                        .content { color: #333; margin-bottom: 30px; }
                        .button { display: inline-block; background-color: #1A3C34; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                        .button:hover { background-color: #2a5a4f; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 class="title">Đặt lại mật khẩu</h1>
                        </div>
                        
                        <div class="content">
                            <p>Xin chào ${userName || 'Quý khách'},</p>
                            
                            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong> tại Balan Coffee & Roastery.</p>
                            
                            <p>Để đặt lại mật khẩu, vui lòng nhấn vào nút bên dưới:</p>
                            
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button">Đặt lại mật khẩu</a>
                            </div>
                            
                            <p>Hoặc copy và dán link sau vào trình duyệt:</p>
                            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${resetLink}</p>
                            
                            <div class="warning">
                                <strong>⚠️ Lưu ý quan trọng:</strong>
                                <ul>
                                    <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                                    <li>Không chia sẻ link này với bất kỳ ai khác</li>
                                </ul>
                            </div>
                            
                            <p>Nếu bạn gặp khó khăn, vui lòng liên hệ với chúng tôi qua:</p>
                            <ul>
                                <li>📧 Email: support@balancoffeeroastery.com.vn</li>
                                <li>📞 Điện thoại: (028) 1234 5678</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Balan Coffee & Roastery</strong></p>
                            <p>Cà phê rang mộc chất lượng cao | Premium Hand-roasted Coffee</p>
                            <p style="font-size: 12px; color: #999;">
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await this.sendEmail(email, subject, html);
        } catch (error) {
            console.error('Forgot password email failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send order confirmation email to customer
     */
    async sendOrderConfirmationEmail(email, orderData, userName = '') {
        try {
            await this.ensureTransport();

            if (!this.transporter) {
                console.warn('Email service not configured, cannot send order confirmation email');
                return { success: false, error: 'Email service not configured' };
            }

            const subject = `Xác nhận đơn hàng #${orderData.orderNumber} - Balan Coffee & Roastery`;
            
            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(amount);
            };

            const itemsHtml = orderData.items.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.productName || item.name}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `).join('');

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .logo { width: 120px; height: auto; }
                        .title { color: #1A3C34; font-size: 24px; font-weight: bold; margin: 20px 0; }
                        .content { color: #333; margin-bottom: 30px; }
                        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .order-table th { background-color: #1A3C34; color: white; padding: 12px; text-align: left; }
                        .order-table td { padding: 10px; border-bottom: 1px solid #eee; }
                        .total { font-size: 18px; font-weight: bold; color: #1A3C34; text-align: right; margin-top: 15px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold; }
                        .status-pending { background-color: #fff3cd; color: #856404; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 class="title">🎉 Cảm ơn bạn đã đặt hàng!</h1>
                        </div>
                        
                        <div class="content">
                            <p>Xin chào ${userName || 'Quý khách'},</p>
                            
                            <p>Cảm ơn bạn đã đặt hàng tại <strong>Balan Coffee & Roastery</strong>! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
                            
                            <div class="order-info">
                                <h3 style="margin-top: 0; color: #1A3C34;">📋 Thông tin đơn hàng</h3>
                                <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                                <p><strong>Ngày đặt:</strong> ${new Date(orderData.createdAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                                <p><strong>Trạng thái:</strong> <span class="status-badge status-pending">Chờ xử lý</span></p>
                                <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : orderData.paymentMethod.toUpperCase()}</p>
                                ${orderData.shippingAddress ? `<p><strong>Địa chỉ giao hàng:</strong> ${orderData.shippingAddress}</p>` : ''}
                                ${orderData.phone ? `<p><strong>Số điện thoại:</strong> ${orderData.phone}</p>` : ''}
                            </div>
                            
                            <h3 style="color: #1A3C34;">☕ Chi tiết đơn hàng</h3>
                            <table class="order-table">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th style="text-align: center;">Số lượng</th>
                                        <th style="text-align: right;">Đơn giá</th>
                                        <th style="text-align: right;">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                            
                            <div class="total">
                                <p>Tổng cộng: ${formatCurrency(orderData.total || orderData.totalAmount)}</p>
                            </div>
                            
                            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
                                <h4 style="margin-top: 0; color: #1A3C34;">⏰ Thời gian giao hàng dự kiến</h4>
                                <p>Chúng tôi sẽ liên hệ với bạn trong vòng <strong>30 phút</strong> để xác nhận đơn hàng và sắp xếp thời gian giao hàng phù hợp.</p>
                                <p>Thời gian giao hàng: <strong>1-2 giờ</strong> trong khu vực nội thành.</p>
                            </div>
                            
                            <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi:</p>
                            <ul>
                                <li>📧 Email: support@balancoffeeroastery.com.vn</li>
                                <li>📞 Điện thoại: (028) 1234 5678</li>
                                <li>🌐 Website: https://balancoffeeroastery.com.vn</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p><strong>Balan Coffee & Roastery</strong></p>
                            <p>Cà phê rang mộc chất lượng cao | Premium Hand-roasted Coffee</p>
                            <p style="font-size: 12px; color: #999;">
                                Email này được gửi tự động, vui lòng không trả lời trực tiếp.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            return await this.sendEmail(email, subject, html);
        } catch (error) {
            console.error('Order confirmation email failed:', error.message);
            return { success: false, error: error.message };
        }
    }    /**
     * Send new order notification to admin/management
     */
    async sendNewOrderNotificationToAdmin(orderData) {
        try {
            if (!this.transporter) {
                console.warn('Email service not configured, skipping admin notification');
                return { success: false, error: 'Email service not configured', totalSent: 0, totalFailed: 0 };
            }

            // Multiple admin emails can be configured
            const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@balancoffeeroastery.com.vn').split(',').map(email => email.trim());
            
            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(amount);
            };

            const itemsHtml = orderData.items.map(item => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName || item.name}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `).join('');

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                        .header { background: #1A3C34; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; }
                        .order-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
                        .customer-info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #007bff; }
                        .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        .items-table th { background-color: #1A3C34; color: white; }
                        .total-row { font-weight: bold; background-color: #f8f9fa; }
                        .urgent { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔔 Đơn hàng mới</h1>
                            <p>Có đơn hàng mới cần xử lý</p>
                        </div>
                        <div class="content">
                            <div class="urgent">
                                <strong>⚡ Cần xử lý ngay:</strong> Đơn hàng mới vừa được tạo, vui lòng liên hệ khách hàng trong vòng 30 phút.
                            </div>

                            <div class="order-info">
                                <h3>📦 Thông tin đơn hàng</h3>
                                <p><strong>Mã đơn hàng:</strong> ${orderData.orderNumber}</p>
                                <p><strong>Thời gian đặt:</strong> ${new Date(orderData.createdAt || Date.now()).toLocaleString('vi-VN')}</p>
                                <p><strong>Tổng tiền:</strong> ${formatCurrency(orderData.total || orderData.totalAmount)}</p>
                                <p><strong>Phương thức thanh toán:</strong> ${orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : orderData.paymentMethod.toUpperCase()}</p>
                            </div>

                            <div class="customer-info">
                                <h3>👤 Thông tin khách hàng</h3>
                                <p><strong>Tên:</strong> ${orderData.customerName || orderData.name || 'N/A'}</p>
                                <p><strong>Email:</strong> ${orderData.customerEmail || orderData.email}</p>
                                <p><strong>Điện thoại:</strong> ${orderData.customerPhone || orderData.phone}</p>
                                ${orderData.shippingAddress ? `<p><strong>Địa chỉ giao hàng:</strong> ${orderData.shippingAddress}</p>` : ''}
                                ${orderData.notes ? `<p><strong>Ghi chú:</strong> ${orderData.notes}</p>` : ''}
                            </div>

                            <h3>📋 Chi tiết sản phẩm</h3>
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
                                    ${itemsHtml}
                                    <tr class="total-row">
                                        <td colspan="3"><strong>Tổng cộng</strong></td>
                                        <td><strong>${formatCurrency(orderData.total || orderData.totalAmount)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="urgent">
                                <strong>📋 Hành động cần thực hiện:</strong><br>
                                • Gọi điện xác nhận đơn hàng với khách hàng<br>
                                • Chuẩn bị sản phẩm theo đơn hàng<br>
                                • Sắp xếp lịch giao hàng<br>
                                • Cập nhật trạng thái đơn hàng trong hệ thống
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;

            await this.ensureTransport();

            if (!this.transporter) {
                console.warn('Email service not configured, skipping admin notification');
                return { success: false, error: 'Email service not configured', totalSent: 0, totalFailed: 0 };
            }

            // Send to all admin emails
            const results = await Promise.all(
                adminEmails.map(async (adminEmail) => {
                    try {
                        const mailOptions = {
                            from: `"Balan Coffee System" <${this.emailUser}>`,
                            to: adminEmail,
                            subject: `🔔 Đơn hàng mới #${orderData.orderNumber} - ${formatCurrency(orderData.total || orderData.totalAmount)}`,
                            html: html
                        };

                        const result = await this.transporter.sendMail(mailOptions);
                        console.log(`✅ Admin notification sent to ${adminEmail}:`, result.messageId);
                        return { email: adminEmail, success: true, messageId: result.messageId };
                    } catch (error) {
                        console.error(`❌ Failed to send admin notification to ${adminEmail}:`, error);
                        return { email: adminEmail, success: false, error: error.message };
                    }
                })
            );
            
            return { 
                success: true, 
                results: results,
                totalSent: results.filter(r => r.success).length,
                totalFailed: results.filter(r => !r.success).length
            };
        } catch (error) {
            console.error('Failed to send admin notifications:', error);
            return { success: false, error: error.message, totalSent: 0, totalFailed: 0 };
        }
    }

    /**
     * Send payment notification email to admin
     */
    async sendPaymentNotificationToAdmin(orderData, paymentData) {
        try {
            await this.ensureTransport();

            if (!this.transporter) {
                console.warn('Email service not configured, skipping admin notification');
                return { success: false, error: 'Email service not configured' };
            }

            const adminEmail = process.env.ADMIN_EMAIL || 'admin@balancoffeeroastery.com.vn';
            
            const mailOptions = {
                from: `"Balan Coffee System" <${this.emailUser}>`,
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
    }

    /**
     * Send payment confirmation email to customer
     */
    async sendPaymentConfirmationToCustomer(orderData, paymentData) {
        try {
            await this.ensureTransport();

            if (!this.transporter) {
                console.warn('Email service not configured, skipping customer notification');
                return { success: false, error: 'Email service not configured' };
            }

            const mailOptions = {
                from: `"Balan Coffee & Roastery" <${this.emailUser}>`,
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