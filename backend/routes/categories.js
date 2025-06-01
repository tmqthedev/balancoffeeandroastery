const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT id, name, nameVi, slug, description
      FROM Categories
      WHERE isActive = 1
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      categories: categories || []
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch categories',
      categories: []
    });
  }
});

module.exports = router;
