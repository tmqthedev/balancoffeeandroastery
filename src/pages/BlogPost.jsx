import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/blogs/${slug}`, {
        params: { lang: 'vi' }
      });
      
      setBlog(response.data.blog);
      setRelatedBlogs(response.data.relatedBlogs || []);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      if (error.response?.status === 404) {
        setError('notFound');
      } else {
        setError('general');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchBlogPost();
  }, [fetchBlogPost]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog.title_vi || blog.title_en;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
    alert('Đã sao chép liên kết vào clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-6 w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>            <div className="space-y-4">
              {[...Array(6)].map(() => (
                <div key={`skeleton-line-${Math.random().toString(36).slice(2, 9)}`} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'notFound') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy bài viết
          </h1>
          <p className="text-gray-600 mb-6">
            Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-3 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 transition-colors"
          >
            Quay lại Blog
          </Link>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đã xảy ra lỗi
          </h1>
          <p className="text-gray-600 mb-6">
            Không thể tải bài viết. Vui lòng thử lại sau.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  const title = blog.title_vi || blog.title_en;
  const content = blog.content_vi || blog.content_en;
  const excerpt = blog.excerpt_vi || blog.excerpt_en;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog?.title || blog?.title_vi,
    "description": blog?.excerpt || blog?.excerpt_vi,
    "image": blog?.featured_image || "/dist/title.jpg",
    "datePublished": blog?.created_at,
    "dateModified": blog?.updated_at || blog?.created_at,
    "author": {
        "@type": "Organization",
        "name": "Balan Coffee & Roastery",
        "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/dist/logo.png`
        }
    },
    "publisher": {
        "@type": "Organization",
        "name": "Balan Coffee & Roastery",
        "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/dist/logo.png`
        }
    }
};

  return (
    <>
      <Helmet>
        <title>{title} - Balan Coffee & Roastery</title>
        <meta name="description" content={excerpt} />
        <meta name="keywords" content={blog.meta_keywords || 'blog cà phê, cách pha cà phê, kiến thức cà phê, arabica, robusta, cà phê rang mộc'} />
        <link rel="canonical" href={`${window.location.origin}/blog/${blog.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:url" content={`${window.location.origin}/blog/${blog.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blog.image_url || `${window.location.origin}/images/og-default.jpg`} />
        <meta property="article:published_time" content={blog.created_at} />
        <meta property="article:author" content={blog.author_name || 'Balan Coffee & Roastery'} />        {blog.category && (
          <meta property="article:section" content={blog.category.name_vi || blog.category.name_en} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={excerpt} />
        <meta name="twitter:image" content={blog.image_url || `${window.location.origin}/images/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-coffee-600">
                Trang chủ
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/blog" className="text-gray-500 hover:text-coffee-600">
                Blog
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 truncate">{title}</span>
            </nav>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <header className="mb-8">
            {/* Category */}
            {blog.category && (              <div className="mb-4">
                <span className="inline-block bg-coffee-100 text-coffee-800 px-3 py-1 rounded-full text-sm font-medium">
                  {blog.category.name_vi || blog.category.name_en}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {blog.author_name || 'Balan Coffee & Roastery'}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time dateTime={blog.created_at}>
                  {formatDate(blog.created_at)}
                </time>
              </div>              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {blog.read_time || 5} phút đọc
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="mb-8">
              <img
                src={blog.image_url}
                alt={title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: content }}
              className="text-gray-800 leading-relaxed"
            />
          </div>

          {/* Share Buttons */}          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              
              <button
                onClick={() => handleShare('linkedin')}
                className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
              
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Sao chép liên kết
              </button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="bg-white py-12">            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Bài viết liên quan
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog) => (
                  <article
                    key={relatedBlog.id}
                    className="bg-cream-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link to={`/blog/${relatedBlog.slug}`}>
                      <div className="h-48 overflow-hidden">                        <img
                          src={relatedBlog.image_url || '/images/blog/default-blog.jpg'}
                          alt={relatedBlog.title_vi || relatedBlog.title_en}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>

                    <div className="p-6">                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-coffee-600 transition-colors">
                        <Link to={`/blog/${relatedBlog.slug}`}>
                          {relatedBlog.title_vi || relatedBlog.title_en}
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4">
                        {formatDate(relatedBlog.created_at)}
                      </p>
                        <Link
                        to={`/blog/${relatedBlog.slug}`}
                        className="inline-flex items-center text-coffee-600 hover:text-coffee-700 font-medium text-sm transition-colors"
                      >
                        Đọc thêm
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BlogPost;
