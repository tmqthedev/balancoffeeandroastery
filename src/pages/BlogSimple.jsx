import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BlogSimple = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('Fetching blogs from:', `${API_BASE_URL}/api/blogs`);
        const response = await axios.get(`${API_BASE_URL}/api/blogs`);
        console.log('Blogs response:', response.data);
        setBlogs(response.data.blogs || []);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div className="p-8">Loading blogs...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <>
      <Helmet>
        <title>Blog - Balan Coffee & Roastery</title>
        <meta name="description" content="Khám phá thế giới cà phê qua blog của chúng tôi" />
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Hero Section */}
        <div className="bg-coffee-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
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
          <h2 className="text-2xl font-bold mb-6">Bài viết gần đây ({blogs.length} bài)</h2>
          
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-400 mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-500">
                Hãy quay lại sau để đọc những bài viết mới nhất về cà phê
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
                  <div className="h-48 bg-gradient-to-r from-coffee-200 to-coffee-300 flex items-center justify-center">
                    {blog.featured_image ? (
                      <img
                        src={blog.featured_image}
                        alt={blog.title_vi || blog.title_en}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">📝</span>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {blog.title_vi || blog.title_en || 'Untitled'}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {blog.excerpt_vi || blog.excerpt_en || 'Không có mô tả'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString('vi-VN') : 'Không rõ ngày'}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {blog.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogSimple;
