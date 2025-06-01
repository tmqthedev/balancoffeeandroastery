import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentMethods from '../components/payment/PaymentMethods';

const Checkout = () => {
    const { t } = useTranslation();
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
    }, [cartItems, navigate]);

    const steps = [
        { number: 1, title: t('checkout.billingInfo') },
        { number: 2, title: t('checkout.shippingInfo') },
        { number: 3, title: t('checkout.paymentMethod') }
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
        const newErrors = {};

        if (step === 1) {
            // Validate billing information
            const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province'];
            required.forEach(field => {
                if (!formData.billing[field]) {
                    newErrors[`billing.${field}`] = t('auth.errors.required');
                }
            });
            
            if (formData.billing.email && !/\S+@\S+\.\S+/.test(formData.billing.email)) {
                newErrors['billing.email'] = t('auth.errors.invalidEmail');
            }
        }

        if (step === 2 && !formData.shipping.sameAsBilling) {
            // Validate shipping information
            const required = ['firstName', 'lastName', 'address', 'city', 'province'];
            required.forEach(field => {
                if (!formData.shipping[field]) {
                    newErrors[`shipping.${field}`] = t('auth.errors.required');
                }
            });
        }

        if (step === 3) {
            if (!formData.paymentMethod) {
                newErrors.paymentMethod = t('payment.errors.selectMethod');
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
        setErrors({ payment: error.message || 'Payment failed' });
    };const createOrder = async () => {
        const orderData = {
            items: cartItems.map(item => ({
                productId: item.product_id,
                quantity: item.quantity,
                price: item.price
            })),
            billing: formData.billing,
            shipping: formData.shipping.sameAsBilling ? formData.billing : formData.shipping,
            subtotal,
            shippingFee: shipping,
            tax,
            total,
            notes: formData.notes
        };

        return orderData;
    };

    if (cartItems.length === 0) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <Helmet>
                <title>{t('checkout.title')} - Balan Coffee</title>
                <meta name="description" content="Complete your coffee order securely with multiple payment options." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-cream-50">
                {/* Header */}
                <div className="bg-coffee-800 text-white py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl md:text-4xl font-bold">
                            {t('checkout.title')}
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
                                            ? 'bg-coffee-600 border-coffee-600 text-white'
                                            : 'border-coffee-300 text-coffee-400'
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
                                        currentStep >= step.number ? 'text-coffee-800' : 'text-coffee-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-0.5 ml-4 ${
                                            currentStep > step.number ? 'bg-coffee-600' : 'bg-coffee-300'
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
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold text-coffee-800">
                                            {t('checkout.billingInfo')}
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.firstName')} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.firstName}
                                                    onChange={(e) => handleInputChange('billing', 'firstName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.firstName'] ? 'border-red-300' : 'border-coffee-300'
                                                    }`}
                                                />
                                                {errors['billing.firstName'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.firstName']}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.lastName')} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.lastName}
                                                    onChange={(e) => handleInputChange('billing', 'lastName', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.lastName'] ? 'border-red-300' : 'border-coffee-300'
                                                    }`}
                                                />
                                                {errors['billing.lastName'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.lastName']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.email')} *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.billing.email}
                                                    onChange={(e) => handleInputChange('billing', 'email', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.email'] ? 'border-red-300' : 'border-coffee-300'
                                                    }`}
                                                />
                                                {errors['billing.email'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.email']}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.phone')} *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.billing.phone}
                                                    onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.phone'] ? 'border-red-300' : 'border-coffee-300'
                                                    }`}
                                                />
                                                {errors['billing.phone'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.phone']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                {t('checkout.address')} *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.billing.address}
                                                onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                    errors['billing.address'] ? 'border-red-300' : 'border-coffee-300'
                                                }`}
                                                placeholder="Street address"
                                            />
                                            {errors['billing.address'] && (
                                                <p className="mt-1 text-sm text-red-600">{errors['billing.address']}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.city')} *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.city}
                                                    onChange={(e) => handleInputChange('billing', 'city', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.city'] ? 'border-red-300' : 'border-coffee-300'
                                                    }`}
                                                />
                                                {errors['billing.city'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.city']}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.province')} *
                                                </label>
                                                <select
                                                    value={formData.billing.province}
                                                    onChange={(e) => handleInputChange('billing', 'province', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                        errors['billing.province'] ? 'border-red-300' : 'border-coffee-300'
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
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                    {t('checkout.postalCode')}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.billing.postalCode}
                                                    onChange={(e) => handleInputChange('billing', 'postalCode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Shipping Information */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold text-coffee-800">
                                            {t('checkout.shippingInfo')}
                                        </h2>
                                        
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.shipping.sameAsBilling}
                                                    onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                                                    className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-coffee-300 rounded"
                                                />
                                                <span className="ml-2 text-sm text-coffee-700">
                                                    {t('checkout.sameAsBilling')}
                                                </span>
                                            </label>
                                        </div>

                                        {!formData.shipping.sameAsBilling && (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                            {t('checkout.firstName')} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.firstName}
                                                            onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                                errors['shipping.firstName'] ? 'border-red-300' : 'border-coffee-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.firstName'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.firstName']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                            {t('checkout.lastName')} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.lastName}
                                                            onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                                errors['shipping.lastName'] ? 'border-red-300' : 'border-coffee-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.lastName'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.lastName']}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                        {t('checkout.address')} *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.shipping.address}
                                                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                            errors['shipping.address'] ? 'border-red-300' : 'border-coffee-300'
                                                        }`}
                                                        placeholder="Street address"
                                                    />
                                                    {errors['shipping.address'] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors['shipping.address']}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                            {t('checkout.city')} *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.city}
                                                            onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                                errors['shipping.city'] ? 'border-red-300' : 'border-coffee-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.city'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.city']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                            {t('checkout.province')} *
                                                        </label>
                                                        <select
                                                            value={formData.shipping.province}
                                                            onChange={(e) => handleInputChange('shipping', 'province', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                                errors['shipping.province'] ? 'border-red-300' : 'border-coffee-300'
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
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                            {t('checkout.postalCode')}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.shipping.postalCode}
                                                            onChange={(e) => handleInputChange('shipping', 'postalCode', e.target.value)}
                                                            className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-coffee-700 mb-1">
                                                Order Notes (Optional)
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                                placeholder="Any special instructions for your order..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment Method */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold text-coffee-800">
                                            {t('checkout.paymentMethod')}
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
                                <div className="flex justify-between mt-8 pt-6 border-t border-coffee-200">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {t('common.previous')}
                                    </button>
                                    
                                    {currentStep < 3 && (
                                        <button
                                            onClick={handleNext}
                                            className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            {t('common.next')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h3 className="text-xl font-semibold text-coffee-800 mb-6">
                                    {t('checkout.orderSummary')}
                                </h3>
                                
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.product_id} className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-coffee-800">{item.name}</h4>
                                                <p className="text-sm text-coffee-600">Qty: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-coffee-800">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                <hr className="my-4 border-coffee-200" />
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">{t('cart.subtotal')}</span>
                                        <span className="font-semibold text-coffee-800">${subtotal.toFixed(2)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">{t('cart.shipping')}</span>
                                        <span className="font-semibold text-coffee-800">
                                            {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-coffee-600">{t('cart.tax')}</span>
                                        <span className="font-semibold text-coffee-800">${tax.toFixed(2)}</span>
                                    </div>
                                    
                                    <hr className="border-coffee-200" />
                                    
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold text-coffee-800">{t('cart.total')}</span>
                                        <span className="font-bold text-coffee-800">${total.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-3 bg-coffee-50 border border-coffee-200 rounded-lg">
                                    <p className="text-sm text-coffee-700 text-center">
                                        🔒 {t('payment.securityNotice')}
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
