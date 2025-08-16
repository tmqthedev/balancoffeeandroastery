import React from 'react';
import PropTypes from 'prop-types';

const BeveragesTab = ({ searchTerm, onClearSearch }) => {
    // Grab Food ordering URL
    const GRAB_FOOD_URL = 'https://food.grab.com/vn/vi/restaurant/balan-coffee-roastery-delivery/5-C34UJ7M1PBBBET?';
    
    const handleOrderClick = () => {
        window.open(GRAB_FOOD_URL, '_blank', 'noopener,noreferrer');
    };

    const beverageCategories = [
        {
            name: 'Cà phê truyền thống',
            icon: '☕',
            items: [
                { name: 'Cà phê đen đá', price: '25,000đ', description: 'Cà phê rang mộc pha phin, đậm đà truyền thống' },
                { name: 'Cà phê sữa đá', price: '30,000đ', description: 'Cà phê đen kết hợp sữa đặc ngọt ngào' },
                { name: 'Cà phê nóng', price: '25,000đ', description: 'Cà phê phin nóng, thưởng thức từng giọt' },
                { name: 'Bạc xỉu', price: '35,000đ', description: 'Cà phê sữa đá phong cách Sài Gòn' }
            ]
        },
        {
            name: 'Cà phê hiện đại',
            icon: '🥤',
            items: [
                { name: 'Americano', price: '40,000đ', description: 'Espresso pha loãng, vị đậm nhẹ nhàng' },
                { name: 'Cappuccino', price: '45,000đ', description: 'Espresso với sữa nóng và foam mịn' },
                { name: 'Latte', price: '45,000đ', description: 'Espresso với nhiều sữa nóng, vị ngọt dịu' },
                { name: 'Mocha', price: '50,000đ', description: 'Kết hợp hoàn hảo giữa cà phê và chocolate' }
            ]
        },
        {
            name: 'Đồ uống đặc biệt',
            icon: '🌟',
            items: [
                { name: 'Cà phê trứng', price: '45,000đ', description: 'Đặc sản Hà Nội với lớp kem trứng béo ngậy' },
                { name: 'Cà phê dừa', price: '40,000đ', description: 'Cà phê kết hợp nước cốt dừa tươi mát' },
                { name: 'Cold Brew', price: '45,000đ', description: 'Cà phê pha lạnh trong 12 giờ, vị ngọt tự nhiên' },
                { name: 'Affogato', price: '55,000đ', description: 'Kem vanilla với shot espresso nóng' }
            ]
        },
        {
            name: 'Đồ uống khác',
            icon: '🧊',
            items: [
                { name: 'Trà đá', price: '15,000đ', description: 'Trà đen truyền thống thanh mát' },
                { name: 'Trà sữa', price: '35,000đ', description: 'Trà đen kết hợp sữa tươi ngọt ngào' },
                { name: 'Nước cam tươi', price: '30,000đ', description: 'Cam tươi vắt 100% không đường' },
                { name: 'Soda chanh', price: '25,000đ', description: 'Nước soda với chanh tươi giải khát' }
            ]
        }
    ];

    const filteredCategories = searchTerm?.trim() 
        ? beverageCategories.map(category => ({
            ...category,
            items: category.items.filter(item => 
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.items.length > 0)
        : beverageCategories;

    return (
        <>
            {/* Beverages Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-primary mb-4">
                    🥤 Menu thức uống
                </h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
                    Thưởng thức đa dạng các loại thức uống từ cà phê truyền thống Việt Nam đến các món 
                    hiện đại kiểu Âu. Mỗi ly đều được pha chế tỉ mỉ với nguyên liệu chất lượng cao.
                </p>
            </div>

            {/* Search Results */}
            {searchTerm?.trim() && (
                <div className="mb-6 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-xl p-4 border border-brand-primary/20">
                    <div className="flex items-center justify-between">
                        <p className="text-brand-primary font-medium">
                            🔍 Tìm thấy <strong>{filteredCategories.reduce((total, cat) => total + cat.items.length, 0)}</strong> món cho "{searchTerm}"
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
            {searchTerm?.trim() && filteredCategories.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-brand-primary mb-2">
                        Không tìm thấy thức uống phù hợp
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Hãy thử tìm kiếm với từ khóa khác như "cà phê", "trà", "latte"...
                    </p>
                    <button
                        onClick={onClearSearch}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        Xem tất cả menu
                    </button>
                </div>
            )}

            {/* Beverages Menu */}
            {filteredCategories.length > 0 && (                <div className="space-y-8">
                    {filteredCategories.map((category) => (
                        <div key={category.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-brand-primary/10 px-6 py-4 border-b border-brand-primary/20">
                                <h3 className="text-xl font-bold text-brand-primary flex items-center">
                                    <span className="text-2xl mr-3">{category.icon}</span>
                                    {category.name}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.items.map((item) => (
                                        <div key={`${category.name}-${item.name}`} className="flex justify-between items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors hover:border-brand-primary/30 hover:shadow-sm">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-brand-primary mb-1">
                                                    {searchTerm ? (
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: item.name.replace(
                                                                new RegExp(`(${searchTerm})`, 'gi'),
                                                                '<mark class="bg-brand-secondary text-brand-primary px-1 rounded">$1</mark>'
                                                            )
                                                        }} />
                                                    ) : item.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {searchTerm ? (
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: item.description.replace(
                                                                new RegExp(`(${searchTerm})`, 'gi'),
                                                                '<mark class="bg-brand-secondary text-brand-primary px-1 rounded">$1</mark>'
                                                            )
                                                        }} />
                                                    ) : item.description}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-brand-primary text-lg">
                                                    {item.price}
                                                </div>
                                                <button 
                                                    onClick={handleOrderClick}
                                                    className="mt-2 px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white text-sm rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                                >
                                                    Đặt món
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contact for Custom Orders */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-brand-secondary/10 rounded-xl p-6 text-center border border-brand-primary/20">
                <h3 className="text-lg font-semibold text-brand-primary mb-2">
                    Đặt món ngay qua Grab Food
                </h3>
                <p className="text-gray-700 mb-4">
                    Giao hàng tận nơi với đầy đủ menu thức uống và nhiều ưu đãi hấp dẫn
                </p>
                <button 
                    onClick={handleOrderClick}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg inline-flex items-center space-x-2"
                >
                    <span>Đặt món qua Grab</span>
                </button>
            </div>
        </>
    );
};

BeveragesTab.propTypes = {
    searchTerm: PropTypes.string,
    onClearSearch: PropTypes.func.isRequired
};

export default BeveragesTab;
