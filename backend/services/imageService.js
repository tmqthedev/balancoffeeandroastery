const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

class ImageService {
  constructor() {
    const credentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
      : undefined;

    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      ...(credentials ? { credentials } : {})
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;

    this.imageFolder = {
      PRODUCTS: 'products',
      USERS: 'users', 
      BLOGS: 'blogs',
      CATEGORIES: 'categories',
      LOGOS: 'logos',
      BANNERS: 'banners',
      TEMP: 'temp'
    };
  }

  // File filter for multer
  fileFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh (JPEG, PNG, WebP)!'), false);
    }
  }

  // Use memory storage so we can process with sharp before uploading
  getMulterConfig(folder = 'TEMP') {
    return multer({
      storage: multer.memoryStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10
      }
    });
  }

  uploadProductImages() {
    return this.getMulterConfig('PRODUCTS').array('images', 5);
  }

  uploadBlogImages() {
    return this.getMulterConfig('BLOGS').single('image');
  }

  uploadAvatar() {
    return this.getMulterConfig('USERS').single('avatar');
  }

  // Upload a buffer to S3
  async uploadToS3(buffer, key, mimeType) {
    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME is not configured');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // ACL: 'public-read' // Only if bucket allows ACLs
    });
    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${key}`;
  }

  // Process image and upload to S3
  async processAndUploadImage(file, folder, options = {}) {
    try {
      const folderName = this.imageFolder[folder] || folder;
      const timestamp = Date.now();
      const randomId = Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const baseName = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-');
      const fileName = `${baseName}-${timestamp}-${randomId}`;

      const {
        width,
        height,
        quality = 85,
        format = 'webp',
        fit = 'cover',
        generateThumbnail = false
      } = options;

      let sharpInstance = sharp(file.buffer);
      if (width || height) {
        sharpInstance = sharpInstance.resize(width, height, { 
          fit: fit, position: 'center', withoutEnlargement: true
        });
      }

      let buffer;
      let mimeType;
      if (format === 'webp') {
        buffer = await sharpInstance.webp({ quality }).toBuffer();
        mimeType = 'image/webp';
      } else if (format === 'jpeg' || format === 'jpg') {
        buffer = await sharpInstance.jpeg({ quality }).toBuffer();
        mimeType = 'image/jpeg';
      } else if (format === 'png') {
        buffer = await sharpInstance.png({ quality }).toBuffer();
        mimeType = 'image/png';
      }

      const s3Key = `${folderName}/${fileName}.${format}`;
      const url = await this.uploadToS3(buffer, s3Key, mimeType);

      const result = {
        originalName: file.originalname,
        fileName: `${fileName}.${format}`,
        path: s3Key,
        url: url,
        size: buffer.length,
        mimetype: mimeType
      };

      if (generateThumbnail) {
        const thumbBuffer = await sharp(file.buffer)
          .resize(150, 150, { fit: 'cover', position: 'center' })
          .webp({ quality: 80 })
          .toBuffer();
        
        const thumbKey = `${folderName}/thumb-${fileName}.webp`;
        const thumbUrl = await this.uploadToS3(thumbBuffer, thumbKey, 'image/webp');
        result.thumbnailUrl = thumbUrl;
        result.thumbnailPath = thumbKey;
      }

      return result;
    } catch (error) {
      console.error('Error processing and uploading image:', error);
      throw error;
    }
  }

  // Delete image from S3
  async deleteS3Image(s3Key) {
    try {
      if (!this.bucketName) {
        throw new Error('AWS_S3_BUCKET_NAME is not configured');
      }

      if (!s3Key) return false;
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key
      });
      await this.s3Client.send(command);
      console.log(`✅ Deleted image from S3: ${s3Key}`);
      return true;
    } catch (error) {
      console.error('Error deleting image from S3:', error);
      return false;
    }
  }
}

module.exports = new ImageService();
