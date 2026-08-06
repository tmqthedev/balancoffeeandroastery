const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCollection,
  toObjectId,
  createDocument,
  updateDocument,
  paginateQuery,
  buildSort,
  validateRequired,
  cleanData
} = require('../middleware/mongoHelpers');
const postgresCatalog = require('../repositories/postgresCatalogRepository');
const productController = require('../controllers/productController');

// GET /api/products/recommendations - Get AI recommendations
router.get('/recommendations', productController.getRecommendations);

console.log('🛒 Products router loading');

// GET /api/products/test - Simple test route
router.get('/test', async (req, res) => {
  return res.json({ success: true, message: 'Products route working!', db: !!req.db });
});

// GET /api/products - List all products with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching products list');
    

    const { page = 1, limit = 12, search, category, featured, minPrice, maxPrice, sort } = req.query;

    if (req.databaseProvider === 'postgres') {
      const result = await postgresCatalog.listProducts({
        page,
        limit,
        search,
        category,
        featured,
        minPrice,
        maxPrice,
        sort
      });

      return res.json({
        success: true,
        products: result.products,
        pagination: result.pagination
      });
    }

    const collection = getCollection(req, 'products');
    
    // Build filter query
    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort options
    const sortOptions = buildSort(sort) || { created_at: -1 };
    
    // Calculate pagination
    const { skip, limit: actualLimit } = paginateQuery(page, limit);
    
    // Get total count for pagination
    const totalProducts = await collection.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / actualLimit);
    
    // Fetch products
    const products = await collection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(actualLimit)
      .toArray();
    
    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product,
      id: product._id.toString()
    }));
    
    // Return paginated result
    res.json({
      success: true,
      products: productsWithId,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: actualLimit
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
  try {
    console.log('⭐ Fetching featured products');
    
    const { limit = 8 } = req.query;

    if (req.databaseProvider === 'postgres') {
      const featuredProducts = await postgresCatalog.listFeaturedProducts(parseInt(limit));
      return res.json(featuredProducts);
    }

    const collection = getCollection(req, 'products');
    
    const featuredProducts = await collection.find({ featured: true })
      .limit(parseInt(limit))
      .sort({ created_at: -1 })
      .toArray();
    
    // Add id field for frontend compatibility
    const featuredProductsWithId = featuredProducts.map(product => ({
      ...product,
      id: product._id.toString()
    }));
    
    res.json(featuredProductsWithId);
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch featured products' });
  }
});

// GET /api/products/categories - Get all product categories
router.get('/categories', async (req, res) => {
  try {
    console.log('📂 Fetching product categories');
    
    if (req.databaseProvider === 'postgres') {
      const categories = await postgresCatalog.listProductCategories();
      return res.json(categories);
    }

    const collection = getCollection(req, 'products');
    
    const categories = await collection.distinct('category');
    
    res.json(categories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id - Get single product with related products
router.get('/:id', async (req, res) => {
  try {
    console.log(`🔍 Fetching product ${req.params.id}`);
    
    if (req.databaseProvider === 'postgres') {
      const product = await postgresCatalog.getProductByLegacyId(req.params.id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const relatedProducts = await postgresCatalog.getRelatedProducts(product);

      return res.json({
        product,
        relatedProducts
      });
    }

    const collection = getCollection(req, 'products');
    const productId = toObjectId(req.params.id);
    
    if (!productId) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const product = await collection.findOne({ _id: productId });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get related products in the same category
    const relatedProducts = await collection.find({
      category: product.category,
      _id: { $ne: productId }
    }).limit(4).toArray();
    
    // Add id field for frontend compatibility
    const productWithId = { ...product, id: product._id.toString() };
    const relatedProductsWithId = relatedProducts.map(p => ({ ...p, id: p._id.toString() }));
    
    res.json({
      product: productWithId,
      relatedProducts: relatedProductsWithId
    });
  } catch (error) {
    console.error(`❌ Error fetching product ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('➕ Creating new product');
    
    // Check admin authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.databaseProvider === 'postgres') {
      if (!req.body.name || !req.body.description || !(req.body.categoryId || req.body.category)) {
        return res.status(400).json({ error: 'Missing required fields: name, description, categoryId/category' });
      }

      const product = await postgresCatalog.createProduct(req.body);

      return res.status(201).json({
        message: 'Product created successfully',
        product
      });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category'];
    const validation = validateRequired(req.body, requiredFields);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const collection = getCollection(req, 'products');
    
    // Prepare product data
    const productData = cleanData({
      ...req.body,
      price: parseFloat(req.body.price),
      featured: req.body.featured === true || req.body.featured === 'true',
      inStock: req.body.inStock !== false && req.body.inStock !== 'false',
      created_at: new Date(),
      updated_at: new Date()
    });
    
    const result = await createDocument(collection, productData);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: result
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return res.status(500).json({ success: false, error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`✏️ Updating product ${req.params.id}`);
    
    // Check admin authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.databaseProvider === 'postgres') {
      const product = await postgresCatalog.updateProduct(req.params.id, req.body);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.json({
        message: 'Product updated successfully',
        product
      });
    }
    
    const collection = getCollection(req, 'products');
    const productId = toObjectId(req.params.id);
    
    if (!productId) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    // Prepare update data
    const updateData = cleanData({
      ...req.body,
      ...(req.body.price && { price: parseFloat(req.body.price) }),
      ...(req.body.featured !== undefined && { featured: req.body.featured === true || req.body.featured === 'true' }),
      ...(req.body.inStock !== undefined && { inStock: req.body.inStock !== false && req.body.inStock !== 'false' }),
      updated_at: new Date()
    });
    
    const result = await updateDocument(collection, productId, updateData);
    
    if (!result) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      message: 'Product updated successfully',
      product: result
    });
  } catch (error) {
    console.error(`❌ Error updating product ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log(`🗑️ Deleting product ${req.params.id}`);
    
    // Check admin authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (req.databaseProvider === 'postgres') {
      const deletedCount = await postgresCatalog.deleteProduct(req.params.id);

      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      return res.json({ message: 'Product deleted successfully' });
    }
    
    const collection = getCollection(req, 'products');
    const productId = toObjectId(req.params.id);
    
    if (!productId) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }
    
    const result = await collection.deleteOne({ _id: productId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`❌ Error deleting product ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: 'Failed to delete product' });
  }
});

module.exports = router;
