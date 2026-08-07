const express = require('express');
const router = express.Router();
const {
  getCollection,
  handleDatabaseError
} = require('../middleware/mongoHelpers');
const postgresCatalog = require('../repositories/postgresCatalogRepository');
const logger = require('../utils/logger');

logger.info('📂 Backend: Categories router loading');

// Get all categories
router.get('/', async (req, res) => {
  try {
    logger.debug('📂 Fetching categories');
    
    if (req.databaseProvider === 'postgres') {
      const categories = await postgresCatalog.listCategories();
      return res.json({
        success: true,
        categories
      });
    }

    // Get categories collection
    const categoriesCollection = getCollection(req, 'categories');
    
    const categories = await categoriesCollection
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();

    // Add id field for frontend compatibility
    const categoriesWithId = categories.map(category => ({
      ...category,
      id: category._id.toString()
    }));

    logger.debug('📂 Categories found:', categoriesWithId.length);

    res.json({
      success: true,
      categories: categoriesWithId || []
    });

  } catch (error) {
    logger.error('❌ Get categories error:', error);
    return handleDatabaseError(error, res, 'Get categories');
  }
});

module.exports = router;
