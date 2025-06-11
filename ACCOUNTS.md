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
1. Truy cập: `http://localhost:3000/login`
2. Nhập email: `admin@balancoffee.com`
3. Nhập password: `password123`
4. Sau khi đăng nhập, sẽ được chuyển hướng đến admin dashboard

### Đăng Nhập Customer
1. Truy cập: `http://localhost:3000/login`
2. Nhập email: `user@example.com`
3. Nhập password: `password123`
4. Sau khi đăng nhập, sẽ được chuyển hướng đến trang chủ

### Đăng Ký Tài Khoản Mới
1. Truy cập: `http://localhost:3000/register`
2. Điền thông tin cần thiết
3. Tích chọn "Tôi đồng ý với Terms & Conditions"
4. Nhấn "Đăng ký"

## Cấu Hình Database

### Azure SQL Database (Hiện tại - ACTIVE)
- File cấu hình: `backend/.env`
- Setting: `USE_MOCK_DB=false`
- Connection: Azure SQL Database (balancoffee.database.windows.net)
- Status: ✅ **CONNECTED & WORKING**

### Mock Database (Backup)
- File cấu hình: `backend/.env`
- Setting: `USE_MOCK_DB=true`
- Data file: `backend/config/mock-database.js`
- Status: 💤 **DISABLED** (chỉ dùng khi Azure SQL không khả dụng)

## Lưu Ý
- **Azure SQL Database đang được sử dụng** - tất cả dữ liệu được lưu trữ persistent
- Mock database chỉ được dùng backup khi Azure SQL Database không khả dụng
- Tất cả tài khoản mặc định đều có password: `password123`
- Để chuyển về mock database (nếu cần), đổi `USE_MOCK_DB=true` trong `backend/.env`
- ✅ **System Status**: Azure SQL Database connection ACTIVE & STABLE
