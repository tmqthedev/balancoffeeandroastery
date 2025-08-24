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
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-primary/40 group">
            <Link to={`/products/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name || 'Sản phẩm'}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <h3 className="text-base font-semibold text-brand-primary mb-3 line-clamp-2 group-hover:text-brand-primary/80 transition-colors leading-snug">
                    <span 
                        dangerouslySetInnerHTML={{
                            __html: highlightSearchTerm(product.name || 'Sản phẩm', searchTerm)
                        }}
                    />
                </h3>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        {product.weightPricing && product.weightPricing.length > 0 ? (
                            // Weight-based pricing
                            <>
                                <span className="text-xl font-bold text-brand-primary">
                                    {formatVND(product.weightPricing[0].price)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    từ {product.weightPricing[0].weight}g
                                </span>
                            </>
                        ) : (
                            // Fixed pricing
                            <span className="text-xl font-bold text-brand-primary">
                                {formatVND(product.price)}
                            </span>
                        )}
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md"
                        aria-label={`Thêm ${product.name || 'sản phẩm'} vào giỏ hàng`}
                    >
                        Thêm vào giỏ
                    </button>
                </div>
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
