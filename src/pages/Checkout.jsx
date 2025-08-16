import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentMethods from '../components/payment/PaymentMethods';

const Checkout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, getCartTotals } = useCart();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Billing Information
        billing: {
            firstName: user?.first_name || '',
            lastName: user?.last_name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'Vietnam'
        },
        // Shipping Information
        shipping: {
            sameAsBilling: true,
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            province: '',
            postalCode: '',
            country: 'Vietnam'
        },
        // Payment
        paymentMethod: '',
        notes: ''
    });    const [errors, setErrors] = useState({});

    const { subtotal, shipping, tax, total } = getCartTotals();

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);    const steps = [
        { number: 1, title: 'Thông tin thanh toán' },
        { number: 2, title: 'Thông tin giao hàng' },
        { number: 3, title: 'Phương thức thanh toán' }
    ];

    const vietnameseProvinces = [
        'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
        'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
        'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
        'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
        'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
        'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
        'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
        'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình',
        'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
        'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
        'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long',
        'Vĩnh Phúc', 'Yên Bái', 'Phú Yên', 'Cần Thơ', 'Đà Nẵng', 'Hải Phòng',
        'Hà Nội', 'TP Hồ Chí Minh'
    ];

    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
        
        // Clear error for this field
        const errorKey = `${section}.${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const handleSameAsBillingChange = (checked) => {
        setFormData(prev => ({
            ...prev,
            shipping: {
                ...prev.shipping,
                sameAsBilling: checked,
                ...(checked ? {
                    firstName: prev.billing.firstName,
                    lastName: prev.billing.lastName,
                    address: prev.billing.address,
                    city: prev.billing.city,
                    province: prev.billing.province,
                    postalCode: prev.billing.postalCode,
                    country: prev.billing.country
                } : {})
            }
        }));
    };

    const validateStep = (step) => {
        const newErrors = {};        if (step === 1) {
            // Validate billing information
            const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province'];
            required.forEach(field => {
                if (!formData.billing[field]) {
                    newErrors[`billing.${field}`] = 'Trường này là bắt buộc';
                }
            });
            
            if (formData.billing.email && !/\S+@\S+\.\S+/.test(formData.billing.email)) {
                newErrors['billing.email'] = 'Email không hợp lệ';
            }
        }

        if (step === 2 && !formData.shipping.sameAsBilling) {            // Validate shipping information
            const required = ['firstName', 'lastName', 'address', 'city', 'province'];
            required.forEach(field => {
                if (!formData.shipping[field]) {
                    newErrors[`shipping.${field}`] = 'Trường này là bắt buộc';
                }
            });
        }        if (step === 3) {
            if (!formData.paymentMethod) {
                newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
            }
        }

        return newErrors;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        setErrors({});
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
        setErrors({ payment: error.message || 'Thanh toán thất bại. Vui lòng thử lại.' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };    const createOrder = async () => {
        try {
            // Prepare customer info according to new API structure
            const customerInfo = {
                name: `${formData.billing.firstName} ${formData.billing.lastName}`.trim(),
                email: formData.billing.email,
                phone: formData.billing.phone,
                address: `${formData.billing.address}, ${formData.billing.city}, ${formData.billing.province}`.trim()
            };

            // Prepare items for new API
            const items = cartItems.map(item => ({
                productId: item.product_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price * 25000, // Convert to VND
                total: item.quantity * item.price * 25000
            }));

            const orderData = {
                customerInfo,
                items,
                total: Math.round(total), // Ensure integer for payment gateway
                paymentMethod: formData.paymentMethod || 'cod', // Default to COD
                notes: formData.notes || ''
            };

            console.log('Creating order with data:', orderData);

            // Call API to create order
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
            }

            console.log('Order created successfully:', result);
            return result;
        } catch (error) {
            console.error('Order creation failed:', error);
            throw error;
        }
    };

    if (cartItems.length === 0) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <Helmet>
                <title>Thanh toán - Balan Coffee</title>
                <meta name="description" content="Complete your coffee order securely with multiple payment options." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-brand-white">
                {/* Header */}
                <div className="bg-brand-primary text-white py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Thanh toán
                        </h1>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                                        currentStep >= step.number
                                            ? 'bg-brand-primary border-brand-primary text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                        {currentStep > step.number ? (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-sm font-semibold">{step.number}</span>
                                        )}
                                    </div>
                                    <span className={`ml-2 text-sm font-medium ${
                                        currentStep >= step.number ? 'text-brand-primary' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-0.5 ml-4 ${
                                            currentStep > step.number ? 'bg-brand-primary' : 'bg-gray-300'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {/* Step 1: Billing Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">                                        <h2 className="text-xl font-semibold text-brand-primary">
                                            Thông tin thanh toán
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Họ *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.firstName}
                                                    onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.firstName'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.firstName'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.firstName']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Tên *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.lastName}
                                                    onChange={(e) => handleInputChange('billing', 'lastName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.lastName'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.lastName'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.lastName']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.billing.email}
                                                    onChange={(e) => handleInputChange('billing', 'email', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.email'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.email'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.email']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Số điện thoại *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.billing.phone}
                                                    onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.phone'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.phone'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.phone']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>                                            <label className="block text-sm font-medium text-brand-primary mb-1">
                                                Địa chỉ *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.billing.address}
                                                onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                    errors['billing.address'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Street address"
                                            />
                                            {errors['billing.address'] && (
                                                <p className="mt-1 text-sm text-red-600">{errors['billing.address']}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Thành phố *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.city}
                                                    onChange={(e) => handleInputChange('billing', 'city', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.city'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.city'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.city']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Tỉnh/Thành phố *
                                                </label>
                                                <select
                                                    value={formData.billing.province}
                                                    onChange={(e) => handleInputChange('billing', 'province', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.province'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Select Province</option>
                                                    {vietnameseProvinces.map(province => (
                                                        <option key={province} value={province}>{province}</option>
                                                    ))}
                                                </select>
                                                {errors['billing.province'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.province']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                <label className="block text-sm font-medium text-brand-primary mb-1">
                                                    Mã bưu điện
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.postalCode}
                                                    onChange={(e) => handleInputChange('billing', 'postalCode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Shipping Information */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">                                        <h2 className="text-xl font-semibold text-brand-primary">
                                            Thông tin giao hàng
                                        </h2>
                                        
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.shipping.sameAsBilling}
                                                    onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                                                    className="h-4 w-4 text-gray-600 focus:ring-brand-primary border-gray-300 rounded"
                                                />                                                <span className="ml-2 text-sm text-brand-primary">
                                                    Giống như thông tin thanh toán
                                                </span>
                                            </label>
                                        </div>

                                        {!formData.shipping.sameAsBilling && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>                                                        <label className="block text-sm font-medium text-brand-primary mb-1">
                                                            Họ *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.firstName}
                                                            onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.firstName'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.firstName'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.firstName']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>                                                        <label className="block text-sm font-medium text-brand-primary mb-1">
                                                            Tên *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.lastName}
                                                            onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.lastName'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.lastName'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.lastName']}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>                                                    <label className="block text-sm font-medium text-brand-primary mb-1">
                                                        Địa chỉ *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.shipping.address}
                                                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                            errors['shipping.address'] ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Street address"
                                                    />
                                                    {errors['shipping.address'] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors['shipping.address']}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>                                                            <label className="block text-sm font-medium text-brand-primary mb-1">
                                                                Thành phố *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.shipping.city}
                                                            onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.city'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.city'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.city']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>                                                            <label className="block text-sm font-medium text-brand-primary mb-1">
                                                                Tỉnh/Thành phố *
                                                            </label>
                                                            <select
                                                                value={formData.shipping.province}
                                                            onChange={(e) => handleInputChange('shipping', 'province', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.province'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        >
                                                            <option value="">Select Province</option>
                                                            {vietnameseProvinces.map(province => (
                                                                <option key={province} value={province}>{province}</option>
                                                            ))}
                                                        </select>
                                                        {errors['shipping.province'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.province']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>                                                            <label className="block text-sm font-medium text-brand-primary mb-1">
                                                                Mã bưu điện
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.shipping.postalCode}
                                                            onChange={(e) => handleInputChange('shipping', 'postalCode', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-brand-primary mb-1">
                                                Order Notes (Optional)
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                                placeholder="Any special instructions for your order..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment Method */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">                                        <h2 className="text-xl font-semibold text-brand-primary">
                                            Phương thức thanh toán
                                        </h2>
                                        
                                        {errors.payment && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                                {errors.payment}
                                            </div>
                                        )}                                        <PaymentMethods
                                            orderData={createOrder}
                                            onPaymentError={handlePaymentError}
                                        />
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className="bg-gray-100 hover:bg-gray-200 text-brand-primary px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Quay lại
                                    </button>
                                    
                                    {currentStep < 3 && (
                                        <button
                                            onClick={handleNext}
                                            className="bg-brand-primary hover:bg-brand-primary text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Tiếp tục
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">                                <h3 className="text-xl font-semibold text-brand-primary mb-6">
                                    Tóm tắt đơn hàng
                                </h3>
                                
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.product_id} className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-brand-primary">{item.name}</h4>
                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                            </div>                                            <span className="text-sm font-semibold text-brand-primary">
                                                {formatCurrency(item.price * item.quantity * 25000)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                <hr className="my-4 border-gray-200" />
                                
                                <div className="space-y-2">                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-semibold text-brand-primary">{formatCurrency(subtotal)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-semibold text-brand-primary">
                                            {shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Thuế</span>
                                        <span className="font-semibold text-brand-primary">{formatCurrency(tax)}</span>
                                    </div>
                                    
                                    <hr className="border-gray-200" />
                                    
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold text-brand-primary">Tổng cộng</span>
                                        <span className="font-bold text-brand-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-sm text-brand-primary text-center">
                                        🔒 Giao dịch được bảo mật an toàn
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;

