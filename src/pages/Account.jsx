import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../constants/authConstants';
import { formatDateForInput, formatDateForBackend } from '../utils/dateUtils';
import axios from 'axios';

const Account = () => {
  const { user, updateUserInfo, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    // Address information
    address: '',
    wardCommune: '',
    district: '',
    province: '',
    postalCode: ''
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
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
      console.log('📍 Loading address data from user context:', defaultAddress);
      console.log('👤 Current user object:', user);
      
      // Handle data migration: current data has city="Long Bình" but no wardCommune/district
      // We need to properly map this
      let wardCommune = '';
      let district = '';
      
      if (defaultAddress) {
        // If new format exists, use it
        if (defaultAddress.wardCommune) {
          wardCommune = defaultAddress.wardCommune;
        }
        if (defaultAddress.district) {
          district = defaultAddress.district;
        }
        
        // If old format, we need user to re-enter
        if (!wardCommune && !district && defaultAddress.city) {
          console.log('⚠️  Legacy data detected. City field:', defaultAddress.city);
          // For now, leave empty to force user to re-enter properly
        }
      }
      
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth) || '',
        gender: user.gender || '',
        // Address information - Vietnamese format
        address: defaultAddress?.street || defaultAddress?.address1 || '',
        wardCommune: wardCommune,
        district: district,
        province: defaultAddress?.province || '',
        postalCode: defaultAddress?.postalCode || ''
      });
      
      console.log('📝 Updated formData:', {
        address: defaultAddress?.street || defaultAddress?.address1 || '',
        wardCommune: wardCommune,
        district: district,
        province: defaultAddress?.province || ''
      });
    }
  }, [user]); // This will trigger whenever user context changes

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submitted!');
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for backend
      const updateData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formatDateForBackend(formData.dateOfBirth) : ''
      };
      
      console.log('📤 Sending update data to backend:', JSON.stringify(updateData, null, 2));
      console.log('📊 Current formData state:', formData);
      
      const response = await updateUserInfo(updateData);
      console.log('📥 Backend response:', response);
      
      if (response.success) {
        setSuccess('Cập nhật thông tin thành công!');
        console.log('✅ Update successful!');
        
        // Force reload formData from updated user context after a short delay
        setTimeout(() => {
          const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];
          console.log('🔄 Reloading form data from updated user context:', defaultAddress);
          
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            dateOfBirth: formatDateForInput(user.dateOfBirth) || '',
            gender: user.gender || '',
            // Address information - Vietnamese format
            address: defaultAddress?.street || defaultAddress?.address1 || '',
            wardCommune: defaultAddress?.wardCommune || '',
            district: defaultAddress?.district || defaultAddress?.city || '', // Handle legacy city field
            province: defaultAddress?.province || '',
            postalCode: defaultAddress?.postalCode || ''
          });
        }, 100);
        
      } else {
        console.log('❌ Update failed with response:', response);
        setError(response.message || 'Cập nhật thất bại');
      }    } catch (error) {
      console.error('❌ Profile update error:', error);
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

  const tabs = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: '👤' },
    { id: 'password', name: 'Đổi mật khẩu', icon: '🔒' }
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
                  Xin chào, {user?.firstName || user?.email}!
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
                          ? 'bg-brand-secondary/20 text-brand-primary'
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
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>

                        <div>
                          <label htmlFor="last-name-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Tên
                          </label>
                          <input
                            id="last-name-acc"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                          />
                        </div>

                        <div>
                          <label htmlFor="user-birthday-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày sinh
                          </label>
                          <input
                            id="user-birthday-acc"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      {/* Address Information */}
                      <div className="border-t pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Thông tin địa chỉ
                        </h3>
                        
                        <div>
                          <label htmlFor="user-address-acc" className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ
                          </label>
                          <input
                            id="user-address-acc"
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                            placeholder="Số nhà, đường, phường/xã"
                          />
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <label htmlFor="user-ward-acc" className="block text-sm font-medium text-gray-700 mb-2">
                              Phường/Xã
                            </label>
                            <input
                              id="user-ward-acc"
                              type="text"
                              value={formData.wardCommune}
                              onChange={(e) => setFormData({ ...formData, wardCommune: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                            />
                          </div>

                          <div>
                            <label htmlFor="user-district-acc" className="block text-sm font-medium text-gray-700 mb-2">
                              Quận/Huyện
                            </label>
                            <input
                              id="user-district-acc"
                              type="text"
                              value={formData.district}
                              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                            />
                          </div>

                          <div>
                            <label htmlFor="user-province-acc" className="block text-sm font-medium text-gray-700 mb-2">
                              Tỉnh/Thành phố
                            </label>
                            <select
                              id="user-province-acc"
                              value={formData.province}
                              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                            <label htmlFor="user-postal-acc" className="block text-sm font-medium text-gray-700 mb-2">
                              Mã bưu điện
                            </label>
                            <input
                              id="user-postal-acc"
                              type="text"
                              value={formData.postalCode}
                              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        onClick={() => console.log('🔘 Submit button clicked!')}
                        className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </form>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang lưu...' : 'Đổi mật khẩu'}
                      </button>
                    </form>
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

