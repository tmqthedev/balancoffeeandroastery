# 📸 IMAGE HANDLING GUIDE FOR VERCEL DEPLOYMENT

## 🎯 Overview

Vercel configuration has been optimized to handle images properly during deployment and runtime.

## 📁 Image Structure

### Frontend Images (`/public/images/`)
```
public/
├── images/
│   ├── banners/          # Homepage banners
│   ├── logos/           # Brand logos  
│   ├── products/        # Product images
│   ├── team/           # Team member photos
│   └── users/          # User avatars
```

### Backend Images (`/backend/uploads/`)
```
backend/
├── uploads/
│   ├── products/       # Uploaded product images
│   ├── banners/       # Admin uploaded banners
│   ├── blogs/         # Blog post images
│   ├── categories/    # Category images
│   └── users/         # User uploaded avatars
```

## ⚙️ Vercel Configuration

### 1. Routing Configuration
```json
"rewrites": [
  {
    "source": "/images/(.*)",
    "destination": "/images/$1"
  },
  {
    "source": "/assets/(.*)", 
    "destination": "/assets/$1"
  }
]
```

### 2. Image Headers
```json
{
  "source": "/(.*\\.(png|jpg|jpeg|webp|avif|gif|bmp|tiff))",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    },
    {
      "key": "Content-Type",
      "value": "image/*"
    }
  ]
}
```

### 3. Cross-Origin Resource Policy
```json
{
  "source": "/images/(.*)",
  "headers": [
    {
      "key": "Cross-Origin-Resource-Policy",
      "value": "cross-origin"
    }
  ]
}
```

## 🔧 Vite Build Configuration

### Asset Optimization
- **Inline Limit**: 4KB (smaller images embedded as base64)
- **Asset Directory**: `assets/` 
- **Image Directory**: `assets/images/`
- **Cache Busting**: Hash-based filenames

### Asset File Naming
```javascript
assetFileNames: (assetInfo) => {
  const fileName = assetInfo.names?.[0] || 'asset';
  const ext = fileName.split('.').pop();
  
  if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
    return `assets/images/[name]-[hash][extname]`;
  }
  // ... other asset types
}
```

## 🚀 Image Loading Optimization

### 1. OptimizedImage Component
- Lazy loading by default
- WebP format support
- Responsive image sizing
- Error fallback handling

### 2. Image URL Resolution
```javascript
// Frontend handles multiple image URL formats:
- `/images/` → Public folder (static assets)
- `backend/uploads/` → API endpoint 
- `http://` → Full URLs
- `src/assets/` → Build-time assets
```

### 3. Performance Features
- **Lazy Loading**: Images load when entering viewport
- **Cache Headers**: 1 year cache for static images
- **Compression**: Terser optimization for image imports
- **Format Support**: JPEG, PNG, WebP, AVIF, SVG

## 📋 Deployment Checklist

### Before Deployment
- [ ] All images under 5MB (Vercel limit)
- [ ] Images in supported formats (JPEG, PNG, WebP, SVG)
- [ ] Proper image paths in code
- [ ] OptimizedImage component used consistently

### After Deployment  
- [ ] Images load correctly on production
- [ ] Lazy loading works properly
- [ ] Cache headers applied correctly
- [ ] No broken image links

## 🐛 Troubleshooting

### Common Issues
1. **404 Image Errors**: Check path format and Vercel routing
2. **Slow Loading**: Verify cache headers and optimization
3. **CORS Errors**: Ensure Cross-Origin-Resource-Policy is set
4. **Large Bundle**: Check asset inline limit and compression

### Debug Steps
1. Check Network tab for image requests
2. Verify image URLs in browser dev tools
3. Test image loading in production environment
4. Monitor Vercel function logs for errors

## 📊 Performance Targets

- **Image Load Time**: < 2s
- **Cache Hit Rate**: > 90%  
- **Bundle Size Impact**: < 20% of total
- **Lighthouse Score**: > 90 for images

---

*Configuration ready for production deployment with optimal image handling! 🎉*