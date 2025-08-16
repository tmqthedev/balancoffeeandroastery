# Environment Variables Setup Guide

## 📁 File Structure

```
balancoffeeandroastery/
├── .env.example              # Frontend environment variables
├── .env                      # Frontend environment (create from .env.example)
├── backend/
│   ├── .env.example         # Backend environment variables  
│   └── .env                 # Backend environment (create from .env.example)
```

## 🔧 Setup Instructions

### 1. Frontend Environment (.env)
```bash
# Copy example file
cp .env.example .env

# Edit .env with your Firebase credentials
```

### 2. Backend Environment (backend/.env)
```bash
# Copy example file
cp backend/.env.example backend/.env

# Edit backend/.env with your Firebase and other credentials
```

## 🔑 Required Environment Variables

### Frontend (.env):
- `VITE_FIREBASE_*` - Firebase project credentials
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_IMAGES_BASE_URL` - CDN/Images URL

### Backend (backend/.env):
- `FIREBASE_*` - Firebase Admin SDK credentials
- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret for JWT tokens
- `UPLOAD_DIR` - Local upload directory
- `*_PARTNER_CODE` - Payment gateway credentials
- `FACEBOOK_APP_*` - Facebook OAuth credentials

## 🎯 Quick Setup

### Development:
```bash
# 1. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Get Firebase credentials from Firebase Console
# 3. Update both .env files with your credentials
# 4. Start development servers
npm run dev                    # Frontend
cd backend && npm run dev      # Backend
```

### Production:
```bash
# Set environment variables in your hosting platform:
# - Vercel: Add to project settings
# - Netlify: Add to site settings  
# - Railway: Add to service variables
# - Heroku: Use heroku config:set
```

## 🔒 Security Notes

- **Never commit .env files** to git
- **Use strong JWT secrets** in production
- **Restrict Firebase API keys** by domain
- **Use environment-specific** payment gateway endpoints

## 📋 Environment Checklist

### Before deployment, ensure:
- [ ] All required variables are set
- [ ] Firebase project is configured
- [ ] Payment gateways are set to production URLs
- [ ] CORS origins are configured correctly
- [ ] JWT secrets are strong and unique
- [ ] File upload directories exist

## 🚀 Environment-Specific Configs

### Development:
- Use test payment gateways
- Local image storage
- Relaxed CORS settings
- Debug logging enabled

### Production:
- Production payment gateways
- CDN for images
- Strict CORS settings
- Minimal logging
- Strong security headers
