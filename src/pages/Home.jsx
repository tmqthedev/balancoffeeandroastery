import React from 'react';
import { Link } from 'react-router-dom';
import SEOHelmet from '../components/common/SEOHelmet';

const Home = () => {
    const homeStructuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Balan Coffee & Roastery",
        "url": "https://balancoffee.com",
        "logo": "https://balancoffee.com/logo.png",
        "description": "Premium Vietnamese coffee roastery specializing in Arabica Cầu Đất and Robusta Lâm Đồng beans",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Đường Cà Phê",
            "addressLocality": "Quận 1", 
            "addressRegion": "TP.HCM",
            "postalCode": "700000",
            "addressCountry": "VN"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+84-123-456-789",
            "contactType": "customer service",
            "email": "info@balancoffee.com",
            "availableLanguage": ["vi", "en"]
        },
        "sameAs": [
            "https://facebook.com/balancoffee",
            "https://instagram.com/balancoffee",
            "https://www.tiktok.com/@blan.vin"
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
        },
        "priceRange": "$$"
    };

    return (
        <>
            <SEOHelmet
                title="Balan Coffee & Roastery - Cà phê rang mộc chất lượng cao từ Việt Nam"
                description="Khám phá hương vị cà phê rang mộc đặc biệt từ Việt Nam. Chuyên về Arabica Cầu Đất, Arabica Typica Kongo và Robusta Lâm Đồng. Mua hạt cà phê nguyên chất online với chất lượng cao nhất."
                keywords="cà phê rang mộc, Arabica Cầu Đất, Arabica Typica Kongo, Robusta Lâm Đồng, coffee and roastery, mua hạt cà phê nguyên chất, cà phê Việt Nam, coffee Vietnam, roasted coffee beans, specialty coffee"
                canonicalUrl="https://balancoffee.com/"
                structuredData={homeStructuredData}
            /><div className="min-h-screen bg-brand-white">                {/* Hero Section */}
                <section className="relative h-screen bg-cover bg-center flex items-center justify-center" style={{backgroundImage: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1447933601403-0c6688de566e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")'}}>
                    <div className="text-center px-4 max-w-4xl mx-auto">
                        <h1 className="text-6xl font-bold text-brand-white mb-6 tracking-wide">
                            Balan Coffee – Natural Flavor
                        </h1>
                        <p className="text-xl text-brand-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Khám phá hương vị tự nhiên từ những hạt cà phê chất lượng cao được chọn lọc kỹ càng từ các vùng đất tốt nhất Việt Nam
                        </p>
                        <a 
                            href="#products"
                            className="inline-block bg-brand-secondary hover:bg-brand-primary text-black hover:text-brand-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                            aria-label="Khám phá sản phẩm cà phê của chúng tôi"
                        >
                            Explore Now
                        </a>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20 bg-brand-white">
                    <div className="container mx-auto px-4">                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">                            {/* Image placeholder */}
                            <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500" aria-label="Hình ảnh minh họa về quy trình rang cà phê tại Balan Coffee & Roastery">
                                <div className="text-center">
                                    <span className="text-4xl block mb-2" aria-hidden="true">📷</span>
                                    <span className="text-sm">Placeholder Image 500x300px</span>
                                    <p className="text-xs mt-1 text-gray-400">Coffee roasting process image</p>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div>
                                <h2 className="text-3xl font-bold text-brand-primary mb-6 tracking-wide">
                                    About Balan Coffee
                                </h2>
                                <p className="text-lg text-black mb-6 leading-relaxed">
                                    Chúng tôi là những người đam mê cà phê, cam kết mang đến những hạt cà phê chất lượng cao nhất từ những vùng đất tốt nhất của Việt Nam. Từ những vùng cao mù sương đến tách cà phê của bạn, mỗi hạt cà phê đều kể một câu chuyện về đam mê và sự xuất sắc.
                                </p>
                                <p className="text-lg text-black mb-8 leading-relaxed">
                                    Các phương pháp canh tác bền vững và mối quan hệ thương mại trực tiếp của chúng tôi đảm bảo chất lượng tốt nhất đồng thời hỗ trợ cộng đồng địa phương.
                                </p>
                                <Link
                                    to="/about"
                                    className="inline-block bg-brand-secondary hover:bg-brand-primary text-black hover:text-brand-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section id="products" className="py-20 bg-brand-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-brand-primary mb-6 tracking-wide">
                                Our Products
                            </h2>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                            {/* Product 1 */}
                            <div className="bg-brand-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <span className="text-4xl block mb-2">📷</span>
                                        <span className="text-sm">Placeholder 300x300px</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-brand-primary mb-2">Arabica Cầu Đất</h3>
                                    <p className="text-black mb-4">Cà phê Arabica cao cấp từ vùng cao Việt Nam với hương vị tinh tế và thanh mát.</p>
                                </div>
                            </div>

                            {/* Product 2 */}
                            <div className="bg-brand-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <span className="text-4xl block mb-2">📷</span>
                                        <span className="text-sm">Placeholder 300x300px</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-brand-primary mb-2">Robusta Lâm Đồng</h3>
                                    <p className="text-black mb-4">Cà phê Robusta mạnh mẽ từ Lâm Đồng với hương vị đậm đà và caffeine cao.</p>
                                </div>
                            </div>

                            {/* Product 3 */}
                            <div className="bg-brand-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="h-64 bg-gray-200 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <span className="text-4xl block mb-2">�</span>
                                        <span className="text-sm">Placeholder 300x300px</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-brand-primary mb-2">Special Blend</h3>
                                    <p className="text-black mb-4">Hỗn hợp cà phê được pha chế chuyên nghiệp tạo nên hương vị độc đáo.</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/products"
                                className="inline-block bg-brand-secondary hover:bg-brand-primary text-black hover:text-brand-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                            >
                                View All Products
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-20 bg-brand-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-brand-primary mb-6 tracking-wide">
                                Contact Us
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">                            {/* Contact Form */}
                            <div>
                                <form className="space-y-6" name="contact" method="post" data-netlify="true" data-netlify-honeypot="bot-field">
                                    <input type="hidden" name="form-name" value="contact" />
                                    <div aria-hidden="true" style={{display: 'none'}}>
                                        <label htmlFor="bot-field">Don't fill this out if you're human:</label>
                                        <input id="bot-field" name="bot-field" />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="contact-name" className="block text-black font-medium mb-2">
                                            Name <span className="text-red-500" aria-label="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="contact-name"
                                            name="name"
                                            required
                                            aria-required="true"
                                            className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:border-brand-secondary focus:outline-none transition-colors duration-200"
                                            placeholder="Tên của bạn"
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-email" className="block text-black font-medium mb-2">
                                            Email <span className="text-red-500" aria-label="required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="contact-email"
                                            name="email"
                                            required
                                            aria-required="true"
                                            className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:border-brand-secondary focus:outline-none transition-colors duration-200"
                                            placeholder="email@example.com"
                                            autoComplete="email"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-message" className="block text-black font-medium mb-2">
                                            Message <span className="text-red-500" aria-label="required">*</span>
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            name="message"
                                            rows="5"
                                            required
                                            aria-required="true"
                                            className="w-full px-4 py-3 border-2 border-brand-primary rounded-lg focus:border-brand-secondary focus:outline-none transition-colors duration-200 resize-none"
                                            placeholder="Tin nhắn của bạn..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-secondary hover:bg-brand-primary text-black hover:text-brand-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-md"
                                        aria-label="Gửi tin nhắn liên hệ"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-primary mb-4">Thông tin liên hệ</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-black">Địa chỉ</p>
                                            <p className="text-black">123 Đường Cà Phê, Quận 1, TP.HCM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-black">Số điện thoại</p>
                                            <p className="text-black">+84 123 456 789</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-brand-primary mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-black">Email</p>
                                            <p className="text-black">info@balancoffee.com</p>
                                        </div>
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

export default Home;
