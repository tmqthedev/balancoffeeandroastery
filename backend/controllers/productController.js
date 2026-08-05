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
const bedrockService = require('../services/bedrockService');

const productController = {
  // Test route
  test: async (req, res) => {
    return res.json({ success: true, message: 'Products controller working!', db: !!req.db });
  },

  // Get all products with pagination, search, and filtering
  getProducts: async (req, res) => {
    try {
      console.log('📋 Fetching products list');
      
      const { page = 1, limit = 12, search, category, featured, minPrice, maxPrice, sort } = req.query;
      const collection = getCollection(req, 'products');
      
      let filter = {};
      
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (category) filter.category = category;
      if (featured === 'true') filter.featured = true;
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }
      
      const sortOptions = buildSort(sort) || { created_at: -1 };
      const { skip, limit: actualLimit } = paginateQuery(page, limit);
      const totalProducts = await collection.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / actualLimit);
      
      const products = await collection
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(actualLimit)
        .toArray();
      
      const productsWithId = products.map(product => ({
        ...product,
        id: product._id.toString()
      }));
      
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
      return res.status(500).json({ success: false, error: 'Failed to fetch products', details: error.message });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      console.log('⭐ Fetching featured products');
      const { limit = 8 } = req.query;
      const collection = getCollection(req, 'products');
      
      const featuredProducts = await collection.find({ featured: true })
        .limit(parseInt(limit))
        .sort({ created_at: -1 })
        .toArray();
      
      const featuredProductsWithId = featuredProducts.map(product => ({
        ...product,
        id: product._id.toString()
      }));
      
      res.json(featuredProductsWithId);
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch featured products' });
    }
  },

  // Get categories
  getCategories: async (req, res) => {
    try {
      console.log('📂 Fetching product categories');
      const collection = getCollection(req, 'products');
      const categories = await collection.distinct('category');
      res.json(categories);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
  },

  // Get single product
  getProduct: async (req, res) => {
    try {
      console.log(`🔍 Fetching product ${req.params.id}`);
      const collection = getCollection(req, 'products');
      const productId = toObjectId(req.params.id);
      
      if (!productId) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      
      const product = await collection.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const relatedProducts = await collection.find({
        category: product.category,
        _id: { $ne: productId }
      }).limit(4).toArray();
      
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
  },

  // Create product (Admin)
  createProduct: async (req, res) => {
    try {
      console.log('➕ Creating new product');
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const requiredFields = ['name', 'description', 'price', 'category'];
      const validation = validateRequired(req.body, requiredFields);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }
      
      const collection = getCollection(req, 'products');
      const productData = cleanData({
        ...req.body,
        price: parseFloat(req.body.price),
        featured: req.body.featured === true || req.body.featured === 'true',
        inStock: req.body.inStock !== false && req.body.inStock !== 'false',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      const result = await createDocument(collection, productData);
      res.status(201).json({ message: 'Product created successfully', product: result });
    } catch (error) {
      console.error('❌ Error creating product:', error);
      return res.status(500).json({ success: false, error: 'Failed to create product' });
    }
  },

  // Update product (Admin)
  updateProduct: async (req, res) => {
    try {
      console.log(`✏️ Updating product ${req.params.id}`);
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      
      const collection = getCollection(req, 'products');
      const productId = toObjectId(req.params.id);
      
      if (!productId) {
        return res.status(400).json({ error: 'Invalid product ID format' });
      }
      
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
      
      res.json({ message: 'Product updated successfully', product: result });
    } catch (error) {
      console.error(`❌ Error updating product ${req.params.id}:`, error);
      return res.status(500).json({ success: false, error: 'Failed to update product' });
    }
  },

  // Delete product (Admin)
  deleteProduct: async (req, res) => {
    try {
      console.log(`🗑️ Deleting product ${req.params.id}`);
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
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
  },

  // Get AI recommendations
  getRecommendations: async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ success: false, message: 'Query prompt is required' });
      }

      console.log(`🤖 Getting AI recommendations for: "${query}"`);
      const collection = getCollection(req, 'products');
      
      // Fetch all available products to provide as context
      const allProducts = await collection.find({ inStock: true }).toArray();
      if (allProducts.length === 0) {
        return res.json({ success: true, recommendations: [] });
      }

      // Get recommended IDs from Bedrock
      const recommendedIds = await bedrockService.getRecommendations(query, allProducts);

      if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
        return res.json({ success: true, recommendations: [] });
      }

      // Fetch the actual products based on recommended IDs
      const objectIds = recommendedIds.map(id => toObjectId(id)).filter(id => id !== null);
      
      const recommendedProducts = await collection.find({ _id: { $in: objectIds } }).toArray();
      
      const productsWithId = recommendedProducts.map(p => ({
        ...p,
        id: p._id.toString()
      }));

      res.json({
        success: true,
        recommendations: productsWithId
      });
    } catch (error) {
      console.error('❌ Error getting AI recommendations:', error);
      res.status(500).json({ success: false, error: 'Failed to get recommendations', details: error.message });
    }
  }
};

module.exports = productController;
