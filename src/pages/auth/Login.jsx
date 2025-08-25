import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import FacebookLoginButton from '../../components/auth/FacebookLoginButton';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [error, setError] = useState('');

    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(formData.email, formData.password, formData.remember);
            navigate(from, { replace: true });
        } catch (error) {
            setError(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Handler for official Facebook Login Button
    const handleFacebookLoginSuccess = async (facebookData) => {
        try {
            setFacebookLoading(true);
            setError('');
            
            console.log('Facebook login success:', facebookData);
            
            // Send Facebook data to your backend for authentication
            const authResponse = await fetch('/api/auth/facebook/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: facebookData.authResponse.accessToken,
                    userProfile: facebookData.userProfile
                })
            });
            
            if (authResponse.ok) {
                const result = await authResponse.json();
                console.log('Backend authentication success:', result);
                
                // Update auth context with user data
                if (result.token && result.user) {
                    localStorage.setItem('authToken', result.token);
                    // You might want to update auth context here
                }
                
                // Navigate to the intended page or home
                navigate(from, { replace: true });
            } else {
                const errorData = await authResponse.json();
                setError(errorData.message || 'Đăng nhập Facebook thất bại');
            }
        } catch (error) {
            console.error('Facebook login error:', error);
            setError('Có lỗi xảy ra khi đăng nhập với Facebook. Vui lòng thử lại.');
        } finally {
            setFacebookLoading(false);
        }
    };

    const handleFacebookLoginError = (error) => {
        console.error('Facebook login error:', error);
        setError(error.message || 'Có lỗi xảy ra khi đăng nhập với Facebook');
        setFacebookLoading(false);
    };

    return (
        <>
            <Helmet>
                <title>Đăng nhập - Balan Coffee</title>
                <meta name="description" content="Login to your Balan Coffee account to access your orders, wishlist, and account settings." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>            <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-20">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                            <img src="backend\public\images\logos\title.png" alt="Balan Coffee Logo" className='h-8 w-8 object-cover'/>
                        </div>                        
                    </Link>
                    
                    <h2 className="text-center text-3xl font-bold text-brand-primary">
                        Đăng nhập
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-brand-primary">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="Email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-brand-primary">
                                    Mật khẩu
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="Mật khẩu"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-brand-primary">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-brand-primary">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                </button>
                            </div>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-brand-primary">Or continue with</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {/* Official Facebook Login Button */}
                                    <FacebookLoginButton
                                        onLoginSuccess={handleFacebookLoginSuccess}
                                        onLoginError={handleFacebookLoginError}
                                        size="large"
                                        buttonText="continue_with"
                                        scope="email,public_profile"
                                        disabled={facebookLoading || loading}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-brand-primary">                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="font-medium text-brand-primary hover:text-brand-primary">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

