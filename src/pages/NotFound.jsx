import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const popularPages = [
    { name: 'Trang chủ', path: '/', icon: '🏠' },
    { name: 'Sản phẩm', path: '/products', icon: '☕' },
    { name: 'Blog', path: '/blog', icon: '📝' },
    { name: 'Giới thiệu', path: '/about', icon: '👥' },
    { name: 'Liên hệ', path: '/contact', icon: '📞' }
  ];

  const featuredProducts = [
    {
      name: 'Arabica Cầu Đất',
      image: '/images/products/arabica-cau-dat.jpg',
      path: '/products/arabica-cau-dat'
    },
    {
      name: 'Robusta Lâm Đồng',
      image: '/images/products/robusta-lam-dong.jpg',
      path: '/products/robusta-lam-dong'
    },
    {
      name: 'Blend Đặc Biệt',
      image: '/images/products/blend-dac-biet.jpg',
      path: '/products/blend-dac-biet'
    }
  ];

  return (
    <>      <Helmet>
        <title>Trang không tìm thấy - Balan Coffee & Roastery</title>
        <meta name="description" content="Trang bạn đang tìm không tồn tại. Khám phá các sản phẩm cà phê chất lượng cao của chúng tôi." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Main 404 Content */}
          <div className="mb-12">
            {/* Coffee Cup Animation */}
            <div className="relative inline-block mb-8">
              <div className="text-9xl">☕</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-bounce">💨</div>
            </div>

            {/* 404 Text */}
            <h1 className="text-6xl md:text-8xl font-bold text-coffee-800 mb-4">
              404
            </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Trang không tìm thấy
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Xin lỗi, trang bạn đang tìm kiếm không tồn tại. Có thể đường dẫn đã bị thay đổi hoặc bạn đã nhập sai địa chỉ. Hãy thử quay lại trang chủ hoặc tìm kiếm sản phẩm mà bạn quan tâm.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Về trang chủ
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-3 border border-coffee-600 text-coffee-600 rounded-lg hover:bg-coffee-50 transition-colors font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
            </div>
          </div>

          {/* Popular Pages */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Trang phổ biến
            </h3><div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {popularPages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-coffee-300 hover:bg-coffee-50 transition-colors group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {page.icon}
                  </span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-coffee-700">
                    {page.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white rounded-lg shadow-lg p-8">            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Sản phẩm nổi bật
            </h3>
              <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product.path}
                  to={product.path}
                  className="group block"
                >
                  <div className="bg-cream-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-32 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 group-hover:text-coffee-600 transition-colors">
                        {product.name}
                      </h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Search Section */}
          <div className="mt-8 bg-coffee-50 rounded-lg p-6">            <h3 className="text-lg font-semibold text-coffee-800 mb-4">
              Tìm kiếm sản phẩm
            </h3>
            
            <div className="max-w-md mx-auto">
              <form className="flex">
                <input
                  type="text"
                  placeholder="Tìm kiếm cà phê..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-coffee-600 text-white rounded-r-md hover:bg-coffee-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">            <p className="text-gray-600 mb-4">
              Cần hỗ trợ? Liên hệ với chúng tôi qua các kênh dưới đây:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <Link
                to="/contact"
                className="text-coffee-600 hover:text-coffee-700 font-medium"
              >
                📧 Gửi email
              </Link>
              
              <span className="hidden sm:inline text-gray-400">|</span>
              
              <a
                href="tel:+84123456789"
                className="text-coffee-600 hover:text-coffee-700 font-medium"
              >
                📞 Gọi điện thoại
              </a>
              
              <span className="hidden sm:inline text-gray-400">|</span>
              
              <Link
                to="/faq"
                className="text-coffee-600 hover:text-coffee-700 font-medium"
              >
                ❓ Câu hỏi thường gặp
              </Link>
            </div>
          </div>

          {/* Fun Coffee Fact */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">💡</span>              <h4 className="font-semibold text-yellow-800">
                Bạn có biết?
              </h4>
            </div>
            <p className="text-yellow-700 text-sm">
              Cà phê là thức uống được yêu thích thứ hai trên thế giới, chỉ sau nước! Tại Balan Coffee, chúng tôi rang từng hạt cà phê với tình yêu để mang đến cho bạn hương vị tuyệt vời nhất.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
