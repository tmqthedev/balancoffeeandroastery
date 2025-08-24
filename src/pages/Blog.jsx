import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SEOHelmet from '../components/common/SEOHelmet';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { LoadingSpinner } from '../components/common/Loading';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE_URL = '/api';

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs/categories`);
      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 6,
        search: searchTerm,
        category: selectedCategory,
        lang: 'vi'
      };

      const response = await axios.get(`${API_BASE_URL}/blogs`, { params });
      
      if (response.data && response.data.blogs) {
        setBlogs(response.data.blogs);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setBlogs([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Không thể tải danh sách blog');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Lỗi</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SEOHelmet 
        title="Blog - Kiến thức cà phê | Balan Coffee and Roastery"
        description="Khám phá thế giới cà phê qua blog của Balan Coffee and Roastery. Hướng dẫn pha chế, kiến thức rang xay và xu hướng cà phê mới nhất."
        keywords="blog cà phê, hướng dẫn pha chế, kiến thức cà phê, rang xay, Balan Coffee"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4">
              Blog Cà Phê
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Khám phá thế giới cà phê qua những bài viết chuyên sâu về hương vị, kỹ thuật và văn hóa cà phê
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                onKeyPress={handleSearch}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
                }`}
              >
                Tất cả
              </button>
              {Array.isArray(categories) && categories.map((category) => {
                const categoryValue = category; // Categories API returns strings
                const categoryDisplay = category;
                
                return (
                  <button
                    key={categoryValue}
                    onClick={() => handleCategoryChange(categoryValue)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === categoryValue
                        ? 'bg-amber-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-amber-50'
                    }`}
                  >
                    {categoryDisplay}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading */}
          {loading && <LoadingSpinner size="large" message="Đang tải bài viết..." />}

          {/* Blog Grid */}
          {!loading && (
            <>
              {blogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
                  <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {blogs.map((blog) => (
                    <article key={blog._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {blog.image && (
                        <div className="h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={blog.image}
                            alt={blog.title || 'Blog image'}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {(() => {
                              // Handle different category formats
                              if (!blog.category) return 'Chung';
                              
                              if (typeof blog.category === 'string') {
                                return blog.category;
                              } else if (typeof blog.category === 'object') {
                                // Handle object format: {name: "Category"}
                                if (blog.category.name) {
                                  return blog.category.name;
                                }
                                // Handle object format: {vi: "Category"}
                                if (blog.category.vi) {
                                  return blog.category.vi;
                                }
                              }
                              return 'Chung';
                            })()}
                          </span>
                          <time className="text-gray-500 text-sm">
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </time>
                        </div>
                        
                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {blog.title || 'Tiêu đề blog'}
                        </h2>
                        
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {truncateContent(blog.excerpt || blog.content)}
                        </p>
                        
                        <Link
                          to={`/blog/${blog.slug || blog._id}`}
                          className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Đọc tiếp
                          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === index + 1
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Blog;
