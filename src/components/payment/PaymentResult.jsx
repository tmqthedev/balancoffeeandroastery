import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const PaymentResult = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState('processing');
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get data from navigation state (for iPOS payments)
    const stateData = location.state || {};
    const { order: stateOrder, success: stateSuccess, paymentMethod } = stateData;

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                // If we have state data (from payment flow), use it directly
                if (stateOrder && stateSuccess !== undefined) {
                    setOrderDetails(stateOrder);
                    setPaymentStatus(stateSuccess ? 'success' : 'failed');
                    setLoading(false);
                    return;  
                }

                // Get order info from URL params
                const orderId = searchParams.get('orderId') || searchParams.get('orderNumber');
                const resultCode = searchParams.get('resultCode'); // For MoMo
                
                if (!orderId) {
                    setPaymentStatus('error');
                    setLoading(false);
                    return;
                }

                // Handle MoMo return
                if (resultCode !== null) {
                    if (resultCode === '0') {
                        setPaymentStatus('success');
                    } else {
                        setPaymentStatus('failed');
                    }
                }

                // Fetch order details using new API
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/orders/public/${orderId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const result = await response.json();

                if (result.success) {
                    setOrderDetails(result.data);
                    // Determine status based on payment status or URL params
                    if (paymentStatus === 'processing') {
                        setPaymentStatus(result.data.paymentStatus === 'completed' ? 'success' : 'failed');
                    }
                } else {
                    setPaymentStatus('error');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                setPaymentStatus('error');
            } finally {
                setLoading(false);
            }
        };

        checkPaymentStatus();
    }, [searchParams, stateOrder, stateSuccess, paymentStatus]);

    const handleContinueShopping = () => {
        navigate('/products');
    };    const handleViewOrder = () => {
        navigate('/account');
    };

    const getPaymentMethodName = () => {
        switch (paymentMethod) {
            case 'momo':
                return 'Ví điện tử MoMo';
            case 'cod':
                return 'Thanh toán khi nhận hàng';
            default:
                return 'Khác';
        }
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Đang xử lý thanh toán - Balan Coffee</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="min-h-screen flex items-center justify-center bg-cream-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                        <p className="text-coffee-700">Đang xử lý...</p>
                    </div>
                </div>
            </>
        );
    }

    const getStatusIcon = () => {
        switch (paymentStatus) {
            case 'success':
                return (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'failed':
                return (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                );
        }
    };    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success':
                return 'Thanh toán thành công!';
            case 'failed':
                return 'Thanh toán thất bại';
            default:
                return 'Đã xảy ra lỗi';
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'success':
                return 'Đơn hàng của bạn đã được thanh toán thành công. Chúng tôi sẽ xử lý và giao hàng trong thời gian sớm nhất.';
            case 'failed':
                return 'Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.';
            default:
                return 'Đã xảy ra lỗi trong quá trình xử lý thanh toán. Vui lòng liên hệ với chúng tôi để được hỗ trợ.';
        }
    };    return (
        <>
            <Helmet>
                <title>
                    {paymentStatus === 'success' ? 'Thanh toán thành công' : 
                     paymentStatus === 'failed' ? 'Thanh toán thất bại' : 'Kết quả thanh toán'} - Balan Coffee
                </title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            
            <div className="min-h-screen bg-cream-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
                        {getStatusIcon()}
                        
                        <h1 className="text-2xl font-bold text-center text-coffee-800 mb-4">
                            {getStatusTitle()}
                        </h1>
                        
                        <p className="text-center text-coffee-600 mb-6">
                            {getStatusMessage()}
                        </p>

                        {orderDetails && (
                            <div className="bg-cream-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-coffee-800 mb-2">Chi tiết đơn hàng</h3>
                                <div className="space-y-1 text-sm text-coffee-600">
                                    <p>
                                        <span className="font-medium">Mã đơn hàng:</span>{' '}
                                        {orderDetails.orderNumber || orderDetails.order_id || orderDetails.id}
                                    </p>
                                    <p>
                                        <span className="font-medium">Số tiền:</span>{' '}
                                        {(orderDetails.total || orderDetails.total_amount || 0).toLocaleString('vi-VN')}₫
                                    </p>
                                    {paymentMethod && (
                                        <p>
                                            <span className="font-medium">Phương thức:</span>{' '}
                                            {getPaymentMethodName()}
                                        </p>
                                    )}
                                    <p>
                                        <span className="font-medium">Trạng thái:</span>{' '}
                                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                            paymentStatus === 'success' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {paymentStatus === 'success' ? 'Đã thanh toán' : 
                                             paymentStatus === 'failed' ? 'Thất bại' : 'Đang xử lý'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {paymentStatus === 'success' && (
                                <button
                                    onClick={handleViewOrder}
                                    className="w-full bg-coffee-600 text-white py-3 px-4 rounded-lg hover:bg-coffee-700 transition duration-200 font-medium"
                                >
                                    Xem tài khoản
                                </button>
                            )}
                            
                            <button
                                onClick={handleContinueShopping}
                                className={`w-full py-3 px-4 rounded-lg transition duration-200 font-medium ${
                                    paymentStatus === 'success' 
                                        ? 'bg-cream-200 text-coffee-700 hover:bg-cream-300' 
                                        : 'bg-coffee-600 text-white hover:bg-coffee-700'
                                }`}
                            >
                                {paymentStatus === 'success' ? 'Tiếp tục mua sắm' : 'Quay lại sản phẩm'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentResult;

