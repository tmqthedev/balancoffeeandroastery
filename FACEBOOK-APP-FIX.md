# Khắc Phục Lỗi Facebook Login: "Ứng dụng này không hoạt động"

## 🚨 Lỗi Hiện Tại
- **Thông báo**: "Có vẻ như ứng dụng này không hoạt động"
- **Chi tiết**: "Ứng dụng này cần ít nhất một supported permission"
- **Nguyên nhân**: Facebook App chưa được cấu hình đúng

## 🔧 Các Bước Khắc Phục

### 1. Truy cập Facebook Developer Console
🔗 **Link**: [https://developers.facebook.com/apps/649133454778917](https://developers.facebook.com/apps/649133454778917)

### 2. Kiểm tra App Status
**Navigation**: Dashboard → App Review → Status
- ✅ **Đảm bảo**: App Status = "Live" hoặc "In Development"
- ❌ **Nếu bị tắt**: Click "Switch to Live" hoặc "Make Public"

### 3. Cấu hình Basic Permissions
**Navigation**: App Review → Permissions and Features

**Cần thêm các quyền cơ bản**:
- ✅ `email` - Lấy email người dùng
- ✅ `public_profile` - Lấy thông tin profile cơ bản

**Cách thêm**:
1. Tìm `email` trong danh sách permissions
2. Click "Add to submission" hoặc "Request"
3. Làm tương tự với `public_profile`

### 4. Cập nhật App Domains
**Navigation**: Settings → Basic

**App Domains** - Thêm:
```
localhost
```

**Site URL** - Cập nhật:
```
https://localhost:5173
```

### 5. Cấu hình Facebook Login Product
**Navigation**: Products → Facebook Login → Settings

**Valid OAuth Redirect URIs**:
```
https://localhost:5173
https://localhost:5173/auth
https://localhost:5173/auth/facebook/callback
https://localhost:5000/api/auth/facebook/callback
```

**Client OAuth Settings**:
- ✅ Use Strict Mode for Redirect URIs: `Yes`
- ✅ Valid Client OAuth Login: `Yes`
- ✅ Valid Web OAuth Login: `Yes`

### 6. Kiểm tra Privacy Policy & Terms
**Navigation**: Settings → Basic

**Bắt buộc có**:
- ✅ Privacy Policy URL: `https://localhost:5173/privacy`
- ✅ Terms of Service URL: `https://localhost:5173/terms`

**Tạm thời có thể dùng**:
- Privacy Policy: `https://example.com/privacy`
- Terms of Service: `https://example.com/terms`

### 7. Test App Permissions
**Navigation**: Tools → Graph API Explorer

**Test bằng cách**:
1. Click "Get User Access Token"
2. Chọn permissions: `email`, `public_profile`
3. Generate token
4. Test API call: `GET /me?fields=id,name,email`

## 🔍 Kiểm tra Cấu hình Hiện Tại

### Backend (.env)
```env
FACEBOOK_APP_ID=649133454778917
FACEBOOK_APP_SECRET=58aec0ba2f35e1afd433ef70623e7b45
FACEBOOK_CALLBACK_URL=https://localhost:5000/api/auth/facebook/callback
```

### Frontend (.env.local)
```env
VITE_FACEBOOK_APP_ID=649133454778917
```

### HTML SDK Init
```html
<script>
window.fbAsyncInit = function() {
  FB.init({
    appId      : '649133454778917',
    cookie     : true,
    xfbml      : true,
    version    : 'v19.0'
  });
};
</script>
```

## 🚀 Các Bước Test

### 1. Khởi động lại servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
npm run dev
```

### 2. Truy cập ứng dụng
- URL: `https://localhost:5173`
- Chấp nhận certificate warning

### 3. Test Facebook Login
1. Click vào nút "Đăng nhập với Facebook"
2. Popup Facebook login sẽ xuất hiện
3. Không còn thông báo lỗi "ứng dụng không hoạt động"

## 📞 Nếu Vẫn Lỗi

### Option 1: Tạo Facebook App Mới
1. Tạo app mới tại [developers.facebook.com](https://developers.facebook.com)
2. Chọn "Consumer" type
3. Thêm "Facebook Login" product
4. Cấu hình permissions và domains

### Option 2: Contact Facebook Support
- Facebook Business Help Center
- Developer Support trong Facebook Console

## ✅ Checklist Hoàn Thành

- [ ] App Status = Live/Active
- [ ] email permission được approved
- [ ] public_profile permission được approved  
- [ ] App Domains chứa "localhost"
- [ ] OAuth Redirect URIs có HTTPS URLs
- [ ] Privacy Policy & Terms được set
- [ ] SDK được init trong HTML
- [ ] Test login không còn lỗi

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành các bước trên:
- ✅ Facebook login popup xuất hiện bình thường
- ✅ Không còn thông báo "ứng dụng không hoạt động"
- ✅ User có thể login và authorize app
- ✅ App nhận được user profile data

---

**Lưu ý**: Một số thay đổi Facebook App có thể mất 5-10 phút để có hiệu lực.
