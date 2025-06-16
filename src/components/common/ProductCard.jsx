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
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 group">
            <Link to={`/products/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative h-64 bg-gray-200 overflow-hidden">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.nameVi || product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-coffee-100">
                            <svg className="w-16 h-16 text-coffee-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.isFeatured && (
                        <div className="absolute top-3 left-3">
                            <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                Nổi bật
                            </span>
                        </div>
                    )}
                    
                    {/* Stock Status */}
                    {product.stock_quantity <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                                Hết hàng
                            </span>
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                    {/* Product Name with highlighting */}
                    <h3 className="text-lg font-semibold text-coffee-800 mb-2 line-clamp-2">
                        <span 
                            dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(product.nameVi || product.name, searchTerm)
                            }}
                        />
                    </h3>

                    {/* Product Description with highlighting */}
                    <p className="text-coffee-600 text-sm mb-3 line-clamp-3">
                        <span 
                            dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                    product.descriptionVi || product.description || '', 
                                    searchTerm
                                )
                            }}
                        />
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-coffee-800">                                {formatVND(product.price)}
                            </span>
                            {product.comparePrice && product.comparePrice > product.price && (
                                <span className="text-sm text-gray-500 line-through">
                                    {formatVND(product.comparePrice)}
                                </span>
                            )}
                        </div>
                        
                        {/* Discount Badge */}
                        {product.comparePrice && product.comparePrice > product.price && (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                                -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Stock Info */}
                    <div className="flex items-center justify-between text-sm text-coffee-600 mb-4">
                        <span>
                            {product.stock_quantity > 0 
                                ? `Còn lại: ${product.stock_quantity}` 
                                : 'Hết hàng'
                            }
                        </span>
                        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                            <span className="text-orange-600 font-medium">
                                Sắp hết!
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="p-4 pt-0">
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity <= 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        product.stock_quantity <= 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-coffee-600 text-white hover:bg-coffee-700 hover:shadow-md transform hover:-translate-y-0.5'
                    }`}
                    aria-label={`Thêm ${product.nameVi || product.name} vào giỏ hàng`}
                >
                    {product.stock_quantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
            </div>

            {/* Search Match Indicator */}
            {searchTerm && (
                <div className="absolute top-0 right-0 m-3">
                    <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

ProductCard.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        nameVi: PropTypes.string,
        description: PropTypes.string,
        descriptionVi: PropTypes.string,
        price: PropTypes.number.isRequired,
        comparePrice: PropTypes.number,
        stock_quantity: PropTypes.number.isRequired,
        image_url: PropTypes.string,
        isFeatured: PropTypes.bool
    }).isRequired,
    searchTerm: PropTypes.string,
    onAddToCart: PropTypes.func.isRequired
};

export default ProductCard;
