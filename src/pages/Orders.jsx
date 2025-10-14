import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContextConsumer from '../components/common/ContextConsumer';

const OrdersContent = ({ auth }) => {
  const { isAuthenticated } = auth;
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      const token = localStorage.getItem('authToken');
      console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      if (!token) {
        console.error('❌ No auth token found');
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      
      // Decode token to check expiry
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📦 Token payload:', payload);
        console.log('⏰ Token expires:', new Date(payload.exp * 1000).toLocaleString('vi-VN'));
        console.log('🕐 Current time:', new Date().toLocaleString('vi-VN'));
        console.log('✅ Token valid:', new Date(payload.exp * 1000) > new Date());
      } catch (e) {
        console.error('❌ Failed to decode token:', e);
      }
      
      console.log('📡 Sending GET request to /api/orders...');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Orders response:', response.data);
      
      // Handle different response formats
      const ordersData = response.data.data?.orders || response.data.orders || [];
      setOrders(ordersData);
      
      if (ordersData.length === 0) {
        console.log('No orders found for user');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập trang này.');
      } else if (err.response?.status === 500) {
        setError('Lỗi máy chủ. Vui lòng thử lại sau.');
      } else {
        setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Added navigate as dependency for useCallback

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, fetchOrders]); // Added fetchOrders dependency

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status?.toLowerCase()) {
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

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('formatDate error:', err);
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <Helmet>
          <title>Đơn hàng của tôi - Balan Coffee & Roastery</title>
        </Helmet>
        
        {/* Hero Section - Responsive */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary shadow-xl">
          <div className="container-responsive section-padding">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h1 className="heading-1 text-white mb-4">Đơn hàng của tôi</h1>
              <p className="body-text text-brand-white/80">Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </div>
        
        {/* Loading Skeletons - Responsive */}
        <div className="container-responsive section-padding">
          <div className="space-y-4 lg:space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-responsive animate-pulse">
                {/* Order Header */}
                <div className="pb-4 mb-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                      <div className="min-w-0 flex-1">
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-full max-w-xs mb-2"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-7 sm:h-8 bg-gray-200 rounded-full w-24 flex-shrink-0"></div>
                  </div>
                </div>
                
                {/* Order Content - 2 columns on desktop */}
                <div className="grid lg:grid-cols-3 gap-4 lg:gap-8">
                  <div className="lg:col-span-2 space-y-3 lg:space-y-4">
                    {[1, 2].map((j) => (
                      <div key={j} className="h-16 sm:h-20 bg-gray-100 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="h-24 sm:h-32 bg-gray-100 rounded-lg"></div>
                    <div className="h-20 sm:h-24 bg-gray-100 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Đơn hàng của tôi - Balan Coffee & Roastery</title>
        <meta name="description" content="Xem lịch sử đơn hàng và theo dõi trạng thái giao hàng tại Balan Coffee & Roastery" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary/90 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-white">
                    Đơn hàng của tôi
                  </h1>
                </div>
                <p className="text-brand-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0">
                  Theo dõi trạng thái và lịch sử đơn hàng của bạn. Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất.
                </p>
                {orders.length > 0 && (
                  <div className="flex items-center justify-center lg:justify-start space-x-4 sm:space-x-6 mt-4 sm:mt-6 text-brand-white/80">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-brand-secondary">{orders.length}</div>
                      <div className="text-xs sm:text-sm">Đơn hàng</div>
                    </div>
                    <div className="w-px h-6 sm:h-8 bg-brand-white/30"></div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-brand-secondary">
                        {orders.reduce((total, order) => total + (order.items?.length || 0), 0)}
                      </div>
                      <div className="text-xs sm:text-sm">Sản phẩm</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-brand-secondary text-brand-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-brand-secondary/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-secondary/30 text-sm sm:text-base"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Tiếp tục mua sắm</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/account')}
                  className="bg-transparent text-brand-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-brand-white/10 transition-all duration-200 font-medium shadow-lg border border-brand-white/30 focus:outline-none focus:ring-4 focus:ring-brand-white/30 text-sm sm:text-base"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden sm:inline">Tài khoản</span>
                    <span className="sm:hidden">TK</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Chưa có đơn hàng nào
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Bạn chưa thực hiện đơn hàng nào. Hãy khám phá các sản phẩm cà phê tuyệt vời của chúng tôi và bắt đầu hành trình thưởng thức!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/products')}
                  className="bg-brand-primary text-white px-8 py-3 rounded-lg hover:bg-brand-primary/90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-brand-primary/30"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Khám phá sản phẩm</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="bg-white text-brand-primary px-8 py-3 rounded-lg border-2 border-brand-primary hover:bg-gray-50 transition-all duration-200 font-medium focus:outline-none focus:ring-4 focus:ring-brand-primary/30"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Tìm hiểu về chúng tôi</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => (
                <div key={order._id || order.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
                  {/* Order Header */}
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-start lg:items-center gap-2 sm:gap-4">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
                            #{order.orderNumber || order._id?.slice(-8) || order.id?.slice(-8)}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-600 sm:space-x-4 space-y-1 sm:space-y-0">
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="truncate">{formatDate(order.createdAt || order.created_at)}</span>
                            </div>
                            {order.items && (
                              <div className="flex items-center space-x-1">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                <span>{order.items.length} sản phẩm</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end space-x-3 sm:space-x-0 sm:space-y-2">
                        <span className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 ${getOrderStatusColor(order.status)} shadow-sm whitespace-nowrap`}>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                          {getOrderStatusText(order.status)}
                        </span>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-primary whitespace-nowrap">
                            {formatCurrency(order.total || order.total_amount)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                            Tổng thanh toán
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                      {/* Items Section */}
                      {order.items && order.items.length > 0 && (
                        <div className="lg:col-span-2">
                          <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <h4 className="text-base sm:text-lg font-semibold text-gray-900">Sản phẩm đã đặt</h4>
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                                      {item.productName || item.name}
                                    </h5>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                                      <span className="flex items-center space-x-1">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10l1 16H6L7 4z" />
                                        </svg>
                                        <span>SL: {item.quantity}</span>
                                      </span>
                                      <span className="flex items-center space-x-1">
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <span className="truncate">{formatCurrency(item.price || item.subtotal / item.quantity)}</span>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right ml-2 sm:ml-4 flex-shrink-0">
                                  <div className="text-base sm:text-lg font-bold text-gray-900 whitespace-nowrap">
                                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                                  </div>
                                  <div className="text-[10px] sm:text-xs text-gray-500">Thành tiền</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Order Details Section */}
                      <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-blue-100">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <h4 className="font-semibold text-blue-900 text-sm sm:text-base">Địa chỉ giao hàng</h4>
                            </div>
                            <div className="text-xs sm:text-sm text-blue-800 space-y-0.5 sm:space-y-1">
                              <p className="font-medium">{order.shippingAddress.street}</p>
                              {order.shippingAddress.wardCommune && (
                                <p>P/X: {order.shippingAddress.wardCommune}</p>
                              )}
                              {order.shippingAddress.district && (
                                <p>Q/H: {order.shippingAddress.district}</p>
                              )}
                              <p>T/TP: {order.shippingAddress.province}</p>
                              {order.shippingAddress.postalCode && (
                                <p>Mã BĐ: {order.shippingAddress.postalCode}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Payment Method */}
                        {order.paymentMethod && (() => {
                          let paymentMethodText;
                          if (order.paymentMethod === 'cod') {
                            paymentMethodText = 'Thanh toán khi nhận hàng (COD)';
                          } else if (order.paymentMethod === 'contact') {
                            paymentMethodText = 'Liên hệ trực tiếp để thanh toán';
                          } else {
                            paymentMethodText = order.paymentMethod.toUpperCase();
                          }
                          return (
                            <div className="bg-green-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-green-100">
                              <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                <h4 className="font-semibold text-green-900 text-sm sm:text-base">Thanh toán</h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                {order.paymentMethod === 'cod' && (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  </div>
                                )}
                                {order.paymentMethod === 'contact' && (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </div>
                                )}
                                <span className="text-xs sm:text-sm font-medium text-green-800">
                                  {paymentMethodText}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Order Notes */}
                        {order.notes && (
                          <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 lg:p-5 border border-yellow-100">
                            <div className="flex items-center space-x-2 mb-2 sm:mb-3">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <h4 className="font-semibold text-yellow-900 text-sm sm:text-base">Ghi chú</h4>
                            </div>
                            <p className="text-xs sm:text-sm text-yellow-800 break-words">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate">Mã: #{order.orderNumber || order._id?.slice(-8)}</span>
                        </div>
                        {order.paymentMethod && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="truncate">PT: {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'contact' ? 'Liên hệ' : order.paymentMethod.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Main component using ContextConsumer
const Orders = () => {
  return (
    <ContextConsumer>
      {({ auth }) => (
        <OrdersContent auth={auth} />
      )}
    </ContextConsumer>
  );
};

export default Orders;
