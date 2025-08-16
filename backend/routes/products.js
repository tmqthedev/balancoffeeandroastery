const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

console.log('🛒 Products router loading with Momo and COD payment support');

// Search suggestions endpoint
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = `%${q}%`;
    const params = { search: searchTerm };

    const suggestionsQuery = `
      SELECT DISTINCT 
        p.id,
        p.name,
        p.nameVi,
        c.name as category
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      WHERE p.isActive = 1 
        AND (p.name LIKE @search OR p.nameVi LIKE @search)
      ORDER BY p.name ASC
      LIMIT 8
    `;

    const suggestions = await db.query(suggestionsQuery, params);
    
    const formattedSuggestions = suggestions.map(product => ({
      id: product.id,
      name: product.nameVi || product.name,
      category: product.category
    }));

    res.json({ 
      success: true,
      suggestions: formattedSuggestions 
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tải gợi ý tìm kiếm',
      suggestions: [] 
    });
  }
});

// Get all products with filters, pagination, and sorting
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Products API called with query:', req.query);
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      inStock,
      search,
      sortBy = 'newest'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.isActive = 1'];
    const params = { offset: parseInt(offset), limit: parseInt(limit) };    // Apply filters
    if (category) {
      whereConditions.push('c.slug = @category');
      params.category = category;
      console.log('🏷️ Category filter applied:', category);
    }

    if (minPrice) {
      whereConditions.push('p.price >= @minPrice');
      params.minPrice = parseFloat(minPrice);
    }
    
    if (maxPrice) {
      whereConditions.push('p.price <= @maxPrice');
      params.maxPrice = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      whereConditions.push('p.stockQuantity > 0');
    }

    if (search) {
      whereConditions.push('(p.name LIKE @search OR p.shortDescription LIKE @search OR p.nameVi LIKE @search OR p.shortDescriptionVi LIKE @search)');
      params.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Determine sort order
    let orderBy = 'p.createdAt DESC'; // default newest
    switch (sortBy) {
      case 'name':
        orderBy = 'p.name ASC';
        break;
      case 'price_low':
        orderBy = 'p.price ASC';
        break;
      case 'price_high':
        orderBy = 'p.price DESC';
        break;
      case 'popularity':
        orderBy = 'p.views DESC, p.createdAt DESC';
        break;
    }    // Determine JOIN type based on whether we're filtering by category
    const joinType = category ? 'INNER JOIN' : 'LEFT JOIN';
    console.log('🔗 Using join type:', joinType, 'for category filter:', category);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM Products p
      ${joinType} ProductCategories pc ON p.id = pc.productId
      ${joinType} Categories c ON pc.categoryId = c.id
      ${whereClause}
    `;
      console.log('🔍 Count query:', countQuery);
    console.log('🔍 Query params:', params);
    const countResult = await db.query(countQuery, params);
    console.log('🔍 Count result:', countResult);
    console.log('🔍 Count result:', countResult);
    const total = countResult[0]?.total || 0;    // Get products
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.nameVi,
        p.shortDescription as description,
        p.shortDescriptionVi as descriptionVi,
        p.price,
        p.comparePrice,
        p.stockQuantity as stock_quantity,
        p.isFeatured,
        p.createdAt
      FROM Products p
      ${joinType} ProductCategories pc ON p.id = pc.productId
      ${joinType} Categories c ON pc.categoryId = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    console.log('🔍 Products query:', productsQuery);
    const products = await db.query(productsQuery, params);
    console.log('🔍 Products result:', products?.length, 'products found');

    res.json({
      success: true,
      products: products || [],
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Get products error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch products',
      products: [],
      total: 0
    });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT id, name, nameVi, slug, description
      FROM Categories
      WHERE isActive = 1
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      categories: categories || []
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories' 
    });
  }
});

// SPECIFIC ROUTES MUST COME BEFORE /:id ROUTE

// SIMPLE TEST ROUTE
router.get('/test-simple', (req, res) => {
    console.log('🎯 Simple test in products router hit!');
    res.json({ success: true, message: 'Products router test works!' });
});

// NEW TEST ROUTE
router.get('/working-test', (req, res) => {
    console.log('🎯 NEW working test route hit!');
    res.json({ success: true, message: 'NEW test route works!', timestamp: new Date().toISOString() });
});

// Payment endpoints removed - use dedicated payment service
// Payment endpoints removed - use dedicated payment service
// Only Momo and COD payment methods are supported

// Debug endpoint to check ProductCategories data
router.get('/debug/categories', async (req, res) => {
  try {
    console.log('🔍 Debug categories endpoint called');
    
    // Check ProductCategories table
    const productCategories = await db.query(`
      SELECT pc.productId, pc.categoryId, p.name as productName, c.name as categoryName, c.slug
      FROM ProductCategories pc
      LEFT JOIN Products p ON pc.productId = p.id
      LEFT JOIN Categories c ON pc.categoryId = c.id
    `);
    
    console.log('📊 ProductCategories data:', productCategories);
    
    res.json({
      success: true,
      debug: {
        productCategoriesCount: productCategories?.length || 0,
        productCategories: productCategories || [],
        message: 'Check console for detailed logs'
      }
    });
    
  } catch (error) {
    console.error('Debug categories error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Simple test endpoint
router.get('/test/category-filter/:categorySlug', async (req, res) => {
  try {
    const { categorySlug } = req.params;
    console.log('🧪 Testing category filter for:', categorySlug);
    
    const query = `
      SELECT 
        p.id, p.name, p.nameVi,
        c.name as categoryName, c.slug as categorySlug
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      WHERE p.isActive = 1 AND c.slug = @category
    `;
    
    const result = await db.query(query, { category: categorySlug });
    console.log('🧪 Query result:', result);
    
    res.json({
      success: true,
      categorySlug,
      query,
      results: result || [],
      count: result?.length || 0
    });
    
  } catch (error) {
    console.error('Test category filter error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.nameVi,
        p.shortDescription,
        p.shortDescriptionVi,
        p.price,
        p.comparePrice,
        p.stockQuantity as stock_quantity,
        p.isFeatured,
        p.createdAt,
        p.updatedAt,
        p.isActive,
        p.sku,
        p.weight,
        p.origin,
        p.roastLevel,
        p.processingMethod,
        p.altText,
        p.metaTitle,
        p.metaDescription,
        p.views,
        STRING_AGG(c.id, ',') as category_ids,
        STRING_AGG(c.name, ', ') as categories,
        STRING_AGG(c.nameVi, ', ') as categoriesVi
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      WHERE p.id = @id AND p.isActive = 1
      GROUP BY p.id, p.name, p.nameVi, p.shortDescription, p.shortDescriptionVi, 
               p.price, p.comparePrice, p.stockQuantity, p.isFeatured, p.createdAt,
               p.updatedAt, p.isActive, p.sku, p.weight, p.origin, p.roastLevel,
               p.processingMethod, p.altText, p.metaTitle, p.metaDescription, p.views
    `, { id });

    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Increment view count
    await db.query('UPDATE Products SET views = views + 1 WHERE id = @id', { id });

    // Add category_id for related products
    const productData = product[0];
    if (productData.category_ids) {
      productData.category_id = productData.category_ids.split(',')[0]; // Use first category
    }

    res.json({
      success: true,
      product: productData
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
});

// Populate ProductCategories data
router.post('/admin/populate-categories', async (req, res) => {
  try {
    console.log('🔧 Populating ProductCategories data...');
    
    // Clear existing data
    await db.query('DELETE FROM ProductCategories');
    console.log('🧹 Cleared existing ProductCategories');
    
    // Insert new mappings
    const mappings = [
      { productId: 1, categoryId: 1 }, // Arabica Cầu Đất -> Arabica
      { productId: 2, categoryId: 2 }, // Robusta Lâm Đồng -> Robusta  
      { productId: 3, categoryId: 3 }, // Specialty Blend -> Blends
      { productId: 4, categoryId: 4 }, // Dark Roast -> Dark Roast
      { productId: 5, categoryId: 1 }, // Medium Roast -> Arabica
      { productId: 5, categoryId: 3 }, // Medium Roast -> Blends (multiple categories)
    ];
    
    for (const mapping of mappings) {
      await db.query(
        'INSERT INTO ProductCategories (productId, categoryId) VALUES (@productId, @categoryId)',
        mapping
      );
      console.log(`✅ Assigned product ${mapping.productId} to category ${mapping.categoryId}`);
    }
    
    // Verify the data
    const result = await db.query(`
      SELECT 
        pc.productId, 
        pc.categoryId,
        p.name as productName,
        c.name as categoryName,
        c.slug as categorySlug
      FROM ProductCategories pc
      LEFT JOIN Products p ON pc.productId = p.id
      LEFT JOIN Categories c ON pc.categoryId = c.id
      ORDER BY pc.productId, pc.categoryId
    `);
    
    console.log('📊 ProductCategories populated:', result);
    
    res.json({
      success: true,
      message: 'ProductCategories populated successfully',
      mappings: result || [],
      count: result?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error populating ProductCategories:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

module.exports = router;
