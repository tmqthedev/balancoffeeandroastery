import React, { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { highlightSearchTerm } from '../../utils/searchUtils';
import { formatVND } from '../../utils/currency';
import OptimizedImage from './OptimizedImage';
import { useIntersectionObserver } from '../../hooks/usePerformance';

const ProductCard = memo(({ product, searchTerm = '' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [setRef, entry] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '50px'
    });

    const isVisible = entry?.isIntersecting;

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const renderPrice = useCallback(() => {
        const isWeightBased = product.pricingType === 'weight-based' && 
                              product.weightPricing && 
                              product.weightPricing.length > 0;

        if (isWeightBased) {
            // Find min and max prices
            const prices = product.weightPricing.map(option => option.price);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // If min and max prices are the same, show only one price
            if (minPrice === maxPrice) {
                return (
                    <span className="text-xl font-bold text-brand-primary">
                        {formatVND(minPrice)}
                    </span>
                );
            }

            return (
                <>
                    <span className="text-xl font-bold text-brand-primary">
                        {formatVND(minPrice)} - {formatVND(maxPrice)}
                    </span>
                    <span className="text-xs text-gray-500">
                        250g - 1kg
                    </span>
                </>
            );
        }

        if (product.price) {
            return (
                <span className="text-xl font-bold text-brand-primary">
                    {formatVND(product.price)}
                </span>
            );
        }

        return (
            <span className="text-sm text-gray-500">
                Liên hệ để biết giá
            </span>
        );
    }, [product.pricingType, product.weightPricing, product.price]);

    const renderProductImage = () => {
        if (!isVisible) {
            return (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 bg-gray-300 rounded"></div>
                </div>
            );
        }

        if (product.image_url) {
            // Handle different image URL formats
            let imageUrl = product.image_url;

            // If image_url starts with '/images/', it's already correct for public folder
            if (imageUrl.startsWith('/images/')) {
                // Use as is - Vite will serve from public folder
            }
            // If image_url starts with 'backend/', convert to proper API endpoint
            else if (imageUrl.startsWith('backend/uploads/')) {
                imageUrl = `http://localhost:5000/${imageUrl}`;
            }
            // If it's already a full URL, use as is
            else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                // Use as is
            }
            // If it's a relative path, assume it's from assets
            else if (imageUrl.startsWith('src/assets/')) {
                // Convert to proper public path
                imageUrl = imageUrl.replace('src/assets/', '/images/');
            }

            if (imageUrl) {
                return (
                    <OptimizedImage
                        src={imageUrl}
                        alt={product.name || 'Sản phẩm'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        width={300}
                        height={200}
                        loading="lazy"
                        onLoad={handleImageLoad}
                        placeholder="/images/placeholder.jpg"
                    />
                );
            }
        }

        return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        );
    };

    return (
        <div ref={setRef} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-brand-primary/40 group">
            <Link to={`/products/${product._id || product.id}`} className="block">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {renderProductImage()}
                    {/* Fallback placeholder */}
                    <div className="w-full h-full flex items-center justify-center bg-gray-100" style={{display: 'none'}}>
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </Link>

            {/* Product Info */}
            <div className="p-4">
                {/* Product Name */}
                <h3 className="text-base font-semibold text-brand-primary mb-3 line-clamp-2 group-hover:text-brand-primary/80 transition-colors leading-snug">
                    {product.name || 'Sản phẩm'}
                </h3>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        {renderPrice()}
                    </div>
                    
                    {/* View Details Button */}
                    <Link
                        to={`/products/${product._id || product.id}`}
                        className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md inline-block text-center"
                        aria-label={`Xem chi tiết ${product.name || 'sản phẩm'}`}
                    >
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </div>
    );
});

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
        pricingType: PropTypes.oneOf(['fixed', 'weight-based']),
        weightPricing: PropTypes.arrayOf(PropTypes.shape({
            weight: PropTypes.number,
            price: PropTypes.number,
            discount: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
        })),
        comparePrice: PropTypes.number,
        image_url: PropTypes.string,
        stock_quantity: PropTypes.number,
        stockQuantity: PropTypes.number,
        isFeatured: PropTypes.bool
    }).isRequired,
    searchTerm: PropTypes.string
};

export default ProductCard;
