# Vercel Deployment Configuration

## Environment Variables Required

### Production Environment Variables (.env.production)
```
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
SESSION_SECRET=your_production_session_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASSWORD=your_production_app_password
CORS_ORIGIN=https://your-domain.vercel.app
BACKEND_URL=https://your-backend-api.vercel.app
```

## Deployment Steps

### 1. Frontend (React) - Main Vercel Project
1. Connect your GitHub repository to Vercel
2. Set Framework: Vite
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Install Command: `npm install`

### 2. Backend (Express API) - Separate Vercel Project
1. Create separate GitHub repository for backend
2. Connect backend repository to Vercel
3. Set Framework: Other
4. Build Command: `npm install`
5. Output Directory: (leave empty)
6. Add environment variables in Vercel dashboard

### 3. Database Setup
1. Create MongoDB Atlas cluster
2. Add connection string to MONGODB_URI
3. Whitelist Vercel IP addresses (0.0.0.0/0 for simplicity)

### 4. Domain Configuration
1. Update CORS_ORIGIN in backend to match frontend URL
2. Update API endpoints in frontend to match backend URL
3. Configure custom domains if needed

## File Structure for Deployment

### Frontend Repository (this project)
- All current files
- vercel.json (already created)
- Environment variables configured in Vercel dashboard

### Backend Repository (separate deployment)
- Copy entire /backend folder to new repository
- Add package.json at root level
- Add vercel.json for API deployment
- Configure environment variables

## Post-Deployment Checklist

- [ ] Frontend deployed successfully
- [ ] Backend API deployed successfully  
- [ ] Database connected and accessible
- [ ] Environment variables configured
- [ ] CORS properly configured
- [ ] File uploads working (if using Vercel storage)
- [ ] Email service working
- [ ] PWA functionality working
- [ ] SEO tags rendering correctly
- [ ] Analytics tracking active