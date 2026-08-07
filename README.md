# Deployment Guide

## 1. Tổng quan

Ứng dụng gồm:

- Frontend React/Vite build bằng `npm run build` và phục vụ bằng Nginx.
- Backend Express/Node.js chạy trên port `5000`.
- Docker Compose định nghĩa 2 service:
  - `frontend`
  - `backend`

---

## 2. Yêu cầu

Trước khi deploy, đảm bảo đã cài đặt:

- Node.js 22+
- Docker
- Docker Compose
- PostgreSQL hoặc Amazon RDS
- AWS Credentials (nếu sử dụng AWS Secrets Manager hoặc AWS CloudWatch Logs)

---

## 3. Clone repository

```bash
git clone https://github.com/tmqthedev/balancoffeeandroastery.git
cd balancoffeeandroastery
git checkout aws-workshop-v2
git pull origin aws-workshop-v2
```

---

## 4. Cài đặt dependencies

### Frontend

```bash
npm install
```

### Backend

```bash
cd backend
npm install
```

---

## 5. Cấu hình môi trường

Tạo file `.env` từ file mẫu:

```bash
cp backend/.env.example backend/.env
```

Sau đó cập nhật các biến môi trường:

```env
NODE_ENV=production
PORT=5000

DATABASE_PROVIDER=postgres
POSTGRES_URI=postgresql://<username>:<password>@<host>:5432/balancoffee?sslmode=require
POSTGRES_SSLMODE=no-verify

JWT_SECRET=<long-random-secret>
JWT_EXPIRE=7d

CORS_ORIGIN=https://your-frontend-domain
FRONTEND_URL=https://your-frontend-domain
BACKEND_URL=https://your-backend-domain

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<smtp-email>
EMAIL_PASSWORD=<smtp-password>

AWS_REGION=ap-southeast-1

COGNITO_USER_POOL_ID=<cognito-user-pool-id>
COGNITO_CLIENT_ID=<cognito-client-id>

DATABASE_SECRET_ID=balan-coffee/dev/database
SMTP_SECRET_ID=balan-coffee/dev/smtp
COGNITO_SECRET_ID=balan-coffee/dev/cognito

AUTH_COOKIE_SECURE=true
```

---

## 6. Cách backend đọc cấu hình

Backend sử dụng `runtimeConfig.js` để lấy cấu hình theo thứ tự:

1. Đọc từ **AWS Secrets Manager** nếu `*_SECRET_ID` được cấu hình.
2. Nếu không lấy được secret thì fallback sang file `.env`.

### Các biến bắt buộc

#### Luôn bắt buộc

- `POSTGRES_URI`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`

#### Chỉ bắt buộc khi Production

- `COGNITO_CLIENT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `JWT_SECRET`
- `SESSION_SECRET`

---

## 7. Build và chạy bằng Docker Compose

Tại thư mục gốc của project:

```bash
docker compose up --build
```

Docker Compose sẽ:

- Build frontend từ thư mục gốc.
- Build backend từ thư mục `backend`.
- Frontend phục vụ qua Nginx trên port **80**.
- Backend chạy trên port **5000**.
- Backend sử dụng file `.env`.
- Mount thư mục `uploads` để giữ dữ liệu upload.
- Gửi log lên AWS CloudWatch nếu cấu hình `awslogs`.

---

## 8. Kiểm tra sau khi chạy

| Thành phần | URL |
|------------|-----|
| Frontend | http://localhost |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

Endpoint `/health` sẽ:

- Trả về JSON trạng thái.
- Kiểm tra kết nối PostgreSQL.

---

## 9. Chạy môi trường Development

### Frontend

```bash
npm run dev
```

### Backend

```bash
cd backend
npm run dev
```

---

## 10. Lưu ý khi Production

Đảm bảo:

- `NODE_ENV=production`
- Sử dụng PostgreSQL Production có SSL.
- `AUTH_COOKIE_SECURE=true`.
- `CORS_ORIGIN` đúng domain frontend.
- `FRONTEND_URL` đúng domain frontend.
- Nếu dùng AWS Secrets Manager thì IAM Role/User phải có quyền truy cập secrets.

---

## 11. Kiểm tra bổ sung

Sau khi deploy nên xác nhận:

- ✅ Backend kết nối database thành công.
- ✅ `/health` trả về HTTP 200.
- ✅ Upload file hoạt động và lưu vào thư mục `uploads`.
- ✅ Frontend gọi API không bị lỗi CORS.

---

## 12. Troubleshooting

### Backend không khởi động

Kiểm tra:

- File `.env`
- `POSTGRES_URI`
- `JWT_SECRET`

---

### Không kết nối được Database

Đảm bảo:

```env
DATABASE_PROVIDER=postgres
```

và `POSTGRES_URI` đúng.

---

### Cognito lỗi

Kiểm tra:

- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`

---

### AWS Secrets Manager không hoạt động

Kiểm tra:

- IAM Permission
- `DATABASE_SECRET_ID`
- `SMTP_SECRET_ID`
- `COGNITO_SECRET_ID`

Đảm bảo ứng dụng có quyền truy cập các secret tương ứng.

---
