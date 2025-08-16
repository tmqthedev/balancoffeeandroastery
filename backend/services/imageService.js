// Local Image Service (Thay thế Firebase Storage)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

class ImageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    this.allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
    
    // Tạo thư mục upload nếu chưa có
    this.ensureUploadDirs();
  }

  // Tạo các thư mục cần thiết
  ensureUploadDirs() {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'products'),
      path.join(this.uploadDir, 'blogs'),
      path.join(this.uploadDir, 'avatars'),
      path.join(this.uploadDir, 'thumbnails')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  // Cấu hình Multer storage
  getStorage(subfolder = '') {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = subfolder 
          ? path.join(this.uploadDir, subfolder)
          : this.uploadDir;
        
        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Tạo tên file unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
      }
    });
  }

  // File filter để kiểm tra loại file
  fileFilter(req, file, cb) {
    if (this.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${this.allowedTypes.join(', ')}`), false);
    }
  }

  // Middleware upload cho products
  uploadProductImages() {
    return multer({
      storage: this.getStorage('products'),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: this.fileFilter.bind(this)
    }).array('images', 5); // Tối đa 5 ảnh
  }

  // Middleware upload cho blogs
  uploadBlogImages() {
    return multer({
      storage: this.getStorage('blogs'),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: this.fileFilter.bind(this)
    }).single('featuredImage');
  }

  // Middleware upload cho avatars
  uploadAvatar() {
    return multer({
      storage: this.getStorage('avatars'),
      limits: {
        fileSize: this.maxFileSize
      },
      fileFilter: this.fileFilter.bind(this)
    }).single('avatar');
  }

  // Xóa file
  deleteFile(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Xóa nhiều files
  deleteFiles(filePaths) {
    const results = [];
    filePaths.forEach(filePath => {
      results.push(this.deleteFile(filePath));
    });
    return results;
  }

  // Lấy URL của file
  getFileUrl(filePath) {
    const baseUrl = process.env.IMAGES_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    return `${baseUrl}/uploads/${filePath}`;
  }

  // Lấy URLs của nhiều files
  getFileUrls(filePaths) {
    return filePaths.map(filePath => this.getFileUrl(filePath));
  }

  // Kiểm tra file có tồn tại không
  fileExists(filePath) {
    const fullPath = path.join(this.uploadDir, filePath);
    return fs.existsSync(fullPath);
  }

  // Lấy thông tin file
  getFileInfo(filePath) {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          path: filePath,
          url: this.getFileUrl(filePath),
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // Tối ưu hóa hình ảnh (cần cài thêm sharp package)
  async optimizeImage(inputPath, outputPath, options = {}) {
    try {
      const sharp = require('sharp');
      
      const {
        width = 800,
        height = 600,
        quality = 80,
        format = 'jpeg'
      } = options;

      await sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toFile(outputPath);

      return true;
    } catch (error) {
      console.error('Error optimizing image:', error);
      return false;
    }
  }

  // Tạo thumbnail
  async createThumbnail(imagePath, thumbnailPath, size = 150) {
    try {
      const sharp = require('sharp');
      
      await sharp(path.join(this.uploadDir, imagePath))
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 75 })
        .toFile(path.join(this.uploadDir, 'thumbnails', thumbnailPath));

      return `thumbnails/${thumbnailPath}`;
    } catch (error) {
      console.error('Error creating thumbnail:', error);
      return null;
    }
  }

  // Dọn dẹp files cũ (chạy định kỳ)
  cleanupOldFiles(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const cleanupDir = (dirPath) => {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath);
        let deletedCount = 0;

        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);

          if (stats.isFile() && stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        });

        return deletedCount;
      };

      const results = {
        products: cleanupDir(path.join(this.uploadDir, 'products')),
        blogs: cleanupDir(path.join(this.uploadDir, 'blogs')),
        avatars: cleanupDir(path.join(this.uploadDir, 'avatars')),
        thumbnails: cleanupDir(path.join(this.uploadDir, 'thumbnails'))
      };

      console.log('Cleanup results:', results);
      return results;
    } catch (error) {
      console.error('Error during cleanup:', error);
      return null;
    }
  }
}

module.exports = new ImageService();
