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

function normalizeSortQuery({ sort, sortBy, order }) {
  if (sort) return sort;
  if (!sortBy) return undefined;

  if (sortBy === 'price') {
    return order === 'desc' ? 'price_desc' : 'price_asc';
  }

  if (sortBy === 'name') {
    return order === 'desc' ? 'name_desc' : 'name_asc';
  }

  return sortBy;
}

function sendProductList(res, result) {
  const pagination = result.pagination || {};

  return res.json({
    success: true,
    products: result.products || [],
    pagination,
    total: pagination.totalProducts || 0,
    page: pagination.currentPage || 1,
    totalPages: pagination.totalPages || 1
  });
}

function normalizeWeightPricing(weightPricing) {
  if (Array.isArray(weightPricing)) {
    return weightPricing.map((item, index) => ({
      ...item,
      weight: item.weight ?? (parseInt(String(item.weightDisplay || '').replace(/\D/g, ''), 10) || null),
      weightDisplay: item.weightDisplay || (item.weight ? `${item.weight}g` : undefined),
      price: Number(item.price || 0),
      isAvailable: item.isAvailable !== false,
      isDefault: item.isDefault === true || index === 1
    }));
  }

  if (weightPricing && typeof weightPricing === 'object') {
    return Object.entries(weightPricing).map(([weightDisplay, price], index) => ({
      weightDisplay,
      weight: parseInt(weightDisplay.replace(/\D/g, ''), 10) || null,
      price: Number(price || 0),
      stockQuantity: 0,
      isAvailable: true,
      isDefault: weightDisplay === '250g' || index === 1,
      discount: { isActive: false }
    }));
  }

  return [];
}

console.log('🛒 Products router loading');

// GET /api/products/test - Simple test route
router.get('/test', async (req, res) => {
  return res.json({ success: true, message: 'Products route working!', db: !!req.db });
});

// GET /api/products - List all products with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching products list');
    

    const { page = 1, limit = 12, search, category, featured, minPrice, maxPrice } = req.query;
    const normalizedSort = normalizeSortQuery(req.query);

    if (req.databaseProvider === 'postgres') {
      const result = await postgresCatalog.listProducts({
        page,
        limit,
        search,
        category,
        featured,
        minPrice,
        maxPrice,
        sort: normalizedSort
      });

      return sendProductList(res, result);
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
    const sortOptions = buildSort(normalizedSort) || { created_at: -1 };
    
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
      },
      total: totalProducts,
      page: parseInt(page),
      totalPages
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

// GET /api/products/search - Search products through the API service contract
router.get('/search', async (req, res) => {
  try {
    const search = req.query.search || req.query.q || req.query.query || '';
    const { page = 1, limit = 12, category, minPrice, maxPrice } = req.query;
    const normalizedSort = normalizeSortQuery(req.query);

    if (req.databaseProvider === 'postgres') {
      const result = await postgresCatalog.listProducts({
        page,
        limit,
        search,
        category,
        minPrice,
        maxPrice,
        sort: normalizedSort
      });

      return sendProductList(res, result);
    }

    const collection = getCollection(req, 'products');
    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    } : {};

    if (category) {
      filter.$and = [{
        $or: [
          { category },
          { categoryId: category },
          { 'category.slug': category },
          { 'category.name': category }
        ]
      }];
    }

    const { skip, limit: actualLimit } = paginateQuery(page, limit);
    const totalProducts = await collection.countDocuments(filter);
    const products = await collection.find(filter)
      .sort(buildSort(normalizedSort))
      .skip(skip)
      .limit(actualLimit)
      .toArray();

    return res.json({
      success: true,
      products: products.map(product => ({ ...product, id: product._id.toString() })),
      total: totalProducts,
      page: parseInt(page),
      totalPages: Math.ceil(totalProducts / actualLimit)
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return res.status(500).json({ success: false, error: 'Failed to search products' });
  }
});

// GET /api/products/search-suggestions - Lightweight product name suggestions
router.get('/search-suggestions', async (req, res) => {
  try {
    const search = req.query.q || req.query.search || '';
    const limit = Math.min(parseInt(req.query.limit || 8), 20);

    if (!search || search.trim().length < 2) {
      return res.json({ success: true, suggestions: [] });
    }

    if (req.databaseProvider === 'postgres') {
      const result = await postgresCatalog.listProducts({
        search,
        limit,
        page: 1,
        sort: 'name_asc'
      });

      return res.json({
        success: true,
        suggestions: result.products.map(product => product.name).filter(Boolean)
      });
    }

    const collection = getCollection(req, 'products');
    const products = await collection.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }).limit(limit).toArray();

    return res.json({
      success: true,
      suggestions: products.map(product => product.name).filter(Boolean)
    });
  } catch (error) {
    console.error('❌ Error fetching product suggestions:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch product suggestions' });
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

// GET /api/products/category/:category - Products by category API contract
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, minPrice, maxPrice } = req.query;
    const normalizedSort = normalizeSortQuery(req.query);

    if (req.databaseProvider === 'postgres') {
      const result = await postgresCatalog.listProducts({
        page,
        limit,
        category,
        minPrice,
        maxPrice,
        sort: normalizedSort
      });

      return sendProductList(res, result);
    }

    const collection = getCollection(req, 'products');
    const filter = {
      $or: [
        { category },
        { categoryId: category },
        { 'category.slug': category },
        { 'category.name': category }
      ]
    };
    const { skip, limit: actualLimit } = paginateQuery(page, limit);
    const totalProducts = await collection.countDocuments(filter);
    const products = await collection.find(filter)
      .sort(buildSort(normalizedSort))
      .skip(skip)
      .limit(actualLimit)
      .toArray();

    return res.json({
      success: true,
      products: products.map(product => ({ ...product, id: product._id.toString() })),
      total: totalProducts,
      page: parseInt(page),
      totalPages: Math.ceil(totalProducts / actualLimit)
    });
  } catch (error) {
    console.error('❌ Error fetching category products:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch products by category' });
  }
});

// GET /api/products/:id/related - Related products API contract
router.get('/:id/related', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || 4), 20);

    if (req.databaseProvider === 'postgres') {
      const product = await postgresCatalog.getProductByLegacyId(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const products = await postgresCatalog.getRelatedProducts(product, limit);
      return res.json({ success: true, products });
    }

    const collection = getCollection(req, 'products');
    const productId = toObjectId(req.params.id);
    const product = await collection.findOne({ _id: productId });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const category = product.categoryId || product.category?.slug || product.category?.name || product.category;
    const relatedProducts = await collection.find({
      _id: { $ne: productId },
      $or: [
        { category },
        { categoryId: category },
        { 'category.slug': category },
        { 'category.name': category }
      ]
    }).limit(limit).toArray();

    return res.json({
      success: true,
      products: relatedProducts.map(item => ({ ...item, id: item._id.toString() }))
    });
  } catch (error) {
    console.error('❌ Error fetching related products:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch related products' });
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

// PUT /api/products/:id/pricing - Update product pricing (Admin only)
router.put('/:id/pricing', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const weightPricing = normalizeWeightPricing(req.body.weightPricing);

    if (!weightPricing.length) {
      return res.status(400).json({ success: false, error: 'weightPricing is required' });
    }

    if (req.databaseProvider === 'postgres') {
      const product = await postgresCatalog.updateProduct(req.params.id, { weightPricing });

      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      return res.json({
        success: true,
        message: 'Product pricing updated successfully',
        product
      });
    }

    const collection = getCollection(req, 'products');
    const productId = toObjectId(req.params.id);
    const result = await collection.findOneAndUpdate(
      { _id: productId },
      { $set: { weightPricing, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const product = result.value || result;
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    return res.json({
      success: true,
      message: 'Product pricing updated successfully',
      product: { ...product, id: product._id.toString() }
    });
  } catch (error) {
    console.error(`❌ Error updating product pricing ${req.params.id}:`, error);
    return res.status(500).json({ success: false, error: 'Failed to update product pricing' });
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
