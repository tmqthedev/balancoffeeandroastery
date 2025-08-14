import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const BlogTest = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        console.log('🔍 Fetching blogs from:', `${API_BASE_URL}/api/blogs`);
        
        const response = await axios.get(`${API_BASE_URL}/api/blogs`, {
          params: {
            page: 1,
            limit: 10,
            lang: 'vi'
          }
        });
        
        console.log('✅ Raw API Response:', response.data);
        
        const blogsData = response.data.blogs || [];
        console.log('📝 Blogs array:', blogsData);
        
        blogsData.forEach((blog, index) => {
          console.log(`📖 Blog ${index + 1}:`, {
            id: blog.id,
            title: blog.title,
            titleVi: blog.titleVi,
            excerpt: blog.excerpt,
            excerptVi: blog.excerptVi,
            slug: blog.slug,
            featuredImage: blog.featuredImage,
            authorName: blog.authorName,
            publishedAt: blog.publishedAt
          });
        });
        
        setBlogs(blogsData);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Blog Test Debug</h2>
      <p>Total blogs: {blogs.length}</p>
      
      <div style={{ marginTop: '20px' }}>
        {blogs.map((blog, index) => (
          <div key={blog.id} style={{ 
            border: '1px solid #ccc', 
            margin: '10px 0', 
            padding: '10px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>Blog #{index + 1}</h3>
            <p><strong>ID:</strong> {blog.id}</p>
            <p><strong>Title:</strong> {blog.title || 'NO TITLE'}</p>
            <p><strong>Excerpt:</strong> {blog.excerpt || 'NO EXCERPT'}</p>
            <p><strong>Slug:</strong> {blog.slug || 'NO SLUG'}</p>
            <p><strong>Author:</strong> {blog.authorName || 'NO AUTHOR'}</p>
            <p><strong>Published:</strong> {blog.publishedAt || 'NO DATE'}</p>
            <p><strong>Featured Image:</strong> {blog.featuredImage || 'NO IMAGE'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogTest;
