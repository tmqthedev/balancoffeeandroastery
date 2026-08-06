# Hướng dẫn xử lý Conflict file `.env` cho Leader

Chào Leader, do trước đó nhánh này đã gỡ bỏ `.gitignore` và lỡ đẩy file `.env` lên Git nên khi anh Pull code về đã xảy ra Conflict giữa hai file `.env`. 

## 1. Nguyên nhân Conflict
- **Về Database & Email:** Môi trường ở máy anh đang dùng **PostgreSQL (AWS RDS)** và **Amazon SES** (với `POSTGRES_URI`, `EMAIL_HOST=email-smtp...`). Trong khi đó môi trường ở máy bạn Developer lại đang dùng **MongoDB** và **Gmail** thông thường.
- **Về Tính năng mới (AI Chatbot):** Nhánh này vừa phát triển xong tính năng AI Chatbot dùng **AWS Bedrock**. Để gọi được API Bedrock, nhánh này đã thêm 2 biến môi trường chứa khóa bảo mật IAM User (`AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY`) vào file `.env`.

## 2. Cách giải quyết Conflict
Khi Merge code, anh hãy **GIỮ NGUYÊN HOÀN TOÀN** phần cấu hình Database, Email, Cognito của anh (như anh đã gửi). 

Anh **CHỈ CẦN THÊM** 3 dòng cấu hình AWS IAM (để cấp quyền gọi API cho tính năng AI Chatbot và S3) vào cuối file `.env` của anh là được:

```env
# ============================================
# AWS Configuration (Dành cho AI Chatbot Bedrock & S3)
# ============================================
AWS_ACCESS_KEY_ID=AKIAYB7OKGSCSK7KK6FJ
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET_NAME=balancoffee-assets-2026
```

**Lưu ý:**
- Bắt buộc phải có `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` thì giao diện chat AI mới có thể gọi được mô hình Amazon Nova.
- File `.env` chứa khóa bảo mật nên sau đợt xử lý lỗi này, tốt nhất chúng ta nên bổ sung lại `.env` vào file `.gitignore` để tránh bị lộ Secret Key hoặc gây Conflict trong tương lai nhé!
