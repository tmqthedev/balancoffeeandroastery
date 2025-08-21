import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const PaymentMethods = ({ orderData, onPaymentError, onPaymentMethodSelect }) => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [selectedMethod, setSelectedMethod] = useState('momo');
    const [loading, setLoading] = useState(false);

    const paymentMethods = [
        {
            id: 'momo',
            name: 'Ví điện tử MoMo',
            description: 'Thanh toán nhanh chóng qua ví MoMo',
            icon: '🪙',
            color: 'bg-pink-500',
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
        setSelectedMethod(methodId);
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

            // Create order via API
            const response = await fetch(`http://localhost:3000/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tạo đơn hàng');
            }

            console.log('Order created:', result);

            // Clear cart after successful order creation
            await clearCart();

            // Handle different payment methods
            if (selectedMethod === 'momo') {
                // Check if MoMo data is already included in order response
                if (result.order && result.order.momoData) {
                    // Redirect to MoMo payment page
                    if (result.order.momoData.payUrl) {
                        window.location.href = result.order.momoData.payUrl;
                    } else {
                        // For development mode, show QR code
                        navigate('/payment/momo', { 
                            state: { 
                                order: result.order,
                                momoData: result.order.momoData
                            }
                        });
                    }
                } else {
                    // Fallback - create separate MoMo payment request
                    console.warn('No MoMo data in order response, creating separate payment');
                    
                    const momoResponse = await fetch(`http://localhost:3000/api/payments/momo/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({
                            orderNumber: result.order.orderNumber,
                            total: result.order.total,
                            customerInfo: result.order.customerInfo,
                            items: result.order.items
                        })
                    });

                    const momoResult = await momoResponse.json();

                    if (!momoResponse.ok) {
                        throw new Error(momoResult.message || 'Không thể tạo thanh toán MoMo');
                    }

                    // Redirect to MoMo payment page
                    if (momoResult.data.payUrl) {
                        window.location.href = momoResult.data.payUrl;
                    } else {
                        navigate('/payment/momo', { 
                            state: { 
                                order: result.order,
                                momoData: momoResult.data
                            }
                        });
                    }
                }
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
            <h3 className="text-lg font-semibold text-coffee-800 mb-4">
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
                                    ? 'border-coffee-500 bg-coffee-50'
                                    : 'border-cream-200 hover:border-cream-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                                    {method.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <h4 className="font-medium text-coffee-800">{method.name}</h4>
                                        {method.popular && (
                                            <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                                                Phổ biến
                                            </span>
                                        )}
                                    </div>
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

            {/* Payment method details */}
            {selectedMethod === 'momo' && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-pink-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-pink-800 mb-1">Thanh toán MoMo</h4>
                            <p className="text-sm text-pink-700">
                                Sau khi đặt hàng, bạn sẽ được chuyển đến trang thanh toán MoMo. 
                                Sử dụng ứng dụng MoMo hoặc quét mã QR để hoàn tất thanh toán.
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
                        : 'bg-coffee-600 text-white hover:bg-coffee-700'
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                    </div>
                ) : (
                    selectedMethod === 'momo' ? 'Thanh toán qua MoMo' : 'Đặt hàng'
                )}
            </button>

            {/* Security notice */}
            <div className="mt-4 text-center">
                <div className="flex items-center justify-center text-sm text-coffee-600">
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
