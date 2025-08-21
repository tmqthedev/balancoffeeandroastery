const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true 
    }).sort({ name: 1 }).lean();

    res.json({
      success: true,
      categories: categories || []
    });

  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải danh mục',
      error: error.message
    });
  }
});

module.exports = router;
