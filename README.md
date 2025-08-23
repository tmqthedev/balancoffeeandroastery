# Balan Coffee & Roastery - E-commerce Platform

🌟 **Vietnamese Coffee E-commerce Website** - Nền tảng thương mại điện tử cho cà phê rang mộc Việt Nam

## ✅ Current Status (Updated)

- ✅ **SQL Server Database** - Configured for production use
- ✅ **Backend API** - Products, categories, authentication, Facebook login
- ✅ **Frontend React App** - Responsive design with Tailwind CSS
- ✅ **Facebook SDK** - Complete login integration
- ✅ **Environment Config** - Single .env file for both frontend & backend
- ✅ **Production Ready** - Full configuration for deployment
- ✅ **Payment Integration** - MoMo payment gateway configured

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
- Microsoft SQL Server (MSSQL)  
- Passport.js (Facebook OAuth)
- JWT (JSON Web Tokens)
- Bcryptjs (Mã hóa mật khẩu)
- Facebook SDK Integration

## Cài đặt

### Yêu cầu hệ thống
- Node.js v16.x trở lên
- NPM v8.x trở lên
- Microsoft SQL Server hoặc cấu hình mock database

### Cài đặt frontend
```bash
# Clone repository
git clone https://github.com/yourusername/balancoffeeandroastery.git
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
# Di chuyển đến thư mục database
cd database

# Chạy script SQL để tạo database và tables
# Kết nối với SQL Server và chạy file schema.sql
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
- Database: MSSQL Cloud hoặc máy chủ riêng

## Người đóng góp
- Đội ngũ phát triển Balan Coffee & Roastery

## Giấy phép
- Dự án này được cấp phép theo [Giấy phép ISC](LICENSE)

