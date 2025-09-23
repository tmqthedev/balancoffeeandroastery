import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../constants/cartConstants';

const PaymentMethods = ({ orderData, onPaymentError, selectedMethod: propSelectedMethod, onPaymentMethodSelect }) => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [internalSelectedMethod, setInternalSelectedMethod] = useState(propSelectedMethod || 'contact');
    const [loading, setLoading] = useState(false);

    // Use prop value if provided, otherwise use internal state
    const selectedMethod = propSelectedMethod !== undefined ? propSelectedMethod : internalSelectedMethod;

    const paymentMethods = [
        {
            id: 'contact',
            name: 'Liên hệ trực tiếp với chúng tôi để thanh toán trực tuyến',
            description: 'Chúng tôi sẽ hướng dẫn bạn thanh toán qua các phương thức an toàn',
            icon: '📞',
            color: 'bg-blue-500',
            popular: true
        },
        {
            id: 'cod',
            name: 'Thanh toán khi nhận hàng',
            description: 'Thanh toán bằng tiền mặt khi nhận hàng',
            icon: '💵',
            color: 'bg-green-500',
            popular: false
        }
    ];    const handlePaymentMethodChange = (methodId) => {
        if (propSelectedMethod !== undefined) {
            // Controlled component - use prop callback
            if (onPaymentMethodSelect) {
                onPaymentMethodSelect(methodId);
            }
        } else {
            // Uncontrolled component - use internal state
            setInternalSelectedMethod(methodId);
        }

        if (onPaymentMethodSelect) {
            onPaymentMethodSelect(methodId);
        }
    };

    const handleSubmitOrder = async () => {
        if (!selectedMethod) {
            onPaymentError({ message: 'Vui lòng chọn phương thức thanh toán' });
            return;
        }

        setLoading(true);
        
        try {
            // Call the orderData function to get order details
            const orderDetails = await orderData();
            
            // Add payment method to order
            const orderPayload = {
                ...orderDetails,
                paymentMethod: selectedMethod
            };

            console.log('=== ORDER PAYLOAD DEBUG ===');
            console.log('Order payload:', JSON.stringify(orderPayload, null, 2));

            // Create order via API
            const response = await fetch(`/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();
            console.log('=== ORDER RESPONSE DEBUG ===');
            console.log('Response status:', response.status);
            console.log('Response result:', result);

            if (!response.ok) {
                console.error('Order creation failed with details:', result);
                throw new Error(result.message || 'Không thể tạo đơn hàng');
            }

            console.log('Order created:', result);

            // Clear cart after successful order creation
            await clearCart();

            // Handle different payment methods
            if (selectedMethod === 'contact') {
                // Redirect to success page with contact information
                navigate('/payment/result', { 
                    state: { 
                        order: result.order,
                        paymentMethod: 'contact',
                        success: true,
                        message: 'Đơn hàng đã được tạo thành công. Chúng tôi sẽ liên hệ với bạn để hướng dẫn thanh toán.'
                    }
                });
            } else if (selectedMethod === 'cod') {
                // Redirect to success page for COD
                navigate('/payment/result', { 
                    state: { 
                        order: result.order,
                        paymentMethod: 'cod',
                        success: true
                    }
                });
            }

        } catch (error) {
            console.error('Order creation failed:', error);
            onPaymentError({ 
                message: error.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.' 
            });
        } finally {
            setLoading(false);
        }
    };    return (
        <div className="bg-white rounded-lg shadow-sm border border-cream-200 p-6">
            <h3 className="text-lg font-semibold text-brand-primary mb-4">
                Chọn phương thức thanh toán
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
                            onChange={(e) => handlePaymentMethodChange(e.target.value)}
                            className="sr-only"
                        />
                        <label
                            htmlFor={method.id}
                            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                selectedMethod === method.id
                                    ? 'border-brand-primary bg-brand-secondary/20'
                                    : 'border-cream-200 hover:border-cream-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <h4 className="font-medium text-brand-primary">{method.name}</h4>
                                        {method.popular && (
                                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                                Phổ biến
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-brand-primary">{method.description}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                    selectedMethod === method.id
                                        ? 'border-brand-primary bg-brand-primary'
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

            {/* Payment method details */}
            {selectedMethod === 'contact' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-blue-800 mb-1">Liên hệ để thanh toán</h4>
                            <p className="text-sm text-blue-700">
                                Sau khi đặt hàng, đội ngũ của chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ 
                                để hướng dẫn thanh toán qua các phương thức an toàn như chuyển khoản ngân hàng, 
                                ví điện tử hoặc các kênh thanh toán khác.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedMethod === 'cod' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-green-800 mb-1">Thanh toán khi nhận hàng</h4>
                            <p className="text-sm text-green-700">
                                Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng. 
                                Đơn hàng sẽ được xác nhận và giao đến địa chỉ của bạn.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment button */}
            <button
                onClick={handleSubmitOrder}
                disabled={!selectedMethod || loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
                    !selectedMethod || loading
                        ? 'bg-cream-300 text-cream-500 cursor-not-allowed'
                        : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                    </div>
                ) : (
                    selectedMethod === 'contact' ? 'Đặt hàng và liên hệ thanh toán' : 'Đặt hàng'
                )}
            </button>

            {/* Security notice */}
            <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-sm text-brand-primary">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Giao dịch được bảo mật bởi SSL
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
