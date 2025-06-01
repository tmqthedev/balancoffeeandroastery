import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const PaymentMethods = ({ orderData, onPaymentError }) => {
    const { t } = useTranslation();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [loading, setLoading] = useState(false);

    const paymentMethods = [
        {
            id: 'momo',
            name: 'MoMo',
            description: t('payment.methods.momo.description'),
            icon: '💳',
            color: 'bg-pink-500'
        },
        {
            id: 'vnpay',
            name: 'VNPay',
            description: t('payment.methods.vnpay.description'),
            icon: '🏦',
            color: 'bg-blue-500'
        }
    ];

    const vnpayBanks = [
        { code: '', name: t('payment.vnpay.allBanks') },
        { code: 'VNPAYQR', name: 'VNPay QR' },
        { code: 'VNBANK', name: 'Ngân hàng nội địa' },
        { code: 'INTCARD', name: 'Thẻ quốc tế' },
        { code: 'VIETCOMBANK', name: 'Vietcombank' },
        { code: 'VIETINBANK', name: 'VietinBank' },
        { code: 'BIDV', name: 'BIDV' },
        { code: 'AGRIBANK', name: 'Agribank' },
        { code: 'TCB', name: 'Techcombank' },
        { code: 'ACB', name: 'ACB' },
        { code: 'MB', name: 'MB Bank' },
        { code: 'SACOMBANK', name: 'Sacombank' },
        { code: 'TPB', name: 'TPBank' },
        { code: 'VIB', name: 'VIB' },
        { code: 'MSBANK', name: 'MSB' },
        { code: 'HDBANK', name: 'HDBank' }
    ];

    const handlePayment = async () => {
        if (!selectedMethod) {
            onPaymentError(t('payment.errors.selectMethod'));
            return;
        }

        setLoading(true);
        
        try {
            const token = localStorage.getItem('authToken');
            const paymentData = {
                orderId: orderData.orderId,
                amount: orderData.totalAmount,
                orderInfo: `Thanh toán đơn hàng ${orderData.orderId} - Balan Coffee & Roastery`,
                bankCode: selectedMethod === 'vnpay' ? selectedBank : undefined
            };

            const response = await axios.post(
                `/api/payments/${selectedMethod}/create`,
                paymentData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                // Redirect to payment gateway
                window.location.href = response.data.payUrl;
            } else {
                onPaymentError(response.data.message || t('payment.errors.createFailed'));
            }
        } catch (error) {
            console.error('Payment error:', error);
            onPaymentError(error.response?.data?.message || t('payment.errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
            <h3 className="text-lg font-semibold text-coffee-800 mb-4">
                {t('payment.selectMethod')}
            </h3>

            <div className="space-y-4 mb-6">
                {paymentMethods.map((method) => (
                    <div key={method.id} className="relative">
                        <input
                            type="radio"
                            id={method.id}
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={(e) => setSelectedMethod(e.target.value)}
                            className="sr-only"
                        />
                        <label
                            htmlFor={method.id}
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedMethod === method.id
                                    ? 'border-coffee-500 bg-coffee-50'
                                    : 'border-cream-200 hover:border-cream-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-coffee-800">{method.name}</h4>
                                    <p className="text-sm text-coffee-600">{method.description}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                    selectedMethod === method.id
                                        ? 'border-coffee-500 bg-coffee-500'
                                        : 'border-cream-300'
                                }`}>
                                    {selectedMethod === method.id && (
                                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            {/* VNPay bank selection */}
            {selectedMethod === 'vnpay' && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                        {t('payment.vnpay.selectBank')}
                    </label>
                    <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                    >
                        {vnpayBanks.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                                {bank.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Order summary */}
            <div className="bg-cream-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-coffee-800 mb-3">{t('payment.orderSummary')}</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-coffee-600">{t('payment.orderId')}:</span>
                        <span className="font-medium text-coffee-800">{orderData.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-coffee-600">{t('payment.subtotal')}:</span>
                        <span className="text-coffee-800">{orderData.subtotal?.toLocaleString('vi-VN')} VND</span>
                    </div>
                    {orderData.shippingFee > 0 && (
                        <div className="flex justify-between">
                            <span className="text-coffee-600">{t('payment.shipping')}:</span>
                            <span className="text-coffee-800">{orderData.shippingFee.toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    {orderData.discount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-coffee-600">{t('payment.discount')}:</span>
                            <span className="text-green-600">-{orderData.discount.toLocaleString('vi-VN')} VND</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-cream-200">
                        <span className="text-coffee-800">{t('payment.total')}:</span>
                        <span className="text-coffee-800">{orderData.totalAmount.toLocaleString('vi-VN')} VND</span>
                    </div>
                </div>
            </div>

            {/* Payment button */}
            <button
                onClick={handlePayment}
                disabled={!selectedMethod || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
                    !selectedMethod || loading
                        ? 'bg-cream-300 text-cream-500 cursor-not-allowed'
                        : 'bg-coffee-600 text-white hover:bg-coffee-700'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('payment.processing')}
                    </div>
                ) : (
                    t('payment.proceedToPayment')
                )}
            </button>

            {/* Security notice */}
            <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-sm text-coffee-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('payment.securityNotice')}
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
