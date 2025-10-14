const express = require('express');
const router = express.Router();
const {
  getCollection,
  toObjectId,
  createDocument,
  updateDocument,
  paginateQuery,
  buildSort,
  handleDatabaseError,
  validateRequired,
  cleanData
} = require('../middleware/mongoHelpers');

console.log('📝 Backend: Blogs router loading');

// Get all blogs with filtering, search and pagination
router.get('/', async (req, res) => {
  try {
    console.log('📝 Fetching blogs');
    
    const {
      page = 1,
      limit = 6,
      search = '',
      category = '',
      lang = 'vi'
    } = req.query;

    console.log('📝 Blogs query params:', { page, limit, search, category, lang });

    // Get blogs collection
    const blogsCollection = getCollection(req, 'blogs');

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

    // Calculate pagination using helper
    const { skip, limit: actualLimit } = paginateQuery(page, limit);
    const totalBlogs = await blogsCollection.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / actualLimit);

    console.log('📊 Blogs count:', totalBlogs);

    // Fetch blogs
    const blogs = await blogsCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(actualLimit)
      .project({ 
        title: 1, 
        excerpt: 1, 
        featuredImage: 1, 
        category: 1, 
        publishedAt: 1, 
        author: 1, 
        readingTime: 1, 
        slug: 1 
      })
      .toArray();

    console.log('📝 Blogs found:', blogs.length);
    
    // Add id field for frontend compatibility
    const blogsWithId = blogs.map(blog => ({
      ...blog,
      id: blog._id.toString()
    }));
    
    // Debug: Log first few blogs with their categories
    if (blogsWithId.length > 0) {
      console.log('🔍 Sample blog categories:');
      blogsWithId.slice(0, 2).forEach(blog => {
        console.log(`- Blog: ${blog.title}`);
        console.log(`  Category:`, blog.category);
        console.log(`  Category type:`, typeof blog.category);
      });
    } else if (category) {
      // If no results with filter, let's check what categories exist
      console.log('🔍 No results found. Checking all published blogs...');
      const allBlogs = await blogsCollection
        .find({ status: 'published' })
        .project({ title: 1, category: 1 })
        .limit(5)
        .toArray();
      allBlogs.forEach(blog => {
        console.log(`- Blog: ${blog.title}`);
        console.log(`  Category:`, blog.category);
        console.log(`  Category type:`, typeof blog.category);
      });
    }

    res.json({
      success: true,
      blogs: blogsWithId,
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
    return handleDatabaseError(error, res, 'Fetch blogs');
  }
});

// Get blog categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📁 Fetching blog categories...');
    
    // Get blogs collection
    const blogsCollection = getCollection(req, 'blogs');
    
    // Get all published blogs and extract categories manually
    const blogs = await blogsCollection
      .find({ status: 'published' })
      .project({ category: 1 })
      .toArray();
    
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
    return handleDatabaseError(error, res, 'Fetch blog categories');
  }
});

// Get single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log('📝 Fetching blog by slug:', slug);

    // Get blogs collection
    const blogsCollection = getCollection(req, 'blogs');

    const blog = await blogsCollection.findOne({ 
      slug, 
      status: 'published' 
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Get related blogs (same category, excluding current blog)
    const relatedBlogs = await blogsCollection
      .find({
        _id: { $ne: blog._id },
        category: blog.category,
        status: 'published'
      })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .project({ title: 1, excerpt: 1, image: 1, category: 1, publishedAt: 1, slug: 1 })
      .toArray();

    // Increment view count
    await blogsCollection.updateOne({ slug }, { $inc: { viewCount: 1 } });

    // Add id field for frontend compatibility
    const blogWithId = { ...blog, id: blog._id.toString() };
    const relatedBlogsWithId = relatedBlogs.map(blog => ({
      ...blog,
      id: blog._id.toString()
    }));

    console.log('📝 Blog found:', blog.title);
    console.log('🔗 Related blogs:', relatedBlogs.length);

    res.json({
      success: true,
      blog: blogWithId,
      relatedBlogs: relatedBlogsWithId
    });

  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    return handleDatabaseError(error, res, 'Fetch blog by slug');
  }
});

module.exports = router;
