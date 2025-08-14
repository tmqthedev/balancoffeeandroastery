import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminCMS = () => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Content sections
  const contentSections = [
    {
      key: 'homepage_hero',
      title: 'Trang chủ - Hero Section',
      fields: [
        { name: 'title', label: 'Tiêu đề chính', type: 'text' },
        { name: 'subtitle', label: 'Tiêu đề phụ', type: 'textarea' },
        { name: 'cta_text', label: 'Text nút CTA', type: 'text' },
        { name: 'cta_link', label: 'Link nút CTA', type: 'text' }
      ]
    },
    {
      key: 'homepage_features',
      title: 'Trang chủ - Tính năng nổi bật',
      fields: [
        { name: 'title', label: 'Tiêu đề section', type: 'text' },
        { name: 'feature1_title', label: 'Tính năng 1 - Tiêu đề', type: 'text' },
        { name: 'feature1_desc', label: 'Tính năng 1 - Mô tả', type: 'textarea' },
        { name: 'feature2_title', label: 'Tính năng 2 - Tiêu đề', type: 'text' },
        { name: 'feature2_desc', label: 'Tính năng 2 - Mô tả', type: 'textarea' },
        { name: 'feature3_title', label: 'Tính năng 3 - Tiêu đề', type: 'text' },
        { name: 'feature3_desc', label: 'Tính năng 3 - Mô tả', type: 'textarea' }
      ]
    },
    {
      key: 'about_page',
      title: 'Trang giới thiệu',
      fields: [
        { name: 'hero_title', label: 'Tiêu đề chính', type: 'text' },
        { name: 'hero_subtitle', label: 'Tiêu đề phụ', type: 'textarea' },
        { name: 'story_title', label: 'Câu chuyện - Tiêu đề', type: 'text' },
        { name: 'story_content', label: 'Câu chuyện - Nội dung', type: 'editor' },
        { name: 'mission_title', label: 'Sứ mệnh - Tiêu đề', type: 'text' },
        { name: 'mission_content', label: 'Sứ mệnh - Nội dung', type: 'textarea' }
      ]
    },
    {
      key: 'contact_info',
      title: 'Thông tin liên hệ',
      fields: [
        { name: 'address', label: 'Địa chỉ', type: 'text' },
        { name: 'phone', label: 'Số điện thoại', type: 'text' },
        { name: 'email', label: 'Email', type: 'text' },
        { name: 'working_hours', label: 'Giờ làm việc', type: 'textarea' },
        { name: 'facebook_url', label: 'Facebook URL', type: 'text' },
        { name: 'instagram_url', label: 'Instagram URL', type: 'text' }
      ]
    }
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/cms/content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(response.data.content || {});
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Không thể tải nội dung CMS');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (sectionKey) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/admin/cms/content', {
        section: sectionKey,
        content: content[sectionKey] || {}
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Đã lưu thành công: ${contentSections.find(s => s.key === sectionKey)?.title}`);
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Lỗi khi lưu nội dung');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (sectionKey, fieldName, value) => {
    setContent(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldName]: value
      }
    }));
  };

  const renderField = (sectionKey, field) => {
    const value = content[sectionKey]?.[field.name] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
            value={value}
            onChange={(e) => handleInputChange(sectionKey, field.name, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
            value={value}
            onChange={(e) => handleInputChange(sectionKey, field.name, e.target.value)}
          />
        );
      
      case 'editor':
        return (
          <textarea
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
            value={value}
            onChange={(e) => handleInputChange(sectionKey, field.name, e.target.value)}
            placeholder="Hỗ trợ HTML và Markdown"
          />
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
        <span className="ml-3 text-gray-600">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý nội dung CMS</h1>
        <p className="mt-2 text-gray-600">
          Quản lý nội dung trang web, văn bản và thông tin hiển thị
        </p>
      </div>

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

      <div className="space-y-8">
        {contentSections.map((section) => (
          <div key={section.key} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
              <button
                onClick={() => handleSave(section.key)}
                disabled={saving}
                className="bg-coffee-600 text-white px-4 py-2 rounded-md hover:bg-coffee-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

            <div className="grid gap-6">
              {section.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  {renderField(section.key, field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thao tác nhanh
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              contentSections.forEach(section => handleSave(section.key));
            }}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Lưu tất cả thay đổi
          </button>
          
          <button
            onClick={fetchContent}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Khôi phục từ database
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn reset tất cả nội dung về mặc định?')) {
                setContent({});
                setSuccess('Đã reset tất cả nội dung');
              }
            }}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Reset tất cả
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
