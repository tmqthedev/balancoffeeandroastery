import React, { useState, useEffect, useCallback } from 'react';
import SEOHelmet from '../../components/common/SEOHelmet';

const CRMSalesManagement = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [pipelineStages, setPipelineStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    stageId: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  useEffect(() => {
    fetchData();
  }, [fetchData, filters]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch opportunities and pipeline stages in parallel
      const [opportunitiesResponse, stagesResponse] = await Promise.all([
        fetch(`/api/crm/sales/opportunities?${new URLSearchParams(filters)}`, {
          credentials: 'include'
        }),
        fetch('/api/crm/sales/pipeline-stages', {
          credentials: 'include'
        })
      ]);

      if (opportunitiesResponse.ok && stagesResponse.ok) {
        const [opportunitiesData, stagesData] = await Promise.all([
          opportunitiesResponse.json(),
          stagesResponse.json()
        ]);
        
        setOpportunities(opportunitiesData.data);
        setPipelineStages(stagesData.data);      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateOpportunity = async (opportunityData) => {
    try {
      const response = await fetch('/api/crm/sales/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(opportunityData)
      });

      if (response.ok) {
        await fetchData();
        setShowCreateModal(false);
        alert('Tạo cơ hội bán hàng thành công!');
      } else {
        alert('Lỗi khi tạo cơ hội bán hàng');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      alert('Lỗi khi tạo cơ hội bán hàng');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'open': 'bg-blue-100 text-blue-800',
      'won': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };

    const statusNames = {
      'open': 'Đang mở',
      'won': 'Thành công',
      'lost': 'Thất bại',
      'cancelled': 'Đã hủy'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusNames[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (probability) => {
    if (probability >= 75) return 'bg-green-100 text-green-800';
    if (probability >= 50) return 'bg-yellow-100 text-yellow-800';
    if (probability >= 25) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHelmet 
        title="Quản lý bán hàng - CRM"
        description="Quản lý cơ hội bán hàng và pipeline"
      />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý bán hàng</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Theo dõi cơ hội bán hàng và pipeline
                </p>
              </div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Tạo cơ hội mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sales Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng cơ hội
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {opportunities.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tổng giá trị
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Đang mở
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {opportunities.filter(opp => opp.status === 'open').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Thành công
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {opportunities.filter(opp => opp.status === 'won').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="open">Đang mở</option>
                <option value="won">Thành công</option>
                <option value="lost">Thất bại</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label htmlFor="stageId" className="block text-sm font-medium text-gray-700 mb-1">
                Giai đoạn
              </label>
              <select
                id="stageId"
                name="stageId"
                value={filters.stageId}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Tất cả giai đoạn</option>
                {pipelineStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.nameVi || stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div></div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', assignedTo: '', stageId: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Cơ hội bán hàng ({opportunities.length})
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
                      Cơ hội
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá trị
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giai đoạn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xác suất
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phụ trách
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đóng dự kiến
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{opportunity.customerName}</div>
                        <div className="text-sm text-gray-500">{opportunity.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(opportunity.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.stageNameVi || opportunity.stageName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(opportunity.probability)}`}>
                          {opportunity.probability}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {opportunity.assignedToName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(opportunity.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opportunity.expectedCloseDate ? 
                          new Date(opportunity.expectedCloseDate).toLocaleDateString('vi-VN') : 
                          'Chưa xác định'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {opportunities.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">Không tìm thấy cơ hội bán hàng nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Opportunity Modal */}
      {showCreateModal && (
        <CreateOpportunityModal
          pipelineStages={pipelineStages}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateOpportunity}
        />
      )}
    </div>
  );
};

// Create Opportunity Modal Component
const CreateOpportunityModal = ({ pipelineStages, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    stageId: pipelineStages[0]?.id || '',
    assignedTo: '',
    value: '',
    probability: '',
    expectedCloseDate: '',
    description: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Tạo cơ hội bán hàng mới
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="createTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cơ hội
                </label>
                <input
                  id="createTitle"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="createCustomerId" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Khách hàng
                </label>
                <input
                  id="createCustomerId"
                  type="number"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="createStageId" className="block text-sm font-medium text-gray-700 mb-1">
                  Giai đoạn
                </label>
                <select
                  id="createStageId"
                  name="stageId"
                  value={formData.stageId}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  {pipelineStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.nameVi || stage.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="createAssignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                  ID Người phụ trách
                </label>
                <input
                  id="createAssignedTo"
                  type="number"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="createValue" className="block text-sm font-medium text-gray-700 mb-1">
                  Giá trị (VND)
                </label>
                <input
                  id="createValue"
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="createProbability" className="block text-sm font-medium text-gray-700 mb-1">
                  Xác suất (%)
                </label>
                <input
                  id="createProbability"
                  type="number"
                  name="probability"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="createExpectedCloseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày đóng dự kiến
                </label>
                <input
                  id="createExpectedCloseDate"
                  type="date"
                  name="expectedCloseDate"
                  value={formData.expectedCloseDate}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="createDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="createDescription"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Tạo cơ hội
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CRMSalesManagement;
