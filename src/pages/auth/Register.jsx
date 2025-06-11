import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Trường này là bắt buộc';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Trường này là bắt buộc';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Trường này là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        if (!formData.password) {
            newErrors.password = 'Trường này là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Trường này là bắt buộc';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Trường này là bắt buộc';
        }

        return newErrors;
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            navigate('/');
        } catch (error) {
            setErrors({ 
                submit: error.message || 'Đăng ký thất bại' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Đăng ký - Balan Coffee</title>
                <meta name="description" content="Create your Balan Coffee account to start ordering premium Vietnamese coffee beans." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>            <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-20">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-coffee-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-coffee-800">Balan Coffee</h1>
                            <p className="text-sm text-coffee-600">& Roastery</p>
                        </div>
                    </Link>
                    
                    <h2 className="text-center text-3xl font-bold text-coffee-800">
                        Đăng ký
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                        {errors.submit && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {errors.submit}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-coffee-700">
                                        Họ *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                errors.firstName ? 'border-red-300' : 'border-coffee-300'
                                            }`}
                                            placeholder="Họ"
                                        />
                                        {errors.firstName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-coffee-700">
                                        Tên *
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                                errors.lastName ? 'border-red-300' : 'border-coffee-300'
                                            }`}
                                            placeholder="Tên"
                                        />
                                        {errors.lastName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-coffee-700">
                                    Email *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                            errors.email ? 'border-red-300' : 'border-coffee-300'
                                        }`}
                                        placeholder="Email"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-coffee-700">
                                    Số điện thoại
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-coffee-300 rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                        placeholder="Số điện thoại"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-coffee-700">
                                    Mật khẩu *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                            errors.password ? 'border-red-300' : 'border-coffee-300'
                                        }`}
                                        placeholder="Mật khẩu"
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-coffee-700">
                                    Xác nhận mật khẩu *
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full px-3 py-2 border rounded-lg placeholder-coffee-400 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 ${
                                            errors.confirmPassword ? 'border-red-300' : 'border-coffee-300'
                                        }`}
                                        placeholder="Xác nhận mật khẩu"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center">
                                    <input
                                        id="agreeTerms"
                                        name="agreeTerms"
                                        type="checkbox"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-coffee-300 rounded"
                                    />
                                    <label htmlFor="agreeTerms" className="ml-2 block text-sm text-coffee-700">
                                        Tôi đồng ý với{' '}
                                        <Link to="/terms" className="text-coffee-600 hover:text-coffee-500">
                                            Terms & Conditions
                                        </Link>
                                    </label>
                                </div>
                                {errors.agreeTerms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
                                )}
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-coffee-600 hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang xử lý...' : 'Đăng ký'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-coffee-600">                                Đã có tài khoản?{' '}
                                <Link to="/login" className="font-medium text-coffee-600 hover:text-coffee-500">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;
