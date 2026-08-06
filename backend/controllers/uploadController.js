const imageService = require('../services/imageService');

const uploadController = {
  // Upload product images
  uploadProductImages: (req, res) => {
    const upload = imageService.uploadProductImages();
    
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      try {
        const uploadedFiles = [];
        for (const file of req.files) {
          const result = await imageService.processAndUploadImage(file, 'PRODUCTS', {
            format: 'webp',
            quality: 85,
            generateThumbnail: req.body.createThumbnail === 'true'
          });
          
          uploadedFiles.push({
            path: result.path,
            url: result.url,
            thumbnail: result.thumbnailUrl,
            originalName: result.originalName,
            size: result.size,
            mimetype: result.mimetype
          });
        }

        res.json({
          success: true,
          message: 'Images uploaded successfully',
          files: uploadedFiles
        });
      } catch (error) {
        console.error('Error processing uploaded files:', error);
        res.status(500).json({ success: false, message: 'Error processing uploaded files' });
      }
    });
  },

  // Upload blog featured image
  uploadBlogImage: (req, res) => {
    const upload = imageService.uploadBlogImages();
    
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      try {
        const result = await imageService.processAndUploadImage(req.file, 'BLOGS', {
          format: 'webp',
          quality: 85,
          generateThumbnail: true
        });

        res.json({
          success: true,
          message: 'Blog image uploaded successfully',
          file: {
            path: result.path,
            url: result.url,
            thumbnail: result.thumbnailUrl,
            originalName: result.originalName,
            size: result.size,
            mimetype: result.mimetype
          }
        });
      } catch (error) {
        console.error('Error processing uploaded file:', error);
        res.status(500).json({ success: false, message: 'Error processing uploaded file' });
      }
    });
  },

  // Upload user avatar
  uploadAvatar: (req, res) => {
    const upload = imageService.uploadAvatar();
    
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      try {
        const result = await imageService.processAndUploadImage(req.file, 'USERS', {
          format: 'webp',
          quality: 85,
          generateThumbnail: true
        });

        res.json({
          success: true,
          message: 'Avatar uploaded successfully',
          file: {
            path: result.path,
            url: result.url,
            thumbnail: result.thumbnailUrl,
            originalName: result.originalName,
            size: result.size,
            mimetype: result.mimetype
          }
        });
      } catch (error) {
        console.error('Error processing uploaded file:', error);
        res.status(500).json({ success: false, message: 'Error processing uploaded file' });
      }
    });
  },

  // Delete file
  deleteFile: async (req, res) => {
    try {
      const { category, filename } = req.params;
      const allowedCategories = ['products', 'blogs', 'users', 'thumbnails'];
      
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      const s3Key = `${category}/${filename}`;
      const deleted = await imageService.deleteS3Image(s3Key);

      if (deleted) {
        // Also delete thumbnail if it's not already a thumbnail
        if (category !== 'thumbnails') {
          await imageService.deleteS3Image(`${category}/thumb-${filename}`);
        }

        res.json({ success: true, message: 'File deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: 'File not found or failed to delete' });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ success: false, message: 'Error deleting file' });
    }
  }
};

module.exports = uploadController;
