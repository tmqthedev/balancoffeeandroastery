# 🚀 MONOREPO DEPLOYMENT SETUP COMPLETE!

## ✅ **ĐÃ HOÀN THÀNH:**

### 1. **Vercel Configuration**
- ✅ Tạo `vercel.json` ở root project
- ✅ Cấu hình route `/api/*` → backend server
- ✅ Cấu hình build cho cả frontend và backend

### 2. **Backend Updates**
- ✅ Cập nhật `backend/server.js` để support Vercel serverless
- ✅ Export Express app cho Vercel
- ✅ Conditional server start (local vs production)

### 3. **API Configuration**
- ✅ Cập nhật `src/config/api.js` 
- ✅ Production sử dụng relative paths (`/api/...`)
- ✅ Development vẫn dùng `http://localhost:5000`

## 🔧 **ENVIRONMENT VARIABLES CẦN THIẾT**

### Vào Vercel Dashboard → Project Settings → Environment Variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/balancoffee?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters

# CORS Configuration  
CORS_ORIGIN=https://balancoffeeandroastery.vercel.app

# Node Environment
NODE_ENV=production
```

## 📋 **DEPLOYMENT STEPS**

### 1. **Commit và Push Changes**
```bash
git add .
git commit -m "Setup monorepo deployment with Vercel"
git push origin main
```

### 2. **Vercel sẽ auto-deploy**, kết quả:
- ✅ **Frontend**: `https://balancoffeeandroastery.vercel.app`
- ✅ **Backend API**: `https://balancoffeeandroastery.vercel.app/api/*`
- ✅ **Health Check**: `https://balancoffeeandroastery.vercel.app/health`

### 3. **Test Endpoints sau khi deploy:**
```bash
# Health check
curl https://balancoffeeandroastery.vercel.app/health

# Products API
curl https://balancoffeeandroastery.vercel.app/api/products

# Auth API
curl https://balancoffeeandroastery.vercel.app/api/auth/me
```

## 🎯 **ARCHITECTURE**

```
Frontend (React + Vite) + Backend (Express + MongoDB)
                    ↓
            Vercel Monorepo Deploy
                    ↓
┌─────────────────────────────────────────┐
│  https://balancoffeeandroastery.vercel.app  │
├─────────────────────────────────────────┤
│  / → React Frontend (Static Files)     │
│  /api/* → Express Backend (Serverless) │
│  /health → Backend Health Check        │
└─────────────────────────────────────────┘
```

## 🚨 **QUAN TRỌNG**

1. **Cần setup MongoDB Atlas** theo `MONGODB_PRODUCTION_GUIDE.md`
2. **Cần add environment variables** vào Vercel dashboard
3. **CORS_ORIGIN** phải match với domain Vercel chính xác

## 🎉 **KẾT QUẢ MONG ĐỢI**

Sau deployment:
- ✅ Frontend hoạt động bình thường
- ✅ API calls từ frontend → `/api/*` routes 
- ✅ MongoDB connection thành công
- ✅ Authentication và cart merge hoạt động
- ✅ Tất cả features hoạt động như local

---

**Bước tiếp theo: Commit, push và setup MongoDB Atlas! 🚀**