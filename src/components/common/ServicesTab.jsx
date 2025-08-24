import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ServicesTab = ({ searchTerm, onClearSearch }) => {
    const [selectedService, setSelectedService] = useState(null);

    const services = [
        {
            id: 'coffee-supply',
            name: 'Cung cấp cà phê',
            icon: '☕',
            shortDesc: 'Cung cấp cà phê chất lượng cao, rang mộc tại Lâm Đồng',
            description: 'Chúng tôi cung cấp các loại hạt cà phê rang mộc cao cấp từ những vùng trồng nổi tiếng, đảm bảo chất lượng và hương vị tuyệt hảo cho quán cà phê của bạn.',
            features: [
                'Cà phê Arabica Cầu Đất Lâm Đồng',
                'Cà phê Robusta rang mộc truyền thống',
                'Blends độc quyền theo yêu cầu',
                'Đóng gói chân không bảo quản',
                'Giao hàng định kỳ theo lịch',
                'Tư vấn lựa chọn loại cà phê phù hợp'
            ],
            price: '160,000đ/kg',
            duration: 'Đơn hàng tối thiểu 10kg'
        },
        {
            id: 'equipment-materials',
            name: 'Cung ứng nguyên vật liệu, thiết bị pha chế',
            icon: '⚙️',
            shortDesc: 'Cung cấp thiết bị pha chế và nguyên vật liệu chuyên nghiệp',
            description: 'Một trong những nhà cung cấp hàng đầu các thiết bị pha chế cà phê chuyên nghiệp và nguyên vật liệu chất lượng cao cho quán cà phê.',
            features: [
                'Máy espresso các thương hiệu nổi tiếng',
                'Máy xay cà phê công nghiệp',
                'Dụng cụ pha chế V60, French Press, Chemex',
                'Cốc, ly, dĩa chuyên dụng cao cấp',
                'Nguyên liệu: sữa, syrup, topping',
                'Bảo hành và bảo trì thiết bị'
            ],
            price: '65,000,000đ',
            duration: 'Combo thiết bị chuyên nghiệp'
        },
        {
            id: 'product-rd',
            name: 'R&D Sản phẩm',
            icon: '🔬',
            shortDesc: 'Nghiên cứu và phát triển sản phẩm cà phê độc đáo',
            description: 'Dịch vụ nghiên cứu và phát triển sản phẩm cà phê mới, tạo ra signature drinks độc quyền cho thương hiệu của bạn.',
            features: [
                'Phát triển blend cà phê độc quyền',
                'Tạo ra signature drinks mới',
                'Nghiên cứu xu hướng thị trường',
                'Test và tối ưu hóa công thức',
                'Tư vấn menu theo mùa',
                'Đào tạo cách pha chế sản phẩm mới'
            ],
            price: '25,000,000đ',
            duration: '5-7 sản phẩm độc quyền'
        },
        {
            id: 'store-operation',
            name: 'Vận hành cửa hàng',
            icon: '🏪',
            shortDesc: 'Tư vấn và hỗ trợ vận hành cửa hàng cà phê hiệu quả',
            description: 'Dịch vụ tư vấn và hỗ trợ vận hành cửa hàng cà phê, từ quy trình phục vụ đến quản lý hiệu quả.',
            features: [
                'Thiết lập quy trình vận hành chuẩn',
                'Hệ thống quản lý bán hàng (POS)',
                'Quy trình kiểm soát chất lượng',
                'Quản lý kho và nhập xuất',
                'Tối ưu hóa chi phí vận hành',
                'Hỗ trợ marketing và bán hàng'
            ],
            price: '35,000,000đ',
            duration: 'Hỗ trợ toàn diện 6 tháng'
        },
        {
            id: 'owner-training',
            name: 'Đào tạo chủ quán',
            icon: '👨‍💼',
            shortDesc: 'Đào tạo kỹ năng quản lý và điều hành cho chủ quán cà phê',
            description: 'Chương trình đào tạo chuyên sâu dành cho chủ quán cà phê về quản lý, kinh doanh và phát triển thương hiệu.',
            features: [
                'Quản lý tài chính và chi phí',
                'Xây dựng thương hiệu cá nhân',
                'Chiến lược marketing hiệu quả',
                'Quản lý nhân sự và đội ngũ',
                'Phân tích và tối ưu doanh thu',
                'Kỹ năng lãnh đạo và giao tiếp'
            ],
            price: '15,000,000đ',
            duration: '5 ngày (40 giờ)'
        },
        {
            id: 'management-training',
            name: 'Đào tạo quản lý',
            icon: '📋',
            shortDesc: 'Đào tạo kỹ năng quản lý cho trưởng ca và quản lý cửa hàng',
            description: 'Chương trình đào tạo quản lý chuyên nghiệp cho các vị trí trưởng ca, phó quản lý và quản lý cửa hàng cà phê.',
            features: [
                'Quản lý ca làm việc hiệu quả',
                'Kiểm soát chất lượng sản phẩm',
                'Xử lý tình huống khó khăn',
                'Quản lý nhân viên và phân ca',
                'Báo cáo doanh thu và tồn kho',
                'Kỹ năng giao tiếp với khách hàng'
            ],
            price: '7,500,000đ/người',
            duration: '3 ngày (24 giờ)'
        },
        {
            id: 'staff-training',
            name: 'Training nhân sự',
            icon: '👥',
            shortDesc: 'Đào tạo nhân viên phục vụ và kỹ năng bán hàng',
            description: 'Chương trình đào tạo toàn diện cho nhân viên phục vụ, từ kỹ năng giao tiếp đến kỹ thuật bán hàng chuyên nghiệp.',
            features: [
                'Kỹ năng giao tiếp và phục vụ khách hàng',
                'Hiểu biết về sản phẩm cà phê',
                'Kỹ thuật bán hàng và up-sell',
                'Xử lý khiếu nại và tình huống khó khăn',
                'Quy trình vệ sinh và an toàn thực phẩm',
                'Làm việc nhóm và tinh thần teamwork'
            ],
            price: '2,500,000đ/người',
            duration: '2 ngày (16 giờ)'
        },
        {
            id: 'barista-training',
            name: 'Đào tạo Barista',
            icon: '☕️',
            shortDesc: 'Đào tạo Barista chuyên nghiệp từ cơ bản đến nâng cao',
            description: 'Khóa học Barista chuyên nghiệp với đầy đủ kỹ thuật pha chế, latte art và kiến thức chuyên sâu về cà phê.',
            features: [
                'Kỹ thuật pha espresso chuẩn Italia',
                'Nghệ thuật trang trí Latte Art từ cơ bản đến nâng cao',
                'Pha chế các loại coffee specialty',
                'Hiểu biết sâu về hạt cà phê và origin',
                'Vận hành và bảo trì máy espresso',
                'Tham gia thi đấu và chứng chỉ quốc tế'
            ],
            price: '12,000,000đ/người',
            duration: '10 ngày (80 giờ)'
        }
    ];

    const filteredServices = searchTerm?.trim() 
        ? services.filter(service => 
            service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : services;

    const highlightText = (text, term) => {
        if (!term) return text;
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark class="bg-brand-secondary/40 text-gray-900 font-bold px-1 rounded">$1</mark>');
    };

    return (
        <>
            {/* Services Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-primary mb-4">
                    🏪 Dịch vụ chuyên nghiệp
                </h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                    Chúng tôi cung cấp các dịch vụ tư vấn và hỗ trợ toàn diện cho việc khởi nghiệp 
                    và phát triển mô hình kinh doanh cà phê. Từ setup quán mới đến đào tạo nhân viên chuyên nghiệp.
                </p>
            </div>

            {/* Search Results */}
            {searchTerm?.trim() && (
                <div className="mb-6 bg-gradient-to-r from-brand-secondary/10 to-brand-secondary/5 rounded-xl p-4 border border-brand-secondary/20 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-brand-primary font-medium">
                            🔍 Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ cho "{searchTerm}"
                        </p>
                        <button
                            onClick={onClearSearch}
                            className="text-sm px-4 py-2 bg-white/80 hover:bg-brand-primary hover:text-brand-white rounded-lg transition-all duration-200 border border-brand-primary/30 shadow-sm hover:shadow-md"
                        >
                            ✕ Xóa tìm kiếm
                        </button>
                    </div>
                </div>
            )}

            {/* No Results */}
            {searchTerm?.trim() && filteredServices.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-brand-primary mb-2">
                        Không tìm thấy dịch vụ phù hợp
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Hãy thử tìm kiếm với từ khóa khác như "setup", "training", "tư vấn"...
                    </p>
                    <button
                        onClick={onClearSearch}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        Xem tất cả dịch vụ
                    </button>
                </div>
            )}

            {/* Services Grid */}
            {filteredServices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {filteredServices.map((service) => (
                        <div key={service.id} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-brand-primary/50 hover:-translate-y-1 transition-all duration-300 group">
                            {/* Service Header */}
                            <div className="flex items-center mb-4">
                                <div className="p-3 bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 rounded-xl mr-4 group-hover:from-brand-primary/30 group-hover:to-brand-primary/20 transition-all duration-300">
                                    <span className="text-2xl">{service.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
                                        {searchTerm ? (
                                            <span dangerouslySetInnerHTML={{
                                                __html: highlightText(service.name, searchTerm)
                                            }} />
                                        ) : service.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Short Description */}
                            <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">
                                {searchTerm ? (
                                    <span dangerouslySetInnerHTML={{
                                        __html: highlightText(service.shortDesc, searchTerm)
                                    }} />
                                ) : service.shortDesc}
                            </p>

                            {/* Key Features */}
                            <div className="mb-6">
                                <ul className="text-sm text-gray-700 space-y-2">
                                    {service.features.slice(0, 2).map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <div className="flex-shrink-0 w-4 h-4 bg-brand-primary rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-white text-xs font-bold">✓</span>
                                            </div>
                                            <span className="leading-relaxed font-medium">
                                                {searchTerm ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: highlightText(feature, searchTerm)
                                                    }} />
                                                ) : feature}
                                            </span>
                                        </li>
                                    ))}
                                    {service.features.length > 2 && (
                                        <li className="text-brand-primary text-xs font-bold ml-7">
                                            +{service.features.length - 2} dịch vụ khác...
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Price and Buttons */}
                            <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-brand-primary">
                                        {service.price}
                                    </span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                                        {service.duration}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => setSelectedService(service)}
                                    className="px-6 py-2 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-white text-sm font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-brand-primary to-brand-primary/90 p-6 text-white relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-secondary rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-secondary rounded-full translate-y-12 -translate-x-12"></div>
                            </div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-4xl mr-4 filter drop-shadow-md">{selectedService.icon}</span>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-1">{selectedService.name}</h3>
                                        <p className="text-brand-white/80 text-sm">Dịch vụ chuyên nghiệp - Uy tín hàng đầu</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="text-brand-white/80 hover:text-brand-white hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            {/* Description */}
                            <div className="bg-gradient-to-r from-brand-secondary/15 to-brand-secondary/10 rounded-xl p-6 mb-6 border-2 border-brand-secondary/30">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                                    <span className="w-3 h-3 bg-brand-secondary rounded-full mr-3"></span>
                                    Mô tả dịch vụ
                                </h4>
                                <p className="text-gray-800 leading-relaxed font-medium">{selectedService.description}</p>
                            </div>

                            {/* Features */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                                    <span className="w-3 h-3 bg-brand-secondary rounded-full mr-3"></span>
                                    Dịch vụ chi tiết
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {selectedService.features.map((feature, index) => (
                                        <div key={feature} className="flex items-start bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-brand-primary/40 hover:shadow-sm transition-all duration-200">
                                            <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-brand-primary to-brand-primary/80 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-white text-xs font-bold">{index + 1}</span>
                                            </div>
                                            <span className="text-gray-800 text-sm leading-relaxed font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Single Price Package */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center text-lg">
                                    <span className="w-3 h-3 bg-brand-secondary rounded-full mr-3"></span>
                                    Thông tin giá
                                </h4>
                                <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-2 border-brand-primary/30 rounded-xl p-8 text-center relative">
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-brand-secondary text-white text-sm font-bold px-4 py-1 rounded-full">
                                            GIÁ TIÊU CHUẨN
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <div className="mb-4">
                                            <span className="text-3xl font-bold text-brand-primary">{selectedService.price}</span>
                                        </div>
                                        <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-200">
                                            <span>Với</span> {selectedService.duration}
                                        </div>
                                        <button className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                                            Đặt dịch vụ ngay
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-gray-200">
                                <button className="flex-1 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-bold">
                                    📅 Đặt lịch tư vấn miễn phí
                                </button>
                                <button className="flex-1 bg-gradient-to-r from-brand-secondary to-brand-secondary/90 hover:from-brand-secondary/90 hover:to-brand-secondary text-white py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg font-bold">
                                    💬 Chat với chuyên gia
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="mt-6 bg-gray-100 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-center space-x-8 text-sm text-gray-700">
                                    <div className="flex items-center">
                                        <span className="text-brand-secondary mr-2">🛡️</span>
                                        <span className="font-bold">Bảo hành dịch vụ</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-brand-secondary mr-2">⚡</span>
                                        <span className="font-bold">Hỗ trợ nhanh chóng</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-brand-secondary mr-2">💯</span>
                                        <span className="font-bold">Cam kết chất lượng</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Why Choose Us */}
            <div className="bg-gradient-to-r from-brand-primary to-brand-primary/90 rounded-xl p-8 text-white shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-center">Tại sao chọn dịch vụ của chúng tôi?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <h4 className="font-semibold mb-2">Kinh nghiệm 10+ năm</h4>
                        <p className="text-brand-white/80 text-sm">
                            Đội ngũ chuyên gia giàu kinh nghiệm trong ngành cà phê
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-3">🤝</div>
                        <h4 className="font-semibold mb-2">Hỗ trợ 24/7</h4>
                        <p className="text-brand-white/80 text-sm">
                            Đồng hành và hỗ trợ khách hàng mọi lúc mọi nơi
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <h4 className="font-semibold mb-2">Cam kết chất lượng</h4>
                        <p className="text-brand-white/80 text-sm">
                            Đảm bảo kết quả và hoàn tiền nếu không hài lòng
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 border border-brand-secondary/20 rounded-xl p-6 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                    Sẵn sàng bắt đầu dự án cà phê của bạn?
                </h3>
                <p className="text-gray-700 mb-4">
                    Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                        📞 Gọi ngay: 1900 xxxx
                    </button>
                    <button className="bg-white hover:bg-brand-secondary/10 text-brand-primary border border-brand-primary/30 px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
                        💬 Chat với chuyên gia
                    </button>
                </div>
            </div>
        </>
    );
};

ServicesTab.propTypes = {
    searchTerm: PropTypes.string,
    onClearSearch: PropTypes.func.isRequired
};

export default ServicesTab;
