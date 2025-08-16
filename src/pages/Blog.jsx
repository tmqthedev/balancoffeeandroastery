import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  const blogsPerPage = 6;

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/blogs`, {
        params: {
          page: currentPage,
          limit: blogsPerPage,
          search: searchTerm,
          category: selectedCategory,
          lang: 'vi'
        },
        // Disable cache to ensure fresh data
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      
      const blogsData = response.data.blogs || [];
      
      setBlogs(blogsData);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blogs/categories`);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Blog - Balan Coffee & Roastery</title>
        <meta name="description" content="Khám phá thế giới cà phê qua những bài viết chuyên sâu về văn hóa, kỹ thuật và nghệ thuật pha chế cà phê." />
        <meta name="keywords" content="blog cà phê, văn hóa cà phê, kỹ thuật pha chế, nghệ thuật rang cà phê" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-brand-primary text-brand-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-white">
              Blog Cà Phê
            </h1>
            <p className="text-xl text-brand-white/80 max-w-3xl mx-auto">
              Khám phá thế giới cà phê qua những câu chuyện, kiến thức và trải nghiệm từ các chuyên gia
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-primary text-brand-white rounded-r-lg hover:bg-brand-primary/90 transition-colors"
                >
                  🔍 Tìm kiếm
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === ''
                    ? 'bg-brand-primary text-brand-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-brand-primary text-brand-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.nameVi || category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              Không tìm thấy bài viết nào
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có bài viết nào được đăng'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={blog.featuredImage || '/images/blog/default.jpg'}
                        alt={blog.title || 'Blog post'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/title.jpg'; // Fallback to existing image
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-brand-primary mb-3 line-clamp-2 hover:text-brand-primary/80 transition-colors">
                        {blog.title || 'Untitled'}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {blog.excerpt || 'Không có mô tả'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{blog.authorName || 'Admin'}</span>
                        <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('vi-VN') : 'Không rõ ngày'}</span>
                      </div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      « Trước
                    </button>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-brand-primary text-brand-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Sau »
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
