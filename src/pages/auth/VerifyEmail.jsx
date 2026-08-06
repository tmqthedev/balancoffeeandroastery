import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/apiClient';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/confirm-sign-up', {
        email: formData.email,
        code: formData.code
      });

      setMessage('Email đã được xác thực. Bạn có thể đăng nhập.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Xác thực email thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/auth/resend-confirmation', { email: formData.email });
      setMessage('Mã xác thực đã được gửi lại.');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Không thể gửi lại mã xác thực.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Xác thực Email - Balan Coffee & Roastery</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-brand-primary mb-2 text-center">
            Xác thực email
          </h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Nhập mã xác nhận mà Cognito đã gửi vào email của bạn.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Mã xác thực
              </label>
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg text-white bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực email'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading || !formData.email}
            className="mt-3 w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Gửi lại mã xác thực
          </button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-brand-primary hover:text-brand-primary/80">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
