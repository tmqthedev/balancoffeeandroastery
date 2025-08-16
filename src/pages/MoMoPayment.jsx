import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MoMoPaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
    
    const { order, momoData } = location.state || {};

    useEffect(() => {
        if (!order || !momoData) {
            navigate('/checkout');
            return;
        }

        // Start countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPaymentStatus('expired');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [order, momoData, navigate]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleCheckPaymentStatus = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/momo/status/${momoData.requestId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            );

            const result = await response.json();

            if (result.success && result.data.resultCode === 0) {
                setPaymentStatus('success');
                setTimeout(() => {
                    navigate('/payment/result', {
                        state: {
                            order,
                            paymentMethod: 'momo',
                            success: true,
                            transactionId: result.data.transId
                        }
                    });
                }, 2000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    const handleGoBack = () => {
        navigate('/checkout');
    };

    if (!order || !momoData) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-coffee-800 mb-4">Không tìm thấy thông tin thanh toán</h2>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="bg-coffee-600 text-white px-6 py-2 rounded-lg hover:bg-coffee-700"
                    >
                        Quay lại đặt hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-pink-600 text-white p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <span className="text-2xl">🪙</span>
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Thanh toán qua MoMo</h1>
                        <p className="text-pink-100">Đơn hàng #{order.orderNumber}</p>
                    </div>

                    {/* Payment info */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-coffee-800 mb-2">
                                Số tiền: {new Intl.NumberFormat('vi-VN', { 
                                    style: 'currency', 
                                    currency: 'VND' 
                                }).format(order.total)}
                            </h2>
                            
                            {/* Timer */}
                            <div className="flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-orange-600 font-medium">
                                    Thời gian còn lại: {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* QR Code */}
                        {momoData.qrCodeUrl && (
                            <div className="text-center mb-6">
                                <div className="inline-block p-4 bg-white border-2 border-dashed border-coffee-300 rounded-lg">
                                    <img 
                                        src={momoData.qrCodeUrl} 
                                        alt="MoMo QR Code"
                                        className="w-48 h-48 mx-auto"
                                    />
                                </div>
                                <p className="text-sm text-coffee-600 mt-2">
                                    Quét mã QR bằng ứng dụng MoMo để thanh toán
                                </p>
                            </div>
                        )}

                        {/* Payment methods */}
                        <div className="space-y-4 mb-6">
                            {/* MoMo App */}
                            {momoData.deeplink && (
                                <div className="border border-coffee-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white mr-3">
                                                📱
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-coffee-800">Ứng dụng MoMo</h3>
                                                <p className="text-sm text-coffee-600">Thanh toán trực tiếp qua app</p>
                                            </div>
                                        </div>
                                        <a
                                            href={momoData.deeplink}
                                            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700"
                                        >
                                            Mở MoMo
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* QR Code */}
                            <div className="border border-coffee-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                                        📷
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-coffee-800">Quét mã QR</h3>
                                        <p className="text-sm text-coffee-600">Sử dụng camera trong app MoMo</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status check */}
                        <div className="text-center mb-6">
                            <button
                                onClick={handleCheckPaymentStatus}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
                            >
                                Kiểm tra trạng thái thanh toán
                            </button>
                        </div>

                        {/* Payment status */}
                        {paymentStatus === 'success' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                <div className="text-green-600 text-2xl mb-2">✅</div>
                                <h3 className="font-medium text-green-800 mb-1">Thanh toán thành công!</h3>
                                <p className="text-sm text-green-700">Đang chuyển hướng...</p>
                            </div>
                        )}

                        {paymentStatus === 'expired' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <div className="text-red-600 text-2xl mb-2">⏰</div>
                                <h3 className="font-medium text-red-800 mb-1">Hết thời gian thanh toán</h3>
                                <p className="text-sm text-red-700 mb-3">
                                    Phiên thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới.
                                </p>
                                <button
                                    onClick={handleGoBack}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                                >
                                    Đặt hàng lại
                                </button>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-cream-50 rounded-lg p-4">
                            <h3 className="font-medium text-coffee-800 mb-2">Hướng dẫn thanh toán:</h3>
                            <ol className="text-sm text-coffee-600 space-y-1">
                                <li>1. Mở ứng dụng MoMo trên điện thoại</li>
                                <li>2. Chọn "Quét QR" hoặc "Thanh toán"</li>
                                <li>3. Quét mã QR code ở trên</li>
                                <li>4. Xác nhận thông tin và hoàn tất thanh toán</li>
                                <li>5. Nhấn "Kiểm tra trạng thái" để xác nhận</li>
                            </ol>
                        </div>

                        {/* Support */}
                        <div className="text-center mt-6 pt-6 border-t border-cream-200">
                            <p className="text-sm text-coffee-600 mb-2">Cần hỗ trợ?</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleGoBack}
                                    className="text-coffee-600 hover:text-coffee-800 text-sm"
                                >
                                    ← Quay lại đặt hàng
                                </button>
                                <span className="text-cream-400">|</span>
                                <a
                                    href="/contact"
                                    className="text-coffee-600 hover:text-coffee-800 text-sm"
                                >
                                    Liên hệ hỗ trợ
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoMoPaymentPage;
