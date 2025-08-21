# MongoDB Setup Guide for Balan Coffee & Roastery

## Tổng Quan

Dự án Balan Coffee & Roastery đã được chuyển đổi hoàn toàn từ Firebase sang MongoDB. Tài liệu này hướng dẫn cách thiết lập và sử dụng MongoDB cho dự án.

## Yêu Cầu Hệ Thống

- Node.js 16+ 
- MongoDB 6.0+ (Local hoặc MongoDB Atlas)
- npm hoặc yarn

## Cài Đặt MongoDB

### Tùy Chọn 1: MongoDB Local

1. **Tải và cài đặt MongoDB Community Server**:
   ```bash
   # Windows: Tải từ https://www.mongodb.com/try/download/community
   # macOS với Homebrew:
   brew tap mongodb/brew
   brew install mongodb-community
   
   # Ubuntu:
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

2. **Khởi động MongoDB**:
   ```bash
   # Windows: 
   net start MongoDB
   
   # macOS:
   brew services start mongodb/brew/mongodb-community
   
   # Linux:
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Kiểm tra kết nối**:
   ```bash
   mongosh
   # Nếu kết nối thành công, bạn sẽ thấy MongoDB shell
   ```

### Tùy Chọn 2: MongoDB Atlas (Cloud)

1. **Tạo tài khoản MongoDB Atlas**:
   - Đi đến [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Đăng ký tài khoản miễn phí

2. **Tạo Cluster**:
   - Chọn "Build a Database"
   - Chọn gói "Shared" (Miễn phí)
   - Chọn region gần nhất (Singapore cho VN)
   - Đặt tên cluster: `balancoffee-cluster`

3. **Cấu hình Database Access**:
   - Tạo database user với username/password
   - Ghi nhớ thông tin đăng nhập

4. **Cấu hình Network Access**:
   - Thêm IP address hiện tại
   - Hoặc cho phép tất cả IP: `0.0.0.0/0` (chỉ cho development)

5. **Lấy Connection String**:
   - Click "Connect" → "Connect your application"
   - Sao chép connection string
   - Thay thế `<password>` bằng mật khẩu thực

### Tùy Chọn 3: Docker

1. **Chạy MongoDB với Docker**:
   ```bash
   docker run -d \
     --name mongodb \
     -p 27017:27017 \
     -e MONGO_INITDB_ROOT_USERNAME=admin \
     -e MONGO_INITDB_ROOT_PASSWORD=password \
     -v mongodb_data:/data/db \
     mongo:6.0
   ```

2. **Connection string**:
   ```
   mongodb://admin:password@localhost:27017/balancoffee?authSource=admin
   ```

## Cấu Hình Dự Án

### 1. Cài Đặt Dependencies

```bash
# Backend
cd backend
npm install mongoose

# Frontend (đã loại bỏ Firebase)
cd ..
npm uninstall firebase
```

### 2. Cấu Hình Environment Variables

Tạo file `.env` trong thư mục backend:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/balancoffee
# Hoặc sử dụng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/balancoffee?retryWrites=true&w=majority

# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# MoMo Payment (nếu sử dụng)
MOMO_PARTNER_CODE=your_partner_code
MOMO_ACCESS_KEY=your_access_key
MOMO_SECRET_KEY=your_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
```

Tạo file `.env.local` trong thư mục root (frontend):

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Chạy Database Seeding

```bash
cd backend
node seed-mongodb.js
```

Output mong đợi:
```
🌱 Starting MongoDB seeding...
🧹 Clearing existing data...
✅ Existing data cleared
📁 Seeding categories...
✅ Seeded 3 categories
📦 Seeding products...
✅ Seeded 4 products
📝 Seeding blogs...
✅ Seeded 1 blog posts
⚙️ Seeding settings...
✅ Seeded 5 settings
🚚 Seeding shipping zones...
✅ Seeded 1 shipping zones
🎉 MongoDB seeding completed successfully!
```

## Database Schema

### Collections

1. **categories**: Danh mục sản phẩm
2. **products**: Sản phẩm
3. **users**: Người dùng/khách hàng
4. **orders**: Đơn hàng
5. **carts**: Giỏ hàng
6. **blogs**: Bài viết blog
7. **contacts**: Liên hệ
8. **settings**: Cài đặt hệ thống
9. **shippingzones**: Vùng giao hàng

### Indexes

Các indexes đã được tự động tạo để tối ưu performance:

- **Products**: slug, category, type, status, featured, price, text search
- **Categories**: slug, parentId, order
- **Users**: email, phone, role, status
- **Orders**: orderNumber, customerId, status, payment status
- **Blogs**: slug, status, publishedAt, text search

## Khởi Động Dự Án

### 1. Backend Server

```bash
cd backend
npm run dev
```

Kiểm tra:
- Health check: http://localhost:3000/health
- API endpoints: http://localhost:3000/api

### 2. Frontend

```bash
npm run dev
```

Kiểm tra: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Thông tin người dùng

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/:id` - Chi tiết sản phẩm
- `GET /api/products/featured` - Sản phẩm nổi bật
- `GET /api/products/search` - Tìm kiếm sản phẩm

### Categories
- `GET /api/categories` - Danh sách danh mục

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/add` - Thêm vào giỏ
- `PUT /api/cart/update` - Cập nhật giỏ hàng
- `DELETE /api/cart/remove` - Xóa khỏi giỏ

### Blogs
- `GET /api/blogs` - Danh sách blog
- `GET /api/blogs/:id` - Chi tiết blog
- `GET /api/blogs/featured` - Blog nổi bật

### Contacts
- `POST /api/contacts` - Tạo liên hệ

## Monitoring & Maintenance

### Database Monitoring

```bash
# Kết nối MongoDB shell
mongosh

# Kiểm tra databases
show dbs

# Sử dụng database
use balancoffee

# Kiểm tra collections
show collections

# Đếm documents
db.products.countDocuments()
db.categories.countDocuments()
db.users.countDocuments()

# Kiểm tra indexes
db.products.getIndexes()
```

### Backup & Restore

```bash
# Backup database
mongodump --uri="mongodb://localhost:27017/balancoffee" --out=./backup

# Restore database
mongorestore --uri="mongodb://localhost:27017/balancoffee" ./backup/balancoffee
```

### Performance Optimization

1. **Indexes**: Đã được tạo sẵn cho các truy vấn phổ biến
2. **Text Search**: Sử dụng MongoDB text search cho products và blogs
3. **Pagination**: Implement pagination cho danh sách lớn
4. **Caching**: Có thể thêm Redis cache sau này

## Migration từ Firebase

### Thay Đổi Chính

1. **Database**: Firestore → MongoDB
2. **Authentication**: Firebase Auth → Custom JWT
3. **Storage**: Firebase Storage → Local/CDN
4. **Realtime**: Firestore realtime → REST API

### Breaking Changes

1. **Document IDs**: Firestore auto IDs → Custom string IDs
2. **Nested Objects**: Firestore subcollections → Embedded documents  
3. **Queries**: Firestore queries → Mongoose queries
4. **Authentication**: Firebase tokens → JWT tokens

## Troubleshooting

### Lỗi Thường Gặp

1. **Connection Failed**:
   ```
   Error: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Giải pháp**: Kiểm tra MongoDB service đã chạy chưa

2. **Authentication Failed**:
   ```
   Error: Authentication failed
   ```
   **Giải pháp**: Kiểm tra username/password trong connection string

3. **Index Error**:
   ```
   Error: E11000 duplicate key error
   ```
   **Giải pháp**: Xóa dữ liệu cũ và seed lại

4. **Memory Issues**:
   ```
   Error: JavaScript heap out of memory
   ```
   **Giải pháp**: Tăng memory limit cho Node.js:
   ```bash
   node --max-old-space-size=4096 server.js
   ```

### Logs & Debugging

1. **Enable MongoDB logs**:
   ```javascript
   mongoose.set('debug', true);
   ```

2. **Server logs**: Kiểm tra console output
3. **MongoDB logs**: Kiểm tra MongoDB log files

## Next Steps

1. **Performance Tuning**: Monitor và tối ưu queries
2. **Caching**: Thêm Redis cache layer
3. **Backup Strategy**: Thiết lập backup tự động
4. **Monitoring**: Thêm monitoring tools (như MongoDB Compass)
5. **Security**: Implement proper authentication và authorization
6. **Scaling**: Prepare cho horizontal scaling

---

## Liên Hệ & Support

Nếu gặp vấn đề trong quá trình setup hoặc sử dụng, vui lòng:

1. Kiểm tra logs trong console
2. Xem lại cấu hình environment variables
3. Đảm bảo MongoDB service đang chạy
4. Kiểm tra network connectivity

**Database Migration hoàn tất! ✅**

MongoDB đã sẵn sàng thay thế Firebase cho Balan Coffee & Roastery.
