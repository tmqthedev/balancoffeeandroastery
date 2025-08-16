import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ServicesTab = ({ searchTerm, onClearSearch }) => {
    const [selectedService, setSelectedService] = useState(null);

    const services = [
        {
            id: 'cafe-setup',
            name: 'Setup quán cà phê',
            icon: '🏪',
            shortDesc: 'Tư vấn toàn diện từ A-Z việc mở quán cà phê',
            description: 'Dịch vụ tư vấn và thiết kế quán cà phê chuyên nghiệp từ khâu lên ý tưởng đến vận hành thực tế.',
            features: [
                'Tư vấn địa điểm và không gian',
                'Thiết kế nội thất và bố trí',
                'Lựa chọn thiết bị máy móc',
                'Xây dựng menu và định giá',
                'Đào tạo quy trình vận hành',
                'Hỗ trợ marketing khai trương'
            ],
            packages: [
                { name: 'Gói cơ bản', price: '15,000,000đ', duration: '2-3 tuần' },
                { name: 'Gói tiêu chuẩn', price: '25,000,000đ', duration: '3-4 tuần' },
                { name: 'Gói cao cấp', price: '40,000,000đ', duration: '4-6 tuần' }
            ]
        },
        {
            id: 'staff-training',
            name: 'Training nhân viên',
            icon: '👥',
            shortDesc: 'Đào tạo barista và nhân viên quán cà phê chuyên nghiệp',
            description: 'Chương trình đào tạo toàn diện cho nhân viên pha chế và phục vụ quán cà phê.',
            features: [
                'Kỹ thuật pha chế cà phê cơ bản',
                'Sử dụng máy espresso chuyên nghiệp',
                'Nghệ thuật trang trí Latte Art',
                'Kỹ năng phục vụ khách hàng',
                'Quy trình vệ sinh và bảo quản',
                'Quản lý kho và tồn kho'
            ],
            packages: [
                { name: 'Khóa cơ bản', price: '2,500,000đ/người', duration: '3 ngày' },
                { name: 'Khóa nâng cao', price: '4,500,000đ/người', duration: '5 ngày' },
                { name: 'Khóa chuyên nghiệp', price: '7,500,000đ/người', duration: '10 ngày' }
            ]
        },
        {
            id: 'business-consulting',
            name: 'Tư vấn kinh doanh',
            icon: '📊',
            shortDesc: 'Tư vấn chiến lược kinh doanh và marketing quán cà phê',
            description: 'Dịch vụ tư vấn chiến lược để phát triển và mở rộng mô hình kinh doanh cà phê.',
            features: [
                'Phân tích thị trường và đối thủ',
                'Xây dựng kế hoạch kinh doanh',
                'Chiến lược marketing online/offline',
                'Tối ưu hóa chi phí vận hành',
                'Phát triển thương hiệu',
                'Kế hoạch mở rộng chuỗi'
            ],
            packages: [
                { name: 'Tư vấn cơ bản', price: '5,000,000đ', duration: '1 tuần' },
                { name: 'Tư vấn toàn diện', price: '12,000,000đ', duration: '3 tuần' },
                { name: 'Đồng hành dài hạn', price: '25,000,000đ', duration: '3 tháng' }
            ]
        },
        {
            id: 'equipment-supply',
            name: 'Cung cấp thiết bị',
            icon: '⚙️',
            shortDesc: 'Cung cấp máy móc và thiết bị quán cà phê chuyên nghiệp',
            description: 'Phân phối các loại máy móc, thiết bị chuyên dụng cho quán cà phê với giá tốt nhất.',
            features: [
                'Máy espresso các hãng nổi tiếng',
                'Máy xay cà phê chuyên nghiệp',
                'Thiết bị pha chế đa dạng',
                'Đồ dùng phục vụ cao cấp',
                'Bảo hành và bảo trì định kỳ',
                'Đào tạo sử dụng thiết bị'
            ],
            packages: [
                { name: 'Combo khởi nghiệp', price: '45,000,000đ', duration: 'Giao ngay' },
                { name: 'Combo tiêu chuẩn', price: '85,000,000đ', duration: '1-2 tuần' },
                { name: 'Combo cao cấp', price: '150,000,000đ', duration: '2-3 tuần' }
            ]
        },
        {
            id: 'franchise',
            name: 'Nhượng quyền thương hiệu',
            icon: '🤝',
            shortDesc: 'Cơ hội nhượng quyền mở quán cà phê Balan Coffee',
            description: 'Chương trình nhượng quyền thương hiệu Balan Coffee với hỗ trợ toàn diện.',
            features: [
                'Sử dụng thương hiệu Balan Coffee',
                'Được cung cấp nguyên liệu độc quyền',
                'Hỗ trợ thiết kế và setup',
                'Đào tạo vận hành chuyên nghiệp',
                'Marketing và quảng bá thương hiệu',
                'Hỗ trợ kỹ thuật liên tục'
            ],
            packages: [
                { name: 'Nhượng quyền cơ bản', price: '200,000,000đ', duration: 'Hợp đồng 5 năm' },
                { name: 'Nhượng quyền cao cấp', price: '350,000,000đ', duration: 'Hợp đồng 10 năm' },
                { name: 'Nhượng quyền thành phố', price: 'Thỏa thuận', duration: 'Độc quyền khu vực' }
            ]
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
        return text.replace(regex, '<mark class="bg-yellow-200 font-semibold px-1 rounded">$1</mark>');
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
                <div className="mb-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-xl p-4 border border-brand-primary/20">
                    <div className="flex items-center justify-between">
                        <p className="text-brand-primary font-medium">
                            🔍 Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ cho "{searchTerm}"
                        </p>
                        <button
                            onClick={onClearSearch}
                            className="text-sm px-3 py-2 bg-white/70 hover:bg-brand-primary hover:text-brand-white rounded-lg transition-all duration-200 border border-brand-primary/30"
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {filteredServices.map((service) => (
                        <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start mb-4">
                                    <span className="text-4xl mr-4">{service.icon}</span>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-primary mb-2">
                                            {searchTerm ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: highlightText(service.name, searchTerm)
                                                }} />
                                            ) : service.name}
                                        </h3>
                                        <p className="text-brand-primary/70 mb-4">
                                            {searchTerm ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: highlightText(service.description, searchTerm)
                                                }} />
                                            ) : service.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-brand-primary mb-2">Dịch vụ bao gồm:</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {service.features.slice(0, 3).map((feature) => (
                                            <li key={feature} className="flex items-center">
                                                <span className="text-brand-secondary mr-2">✓</span>
                                                {searchTerm ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: highlightText(feature, searchTerm)
                                                    }} />
                                                ) : feature}
                                            </li>
                                        ))}
                                        {service.features.length > 3 && (
                                            <li className="text-gray-500 text-xs">
                                                +{service.features.length - 3} dịch vụ khác...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Giá từ:</div>
                                    <div className="text-2xl font-bold text-brand-primary">
                                        {service.packages[0].price}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setSelectedService(service)}
                                        className="flex-1 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                    >
                                        Xem chi tiết
                                    </button>
                                    <button className="bg-gray-100 hover:bg-brand-primary hover:text-brand-white text-brand-primary py-2 px-4 rounded-lg transition-all duration-200 border border-brand-primary/20">
                                        📞 Liên hệ
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Service Detail Modal */}
            {selectedService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-coffee-800 flex items-center">
                                    <span className="text-3xl mr-3">{selectedService.icon}</span>
                                    {selectedService.name}
                                </h3>
                                <button
                                    onClick={() => setSelectedService(null)}
                                    className="text-coffee-500 hover:text-coffee-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-coffee-600 mb-6">{selectedService.description}</p>

                            <div className="mb-6">
                                <h4 className="font-semibold text-coffee-800 mb-3">Dịch vụ chi tiết:</h4>                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {selectedService.features.map((feature) => (
                                        <div key={feature} className="flex items-center text-coffee-600">
                                            <span className="text-green-500 mr-2">✓</span>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-semibold text-coffee-800 mb-3">Gói dịch vụ:</h4>                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedService.packages.map((pkg) => (
                                        <div key={pkg.name} className="border border-coffee-200 rounded-lg p-4">
                                            <h5 className="font-semibold text-coffee-800 mb-2">{pkg.name}</h5>
                                            <div className="text-xl font-bold text-coffee-600 mb-1">{pkg.price}</div>
                                            <div className="text-sm text-coffee-500">{pkg.duration}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button className="bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
                                    Đặt lịch tư vấn
                                </button>
                                <button className="bg-gray-100 hover:bg-brand-primary hover:text-brand-white text-brand-primary py-3 px-6 rounded-xl transition-all duration-200 border border-brand-primary/20">
                                    Tải brochure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Why Choose Us */}
            <div className="bg-gradient-to-r from-coffee-800 to-coffee-600 rounded-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-6 text-center">Tại sao chọn dịch vụ của chúng tôi?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <h4 className="font-semibold mb-2">Kinh nghiệm 10+ năm</h4>
                        <p className="text-cream-200 text-sm">
                            Đội ngũ chuyên gia giàu kinh nghiệm trong ngành cà phê
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-3">🤝</div>
                        <h4 className="font-semibold mb-2">Hỗ trợ 24/7</h4>
                        <p className="text-cream-200 text-sm">
                            Đồng hành và hỗ trợ khách hàng mọi lúc mọi nơi
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl mb-3">✅</div>
                        <h4 className="font-semibold mb-2">Cam kết chất lượng</h4>
                        <p className="text-cream-200 text-sm">
                            Đảm bảo kết quả và hoàn tiền nếu không hài lòng
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-8 bg-cream-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                    Sẵn sàng bắt đầu dự án cà phê của bạn?
                </h3>
                <p className="text-coffee-600 mb-4">
                    Liên hệ ngay để được tư vấn miễn phí và nhận báo giá chi tiết
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors">
                        📞 Gọi ngay: 1900 xxxx
                    </button>
                    <button className="bg-white hover:bg-coffee-50 text-coffee-800 border border-coffee-300 px-6 py-2 rounded-lg transition-colors">
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
