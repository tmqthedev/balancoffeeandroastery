import { Helmet } from 'react-helmet-async';

const Terms = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Điều khoản sử dụng - Balan Coffee & Roastery",
    "description": "Điều khoản và điều kiện sử dụng dịch vụ của Balan Coffee & Roastery",
    "url": `${window.location.origin}/terms`
  };

  return (
    <>
      <Helmet>
        <title>Điều khoản sử dụng - Balan Coffee & Roastery</title>
        <meta name="description" content="Điều khoản và điều kiện sử dụng dịch vụ mua bán cà phê trực tuyến tại Balan Coffee & Roastery. Quy định về quyền và nghĩa vụ của khách hàng." />
        <meta name="keywords" content="điều khoản sử dụng, quy định, điều kiện, dịch vụ, mua bán trực tuyến, balan coffee" />
        <link rel="canonical" href={`${window.location.origin}/terms`} />
        <meta property="og:title" content="Điều khoản sử dụng - Balan Coffee & Roastery" />
        <meta property="og:description" content="Điều khoản và điều kiện sử dụng dịch vụ của Balan Coffee & Roastery" />
        <meta property="og:url" content={`${window.location.origin}/terms`} />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Header Section */}
        <section className="bg-brand-primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">Điều khoản sử dụng</h1>
            <p className="text-xl opacity-90 text-white">
              Quy định và điều kiện sử dụng dịch vụ
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
              
              {/* Last Updated */}
              <div className="text-sm text-gray-600 text-center pb-6 border-b border-gray-200">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
              </div>

              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Điều khoản chung</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">
                    Chào mừng bạn đến với Balan Coffee & Roastery! Những điều khoản này điều chỉnh việc 
                    sử dụng website balancoffeeroastery.com.vn và các dịch vụ của chúng tôi. Bằng việc truy cập và sử dụng 
                    website, bạn đồng ý tuân theo các điều khoản và điều kiện sau đây.
                  </p>
                  <p className="mb-4">
                    <strong>Định nghĩa:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>"Chúng tôi" hoặc "Công ty" là Balan Coffee & Roastery</li>
                    <li>"Bạn" hoặc "Khách hàng" là người sử dụng website</li>
                    <li>"Dịch vụ" bao gồm website và tất cả dịch vụ liên quan</li>
                    <li>"Sản phẩm" là cà phê và các sản phẩm liên quan do chúng tôi cung cấp</li>
                  </ul>
                </div>
              </div>

              {/* Account Registration */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Đăng ký tài khoản</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Để sử dụng đầy đủ các dịch vụ, bạn cần:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Đăng ký tài khoản với thông tin chính xác và đầy đủ</li>
                    <li>Phải từ đủ 18 tuổi trở lên hoặc có sự đồng ý của người giám hộ</li>
                    <li>Bảo mật thông tin đăng nhập và chịu trách nhiệm cho mọi hoạt động trong tài khoản</li>
                    <li>Thông báo ngay cho chúng tôi nếu phát hiện việc sử dụng trái phép tài khoản</li>
                    <li>Cung cấp thông tin cập nhật khi có thay đổi</li>
                  </ul>
                  <p className="mt-4">
                    Chúng tôi có quyền từ chối hoặc hủy bỏ tài khoản nếu phát hiện thông tin sai lệch 
                    hoặc vi phạm điều khoản sử dụng.
                  </p>
                </div>
              </div>

              {/* Product Orders */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Đặt hàng và thanh toán</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">3.1. Quy trình đặt hàng</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Chọn sản phẩm và thêm vào giỏ hàng</li>
                      <li>Kiểm tra thông tin đơn hàng và địa chỉ giao hàng</li>
                      <li>Chọn phương thức thanh toán phù hợp</li>
                      <li>Xác nhận đơn hàng và hoàn tất thanh toán</li>
                      <li>Nhận email xác nhận đơn hàng</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">3.2. Giá cả và thanh toán</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Tất cả giá được hiển thị bằng VNĐ, đã bao gồm VAT</li>
                      <li>Giá có thể thay đổi mà không cần báo trước</li>
                      <li>Chấp nhận thanh toán qua: COD, chuyển khoản ngân hàng, ví điện tử</li>
                      <li>Đơn hàng COD có thể áp dụng phí thu hộ</li>
                      <li>Phí vận chuyển được tính riêng theo khu vực</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Shipping and Delivery */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Vận chuyển và giao hàng</h2>
                <div className="prose prose-gray max-w-none">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Khu vực giao hàng:</strong> Toàn quốc, ưu tiên TP.HCM và các tỉnh lân cận</li>
                    <li><strong>Thời gian giao hàng:</strong>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        <li>Nội thành TP.HCM: 1-2 ngày làm việc</li>
                        <li>Các tỉnh thành khác: 2-5 ngày làm việc</li>
                        <li>Vùng sâu, vùng xa: 5-7 ngày làm việc</li>
                      </ul>
                    </li>
                    <li><strong>Đóng gói:</strong> Sản phẩm được đóng gói cẩn thận, bảo đảm chất lượng</li>
                    <li><strong>Kiểm tra hàng:</strong> Bạn có quyền kiểm tra sản phẩm trước khi nhận hàng</li>
                    <li><strong>Giao hàng không thành công:</strong> Chúng tôi sẽ liên hệ để sắp xếp lại</li>
                  </ul>
                </div>
              </div>

              {/* Returns and Refunds */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Đổi trả và hoàn tiền</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">5.1. Chính sách đổi trả</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Chấp nhận đổi trả trong vòng 7 ngày kể từ ngày nhận hàng</li>
                      <li>Sản phẩm chưa sử dụng, còn nguyên seal/bao bì</li>
                      <li>Có hóa đơn mua hàng hoặc mã đơn hàng</li>
                      <li>Khách hàng chịu phí vận chuyển đổi trả (trừ lỗi từ chúng tôi)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">5.2. Các trường hợp đổi trả</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Sản phẩm bị lỗi, hư hỏng do vận chuyển</li>
                      <li>Giao sai sản phẩm, sai số lượng</li>
                      <li>Sản phẩm không đúng mô tả</li>
                      <li>Hết hạn sử dụng hoặc gần hết hạn (&lt;30 ngày)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">5.3. Quy trình đổi trả</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Liên hệ hotline hoặc email trong vòng 7 ngày</li>
                      <li>Cung cấp thông tin đơn hàng và lý do đổi trả</li>
                      <li>Chụp ảnh sản phẩm (nếu có lỗi)</li>
                      <li>Gửi trả sản phẩm theo hướng dẫn</li>
                      <li>Nhận sản phẩm mới hoặc hoàn tiền trong 3-5 ngày</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Product Quality */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Chất lượng sản phẩm</h2>
                <div className="prose prose-gray max-w-none">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Cam kết cung cấp cà phê nguyên chất 100%, không pha trộn tạp chất</li>
                    <li>Rang tươi mỗi tuần, đảm bảo độ tươi ngon tối đa</li>
                    <li>Có tem truy xuất nguồn gốc trên mỗi sản phẩm</li>
                    <li>Bảo quản trong điều kiện thích hợp để duy trì chất lượng</li>
                    <li>Hướng dẫn bảo quản và pha chế chi tiết</li>
                    <li>Hỗ trợ tư vấn chọn sản phẩm phù hợp với khách hàng</li>
                  </ul>
                </div>
              </div>

              {/* User Responsibilities */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Trách nhiệm người dùng</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Khi sử dụng dịch vụ, bạn cam kết:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Cung cấp thông tin chính xác, không gian lận</li>
                    <li>Không sử dụng dịch vụ cho mục đích thương mại trái phép</li>
                    <li>Không can thiệp vào hệ thống hoặc làm hại website</li>
                    <li>Tuân thủ pháp luật Việt Nam và quy định của chúng tôi</li>
                    <li>Tôn trọng quyền sở hữu trí tuệ</li>
                    <li>Không đăng tải nội dung vi phạm hoặc có hại</li>
                  </ul>
                </div>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Quyền sở hữu trí tuệ</h2>
                <div className="prose prose-gray max-w-none">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Toàn bộ nội dung website thuộc bản quyền của Balan Coffee & Roastery</li>
                    <li>Logo, thương hiệu, hình ảnh được bảo vệ theo pháp luật</li>
                    <li>Cấm sao chép, sử dụng không phép nội dung của chúng tôi</li>
                    <li>Bạn có thể chia sẻ nội dung với điều kiện ghi rõ nguồn</li>
                    <li>Mọi vi phạm bản quyền sẽ bị xử lý theo pháp luật</li>
                  </ul>
                </div>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Giới hạn trách nhiệm</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Chúng tôi không chịu trách nhiệm cho:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả</li>
                    <li>Gián đoạn dịch vụ do sự cố kỹ thuật, bảo trì</li>
                    <li>Tổn thất do sử dụng sai hướng dẫn của khách hàng</li>
                    <li>Hành vi của bên thứ ba (đối tác vận chuyển, thanh toán)</li>
                    <li>Thay đổi giá cả do biến động thị trường</li>
                  </ul>
                  <p className="mt-4">
                    Trách nhiệm tối đa của chúng tôi không vượt quá giá trị đơn hàng bị ảnh hưởng.
                  </p>
                </div>
              </div>

              {/* Account Termination */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Chấm dứt tài khoản</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Chúng tôi có quyền tạm ngưng hoặc chấm dứt tài khoản nếu:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Vi phạm điều khoản sử dụng</li>
                    <li>Cung cấp thông tin sai lệch</li>
                    <li>Có hành vi gian lận, lừa đảo</li>
                    <li>Sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                    <li>Yêu cầu của cơ quan pháp luật</li>
                  </ul>
                  <p className="mt-4">
                    Bạn cũng có thể yêu cầu xóa tài khoản bất kỳ lúc nào bằng cách liên hệ với chúng tôi.
                  </p>
                </div>
              </div>

              {/* Applicable Law */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Luật áp dụng</h2>
                <div className="prose prose-gray max-w-none">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam</li>
                    <li>Mọi tranh chấp sẽ được giải quyết thông qua thương lượng</li>
                    <li>Nếu không thương lượng được, sẽ đưa ra Tòa án có thẩm quyền tại TP.HCM</li>
                    <li>Ngôn ngữ chính thức của hợp đồng là tiếng Việt</li>
                  </ul>
                </div>
              </div>

              {/* Terms Changes */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Thay đổi điều khoản</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Chúng tôi có quyền sửa đổi điều khoản này bất kỳ lúc nào. 
                    Các thay đổi có hiệu lực ngay khi được đăng tải trên website. 
                    Chúng tôi sẽ thông báo các thay đổi quan trọng qua email hoặc thông báo trên website. 
                    Việc tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận điều khoản mới.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-cream-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Thông tin liên hệ</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">
                    Mọi thắc mắc về điều khoản sử dụng, vui lòng liên hệ:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Công ty:</strong> Balan Coffee and Roastery</p>
                    <p><strong>Địa chỉ:</strong> S6.01 Vinhome Grand Park Phường Long Bình, Thủ Đức, Hồ Chí Minh, Việt Nam.</p>
                    <p><strong>Email:</strong> info@balancoffeeroastery.com.vn</p>
                    <p><strong>Hotline:</strong> +84 964 822 269</p>
                    <p><strong>Giờ hỗ trợ:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </div>

              {/* Acceptance */}
              <div className="text-center py-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Bằng việc sử dụng website balancoffeeroastery.com.vn, bạn xác nhận đã đọc, 
                  hiểu và đồng ý với tất cả các điều khoản và điều kiện nêu trên.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Terms;