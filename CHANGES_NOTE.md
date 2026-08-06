# Ghi Chú Cập Nhật: Tích Hợp AI Chatbot (Amazon Nova)

File này tóm tắt những thay đổi quan trọng trong nhánh `feature/ai-chatbot-setup` để Leader dễ dàng review và Merge.

## 1. Biến Môi Trường (`.env`)
*(Không push file .env lên để bảo mật, xin vui lòng tự cập nhật ở môi trường thực tế)*
- **Cập nhật AWS Region:** Đổi `AWS_REGION` thành `ap-southeast-1` theo quyết định thống nhất hệ thống ở Singapore.
- **Cập nhật Key:** Đã thay đổi `AWS_ACCESS_KEY_ID` và `AWS_SECRET_ACCESS_KEY` thành key mới cấp từ IAM User `ballancoffee-Nova`.

## 2. File `backend/services/bedrockService.js`
- **Sửa Model ID:** Thay đổi `amazon.nova-lite-v1:0` thành `apac.amazon.nova-lite-v1:0` (Vì Region Singapore yêu cầu dùng Inference Profile để gọi model Nova On-Demand).
- **Prompt Engineering:** Nâng cấp System Prompt để AI không chỉ lọc mảng ID sản phẩm mà còn giao tiếp thân thiện (trả về JSON chứa `reply` và `recommendedIds`). Hỗ trợ nhận diện và phản hồi song ngữ (Anh/Việt) linh hoạt theo câu hỏi của khách hàng.

## 3. File `backend/controllers/productController.js`
- **Cập nhật Logic PostgreSQL & MongoDB:** Điều chỉnh API `/api/products/recommendations` để bóc tách và trả về cả câu giao tiếp `reply` kèm danh sách sản phẩm.
- **Sửa lỗi MongoDB:** Thay đổi filter tìm kiếm từ `inStock: true` thành `isActive: true` vì collection Products hiện tại sử dụng trường `isActive`. Đồng thời thêm cơ chế trả lời lịch sự khi không tìm thấy sản phẩm phù hợp.

---
**Nhánh này hoàn toàn sạch sẽ (Clean Branch), không chứa `.env` hay `node_modules`. Leader có thể Merge nhánh `feature/ai-chatbot-setup` vào `aws-workshop-v2` ngay lúc này.**
