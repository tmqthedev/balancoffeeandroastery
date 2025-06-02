import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import axios from 'axios';

const AdminProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [formData, setFormData] = useState({
    name: '',
    nameVi: '',
    slug: '',
    description: '',
    descriptionVi: '',
    shortDescription: '',
    shortDescriptionVi: '',
    price: '',
    comparePrice: '',
    sku: '',
    stockQuantity: '',
    weight: '',
    roastLevel: '',
    origin: '',
    processingMethod: '',
    metaTitle: '',
    metaTitleVi: '',
    metaDescription: '',
    metaDescriptionVi: '',
    isFeatured: false,
    isActive: true,
    categoryIds: [],
    images: [] // Changed from separate images state to be part of formData
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit, fetchProduct]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const product = response.data;
      setFormData({
        name: product.name || '',
        nameVi: product.nameVi || '',
        slug: product.slug || '',
        description: product.description || '',
        descriptionVi: product.descriptionVi || '',
        shortDescription: product.shortDescription || '',
        shortDescriptionVi: product.shortDescriptionVi || '',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        sku: product.sku || '',
        stockQuantity: product.stockQuantity || '',
        weight: product.weight || '',
        roastLevel: product.roastLevel || '',
        origin: product.origin || '',
        processingMethod: product.processingMethod || '',
        metaTitle: product.metaTitle || '',
        metaTitleVi: product.metaTitleVi || '',
        metaDescription: product.metaDescription || '',
        metaDescriptionVi: product.metaDescriptionVi || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== false,
        categoryIds: product.categories || [],
        images: product.images || []
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));    // Auto-generate slug from name
    if (field === 'name' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleImageAdd = () => {
    const imageUrl = prompt('Nhập URL hình ảnh:');
    if (imageUrl?.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (index, newUrl) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? newUrl : img)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        comparePrice: parseFloat(formData.comparePrice) || null,
        stockQuantity: parseInt(formData.stockQuantity) || 0
      };

      const url = isEdit ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = isEdit ? 'put' : 'post';

      await axios[method](url, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate('/admin/products');
    } catch (error) {
      console.error('Save error:', error);
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={`loading-skeleton-${i}-${Math.random().toString(36).slice(2, 9)}`} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h1>
            <p className="mt-2 text-gray-600">
              {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Tạo sản phẩm mới trong danh mục'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Basic Information */}          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="nameVi" className="block text-sm font-medium text-gray-700 mb-2">
                  Tên sản phẩm (Tiếng Việt) *
                </label>
                <input
                  id="nameVi"
                  type="text"
                  value={formData.nameVi}
                  onChange={(e) => handleInputChange('nameVi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug *                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  id="sku"
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hình ảnh sản phẩm</h3>
            <div className="space-y-4">
              {formData.images.map((image, index) => (
                <div key={`product-image-${Math.random().toString(36).slice(2, 9)}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img 
                    src={image} 
                    alt={`Product ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTZWN0EyIDIgMCAwIDEgNSA1SDE5QTIgMiAwIDAgMSAyMSA3VjE2QTIgMiAwIDAgMSAxOSAxOEg1QTIgMiAwIDAgMSAzIDE2WiIgZmlsbD0iI0Y5RkFGQiIgc3Ryb2tlPSIjRDFENUNCIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTcgMTNMMTAgMTZMMTMgMTNMMTcgMTciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0Q5RDlEOSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';
                    }}
                  />
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="text-red-600 hover:text-red-700 px-3 py-2"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleImageAdd}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors"              >
                + Thêm hình ảnh
              </button>
            </div>
          </div>          {/* Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Giá cả</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán * ($)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="comparePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Giá so sánh ($)
                </label>
                <input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              
              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng tồn kho *
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
            </div>
          </div>          {/* Coffee Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chi tiết cà phê</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                  Trọng lượng
                </label>
                <input
                  id="weight"
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="250g, 500g, 1kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              <div>
                <label htmlFor="roastLevel" className="block text-sm font-medium text-gray-700 mb-2">
                  Mức độ rang
                </label>
                <select
                  id="roastLevel"
                  value={formData.roastLevel}
                  onChange={(e) => handleInputChange('roastLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                >
                  <option value="">Chọn mức độ rang</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="medium-dark">Medium Dark</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-2">
                  Xuất xứ
                </label>
                <input
                  id="origin"
                  type="text"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="Đà Lạt, Buôn Ma Thuột"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              <div>
                <label htmlFor="processingMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Phương pháp chế biến
                </label>
                <select
                  id="processingMethod"
                  value={formData.processingMethod}
                  onChange={(e) => handleInputChange('processingMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                >
                  <option value="">Chọn phương pháp</option>
                  <option value="washed">Washed</option>
                  <option value="natural">Natural</option>
                  <option value="honey">Honey</option>
                  <option value="wet-hulled">Wet Hulled</option>
                </select>
              </div>
            </div>
          </div>{/* Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Danh mục</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('categoryIds', [...formData.categoryIds, category.id]);
                      } else {
                        handleInputChange('categoryIds', formData.categoryIds.filter(id => id !== category.id));
                      }
                    }}
                    className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Sản phẩm nổi bật</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Kích hoạt</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Hủy
            </button><button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 disabled:opacity-50"
            >              {(() => {
                if (saving) return 'Đang lưu...';
                return isEdit ? 'Cập nhật' : 'Tạo mới';
              })()}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
