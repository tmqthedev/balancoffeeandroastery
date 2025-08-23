# Environment Variables Setup Guide

## 📁 File Structure

```
balancoffeeandroastery/
├── .env                      # Single environment file for both frontend & backend
└── backend/                  
    └── (uses root .env file)
```

## 🔧 Setup Instructions

### Single Environment File (.env)
The project now uses a single `.env` file in the root directory that contains configuration for both frontend and backend.

```bash
# The .env file is already created with default values
# Edit .env with your actual credentials and configuration
```

## 🔑 Required Environment Variables

### Frontend Configuration (VITE_*):
- `VITE_FACEBOOK_APP_ID` - Facebook App ID for login
- `VITE_API_URL` - Backend API URL  
- `VITE_APP_NAME` - Application name
- `VITE_GOOGLE_ANALYTICS_ID` - Google Analytics tracking ID
- `VITE_FACEBOOK_PIXEL_ID` - Facebook Pixel ID
- `VITE_TIKTOK_PIXEL_ID` - TikTok Pixel ID

### Backend Configuration:
- `PORT` - Server port (default: 5000)
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database connection
- `JWT_SECRET` - Secret for JWT tokens
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` - Facebook OAuth
- `MOMO_*` - MoMo payment gateway credentials
- `VNPAY_*` - VNPay payment gateway credentials
- `EMAIL_*` - Email service configuration

## 🎯 Quick Setup

### Development:
```bash
# 1. Edit the existing .env file with your credentials
# 2. Replace placeholder values with actual data:
#    - Facebook App ID & Secret
#    - Database credentials  
#    - Payment gateway credentials (if needed)
#    - Email service credentials (if needed)

# 3. Start development servers
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

# Or copy .env file to production server (not recommended for security)
```

## 🔒 Security Notes

- **Never commit .env files** to git (already in .gitignore)
- **Use strong JWT secrets** in production (change default values)
- **Restrict Facebook App** by domain in production
- **Use production payment gateway endpoints** for live transactions

## 📋 Environment Checklist

### Before deployment, ensure:
- [ ] `VITE_FACEBOOK_APP_ID` is set to actual Facebook App ID
- [ ] Database credentials are correct
- [ ] `JWT_SECRET` is changed from default value
- [ ] Payment gateway credentials are configured (if using payments)
- [ ] Email service is configured (if using email features)
- [ ] Production URLs are set for production deployment

## 🚀 Environment-Specific Configs

### Development:
- Use test/sandbox payment gateways
- Local database
- `NODE_ENV=development`
- Debug logging enabled

### Production:
- Production payment gateways
- Production database
- `NODE_ENV=production` 
- Minimal logging
- Strong security settings

## 📝 Key Changes

- ✅ **Simplified structure**: Single `.env` file for both frontend & backend
- ✅ **Pre-configured**: File already exists with all necessary variables
- ✅ **Comprehensive**: Includes all service configurations
- ✅ **Production ready**: Contains production override examples
- ❌ **Removed**: `.env.example` files (no longer needed)
