import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart, getCartTotals } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [iposOrderId, setIposOrderId] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, success, failed

    const { totalPrice } = getCartTotals();    useEffect(() => {
        // Redirect if cart is empty or user not logged in
        if (!cartItems.length || !user) {
            navigate('/cart');
            return;
        }

        // Create order and get QR code from iPOS API
        createPaymentOrder();
    }, [cartItems.length, user, navigate, createPaymentOrder]);

    useEffect(() => {
        // Check payment status every 5 seconds
        let interval;
        if (iposOrderId && paymentStatus === 'pending') {
            interval = setInterval(checkPaymentStatus, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [iposOrderId, paymentStatus, checkPaymentStatus]);

    const createPaymentOrder = useCallback(async () => {
        setLoading(true);
        try {
            const orderPayload = {
                user_id: user.id,
                items: cartItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total_price: totalPrice,
                customer_info: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone || ''
                }
            };

            const response = await fetch('/api/orders/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderPayload)
            });

            const data = await response.json();            if (data.success) {
                // setOrderData(data.order); // Removed unused state
                setIposOrderId(data.ipos_order_id);
                setQrCodeUrl(data.qr_code_url);
            } else {
                throw new Error(data.message || 'Không thể tạo đơn hàng');
            }
        } catch (error) {            console.error('Error creating payment order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    }, [user, cartItems, totalPrice, navigate]);

    const checkPaymentStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/orders/payment-status/${iposOrderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();

            if (data.status === 'completed') {
                setPaymentStatus('success');
                clearCart();
                setTimeout(() => {
                    navigate('/account', { 
                        state: { message: 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.' }
                    });
                }, 3000);            } else if (data.status === 'failed') {
                setPaymentStatus('failed');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }, [iposOrderId, clearCart, navigate]);

    const handleCancelPayment = () => {
        if (window.confirm('Bạn có chắc chắn muốn hủy thanh toán?')) {
            navigate('/cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tạo đơn hàng...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Thanh toán - Balan Coffee & Roastery</title>
                <meta name="description" content="Thanh toán đơn hàng cà phê rang mộc chất lượng cao" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    {paymentStatus === 'pending' && (
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-coffee-800 mb-8">
                                Thanh toán đơn hàng
                            </h1>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                                <h2 className="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
                                <div className="text-left space-y-2">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between py-2 border-b">
                                            <span>{item.name} x {item.quantity}</span>
                                            <span>{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between font-bold text-lg pt-2">
                                        <span>Tổng cộng:</span>
                                        <span className="text-coffee-600">
                                            {totalPrice.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* QR Code Payment */}
                            <div className="bg-white rounded-lg shadow-lg p-8">
                                <h2 className="text-2xl font-semibold mb-4">
                                    Quét mã QR để thanh toán
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Sử dụng ứng dụng Momo để quét mã QR bên dưới
                                </p>

                                {qrCodeUrl ? (
                                    <div className="flex flex-col items-center">
                                        <img
                                            src={qrCodeUrl}
                                            alt="Mã QR thanh toán Momo"
                                            className="w-64 h-64 mb-6 border-2 border-gray-200 rounded-lg"
                                        />
                                        <div className="text-sm text-gray-500 mb-4">
                                            Mã đơn hàng: {iposOrderId}
                                        </div>
                                        <div className="flex items-center text-blue-600 mb-6">
                                            <div className="animate-pulse w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                                            Đang chờ thanh toán...
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-64 h-64 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-6">
                                        <span className="text-gray-500">Đang tải mã QR...</span>
                                    </div>
                                )}

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={handleCancelPayment}
                                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy thanh toán
                                    </button>
                                    <button
                                        onClick={checkPaymentStatus}
                                        className="px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                                    >
                                        Kiểm tra thanh toán
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentStatus === 'success' && (
                        <div className="text-center">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-green-800 mb-4">
                                    Thanh toán thành công!
                                </h1>
                                <p className="text-green-700 mb-6">
                                    Đơn hàng của bạn đã được tạo trên hệ thống iPOS. 
                                    Chúng tôi sẽ liên hệ để xác nhận và giao hàng.
                                </p>
                                <p className="text-sm text-green-600">
                                    Mã đơn hàng: {iposOrderId}
                                </p>
                                <p className="text-sm text-gray-500 mt-4">
                                    Đang chuyển hướng đến trang tài khoản...
                                </p>
                            </div>
                        </div>
                    )}

                    {paymentStatus === 'failed' && (
                        <div className="text-center">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </div>
                                <h1 className="text-2xl font-bold text-red-800 mb-4">
                                    Thanh toán thất bại
                                </h1>
                                <p className="text-red-700 mb-6">
                                    Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.
                                </p>
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="px-6 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                                >
                                    Quay lại giỏ hàng
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Payment;
