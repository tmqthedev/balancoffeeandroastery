# Kế hoạch triển khai cho nhiệm vụ của Minh

Chào Minh, dựa trên mô tả nhiệm vụ của nhóm phân công cho bạn, đây là kế hoạch triển khai chi tiết cho 3 phần: File Storage (S3), AI Recommendation (Bedrock), và API refactor.

## User Review Required

> [!IMPORTANT]
> - Chúng ta sẽ cần cài đặt thêm các thư viện của AWS SDK (v3) vào `backend/package.json`: `@aws-sdk/client-s3`, `@aws-sdk/client-bedrock-runtime` và `multer-s3`.
> - Việc gọi Bedrock API tốn chi phí và yêu cầu phải có quyền (IAM role/policy) được cấu hình cho user/role chạy backend. Minh hãy đảm bảo bạn Quân (AWS Infra) cấp đủ quyền truy cập S3 bucket và Bedrock (ví dụ mô hình Anthropic Claude) nhé.
> - Việc refactor API sẽ tách logic từ các file routes (như `routes/products.js`, `routes/upload.js`) sang các thư mục `controllers/` tương ứng để code dễ maintain hơn theo mô hình chuẩn (MVC).

## Technical Decisions (Updated)

> [!NOTE]
> Các câu hỏi mở trước đó đã được nhóm trưởng chốt lại như sau:
> 
> 1. **Mô hình AI trên Bedrock**: Sử dụng **Amazon Nova** để tối ưu hóa chi phí.
> 2. **Luồng Recommend**: 
>    - Bỏ qua tự động gợi ý theo lịch sử.
>    - Người dùng nhập mô tả/chat, AI phân tích (khẩu vị, cách pha chế, độ tuổi, giá) và gọi Bedrock để trả về sản phẩm. 
>    - AI sẽ được cung cấp context (system prompt) chứa các kiến thức nền tảng về cà phê (Barista Basic, đặc tính Arabica/Robusta, phương pháp pha chế).
> 3. **Cấu hình S3**: 
>    - Tiếp tục dùng các biến môi trường trong `.env` (`AWS_REGION`, `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
>    - Việc lấy URL tạm thời được xử lý qua RDS (upload source lên trước) do kiến trúc EC2 đang gặp trục trặc.

## Proposed Changes

---

### Backend Dependencies
Thêm các thư viện cần thiết cho AWS services.

#### [MODIFY] [backend/package.json](file:///e:/AWS/Project/balancoffeeandroastery/backend/package.json)
- Thêm dependencies: `@aws-sdk/client-s3`, `@aws-sdk/client-bedrock-runtime`, `multer-s3`.

---

### 1. File Storage (S3)
Thay thế cơ chế upload file nội bộ thành AWS S3.

#### [MODIFY] [backend/services/imageService.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/services/imageService.js)
- Sửa lại hàm `getMulterConfig` để sử dụng `multer-s3` và `@aws-sdk/client-s3`.
- Update/xóa bỏ việc tạo folder local (`initializeDirectories`).
- Update hàm xử lý `deleteLocalImage` thành `deleteS3Image`.

#### [MODIFY] [backend/routes/upload.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/routes/upload.js)
- Cập nhật logic trả về URL trực tiếp từ S3 thay vì đường dẫn cục bộ.

---

### 2. AI Recommendation (Bedrock)
Thêm service và API gọi AWS Bedrock để gợi ý sản phẩm.

#### [NEW] [backend/services/bedrockService.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/services/bedrockService.js)
- Khởi tạo `BedrockRuntimeClient`.
- Viết hàm `getRecommendations(prompt, productsContext)` để gửi prompt tới Bedrock kèm theo danh sách sản phẩm hiện có, trả về JSON array ID sản phẩm gợi ý.

#### [MODIFY] [backend/routes/products.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/routes/products.js)
- Thêm route `GET /api/products/recommendations`.
- Lấy thông tin ngữ cảnh/prompt, gọi `bedrockService`, map kết quả ID trả về với DB và trả về list sản phẩm tương ứng.

---

### 3. API Refactor
Chuyển logic từ router sang controller để clean source code.

#### [NEW] [backend/controllers/productController.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/controllers/productController.js)
- Di chuyển toàn bộ code thao tác DB (get, post, put, delete products) từ `routes/products.js` sang file này.
- Thêm logic lấy Recommendation.

#### [MODIFY] [backend/routes/products.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/routes/products.js)
- Chỉ giữ lại khai báo router và map tới các hàm trong `productController`.

#### [NEW] [backend/controllers/uploadController.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/controllers/uploadController.js)
- Di chuyển logic upload file từ `routes/upload.js` sang.

#### [MODIFY] [backend/routes/upload.js](file:///e:/AWS/Project/balancoffeeandroastery/backend/routes/upload.js)
- Tương tự, gọi logic từ `uploadController`.

## Verification Plan

### Manual Verification
1. **Upload File**: Tạo một HTTP Request (qua Insomnia/Postman hoặc trực tiếp trên Web UI) để upload 1 file ảnh. Kiểm tra ảnh có nằm trên AWS S3 Bucket và URL trả về là public URL hợp lệ.
2. **Delete File**: Xóa ảnh và kiểm tra trên S3 Console xem file đã biến mất chưa.
3. **AI Recommendation**: Gửi request `GET /api/products/recommendations?query="cà phê chua nhẹ"` và xem AI có trả về các mã sản phẩm tương ứng (Arabica) không.
4. **API Testing**: Test lại các API gốc (Lấy danh sách, chi tiết, tạo mới) xem refactor sang Controller có bị lỗi hay ảnh hưởng gì không.
