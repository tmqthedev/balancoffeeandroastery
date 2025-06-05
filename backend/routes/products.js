const express = require('express');
const router = express.Router();
const db = require('../config/database');

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
    const params = { offset: parseInt(offset), limit: parseInt(limit) };

    // Apply filters
    if (category) {
      whereConditions.push('c.slug = @category');
      params.category = category;
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
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(p.id) as total
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      ${whereClause}
    `;
    
    console.log('🔍 Count query:', countQuery);
    console.log('🔍 Query params:', params);
    const countResult = await db.query(countQuery, params);
    console.log('🔍 Count result:', countResult);
    const total = countResult[0]?.total || 0;

    // Get products
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
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
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

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.query(`
      SELECT 
        p.*,
        STRING_AGG(c.name, ', ') as categories,
        STRING_AGG(c.nameVi, ', ') as categoriesVi
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      WHERE p.id = @id AND p.isActive = 1
      GROUP BY p.id, p.name, p.nameVi, p.shortDescription, p.shortDescriptionVi, 
               p.price, p.comparePrice, p.stockQuantity, p.isFeatured, p.createdAt,
               p.updatedAt, p.isActive, p.sku, p.weight, p.origin, p.roastLevel,
               p.processingMethod, p.altText, p.metaTitle, p.metaDescription
    `, { id });

    if (!product || product.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Increment view count
    await db.query('UPDATE Products SET views = views + 1 WHERE id = @id', { id });

    res.json({
      success: true,
      product: product[0]
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch product' 
    });
  }
});

module.exports = router;
