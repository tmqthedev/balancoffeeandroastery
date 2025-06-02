import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);  const blogsPerPage = 6;

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/blogs', {
        params: {
          page: currentPage,
          limit: blogsPerPage,
          search: searchTerm,
          category: selectedCategory,          lang: 'vi'
        }
      });
      setBlogs(response.data.blogs);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blogs/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <>      <Helmet>
        <title>Blog - Balan Coffee & Roastery</title>
        <meta name="description" content="Khám phá thế giới cà phê qua blog của chúng tôi với những bài viết về cách pha chế, kiến thức về hạt cà phê và xu hướng cà phê mới nhất" />
        <meta name="keywords" content="blog cà phê, cách pha cà phê, kiến thức cà phê, arabica, robusta, cà phê rang mộc" />
        <link rel="canonical" href={`${window.location.origin}/blog`} />
        <meta property="og:title" content="Blog - Balan Coffee & Roastery" />
        <meta property="og:description" content="Khám phá thế giới cà phê qua blog của chúng tôi với những bài viết về cách pha chế, kiến thức về hạt cà phê và xu hướng cà phê mới nhất" />
        <meta property="og:url" content={`${window.location.origin}/blog`} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Hero Section */}
        <div className="bg-coffee-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Blog Cà Phê
              </h1>
              <p className="text-xl text-coffee-200 max-w-3xl mx-auto">
                Khám phá thế giới cà phê qua những bài viết về cách pha chế, kiến thức về hạt cà phê và xu hướng mới nhất
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search and Filter Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="flex">                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-coffee-600 text-white rounded-r-md hover:bg-coffee-700 transition-colors"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </form>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_vi || category.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blog Grid */}
          {loading ? (            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map(() => (
                <div key={`blog-skeleton-${Math.random().toString(36).slice(2, 9)}`} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (            <div className="text-center py-12">
              <div className="text-6xl text-gray-400 mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không tìm thấy bài viết nào
              </h3>
              <p className="text-gray-500">
                Không có bài viết nào phù hợp với tiêu chí tìm kiếm của bạn
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Blog Image */}
                  <Link to={`/blog/${blog.slug}`}>
                    <div className="h-48 overflow-hidden">                      <img
                        src={blog.image_url || '/images/blog/default-blog.jpg'}
                        alt={blog.title_vi || blog.title_en}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="p-6">
                    {/* Category and Date */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">                      <span className="bg-coffee-100 text-coffee-800 px-2 py-1 rounded-full">
                        {blog.category && (blog.category.name_vi || blog.category.name_en)}
                      </span>
                      <time dateTime={blog.created_at}>
                        {formatDate(blog.created_at)}
                      </time>
                    </div>

                    {/* Title */}                    <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-coffee-600 transition-colors">
                      <Link to={`/blog/${blog.slug}`}>
                        {blog.title_vi || blog.title_en}
                      </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4">
                      {truncateContent(blog.excerpt_vi || blog.excerpt_en)}
                    </p>

                    {/* Read More */}
                    <Link                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center text-coffee-600 hover:text-coffee-700 font-medium transition-colors"
                    >
                      Đọc thêm
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        ? 'bg-coffee-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog;
