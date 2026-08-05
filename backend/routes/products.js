const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const productController = require('../controllers/productController');

console.log('🛒 Products router loading');

// GET /api/products/test - Simple test route
router.get('/test', productController.test);

// GET /api/products/recommendations - Get AI recommendations
router.get('/recommendations', productController.getRecommendations);

// GET /api/products/featured - Get featured products
router.get('/featured', productController.getFeaturedProducts);

// GET /api/products/categories - Get all product categories
router.get('/categories', productController.getCategories);

// GET /api/products - List all products
router.get('/', productController.getProducts);

// GET /api/products/:id - Get single product
router.get('/:id', productController.getProduct);

// POST /api/products - Create new product (Admin only)
router.post('/', authenticateToken, productController.createProduct);

// PUT /api/products/:id - Update product (Admin only)
router.put('/:id', authenticateToken, productController.updateProduct);

// DELETE /api/products/:id - Delete product (Admin only)
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
