*** Begin Updated README
# Balan Coffee & Roastery — Frontend + Backend

Bộ mã nguồn cho website thương mại điện tử cà phê (frontend React + backend Express + MongoDB).

**Nội dung README:** Quick Start, Biến môi trường, Deploy, Trạng thái hiện tại, Thông tin API & Upload.

**Yêu cầu môi trường**
- Node.js 18+ (hoặc LTS tương thích)
- npm hoặc yarn
- MongoDB Atlas hoặc instance MongoDB (URI)

**Cấu trúc chính**
- Frontend: Vite + React — mã ở `src/`
- Backend: Express API — mã ở `backend/`
- Public assets: `public/`
- Cấu hình Vercel: `vercel.json`

**Quick Start (phát triển local)**

1) Clone repo và cài deps
```bash
git clone https://github.com/tmqthedev/balancoffeeandroastery.git
cd balancoffeeandroastery
npm install
cd backend
npm install
cd ..
```

2) Tạo file môi trường
- Sao chép và chỉnh sửa các file mẫu:
```bash
cp .env.example .env.local    # frontend env (nếu cần)
cp backend/.env.example backend/.env
```
- Thiết lập `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CORS_ORIGIN`, v.v. theo `backend/.env.example`.

3) Chạy backend (phát triển)
```bash
cd backend
npm run dev
# server mặc định lắng nghe PORT (ví dụ 5000)
```

4) Chạy frontend (phát triển)
```bash
# ở root repo
npm run dev
# Vite dev server mặc định: http://localhost:5173
```

5) Kiểm tra
- Health: `http://localhost:5000/health`
- API gốc: `http://localhost:5000/`
- Frontend: `http://localhost:5173`

**Các script quan trọng**
- Frontend (root `package.json`): `dev`, `build`, `preview`, `lint`, `lint:fix`.
- Backend (`backend/package.json`): `start`, `dev`, `seed`, `setup-production`.

**Biến môi trường quan trọng (tóm tắt)**
- `MONGODB_URI` — MongoDB connection string (Atlas hoặc local)
- `PORT` — cổng backend
- `JWT_SECRET` — secret cho JWT (bắt buộc trong production)
- `JWT_EXPIRES_IN` — thời hạn token
- `SESSION_SECRET` — secret session nếu dùng
- `FRONTEND_URL` / `CORS_ORIGIN` — domain frontend cho CORS
- `UPLOAD_PATH`, `MAX_FILE_SIZE` — cấu hình upload

Tham khảo mẫu: [backend/.env.example](backend/.env.example) và [.env.example](.env.example).

**Deployment (Vercel)**
- Tệp cấu hình: [vercel.json](vercel.json) — frontend build static (`dist`), `backend/server.js` deploy qua serverless function.
- Trên Vercel: thêm các biến môi trường từ `backend/.env.vercel.example`.
- Lưu ý production:
	- Không để `MONGODB_URI` hay `JWT_SECRET` trong code.
	- Cập nhật `CORS_ORIGIN` với URL frontend production.
	- Kiểm tra quyền truy cập file uploads; Vercel serverless có hạn chế filesystem — cân nhắc lưu trữ file trên S3/Cloud Storage nếu cần.

**API chính (tổng quan nhanh)**
- `/api/auth` — đăng ký, đăng nhập, lấy user hiện tại, reset/verify email, reset password.
- `/api/users` — profile, addresses, orders, cart endpoints.
- `/api/products` — list, chi tiết, quản trị (tạo/cập nhật/xóa).
- `/api/categories`, `/api/blogs`, `/api/cart`, `/api/orders`, `/api/payments`, `/api/contacts`, `/api/upload`.

**Upload & Images**
- File upload xử lý bởi `backend/services/imageService.js` — lưu tạm vào `backend/uploads/*` và tạo ảnh tối ưu đặt vào `public/images/*` (thumbnail, small, medium, large).
- Endpoints upload: `POST /api/upload/products`, `/api/upload/blogs`, `/api/upload/avatar`; xóa: `DELETE /api/upload/:category/:filename`.

**Bảo mật & kiểm soát**
- `helmet`, `express-rate-limit`, `express-validator` đã được cấu hình.
- Xác thực: Passport local + JWT (`backend/config/passport.js`).
- Cẩn trọng: code hiện có fallback JWT secret và 1 fallback MongoDB URI — phải thay thế trước khi đưa lên production.

**Hiện trạng (Current Status)**
- Backend API: hoạt động (Express + native MongoDB driver).
- Auth: đăng ký / login / email-verify / reset password bằng Passport + JWT.
- Frontend: React + Vite + Tailwind, các trang sản phẩm, blog, giỏ hàng, thanh toán (contact-based).
- Upload: Local upload + image optimization → public images.
- Deploy: Sẵn sàng deploy lên Vercel via `vercel.json`.
- To-do (quan trọng): loại bỏ hardcoded DB secrets; chuẩn hóa driver DB (native vs mongoose); thêm test & CI; cân nhắc storage đám mây cho files.

**Chỉ dẫn nhanh cho production**
- Thiết lập biến môi trường trên nền tảng deploy (`MONGODB_URI`, `JWT_SECRET`, `EMAIL_*`, `CORS_ORIGIN`...).
- Xóa / ghi đè mọi URI hoặc secret hardcoded trong `backend/server.js`.
- Kiểm tra chính sách lưu file (serverless thường không bền vững cho lưu file cục bộ → dùng S3/GCS nếu cần).
- Bật logging/monitoring, rotate secrets, và backup DB.

**Tệp tham khảo chính (liên kết trong repo)**
- Frontend entry: [src/main.jsx](src/main.jsx)
- Vite config: [vite.config.js](vite.config.js)
- Tailwind config: [tailwind.config.js](tailwind.config.js)
- Backend server: [backend/server.js](backend/server.js)
- Backend passport: [backend/config/passport.js](backend/config/passport.js)
- Routes: [backend/routes](backend/routes)
- Image service: [backend/services/imageService.js](backend/services/imageService.js)
- Env samples: [.env.example](.env.example), [backend/.env.example](backend/.env.example), [backend/.env.vercel.example](backend/.env.vercel.example)
- Vercel config: [vercel.json](vercel.json)
- ESLint: [eslint.config.js](eslint.config.js)

*** End Updated README

