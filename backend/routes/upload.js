const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/products', requireRole('admin'), uploadController.uploadProductImages);
router.post('/blogs', requireRole('admin'), uploadController.uploadBlogImage);
router.post('/avatar', uploadController.uploadAvatar);
router.delete('/:category/:filename', requireRole('admin'), uploadController.deleteFile);

module.exports = router;
