import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminBlogs = () => {
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
  }, [fetchBlogs]);
  const fetchBlogs = useCallback(async () => {
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
  }, [currentPage, searchTerm, statusFilter]);

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
    if (!window.confirm('Bạn có chắc chắn muốn xóa blog này?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/blogs/${blogId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Lỗi khi xóa blog. Vui lòng thử lại.');
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

  const getStatusText = (status) => {
    switch (status) {
      case 'published':
        return 'Đã xuất bản';
      case 'draft':
        return 'Bản nháp';
      case 'archived':
        return 'Đã lưu trữ';
      default:
        return status;
    }
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

  return (    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
        <button
          onClick={handleCreate}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
        >
          Thêm blog mới
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">          <div>
            <input
              type="text"
              placeholder="Tìm kiếm blog..."
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
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nổi bật
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
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
                </td>                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(blog.status)}>
                    {getStatusText(blog.status)}
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
                </td>                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="text-amber-600 hover:text-amber-900 mr-4"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => toggleStatus(blog.id, blog.status)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    {blog.status === 'published' ? 'Hủy xuất bản' : 'Xuất bản'}
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Xóa
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
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBlog ? 'Sửa blog' : 'Thêm blog mới'}
              </h3>              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title-vi" className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề tiếng Việt
                    </label>
                    <input
                      id="title-vi"
                      type="text"
                      value={formData.title_vi}
                      onChange={(e) => setFormData({...formData, title_vi: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="title-en" className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề tiếng Anh
                    </label>
                    <input
                      id="title-en"
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="excerpt-vi" className="block text-sm font-medium text-gray-700 mb-1">
                      Tóm tắt tiếng Việt
                    </label>
                    <textarea
                      id="excerpt-vi"
                      value={formData.excerpt_vi}
                      onChange={(e) => setFormData({...formData, excerpt_vi: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="excerpt-en" className="block text-sm font-medium text-gray-700 mb-1">
                      Tóm tắt tiếng Anh
                    </label>
                    <textarea
                      id="excerpt-en"
                      value={formData.excerpt_en}
                      onChange={(e) => setFormData({...formData, excerpt_en: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="content-vi" className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung tiếng Việt
                    </label>
                    <textarea
                      id="content-vi"
                      value={formData.content_vi}
                      onChange={(e) => setFormData({...formData, content_vi: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="content-en" className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung tiếng Anh
                    </label>
                    <textarea
                      id="content-en"
                      value={formData.content_en}
                      onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="featured-image" className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh nổi bật
                    </label>
                    <input
                      id="featured-image"
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>                  <div className="md:col-span-1 space-y-4">
                    <div>
                      <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                      </label>
                      <select
                        id="status-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="archived">Đã lưu trữ</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="featured-checkbox" className="block text-sm font-medium text-gray-700 mb-1">
                        Nổi bật
                      </label>
                      <div className="flex items-center mt-2">
                        <input
                          id="featured-checkbox"
                          type="checkbox"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Bài viết nổi bật</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {editingBlog ? 'Cập nhật' : 'Tạo mới'}
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
