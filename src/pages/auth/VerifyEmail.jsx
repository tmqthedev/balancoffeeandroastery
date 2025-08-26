import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/sharedAuth';
import { LoadingSpinner } from '../../components/common/Loading';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    
    const [verificationState, setVerificationState] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [hasVerified, setHasVerified] = useState(false); // Flag to prevent multiple verifications

    const token = searchParams.get('token');

    useEffect(() => {
        const verifyEmail = async () => {
            if (!token || hasVerified) {
                if (!token) {
                    setVerificationState('error');
                    setMessage('Token xác thực không hợp lệ.');
                }
                return;
            }

            setHasVerified(true); // Set flag immediately to prevent duplicate calls

            try {
                const response = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (data.success) {
                    setVerificationState('success');
                    setMessage(data.message);
                    
                    // Auto login if token is provided
                    if (data.token) {
                        try {
                            await loginWithToken(data.token);
                            setTimeout(() => {
                                navigate('/');
                            }, 3000);
                        } catch (loginError) {
                            console.error('Auto login failed:', loginError);
                        }
                    }
                } else {
                    setVerificationState('error');
                    setMessage(data.message || 'Có lỗi xảy ra khi xác thực email.');
                    setHasVerified(false); // Reset flag on error to allow retry
                }
            } catch (error) {
                console.error('Email verification error:', error);
                setVerificationState('error');
                setMessage('Có lỗi xảy ra khi xác thực email. Vui lòng thử lại.');
                setHasVerified(false); // Reset flag on error to allow retry
            }
        };

        verifyEmail();
    }, [token, loginWithToken, navigate, hasVerified]);

    const handleResendVerification = async (e) => {
        e.preventDefault();
        
        if (!resendEmail.trim()) {
            alert('Vui lòng nhập địa chỉ email');
            return;
        }

        setIsResending(true);
        
        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resendEmail }),
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn.');
                setResendEmail('');
            } else {
                alert(data.message || 'Có lỗi xảy ra khi gửi email xác thực.');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsResending(false);
        }
    };

    if (verificationState === 'verifying') {
        return <LoadingSpinner message="Đang xác thực email..." />;
    }

    return (
        <>
            <Helmet>
                <title>Xác thực Email - Balan Coffee & Roastery</title>
                <meta name="description" content="Xác thực địa chỉ email để kích hoạt tài khoản Balan Coffee" />
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-coffee-light to-cream-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center">
                            {verificationState === 'success' ? (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-coffee-dark mb-4">
                                        🎉 Xác thực thành công!
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {message}
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                                        <p className="text-green-700 text-sm">
                                            ✨ Chào mừng bạn đến với Balan Coffee! Bạn sẽ được chuyển hướng về trang chủ trong giây lát...
                                        </p>
                                    </div>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-coffee-dark hover:bg-coffee-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-light"
                                    >
                                        Về trang chủ
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-coffee-dark mb-4">
                                        ❌ Xác thực thất bại
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {message}
                                    </p>
                                    
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                                        <h3 className="text-yellow-800 font-semibold mb-2">Gửi lại email xác thực</h3>
                                        <p className="text-yellow-700 text-sm mb-4">
                                            Nếu link xác thực đã hết hạn, bạn có thể yêu cầu gửi lại email xác thực mới.
                                        </p>
                                        <form onSubmit={handleResendVerification} className="space-y-3">
                                            <input
                                                type="email"
                                                placeholder="Nhập địa chỉ email của bạn"
                                                value={resendEmail}
                                                onChange={(e) => setResendEmail(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-light"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={isResending}
                                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isResending ? 'Đang gửi...' : 'Gửi lại email xác thực'}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            to="/auth"
                                            className="inline-flex items-center px-4 py-2 border border-coffee-dark text-sm font-medium rounded-md text-coffee-dark bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-light"
                                        >
                                            Quay lại đăng nhập
                                        </Link>
                                        <br />
                                        <Link
                                            to="/"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-coffee-dark hover:bg-coffee-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-light"
                                        >
                                            Về trang chủ
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {/* Support Information */}
                    <div className="text-center text-sm text-gray-600">
                        <p>Cần hỗ trợ? Liên hệ chúng tôi:</p>
                        <p>
                            📧 <a href="mailto:support@balancoffee.com" className="text-coffee-dark hover:underline">support@balancoffee.com</a>
                            {' | '}
                            📞 <a href="tel:02812345678" className="text-coffee-dark hover:underline">(028) 1234 5678</a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;
