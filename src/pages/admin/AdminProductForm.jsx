import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import FileUpload from '../../components/common/FileUpload';
import axios from 'axios';

const AdminProductForm = () => {
  const { t } = useTranslation();
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
    categoryIds: []
  });

  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
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
        categoryIds: product.categories || []
      });
      
      setImages(product.images || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

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
    }));

    // Auto-generate slug from name
    if (field === 'name' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };
  const handleImageUpload = async (uploadedFiles) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // No need to manually create FormData here since the FileUpload 
      // component already handles this and makes the API call
      
      // Just update the product's images with the uploaded files
      if (Array.isArray(uploadedFiles)) {
        const newImages = uploadedFiles.map(file => 
          file.optimized?.url || file.thumbnail?.url || file.original.url
        );
        setImages(prev => [...prev, ...newImages]);
      } else if (uploadedFiles) {
        const newImage = uploadedFiles.optimized?.url || 
                         uploadedFiles.thumbnail?.url || 
                         uploadedFiles.original.url;
        setImages(prev => [...prev, newImage]);
      }    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to upload images');
    }
  };

  const handleImageRemove = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const submitData = {
        ...formData,
        images: images,
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? t('admin.editProduct') : t('admin.addProduct')}
            </h1>
            <p className="mt-2 text-gray-600">
              {isEdit ? t('admin.editProductSubtitle') : t('admin.addProductSubtitle')}
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
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.basicInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productName')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.productNameVi')} *
                </label>
                <input
                  type="text"
                  value={formData.nameVi}
                  onChange={(e) => handleInputChange('nameVi', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.slug')} *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.sku')} *
                </label>
                <input
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.productImages')}</h3>            <FileUpload
              onUpload={handleImageUpload}
              accept="image/*"
              multiple={true}
              uploadType="product"
              currentImages={images}
              onRemove={handleImageRemove}
              className="mb-4"
            />
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.pricing')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.price')} * ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.comparePrice')} ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.stockQuantity')} *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Coffee Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.coffeeDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.weight')}
                </label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  placeholder="250g, 500g, 1kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.roastLevel')}
                </label>
                <select
                  value={formData.roastLevel}
                  onChange={(e) => handleInputChange('roastLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                >
                  <option value="">{t('admin.selectRoastLevel')}</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="medium-dark">Medium Dark</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.origin')}
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="Đà Lạt, Buôn Ma Thuột"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('admin.processingMethod')}
                </label>
                <select
                  value={formData.processingMethod}
                  onChange={(e) => handleInputChange('processingMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brown-500 focus:border-brown-500"
                >
                  <option value="">{t('admin.selectProcessing')}</option>
                  <option value="washed">Washed</option>
                  <option value="natural">Natural</option>
                  <option value="honey">Honey</option>
                  <option value="wet-hulled">Wet Hulled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.categories')}</h3>
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.options')}</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('admin.featured')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('admin.active')}</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brown-600 text-white rounded-md hover:bg-brown-700 disabled:opacity-50"
            >
              {saving ? t('common.saving') : (isEdit ? t('common.update') : t('common.create'))}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminProductForm;
