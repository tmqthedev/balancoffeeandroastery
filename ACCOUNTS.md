# Tài Khoản Mặc Định - Balan Coffee E-commerce

## Tài Khoản Admin
- **Email**: admin@balancoffee.com
- **Password**: password123
- **Role**: admin
- **Quyền**: Quản lý toàn bộ hệ thống

## Tài Khoản Customer
- **Email**: user@example.com  
- **Password**: password123
- **Role**: customer
- **Quyền**: Mua hàng và quản lý tài khoản cá nhân

## Cách Sử Dụng

### Đăng Nhập Admin
1. Truy cập: `http://localhost:5173/login`
2. Nhập email: `admin@balancoffee.com`
3. Nhập password: `password123`
4. Sau khi đăng nhập, sẽ được chuyển hướng đến admin dashboard

### Đăng Nhập Customer
1. Truy cập: `http://localhost:5173/login`
2. Nhập email: `user@example.com`
3. Nhập password: `password123`
4. Sau khi đăng nhập, sẽ được chuyển hướng đến trang chủ

### Đăng Ký Tài Khoản Mới
1. Truy cập: `http://localhost:5173/register`
2. Điền thông tin cần thiết
3. Tích chọn "Tôi đồng ý với Terms & Conditions"
4. Nhấn "Đăng ký"

## Cấu Hình Database 🔥

### Firebase Firestore (Hiện tại - ACTIVE)
- **Type**: Cloud NoSQL Database (Free Tier)
- **Project**: balancoffeeandroastery  
- **Collections**: users, products, orders, categories, etc.
- **Features**: Real-time updates, offline support, auto-scaling
- **Cost**: FREE up to 1GB storage, 50K reads/day, 20K writes/day
- **Status**: ✅ **CONNECTED & WORKING**

### Environment Setup
```env
# Frontend (.env)
VITE_FIREBASE_API_KEY=AIzaSyAt8-MxL3Vix8ioizBoEiwqRJ0hG5siJEE
VITE_FIREBASE_PROJECT_ID=balancoffeeandroastery

# Backend (backend/.env)  
FIREBASE_PROJECT_ID=balancoffeeandroastery
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
```

## Key Benefits
- ✅ **Zero Cost**: Complete free tier usage
- ✅ **Real-time**: Live data synchronization  
- ✅ **Scalable**: Auto-scaling based on usage
- ✅ **Secure**: Built-in authentication & rules
- ✅ **Global**: CDN and multi-region support

## Lưu Ý
- **Firebase Firestore đang được sử dụng** - tất cả dữ liệu real-time và persistent
- Không sử dụng Firebase Storage để tránh chi phí - images lưu local
- Toàn bộ mock database đã được loại bỏ khỏi hệ thống
- Tất cả tài khoản mặc định đều có password: `password123`
- Để chuyển về mock database (nếu cần), đổi `USE_MOCK_DB=true` trong `backend/.env`
- ✅ **System Status**: Azure SQL Database connection ACTIVE & STABLE
