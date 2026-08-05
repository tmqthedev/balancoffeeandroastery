import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { formatDateForBackend } from '../../utils/dateUtils';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import ContextConsumer from '../../components/common/ContextConsumer';
import PasswordStrengthIndicator from '../../components/common/PasswordStrengthIndicator';

const Auth = () => {
    return (
        <ContextConsumer>
            {({ auth, cart }) => <AuthContent auth={auth} cart={cart} />}
        </ContextConsumer>
    );
};

const AuthContent = ({ auth, cart }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, confirmSignUp, resendConfirmation } = auth;
    const { addToCart } = cart;
    
    // Cart merge functions using context values directly (avoid hooks issue)
    const forceCartMerge = async () => {
        console.log('🔄 AuthContent: forceCartMerge called, isAuthenticated:', auth.isAuthenticated);
        
        if (!auth.isAuthenticated) {
            console.log('❌ AuthContent: User not authenticated, cannot merge cart');
            return { success: false, error: 'User not authenticated' };
        }

        if (!cart.mergeLocalCartToUserCart) {
            console.log('❌ AuthContent: mergeLocalCartToUserCart not available');
            return { success: false, error: 'Cart merge function not available' };
        }

        try {
            console.log('🔄 AuthContent: Starting cart merge...');
            const result = await cart.mergeLocalCartToUserCart(true);
            console.log('✅ AuthContent: Cart merge completed:', result);
            return result;
        } catch (error) {
            console.error('❌ AuthContent: Cart merge failed:', error);
            return { success: false, error: error.message };
        }
    };

    const hasLocalCart = () => {
        const localCart = localStorage.getItem('cart');
        if (!localCart) return false;
        
        try {
            const cartItems = JSON.parse(localCart);
            return Array.isArray(cartItems) && cartItems.length > 0;
        } catch (error) {
            console.error('❌ AuthContent: Error parsing local cart:', error);
            return false;
        }
    };
    
    // Determine initial mode based on URL
    const initialMode = location.pathname === '/register' ? 'register' : 'login';
    const [mode, setMode] = useState(initialMode);
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [registerData, setRegisterData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        // Optional fields
        dateOfBirth: '',
        gender: '',
        address: '',
        city: '',
        province: '',
        postalCode: ''
    });    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registerErrors, setRegisterErrors] = useState({});
    const [confirmationCode, setConfirmationCode] = useState('');
    const [buyNowProduct, setBuyNowProduct] = useState(null);
    const [cartMergeMessage, setCartMergeMessage] = useState('');

    const from = location.state?.from?.pathname || '/';

    // Check for buy now product on component mount
    useEffect(() => {
        console.log('� Auth: Component mounted');
        console.log('🔗 Auth: Current location:', location.pathname);
        console.log('📍 Auth: Location state:', location.state);
        
        console.log('�🔍 Auth: Checking for buy now product in localStorage');
        const savedBuyNowProduct = localStorage.getItem('buyNowProduct');
        console.log('📦 Auth: Raw buyNowProduct from localStorage:', savedBuyNowProduct);
        
        if (savedBuyNowProduct) {
            try {
                const product = JSON.parse(savedBuyNowProduct);
                console.log('📦 Auth: Parsed buy now product:', product);
                
                // Check if product is not too old (within 30 minutes)
                if (Date.now() - product.timestamp < 30 * 60 * 1000) {
                    console.log('✅ Auth: Buy now product is valid, setting state');
                    setBuyNowProduct(product);
                } else {
                    console.log('⏰ Auth: Buy now product is too old, removing');
                    localStorage.removeItem('buyNowProduct');
                }
            } catch (error) {
                console.error('❌ Auth: Error parsing buy now product:', error);
                localStorage.removeItem('buyNowProduct');
            }
        } else {
            console.log('❌ Auth: No buy now product found in localStorage');
        }
    }, [location.pathname, location.state]); // Added location dependencies

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleRegisterChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setRegisterData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        // Real-time validation for specific fields
        if (name && registerErrors[name]) {
            const tempData = { ...registerData, [name]: newValue };
            const fieldError = validateSingleField(name, tempData);
            
            setRegisterErrors(prev => ({ 
                ...prev, 
                [name]: fieldError || '' 
            }));
        }
        
        setError('');
    };

    // Validate single field for real-time feedback
    const validateSingleField = (fieldName, data) => {
        switch (fieldName) {
            case 'fullName': {
                if (!data.fullName.trim()) return 'Họ và tên là bắt buộc';
                if (data.fullName.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
                if (data.fullName.trim().length > 100) return 'Họ và tên không được quá 100 ký tự';
                if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(data.fullName.trim())) return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
                return '';
            }
                
            case 'email': {
                if (!data.email.trim()) return 'Email là bắt buộc';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(data.email.trim())) return 'Email không hợp lệ';
                if (data.email.trim().length > 255) return 'Email không được quá 255 ký tự';
                return '';
            }
                
            case 'phone': {
                if (!data.phone.trim()) return 'Số điện thoại là bắt buộc';
                const phoneClean = data.phone.replace(/[\s\-()]/g, '');
                if (!/^[0-9+]{8,20}$/.test(phoneClean)) return 'Số điện thoại không hợp lệ (8-20 chữ số)';
                if (phoneClean.startsWith('0') && phoneClean.length !== 10) return 'Số điện thoại Việt Nam phải có 10 chữ số (bắt đầu bằng 0)';
                if (phoneClean.startsWith('+84') && phoneClean.length !== 12) return 'Số điện thoại quốc tế phải có định dạng +84xxxxxxxxx';
                return '';
            }
                
            case 'password': {
                if (!data.password) return 'Mật khẩu là bắt buộc';
                if (data.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
                if (data.password.length > 128) return 'Mật khẩu không được quá 128 ký tự';
                if (!/(?=.*[a-zA-Z])/.test(data.password)) return 'Mật khẩu phải chứa ít nhất 1 chữ cái';
                if (data.password.includes(' ')) return 'Mật khẩu không được chứa khoảng trắng';
                return '';
            }
                
            case 'confirmPassword': {
                if (!data.confirmPassword) return 'Xác nhận mật khẩu là bắt buộc';
                if (data.password !== data.confirmPassword) return 'Mật khẩu xác nhận không khớp';
                return '';
            }
                
            case 'dateOfBirth': {
                if (data.dateOfBirth) {
                    const birthDate = new Date(data.dateOfBirth);
                    const today = new Date();
                    const age = today.getFullYear() - birthDate.getFullYear();
                    
                    if (birthDate > today) return 'Ngày sinh không thể là ngày trong tương lai';
                    if (age < 13) return 'Bạn phải từ 13 tuổi trở lên để đăng ký';
                    if (age > 120) return 'Ngày sinh không hợp lệ';
                }
                return '';
            }
                
            case 'postalCode': {
                if (data.postalCode && !/^[0-9]{5,6}$/.test(data.postalCode.trim())) {
                    return 'Mã bưu điện phải có 5-6 chữ số';
                }
                return '';
            }
                
            default:
                return '';
        }
    };

    const validateRegisterForm = () => {
        const newErrors = {};
        
        // Full name validation
        if (!registerData.fullName.trim()) {
            newErrors.fullName = 'Họ và tên là bắt buộc';
        } else if (registerData.fullName.trim().length < 2) {
            newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
        } else if (registerData.fullName.trim().length > 100) {
            newErrors.fullName = 'Họ và tên không được quá 100 ký tự';
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(registerData.fullName.trim())) {
            newErrors.fullName = 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
        }
        
        // Email validation
        if (!registerData.email.trim()) {
            newErrors.email = 'Email là bắt buộc';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(registerData.email.trim())) {
                newErrors.email = 'Email không hợp lệ';
            } else if (registerData.email.trim().length > 255) {
                newErrors.email = 'Email không được quá 255 ký tự';
            }
        }
        
        // Phone validation - more comprehensive
        if (!registerData.phone.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else {
            const phoneClean = registerData.phone.replace(/[\s\-()]/g, '');
            if (!/^[0-9+]{8,20}$/.test(phoneClean)) {
                newErrors.phone = 'Số điện thoại không hợp lệ (8-20 chữ số)';
            } else if (phoneClean.startsWith('0') && phoneClean.length !== 10) {
                newErrors.phone = 'Số điện thoại Việt Nam phải có 10 chữ số (bắt đầu bằng 0)';
            } else if (phoneClean.startsWith('+84') && phoneClean.length !== 12) {
                newErrors.phone = 'Số điện thoại quốc tế phải có định dạng +84xxxxxxxxx';
            }
        }
        
        // Password validation - more comprehensive
        if (!registerData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (registerData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else if (registerData.password.length > 128) {
            newErrors.password = 'Mật khẩu không được quá 128 ký tự';
        } else if (!/(?=.*[a-zA-Z])/.test(registerData.password)) {
            newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái';
        } else if (registerData.password.includes(' ')) {
            newErrors.password = 'Mật khẩu không được chứa khoảng trắng';
        }
        
        // Confirm password validation
        if (!registerData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        } else if (registerData.password !== registerData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        // Terms agreement validation
        if (!registerData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng và chính sách bảo mật';
        }
        
        // Optional field validations
        if (registerData.dateOfBirth) {
            const birthDate = new Date(registerData.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            
            if (birthDate > today) {
                newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai';
            } else if (age < 13) {
                newErrors.dateOfBirth = 'Bạn phải từ 13 tuổi trở lên để đăng ký';
            } else if (age > 120) {
                newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
            }
        }
        
        if (registerData.address && registerData.address.trim().length > 255) {
            newErrors.address = 'Địa chỉ không được quá 255 ký tự';
        }
        
        if (registerData.city && registerData.city.trim().length > 100) {
            newErrors.city = 'Tên thành phố không được quá 100 ký tự';
        }
        
        if (registerData.postalCode && !/^[0-9]{5,6}$/.test(registerData.postalCode.trim())) {
            newErrors.postalCode = 'Mã bưu điện phải có 5-6 chữ số';
        }
        
        return newErrors;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔐 Auth: Login form submitted');
            console.log('📦 Auth: Current buyNowProduct state:', buyNowProduct);
            
            await login(loginData.email, loginData.password, loginData.remember);
            console.log('✅ Auth: Login successful');
            
            // Force merge local cart after successful login
            console.log('🔄 Auth: Checking for local cart to merge after login');
            if (hasLocalCart()) {
                console.log('📦 Auth: Found local cart, forcing merge to user account');
                try {
                    // Add a delay to ensure authentication state is fully propagated
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const mergeResult = await forceCartMerge();
                    console.log('📦 Auth: Cart merge result:', mergeResult);
                    
                    if (mergeResult.success && mergeResult.merged > 0) {
                        console.log(`✅ Auth: Successfully merged ${mergeResult.merged} items from local cart`);
                        setCartMergeMessage(`✅ Đã thêm ${mergeResult.merged} sản phẩm từ giỏ hàng tạm thời vào tài khoản của bạn!`);
                        // Clear message after 5 seconds
                        setTimeout(() => setCartMergeMessage(''), 5000);
                    } else {
                        console.error('❌ Auth: Cart merge failed:', mergeResult.error);
                    }
                } catch (mergeError) {
                    console.error('❌ Auth: Cart merge error:', mergeError);
                }
            } else {
                console.log('❌ Auth: No local cart found to merge');
            }
            
            // If there's a buy now product, add it to cart
            if (buyNowProduct) {
                console.log('🛒 Auth: Adding buy now product to cart');
                try {
                    const productToAdd = {
                        id: buyNowProduct.productId,
                        name: buyNowProduct.name,
                        price: buyNowProduct.price,
                        selectedWeight: buyNowProduct.selectedWeight,
                        image_url: buyNowProduct.image_url
                    };
                    
                    console.log('📦 Auth: Product to add:', productToAdd);
                    console.log('📦 Auth: Quantity:', buyNowProduct.quantity);
                    
                    // Add a small delay to ensure authentication state is updated
                    console.log('⏳ Auth: Waiting for authentication state to update...');
                    await new Promise(resolve => setTimeout(resolve, 200));
                    
                    const cartResult = await addToCart(productToAdd, buyNowProduct.quantity);
                    if (cartResult && cartResult.success) {
                        console.log('✅ Auth: Buy now product added to cart successfully');
                    } else {
                        throw new Error('Failed to add product to cart');
                    }
                    
                    // Clear the buy now product from localStorage
                    localStorage.removeItem('buyNowProduct');
                    console.log('🧹 Auth: Cleared buy now product from localStorage');
                    
                    // Clear buy now product from state as well
                    setBuyNowProduct(null);
                    console.log('🧹 Auth: Cleared buy now product from state');
                    
                    // Navigate to checkout instead of the original 'from' path
                    console.log('🚀 Auth: Navigating to checkout');
                    navigate('/checkout', { replace: true });
                    return;
                } catch (cartError) {
                    console.error('❌ Auth: Failed to add buy now product to cart:', cartError);
                    // Continue with normal navigation if cart addition fails
                }
            } else {
                console.log('❌ Auth: No buy now product to add');
            }
            
            console.log('🚀 Auth: Navigating to from path:', from);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        
        const formErrors = validateRegisterForm();
        if (Object.keys(formErrors).length > 0) {
            setRegisterErrors(formErrors);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare data for backend - only include optional fields if they have values
            const registrationData = {
                fullName: registerData.fullName,
                email: registerData.email,
                phone: registerData.phone,
                password: registerData.password
            };

            // Split full name for backend compatibility
            const splitFullName = (fullName) => {
                if (!fullName?.trim()) return { firstName: '', lastName: '' };

                const nameParts = fullName.trim().split(' ');
                if (nameParts.length === 1) {
                    return { firstName: nameParts[0], lastName: '' };
                } else {
                    const firstName = nameParts[nameParts.length - 1]; // Last part is given name
                    const lastName = nameParts.slice(0, -1).join(' '); // Rest is family/middle name
                    return { firstName, lastName };
                }
            };

            const nameParts = splitFullName(registerData.fullName);
            registrationData.firstName = nameParts.firstName;
            registrationData.lastName = nameParts.lastName;

            // Only add optional fields if they have values
            if (registerData.dateOfBirth?.trim()) {
                registrationData.dateOfBirth = formatDateForBackend(registerData.dateOfBirth);
            }
            if (registerData.gender?.trim()) {
                registrationData.gender = registerData.gender;
            }
            if (registerData.address?.trim()) {
                registrationData.address = registerData.address;
            }
            if (registerData.city?.trim()) {
                registrationData.city = registerData.city;
            }
            if (registerData.province?.trim()) {
                registrationData.province = registerData.province;
            }
            if (registerData.postalCode?.trim()) {
                registrationData.postalCode = registerData.postalCode;
            }

            const response = await register(registrationData);
            
            // Check if email verification is required
            if (response && response.requiresVerification) {
                // Show success message and redirect to verification info page
                alert(`${response.message}\n\nVui lòng kiểm tra email ${response.email} để xác thực tài khoản.`);
                // Stay on auth page and show verification info
                setMode('verification');
                setRegisterData(prev => ({ ...prev, email: response.email }));
            } else {
                console.log('🎉 Auth: Registration completed without verification required');
                
                // Force merge local cart to user cart after successful registration
                console.log('🔄 Auth: Checking for local cart to merge after registration');
                if (hasLocalCart()) {
                    console.log('📦 Auth: Found local cart, forcing merge to user account');
                    try {
                        // Add a delay to ensure authentication state is fully propagated
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        const mergeResult = await forceCartMerge();
                        console.log('📦 Auth: Cart merge result:', mergeResult);
                        
                        if (mergeResult.success && mergeResult.merged > 0) {
                            console.log(`✅ Auth: Successfully merged ${mergeResult.merged} items from local cart`);
                            setCartMergeMessage(`✅ Đã thêm ${mergeResult.merged} sản phẩm từ giỏ hàng tạm thời vào tài khoản của bạn!`);
                            // Clear message after 5 seconds
                            setTimeout(() => setCartMergeMessage(''), 5000);
                        } else {
                            console.error('❌ Auth: Cart merge failed:', mergeResult.error);
                        }
                    } catch (mergeError) {
                        console.error('❌ Auth: Cart merge error:', mergeError);
                    }
                } else {
                    console.log('❌ Auth: No local cart found to merge');
                }
                
                // If there's a buy now product, add it to cart
                if (buyNowProduct) {
                    console.log('🛒 Auth: Adding buy now product to cart after registration');
                    try {
                        const productToAdd = {
                            id: buyNowProduct.productId,
                            name: buyNowProduct.name,
                            price: buyNowProduct.price,
                            selectedWeight: buyNowProduct.selectedWeight,
                            image_url: buyNowProduct.image_url
                        };
                        
                        console.log('📦 Auth: Product to add:', productToAdd);
                        console.log('📦 Auth: Quantity:', buyNowProduct.quantity);
                        
                        // Add a small delay to ensure cart merge is complete
                        console.log('⏳ Auth: Waiting for cart merge to complete...');
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        const cartResult = await addToCart(productToAdd, buyNowProduct.quantity);
                        if (cartResult && cartResult.success) {
                            console.log('✅ Auth: Buy now product added to cart successfully');
                        } else {
                            throw new Error('Failed to add product to cart');
                        }
                        
                        // Clear the buy now product from localStorage
                        localStorage.removeItem('buyNowProduct');
                        console.log('🧹 Auth: Cleared buy now product from localStorage');
                        
                        // Clear buy now product from state as well
                        setBuyNowProduct(null);
                        console.log('🧹 Auth: Cleared buy now product from state');
                        
                        // Navigate to checkout instead of the original 'from' path
                        console.log('🚀 Auth: Navigating to checkout');
                        navigate('/checkout', { replace: true });
                        return;
                    } catch (cartError) {
                        console.error('❌ Auth: Failed to add buy now product to cart:', cartError);
                        // Continue with normal navigation if cart addition fails
                    }
                } else {
                    console.log('❌ Auth: No buy now product to add');
                }
                
                console.log('🚀 Auth: Navigating to from path:', from);
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error('Registration error:', err); // Updated error handling
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await confirmSignUp(registerData.email, confirmationCode.trim());
            alert('Xác thực email thành công. Bạn có thể đăng nhập.');
            setMode('login');
            setLoginData(prev => ({ ...prev, email: registerData.email }));
            setConfirmationCode('');
        } catch (err) {
            setError(err.message || 'Xác thực email thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleResendConfirmation = async () => {
        setLoading(true);
        setError('');

        try {
            await resendConfirmation(registerData.email);
            alert('Mã xác thực đã được gửi lại.');
        } catch (err) {
            setError(err.message || 'Không thể gửi lại mã xác thực');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setRegisterErrors({});
        setCartMergeMessage('');
    };

    return (
        <>
            <Helmet>
                <title>{mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Xác thực Email'} - Balan Coffee</title>
                <meta name="description" content={
                    mode === 'login' ? 
                    "Đăng nhập vào tài khoản Balan Coffee để trải nghiệm mua sắm cà phê tuyệt vời" :
                    mode === 'register' ?
                    "Đăng ký tài khoản Balan Coffee để tận hưởng những sản phẩm cà phê chất lượng cao" :
                    "Xác thực email để kích hoạt tài khoản Balan Coffee"
                } />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-brand-white to-brand-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <img 
                                src="/images/logos/title.png"
                                alt="Balan Coffee" 
                                className="h-16 w-auto mx-auto mb-4"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="hidden h-16 w-16 mx-auto mb-4 bg-brand-primary rounded-lg items-center justify-center">
                                <span className="text-brand-white font-bold text-2xl">B</span>
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold text-brand-primary mb-2">
                            {mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Tạo tài khoản' : 'Xác thực Email'}
                        </h2>
                        <p className="text-gray-600">
                            {mode === 'login' ? 
                                'Chào mừng bạn trở lại!' : 
                                mode === 'register' ?
                                'Tham gia cộng đồng yêu cà phê của chúng tôi' :
                                'Vui lòng kiểm tra email để hoàn tất đăng ký'
                            }
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => switchMode('login')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                                mode === 'login'
                                    ? 'bg-brand-white text-brand-primary shadow-sm'
                                    : 'text-gray-600 hover:text-brand-primary'
                            }`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            onClick={() => switchMode('register')}
                            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                                mode === 'register'
                                    ? 'bg-brand-white text-brand-primary shadow-sm'
                                    : 'text-gray-600 hover:text-brand-primary'
                            }`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Forms Container */}
                    <div className="bg-brand-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        {/* Cart Merge Success Message */}
                        {cartMergeMessage && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-green-700">{cartMergeMessage}</p>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Buy Now Product Message */}
                        {buyNowProduct && (mode === 'login' || mode === 'register') && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-blue-700">
                                        {mode === 'login' 
                                            ? `Đăng nhập để thêm "${buyNowProduct.name}" vào giỏ hàng và thanh toán`
                                            : `Đăng ký để thêm "${buyNowProduct.name}" vào giỏ hàng và thanh toán`
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Login Form */}
                        {mode === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="login-email" className="block text-sm font-medium text-brand-primary mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                        placeholder="Nhập email của bạn"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="login-password" className="block text-sm font-medium text-brand-primary mb-2">
                                        Mật khẩu
                                    </label>
                                    <input
                                        id="login-password"
                                        name="password"
                                        type="password"
                                        required
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                        placeholder="Nhập mật khẩu"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input
                                            name="remember"
                                            type="checkbox"
                                            checked={loginData.remember}
                                            onChange={handleLoginChange}
                                            className="h-4 w-4 text-brand-primary focus:ring-brand-secondary border-brand-primary rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                                    </label>
                                    <Link 
                                        to="/forgot-password" 
                                        className="text-sm text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary text-brand-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-brand-primary mb-2">
                                        Họ và tên *
                                    </label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        value={registerData.fullName}
                                        onChange={handleRegisterChange}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                            registerErrors.fullName ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                        }`}
                                        placeholder="Ví dụ: Nguyễn Văn A"
                                    />
                                    {registerErrors.fullName && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-email" className="block text-sm font-medium text-brand-primary mb-2">
                                        Email *
                                    </label>
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        required
                                        value={registerData.email}
                                        onChange={handleRegisterChange}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                            registerErrors.email ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                        }`}
                                        placeholder="Nhập email của bạn"
                                    />
                                    {registerErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-brand-primary mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        value={registerData.phone}
                                        onChange={handleRegisterChange}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                            registerErrors.phone ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                        }`}
                                        placeholder="Ví dụ: 0912345678"
                                    />
                                    {registerErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="block text-sm font-medium text-brand-primary mb-2">
                                        Mật khẩu *
                                    </label>
                                    <input
                                        id="register-password"
                                        name="password"
                                        type="password"
                                        required
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                            registerErrors.password ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                        }`}
                                        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                                    />
                                    <PasswordStrengthIndicator password={registerData.password} />
                                    {registerErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-primary mb-2">
                                        Xác nhận mật khẩu *
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                            registerErrors.confirmPassword ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                        }`}
                                        placeholder="Nhập lại mật khẩu"
                                    />
                                    {registerErrors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword}</p>
                                    )}
                                </div>

                                {/* Optional Information Section */}
                                <div className="border-t pt-6 mt-6">
                                    <h4 className="text-lg font-medium text-brand-primary mb-4">
                                        Thông tin bổ sung (tùy chọn)
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-brand-primary mb-2">
                                                Ngày sinh
                                            </label>
                                            <input
                                                id="dateOfBirth"
                                                name="dateOfBirth"
                                                type="date"
                                                value={registerData.dateOfBirth}
                                                onChange={handleRegisterChange}
                                                max={new Date().toISOString().split('T')[0]}
                                                min={new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0]}
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                    registerErrors.dateOfBirth ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                                }`}
                                            />
                                            {registerErrors.dateOfBirth && (
                                                <p className="mt-1 text-sm text-red-600">{registerErrors.dateOfBirth}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="gender" className="block text-sm font-medium text-brand-primary mb-2">
                                                Giới tính
                                            </label>
                                            <select
                                                id="gender"
                                                name="gender"
                                                value={registerData.gender}
                                                onChange={handleRegisterChange}
                                                className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                            >
                                                <option value="">Chọn giới tính</option>
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <label htmlFor="address" className="block text-sm font-medium text-brand-primary mb-2">
                                            Địa chỉ
                                        </label>
                                        <input
                                            id="address"
                                            name="address"
                                            type="text"
                                            value={registerData.address}
                                            onChange={handleRegisterChange}
                                            maxLength="255"
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                registerErrors.address ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                            }`}
                                            placeholder="Số nhà, đường, phường/xã"
                                        />
                                        {registerErrors.address && (
                                            <p className="mt-1 text-sm text-red-600">{registerErrors.address}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-brand-primary mb-2">
                                                Thành phố
                                            </label>
                                            <input
                                                id="city"
                                                name="city"
                                                type="text"
                                                value={registerData.city}
                                                onChange={handleRegisterChange}
                                                maxLength="100"
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                    registerErrors.city ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                                }`}
                                                placeholder="Nhập tên thành phố"
                                            />
                                            {registerErrors.city && (
                                                <p className="mt-1 text-sm text-red-600">{registerErrors.city}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="province" className="block text-sm font-medium text-brand-primary mb-2">
                                                Tỉnh/Thành phố
                                            </label>
                                            <select
                                                id="province"
                                                name="province"
                                                value={registerData.province}
                                                onChange={handleRegisterChange}
                                                className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                            >
                                                <option value="">Chọn tỉnh/thành phố</option>
                                                <option value="An Giang">An Giang</option>
                                                <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                                                <option value="Bắc Giang">Bắc Giang</option>
                                                <option value="Bắc Kạn">Bắc Kạn</option>
                                                <option value="Bạc Liêu">Bạc Liêu</option>
                                                <option value="Bắc Ninh">Bắc Ninh</option>
                                                <option value="Bến Tre">Bến Tre</option>
                                                <option value="Bình Định">Bình Định</option>
                                                <option value="Bình Dương">Bình Dương</option>
                                                <option value="Bình Phước">Bình Phước</option>
                                                <option value="Bình Thuận">Bình Thuận</option>
                                                <option value="Cà Mau">Cà Mau</option>
                                                <option value="Cao Bằng">Cao Bằng</option>
                                                <option value="Đắk Lắk">Đắk Lắk</option>
                                                <option value="Đắk Nông">Đắk Nông</option>
                                                <option value="Điện Biên">Điện Biên</option>
                                                <option value="Đồng Nai">Đồng Nai</option>
                                                <option value="Đồng Tháp">Đồng Tháp</option>
                                                <option value="Gia Lai">Gia Lai</option>
                                                <option value="Hà Giang">Hà Giang</option>
                                                <option value="Hà Nam">Hà Nam</option>
                                                <option value="Hà Tĩnh">Hà Tĩnh</option>
                                                <option value="Hải Dương">Hải Dương</option>
                                                <option value="Hậu Giang">Hậu Giang</option>
                                                <option value="Hòa Bình">Hòa Bình</option>
                                                <option value="Hưng Yên">Hưng Yên</option>
                                                <option value="Khánh Hòa">Khánh Hòa</option>
                                                <option value="Kiên Giang">Kiên Giang</option>
                                                <option value="Kon Tum">Kon Tum</option>
                                                <option value="Lai Châu">Lai Châu</option>
                                                <option value="Lâm Đồng">Lâm Đồng</option>
                                                <option value="Lạng Sơn">Lạng Sơn</option>
                                                <option value="Lào Cai">Lào Cai</option>
                                                <option value="Long An">Long An</option>
                                                <option value="Nam Định">Nam Định</option>
                                                <option value="Nghệ An">Nghệ An</option>
                                                <option value="Ninh Bình">Ninh Bình</option>
                                                <option value="Ninh Thuận">Ninh Thuận</option>
                                                <option value="Phú Thọ">Phú Thọ</option>
                                                <option value="Quảng Bình">Quảng Bình</option>
                                                <option value="Quảng Nam">Quảng Nam</option>
                                                <option value="Quảng Ngãi">Quảng Ngãi</option>
                                                <option value="Quảng Ninh">Quảng Ninh</option>
                                                <option value="Quảng Trị">Quảng Trị</option>
                                                <option value="Sóc Trăng">Sóc Trăng</option>
                                                <option value="Sơn La">Sơn La</option>
                                                <option value="Tây Ninh">Tây Ninh</option>
                                                <option value="Thái Bình">Thái Bình</option>
                                                <option value="Thái Nguyên">Thái Nguyên</option>
                                                <option value="Thanh Hóa">Thanh Hóa</option>
                                                <option value="Thừa Thiên Huế">Thừa Thiên Huế</option>
                                                <option value="Tiền Giang">Tiền Giang</option>
                                                <option value="Trà Vinh">Trà Vinh</option>
                                                <option value="Tuyên Quang">Tuyên Quang</option>
                                                <option value="Vĩnh Long">Vĩnh Long</option>
                                                <option value="Vĩnh Phúc">Vĩnh Phúc</option>
                                                <option value="Yên Bái">Yên Bái</option>
                                                <option value="Phú Yên">Phú Yên</option>
                                                <option value="Cần Thơ">Cần Thơ</option>
                                                <option value="Đà Nẵng">Đà Nẵng</option>
                                                <option value="Hải Phòng">Hải Phòng</option>
                                                <option value="Hà Nội">Hà Nội</option>
                                                <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="postalCode" className="block text-sm font-medium text-brand-primary mb-2">
                                                Mã bưu điện
                                            </label>
                                            <input
                                                id="postalCode"
                                                name="postalCode"
                                                type="text"
                                                value={registerData.postalCode}
                                                onChange={handleRegisterChange}
                                                pattern="[0-9]{5,6}"
                                                maxLength="6"
                                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                    registerErrors.postalCode ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                                }`}
                                                placeholder="Ví dụ: 700000"
                                            />
                                            {registerErrors.postalCode && (
                                                <p className="mt-1 text-sm text-red-600">{registerErrors.postalCode}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-start">
                                        <input
                                            name="agreeTerms"
                                            type="checkbox"
                                            checked={registerData.agreeTerms}
                                            onChange={handleRegisterChange}
                                            className={`h-4 w-4 mt-1 text-brand-primary focus:ring-brand-secondary border-brand-primary rounded ${
                                                registerErrors.agreeTerms ? 'border-red-500' : ''
                                            }`}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            Tôi đồng ý với{' '}
                                            <Link to="/terms" className="text-brand-primary hover:text-brand-secondary font-medium transition-colors">
                                                Điều khoản sử dụng
                                            </Link>
                                            {' '}và{' '}
                                            <Link to="/privacy" className="text-brand-primary hover:text-brand-secondary font-medium transition-colors">
                                                Chính sách bảo mật
                                            </Link>
                                        </span>
                                    </label>
                                    {registerErrors.agreeTerms && (
                                        <p className="mt-1 text-sm text-red-600">{registerErrors.agreeTerms}</p>
                                    )}
                                </div>                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-primary text-brand-white py-3 px-4 rounded-lg font-medium hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
                                </button>
                            </form>
                        )}

                        {/* Email Verification Info */}
                        {mode === 'verification' && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-coffee-dark mb-4">
                                        📧 Kiểm tra email của bạn
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Chúng tôi đã gửi email xác thực đến <strong>{registerData.email}</strong>
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                    <h4 className="font-semibold text-blue-800 mb-2">Bước tiếp theo:</h4>
                                    <ol className="text-blue-700 text-sm space-y-1">
                                        <li>1. Mở email từ Balan Coffee trong hộp thư của bạn</li>
                                        <li>2. Nhấn vào nút "Xác thực Email" trong email</li>
                                        <li>3. Hoàn tất việc kích hoạt tài khoản</li>
                                        <li>4. Đăng nhập và bắt đầu mua sắm!</li>
                                    </ol>
                                </div>

                                <form onSubmit={handleConfirmSignUp} className="space-y-4">
                                    <div>
                                        <label htmlFor="confirmationCode" className="block text-sm font-medium text-brand-primary mb-2">
                                            Mã xác thực trong email
                                        </label>
                                        <input
                                            id="confirmationCode"
                                            type="text"
                                            value={confirmationCode}
                                            onChange={(e) => setConfirmationCode(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                            placeholder="Nhập mã xác thực"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-coffee-dark text-white py-2 px-4 rounded-md hover:bg-coffee-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-light disabled:opacity-50"
                                    >
                                        {loading ? 'Đang xác thực...' : 'Xác thực email'}
                                    </button>
                                </form>

                                <div className="text-center text-sm text-gray-600">
                                    <p className="mb-2">Không thấy email? Kiểm tra thư mục spam hoặc</p>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('/api/auth/resend-confirmation', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ email: registerData.email }),
                                                });
                                                const data = await response.json();
                                                if (data.success) {
                                                    alert('Email xác thực đã được gửi lại!');
                                                } else {
                                                    alert(data.message || 'Có lỗi xảy ra');
                                                }
                                            } catch (err) {
                                                console.error('Resend verification error:', err);
                                                alert('Có lỗi xảy ra khi gửi lại email');
                                            }
                                        }}
                                        className="text-coffee-dark hover:text-coffee-darker font-medium underline"
                                    >
                                        gửi lại email xác thực
                                    </button>
                                </div>

                                <div className="pt-4 border-t space-y-3">
                                    <button
                                        onClick={() => setMode('login')}
                                        className="w-full bg-coffee-dark text-white py-2 px-4 rounded-md hover:bg-coffee-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-light"
                                    >
                                        Đã xác thực? Đăng nhập ngay
                                    </button>
                                    <button
                                        onClick={() => setMode('register')}
                                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                                    >
                                        Quay lại đăng ký
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-6">
                        <Link 
                            to="/" 
                            className="inline-flex items-center text-brand-primary hover:text-brand-secondary font-medium transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Quay lại trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}; // Closing AuthContent

// Wrap với ErrorBoundary để catch hook errors
const AuthWithErrorBoundary = () => (
    <ErrorBoundary showErrorDetails={true}>
        <Auth />
    </ErrorBoundary>
);

export default AuthWithErrorBoundary;

