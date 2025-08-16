import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register } = useAuth();
    
    // Determine initial mode based on URL
    const initialMode = location.pathname === '/register' ? 'register' : 'login';
    const [mode, setMode] = useState(initialMode);
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });    const [loading, setLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [error, setError] = useState('');
    const [registerErrors, setRegisterErrors] = useState({});

    const from = location.state?.from?.pathname || '/';

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
        setRegisterData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (registerErrors[name]) {
            setRegisterErrors(prev => ({ ...prev, [name]: '' }));
        }
        setError('');
    };

    const validateRegisterForm = () => {
        const newErrors = {};
        
        if (!registerData.firstName.trim()) {
            newErrors.firstName = 'Trường này là bắt buộc';
        }
        
        if (!registerData.lastName.trim()) {
            newErrors.lastName = 'Trường này là bắt buộc';
        }
        
        if (!registerData.email.trim()) {
            newErrors.email = 'Trường này là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        if (!registerData.password) {
            newErrors.password = 'Trường này là bắt buộc';
        } else if (registerData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        if (!registerData.confirmPassword) {
            newErrors.confirmPassword = 'Trường này là bắt buộc';
        } else if (registerData.password !== registerData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        if (!registerData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
        }
        
        return newErrors;
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(loginData.email, loginData.password, loginData.remember);
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.response?.data?.message || 'Đăng nhập thất bại');
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
            await register({
                firstName: registerData.firstName,
                lastName: registerData.lastName,
                email: registerData.email,
                phone: registerData.phone,
                password: registerData.password
            });
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };    const handleFacebookLogin = () => {
        setFacebookLoading(true);
        // Store intended redirect location
        sessionStorage.setItem('authRedirect', from);
        // Redirect to Facebook OAuth
        window.location.href = '/api/auth/facebook';
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
        setRegisterErrors({});
    };

    return (
        <>
            <Helmet>
                <title>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'} - Balan Coffee</title>
                <meta name="description" content={mode === 'login' ? 
                    "Đăng nhập vào tài khoản Balan Coffee để trải nghiệm mua sắm cà phê tuyệt vời" :
                    "Đăng ký tài khoản Balan Coffee để tận hưởng những sản phẩm cà phê chất lượng cao"
                } />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-brand-white to-brand-secondary/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block">
                            <img 
                                src="/dist/title.png"
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
                            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
                        </h2>
                        <p className="text-gray-600">
                            {mode === 'login' ? 
                                'Chào mừng bạn trở lại!' : 
                                'Tham gia cộng đồng yêu cà phê của chúng tôi'
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

                                {/* Social Login */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-brand-white text-gray-500">Hoặc đăng nhập với</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    disabled={facebookLoading || loading}
                                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-blue-600 rounded-lg bg-blue-600 text-brand-white hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    {facebookLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-white mr-2"></div>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    )}
                                    {facebookLoading ? 'Đang chuyển hướng...' : 'Tiếp tục với Facebook'}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {mode === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="firstName" className="block text-sm font-medium text-brand-primary mb-2">
                                            Họ *
                                        </label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={registerData.firstName}
                                            onChange={handleRegisterChange}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                registerErrors.firstName ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                            }`}
                                            placeholder="Họ"
                                        />
                                        {registerErrors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{registerErrors.firstName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="lastName" className="block text-sm font-medium text-brand-primary mb-2">
                                            Tên *
                                        </label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            value={registerData.lastName}
                                            onChange={handleRegisterChange}
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-brand-secondary transition-colors ${
                                                registerErrors.lastName ? 'border-red-500' : 'border-brand-primary focus:border-brand-secondary'
                                            }`}
                                            placeholder="Tên"
                                        />
                                        {registerErrors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{registerErrors.lastName}</p>
                                        )}
                                    </div>
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
                                        Số điện thoại
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={registerData.phone}
                                        onChange={handleRegisterChange}
                                        className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary transition-colors"
                                        placeholder="Nhập số điện thoại (tùy chọn)"
                                    />
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

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-brand-white text-gray-500">Hoặc đăng ký với</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleFacebookLogin}
                                    disabled={facebookLoading || loading}
                                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-blue-600 rounded-lg bg-blue-600 text-brand-white hover:bg-blue-700 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    {facebookLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-white mr-2"></div>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    )}
                                    {facebookLoading ? 'Đang chuyển hướng...' : 'Tiếp tục với Facebook'}
                                </button>
                            </form>
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
};

export default Auth;

