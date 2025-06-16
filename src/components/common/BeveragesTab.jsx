import React from 'react';
import PropTypes from 'prop-types';

const BeveragesTab = ({ searchTerm, onClearSearch }) => {
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
                <h2 className="text-3xl font-bold text-coffee-800 mb-4">
                    🥤 Menu thức uống
                </h2>
                <p className="text-coffee-600 max-w-3xl mx-auto">
                    Thưởng thức đa dạng các loại thức uống từ cà phê truyền thống Việt Nam đến các món 
                    hiện đại kiểu Âu. Mỗi ly đều được pha chế tỉ mỉ với nguyên liệu chất lượng cao.
                </p>
            </div>

            {/* Search Results */}
            {searchTerm?.trim() && (
                <div className="mb-6 bg-coffee-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <p className="text-coffee-700">
                            🔍 Tìm thấy <strong>{filteredCategories.reduce((total, cat) => total + cat.items.length, 0)}</strong> món cho "{searchTerm}"
                        </p>
                        <button
                            onClick={onClearSearch}
                            className="text-sm px-3 py-1 bg-coffee-200 hover:bg-coffee-300 rounded transition-colors"
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
                    <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                        Không tìm thấy thức uống phù hợp
                    </h3>
                    <p className="text-coffee-600 mb-4">
                        Hãy thử tìm kiếm với từ khóa khác như "cà phê", "trà", "latte"...
                    </p>
                    <button
                        onClick={onClearSearch}
                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Xem tất cả menu
                    </button>
                </div>
            )}

            {/* Beverages Menu */}
            {filteredCategories.length > 0 && (                <div className="space-y-8">
                    {filteredCategories.map((category) => (
                        <div key={category.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="bg-coffee-100 px-6 py-4 border-b border-coffee-200">
                                <h3 className="text-xl font-bold text-coffee-800 flex items-center">
                                    <span className="text-2xl mr-3">{category.icon}</span>
                                    {category.name}
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.items.map((item) => (
                                        <div key={`${category.name}-${item.name}`} className="flex justify-between items-start p-4 border border-coffee-100 rounded-lg hover:bg-coffee-50 transition-colors">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-coffee-800 mb-1">
                                                    {searchTerm ? (
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: item.name.replace(
                                                                new RegExp(`(${searchTerm})`, 'gi'),
                                                                '<mark class="bg-yellow-200 font-semibold px-1 rounded">$1</mark>'
                                                            )
                                                        }} />
                                                    ) : item.name}
                                                </h4>
                                                <p className="text-sm text-coffee-600 mb-2">
                                                    {searchTerm ? (
                                                        <span dangerouslySetInnerHTML={{
                                                            __html: item.description.replace(
                                                                new RegExp(`(${searchTerm})`, 'gi'),
                                                                '<mark class="bg-yellow-200 font-semibold px-1 rounded">$1</mark>'
                                                            )
                                                        }} />
                                                    ) : item.description}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-coffee-800 text-lg">
                                                    {item.price}
                                                </div>
                                                <button className="mt-2 px-3 py-1 bg-coffee-600 hover:bg-coffee-700 text-white text-sm rounded transition-colors">
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

            {/* Special Offers */}
            <div className="mt-12 bg-gradient-to-r from-coffee-600 to-coffee-700 rounded-lg p-8 text-white">
                <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4">🎉 Ưu đãi đặc biệt</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white bg-opacity-10 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Happy Hour</h4>
                            <p className="text-sm text-cream-200">
                                Giảm 20% tất cả đồ uống từ 14:00 - 16:00 hàng ngày
                            </p>
                        </div>
                        <div className="bg-white bg-opacity-10 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Combo tiết kiệm</h4>
                            <p className="text-sm text-cream-200">
                                Mua 2 ly cà phê bất kỳ, tặng 1 bánh ngọt
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact for Custom Orders */}
            <div className="mt-8 bg-cream-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                    Cần đặt món cho sự kiện lớn?
                </h3>
                <p className="text-coffee-600 mb-4">
                    Liên hệ với chúng tôi để được tư vấn menu và giá ưu đãi cho đơn hàng lớn
                </p>
                <button className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors">
                    📞 Liên hệ ngay
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
