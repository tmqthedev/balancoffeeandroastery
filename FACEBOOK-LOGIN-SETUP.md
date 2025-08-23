# Hướng dẫn thiết lập Facebook Login

## ✅ Đã hoàn thành setup

Facebook SDK và login đã được cài đặt sẵn với các features:

- ✅ Facebook SDK initialization tự động
- ✅ React hook (`useFacebook`) để sử dụng trong components  
- ✅ Facebook Service với đầy đủ methods
- ✅ Login/Register form đã tích hợp Facebook login
- ✅ Environment variables setup
- ✅ Error handling và loading states
- ✅ Vietnamese locale support

## 🚀 Bước thiết lập nhanh

### 1. Lấy Facebook App ID

1. Truy cập [Facebook Developer Console](https://developers.facebook.com)
2. Tạo app mới hoặc sử dụng app hiện có
3. Copy **App ID** từ Settings → Basic

### 2. Cấu hình Environment

Mở file `.env` (đã có sẵn) và cập nhật:

```bash
# ===========================================
# FRONTEND CONFIGURATION - Cập nhật phần này
# ===========================================

# Thay thế bằng App ID thực tế từ Facebook Developer Console
VITE_FACEBOOK_APP_ID=your_actual_facebook_app_id_here

# API Base URL (giữ nguyên cho development)
VITE_API_URL=http://localhost:5000/api

# ===========================================
# BACKEND CONFIGURATION - Cập nhật nếu cần
# ===========================================

# Facebook OAuth (cập nhật với thông tin thực tế)
FACEBOOK_APP_ID=your_actual_facebook_app_id_here
FACEBOOK_APP_SECRET=your_actual_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Database (cập nhật với thông tin database thực tế)
DB_HOST=localhost
DB_NAME=balancoffee_db
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# JWT Secret (đổi thành secret key mạnh)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Lưu ý**: File `.env` chứa cấu hình cho cả frontend và backend.

### 3. Cấu hình Facebook App

Trong Facebook Developer Console:

1. **Add Product** → **Facebook Login** 
2. **Settings** → **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/auth/facebook/callback
   ```
3. **App Domains**: `localhost` (cho development)

### 4. Test

1. Restart development server:
   ```bash
   npm run dev
   ```

2. Đi tới `/auth` và click "Tiếp tục với Facebook"

3. Hoàn thành quy trình đăng nhập

## 📖 Sử dụng trong code

### React Hook:

```jsx
import { useFacebook } from '../hooks/useFacebook';

const MyComponent = () => {
  const { isLoggedIn, user, login, logout, loading, error } = useFacebook();

  const handleLogin = async () => {
    try {
      await login(['email', 'public_profile']);
      console.log('Đăng nhập thành công!');
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        <button onClick={handleLogin} disabled={loading}>
          Đăng nhập với Facebook
        </button>
      ) : (
        <div>
          <p>Chào {user?.name}!</p>
          <button onClick={logout}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
};
```

### Direct Service Usage:

```jsx
import facebookService from '../services/facebookService';

// Login
const response = await facebookService.login(['email', 'public_profile']);

// Get user profile  
const profile = await facebookService.getUserProfile();

// Share content
await facebookService.share({
  href: 'https://example.com/product/123'
});
```

## 🔧 Files đã được tạo/cập nhật:

- ✅ `src/facebook-sdk.js` - SDK initialization
- ✅ `src/services/facebookService.js` - Facebook API service
- ✅ `src/hooks/useFacebook.js` - React hook
- ✅ `src/pages/auth/Auth.jsx` - Login/Register với Facebook
- ✅ `src/pages/auth/FacebookCallback.jsx` - Xử lý callback
- ✅ `.env.local` - Environment variables
- ✅ `index.html` - Updated meta tags

## 🚨 Lưu ý quan trọng:

1. **App ID bắt buộc**: Phải có Facebook App ID hợp lệ
2. **Redirect URI**: Phải match chính xác trong Facebook app settings
3. **HTTPS**: Production cần HTTPS để Facebook login hoạt động
4. **Permissions**: `email` và `public_profile` được approve tự động

## 🐛 Troubleshooting:

### Lỗi "SDK failed to load":
- Kiểm tra `VITE_FACEBOOK_APP_ID` trong `.env.local`
- Đảm bảo App ID không phải placeholder

### Lỗi "Invalid OAuth redirect URI":
- Thêm exact URL vào Facebook app settings
- Development: `http://localhost:5000/api/auth/facebook/callback`

### Lỗi "App not set up":
- Đảm bảo Facebook Login product đã được thêm vào app
- Kiểm tra app domains trong Facebook settings

## 📞 Support:

Nếu gặp vấn đề:
1. Kiểm tra browser console để xem error messages
2. Verify Facebook App ID và settings
3. Đảm bảo backend API endpoint `/api/auth/facebook/callback` hoạt động

---

## ⚡ Quick Start Checklist:

- [ ] Tạo Facebook App tại developers.facebook.com
- [ ] Copy App ID và paste vào `.env` (thay thế `your_actual_facebook_app_id_here`)
- [ ] Cập nhật database credentials trong `.env` nếu cần
- [ ] Thêm OAuth redirect URI trong Facebook app settings
- [ ] Restart dev server
- [ ] Test Facebook login

🎉 **Done!** Facebook login should work after completing these steps.
