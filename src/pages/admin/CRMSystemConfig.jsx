import React, { useState, useEffect, useCallback } from 'react';
import SEOHelmet from '../../components/common/SEOHelmet';

const CRMSystemConfig = () => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const modules = [
    { value: '', label: 'Tất cả modules' },
    { value: 'general', label: 'Cài đặt chung' },
    { value: 'sales', label: 'Bán hàng' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'support', label: 'Hỗ trợ khách hàng' },
    { value: 'system', label: 'Hệ thống' }
  ];
  useEffect(() => {
    fetchConfigurations();
  }, [fetchConfigurations, selectedModule]);

  const fetchConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedModule ? 
        `/api/crm/system/configurations?module=${selectedModule}` : 
        '/api/crm/system/configurations';

      const response = await fetch(url, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigurations(data.data);
      } else {
        console.error('Failed to fetch configurations');
      }    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedModule]);

  const handleModuleChange = (e) => {
    setSelectedModule(e.target.value);
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingConfig(null);
  };

  const handleSaveConfig = async (configData) => {
    try {
      const response = await fetch(`/api/crm/system/configurations/${editingConfig.module}/${editingConfig.configKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ value: configData.configValue })
      });

      if (response.ok) {
        await fetchConfigurations();
        handleCloseModal();
        alert('Cập nhật cấu hình thành công!');
      } else {
        alert('Lỗi khi cập nhật cấu hình');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert('Lỗi khi cập nhật cấu hình');
    }
  };

  const groupedConfigurations = configurations.reduce((acc, config) => {
    if (!acc[config.module]) {
      acc[config.module] = [];
    }
    acc[config.module].push(config);
    return acc;
  }, {});

  const getModuleDisplayName = (module) => {
    const moduleMap = {
      'general': 'Cài đặt chung',
      'sales': 'Bán hàng',
      'marketing': 'Marketing',
      'support': 'Hỗ trợ khách hàng',
      'system': 'Hệ thống'
    };
    return moduleMap[module] || module;
  };

  const getDataTypeIcon = (dataType) => {
    switch (dataType) {
      case 'string':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'number':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'boolean':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'json':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHelmet 
        title="Cấu hình hệ thống - CRM"
        description="Quản lý cấu hình và thiết lập hệ thống CRM"
      />
      
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Quản lý các thiết lập và cấu hình của hệ thống CRM
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedModule}
                  onChange={handleModuleChange}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {modules.map((module) => (
                    <option key={module.value} value={module.value}>
                      {module.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Đang tải cấu hình...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedConfigurations).map(([module, configs]) => (
              <div key={module} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getModuleDisplayName(module)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {configs.length} cấu hình
                  </p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {configs.map((config) => (
                    <div key={`${config.module}-${config.configKey}`} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getDataTypeIcon(config.dataType)}
                            <h4 className="text-sm font-medium text-gray-900">
                              {config.configKey}
                            </h4>
                            {config.isSecret && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Bảo mật
                              </span>
                            )}
                          </div>
                          
                          {config.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {config.description}
                            </p>
                          )}
                          
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">Giá trị hiện tại: </span>
                            <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                              {config.isSecret ? '••••••••' : (config.configValue || 'Chưa đặt')}
                            </span>
                          </div>
                          
                          {config.updatedAt && (
                            <p className="mt-1 text-xs text-gray-400">
                              Cập nhật lần cuối: {new Date(config.updatedAt).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            config.dataType === 'string' ? 'bg-blue-100 text-blue-800' :
                            config.dataType === 'number' ? 'bg-green-100 text-green-800' :
                            config.dataType === 'boolean' ? 'bg-purple-100 text-purple-800' :
                            config.dataType === 'json' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {config.dataType}
                          </span>
                          
                          <button
                            onClick={() => handleEditConfig(config)}
                            className="text-amber-600 hover:text-amber-900 text-sm font-medium"
                          >
                            Chỉnh sửa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedConfigurations).length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">Không tìm thấy cấu hình nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Configuration Modal */}
      {showEditModal && editingConfig && (
        <EditConfigModal
          config={editingConfig}
          onClose={handleCloseModal}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
};

// Edit Configuration Modal Component
const EditConfigModal = ({ config, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    configValue: config.configValue || ''
  });

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      configValue: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderInput = () => {
    switch (config.dataType) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              id="configValue"
              type="checkbox"
              name="configValue"
              checked={formData.configValue === 'true' || formData.configValue === true}
              onChange={(e) => setFormData({ configValue: e.target.checked.toString() })}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
            />
            <label htmlFor="configValue" className="ml-2 block text-sm text-gray-900">
              Bật/Tắt
            </label>
          </div>
        );
      
      case 'number':
        return (
          <input
            id="configValue"
            type="number"
            name="configValue"
            value={formData.configValue}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        );
      
      case 'json':
        return (
          <textarea
            id="configValue"
            name="configValue"
            value={formData.configValue}
            onChange={handleInputChange}
            rows={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            placeholder="Nhập JSON hợp lệ..."
            required
          />
        );
      
      default:
        return (
          <input
            id="configValue"
            type={config.isSecret ? 'password' : 'text'}
            name="configValue"
            value={formData.configValue}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Chỉnh sửa cấu hình
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module
              </label>
              <input
                type="text"
                value={config.module}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khóa cấu hình
              </label>
              <input
                type="text"
                value={config.configKey}
                disabled
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100 text-gray-500"
              />
            </div>

            {config.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                  {config.description}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="configValue" className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị ({config.dataType})
              </label>
              {renderInput()}
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
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CRMSystemConfig;
