const express = require('express');
const router = express.Router();
const {
  getCollection,
  toObjectId,
  createDocument,
  updateDocument,
  paginateQuery,
  buildSort,
  handleDatabaseError,
  validateRequired,
  cleanData
} = require('../middleware/mongoHelpers');

console.log('📂 Backend: Categories router loading');

// Get all categories
router.get('/', async (req, res) => {
  try {
    console.log('📂 Fetching categories');
    
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

    console.log('📂 Categories found:', categoriesWithId.length);

    res.json({
      success: true,
      categories: categoriesWithId || []
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    return handleDatabaseError(error, res, 'Get categories');
  }
});

module.exports = router;
