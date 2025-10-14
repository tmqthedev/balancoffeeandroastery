## 🔍 Troubleshooting: "Bạn không có quyền truy cập trang này"

### Nguyên nhân có thể:

#### 1. **Token đã hết hạn**
- Token có thời hạn 7 ngày (JWT_EXPIRES_IN=7d)
- Giải pháp: Đăng xuất và đăng nhập lại

#### 2. **Token không được gửi đúng**
- Kiểm tra: Mở DevTools → Network → Click vào request `/api/orders`
- Xem header `Authorization: Bearer <token>`
- Nếu thiếu → Vấn đề ở frontend

#### 3. **JWT_SECRET không khớp**
- Backend đang dùng: `MstCyq6YU7Wh1zIApe02KnLg3id4TlaDZvxF9oVJkRjP5HbmOfGQwuc8XNESBr`
- Nếu bạn đã thay đổi JWT_SECRET sau khi tạo token → Token cũ không hợp lệ
- Giải pháp: Đăng nhập lại

#### 4. **User không tồn tại trong database**
- Token có userId nhưng user đã bị xóa
- Giải pháp: Đăng nhập lại

### 🛠️ Cách debug:

#### Bước 1: Kiểm tra token trong browser
```javascript
// Paste vào Console (F12) khi ở trang Orders
const token = localStorage.getItem('authToken');
console.log('Token:', token);

// Decode token
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  console.log('Payload:', payload);
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Is expired:', Date.now() > payload.exp * 1000);
}
```

#### Bước 2: Kiểm tra backend logs
```bash
cd backend
npm run dev
```

Sau đó truy cập trang Orders và xem logs:
- `🔐 Authenticating token...` - Token đã được nhận
- `✅ Token verified, user: xxx` - Token hợp lệ
- `❌ Token verification failed: xxx` - Token không hợp lệ

#### Bước 3: Test API trực tiếp
```javascript
// Paste vào Console
fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### ✅ Giải pháp nhanh:

**Thử ngay:**
1. Đăng xuất (click button Đăng xuất)
2. Đăng nhập lại với tài khoản của bạn
3. Truy cập lại trang Orders

**Nếu vẫn lỗi:**
1. Mở Console (F12)
2. Chạy script debug token ở trên
3. Chụp màn hình kết quả và gửi cho tôi

### 📝 Code đã sửa:

File: `backend/routes/orders.js`
- ✅ Đã thêm logging chi tiết vào middleware `authenticateToken`
- ✅ Bây giờ sẽ hiển thị lý do token bị reject

**Restart backend để thấy logs mới:**
```bash
cd backend
npm run dev
```
