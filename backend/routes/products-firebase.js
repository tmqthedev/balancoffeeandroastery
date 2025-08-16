// Updated Products Routes for Firebase
const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { body, validationResult, query } = require('express-validator');

const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories'
};

// Get all products with pagination and filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('search').optional().isString(),
  query('sortBy').optional().isIn(['name', 'price', 'createdAt']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('isActive').optional().isBoolean(),
  query('isFeatured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
      isFeatured
    } = req.query;

    let query = db.collection(COLLECTIONS.PRODUCTS);
    
    // Apply filters
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive);
    }
    
    if (isFeatured !== undefined) {
      query = query.where('isFeatured', '==', isFeatured);
    }
    
    if (category) {
      query = query.where('categories', 'array-contains', category);
    }

    // Apply search (basic implementation)
    if (search) {
      const searchLower = search.toLowerCase();
      query = query.where('name', '>=', searchLower)
                   .where('name', '<=', searchLower + '\uf8ff');
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }
    
    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    res.json({
      success: true,
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: snapshot.docs.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    };

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get product by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const query = db.collection(COLLECTIONS.PRODUCTS)
                   .where('slug', '==', slug)
                   .where('isActive', '==', true)
                   .limit(1);
    
    const snapshot = await query.get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const doc = snapshot.docs[0];
    const product = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    };

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create product (Admin only)
router.post('/', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('nameVi').notEmpty().withMessage('Vietnamese name is required'),
  body('slug').notEmpty().withMessage('Slug is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  body('categories').isArray().withMessage('Categories must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is admin (assuming req.user is set by auth middleware)
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if slug already exists
    const slugQuery = await db.collection(COLLECTIONS.PRODUCTS)
                              .where('slug', '==', req.body.slug)
                              .get();
    
    if (!slugQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'Slug already exists'
      });
    }

    // Check if SKU already exists
    const skuQuery = await db.collection(COLLECTIONS.PRODUCTS)
                             .where('sku', '==', req.body.sku)
                             .get();
    
    if (!skuQuery.empty) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }

    const productData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
      images: req.body.images || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection(COLLECTIONS.PRODUCTS).add(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: docRef.id,
      product: {
        id: docRef.id,
        ...productData
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product (Admin only)
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('nameVi').optional().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('categories').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(id);
    
    // Check if product exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If slug is being updated, check for conflicts
    if (req.body.slug && req.body.slug !== doc.data().slug) {
      const slugQuery = await db.collection(COLLECTIONS.PRODUCTS)
                                .where('slug', '==', req.body.slug)
                                .get();
      
      if (!slugQuery.empty && slugQuery.docs[0].id !== id) {
        return res.status(400).json({
          success: false,
          message: 'Slug already exists'
        });
      }
    }

    // If SKU is being updated, check for conflicts
    if (req.body.sku && req.body.sku !== doc.data().sku) {
      const skuQuery = await db.collection(COLLECTIONS.PRODUCTS)
                               .where('sku', '==', req.body.sku)
                               .get();
      
      if (!skuQuery.empty && skuQuery.docs[0].id !== id) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    await docRef.update(updateData);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { id } = req.params;
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(id);
    
    // Check if product exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const query = db.collection(COLLECTIONS.PRODUCTS)
                   .where('isActive', '==', true)
                   .where('isFeatured', '==', true)
                   .orderBy('createdAt', 'desc')
                   .limit(parseInt(limit));

    const snapshot = await query.get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Search products
router.get('/search/query', [
  query('q').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { q: searchTerm, limit = 20 } = req.query;
    const searchLower = searchTerm.toLowerCase();

    // Search in multiple fields (basic implementation)
    // For advanced search, consider using Algolia or Elasticsearch
    const nameQuery = db.collection(COLLECTIONS.PRODUCTS)
                        .where('isActive', '==', true)
                        .orderBy('name')
                        .startAt(searchLower)
                        .endAt(searchLower + '\uf8ff')
                        .limit(parseInt(limit));

    const nameViQuery = db.collection(COLLECTIONS.PRODUCTS)
                          .where('isActive', '==', true)
                          .orderBy('nameVi')
                          .startAt(searchLower)
                          .endAt(searchLower + '\uf8ff')
                          .limit(parseInt(limit));

    const [nameSnapshot, nameViSnapshot] = await Promise.all([
      nameQuery.get(),
      nameViQuery.get()
    ]);

    const productsMap = new Map();

    nameSnapshot.forEach(doc => {
      productsMap.set(doc.id, {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });

    nameViSnapshot.forEach(doc => {
      if (!productsMap.has(doc.id)) {
        productsMap.set(doc.id, {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      }
    });

    const products = Array.from(productsMap.values());

    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products'
    });
  }
});

module.exports = router;
