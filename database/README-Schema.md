# MongoDB Complete Schema for Balan Coffee & Roastery

Đây là schema hoàn chỉnh cho database MongoDB của dự án Balan Coffee & Roastery, bao gồm tất cả collections, indexes, validation rules và dữ liệu mẫu.

## 📋 Nội dung Schema

### Collections được tạo:

1. **📂 categories** - Danh mục sản phẩm
2. **📦 products** - Sản phẩm  
3. **👥 users** - Người dùng/Khách hàng
4. **🛍️ orders** - Đơn hàng
5. **🛒 carts** - Giỏ hàng
6. **📝 blogs** - Bài viết blog
7. **📞 contacts** - Liên hệ
8. **⚙️ settings** - Cài đặt hệ thống
9. **🚚 shippingzones** - Vùng giao hàng
10. **⭐ reviews** - Đánh giá sản phẩm
11. **🎫 coupons** - Mã giảm giá

### Tính năng:

✅ **Schema Validation** - Ràng buộc dữ liệu tự động  
✅ **Indexes** - Tối ưu hiệu suất truy vấn  
✅ **Dữ liệu mẫu** - Sẵn sàng test ngay  
✅ **Hỗ trợ tiếng Việt** - Đa ngôn ngữ  
✅ **SEO-ready** - Cấu trúc tối ưu SEO  
✅ **E-commerce features** - Đầy đủ tính năng thương mại điện tử  

## 🚀 Cách sử dụng

### Option 1: Import trực tiếp bằng mongosh (Khuyến nghị)

```bash
# Windows
cd database
import-schema.bat

# Linux/macOS  
cd database
chmod +x import-schema.sh
./import-schema.sh
```

### Option 2: Import thủ công

```bash
# Kết nối mongosh
mongosh "your-mongodb-connection-string"

# Chạy script
load("mongodb-complete-schema.js")
```

### Option 3: Copy-paste vào mongosh

1. Mở mongosh: 
```bash
mongosh "mongodb+srv://balancoffeeandroastery:Balan00113355.@balancoffee.ah4nfkp.mongodb.net/?retryWrites=true&w=majority&appName=balancoffee"
```

2. Copy toàn bộ nội dung file `mongodb-complete-schema.js`

3. Paste vào mongosh và Enter

## 📊 Kết quả sau khi import

```
Database: balancoffee
Collections created:
- categories: 3 documents
- products: 4 documents  
- users: 1 documents (admin user)
- orders: 0 documents
- carts: 0 documents
- blogs: 1 documents
- contacts: 0 documents
- settings: 5 documents
- shippingzones: 1 documents
- reviews: 0 documents
- coupons: 0 documents
```

## 🔧 Kiểm tra sau khi import

### Kiểm tra kết nối:
```bash
mongosh "your-connection-string" --eval "use balancoffee; db.stats()"
```

### Kiểm tra dữ liệu:
```bash
# Xem sản phẩm
mongosh "your-connection-string" --eval "use balancoffee; db.products.find().limit(3)"

# Xem danh mục
mongosh "your-connection-string" --eval "use balancoffee; db.categories.find()"

# Xem indexes
mongosh "your-connection-string" --eval "use balancoffee; db.products.getIndexes()"
```

## 📝 Chi tiết Collections

### Categories Collection
```javascript
{
  _id: "coffee-beans",
  name: "Coffee Beans",
  nameVi: "Hạt Cà Phê", 
  slug: "hat-ca-phe",
  description: "Premium coffee beans...",
  image: "/images/categories/coffee-beans.jpg",
  order: 1,
  isActive: true,
  // ... SEO fields
}
```

### Products Collection  
```javascript
{
  _id: "arabica-cau-dat",
  name: "Arabica Cau Dat Premium",
  nameVi: "Arabica Cầu Đất Premium",
  slug: "arabica-cau-dat-premium", 
  price: 280000,
  category: "coffee-beans",
  status: "active",
  featured: true,
  inventory: {
    quantity: 100,
    lowStockAlert: 10
  },
  attributes: {
    roastLevel: "Medium",
    origin: "Cau Dat, Dalat, Vietnam",
    flavorNotes: ["Chocolate", "Citrus", "Floral"]
  }
  // ... more fields
}
```

### Users Collection
```javascript
{
  _id: "admin-001",
  email: "admin@balancoffee.com",
  role: "admin", 
  status: "active",
  firstName: "Balan",
  lastName: "Admin"
  // ... address, preferences
}
```

## 🔍 Indexes được tạo

### Products:
- `slug` (unique)
- `sku` (unique) 
- `category`, `type`, `status`, `featured`
- `price`, `viewCount`, `salesCount`
- Text search: `name`, `description`, `tags`

### Categories:
- `slug` (unique)
- `parentId`, `order`, `isActive`

### Users:
- `email` (unique)
- `phone`, `role`, `status`
- `provider` + `providerId`

### Orders:
- `orderNumber` (unique)
- `customerId`, `status`, `paymentStatus`
- `createdAt`, `totalAmount`

## 🌐 Kết nối từ ứng dụng

Cập nhật file `.env` trong backend:

```env
MONGODB_URI=mongodb+srv://balancoffeeandroastery:your-password@balancoffee.ah4nfkp.mongodb.net/balancoffee?retryWrites=true&w=majority&appName=balancoffee
```

Test kết nối:
```bash
cd backend
node mongodb-connection.js
```

## 🚦 Next Steps

1. **✅ Import schema** (file này)
2. **🔧 Test connection** từ backend
3. **📥 Seed thêm data** nếu cần: `node seed-mongodb.js`  
4. **🚀 Start backend**: `npm run dev`
5. **🌐 Start frontend**: `npm run dev`

## 🔒 Bảo mật

- Admin user mặc định: `admin@balancoffee.com` / `admin123`
- **⚠️ Đổi password ngay sau khi import!**
- Cập nhật thông tin connection string phù hợp với môi trường

## 🆘 Troubleshooting

### Lỗi authentication:
- Kiểm tra username/password trong connection string
- Verify user có tồn tại trong MongoDB Atlas
- Kiểm tra Network Access cho phép IP hiện tại

### Lỗi không tìm thấy mongosh:
```bash
# Windows
winget install MongoDB.Shell

# macOS  
brew install mongosh

# Linux
# Download từ https://www.mongodb.com/try/download/shell
```

### Lỗi schema validation:
- Kiểm tra format dữ liệu đúng với schema
- Xem log chi tiết trong mongosh

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra connection string
2. Verify MongoDB service đang chạy
3. Check logs trong mongosh
4. Đảm bảo có quyền write vào database

---

**🎉 Schema hoàn chỉnh cho Balan Coffee & Roastery MongoDB Database!**
