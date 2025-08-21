const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

console.log('🛒 Products router loading with MongoDB support');

// Get all products with filtering, sorting and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    console.log('📝 Products query params:', { page, limit, sortBy });

    // Build filter object
    const filter = { isActive: true };

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price_asc':
        sort = { price: 1 };
        break;
      case 'price_desc':
        sort = { price: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    console.log('📊 Products count:', totalProducts);

    // Fetch products
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Add id field for frontend compatibility
    const productsWithId = products.map(product => ({
      ...product,
      id: product._id.toString()
    }));

    console.log('📦 Products found:', productsWithId.length);

    res.json({
      success: true,
      products: productsWithId,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh sách sản phẩm',
      error: error.message
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📦 Fetching product by ID:', id);

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không khả dụng'
      });
    }

    // Get related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(4)
    .select('name price image category')
    .lean();

    // Add id field for frontend compatibility
    const productWithId = { ...product, id: product._id.toString() };
    const relatedProductsWithId = relatedProducts.map(p => ({
      ...p,
      id: p._id.toString()
    }));

    console.log('📦 Product found:', productWithId.name);
    console.log('🔗 Related products:', relatedProductsWithId.length);

    res.json({
      success: true,
      product: productWithId,
      relatedProducts: relatedProductsWithId
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID sản phẩm không hợp lệ'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải sản phẩm',
      error: error.message
    });
  }
});

module.exports = router;
