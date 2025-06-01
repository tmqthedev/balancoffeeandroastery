const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    const categories = await db.query(`
      SELECT 
        id,
        name,
        nameVi,
        slug,
        description,
        descriptionVi,
        isActive,
        createdAt,
        (SELECT COUNT(*) FROM ProductCategories pc 
         INNER JOIN Products p ON pc.productId = p.id 
         WHERE pc.categoryId = Categories.id AND p.isActive = 1) as productCount
      FROM Categories
      WHERE isActive = 1
      ORDER BY name
    `);

    // Return categories with localized content
    const localizedCategories = categories.map(category => ({
      id: category.id,
      name: lang === 'vi' ? category.nameVi : category.name,
      slug: category.slug,
      description: lang === 'vi' ? category.descriptionVi : category.description,
      productCount: category.productCount,
      createdAt: category.createdAt
    }));

    res.json(localizedCategories);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { lang = 'en' } = req.query;

    const categories = await db.query(`
      SELECT 
        id,
        name,
        nameVi,
        slug,
        description,
        descriptionVi,
        isActive,
        createdAt
      FROM Categories
      WHERE slug = @slug AND isActive = 1
    `, { slug });

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[0];

    // Return category with localized content
    const localizedCategory = {
      id: category.id,
      name: lang === 'vi' ? category.nameVi : category.name,
      slug: category.slug,
      description: lang === 'vi' ? category.descriptionVi : category.description,
      createdAt: category.createdAt
    };

    res.json(localizedCategory);

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

module.exports = router;
