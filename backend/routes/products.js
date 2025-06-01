const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products with pagination, filtering, and search
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'createdAt',
      order = 'DESC',
      featured,
      minPrice,
      maxPrice
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.isActive = 1'];
    let joinConditions = '';
    const params = {};

    // Search functionality
    if (search) {
      whereConditions.push('(p.name LIKE @search OR p.nameVi LIKE @search OR p.description LIKE @search OR p.descriptionVi LIKE @search)');
      params.search = `%${search}%`;
    }

    // Category filter
    if (category) {
      joinConditions = 'INNER JOIN ProductCategories pc ON p.id = pc.productId INNER JOIN Categories c ON pc.categoryId = c.id';
      whereConditions.push('c.slug = @category');
      params.category = category;
    }

    // Featured filter
    if (featured === 'true') {
      whereConditions.push('p.isFeatured = 1');
    }

    // Price range filter
    if (minPrice) {
      whereConditions.push('p.price >= @minPrice');
      params.minPrice = minPrice;
    }
    if (maxPrice) {
      whereConditions.push('p.price <= @maxPrice');
      params.maxPrice = maxPrice;
    }

    // Build WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort column
    const allowedSortColumns = ['name', 'price', 'createdAt', 'stockQuantity'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'createdAt';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM Products p
      ${joinConditions}
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Get products
    const productsQuery = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.nameVi,
        p.slug,
        p.shortDescription,
        p.shortDescriptionVi,
        p.price,
        p.comparePrice,
        p.sku,
        p.stockQuantity,
        p.weight,
        p.roastLevel,
        p.origin,
        p.processingMethod,
        p.images,
        p.isFeatured,
        p.createdAt
      FROM Products p
      ${joinConditions}
      ${whereClause}
      ORDER BY p.${sortColumn} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    params.offset = offset;
    params.limit = parseInt(limit);

    const products = await db.query(productsQuery, params);

    // Parse images JSON for each product
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json({
      products: processedProducts,
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
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const productQuery = `
      SELECT 
        p.*,
        STRING_AGG(c.name, ', ') as categories,
        STRING_AGG(c.nameVi, ', ') as categoriesVi
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.id = pc.productId
      LEFT JOIN Categories c ON pc.categoryId = c.id
      WHERE p.slug = @slug AND p.isActive = 1
      GROUP BY p.id, p.name, p.nameVi, p.slug, p.description, p.descriptionVi, 
               p.shortDescription, p.shortDescriptionVi, p.price, p.comparePrice, 
               p.sku, p.stockQuantity, p.weight, p.roastLevel, p.origin, 
               p.processingMethod, p.images, p.isActive, p.isFeatured, 
               p.metaTitle, p.metaTitleVi, p.metaDescription, p.metaDescriptionVi, 
               p.createdAt, p.updatedAt
    `;

    const products = await db.query(productQuery, { slug });

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    
    // Parse images JSON
    product.images = product.images ? JSON.parse(product.images) : [];

    // Get related products (same category, excluding current product)
    const relatedQuery = `
      SELECT TOP 4
        p.id,
        p.name,
        p.nameVi,
        p.slug,
        p.shortDescription,
        p.shortDescriptionVi,
        p.price,
        p.comparePrice,
        p.images,
        p.isFeatured
      FROM Products p
      INNER JOIN ProductCategories pc ON p.id = pc.productId
      INNER JOIN ProductCategories pc2 ON pc.categoryId = pc2.categoryId
      WHERE pc2.productId = @productId 
        AND p.id != @productId 
        AND p.isActive = 1
      ORDER BY NEWID()
    `;

    const relatedProducts = await db.query(relatedQuery, { productId: product.id });
    
    // Parse images for related products
    product.relatedProducts = relatedProducts.map(relatedProduct => ({
      ...relatedProduct,
      images: relatedProduct.images ? JSON.parse(relatedProduct.images) : []
    }));

    res.json(product);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const query = `
      SELECT TOP (@limit)
        id,
        name,
        nameVi,
        slug,
        shortDescription,
        shortDescriptionVi,
        price,
        comparePrice,
        images,
        isFeatured
      FROM Products
      WHERE isActive = 1 AND isFeatured = 1
      ORDER BY createdAt DESC
    `;

    const products = await db.query(query, { limit: parseInt(limit) });

    // Parse images JSON for each product
    const processedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    res.json(processedProducts);

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ error: 'Failed to fetch featured products' });
  }
});

module.exports = router;
