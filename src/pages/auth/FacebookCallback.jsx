import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/sharedAuth';

const FacebookCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Đăng nhập Facebook thất bại. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Không nhận được token từ Facebook. Vui lòng thử lại.');
          setLoading(false);
          return;
        }

        // Use the token to authenticate
        await loginWithToken(token);
        
        // Redirect to home page or intended destination
        const from = sessionStorage.getItem('authRedirect') || '/';
        sessionStorage.removeItem('authRedirect');
        navigate(from, { replace: true });

      } catch (err) {
        console.error('Facebook callback error:', err);
        setError('Đăng nhập Facebook thất bại. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, loginWithToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Đang xử lý đăng nhập Facebook...
          </h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Đăng nhập thất bại</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition duration-200"
            >
              Quay lại đăng nhập
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FacebookCallback;
