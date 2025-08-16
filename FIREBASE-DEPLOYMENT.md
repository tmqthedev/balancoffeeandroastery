# Firebase Free Deployment Guide - Balan Coffee & Roastery (Spark Plan)

## Tổng quan

Hướng dẫn này sẽ giúp bạn triển khai Firebase **hoàn toàn miễn phí** với Spark Plan cho dự án Balan Coffee & Roastery. Chúng ta sẽ không sử dụng Firebase Storage để tiết kiệm chi phí.

## ✅ Firebase Spark Plan (Free) Limitations & Solutions

### Limitations:
- **Firestore**: 1 GB storage, 50,000 reads/day, 20,000 writes/day
- **Authentication**: Unlimited users
- **Hosting**: 10 GB storage, 10 GB/month transfer
- **Functions**: 125,000 invocations/month, 40,000 GB-seconds
- **Storage**: **KHÔNG SỬ DỤNG** (để tránh phí)

### Solutions:
- **Images**: Sử dụng local storage + CDN miễn phí (Cloudinary, ImageKit)
- **Database**: Tối ưu queries để giảm reads/writes
- **Caching**: Implement caching để giảm database calls

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" và tạo project mới
3. Tên project: `balan-coffee-roastery`
4. Bật Google Analytics (optional)
5. Chọn Analytics account hoặc tạo mới

## Bước 2: Cấu hình Firestore Database

1. Trong Firebase Console, chọn **Firestore Database**
2. Click "Create database"
3. Chọn "Start in test mode" (sẽ cấu hình security rules sau)
4. Chọn location gần nhất (asia-southeast1 cho Việt Nam)

⚠️ **LƯU Ý QUAN TRỌNG**: Không bật Firebase Storage để tránh phí!

## Bước 3: Cấu hình Firebase Authentication

1. Trong Firebase Console, chọn **Authentication**
2. Click "Get started"
3. Chọn tab "Sign-in method"
4. Bật các phương thức sau:
   - **Email/Password**: Bật
   - **Facebook**: Bật (cần Facebook App ID và Secret)

### Cấu hình Facebook Login:
1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới hoặc sử dụng app existing
3. Thêm **Facebook Login** product
4. Trong Firebase, nhập Facebook App ID và App Secret
5. Sao chép OAuth redirect URI từ Firebase vào Facebook App settings

## Bước 4: ⚠️ KHÔNG Cấu hình Firebase Storage (Free Plan)

**Chúng ta sẽ KHÔNG sử dụng Firebase Storage** để tránh phí. Thay vào đó:

### Giải pháp lưu trữ hình ảnh miễn phí:

1. **Local Storage** (Development): Lưu trong thư mục `uploads/`
2. **Free CDN Options** (Production):
   - [Cloudinary](https://cloudinary.com/) - 25GB free
   - [ImageKit](https://imagekit.io/) - 20GB free  
   - [Uploadcare](https://uploadcare.com/) - 3GB free
   - GitHub Pages cho static images

### Setup Local Image Storage:
```bash
# Tạo thư mục uploads
mkdir backend/uploads
mkdir backend/uploads/products
mkdir backend/uploads/blogs
mkdir backend/uploads/avatars
mkdir backend/uploads/thumbnails
```

## Bước 5: Tạo Service Account

1. Trong Firebase Console, click Settings ⚙️ > **Project settings**
2. Chọn tab **Service accounts**
3. Click "Generate new private key"
4. Download file JSON và lưu an toàn

## Bước 6: Cấu hình Environment Variables (Free Plan)

### Frontend (.env):
```env
# Firebase Free Plan Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=balan-coffee-roastery.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=balan-coffee-roastery
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_BASE_URL=http://localhost:3000/api

# Image CDN (không dùng Firebase Storage)
VITE_IMAGES_BASE_URL=https://your-cdn-domain.com/images
```

### Backend (.env):
```env
# Firebase Free Plan Configuration  
FIREBASE_PROJECT_ID=balan-coffee-roastery
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@balan-coffee-roastery.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id

# Local Image Storage (thay thế Firebase Storage)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/jpg,image/png,image/webp
IMAGES_BASE_URL=http://localhost:3000

# Server Configuration
PORT=3000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com

# Payment Gateways
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret

# Facebook App
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

## Bước 7: Chạy Migration (Nếu có dữ liệu từ SQL Server)

```bash
# Cài đặt dependencies
cd backend
npm install firebase-admin --legacy-peer-deps

# Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa .env với thông tin Firebase

# Chạy migration
node scripts/migrate-to-firebase.js migrate

# Verify migration
node scripts/migrate-to-firebase.js verify
```

## Bước 8: Setup Dữ liệu Mẫu (Cho project mới)

```bash
# Setup dữ liệu mẫu
node scripts/setup-firebase-data.js

# Thông tin admin được tạo:
# Email: admin@balancoffee.com
# Password: admin123
```

## Bước 9: Cấu hình Firestore Security Rules

Trong Firebase Console > Firestore Database > Rules, thay thế bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products are readable by all, writable by admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories are readable by all, writable by admin only
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders can be read by the user who created them or admin
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Blogs are readable by all, writable by admin only
    match /blogs/{blogId} {
      allow read: if resource.data.status == 'published' || 
        (request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Contacts can be created by anyone, read/updated by admin only
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Subscriptions can be created by anyone, managed by admin
    match /subscriptions/{subId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cart items can be managed by the owner
    match /cartItems/{cartId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Settings readable by all, writable by admin only
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Bước 10: ⚠️ KHÔNG Cấu hình Storage Rules (Free Plan)

**Chúng ta không sử dụng Firebase Storage**, vì vậy bỏ qua bước này.

### Thay vào đó, setup Image Upload Routes:

```bash
# Routes đã được tạo sẵn trong backend/routes/upload.js
# Service quản lý images trong backend/services/imageService.js
```

### Image Upload Endpoints:
- `POST /api/upload/products` - Upload product images (Admin)
- `POST /api/upload/blogs` - Upload blog images (Admin)  
- `POST /api/upload/avatar` - Upload user avatar
- `DELETE /api/upload/:category/:filename` - Delete image (Admin)
- `GET /api/upload/info/:category/:filename` - Get file info

## Bước 11: Update Frontend Services

Các file service đã được tạo sẵn:
- `src/services/authService.js` - Authentication
- `src/services/productService.js` - Products management
- `src/services/orderService.js` - Orders management

## Bước 12: Update Backend Routes

Cần cập nhật các route trong backend để sử dụng Firebase thay vì SQL Server:

```bash
# Backup existing routes
cp -r backend/routes backend/routes-backup

# Update routes để sử dụng Firebase services
```

## Bước 13: Testing

1. **Test Authentication:**
   ```bash
   # Start backend
   cd backend && npm run dev
   
   # Start frontend
   npm run dev
   ```

2. **Test Database Operations:**
   - Đăng ký user mới
   - Đăng nhập với admin account
   - Tạo, đọc, cập nhật products
   - Tạo orders
   - Upload images

## Bước 14: Deployment

### Frontend (Vercel/Netlify):
```bash
npm run build
# Deploy dist folder
```

### Backend (Railway/Heroku):
```bash
# Đảm bảo có environment variables
# Deploy với Docker hoặc Node.js
```

## Database Schema trong Firestore

### Collections Structure:
```
/users/{userId}
/products/{productId}
/categories/{categoryId}
/orders/{orderId}
/blogs/{blogId}
/contacts/{contactId}
/subscriptions/{subscriptionId}
/cartItems/{cartItemId}
/settings/{settingId}
```

### Document Fields:
Chi tiết schema được định nghĩa trong `database/firestore-schema.js`

## 💰 Chi Phí và Monitoring (Free Plan)

### Free Quotas Daily Monitoring:
```bash
# Check Firestore usage
https://console.firebase.google.com/project/your-project/usage

# Setup quota alerts
1. Go to Firebase Console > Usage
2. Set up email alerts at 80% quota
3. Monitor daily reads/writes
```

### Cost-Free Alternatives:

1. **Images**: 
   - Development: Local storage
   - Production: Cloudinary (25GB free)

2. **CDN**: 
   - Cloudflare (free)
   - Netlify CDN (free with hosting)

3. **Hosting**:
   - Vercel (free tier)
   - Netlify (free tier)
   - Firebase Hosting (10GB free)

### Scaling Strategy:
- Start with free tier
- Monitor usage closely  
- Optimize queries to stay within limits
- Consider paid plans only when necessary

## Security Best Practices

1. **API Keys:**
   - Restrict API keys by domain/IP
   - Monitor API usage

2. **Security Rules:**
   - Test rules thoroughly
   - Use least privilege principle

3. **Data Validation:**
   - Validate all inputs
   - Use server-side validation

## Troubleshooting

### Common Issues:

1. **Permission Denied:**
   - Check Firestore security rules
   - Verify user authentication

2. **CORS Errors:**
   - Add domain to Firebase authorized domains
   - Check CORS configuration

3. **Quota Exceeded:**
   - Monitor Firestore usage
   - Optimize queries

### Logs và Debugging:
```bash
# Backend logs
npm run dev

# Firebase Functions logs (if using)
firebase functions:log

# Frontend console errors
Check browser developer tools
```

## 🔥 Tối Ưu cho Free Plan

### 1. Giảm Firestore Reads/Writes:

```javascript
// ✅ Good: Pagination với limit
const products = await db.collection('products')
  .where('isActive', '==', true)
  .limit(10)
  .get();

// ❌ Bad: Không limit
const products = await db.collection('products').get();
```

### 2. Implement Caching:

```javascript
// Frontend caching với localStorage
const cacheKey = 'products_featured';
const cached = localStorage.getItem(cacheKey);
if (cached && Date.now() - JSON.parse(cached).timestamp < 300000) {
  return JSON.parse(cached).data;
}
```

### 3. Batch Operations:

```javascript
// ✅ Good: Batch writes
const batch = db.batch();
orders.forEach(order => {
  batch.set(db.collection('orders').doc(), order);
});
await batch.commit();
```

### 4. Optimize Queries:

```javascript
// ✅ Good: Compound queries
const products = await db.collection('products')
  .where('isActive', '==', true)
  .where('isFeatured', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(8)
  .get();
```

### 5. Image Optimization:

```bash
# Cài đặt Sharp cho optimize images
npm install sharp

# Auto-optimize uploads
const sharp = require('sharp');
await sharp(inputPath)
  .resize(800, 600, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toFile(outputPath);
```

## Backup và Recovery

1. **Firestore Backup:**
   ```bash
   # Scheduled backups
   gcloud firestore export gs://your-bucket/backup-folder
   ```

2. **Storage Backup:**
   - Regular file system backups
   - Cross-region replication

## Support và Documentation

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Console](https://console.firebase.google.com/)

---

## Next Steps

1. Hoàn thành cấu hình Firebase project
2. Chạy migration hoặc setup dữ liệu mẫu
3. Test toàn bộ functionality
4. Deploy lên production
5. Setup monitoring và alerts

Nếu cần hỗ trợ thêm, vui lòng liên hệ team development.
