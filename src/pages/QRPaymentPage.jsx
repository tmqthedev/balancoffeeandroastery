import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const QRPaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order, iposData } = location.state || {};
    
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [timeLeft, setTimeLeft] = useState(null);
    const [checking, setChecking] = useState(false);

    // Format currency helper
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Calculate time left for QR code expiry
    useEffect(() => {
        if (!iposData?.expiresAt) return;

        const updateTimeLeft = () => {
            const now = new Date();
            const expiry = new Date(iposData.expiresAt);
            const difference = expiry - now;

            if (difference > 0) {
                const minutes = Math.floor(difference / 60000);
                const seconds = Math.floor((difference % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft('Đã hết hạn');
                setPaymentStatus('expired');
            }
        };

        updateTimeLeft();
        const interval = setInterval(updateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [iposData?.expiresAt]);

    // Check payment status periodically
    useEffect(() => {
        if (!order?.orderNumber || paymentStatus !== 'pending') return;

        const checkPaymentStatus = async () => {
            if (checking) return;
            
            try {
                setChecking(true);
                const response = await fetch(
                    `/api/orders/${order.orderNumber}/payment-status`,
                    {
                        credentials: 'include'
                    }
                );

                const result = await response.json();
                
                if (result.success && result.order.paymentStatus === 'completed') {
                    setPaymentStatus('completed');
                    // Redirect to success page after a short delay
                    setTimeout(() => {
                        navigate('/payment/result', {
                            state: {
                                order: result.order,
                                success: true,
                                paymentMethod: 'ipos'
                            }
                        });
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            } finally {
                setChecking(false);
            }
        };

        // Check immediately and then every 3 seconds
        checkPaymentStatus();
        const interval = setInterval(checkPaymentStatus, 3000);

        return () => clearInterval(interval);
    }, [order?.orderNumber, paymentStatus, checking, navigate]);

    // Redirect if no order data
    useEffect(() => {
        if (!order || !iposData) {
            navigate('/cart');
        }
    }, [order, iposData, navigate]);

    if (!order || !iposData) {
        return <div>Đang tải...</div>;
    }

    return (
        <>
            <Helmet>
                <title>Thanh toán QR Code - Balan Coffee</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-cream-50 py-8">
                <div className="container mx-auto px-4 max-w-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-primary mb-2">
                            Thanh Toán QR Code
                        </h1>
                        <p className="text-brand-primary">
                            Quét mã QR bằng ứng dụng ngân hàng để hoàn tất thanh toán
                        </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {/* Payment Status */}
                        <div className={`p-4 text-center ${
                            paymentStatus === 'completed' ? 'bg-green-100 border-green-200' :
                            paymentStatus === 'expired' ? 'bg-red-100 border-red-200' :
                            'bg-blue-100 border-blue-200'
                        } border-b`}>
                            {paymentStatus === 'completed' && (
                                <div className="flex items-center justify-center text-green-700">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-semibold">✅ Thanh toán thành công!</span>
                                </div>
                            )}
                            {paymentStatus === 'expired' && (
                                <div className="flex items-center justify-center text-red-700">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">⏰ Mã QR đã hết hạn</span>
                                </div>
                            )}
                            {paymentStatus === 'pending' && (
                                <div className="flex items-center justify-center text-blue-700">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
                                    <span className="font-semibold">⏳ Đang chờ thanh toán...</span>
                                </div>
                            )}
                        </div>

                        {/* QR Code Section */}
                        {paymentStatus === 'pending' && (
                            <div className="p-6 text-center">
                                <div className="mb-6">
                                    {iposData.qrCodeUrl ? (
                                        <img 
                                            src={iposData.qrCodeUrl} 
                                            alt="QR Code thanh toán"
                                            className="mx-auto w-64 h-64 border border-gray-200 rounded-lg"
                                        />
                                    ) : (
                                        <div className="mx-auto w-64 h-64 bg-brand-secondary/20 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-500">Đang tải mã QR...</span>
                                        </div>
                                    )}
                                </div>

                                {timeLeft && (
                                    <div className="mb-4">
                                        <p className="text-sm text-brand-primary mb-1">Thời gian còn lại:</p>
                                        <p className="text-xl font-bold text-brand-primary">{timeLeft}</p>
                                    </div>
                                )}

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <h3 className="font-semibold text-yellow-800 mb-2">📋 Hướng dẫn thanh toán:</h3>
                                    <ol className="text-sm text-yellow-700 text-left space-y-1">
                                        <li>1. Mở ứng dụng ngân hàng trên điện thoại</li>
                                        <li>2. Chọn tính năng "Quét QR" hoặc "Chuyển khoản QR"</li>
                                        <li>3. Quét mã QR phía trên</li>
                                        <li>4. Xác nhận thông tin và hoàn tất thanh toán</li>
                                    </ol>
                                </div>

                                {iposData.paymentUrl && (
                                    <div className="mb-4">
                                        <a
                                            href={iposData.paymentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Mở trang thanh toán
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="border-t border-gray-200 p-6">
                            <h3 className="font-semibold text-brand-primary mb-4">📦 Thông tin đơn hàng</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-brand-primary">Mã đơn hàng:</span>
                                    <span className="font-medium text-brand-primary">{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-brand-primary">Phương thức:</span>
                                    <span className="text-brand-primary">iPOS QR Code</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
                                    <span className="text-brand-primary">Tổng tiền:</span>
                                    <span className="text-brand-primary">{formatCurrency(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => navigate('/account')}
                                    className="flex-1 bg-brand-secondary/20 hover:bg-gray-200 text-brand-primary py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    📋 Xem đơn hàng
                                </button>
                                <button
                                    onClick={() => navigate('/products')}
                                    className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                                >
                                    🛒 Tiếp tục mua sắm
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Support info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-brand-primary mb-2">
                            Gặp vấn đề khi thanh toán? 
                        </p>
                        <a 
                            href="tel:+84123456789" 
                            className="text-brand-primary hover:text-brand-primary font-medium"
                        >
                            📞 Liên hệ hỗ trợ: 0123 456 789
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QRPaymentPage;

