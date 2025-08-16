# Firebase Setup Guide 🔥

## Hoàn thành cấu hình Firebase cho Balan Coffee & Roastery

### ✅ Đã cấu hình:
- ✅ Frontend Firebase config với credentials thực tế
- ✅ Backend environment variables
- ✅ Project ID: `balancoffeeandroastery`
- ✅ Tất cả API keys và endpoints

### 🔧 Bước tiếp theo - Tạo Service Account:

1. **Vào Firebase Console:**
   - Truy cập: https://console.firebase.google.com/project/balancoffeeandroastery
   - Đăng nhập với Google account của bạn

2. **Tạo Service Account:**
   ```
   Project Settings ⚙️ → Service Accounts tab → Generate new private key
   ```

3. **Tải file JSON:**
   - Click "Generate new private key"
   - Tải file JSON về máy
   - Đổi tên thành: `firebase-service-account.json`
   - Copy vào thư mục: `backend/config/`

4. **Cấu trúc thư mục:**
   ```
   backend/
   ├── config/
   │   ├── firebase.js ✅
   │   └── firebase-service-account.json ← Thêm file này
   └── .env ✅
   ```

### 🚀 Khởi chạy hệ thống:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
npm install
npm run dev
```

### 📋 Checklist cuối cùng:

- ✅ Frontend `.env` với credentials thực tế
- ✅ Backend `.env` với Firebase config
- ⏳ Tạo `firebase-service-account.json`
- ⏳ Test kết nối Firebase
- ⏳ Migrate dữ liệu mẫu

### 🔒 Security Notes:

- ✅ File `.env` đã được gitignore
- ✅ Service account JSON sẽ được gitignore
- ✅ Sử dụng Firebase Spark Plan (miễn phí)
- ✅ Không sử dụng Firebase Storage (tránh phí)

### 📊 Firebase Quotas (Free Tier):

- **Firestore:** 1GB storage, 50K reads/day, 20K writes/day
- **Authentication:** Unlimited users
- **Analytics:** Unlimited events
- **Functions:** 125K invocations/month

### 🆘 Troubleshooting:

Nếu gặp lỗi "Service account key not found":
```bash
# Kiểm tra file tồn tại
ls backend/config/firebase-service-account.json

# Nếu chưa có, tạo từ Firebase Console
```

---
**Ready to launch! 🚀 Chỉ cần thêm service account key là xong!**
