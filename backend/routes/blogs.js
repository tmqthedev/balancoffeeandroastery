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
      console.log('🔍 Filtering by category:', category);
      
      // Normalize Unicode for Vietnamese characters
      const normalizedCategory = category.normalize('NFC');
      console.log('🔍 Normalized category:', normalizedCategory);
      
      // Handle both string and object category formats
      filter.$or = [
        { category: normalizedCategory }, // For string format
        { 'category.name': normalizedCategory } // For object format {name: "category"}
      ];
      console.log('🔍 Filter object:', JSON.stringify(filter, null, 2));
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
    
    // Debug: Log first few blogs with their categories
    if (blogs.length > 0) {
      console.log('🔍 Sample blog categories:');
      blogs.slice(0, 2).forEach(blog => {
        console.log(`- Blog: ${blog.title}`);
        console.log(`  Category:`, blog.category);
        console.log(`  Category type:`, typeof blog.category);
      });
    } else if (category) {
      // If no results with filter, let's check what categories exist
      console.log('🔍 No results found. Checking all published blogs...');
      const allBlogs = await Blog.find({ status: 'published' }, 'title category').limit(5).lean();
      allBlogs.forEach(blog => {
        console.log(`- Blog: ${blog.title}`);
        console.log(`  Category:`, blog.category);
        console.log(`  Category type:`, typeof blog.category);
      });
    }

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
    
    // Get all published blogs and extract categories manually
    const blogs = await Blog.find({ status: 'published' }, 'category').lean();
    
    const categoriesSet = new Set();
    blogs.forEach(blog => {
      if (blog.category) {
        // Handle both string and object formats
        if (typeof blog.category === 'string') {
          categoriesSet.add(blog.category);
        } else if (blog.category.name) {
          // If category is object with name property
          if (typeof blog.category.name === 'string') {
            categoriesSet.add(blog.category.name);
          } else if (blog.category.name.vi) {
            // If name is object with vi property
            categoriesSet.add(blog.category.name.vi);
          }
        }
      }
    });
    
    const categories = Array.from(categoriesSet).filter(cat => cat);
    
    console.log('📁 Blog categories found:', categories);

    res.json(categories); // Return array of strings

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
