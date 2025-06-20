const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all blog posts with pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      lang = 'en',
      status = 'published' 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['b.status = @status'];
    const params = { 
      status,
      offset: offset, 
      limit: parseInt(limit) 
    };

    // Search functionality
    if (search) {
      whereConditions.push('(b.title LIKE @search OR b.titleVi LIKE @search OR b.content LIKE @search OR b.contentVi LIKE @search)');
      params.search = `%${search}%`;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Blogs b
      INNER JOIN Users u ON b.authorId = u.id
      WHERE ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get blog posts
    const blogsQuery = `
      SELECT 
        b.id,
        b.title,
        b.titleVi,
        b.slug,
        b.excerpt,
        b.excerptVi,
        b.featuredImage,
        b.publishedAt,
        b.tags,
        b.viewCount,
        b.createdAt,
        u.firstName + ' ' + u.lastName as authorName
      FROM Blogs b
      INNER JOIN Users u ON b.authorId = u.id
      WHERE ${whereClause}
      ORDER BY b.publishedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const blogs = await db.query(blogsQuery, params);

    // Localize content based on language
    const localizedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: lang === 'vi' ? blog.titleVi : blog.title,
      slug: blog.slug,
      excerpt: lang === 'vi' ? blog.excerptVi : blog.excerpt,
      featuredImage: blog.featuredImage,
      publishedAt: blog.publishedAt,
      tags: blog.tags ? blog.tags.split(',') : [],
      viewCount: blog.viewCount,
      authorName: blog.authorName,
      createdAt: blog.createdAt
    }));

    res.json({
      blogs: localizedBlogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get blog categories (must be before /:slug route)
router.get('/categories', async (req, res) => {
  try {
    // For mock database, return simple categories
    const categories = [
      { id: 1, name: 'Coffee Culture', nameVi: 'Văn Hóa Cà Phê', slug: 'coffee-culture' },
      { id: 2, name: 'Brewing Techniques', nameVi: 'Kỹ Thuật Pha Chế', slug: 'brewing-techniques' },
      { id: 3, name: 'Health & Wellness', nameVi: 'Sức Khỏe', slug: 'health-wellness' },
      { id: 4, name: 'Coffee Roasting', nameVi: 'Nghệ Thuật Rang', slug: 'coffee-roasting' }
    ];
    
    res.json(categories);
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ error: 'Failed to fetch blog categories' });
  }
});

// Get featured blog posts
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 6, lang = 'en' } = req.query;

    const query = `
      SELECT TOP (@limit)
        b.id,
        b.title,
        b.titleVi,
        b.slug,
        b.excerpt,
        b.excerptVi,
        b.featuredImage,
        b.publishedAt,
        b.viewCount,
        u.firstName + ' ' + u.lastName as authorName
      FROM Blogs b
      INNER JOIN Users u ON b.authorId = u.id
      WHERE b.status = 'published'
      ORDER BY b.viewCount DESC, b.publishedAt DESC
    `;

    const blogs = await db.query(query, { limit: parseInt(limit) });

    // Localize content
    const localizedBlogs = blogs.map(blog => ({
      id: blog.id,
      title: lang === 'vi' ? blog.titleVi : blog.title,
      slug: blog.slug,
      excerpt: lang === 'vi' ? blog.excerptVi : blog.excerpt,
      featuredImage: blog.featuredImage,
      publishedAt: blog.publishedAt,
      viewCount: blog.viewCount,
      authorName: blog.authorName
    }));

    res.json(localizedBlogs);
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch featured blog posts' });
  }
});

// Get single blog post by slug (must be after specific routes)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'en' } = req.query;

    const blogQuery = `
      SELECT 
        b.*,
        u.firstName + ' ' + u.lastName as authorName,
        u.profileImage as authorImage
      FROM Blogs b
      INNER JOIN Users u ON b.authorId = u.id
      WHERE b.slug = @slug AND b.status = 'published'
    `;

    const blogs = await db.query(blogQuery, { slug });

    if (blogs.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const blog = blogs[0];

    // Increment view count
    await db.execute(
      'UPDATE Blogs SET viewCount = viewCount + 1 WHERE id = @id',
      { id: blog.id }
    );

    // Get related posts (same tags, excluding current post)
    const relatedQuery = `
      SELECT TOP 3
        b.id,
        b.title,
        b.titleVi,
        b.slug,
        b.excerpt,
        b.excerptVi,
        b.featuredImage,
        b.publishedAt
      FROM Blogs b
      WHERE b.id != @blogId 
        AND b.status = 'published'
        AND (b.tags LIKE @tags OR b.tags IS NOT NULL)
      ORDER BY b.publishedAt DESC
    `;

    const tags = blog.tags || '';
    const relatedBlogs = await db.query(relatedQuery, { 
      blogId: blog.id,
      tags: `%${tags}%`
    });

    // Localize content
    const localizedBlog = {
      id: blog.id,
      title: lang === 'vi' ? blog.titleVi : blog.title,
      slug: blog.slug,
      content: lang === 'vi' ? blog.contentVi : blog.content,
      excerpt: lang === 'vi' ? blog.excerptVi : blog.excerpt,
      featuredImage: blog.featuredImage,
      publishedAt: blog.publishedAt,
      tags: blog.tags ? blog.tags.split(',') : [],
      viewCount: blog.viewCount + 1, // Include the increment
      authorName: blog.authorName,
      authorImage: blog.authorImage,
      metaTitle: lang === 'vi' ? blog.metaTitleVi : blog.metaTitle,
      metaDescription: lang === 'vi' ? blog.metaDescriptionVi : blog.metaDescription,
      createdAt: blog.createdAt,
      relatedPosts: relatedBlogs.map(related => ({
        id: related.id,
        title: lang === 'vi' ? related.titleVi : related.title,
        slug: related.slug,
        excerpt: lang === 'vi' ? related.excerptVi : related.excerpt,
        featuredImage: related.featuredImage,
        publishedAt: related.publishedAt
      }))
    };

    res.json(localizedBlog);

  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

module.exports = router;
