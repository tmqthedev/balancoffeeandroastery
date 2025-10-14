import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { formatVND } from '../utils/currency';
import ContextConsumer from '../components/common/ContextConsumer';

// Configure axios defaults
const API_BASE_URL = '/api';

const ProductDetailContent = ({ auth, cart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Get context values with fallbacks
    const { addToCart } = cart;
    const { isAuthenticated } = auth;
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedWeight, setSelectedWeight] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);
    const [addToCartSuccess, setAddToCartSuccess] = useState(false);

    // Get price based on selected weight from product data - memoized for performance
    const getCurrentPrice = useMemo(() => {
        if (!product) return 0;
        
        // For weight-based pricing, find the corresponding weight option
        if (product.pricingType === 'weight-based' && product.weightPricing && product.weightPricing.length > 0) {
            // Convert selectedWeight to number (remove 'g' and convert)
            const selectedWeightNum = parseInt(selectedWeight.replace('g', ''));
            
            // Find the matching weight option in database
            const weightOption = product.weightPricing.find(option => option.weight === selectedWeightNum);
            
            if (weightOption) {
                return weightOption.price;
            }
            
            // If no exact match, return the first available option
            return product.weightPricing[0].price;
        }
        
        // For fixed pricing, return the product price
        return product.price || 0;
    }, [product, selectedWeight]);

    // Memoized image URL processing for better performance
    const processedImageUrl = useMemo(() => {
        if (!product?.image_url) return null;
        
        let imageUrl = product.image_url;
        
        if (imageUrl.startsWith('/images/')) {
            return imageUrl;
        } else if (imageUrl.startsWith('backend/uploads/')) {
            return `http://localhost:5000/${imageUrl}`;
        } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        } else if (imageUrl.startsWith('src/assets/')) {
            return imageUrl.replace('src/assets/', '/images/');
        }
        return imageUrl;
    }, [product?.image_url]);

    const fetchProduct = useCallback(async () => {
        try {
            if (!id || id === 'undefined') {
                setError('ID sản phẩm không hợp lệ');
                setLoading(false);
                return;
            }

            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/products/${id}`);
            setProduct(response.data.product);
            
            // Fetch related products
            if (response.data.relatedProducts) {
                setRelatedProducts(response.data.relatedProducts);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            if (error.response?.status === 404) {
                setError('Không tìm thấy sản phẩm');
            } else {
                setError('Không thể tải sản phẩm');
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    // Set default selected weight when product is loaded
    useEffect(() => {
        if (product && !selectedWeight) {
            // Get available weights from product data
            const getAvailableWeights = () => {
                if (product?.pricingType === 'weight-based' && product?.weightPricing && product.weightPricing.length > 0) {
                    return product.weightPricing
                        .filter(option => option.isAvailable !== false) // Filter out unavailable options
                        .map(option => `${option.weight}g`)
                        .sort((a, b) => parseInt(a) - parseInt(b)); // Sort by weight
                }
                
                // Default weights for fixed pricing or fallback
                return ['250g'];
            };
            
            const availableWeights = getAvailableWeights();
            if (availableWeights.length > 0) {
                // Set default to the first available weight, or find 250g if available
                const defaultWeight = availableWeights.find(w => w === '250g') || availableWeights[0];
                setSelectedWeight(defaultWeight);
            }
        }
    }, [product, selectedWeight]);

    const handleAddToCart = async () => {
        if (!product || !selectedWeight) return;
        
        setAddingToCart(true);
        setAddToCartSuccess(false);
        try {
            // Create product object with selected options and variant
            const productToAdd = {
                ...product,
                selectedWeight,
                price: getCurrentPrice, // Use current price based on weight (memoized value)
                id: product.id || product._id,
                variant: { weight: selectedWeight } // Add variant info for cart matching
            };
            
            const result = await addToCart(productToAdd, quantity);
            
            if (result && result.success) {
                setAddToCartSuccess(true);
                // Hide success message after 3 seconds
                setTimeout(() => setAddToCartSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Failed to add to cart:', error);
            
            // Check if it's an authentication error
            if (error.response && error.response.status === 401) {
                alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng. Sản phẩm đã được lưu tạm thời.');
            } else {
                alert('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // Calculate cart status for current product variant (by weight)
    // Must be called before any early returns to maintain hook order
    const cartStatusForVariant = useMemo(() => {
        if (!cart || !cart.items || !product || !selectedWeight) {
            return { inCart: false, quantity: 0 };
        }
        
        const productId = product.id || product._id;
        
        // Find item in cart that matches both product ID and selected weight
        const cartItem = cart.items.find(item => {
            const isSameProduct = (item.productId || item.product_id || item._id) === productId;
            const isSameVariant = item.variant && item.variant.weight === selectedWeight;
            return isSameProduct && isSameVariant;
        });
        
        return {
            inCart: !!cartItem,
            quantity: cartItem ? cartItem.quantity : 0
        };
    }, [cart, product, selectedWeight]);

    const handleBuyNow = async () => {
        if (!product) return;

        // Check if user is authenticated
        if (!isAuthenticated) {
            // Save product info to localStorage for after login
            const buyNowProduct = {
                productId: product.id || product._id,
                name: product.name,
                price: getCurrentPrice,
                selectedWeight,
                quantity,
                image_url: product.image_url,
                timestamp: Date.now()
            };

            localStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct));
            
            // Redirect to login with return path
            navigate('/login', {
                state: {
                    from: { pathname: '/checkout' },
                    message: 'Vui lòng đăng nhập để tiếp tục mua hàng'
                }
            });
            return;
        }


        // User is authenticated, proceed with normal flow
        await handleAddToCart();
        navigate('/checkout');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    // Get cart status for current variant BEFORE any early returns
    const { inCart, quantity: cartQuantity } = cartStatusForVariant;

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">☕</div>
                    <h2 className="text-2xl font-semibold text-brand-primary mb-4">
                        {error || 'Không tìm thấy sản phẩm'}
                    </h2>
                    <Link
                        to="/products"
                        className="bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Xem sản phẩm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{product.name} - Balan Coffee</title>
                <meta name="description" content={Array.isArray(product.description) ? product.description.join(', ') : product.description} />
                <meta name="keywords" content={`${product.name}, Vietnamese coffee, ${product.category_name || 'coffee'}, Balan Coffee`} />
                <meta property="og:title" content={`${product.name} - Balan Coffee`} />
                <meta property="og:description" content={Array.isArray(product.description) ? product.description.join(', ') : product.description} />
                <meta property="og:type" content="product" />
                <meta property="og:image" content={product.image_url} />
                <meta property="product:price:amount" content={getCurrentPrice} />
                <meta property="product:price:currency" content="VND" />
                <link rel="canonical" href={window.location.href} />
                
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "description": Array.isArray(product.description) ? product.description.join(', ') : product.description,
                        "image": product.image_url,
                        "brand": {
                            "@type": "Brand",
                            "name": "Balan Coffee"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": getCurrentPrice,
                            "priceCurrency": "VND",
                            "availability": "https://schema.org/InStock"
                        }
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Breadcrumb */}
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-brand-primary/70">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-brand-primary transition-colors">Sản phẩm</Link>
                        <span>/</span>
                        <span className="text-brand-primary font-medium">{product.name}</span>
                    </nav>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 rounded-xl overflow-hidden shadow-lg">
                                {product.image_url ? (
                                    <img
                                        src={processedImageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-8xl text-brand-primary/50">☕</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-brand-primary mb-2">
                                    {product.name}
                                </h1>
                                {product.category_name && (
                                    <p className="text-brand-primary/70 font-medium">
                                        {product.category_name}
                                    </p>
                                )}
                            </div>

            <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-brand-primary">
                    {formatVND(getCurrentPrice)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Còn hàng
                </span>
            </div>                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed">
                                    {Array.isArray(product.description) 
                                        ? product.description.join(', ')
                                        : product.description
                                    }
                                </p>
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
                                {product.origin && (
                                    <div>
                                        <span className="text-sm font-medium text-brand-primary/70">Xuất xứ:</span>
                                        <p className="text-brand-primary">{product.origin}</p>
                                    </div>
                                )}
                                {product.roast_level && (
                                    <div>
                                        <span className="text-sm font-medium text-brand-primary/70">Độ rang:</span>
                                        <p className="text-brand-primary">{product.roast_level}</p>
                                    </div>
                                )}
                                {product.flavor_profile && (
                                    <div>
                                        <span className="text-sm font-medium text-brand-primary/70">Hương vị:</span>
                                        <p className="text-brand-primary">
                                            {Array.isArray(product.flavor_profile) 
                                                ? product.flavor_profile.join(', ')
                                                : product.flavor_profile
                                            }
                                        </p>
                                    </div>
                                )}
                                {product.processing_method && (
                                    <div>
                                        <span className="text-sm font-medium text-brand-primary/70">Phương pháp chế biến:</span>
                                        <p className="text-brand-primary">
                                            {Array.isArray(product.processing_method) 
                                                ? product.processing_method.join(', ')
                                                : product.processing_method
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>                            {/* Weight Selection */}
                            {product.pricingType === 'weight-based' && product.weightPricing && product.weightPricing.length > 1 && (
                                <div>
                                    <span className="block text-sm font-medium text-brand-primary/70 mb-2">
                                        Trọng lượng:
                                    </span>
                                    <div className="grid grid-cols-4 gap-2">
                                        {product.weightPricing
                                            .filter(option => option.isAvailable !== false)
                                            .sort((a, b) => a.weight - b.weight)
                                            .map(weightOption => {
                                                const weight = `${weightOption.weight}g`;
                                                const isAvailable = weightOption.isAvailable !== false;
                                                
                                                // Determine button style class
                                                let buttonClass = 'py-2 px-4 border rounded-lg text-sm font-medium transition-all duration-200 ';
                                                if (selectedWeight === weight && isAvailable) {
                                                    buttonClass += 'border-brand-primary bg-brand-primary text-brand-white shadow-lg transform scale-105';
                                                } else if (isAvailable) {
                                                    buttonClass += 'border-gray-300 text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5';
                                                } else {
                                                    buttonClass += 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50';
                                                }
                                                
                                                return (
                                                    <button
                                                        key={weight}
                                                        onClick={() => isAvailable && setSelectedWeight(weight)}
                                                        disabled={!isAvailable}
                                                        className={buttonClass}
                                                    >
                                                        {weight}
                                                        <div className="text-xs mt-1">
                                                            {formatVND(weightOption.price)}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}                            {/* Quantity and Add to Cart */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="quantity-input" className="block text-sm font-medium text-brand-primary/70 mb-2">
                                        Số lượng:
                                    </label>
                                    <div className="flex items-center border border-gray-300 rounded-lg w-32 bg-white">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 text-brand-primary hover:bg-brand-primary/5 transition-colors rounded-l-lg"
                                            aria-label="Giảm số lượng"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <div className="px-4 py-2 border-x border-gray-300 text-center min-w-[3rem] text-brand-primary font-semibold">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 text-brand-primary hover:bg-brand-primary/5 transition-colors rounded-r-lg"
                                            aria-label="Tăng số lượng"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Success Message */}
                                {addToCartSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm font-medium">✅ Đã thêm sản phẩm vào giỏ hàng!</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="w-full bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        {addingToCart 
                                            ? 'Đang thêm...' 
                                            : inCart 
                                            ? `Trong giỏ (${cartQuantity})` 
                                            : 'Thêm vào giỏ'
                                        }
                                    </button>
                                    
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={addingToCart}
                                        className="w-full bg-gradient-to-r from-brand-secondary to-brand-secondary/90 hover:from-brand-secondary/90 hover:to-brand-secondary text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="space-y-3 text-sm text-brand-primary/70">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Miễn phí vận chuyển cho đơn hàng trên 1,000,000đ
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Rang mộc tươi theo đơn hàng
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Đảm bảo hài lòng 100%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-brand-primary mb-8 text-center">
                            Sản phẩm liên quan
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(relatedProduct => {
                                // Process image URL inline for each product
                                const processedImageUrl = relatedProduct.image_url 
                                    ? relatedProduct.image_url.startsWith('/images/') 
                                        ? relatedProduct.image_url
                                        : relatedProduct.image_url.startsWith('/assets/')
                                        ? relatedProduct.image_url.replace('/assets/', '/images/')
                                        : relatedProduct.image_url.startsWith('backend/uploads/')
                                        ? `http://localhost:5000/${relatedProduct.image_url}`
                                        : relatedProduct.image_url
                                    : null;

                                return (
                                    <Link
                                        key={relatedProduct.id}
                                        to={`/products/${relatedProduct.id}`}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="h-48 bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 flex items-center justify-center">
                                            {processedImageUrl ? (
                                                <img
                                                    src={processedImageUrl}
                                                    alt={relatedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl text-brand-primary/50">☕</span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-brand-primary mb-2 line-clamp-2">
                                                {relatedProduct.name}
                                            </h3>
                                            <p className="text-xl font-bold text-brand-primary">
                                                {formatVND(relatedProduct.price)}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

// Main component using ContextConsumer
const ProductDetail = () => {
    return (
        <ContextConsumer>
            {({ auth, cart }) => (
                <ProductDetailContent auth={auth} cart={cart} />
            )}
        </ContextConsumer>
    );
};

export default ProductDetail;

