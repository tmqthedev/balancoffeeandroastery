import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const PaymentResult = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [paymentStatus, setPaymentStatus] = useState('processing');
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                // Get order ID from URL params or search params
                const orderId = searchParams.get('orderId') || searchParams.get('vnp_TxnRef');
                
                if (!orderId) {
                    setPaymentStatus('error');
                    setLoading(false);
                    return;
                }

                // For VNPay, handle the return URL directly
                if (searchParams.get('vnp_ResponseCode')) {
                    const responseCode = searchParams.get('vnp_ResponseCode');
                    if (responseCode === '00') {
                        setPaymentStatus('success');
                    } else {
                        setPaymentStatus('failed');
                    }
                }

                // Fetch order details
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`/api/payments/status/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setOrderDetails(response.data.order);
                    setPaymentStatus(response.data.order.payment_status === 'completed' ? 'success' : 'failed');
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
    }, [searchParams]);

    const handleContinueShopping = () => {
        navigate('/products');
    };

    const handleViewOrder = () => {
        if (orderDetails) {
            navigate(`/account/orders/${orderDetails.order_id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600 mx-auto mb-4"></div>
                    <p className="text-coffee-700">{t('payment.processing')}</p>
                </div>
            </div>
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
    };

    const getStatusTitle = () => {
        switch (paymentStatus) {
            case 'success':
                return t('payment.success.title');
            case 'failed':
                return t('payment.failed.title');
            default:
                return t('payment.error.title');
        }
    };

    const getStatusMessage = () => {
        switch (paymentStatus) {
            case 'success':
                return t('payment.success.message');
            case 'failed':
                return t('payment.failed.message');
            default:
                return t('payment.error.message');
        }
    };

    return (
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
                            <h3 className="font-semibold text-coffee-800 mb-2">{t('payment.orderDetails')}</h3>
                            <div className="space-y-1 text-sm text-coffee-600">
                                <p><span className="font-medium">{t('payment.orderId')}:</span> {orderDetails.order_id}</p>
                                <p><span className="font-medium">{t('payment.amount')}:</span> {orderDetails.total_amount?.toLocaleString('vi-VN')} VND</p>
                                <p><span className="font-medium">{t('payment.status')}:</span> 
                                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                                        orderDetails.payment_status === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {t(`payment.status.${orderDetails.payment_status}`)}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        {paymentStatus === 'success' && orderDetails && (
                            <button
                                onClick={handleViewOrder}
                                className="w-full bg-coffee-600 text-white py-3 px-4 rounded-lg hover:bg-coffee-700 transition duration-200 font-medium"
                            >
                                {t('payment.viewOrder')}
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
                            {paymentStatus === 'success' ? t('payment.continueShopping') : t('payment.backToProducts')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;
