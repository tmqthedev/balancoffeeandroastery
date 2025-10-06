# Balan Coffee & Roastery - E-commerce Platform

🌟 **Vietnamese Coffee E-commerce Website** - Nền tảng thương mại điện tử cho cà phê rang mộc Việt Nam

## ✅ Current Status (Updated)

- ✅ **MongoDB Database** - Configured for production use
- ✅ **Backend API** - Products, categories, authentication, orders
- ✅ **Frontend React App** - Responsive design with Tailwind CSS
- ✅ **Local Authentication** - Email/password authentication system
- ✅ **Environment Config** - Single .env file for both frontend & backend
- ✅ **Production Ready** - Full configuration for deployment
- ✅ **Payment Integration** - Contact-based payment system configured

## 🚀 Quick Start

### Environment Setup

1. **Configure Environment**
```bash
# Edit .env file with your actual credentials:
# - Facebook App ID & Secret
# - Database connection details
# - Payment gateway credentials (optional)
```

2. **Backend Server**
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

3. **Frontend Development**
```bash
npm install
npm run dev  
# Runs on http://localhost:3000
```

4. **Database**
- Microsoft SQL Server configured
- Update database credentials in .env
- Run database setup scripts if needed

## Công nghệ sử dụng

### Frontend
- React 19 với Vite
- React Router Dom 7
- Tailwind CSS
- React Helmet Async (SEO)
- Axios

### Backend
- Node.js với Express
- MongoDB với Mongoose
- Passport.js (Local Authentication)
- JWT (JSON Web Tokens)
- Bcryptjs (Mã hóa mật khẩu)
- Email Service Integration

## Cài đặt

### Yêu cầu hệ thống
- Node.js v16.x trở lên
- NPM v8.x trở lên
- MongoDB hoặc cấu hình mock database

### Cài đặt frontend
```bash
# Clone repository
git clone https://github.com/tmqthedev/balancoffeeandroastery.git
cd balancoffeeandroastery

# Cài đặt dependencies
npm install

# Khởi chạy development server
npm run dev
```

### Cài đặt backend
```bash
# Di chuyển đến thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env từ file .env.example
cp .env.example .env

# Chỉnh sửa file .env với thông tin cấu hình của bạn

# Khởi chạy development server
npm run dev
```

### Cấu hình database
```bash
# MongoDB connection string được cấu hình trong file .env
# MONGODB_URI=mongodb://localhost:27017/balancoffee
# Hoặc sử dụng MongoDB Atlas cho production
```

## Cấu trúc dự án
```
/
├── src/                      # Frontend React code
│   ├── components/           # Reusable UI components
│   ├── context/              # React context providers
│   ├── pages/                # Page components
│   ├── routes/               # Route configurations
│   └── utils/                # Utility functions
├── backend/                  # Backend API server
│   ├── config/               # Server configuration
│   ├── middleware/           # Express middleware
│   └── routes/               # API routes
├── database/                 # Database scripts
└── public/                   # Static assets
```

## Triển khai
- Frontend: Vite build, Netlify, Vercel, hoặc hosting tương tự
- Backend: Node.js hosting như Heroku, Railway, hoặc VPS
- Database: MongoDB Atlas hoặc máy chủ MongoDB riêng

## Người đóng góp
- Đội ngũ phát triển Balan Coffee & Roastery

## Giấy phép
- Dự án này được cấp phép theo [Giấy phép ISC](LICENSE)

