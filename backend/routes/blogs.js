const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

console.log('📝 Blogs router loading with MongoDB support');

// Get all blogs with filtering, search and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 6,
      search = '',
      category = '',
      lang = 'vi'
    } = req.query;

    console.log('📝 Blogs query params:', { page, limit, search, category, lang });

    // Build filter object
    const filter = { status: 'published' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }

    // Build sort object (newest first)
    const sort = { publishedAt: -1, createdAt: -1 };

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    console.log('📊 Blogs count:', totalBlogs);

    // Fetch blogs
    const blogs = await Blog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('title excerpt featuredImage category publishedAt author readingTime slug')
      .lean();

    console.log('📝 Blogs found:', blogs.length);

    res.json({
      success: true,
      blogs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách blog',
      error: error.message
    });
  }
});

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📁 Fetching blog categories...');
    
    // Get unique categories from published blogs
    const categories = await Blog.distinct('category', { status: 'published' });
    
    console.log('📁 Blog categories found:', categories);

    res.json(categories.filter(cat => cat)); // Return array directly

  } catch (error) {
    console.error('❌ Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh mục blog',
      error: error.message
    });
  }
});

// Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log('📝 Fetching blog by slug:', slug);

    const blog = await Blog.findOne({ 
      slug, 
      status: 'published' 
    }).lean();

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Get related blogs (same category, excluding current blog)
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      category: blog.category,
      status: 'published'
    })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(3)
    .select('title excerpt image category publishedAt slug')
    .lean();

    // Increment view count
    await Blog.updateOne({ slug }, { $inc: { viewCount: 1 } });

    console.log('📝 Blog found:', blog.title);
    console.log('🔗 Related blogs:', relatedBlogs.length);

    res.json({
      success: true,
      blog,
      relatedBlogs
    });

  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bài viết',
      error: error.message
    });
  }
});

module.exports = router;
