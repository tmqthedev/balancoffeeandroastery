// Routes để xử lý upload images (thay thế Firebase Storage)
const express = require('express');
const router = express.Router();
const imageService = require('../services/imageService');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

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
router.post('/products', authenticateToken, requireAdmin, (req, res) => {
  const upload = imageService.uploadProductImages();
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    try {
      const uploadedFiles = [];

      for (const file of req.files) {
        const relativePath = `products/${file.filename}`;
        const fileInfo = {
          path: relativePath,
          url: imageService.getFileUrl(relativePath),
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        };

        // Tạo thumbnail nếu cần
        if (req.body.createThumbnail === 'true') {
          const thumbnailPath = await imageService.createThumbnail(
            relativePath,
            `thumb-${file.filename}`
          );
          if (thumbnailPath) {
            fileInfo.thumbnail = imageService.getFileUrl(thumbnailPath);
          }
        }

        uploadedFiles.push(fileInfo);
      }

      res.json({
        success: true,
        message: 'Images uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Error processing uploaded files:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing uploaded files'
      });
    }
  });
});

// Upload blog featured image
router.post('/blogs', authenticateToken, requireAdmin, (req, res) => {
  const upload = imageService.uploadBlogImages();
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const relativePath = `blogs/${req.file.filename}`;
      const fileInfo = {
        path: relativePath,
        url: imageService.getFileUrl(relativePath),
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      // Tạo thumbnail
      const thumbnailPath = await imageService.createThumbnail(
        relativePath,
        `thumb-${req.file.filename}`
      );
      if (thumbnailPath) {
        fileInfo.thumbnail = imageService.getFileUrl(thumbnailPath);
      }

      res.json({
        success: true,
        message: 'Blog image uploaded successfully',
        file: fileInfo
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing uploaded file'
      });
    }
  });
});

// Upload user avatar
router.post('/avatar', (req, res) => {
  const upload = imageService.uploadAvatar();
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const relativePath = `avatars/${req.file.filename}`;
      const fileInfo = {
        path: relativePath,
        url: imageService.getFileUrl(relativePath),
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      };

      // Tạo thumbnail cho avatar
      const thumbnailPath = await imageService.createThumbnail(
        relativePath,
        `thumb-${req.file.filename}`,
        100 // Kích thước nhỏ hơn cho avatar
      );
      if (thumbnailPath) {
        fileInfo.thumbnail = imageService.getFileUrl(thumbnailPath);
      }

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        file: fileInfo
      });
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing uploaded file'
      });
    }
  });
});

// Delete file
router.delete('/:category/:filename', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, filename } = req.params;
    const allowedCategories = ['products', 'blogs', 'avatars', 'thumbnails'];
    
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const filePath = `${category}/${filename}`;
    const deleted = imageService.deleteFile(filePath);

    if (deleted) {
      // Xóa thumbnail tương ứng nếu có
      if (category !== 'thumbnails') {
        imageService.deleteFile(`thumbnails/thumb-${filename}`);
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Get file info
router.get('/info/:category/:filename', (req, res) => {
  try {
    const { category, filename } = req.params;
    const filePath = `${category}/${filename}`;
    
    const fileInfo = imageService.getFileInfo(filePath);
    
    if (fileInfo) {
      res.json({
        success: true,
        file: fileInfo
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file info'
    });
  }
});

// Cleanup old files (Admin only)
router.post('/cleanup', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { days = 30 } = req.body;
    const results = imageService.cleanupOldFiles(days);
    
    if (results) {
      res.json({
        success: true,
        message: 'Cleanup completed successfully',
        results
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Cleanup failed'
      });
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup'
    });
  }
});

// Serve static files
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

module.exports = router;
