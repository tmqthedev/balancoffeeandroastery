# 📁 Project Structure - Balan Coffee & Roastery

## 🎯 Environment Files Overview

Bạn đúng! Có nhiều file `.env.example` trong project. Đây là cấu trúc và mục đích của từng file:

### 📋 Environment Files Structure:

```
balancoffeeandroastery/
├── .env.example              # ✅ Frontend environment template
├── .env                      # ❗ Frontend environment (create from .env.example)
├── backend/
│   ├── .env.example         # ✅ Backend environment template  
│   └── .env                 # ❗ Backend environment (create from .env.example)
```

### 🔧 Why Multiple .env Files?

1. **Frontend (.env)**: 
   - Contains `VITE_*` variables for React
   - Firebase frontend configuration
   - API URLs and CDN settings

2. **Backend (backend/.env)**:
   - Contains server-side secrets
   - Firebase Admin SDK credentials
   - Database and payment gateway settings

## 🚀 Quick Setup

Run the automated setup script:

```bash
npm run setup
```

This will:
- ✅ Copy `.env.example` → `.env`
- ✅ Copy `backend/.env.example` → `backend/.env`
- ✅ Create upload directories
- ✅ Add .gitkeep files
- ✅ Validate project structure

## 📂 Complete Project Structure

```
balancoffeeandroastery/
├── 📄 README.md
├── 📄 FIREBASE-DEPLOYMENT.md      # Firebase setup guide
├── 📄 FIREBASE-FREE-SUMMARY.md    # Free tier summary
├── 📄 ENV-SETUP.md                # Environment setup guide
├── 📄 setup.js                    # Automated setup script
├── 📄 .env.example                # Frontend env template
├── 📄 .env                        # Frontend env (created by setup)
├── 📄 .gitignore                  # Git ignore rules
├── 📄 package.json                # Frontend dependencies
├── 📁 src/                        # React source code
│   ├── 📁 config/
│   │   └── firebase.js            # Firebase frontend config
│   ├── 📁 services/
│   │   ├── authService.js         # Authentication service
│   │   ├── productService.js      # Products service
│   │   ├── orderService.js        # Orders service
│   │   └── imageService.js        # Image upload service
│   └── 📁 components/             # React components
├── 📁 backend/                    # Express.js backend
│   ├── 📄 .env.example           # Backend env template
│   ├── 📄 .env                   # Backend env (created by setup)
│   ├── 📄 package.json           # Backend dependencies
│   ├── 📄 server.js              # Main server file
│   ├── 📁 config/
│   │   └── firebase.js           # Firebase Admin config
│   ├── 📁 services/
│   │   └── imageService.js       # Local image management
│   ├── 📁 routes/
│   │   ├── products-firebase.js  # Product routes (Firebase)
│   │   └── upload.js             # Image upload routes
│   ├── 📁 scripts/
│   │   ├── migrate-to-firebase.js # SQL → Firebase migration
│   │   └── setup-firebase-data.js # Sample data setup
│   └── 📁 uploads/               # Local file storage
│       ├── 📁 products/          # Product images
│       ├── 📁 blogs/             # Blog images
│       ├── 📁 avatars/           # User avatars
│       └── 📁 thumbnails/        # Auto-generated thumbnails
└── 📁 database/
    └── firestore-schema.js       # Database schema definition
```

## 🔒 Security & Best Practices

### ✅ Safe to commit:
- `.env.example` files (templates without real credentials)
- `.gitkeep` files
- Documentation files

### ❌ Never commit:
- `.env` files (contain real credentials)
- `backend/.env` files
- `uploads/` folder contents
- Service account JSON files

### 🛡️ Environment Security:
- Frontend `.env` can be public (prefixed with `VITE_`)
- Backend `.env` contains secrets (never expose to frontend)
- Use strong JWT secrets in production
- Restrict Firebase API keys by domain

## 📋 Setup Checklist

- [ ] Run `npm run setup` to create environment files
- [ ] Create Firebase project
- [ ] Copy Firebase credentials to `.env` files
- [ ] Install dependencies: `npm install && cd backend && npm install`
- [ ] Setup sample data: `cd backend && npm run firebase:setup`
- [ ] Start development servers

## 🎯 Development Workflow

1. **Setup**: `npm run setup`
2. **Install**: `npm install && cd backend && npm install`
3. **Configure**: Edit `.env` files with your credentials
4. **Develop**: `npm run dev` (frontend) + `cd backend && npm run dev` (backend)
5. **Deploy**: Follow FIREBASE-DEPLOYMENT.md guide

This structure ensures clean separation between frontend/backend environments while maintaining security best practices! 🔒
