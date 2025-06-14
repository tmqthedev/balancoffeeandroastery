import React, { useState, useEffect } from 'react';
import SEOHelmet from '../../components/common/SEOHelmet';

const CRMCustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/users?role=customer', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data);
      } else {
        console.error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerProfile = async (customerId) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`/api/crm/customers/${customerId}/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomerProfile(data.data);
      } else {
        console.error('Failed to fetch customer profile');
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleViewProfile = async (customer) => {
    setSelectedCustomer(customer);
    setShowProfileModal(true);
    await fetchCustomerProfile(customer.id);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedCustomer(null);
    setCustomerProfile(null);
  };

  const getCustomerSegmentBadges = (segments) => {
    return segments?.map((segment, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1"
      >
        {segment.nameVi || segment.name}
      </span>
    ));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHelmet 
        title="Quản lý khách hàng - CRM"
        description="Quản lý thông tin và tương tác với khách hàng"
      />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Xem và quản lý thông tin khách hàng
                </p>
              </div>
              
              <button className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                Thêm khách hàng
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Customers Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Danh sách khách hàng ({customers.length})
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã mua
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lần cuối mua
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {customer.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={customer.profileImage}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-amber-800">
                                  {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {customer.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone || 'Chưa có SĐT'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders || 0} đơn
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastOrderDate ? 
                          new Date(customer.lastOrderDate).toLocaleDateString('vi-VN') : 
                          'Chưa mua hàng'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewProfile(customer)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Xem hồ sơ
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Liên hệ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {customers.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Không tìm thấy khách hàng nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Profile Modal */}
      {showProfileModal && selectedCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Hồ sơ khách hàng: {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {profileLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Đang tải hồ sơ...</p>
                </div>
              ) : customerProfile ? (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Email</dt>
                          <dd className="text-sm text-gray-900">{customerProfile.customer.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Điện thoại</dt>
                          <dd className="text-sm text-gray-900">{customerProfile.customer.phone || 'Chưa có'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Địa chỉ</dt>
                          <dd className="text-sm text-gray-900">
                            {customerProfile.customer.address ? 
                              `${customerProfile.customer.address}, ${customerProfile.customer.city || ''}` : 
                              'Chưa có'
                            }
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Ngày tham gia</dt>
                          <dd className="text-sm text-gray-900">
                            {new Date(customerProfile.customer.createdAt).toLocaleDateString('vi-VN')}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Thống kê mua hàng</h4>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tổng đơn hàng</dt>
                          <dd className="text-sm text-gray-900">{customerProfile.customer.totalOrders || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Tổng chi tiêu</dt>
                          <dd className="text-sm text-gray-900">{formatCurrency(customerProfile.customer.totalSpent)}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Lần mua đầu</dt>
                          <dd className="text-sm text-gray-900">
                            {customerProfile.customer.firstOrderDate ? 
                              new Date(customerProfile.customer.firstOrderDate).toLocaleDateString('vi-VN') : 
                              'Chưa mua hàng'
                            }
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Lần mua cuối</dt>
                          <dd className="text-sm text-gray-900">
                            {customerProfile.customer.lastOrderDate ? 
                              new Date(customerProfile.customer.lastOrderDate).toLocaleDateString('vi-VN') : 
                              'Chưa mua hàng'
                            }
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Phân khúc khách hàng</h4>
                      <div className="space-y-2">
                        {customerProfile.segments && customerProfile.segments.length > 0 ? (
                          customerProfile.segments.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {segment.nameVi || segment.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(segment.assignedAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">Chưa được phân khúc</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Đơn hàng gần đây</h4>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Mã đơn
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Ngày đặt
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Tổng tiền
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customerProfile.recentOrders && customerProfile.recentOrders.length > 0 ? (
                            customerProfile.recentOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="px-4 py-3 text-sm text-gray-900">{order.orderNumber}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(order.total)}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-4 py-3 text-sm text-gray-500 text-center">
                                Chưa có đơn hàng nào
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Interactions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Tương tác gần đây</h4>
                    <div className="space-y-3">
                      {customerProfile.recentInteractions && customerProfile.recentInteractions.length > 0 ? (
                        customerProfile.recentInteractions.map((interaction) => (
                          <div key={interaction.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">{interaction.subject}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(interaction.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{interaction.content}</p>
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span className="mr-2">Loại: {interaction.interactionType}</span>
                              {interaction.staffName && (
                                <span>Phụ trách: {interaction.staffName}</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Chưa có tương tác nào</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Không thể tải hồ sơ khách hàng</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMCustomerManagement;
