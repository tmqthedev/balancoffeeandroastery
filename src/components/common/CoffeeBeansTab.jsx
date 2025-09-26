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
    clearFilters 
}) => {
    return (
        <>
            {/* Coffee Beans Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-brand-primary mb-4">
                    ☕ Cà phê hạt nguyên chất
                </h2>
                <p className="text-gray-700 max-w-3xl mx-auto">
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
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-white px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && !error && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product._id || product.id}
                            product={product}
                            searchTerm={searchTerm || ''}
                        />
                    ))}
                </div>
            )}

            {/* Coffee Beans Info Section */}
            {!loading && !error && products.length > 0 && (
                <div className="mt-12 bg-brand-primary/5 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-brand-primary mb-6 text-center">
                        Về hạt cà phê của chúng tôi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-4xl mb-3">🌱</div>
                            <h4 className="font-semibold text-brand-primary mb-2">Nguồn gốc rõ ràng</h4>
                            <p className="text-brand-primary text-sm">
                                Tất cả hạt cà phê đều được truy xuất nguồn gốc từ các trang trại uy tín
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">🔥</div>
                            <h4 className="font-semibold text-brand-primary mb-2">Rang tươi hàng ngày</h4>
                            <p className="text-brand-primary text-sm">
                                Rang xay theo đơn đặt hàng để đảm bảo độ tươi ngon tối đa
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-3">📦</div>
                            <h4 className="font-semibold text-brand-primary mb-2">Đóng gói chuyên nghiệp</h4>
                            <p className="text-brand-primary text-sm">
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
    loading: PropTypes.bool.isRequired,    
    error: PropTypes.string,
    searchTerm: PropTypes.string,
    searchTime: PropTypes.number,
    totalProducts: PropTypes.number.isRequired,
    onClearSearch: PropTypes.func.isRequired,
    clearFilters: PropTypes.func.isRequired
};

export default CoffeeBeansTab;
