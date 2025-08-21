import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { highlightSearchTerm } from '../../utils/searchUtils';
import { formatVND } from '../../utils/currency';

const ProductCard = ({ product, searchTerm, onAddToCart }) => {
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onAddToCart(product);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md group">
            <Link to={`/products/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name || 'Sản phẩm'}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Stock Status */}
                    {(product.stockQuantity || product.stock_quantity) <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
                                Hết hàng
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Product Name */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                        <span 
                            dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(product.name || 'Sản phẩm', searchTerm)
                            }}
                        />
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            {product.weightPricing && product.weightPricing.length > 0 ? (
                                // Weight-based pricing
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-brand-primary">
                                        {formatVND(product.weightPricing[0].price)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        từ {product.weightPricing[0].weight}g
                                    </span>
                                </div>
                            ) : (
                                // Fixed pricing
                                <span className="text-xl font-bold text-brand-primary">
                                    {formatVND(product.price)}
                                </span>
                            )}
                        </div>
                        
                        {/* Simple Stock Status */}
                        <span className="text-sm text-gray-600">
                            {(product.stock_quantity || product.stockQuantity) > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                    </div>
                </div>
            </Link>

            {/* Simple Add to Cart Button */}
            <div className="p-4 pt-0">
                <button
                    onClick={handleAddToCart}
                    disabled={(product.stock_quantity || product.stockQuantity) <= 0}
                    className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors duration-200 ${
                        (product.stock_quantity || product.stockQuantity) <= 0
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                    }`}
                    aria-label={`Thêm ${product.name || 'sản phẩm'} vào giỏ hàng`}
                >
                    {(product.stock_quantity || product.stockQuantity) <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        _id: PropTypes.string,
        name: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                vi: PropTypes.string,
                en: PropTypes.string
            })
        ]),
        nameVi: PropTypes.string,
        description: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.shape({
                vi: PropTypes.string,
                en: PropTypes.string
            })
        ]),
        descriptionVi: PropTypes.string,
        price: PropTypes.number,
        weightPricing: PropTypes.arrayOf(PropTypes.shape({
            weight: PropTypes.number,
            price: PropTypes.number,
            discount: PropTypes.number
        })),
        comparePrice: PropTypes.number,
        image_url: PropTypes.string,
        stock_quantity: PropTypes.number,
        stockQuantity: PropTypes.number,
        isFeatured: PropTypes.bool
    }).isRequired,
    searchTerm: PropTypes.string,
    onAddToCart: PropTypes.func.isRequired
};

ProductCard.defaultProps = {
    searchTerm: ''
};

export default ProductCard;
