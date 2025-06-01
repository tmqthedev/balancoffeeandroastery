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
    address: "123 Đường Cà Phê, Phường 1, Thành phố Đà Lạt, Lâm Đồng",
    phone: "+84 123 456 789",
    email: "info@balancoffee.com",
    hours: {
      weekdays: "7:00 - 21:00",
      weekend: "6:30 - 22:00"
    }
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
              "streetAddress": "123 Đường Cà Phê, Phường 1",
              "addressLocality": "Đà Lạt",
              "addressRegion": "Lâm Đồng",
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

      <div className="min-h-screen bg-cream-50">
        {/* Hero Section */}
        <section className="bg-coffee-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Liên hệ với chúng tôi
              </h1>
              <p className="text-xl text-coffee-200 max-w-3xl mx-auto">
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
                    className="bg-coffee-600 text-white px-6 py-2 rounded-md hover:bg-coffee-700 transition-colors"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                        placeholder={t('contact.form.phonePlaceholder')}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contact.form.subject')} *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      >
                        <option value="">{t('contact.form.selectSubject')}</option>
                        <option value="general">{t('contact.form.subjects.general')}</option>
                        <option value="product">{t('contact.form.subjects.product')}</option>
                        <option value="wholesale">{t('contact.form.subjects.wholesale')}</option>
                        <option value="partnership">{t('contact.form.subjects.partnership')}</option>
                        <option value="support">{t('contact.form.subjects.support')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('contact.form.message')} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coffee-500"
                      placeholder={t('contact.form.messagePlaceholder')}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-coffee-600 text-white py-3 px-6 rounded-md hover:bg-coffee-700 focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? t('contact.form.sending') : t('contact.form.send')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Store Information */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('contact.info.title')}
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-coffee-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('contact.info.address')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {storeInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-coffee-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('contact.info.phone')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <a href={`tel:${storeInfo.phone}`} className="hover:text-coffee-600 transition-colors">
                          {storeInfo.phone}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-coffee-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('contact.info.email')}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        <a href={`mailto:${storeInfo.email}`} className="hover:text-coffee-600 transition-colors">
                          {storeInfo.email}
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-coffee-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t('contact.info.hours')}
                      </h3>
                      <div className="text-gray-600 mt-1">
                        <p>{t('contact.info.weekdays')}: {storeInfo.hours.weekdays}</p>
                        <p>{t('contact.info.weekend')}: {storeInfo.hours.weekend}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t('contact.social.title')}
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
                </div>

                <p className="text-gray-600 mt-4 text-sm">
                  {t('contact.social.description')}
                </p>
              </div>

              {/* FAQ Link */}
              <div className="bg-coffee-50 border border-coffee-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                  {t('contact.faq.title')}
                </h3>
                <p className="text-coffee-700 text-sm mb-4">
                  {t('contact.faq.description')}
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center text-coffee-600 hover:text-coffee-700 font-medium transition-colors"
                >
                  {t('contact.faq.link')}
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
                  {t('contact.map.title')}
                </h2>
                <p className="text-gray-600 mt-2">
                  {t('contact.map.description')}
                </p>
              </div>
              
              {/* Google Map would be embedded here */}
              <div className="h-96 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-500">
                    {t('contact.map.placeholder')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
