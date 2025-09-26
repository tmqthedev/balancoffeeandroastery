import { Helmet } from 'react-helmet-async';

const Privacy = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Chính sách bảo mật - Balan Coffee & Roastery",
    "description": "Chính sách bảo mật thông tin khách hàng của Balan Coffee & Roastery",
    "url": `${window.location.origin}/privacy`
  };

  return (
    <>
      <Helmet>
        <title>Chính sách bảo mật - Balan Coffee & Roastery</title>
        <meta name="description" content="Chính sách bảo mật và xử lý dữ liệu cá nhân tại Balan Coffee & Roastery. Cam kết bảo vệ thông tin khách hàng một cách an toàn và minh bạch." />
        <meta name="keywords" content="chính sách bảo mật, quyền riêng tư, bảo vệ dữ liệu, thông tin cá nhân, balan coffee" />
        <link rel="canonical" href={`${window.location.origin}/privacy`} />
        <meta property="og:title" content="Chính sách bảo mật - Balan Coffee & Roastery" />
        <meta property="og:description" content="Chính sách bảo mật và xử lý dữ liệu cá nhân tại Balan Coffee & Roastery" />
        <meta property="og:url" content={`${window.location.origin}/privacy`} />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-cream-50">
        {/* Header Section */}
        <section className="bg-brand-primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">Chính sách bảo mật</h1>
            <p className="text-xl opacity-90 text-white">
              Cam kết bảo vệ thông tin cá nhân của khách hàng
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
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Giới thiệu</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">
                    Balan Coffee & Roastery ("chúng tôi", "công ty") cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
                    Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi 
                    sử dụng website và dịch vụ của chúng tôi.
                  </p>
                  <p>
                    Bằng việc sử dụng website balancoffeeroastery.com.vn, bạn đồng ý với các điều khoản trong chính sách bảo mật này.
                  </p>
                </div>
              </div>

              {/* Information Collection */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Thông tin chúng tôi thu thập</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">2.1. Thông tin cá nhân</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Họ tên, số điện thoại, email</li>
                      <li>Địa chỉ giao hàng và thanh toán</li>
                      <li>Thông tin tài khoản (tên đăng nhập, mật khẩu đã mã hóa)</li>
                      <li>Lịch sử đơn hàng và sở thích mua sắm</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">2.2. Thông tin kỹ thuật</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Địa chỉ IP, loại trình duyệt, hệ điều hành</li>
                      <li>Thời gian truy cập, trang đã xem</li>
                      <li>Cookies và dữ liệu phiên làm việc</li>
                      <li>Dữ liệu phân tích website (Google Analytics)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Information Usage */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Cách chúng tôi sử dụng thông tin</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Xử lý và giao hàng đơn hàng</li>
                  <li>Cung cấp dịch vụ khách hàng và hỗ trợ kỹ thuật</li>
                  <li>Gửi thông báo về đơn hàng, khuyến mãi (nếu đồng ý)</li>
                  <li>Cải thiện chất lượng website và dịch vụ</li>
                  <li>Phân tích hành vi người dùng để tối ưu trải nghiệm</li>
                  <li>Tuân thủ các yêu cầu pháp lý</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Chia sẻ thông tin</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">
                    Chúng tôi không bán, cho thuê hay chia sẻ thông tin cá nhân của bạn với bên thứ ba, 
                    trừ các trường hợp sau:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Đối tác giao hàng (chỉ thông tin cần thiết cho việc giao hàng)</li>
                    <li>Nhà cung cấp dịch vụ thanh toán (thông tin thanh toán được mã hóa)</li>
                    <li>Cơ quan pháp luật (khi có yêu cầu hợp pháp)</li>
                    <li>Bảo vệ quyền lợi và an toàn của công ty, khách hàng</li>
                  </ul>
                </div>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Bảo mật thông tin</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Chúng tôi áp dụng các biện pháp bảo mật hàng đầu:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                    <li>Mã hóa mật khẩu và thông tin nhạy cảm</li>
                    <li>Tường lửa và hệ thống phát hiện xâm nhập</li>
                    <li>Kiểm tra bảo mật định kỳ</li>
                    <li>Giới hạn quyền truy cập dựa trên vai trò</li>
                    <li>Sao lưu dữ liệu thường xuyên</li>
                  </ul>
                </div>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies và công nghệ theo dõi</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Chúng tôi sử dụng cookies để:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                    <li>Ghi nhớ thông tin đăng nhập và giỏ hàng</li>
                    <li>Cá nhân hóa trải nghiệm người dùng</li>
                    <li>Phân tích lưu lượng website (Google Analytics)</li>
                    <li>Hiển thị quảng cáo phù hợp</li>
                  </ul>
                  <p>
                    Bạn có thể tắt cookies trong trình duyệt, nhưng điều này có thể ảnh hưởng đến chức năng website.
                  </p>
                </div>
              </div>

              {/* User Rights */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Quyền của khách hàng</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">Bạn có quyền:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Truy cập và xem thông tin cá nhân đã lưu trữ</li>
                    <li>Chỉnh sửa hoặc cập nhật thông tin cá nhân</li>
                    <li>Yêu cầu xóa tài khoản và dữ liệu liên quan</li>
                    <li>Từ chối nhận email marketing</li>
                    <li>Khiếu nại về việc xử lý dữ liệu cá nhân</li>
                    <li>Yêu cầu sao chép dữ liệu cá nhân</li>
                  </ul>
                  <p className="mt-4">
                    Để thực hiện các quyền trên, vui lòng liên hệ: <strong>privacy@balancoffeeroastery.com.vn</strong> hoặc hotline <strong>+84 964 822 269</strong>
                  </p>
                </div>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Thời gian lưu trữ</h2>
                <div className="prose prose-gray max-w-none">
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li><strong>Thông tin tài khoản:</strong> Cho đến khi bạn yêu cầu xóa</li>
                    <li><strong>Lịch sử đơn hàng:</strong> 5 năm (theo quy định pháp luật)</li>
                    <li><strong>Dữ liệu phân tích:</strong> 26 tháng (Google Analytics)</li>
                    <li><strong>Cookies:</strong> Tối đa 2 năm</li>
                    <li><strong>Log hệ thống:</strong> 12 tháng</li>
                  </ul>
                </div>
              </div>

              {/* Policy Changes */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Thay đổi chính sách</h2>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. 
                    Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website. 
                    Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận 
                    chính sách mới.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-cream-50 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Liên hệ</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="mb-4">
                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, 
                    vui lòng liên hệ với chúng tôi:
                  </p>
                  <div className="space-y-2">
                    <p><strong>Công ty:</strong> Balan Coffee & Roastery</p>
                    <p><strong>Địa chỉ:</strong> S6.01 Vinhome Grand Park Phường Long Bình, Thủ Đức, Hồ Chí Minh, Việt Nam.</p>
                    <p><strong>Email:</strong> info@balancoffeeroastery.com.vn</p>
                    <p><strong>Hotline:</strong> +84 964 822 269</p>
                    <p><strong>Giờ làm việc:</strong> 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Privacy;