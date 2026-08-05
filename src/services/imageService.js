// Frontend Image Service (không sử dụng Firebase Storage)
class ImageService {
  constructor() {
    this.baseUrl = '/api';
    this.imagesBaseUrl = '';
  }

  // Upload product images
  async uploadProductImages(files, createThumbnail = true) {
    try {
      const formData = new FormData();
      
      // Add files to form data
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });
      
      if (createThumbnail) {
        formData.append('createThumbnail', 'true');
      }

      const response = await fetch(`${this.baseUrl}/upload/products`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        files: result.files
      };
    } catch (error) {
      console.error('Upload product images error:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Upload blog featured image
  async uploadBlogImage(file) {
    try {
      const formData = new FormData();
      formData.append('featuredImage', file);

      const response = await fetch(`${this.baseUrl}/upload/blogs`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        file: result.file
      };
    } catch (error) {
      console.error('Upload blog image error:', error);
      throw new Error('Failed to upload image');
    }
  }

  // Upload user avatar
  async uploadAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${this.baseUrl}/upload/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return {
        success: true,
        file: result.file
      };
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  // Delete image
  async deleteImage(category, filename) {
    try {
      const response = await fetch(`${this.baseUrl}/upload/${category}/${filename}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Delete image error:', error);
      throw new Error('Failed to delete image');
    }
  }

  // Get image URL
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Build URL from base
    return `${this.imagesBaseUrl}/uploads/${imagePath}`;
  }

  // Get thumbnail URL
  getThumbnailUrl(imagePath) {
    if (!imagePath) return null;
    
    const thumbnailPath = this.getImageUrl(`thumbnails/thumb-${imagePath.split('/').pop()}`);
    return thumbnailPath;
  }

  // Validate image file
  validateImageFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Kích thước file không được vượt quá 5MB');
    }

    return true;
  }

  // Validate multiple files
  validateImageFiles(files) {
    if (!files || files.length === 0) {
      throw new Error('Vui lòng chọn ít nhất 1 file');
    }

    if (files.length > 5) {
      throw new Error('Chỉ được upload tối đa 5 ảnh');
    }

    Array.from(files).forEach(file => {
      this.validateImageFile(file);
    });

    return true;
  }

  // Preview image before upload
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve({
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type
        });
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Create multiple previews
  async createImagePreviews(files) {
    const previews = [];
    
    for (const file of Array.from(files)) {
      try {
        const preview = await this.createImagePreview(file);
        previews.push(preview);
      } catch (error) {
        console.error('Error creating preview:', error);
      }
    }
    
    return previews;
  }

  // Optimize image before upload (client-side compression)
  async compressImage(file, quality = 0.8, maxWidth = 1200, maxHeight = 1200) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve, file.type, quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export default new ImageService();
