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
            name: 'Robusta',
            items: [
                { name: 'Cà phê đen', price: '30,000đ' },
                { name: 'Cà phê sữa', price: '35,000đ' },
                { name: 'Bạc xỉu', price: '40,000đ' },
                { name: 'Cà phê muối', price: '45,000đ' },
                { name: 'Cà phê dừa', price: '50,000đ' }
            ]
        },
        {
            name: 'Arabica',
            items: [
                { name: 'Espresso Single', price: '35,000đ' },
                { name: 'Espresso Double', price: '45,000đ' },
                { name: 'Americano', price: '40,000đ' },
                { name: 'Cappuccino', price: '50,000đ' },
                { name: 'Latte', price: '50,000đ' },
                { name: 'Caramel Machiatto', price: '55,000đ' },
                { name: 'Cafe Mocha', price: '55,000đ' },
                { name: 'Cold Brew ( + Orange/ Pineapple/ Apple)', price: '50,000đ' }
            ]
        },
        {
            name: 'Matcha',
            items: [
                { name: 'Matcha Latte', price: '50,000đ' },
                { name: 'Matcha Iceblended', price: '55,000đ' },
                { name: 'Matcha Latte ( + Mango/ Strawberry)', price: '60,000đ' },
                { name: 'Coconut Matcha', price: '60,000đ' },
                { name: 'Chocolate Matcha Latte', price: '60,000đ' },
                { name: 'Matcha Espresso', price: '60,000đ' },
                { name: 'Earlgrey Matcha', price: '60,000đ' },
                { name: 'Matcha Tiramisu', price: '70,000đ' }
            ]
        },
        {
            name: 'Chocolate',
            items: [
                { name: 'Chocolate Latte', price: '50,000đ' },
                { name: 'Chocolate Iceblended', price: '55,000đ' },
                { name: 'Coconut Chocolate', price: '60,000đ' },
                { name: 'Cookies & Cream', price: '60,000đ' },
                { name: 'Dark Chocolate', price: '60,000đ' },
                { name: 'Tiramisu Latte', price: '70,000đ' }
            ]
        },
        {
            name: 'Smoothies',
            items: [
                { name: 'Xoài', price: '50,000đ' },
                { name: 'Xoài Chanh dây', price: '50,000đ' },
                { name: 'Xoài Ớt', price: '50,000đ' },
                { name: 'Xoài Thơm', price: '50,000đ' },
                { name: 'Dừa Dứa', price: '60,000đ' }
            ]
        },
        {
            name: 'Fruit Tea',
            items: [
                { name: 'Trà Xoài', price: '50,000đ' },
                { name: 'Trà Vải', price: '50,000đ' },
                { name: 'Trà Lê Hoa Cúc', price: '50,000đ' },
                { name: 'Trà Cam Đào', price: '50,000đ' },
                { name: 'Trà Cam Bưởi', price: '50,000đ' },
                { name: 'Lipton Chanh', price: '50,000đ' },
                { name: 'Earlgrey Chanh', price: '50,000đ' }
            ]
        },
        {
            name: 'Juices',
            items: [
                { name: 'Táo', price: '40,000đ' },
                { name: 'Cam', price: '40,000đ' },
                { name: 'Thơm', price: '40,000đ' },            
                { name: 'Dưa Hấu', price: '40,000đ' },
                { name: 'Dừa', price: '40,000đ' },
                { name: 'Chanh Mật ong', price: '40,000đ' },
                { name: 'Mix 2 loại', price: '45,000đ' }
            ]
        },
        {
            name: 'Yogurt',
            items: [
                { name: 'Yogurt Dâu', price: '55,000đ' },
                { name: 'Yogurt Đào', price: '55,000đ' },
                { name: 'Yogurt Xoài', price: '55,000đ' },
                { name: 'Yogurt Đá', price: '45,000đ' },
                { name: 'Yogurt Trái Cây', price: '60,000đ' }
            ]
        },
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {category.items.map((item) => (
                                        <div key={`${category.name}-${item.name}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-brand-primary/40 transition-all duration-300 group">
                                            {/* Tên món */}
                                            <h4 className="font-semibold text-brand-primary text-base mb-3 group-hover:text-brand-primary/80 transition-colors leading-snug">
                                                {searchTerm ? (
                                                    <span dangerouslySetInnerHTML={{
                                                        __html: item.name.replace(
                                                            new RegExp(`(${searchTerm})`, 'gi'),
                                                            '<mark class="bg-brand-secondary text-brand-primary px-1 rounded">$1</mark>'
                                                        )
                                                    }} />
                                                ) : item.name}
                                            </h4>
                                            
                                            {/* Giá */}
                                            <div className="flex items-center justify-between">
                                                <div className="text-xl font-bold text-brand-primary">
                                                    {item.price}
                                                </div>
                                                
                                                {/* Nút đặt món */}
                                                <button 
                                                    onClick={handleOrderClick}
                                                    className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
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
