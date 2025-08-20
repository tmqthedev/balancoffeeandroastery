const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { bucket } = require('../config/database');

class ImageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.publicDir = path.join(__dirname, '../public');
    this.imageFolder = {
      PRODUCTS: 'products',
      USERS: 'users', 
      BLOGS: 'blogs',
      CATEGORIES: 'categories',
      LOGOS: 'logos',
      BANNERS: 'banners',
      TEMP: 'temp'
    };
    this.initializeDirectories();
  }

  async initializeDirectories() {
    const directories = [
      // Upload directories
      path.join(this.uploadDir, this.imageFolder.PRODUCTS),
      path.join(this.uploadDir, this.imageFolder.USERS),
      path.join(this.uploadDir, this.imageFolder.BLOGS),
      path.join(this.uploadDir, this.imageFolder.CATEGORIES),
      path.join(this.uploadDir, this.imageFolder.LOGOS),
      path.join(this.uploadDir, this.imageFolder.BANNERS),
      path.join(this.uploadDir, this.imageFolder.TEMP),
      
      // Public directories
      path.join(this.publicDir, 'images', this.imageFolder.PRODUCTS, 'thumbnails'),
      path.join(this.publicDir, 'images', this.imageFolder.PRODUCTS, 'small'),
      path.join(this.publicDir, 'images', this.imageFolder.PRODUCTS, 'medium'),
      path.join(this.publicDir, 'images', this.imageFolder.PRODUCTS, 'large'),
      path.join(this.publicDir, 'images', this.imageFolder.USERS),
      path.join(this.publicDir, 'images', this.imageFolder.BLOGS),
      path.join(this.publicDir, 'images', this.imageFolder.CATEGORIES),
      path.join(this.publicDir, 'images', this.imageFolder.LOGOS),
      path.join(this.publicDir, 'images', this.imageFolder.BANNERS)
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Error creating directory ${dir}:`, error);
      }
    }
    
    console.log('✅ Image directories initialized');
  }

  // Multer configuration for local storage
  getMulterConfig(folder = 'TEMP') {
    const folderName = this.imageFolder[folder] || folder;
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(this.uploadDir, folderName));
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${folderName}-${name}-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, WebP)!'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10 // Maximum 10 files
      }
    });
  }

  // Process and optimize images
  async processImage(inputPath, outputPath, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 85,
      format = 'webp',
      fit = 'cover'
    } = options;

    try {
      let sharpInstance = sharp(inputPath);
      
      // Resize if dimensions provided
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { 
          fit: fit,
          position: 'center',
          withoutEnlargement: true
        });
      }
      
      // Convert to format and set quality
      if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      } else if (format === 'jpeg' || format === 'jpg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality });
      }
      
      await sharpInstance.toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Generate multiple sizes for responsive images
  async generateImageVariants(inputPath, filename, folder = 'products') {
    const sizes = {
      thumbnail: { width: 150, height: 150, quality: 75 },
      small: { width: 400, height: 400, quality: 80 },
      medium: { width: 800, height: 800, quality: 85 },
      large: { width: 1200, height: 1200, quality: 90 }
    };

    const variants = {};
    const baseDir = path.join(this.publicDir, 'images', folder);
    const baseName = path.parse(filename).name;

    try {
      for (const [sizeName, dimensions] of Object.entries(sizes)) {
        const outputFileName = `${baseName}-${sizeName}.webp`;
        const outputPath = path.join(baseDir, sizeName, outputFileName);
        
        await this.processImage(inputPath, outputPath, {
          ...dimensions,
          format: 'webp'
        });
        
        variants[sizeName] = `/images/${folder}/${sizeName}/${outputFileName}`;
      }

      // Original size in WebP
      const originalFileName = `${baseName}-original.webp`;
      const originalPath = path.join(baseDir, originalFileName);
      await this.processImage(inputPath, originalPath, {
        format: 'webp',
        quality: 95
      });
      variants.original = `/images/${folder}/${originalFileName}`;

      return variants;
    } catch (error) {
      console.error('Error generating image variants:', error);
      throw error;
    }
  }

  // Upload to Firebase Storage (Cloud)
  async uploadToFirebaseStorage(file, folder = 'general', generateVariants = false) {
    try {
      if (!bucket) {
        throw new Error('Firebase Storage not initialized');
      }

      const folderName = this.imageFolder[folder] || folder;
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const baseName = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `${folderName}/${baseName}-${timestamp}-${randomId}`;

      if (generateVariants) {
        // Generate multiple sizes
        const variants = {};
        const sizes = {
          thumbnail: { width: 150, height: 150 },
          small: { width: 400, height: 400 },
          medium: { width: 800, height: 800 },
          large: { width: 1200, height: 1200 }
        };

        for (const [sizeName, dimensions] of Object.entries(sizes)) {
          const processedBuffer = await sharp(file.buffer)
            .resize(dimensions.width, dimensions.height, { 
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality: 85 })
            .toBuffer();

          const variantFileName = `${fileName}-${sizeName}.webp`;
          const firebaseFile = bucket.file(variantFileName);
          
          await firebaseFile.save(processedBuffer, {
            metadata: {
              contentType: 'image/webp'
            }
          });

          // Get public URL
          const [url] = await firebaseFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });

          variants[sizeName] = {
            fileName: variantFileName,
            url,
            path: variantFileName,
            size: sizeName,
            width: dimensions.width,
            height: dimensions.height
          };
        }

        return {
          variants,
          mainImage: variants.large,
          folder: folderName
        };
      } else {
        // Single image upload
        const processedBuffer = await sharp(file.buffer)
          .webp({ quality: 90 })
          .toBuffer();

        const fullFileName = `${fileName}.webp`;
        const firebaseFile = bucket.file(fullFileName);
        
        await firebaseFile.save(processedBuffer, {
          metadata: {
            contentType: 'image/webp'
          }
        });

        const [url] = await firebaseFile.getSignedUrl({
          action: 'read',
          expires: '03-01-2500'
        });

        return {
          fileName: fullFileName,
          url,
          path: fullFileName,
          folder: folderName
        };
      }
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', error);
      throw error;
    }
  }

  // Delete image from Firebase Storage
  async deleteFromFirebaseStorage(filePath) {
    try {
      if (!bucket) {
        console.warn('Firebase Storage not initialized');
        return false;
      }

      await bucket.file(filePath).delete();
      console.log(`✅ Deleted image: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error deleting image from Firebase:', error);
      return false;
    }
  }

  // Delete multiple variants
  async deleteImageVariants(variants) {
    if (!variants || typeof variants !== 'object') return false;

    const deletePromises = Object.values(variants).map(variant => {
      if (variant.path) {
        return this.deleteFromFirebaseStorage(variant.path);
      }
      return Promise.resolve(false);
    });

    const results = await Promise.allSettled(deletePromises);
    return results.every(result => result.status === 'fulfilled' && result.value);
  }

  // Get optimized image URL
  getImageUrl(imagePath, size = 'medium', baseUrl = '') {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    
    // If it's an object with variants
    if (typeof imagePath === 'object' && imagePath.variants) {
      return imagePath.variants[size]?.url || imagePath.variants.medium?.url || null;
    }
    
    return `${baseUrl}${imagePath}`;
  }

  // Clean up old temp files
  async cleanupTempFiles(olderThanHours = 24) {
    try {
      const tempDir = path.join(this.uploadDir, this.imageFolder.TEMP);
      const files = await fs.readdir(tempDir);
      const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Validate image file
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Định dạng file không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('File quá lớn. Kích thước tối đa là 10MB.');
    }

    return true;
  }
}

// Export singleton instance
module.exports = new ImageService();
