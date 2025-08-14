import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Account = () => {
  const { user, updateUserInfo, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateUserInfo(formData);
      if (response.success) {
        setSuccess('Cập nhật thông tin thành công!');
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }    } catch {
      setError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('/api/users/change-password', passwordData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.data.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response.data.message || 'Đổi mật khẩu thất bại');
      }    } catch (error) {
      console.error('Password change error:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount * 25000); // Convert USD to VND
  };


  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đã gửi hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const renderOrdersContent = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
          <p className="mt-2 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 bg-coffee-600 text-white px-6 py-2 rounded-md hover:bg-coffee-700 transition-colors"
          >
            Mua sắm ngay
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Đơn hàng #{order.id}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                {getOrderStatusText(order.status)}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="text-lg font-semibold text-gray-900">
                Tổng: {formatCurrency(order.total_amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: '👤' },
    { id: 'orders', name: 'Đơn hàng', icon: '📦' },
    { id: 'password', name: 'Đổi mật khẩu', icon: '🔒' },
    { id: 'preferences', name: 'Tùy chọn', icon: '⚙️' }
  ];

  return (
    <>
      <Helmet>
        <title>Tài khoản của tôi - Balan Coffee & Roastery</title>
        <meta name="description" content="Quản lý thông tin tài khoản, đơn hàng và tùy chọn cá nhân tại Balan Coffee & Roastery" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Xin chào, {user?.first_name || user?.email}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Quản lý thông tin và đơn hàng của bạn
                </p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <nav className="space-y-1 p-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-coffee-100 text-coffee-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
                    {success}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Thông tin cá nhân
                    </h2>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="first-name-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Họ
                          </label>
                          <input
                            id="first-name-acc"
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="last-name-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Tên
                          </label>
                          <input
                            id="last-name-acc"
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="user-email-acc" className="block text-sm font-medium text-gray-700 mb-2">
                          Email (không thể thay đổi)
                        </label>
                        <input
                          id="user-email-acc"
                          type="email"
                          value={formData.email}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                          title="Email không thể thay đổi vì lý do bảo mật"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="user-phone-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                          </label>
                          <input
                            id="user-phone-acc"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="user-birthday-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày sinh
                          </label>
                          <input
                            id="user-birthday-acc"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="user-gender-acc" className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính
                        </label>
                        <select
                          id="user-gender-acc"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-coffee-600 text-white px-6 py-2 rounded-md hover:bg-coffee-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Đơn hàng của tôi
                    </h2>
                    {renderOrdersContent()}
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Đổi mật khẩu
                    </h2>                    <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                      <div>
                        <label htmlFor="current-password-acc" className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          id="current-password-acc"
                          type="password"
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="new-password-acc" className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu mới
                        </label>
                        <input
                          id="new-password-acc"
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirm-password-acc" className="block text-sm font-medium text-gray-700 mb-2">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          id="confirm-password-acc"
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-coffee-600 text-white px-6 py-2 rounded-md hover:bg-coffee-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Tùy chọn
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Thông báo
                        </h3>                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Nhận thông báo qua email</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Cập nhật trạng thái đơn hàng</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Nhận bản tin khuyến mãi</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Quyền riêng tư
                        </h3>
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" />
                            <span>Chia sẻ dữ liệu với đối tác</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="mr-3" defaultChecked />
                            <span>Cho phép phân tích hành vi</span>
                          </label>
                        </div>
                      </div>

                      <button className="bg-coffee-600 text-white px-6 py-2 rounded-md hover:bg-coffee-700 transition-colors">
                        Lưu tùy chọn
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;

