import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const Home = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Balan Coffee & Roastery",
        "url": window.location.origin,
        "logo": `${window.location.origin}/logo.png`,
        "description": "Premium Vietnamese coffee roastery specializing in Arabica Cầu Đất and Robusta Lâm Đồng beans",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "VN"
        },
        "sameAs": [
            "https://facebook.com/balancoffee",
            "https://instagram.com/balancoffee"
        ]
    };    return (
        <>
            <Helmet>
                <title>Balan Coffee & Roastery - Cà phê rang mộc chất lượng cao</title>
                <meta name="description" content="Cà phê rang mộc chất lượng cao từ Việt Nam. Chuyên về Arabica Cầu Đất, Arabica Typica Kongo và Robusta Lâm Đồng. Mua hạt cà phê nguyên chất online." />
                <meta name="keywords" content="cà phê rang mộc, Arabica Cầu Đất, Arabica Typica Kongo, Robusta Lâm Đồng, coffee and roastery, mua hạt cà phê nguyên chất" />
                <meta property="og:title" content="Balan Coffee & Roastery - Cà phê rang mộc chất lượng cao" />
                <meta property="og:description" content="Cà phê rang mộc chất lượng cao từ Việt Nam. Chuyên về Arabica Cầu Đất, Arabica Typica Kongo và Robusta Lâm Đồng. Mua hạt cà phê nguyên chất online." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
                <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
            </Helmet>

            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-coffee-800 via-coffee-700 to-coffee-900 text-white">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative container mx-auto px-4 py-20 md:py-32">                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Cà phê rang mộc chất lượng cao
                            </h1>
                            <p className="text-xl md:text-2xl mb-4 text-cream-100 opacity-90">
                                Từ những vùng đất tốt nhất Việt Nam
                            </p>
                            <p className="text-lg mb-8 text-cream-200 max-w-2xl mx-auto leading-relaxed">
                                Khám phá hương vị cà phê rang mộc đặc biệt từ Việt Nam. Chúng tôi tự hào mang đến những hạt cà phê chất lượng cao được chọn lọc kỹ càng.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">                                <Link
                                    to="/products"
                                    className="bg-coffee-500 hover:bg-coffee-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
                                >
                                    Mua ngay
                                </Link>
                                <Link
                                    to="/about"
                                    className="bg-transparent border-2 border-cream-200 hover:bg-white hover:text-coffee-800 text-cream-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                                >
                                    Tìm hiểu thêm
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Coffee Bean Decoration */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-20">
                            <path d="M0,96L1200,0L1200,120L0,120Z" fill="rgb(254, 252, 232)"></path>
                        </svg>
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="py-16 bg-cream-50">
                    <div className="container mx-auto px-4">                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-4">
                                Sản phẩm nổi bật
                            </h2>
                            <p className="text-lg text-coffee-600 max-w-2xl mx-auto">
                                Khám phá bộ sưu tập cà phê rang mộc chất lượng cao từ các vùng đất tốt nhất
                            </p>
                        </div>

                        {/* Product Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
                                    <span className="text-6xl">☕</span>
                                </div>                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">Arabica</h3>
                                    <p className="text-coffee-600 mb-4">Cà phê Arabica cao cấp từ vùng cao Việt Nam</p>
                                    <Link
                                        to="/products?category=arabica"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-300 to-coffee-400 flex items-center justify-center">
                                    <span className="text-6xl">🌱</span>
                                </div>                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">Robusta</h3>
                                    <p className="text-coffee-600 mb-4">Cà phê Robusta mạnh mẽ từ Lâm Đồng</p>
                                    <Link
                                        to="/products?category=robusta"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-400 to-coffee-500 flex items-center justify-center">
                                    <span className="text-6xl">🔥</span>
                                </div>                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">Blend</h3>
                                    <p className="text-coffee-600 mb-4">Hỗn hợp cà phê được pha chế chuyên nghiệp</p>
                                    <Link
                                        to="/products?category=blend"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        Xem chi tiết →
                                    </Link>
                                </div>
                            </div>
                        </div>                        <div className="text-center">
                            <Link
                                to="/products"
                                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                            >
                                Xem tất cả sản phẩm
                            </Link>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-6">
                                    Về chúng tôi
                                </h2>
                                <p className="text-lg text-coffee-600 mb-6 leading-relaxed">
                                    Chúng tôi là những người đam mê cà phê, cam kết mang đến những hạt cà phê chất lượng cao nhất từ những vùng đất tốt nhất của Việt Nam.
                                </p>                                <p className="text-coffee-600 mb-8 leading-relaxed">
                                    Từ những vùng cao mù sương của Việt Nam đến tách cà phê của bạn, chúng tôi đảm bảo mỗi hạt cà phê đều kể một câu chuyện về đam mê, truyền thống và sự xuất sắc. Các phương pháp canh tác bền vững và mối quan hệ thương mại trực tiếp của chúng tôi đảm bảo chất lượng tốt nhất đồng thời hỗ trợ cộng đồng địa phương.
                                </p>
                                <Link
                                    to="/about"
                                    className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                                >
                                    Tìm hiểu thêm
                                </Link>
                            </div>                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">100%</div>
                                    <div className="text-coffee-600">Cà phê Việt Nam</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">50+</div>
                                    <div className="text-coffee-600">Giống cà phê</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">15+</div>
                                    <div className="text-coffee-600">Năm kinh nghiệm</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">1000+</div>
                                    <div className="text-coffee-600">Khách hàng hài lòng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-coffee-800 text-white">                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Sẵn sàng trải nghiệm cà phê Việt Nam cao cấp?
                        </h2>
                        <p className="text-xl text-cream-100 mb-8 max-w-2xl mx-auto">
                            Tham gia cùng hàng nghìn người yêu cà phê tin tưởng chúng tôi cho ly cà phê hàng ngày. Bắt đầu hành trình cà phê của bạn ngay hôm nay.
                        </p>
                        <Link
                            to="/products"
                            className="bg-coffee-500 hover:bg-coffee-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
                        >
                            Mua ngay
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
