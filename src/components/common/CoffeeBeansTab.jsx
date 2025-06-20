import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import SearchStats from './SearchStats';

const CoffeeBeansTab = ({ 
    products, 
    loading, 
    error, 
    searchTerm, 
    searchTime, 
    totalProducts, 
    onClearSearch,
    handleAddToCart,
    clearFilters 
}) => {
    return (
        <>
            {/* Coffee Beans Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-coffee-800 mb-4">
                    ☕ Cà phê hạt nguyên chất
                </h2>
                <p className="text-coffee-600 max-w-3xl mx-auto">
                    Khám phá bộ sưu tập hạt cà phê rang mộc chất lượng cao từ các vùng miền nổi tiếng Việt Nam. 
                    Từ Arabica Cầu Đất đến Robusta Lâm Đồng, mỗi loại hạt đều được chọn lọc và rang xay theo 
                    công thức truyền thống.
                </p>
            </div>

            {/* Search Stats */}
            {searchTerm?.trim() && (
                <div className="mb-6">
                    <SearchStats
                        searchTerm={searchTerm}
                        resultCount={totalProducts}
                        searchTime={searchTime}
                        onClearSearch={onClearSearch}
                        suggestions={[
                            "arabica cầu đất",
                            "robusta lâm đồng", 
                            "cà phê rang mộc",
                            "blend đặc biệt",
                            "typica kongo"
                        ]}
                    />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Có lỗi xảy ra
                    </h3>
                    <p className="text-coffee-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
                </div>
            )}

            {/* No Products Found */}
            {!loading && !error && products.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">☕</div>
                    <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                        Không tìm thấy sản phẩm cà phê hạt
                    </h3>
                    <p className="text-coffee-600 mb-4">
                        Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác
                    </p>
                    <button
                        onClick={clearFilters}
                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            searchTerm={searchTerm || ''}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}

            {/* Coffee Beans Info Section */}
            {!loading && !error && products.length > 0 && (
                <div className="mt-12 bg-coffee-50 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-coffee-800 mb-6 text-center">
                        Về hạt cà phê của chúng tôi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🌱</div>
                            <h4 className="font-semibold text-coffee-800 mb-2">Nguồn gốc rõ ràng</h4>
                            <p className="text-coffee-600 text-sm">
                                Tất cả hạt cà phê đều được truy xuất nguồn gốc từ các trang trại uy tín
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🔥</div>
                            <h4 className="font-semibold text-coffee-800 mb-2">Rang tươi hàng ngày</h4>
                            <p className="text-coffee-600 text-sm">
                                Rang xay theo đơn đặt hàng để đảm bảo độ tươi ngon tối đa
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">📦</div>
                            <h4 className="font-semibold text-coffee-800 mb-2">Đóng gói chuyên nghiệp</h4>
                            <p className="text-coffee-600 text-sm">
                                Bao bì chống oxy hóa giữ nguyên hương vị trong thời gian dài
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

CoffeeBeansTab.propTypes = {
    products: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,    error: PropTypes.string,
    searchTerm: PropTypes.string,
    searchTime: PropTypes.number,
    totalProducts: PropTypes.number.isRequired,
    onClearSearch: PropTypes.func.isRequired,
    handleAddToCart: PropTypes.func.isRequired,
    clearFilters: PropTypes.func.isRequired
};

export default CoffeeBeansTab;
