import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { formatVND } from '../utils/currency';

// Configure axios defaults
const API_BASE_URL = '/api';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, isInCart, getItemQuantity } = useCart();
    
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedWeight, setSelectedWeight] = useState('250g');
    const [addingToCart, setAddingToCart] = useState(false);

    const weights = ['100g', '250g', '500g', '1kg'];

    // Get price based on selected weight from product data
    const getCurrentPrice = () => {
        if (!product) return 0;
        
        // Use weightPricing from product data if available
        if (product?.weightPricing?.[selectedWeight]) {
            return product.weightPricing[selectedWeight];
        }
        
        // Fallback to default pricing for products without weightPricing
        const defaultWeightPrices = {
            '100g': 120000,   
            '250g': 280000,   
            '500g': 520000,   
            '1kg': 980000     
        };
        
        return defaultWeightPrices[selectedWeight] || product.price || 280000;
    };

    const fetchProduct = useCallback(async () => {
        try {
            console.log('🔍 Fetching product with ID:', id);
            if (!id || id === 'undefined') {
                console.error('❌ Invalid product ID:', id);
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

    const handleAddToCart = async () => {
        if (!product) return;
        
        setAddingToCart(true);
        try {
            // Create product object with selected options
            const productToAdd = {
                ...product,
                selectedWeight,
                price: getCurrentPrice(), // Use current price based on weight
                id: product.id || product._id
            };
            await addToCart(productToAdd, quantity);
            // Show success message or redirect
        } catch (error) {
            console.error('Failed to add to cart:', error);
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

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

    const inCart = isInCart(product.id || product._id);
    const cartQuantity = getItemQuantity(product.id || product._id);

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
                <meta property="product:price:amount" content={getCurrentPrice()} />
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
                            "price": getCurrentPrice(),
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
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
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
                    {formatVND(getCurrentPrice())}
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
                            <div>
                                <span className="block text-sm font-medium text-brand-primary/70 mb-2">
                                    Trọng lượng:
                                </span>
                                <div className="grid grid-cols-4 gap-2">
                                    {weights.map(weight => (
                                        <button
                                            key={weight}
                                            onClick={() => setSelectedWeight(weight)}
                                            className={`py-2 px-4 border rounded-lg text-sm font-medium transition-all duration-200 ${
                                                selectedWeight === weight
                                                    ? 'border-brand-primary bg-brand-primary text-brand-white shadow-lg transform scale-105'
                                                    : 'border-gray-300 text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5'
                                            }`}
                                        >
                                            {weight}
                                        </button>
                                    ))}
                                </div>
                            </div>                            {/* Quantity and Add to Cart */}
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

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="w-full bg-gradient-to-r from-brand-primary to-brand-primary/90 hover:from-brand-primary/90 hover:to-brand-primary text-brand-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    >
                                        {(() => {
                                            if (addingToCart) return 'Đang thêm...';
                                            if (inCart) return `Trong giỏ (${cartQuantity})`;
                                            return 'Thêm vào giỏ';
                                        })()}
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

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-brand-primary mb-8 text-center">
                                Sản phẩm liên quan
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map(relatedProduct => (
                                    <Link
                                        key={relatedProduct.id}
                                        to={`/products/${relatedProduct.id}`}
                                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        <div className="h-48 bg-gradient-to-br from-brand-primary/20 to-brand-primary/30 flex items-center justify-center">
                                            {relatedProduct.image_url ? (
                                                <img
                                                    src={relatedProduct.image_url}
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
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProductDetail;

