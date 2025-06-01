import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminBlogs = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title_vi: '',
    title_en: '',
    content_vi: '',
    content_en: '',
    excerpt_vi: '',
    excerpt_en: '',
    featured_image: '',
    status: 'draft',
    featured: false
  });

  const blogsPerPage = 10;

  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/blogs', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: blogsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setBlogs(response.data.blogs);
      setTotalPages(Math.ceil(response.data.total / blogsPerPage));
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData({
      title_vi: '',
      title_en: '',
      content_vi: '',
      content_en: '',
      excerpt_vi: '',
      excerpt_en: '',
      featured_image: '',
      status: 'draft',
      featured: false
    });
    setEditingBlog(null);
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title_vi: blog.title_vi || '',
      title_en: blog.title_en || '',
      content_vi: blog.content_vi || '',
      content_en: blog.content_en || '',
      excerpt_vi: blog.excerpt_vi || '',
      excerpt_en: blog.excerpt_en || '',
      featured_image: blog.featured_image || '',
      status: blog.status || 'draft',
      featured: blog.featured || false
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setFormData({
      title_vi: '',
      title_en: '',
      content_vi: '',
      content_en: '',
      excerpt_vi: '',
      excerpt_en: '',
      featured_image: '',
      status: 'draft',
      featured: false
    });
    setShowModal(true);
  };  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      
      const url = editingBlog 
        ? `/api/admin/blogs/${editingBlog.id}`
        : '/api/admin/blogs';
      const method = editingBlog ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowModal(false);
      fetchBlogs();
      resetForm();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog. Please try again.');
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog. Please try again.');
    }
  };

  const toggleStatus = async (blogId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      await axios.put(`/api/admin/blogs/${blogId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.draft}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.blogs')}</h1>
        <button
          onClick={handleCreate}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          {t('admin.addNewBlog')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder={t('admin.searchBlogs')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t('admin.allStatuses')}</option>
              <option value="published">{t('admin.published')}</option>
              <option value="draft">{t('admin.draft')}</option>
              <option value="archived">{t('admin.archived')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.title')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.featured')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.createdAt')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {blog.title_vi || blog.title_en}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {blog.excerpt_vi || blog.excerpt_en}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(blog.status)}>
                    {t(`admin.${blog.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {blog.featured ? (
                    <span className="text-yellow-500">★</span>
                  ) : (
                    <span className="text-gray-300">☆</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(blog.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="text-amber-600 hover:text-amber-900 mr-4"
                  >
                    {t('admin.edit')}
                  </button>
                  <button
                    onClick={() => toggleStatus(blog.id, blog.status)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {blog.status === 'published' ? t('admin.unpublish') : t('admin.publish')}
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    {t('admin.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBlog ? t('admin.editBlog') : t('admin.addNewBlog')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.titleVietnamese')}
                    </label>
                    <input
                      type="text"
                      value={formData.title_vi}
                      onChange={(e) => setFormData({...formData, title_vi: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.titleEnglish')}
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.excerptVietnamese')}
                    </label>
                    <textarea
                      value={formData.excerpt_vi}
                      onChange={(e) => setFormData({...formData, excerpt_vi: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.excerptEnglish')}
                    </label>
                    <textarea
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({...formData, excerpt_en: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contentVietnamese')}
                    </label>
                    <textarea
                      value={formData.content_vi}
                      onChange={(e) => setFormData({...formData, content_vi: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.contentEnglish')}
                    </label>
                    <textarea
                      value={formData.content_en}
                      onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('admin.featuredImage')}
                    </label>
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div><div className="md:col-span-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="draft">{t('admin.draft')}</option>
                        <option value="published">{t('admin.published')}</option>
                        <option value="archived">{t('admin.archived')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('admin.featured')}
                      </label>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{t('admin.featuredPost')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {t('admin.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {editingBlog ? t('admin.update') : t('admin.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
