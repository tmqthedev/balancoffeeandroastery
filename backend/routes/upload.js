const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Middleware để kiểm tra quyền admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Upload product images
router.post('/products', requireAdmin, uploadController.uploadProductImages);

// Upload blog featured image
router.post('/blogs', requireAdmin, uploadController.uploadBlogImage);

// Upload user avatar
router.post('/avatar', uploadController.uploadAvatar);

// Delete file
router.delete('/:category/:filename', requireAdmin, uploadController.deleteFile);

module.exports = router;
