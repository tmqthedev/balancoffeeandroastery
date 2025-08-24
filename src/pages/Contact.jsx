import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/contact', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });    } catch (error) {
      console.error('Error submitting contact form:', error);
      setError('Có lỗi xảy ra khi gửi form. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const storeInfo = {
    address: "S6.01 Vinhome Grand Park Phường Long Bình, Thủ Đức, Hồ Chí Minh, Việt Nam.",
    phone: "+84 964 822 269",
    email: "info@balancoffee.com",
    hours: "6:30 - 22:30"
  }; 

  // Google Maps integration would go here
  useEffect(() => {
    // Initialize Google Maps when component mounts
    // This would require Google Maps API key
    
  }, []);

  return (
    <>      <Helmet>
        <title>Liên hệ - Balan Coffee & Roastery</title>
        <meta name="description" content="Liên hệ với Balan Coffee & Roastery để biết thêm thông tin về sản phẩm cà phê rang mộc chất lượng cao. Địa chỉ, điện thoại và form liên hệ trực tuyến." />
        <meta name="keywords" content="liên hệ balan coffee, địa chỉ cửa hàng cà phê, điện thoại balan coffee, email balan coffee" />
        <link rel="canonical" href={`${window.location.origin}/contact`} />
        <meta property="og:title" content="Liên hệ - Balan Coffee & Roastery" />
        <meta property="og:description" content="Liên hệ với Balan Coffee & Roastery để biết thêm thông tin về sản phẩm cà phê rang mộc chất lượng cao. Địa chỉ, điện thoại và form liên hệ trực tuyến." />
        <meta property="og:url" content={`${window.location.origin}/contact`} />
        <meta property="og:type" content="website" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Balan Coffee & Roastery",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "S6.01 Vinhome Grand Park Phường Long Bình",
              "addressLocality": "Thủ Đức",
              "addressRegion": "Hồ Chí Minh",
              "addressCountry": "VN"
            },
            "telephone": "+84-123-456-789",
            "email": "info@balancoffee.com",
            "openingHours": [
              "Mo-Fr 07:00-21:00",
              "Sa-Su 06:30-22:00"
            ],
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 11.9404,
              "longitude": 108.4583
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-brand-primary text-brand-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-brand-white">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-xl text-brand-white/80 max-w-3xl mx-auto">
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi để biết thêm thông tin về sản phẩm hoặc dịch vụ.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>

              {submitted ? (
                <div className="text-center py-8">                  <div className="text-6xl text-green-500 mb-4">✅</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Cảm ơn bạn đã liên hệ!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="bg-brand-primary text-brand-white px-6 py-2 rounded-md hover:bg-brand-primary/90 transition-colors"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        placeholder="Nhập họ tên của bạn"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                        placeholder="Nhập số điện thoại của bạn"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Chủ đề *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                      >                        <option value="">Chọn chủ đề</option>
                        <option value="general">Câu hỏi chung</option>
                        <option value="product">Thông tin sản phẩm</option>
                        <option value="wholesale">Bán buôn</option>
                        <option value="partnership">Hợp tác kinh doanh</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Tin nhắn *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-brand-secondary"
                      placeholder="Nhập tin nhắn của bạn..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-primary text-brand-white py-3 px-6 rounded-md hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Store Information */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin liên hệ
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">                      <h3 className="text-lg font-semibold text-gray-900">
                        Địa chỉ
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {storeInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">                      <h3 className="text-lg font-semibold text-gray-900">
                        Số điện thoại
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <a href={`tel:${storeInfo.phone}`} className="hover:text-brand-primary transition-colors">
                          {storeInfo.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">                      <h3 className="text-lg font-semibold text-gray-900">
                        Email
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <a href={`mailto:${storeInfo.email}`} className="hover:text-brand-primary transition-colors">
                          {storeInfo.email}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">                      <h3 className="text-lg font-semibold text-gray-900">
                        Giờ mở cửa
                      </h3>
                      <div className="text-gray-600 mt-1">
                        {storeInfo.hours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Theo dõi chúng tôi
                </h2>

                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com/balancoffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  <a
                    href="https://instagram.com/balancoffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.328-1.291L6.99 14.102c.613.742 1.528 1.216 2.459 1.216 1.797 0 3.173-1.4 3.173-3.216 0-1.797-1.376-3.173-3.173-3.173-.931 0-1.846.474-2.459 1.216L5.121 8.55c.88-.8 2.031-1.291 3.328-1.291 2.459 0 4.448 1.989 4.448 4.448-.001 2.458-1.989 4.447-4.448 4.447z"/>
                    </svg>
                  </a>

                  <a
                    href="https://youtube.com/@balancoffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>

                  <a
                    href="https://zalo.me/balancoffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <span className="text-sm font-bold">Z</span>
                  </a>
                </div>                <p className="text-gray-600 mt-4 text-sm">
                  Theo dõi chúng tôi để cập nhật tin tức mới nhất về cà phê
                </p>
              </div>

              {/* FAQ Link */}
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                  Câu hỏi thường gặp
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Tìm câu trả lời cho những thắc mắc phổ biến về sản phẩm và dịch vụ
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center text-brand-primary hover:text-brand-primary/80 font-medium transition-colors"
                >
                  Xem câu hỏi thường gặp
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="mt-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vị trí cửa hàng
                </h2>
                <p className="text-gray-600 mt-2">
                  Tìm chúng tôi tại địa chỉ dưới đây
                </p>
              </div>
              
              {/* Google Map iframe */}
              <div className="h-96 relative">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5968705427917!2d106.8354841748059!3d10.842130789310659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529f54ced1d0f%3A0x10dea56b2dad9187!2sBalan%20Coffee%20Roastery!5e0!3m2!1svi!2s!4v1756018341637!5m2!1svi!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí Balan Coffee Roastery"
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;

