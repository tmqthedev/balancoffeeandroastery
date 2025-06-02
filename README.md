# Balan Coffee & Roastery

Website thương mại điện tử và blog cho cửa hàng cà phê rang mộc Balan Coffee & Roastery.

## Tính năng

### Frontend
- Giao diện người dùng bằng tiếng Việt, thiết kế responsive
- Danh sách sản phẩm cà phê có bộ lọc và tìm kiếm
- Giỏ hàng và quy trình thanh toán đầy đủ
- Blog tin tức về cà phê và sản phẩm
- Trang tài khoản người dùng để quản lý đơn hàng
- Tối ưu hóa SEO cho các công cụ tìm kiếm

### Backend
- API RESTful đầy đủ chức năng
- Xác thực người dùng với JWT và OAuth (Facebook)
- Tích hợp thanh toán với Momo và VN-Pay
- Quản lý sản phẩm, đơn hàng, và người dùng
- Tính năng blog với chức năng quản lý nội dung
- Biện pháp bảo mật: CORS, Rate Limiting, Input Validation

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
- Passport.js (Xác thực)
- JWT (JSON Web Tokens)
- Bcryptjs (Mã hóa mật khẩu)

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

