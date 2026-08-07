import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ContextConsumer from '../components/common/ContextConsumer';
import PaymentMethods from '../components/payment/PaymentMethods';

const CheckoutContent = ({ auth, cart }) => {
    const navigate = useNavigate();
    const { user, refreshUser } = auth;
    const { cartItems, getCartTotals } = cart;
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Billing Information
        billing: {
            fullName: user?.fullName || user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: user?.addresses?.find(addr => addr.isDefault)?.street || user?.addresses?.[0]?.street || '',
            wardCommune: user?.addresses?.find(addr => addr.isDefault)?.wardCommune || user?.addresses?.[0]?.wardCommune || '',
            district: user?.addresses?.find(addr => addr.isDefault)?.district || user?.addresses?.[0]?.district || '',
            province: user?.addresses?.find(addr => addr.isDefault)?.province || user?.addresses?.[0]?.province || '',
            postalCode: user?.addresses?.find(addr => addr.isDefault)?.postalCode || user?.addresses?.[0]?.postalCode || '',
            country: 'Vietnam'
        },
        // Shipping Information
        shipping: {
            sameAsBilling: true,
            fullName: '',
            address: '',
            wardCommune: '',
            district: '',
            province: '',
            postalCode: '',
            country: 'Vietnam'
        },
        // Payment
        paymentMethod: '',
        notes: ''
    });    const [errors, setErrors] = useState({});

    const { subtotal, total } = getCartTotals();

    // Define validateStep before useEffect that uses it
    const validateStep = useCallback((step) => {
        const newErrors = {};

        if (step === 1) {
            // Validate billing information
            const required = ['fullName', 'email', 'phone', 'address', 'wardCommune', 'district', 'province'];

            required.forEach(field => {
                const value = formData.billing[field];
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    const fieldLabels = {
                        fullName: 'Họ và tên',
                        email: 'Email',
                        phone: 'Số điện thoại',
                        address: 'Địa chỉ',
                        wardCommune: 'Phường/Xã',
                        district: 'Quận/Huyện',
                        province: 'Tỉnh/Thành phố'
                    };
                    newErrors[`billing.${field}`] = `${fieldLabels[field]} không được để trống`;
                }
            });

            // Email validation
            if (formData.billing.email && formData.billing.email.trim()) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.billing.email)) {
                    newErrors['billing.email'] = 'Vui lòng nhập địa chỉ email hợp lệ (vd: example@email.com)';
                }
            }

            // Phone validation
            if (formData.billing.phone && formData.billing.phone.trim()) {
                const phoneRegex = /^[0-9]{10,11}$/;
                const cleanPhone = formData.billing.phone.replace(/\s/g, '');
                if (!phoneRegex.test(cleanPhone)) {
                    newErrors['billing.phone'] = 'Số điện thoại phải có 10-11 chữ số (vd: 0123456789)';
                }
            }

            // Full name validation
            if (formData.billing.fullName && formData.billing.fullName.trim().length < 2) {
                newErrors['billing.fullName'] = 'Họ và tên phải có ít nhất 2 ký tự';
            }

            // Address validation
            if (formData.billing.address && formData.billing.address.trim().length < 5) {
                newErrors['billing.address'] = 'Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 5 ký tự)';
            }

            // Postal code validation (if provided)
            if (formData.billing.postalCode && formData.billing.postalCode.trim()) {
                const postalRegex = /^[0-9]{5,6}$/;
                if (!postalRegex.test(formData.billing.postalCode.trim())) {
                    newErrors['billing.postalCode'] = 'Mã bưu điện phải có 5-6 chữ số';
                }
            }
        }

        if (step === 2 && !formData.shipping.sameAsBilling) {
            // Validate shipping information
            const required = ['fullName', 'address', 'wardCommune', 'district', 'province'];
            required.forEach(field => {
                if (!formData.shipping[field] || formData.shipping[field].trim() === '') {
                    const fieldLabels = {
                        fullName: 'Họ và tên',
                        address: 'Địa chỉ',
                        wardCommune: 'Phường/Xã',
                        district: 'Quận/Huyện',
                        province: 'Tỉnh/Thành phố'
                    };
                    newErrors[`shipping.${field}`] = `${fieldLabels[field]} không được để trống`;
                }
            });

            // Full name validation for shipping
            if (formData.shipping.fullName && formData.shipping.fullName.trim().length < 2) {
                newErrors['shipping.fullName'] = 'Họ và tên phải có ít nhất 2 ký tự';
            }

            // Address validation for shipping
            if (formData.shipping.address && formData.shipping.address.trim().length < 5) {
                newErrors['shipping.address'] = 'Vui lòng nhập địa chỉ chi tiết hơn (ít nhất 5 ký tự)';
            }

            // Postal code validation for shipping (if provided)
            if (formData.shipping.postalCode && formData.shipping.postalCode.trim()) {
                const postalRegex = /^[0-9]{5,6}$/;
                if (!postalRegex.test(formData.shipping.postalCode.trim())) {
                    newErrors['shipping.postalCode'] = 'Mã bưu điện phải có 5-6 chữ số';
                }
            }
        }

        if (step === 3) {
            if (!formData.paymentMethod) {
                newErrors.paymentMethod = 'Vui lòng chọn phương thức thanh toán để tiếp tục';
            }
        }

        return newErrors;
    }, [formData]);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    // Refresh user data on mount to get latest info
    useEffect(() => {
        if (user && refreshUser) {
            // Refresh user data to ensure we have the latest information
            refreshUser();
        }
    }, [refreshUser]);

    // Real-time validation effect
    useEffect(() => {
        const stepErrors = validateStep(currentStep);
        setErrors(stepErrors);
    }, [formData, currentStep, validateStep]);

    const steps = [
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

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }

        setErrors({});
        setCurrentStep(prev => Math.min(prev + 1, 3));
    };

    // Check if current step has any validation errors in real-time
    const hasCurrentStepErrors = () => {
        return Object.keys(errors).some(errorKey => {
            if (currentStep === 1) {
                return errorKey.startsWith('billing.');
            } else if (currentStep === 2) {
                return errorKey.startsWith('shipping.');
            } else if (currentStep === 3) {
                return errorKey === 'paymentMethod';
            }
            return false;
        });
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Handle input changes for form fields
    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));

        // Clear field-specific error immediately when user starts typing
        if (errors[`${section}.${field}`]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[`${section}.${field}`];
                return newErrors;
            });
        }
    };

    // Handle same as billing checkbox
    const handleSameAsBillingChange = (checked) => {
        setFormData(prev => ({
            ...prev,
            shipping: {
                ...prev.shipping,
                sameAsBilling: checked,
                ...(checked ? {
                    fullName: prev.billing.fullName,
                    address: prev.billing.address,
                    wardCommune: prev.billing.wardCommune,
                    district: prev.billing.district,
                    province: prev.billing.province,
                    postalCode: prev.billing.postalCode
                } : {})
            }
        }));

        // Clear shipping errors when copying from billing
        if (checked) {
            setErrors(prev => {
                const newErrors = { ...prev };
                Object.keys(newErrors).forEach(key => {
                    if (key.startsWith('shipping.')) {
                        delete newErrors[key];
                    }
                });
                return newErrors;
            });
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Handle payment method selection
    const handlePaymentMethodChange = (method) => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: method
        }));

        // Clear payment method error
        if (errors.paymentMethod) {
            setErrors(prev => ({ ...prev, paymentMethod: '' }));
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment failed:', error);
        setErrors({ payment: error.message || 'Thanh toán thất bại. Vui lòng thử lại.' });
    };

    // Function to save address to user account
    const saveAddressToAccount = useCallback(async () => {
        try {
            const addressData = {
                fullName: formData.billing.fullName,
                address1: formData.billing.address,
                street: formData.billing.address,
                wardCommune: formData.billing.wardCommune,
                district: formData.billing.district,
                province: formData.billing.province,
                postalCode: formData.billing.postalCode,
                country: 'VN',
                phone: formData.billing.phone,
                type: 'both',
                isDefault: !user.addresses || user.addresses.length === 0 // Set as default if no existing addresses
            };

            const response = await fetch('/api/users/addresses', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to save address:', error);
            } else {
                console.log('Address saved successfully to user account');
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    }, [formData, user]); // Added dependencies for useCallback

    const createOrder = useCallback(async () => {
        try {
            // Save address to account if requested
            if (user && formData.saveToAccount) {
                await saveAddressToAccount();
            }

            // Split full name into first and last name for backend compatibility
            const splitFullName = (fullName) => {
                if (!fullName || !fullName.trim()) return { firstName: '', lastName: '' };
                
                const nameParts = fullName.trim().split(' ');
                if (nameParts.length === 1) {
                    return { firstName: nameParts[0], lastName: '' };
                } else {
                    const firstName = nameParts[nameParts.length - 1]; // Last part is given name
                    const lastName = nameParts.slice(0, -1).join(' '); // Rest is family/middle name
                    return { firstName, lastName };
                }
            };

            const billingNameParts = splitFullName(formData.billing.fullName);

            // Prepare customer info according to new API structure
            const customerInfo = {
                firstName: billingNameParts.firstName,
                lastName: billingNameParts.lastName,
                fullName: formData.billing.fullName, // Add fullName for backend compatibility
                email: formData.billing.email,
                phone: formData.billing.phone
            };

            // Prepare items for new API
            const items = cartItems.map(item => {
                // Merge product name with weight variant
                let productName = item.name;
                if (item.variant?.weight) {
                    productName = `${item.name} (${item.variant.weight})`;
                }
                
                return {
                    productId: item.product_id,
                    productName: productName,
                    price: item.price,
                    quantity: item.quantity,
                    subtotal: item.quantity * item.price,
                    variant: item.variant // Keep variant data for reference
                };
            });

            const orderData = {
                customerInfo,
                shippingAddress: {
                    street: formData.billing.address,
                    wardCommune: formData.billing.wardCommune || '',
                    district: formData.billing.district || '',
                    province: formData.billing.province,
                    postalCode: formData.billing.postalCode || '',
                    country: 'Vi\u1ec7t Nam'
                },
                items,
                subtotal: Math.round(total),
                total: Math.round(total), // Ensure integer for payment gateway
                notes: formData.notes || ''
            };

            console.log('Preparing order data:', orderData);
            return orderData;
        } catch (error) {
            console.error('Order preparation failed:', error);
            throw error;
        }
    }, [user, formData, cartItems, total, saveAddressToAccount]); // Added saveAddressToAccount dependency

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

                <div className="container mx-auto px-4 py-6 sm:py-8">
                    {/* Progress Steps - Responsive */}
                    <div className="mb-6 sm:mb-8">
                        {/* Desktop Progress */}
                        <div className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 ${
                                        currentStep >= step.number
                                            ? 'bg-brand-primary border-brand-primary text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                        {currentStep > step.number ? (
                                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <span className="text-sm lg:text-base font-semibold">{step.number}</span>
                                        )}
                                    </div>
                                    <span className={`ml-2 lg:ml-3 text-sm lg:text-base font-medium ${
                                        currentStep >= step.number ? 'text-brand-primary' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 lg:w-16 h-0.5 ml-3 lg:ml-4 ${
                                            currentStep > step.number ? 'bg-brand-primary' : 'bg-gray-300'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile Progress - Vertical */}
                        <div className="md:hidden space-y-3">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-start">
                                    <div className="flex flex-col items-center mr-3">
                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                                            currentStep >= step.number
                                                ? 'bg-brand-primary border-brand-primary text-white'
                                                : 'border-gray-300 text-gray-400'
                                        }`}>
                                            {currentStep > step.number ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs font-semibold">{step.number}</span>
                                            )}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-0.5 h-8 mt-1 ${
                                                currentStep > step.number ? 'bg-brand-primary' : 'bg-gray-300'
                                            }`} />
                                        )}
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <span className={`text-sm font-medium block ${
                                            currentStep >= step.number ? 'text-brand-primary' : 'text-gray-400'
                                        }`}>
                                            {step.title}
                                        </span>
                                        {currentStep === step.number && (
                                            <span className="text-xs text-gray-500 mt-1 block">Đang thực hiện</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
                                {/* Step 1: Billing Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-4 sm:space-y-6">
                                        {/* Validation Status */}
                                        <div className={`p-3 sm:p-4 rounded-lg border ${
                                            hasCurrentStepErrors()
                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                : 'bg-green-50 border-green-200 text-green-700'
                                        }`}>
                                            <div className="flex items-start sm:items-center">
                                                <svg className={`w-5 h-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0 ${
                                                    hasCurrentStepErrors() ? 'text-red-500' : 'text-green-500'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {hasCurrentStepErrors() ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {hasCurrentStepErrors()
                                                        ? 'Vui lòng kiểm tra và điền đầy đủ thông tin bên dưới'
                                                        : 'Tuyệt vời! Thông tin thanh toán đã được điền đầy đủ'
                                                    }
                                                </span>
                                            </div>

                                            {/* Detailed error messages */}
                                            {hasCurrentStepErrors() && (
                                                <div className="mt-3 pt-3 border-t border-red-200">
                                                    <p className="text-xs font-medium text-red-700 mb-2">
                                                        Các trường cần điền:
                                                    </p>
                                                    <ul className="text-xs text-red-600 space-y-1">
                                                        {Object.entries(errors).map(([key, error]) => (
                                                            <li key={key} className="flex items-start">
                                                                <span className="text-red-500 mr-1">•</span>
                                                                <span>{error}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                                        💡 Mẹo: Hãy điền đầy đủ thông tin để có thể tiếp tục đặt hàng
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-lg sm:text-xl font-semibold text-brand-primary">
                                            Thông tin thanh toán
                                        </h2>
                                        
                                        {user && user.addresses && user.addresses.length > 0 && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                                <h3 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">
                                                    Sử dụng địa chỉ đã lưu
                                                </h3>
                                                <select
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            const selectedAddress = user.addresses.find(addr => addr._id === e.target.value);
                                                            if (selectedAddress) {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    billing: {
                                                                        ...prev.billing,
                                                                        fullName: selectedAddress.fullName || `${selectedAddress.firstName || ''} ${selectedAddress.lastName || ''}`.trim() || prev.billing.fullName,
                                                                        phone: selectedAddress.phone || prev.billing.phone,
                                                                        address: selectedAddress.street || selectedAddress.address1 || prev.billing.address,
                                                                        wardCommune: selectedAddress.wardCommune || prev.billing.wardCommune,
                                                                        district: selectedAddress.district || prev.billing.district,
                                                                        province: selectedAddress.province || prev.billing.province,
                                                                        postalCode: selectedAddress.postalCode || prev.billing.postalCode,
                                                                    }
                                                                }));
                                                            }
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2.5 sm:py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                >
                                                    <option value="">Chọn địa chỉ đã lưu...</option>
                                                    {user.addresses.map(address => (
                                                        <option key={address._id} value={address._id}>
                                                            {`${address.fullName || `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'N/A'} - ${address.address1 || address.street}, ${address.city || address.district}, ${address.province}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {user && (
                                            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg">
                                                <div className="flex items-start sm:items-center">
                                                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs sm:text-sm">
                                                        Thông tin được tự động điền từ tài khoản của bạn. Bạn có thể chỉnh sửa nếu cần.
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div>
                                            <label htmlFor="billing-fullName" className="block text-sm font-medium text-brand-primary mb-1.5 sm:mb-1">
                                                Họ và tên *
                                            </label>
                                            <input
                                                id="billing-fullName"
                                                type="text"
                                                value={formData.billing.fullName}
                                                onChange={(e) => handleInputChange('billing', 'fullName', e.target.value)}
                                                className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-base sm:text-sm ${
                                                    errors['billing.fullName'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Ví dụ: Nguyễn Văn A"
                                            />
                                            {errors['billing.fullName'] && (
                                                <p className="mt-1.5 sm:mt-1 text-xs sm:text-sm text-red-600">{errors['billing.fullName']}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="billing-email" className="block text-sm font-medium text-brand-primary mb-1.5 sm:mb-1">
                                                    Email *
                                                </label>
                                                <input
                                                    id="billing-email"
                                                    type="email"
                                                    value={formData.billing.email}
                                                    onChange={(e) => handleInputChange('billing', 'email', e.target.value)}
                                                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-base sm:text-sm ${
                                                        errors['billing.email'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.email'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.email']}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="billing-phone" className="block text-sm font-medium text-brand-primary mb-1">
                                                    Số điện thoại *
                                                </label>
                                                <input
                                                    id="billing-phone"
                                                    type="tel"
                                                    value={formData.billing.phone}
                                                    onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.phone'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="0123456789 (10-11 chữ số)"
                                                />
                                                {errors['billing.phone'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.phone']}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="billing-address" className="block text-sm font-medium text-brand-primary mb-1">
                                                Địa chỉ *
                                            </label>
                                            <input
                                                id="billing-address"
                                                type="text"
                                                value={formData.billing.address}
                                                onChange={(e) => handleInputChange('billing', 'address', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                    errors['billing.address'] ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Số nhà, tên đường"
                                            />
                                            {errors['billing.address'] && (
                                                <p className="mt-1 text-sm text-red-600">{errors['billing.address']}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label htmlFor="billing-wardCommune" className="block text-sm font-medium text-brand-primary mb-1">
                                                    Phường/Xã *
                                                </label>
                                                <input
                                                    id="billing-wardCommune"
                                                    type="text"
                                                    value={formData.billing.wardCommune || ''}
                                                    onChange={(e) => handleInputChange('billing', 'wardCommune', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.wardCommune'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.wardCommune'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.wardCommune']}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="billing-district" className="block text-sm font-medium text-brand-primary mb-1">
                                                    Quận/Huyện *
                                                </label>
                                                <input
                                                    id="billing-district"
                                                    type="text"
                                                    value={formData.billing.district || ''}
                                                    onChange={(e) => handleInputChange('billing', 'district', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.district'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                {errors['billing.district'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.district']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                
                                                <label htmlFor="billing-province" className="block text-sm font-medium text-brand-primary mb-1">
                                                    Tỉnh/Thành phố *
                                                </label>
                                                <select
                                                    id="billing-province"
                                                    value={formData.billing.province}
                                                    onChange={(e) => handleInputChange('billing', 'province', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                        errors['billing.province'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                >
                                                    <option value="">Chọn Tỉnh/Thành phố</option>
                                                    {vietnameseProvinces.map(province => (
                                                        <option key={province} value={province}>{province}</option>
                                                    ))}
                                                </select>
                                                {errors['billing.province'] && (
                                                    <p className="mt-1 text-sm text-red-600">{errors['billing.province']}</p>
                                                )}
                                            </div>
                                            
                                            <div>                                                <label htmlFor="billing-postalCode" className="block text-sm font-medium text-brand-primary mb-1">
                                                    Mã bưu điện
                                                </label>
                                                <input
                                                    id="billing-postalCode"
                                                    type="text"
                                                    value={formData.billing.postalCode}
                                                    onChange={(e) => handleInputChange('billing', 'postalCode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                                />
                                            </div>
                                        </div>

                                        {user && (
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.saveToAccount || false}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, saveToAccount: e.target.checked }))}
                                                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-brand-primary">
                                                        Lưu thông tin này vào tài khoản của tôi
                                                    </span>
                                                </label>
                                                <p className="mt-1 text-xs text-gray-600">
                                                    Thông tin sẽ được lưu để sử dụng cho các đơn hàng tiếp theo
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Step 2: Shipping Information */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        {/* Validation Status */}
                                        <div className={`p-4 rounded-lg border ${
                                            hasCurrentStepErrors()
                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                : 'bg-green-50 border-green-200 text-green-700'
                                        }`}>
                                            <div className="flex items-center">
                                                <svg className={`w-5 h-5 mr-2 ${
                                                    hasCurrentStepErrors() ? 'text-red-500' : 'text-green-500'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {hasCurrentStepErrors() ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {hasCurrentStepErrors()
                                                        ? 'Vui lòng kiểm tra và điền đầy đủ thông tin giao hàng'
                                                        : 'Tuyệt vời! Thông tin giao hàng đã được điền đầy đủ'
                                                    }
                                                </span>
                                            </div>

                                            {/* Detailed error messages */}
                                            {hasCurrentStepErrors() && (
                                                <div className="mt-3 pt-3 border-t border-red-200">
                                                    <p className="text-xs font-medium text-red-700 mb-2">
                                                        Các trường cần điền:
                                                    </p>
                                                    <ul className="text-xs text-red-600 space-y-1">
                                                        {Object.entries(errors).map(([key, error]) => (
                                                            <li key={key} className="flex items-start">
                                                                <span className="text-red-500 mr-1">•</span>
                                                                <span>{error}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                                        💡 Mẹo: Bạn có thể tích vào "Giống như thông tin thanh toán" để tự động điền
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-semibold text-brand-primary">
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
                                                <div>
                                                    <label htmlFor="shipping-fullName" className="block text-sm font-medium text-brand-primary mb-1">
                                                        Họ và tên *
                                                    </label>
                                                    <input
                                                        id="shipping-fullName"
                                                        type="text"
                                                        value={formData.shipping.fullName}
                                                        onChange={(e) => handleInputChange('shipping', 'fullName', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                            errors['shipping.fullName'] ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Ví dụ: Nguyễn Văn A"
                                                    />
                                                    {errors['shipping.fullName'] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors['shipping.fullName']}</p>
                                                    )}
                                                </div>

                                                <div>                                                    
                                                    <label htmlFor="shipping-address" className="block text-sm font-medium text-brand-primary mb-1">
                                                        Địa chỉ *
                                                    </label>
                                                    <input
                                                        id="shipping-address"
                                                        type="text"
                                                        value={formData.shipping.address}
                                                        onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                            errors['shipping.address'] ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Số nhà, tên đường"
                                                    />
                                                    {errors['shipping.address'] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors['shipping.address']}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label htmlFor="shipping-wardCommune" className="block text-sm font-medium text-brand-primary mb-1">
                                                            Phường/Xã *
                                                        </label>
                                                        <input
                                                            id="shipping-wardCommune"
                                                            type="text"
                                                            value={formData.shipping.wardCommune || ''}
                                                            onChange={(e) => handleInputChange('shipping', 'wardCommune', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.wardCommune'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.wardCommune'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.wardCommune']}</p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label htmlFor="shipping-district" className="block text-sm font-medium text-brand-primary mb-1">
                                                            Quận/Huyện *
                                                        </label>
                                                        <input
                                                            id="shipping-district"
                                                            type="text"
                                                            value={formData.shipping.district || ''}
                                                            onChange={(e) => handleInputChange('shipping', 'district', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.district'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {errors['shipping.district'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.district']}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="shipping-province" className="block text-sm font-medium text-brand-primary mb-1">
                                                            Tỉnh/Thành phố *
                                                        </label>
                                                        <select
                                                            id="shipping-province"
                                                            value={formData.shipping.province}
                                                            onChange={(e) => handleInputChange('shipping', 'province', e.target.value)}
                                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-brand-primary focus:border-brand-primary ${
                                                                errors['shipping.province'] ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        >
                                                            <option value="">Chọn Tỉnh/Thành phố</option>
                                                            {vietnameseProvinces.map(province => (
                                                                <option key={province} value={province}>{province}</option>
                                                            ))}
                                                        </select>
                                                        {errors['shipping.province'] && (
                                                            <p className="mt-1 text-sm text-red-600">{errors['shipping.province']}</p>
                                                        )}
                                                    </div>
                                                    
                                                    <div>
                                                        <label htmlFor="shipping-postalCode" className="block text-sm font-medium text-brand-primary mb-1">
                                                            Mã bưu điện
                                                        </label>
                                                        <input
                                                            id="shipping-postalCode"
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
                                                placeholder="Ví dụ: Giao hàng vào buổi sáng, hoặc có ghi chú đặc biệt nào khác..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment Method */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        {/* Validation Status */}
                                        <div className={`p-4 rounded-lg border ${
                                            hasCurrentStepErrors()
                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                : 'bg-green-50 border-green-200 text-green-700'
                                        }`}>
                                            <div className="flex items-center">
                                                <svg className={`w-5 h-5 mr-2 ${
                                                    hasCurrentStepErrors() ? 'text-red-500' : 'text-green-500'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    {hasCurrentStepErrors() ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    )}
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    {hasCurrentStepErrors()
                                                        ? 'Vui lòng chọn phương thức thanh toán để hoàn tất đơn hàng'
                                                        : 'Hoàn hảo! Bạn đã sẵn sàng đặt hàng'
                                                    }
                                                </span>
                                            </div>

                                            {/* Detailed error messages */}
                                            {hasCurrentStepErrors() && (
                                                <div className="mt-3 pt-3 border-t border-red-200">
                                                    <p className="text-xs font-medium text-red-700 mb-2">
                                                        Vui lòng chọn:
                                                    </p>
                                                    <ul className="text-xs text-red-600 space-y-1">
                                                        {Object.entries(errors).map(([key, error]) => (
                                                            <li key={key} className="flex items-start">
                                                                <span className="text-red-500 mr-1">•</span>
                                                                <span>{error}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                                                        💡 Mẹo: Chọn phương thức thanh toán phù hợp để hoàn tất đơn hàng
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-semibold text-brand-primary">
                                            Phương thức thanh toán
                                        </h2>
                                        
                                        {errors.payment && (
                                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                                {errors.payment}
                                            </div>
                                        )}                                        <PaymentMethods
                                            orderData={createOrder}
                                            onPaymentError={handlePaymentError}
                                            selectedMethod={formData.paymentMethod}
                                            onPaymentMethodSelect={handlePaymentMethodChange}
                                        />
                                    </div>
                                )}

                                {/* Navigation Buttons - Mobile Responsive */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-brand-primary px-6 py-3 sm:py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
                                    >
                                        Quay lại
                                    </button>

                                    {currentStep < 3 && (
                                        <button
                                            onClick={handleNext}
                                            disabled={hasCurrentStepErrors()}
                                            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary text-white px-6 py-3 sm:py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary text-base sm:text-sm"
                                        >
                                            <span className="hidden sm:inline">{hasCurrentStepErrors() ? 'Vui lòng điền đầy đủ thông tin' : 'Tiếp tục'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary - Responsive */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4">
                                <h3 className="text-lg sm:text-xl font-semibold text-brand-primary mb-4 sm:mb-6">
                                    Tóm tắt đơn hàng
                                </h3>
                                
                                <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-96 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item.product_id} className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-brand-primary truncate">
                                                    {item.name}
                                                    {item.variant?.weight && (
                                                        <span className="text-xs font-normal text-gray-600 ml-1">
                                                            ({item.variant.weight})
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-600">SL: {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-brand-primary whitespace-nowrap">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                <hr className="my-3 sm:my-4 border-gray-200" />
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm sm:text-base">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-semibold text-brand-primary">{formatCurrency(subtotal)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm sm:text-base">
                                        <span className="text-gray-600">Thuế</span>
                                        <span className="font-semibold text-brand-primary">Đã bao gồm</span>
                                    </div>
                                    
                                    <hr className="border-gray-200" />
                                    
                                    <div className="flex justify-between text-base sm:text-lg">
                                        <span className="font-semibold text-brand-primary">Tổng cộng</span>
                                        <span className="font-bold text-brand-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 sm:mt-6 p-2.5 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-xs sm:text-sm text-brand-primary text-center">
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

// Main component using ContextConsumer
const Checkout = () => {
    return (
        <ContextConsumer>
            {({ auth, cart }) => (
                <CheckoutContent auth={auth} cart={cart} />
            )}
        </ContextConsumer>
    );
};

export default Checkout;

