import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { t } = useTranslation();
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

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/products/${id}`);
            setProduct(response.data.product);
            
            // Fetch related products
            if (response.data.product.category_id) {
                const relatedResponse = await axios.get(`/api/products?category=${response.data.product.category_id}&limit=4&exclude=${id}`);
                setRelatedProducts(relatedResponse.data.products);
            }
        } catch (error) {
            console.error('Failed to fetch product:', error);
            if (error.response?.status === 404) {
                setError('Product not found');
            } else {
                setError('Failed to load product');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;
        
        setAddingToCart(true);
        try {
            await addToCart(product.id, quantity, { weight: selectedWeight });
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
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">☕</div>
                    <h2 className="text-2xl font-semibold text-coffee-800 mb-4">
                        {error || 'Product not found'}
                    </h2>
                    <Link
                        to="/products"
                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    const inCart = isInCart(product.id);
    const cartQuantity = getItemQuantity(product.id);

    return (
        <>
            <Helmet>
                <title>{product.name} - Balan Coffee</title>
                <meta name="description" content={product.description} />
                <meta name="keywords" content={`${product.name}, Vietnamese coffee, ${product.category_name || 'coffee'}, Balan Coffee`} />
                <meta property="og:title" content={`${product.name} - Balan Coffee`} />
                <meta property="og:description" content={product.description} />
                <meta property="og:type" content="product" />
                <meta property="og:image" content={product.image_url} />
                <meta property="product:price:amount" content={product.price} />
                <meta property="product:price:currency" content="USD" />
                <link rel="canonical" href={window.location.href} />
                
                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "description": product.description,
                        "image": product.image_url,
                        "brand": {
                            "@type": "Brand",
                            "name": "Balan Coffee"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": product.price,
                            "priceCurrency": "USD",
                            "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                        }
                    })}
                </script>
            </Helmet>

            <div className="min-h-screen bg-cream-50">
                {/* Breadcrumb */}
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-coffee-600">
                        <Link to="/" className="hover:text-coffee-800">Home</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-coffee-800">Products</Link>
                        <span>/</span>
                        <span className="text-coffee-800 font-medium">{product.name}</span>
                    </nav>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-lg overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-8xl">☕</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-2">
                                    {product.name}
                                </h1>
                                {product.category_name && (
                                    <p className="text-coffee-600 font-medium">
                                        {product.category_name}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <span className="text-3xl font-bold text-coffee-800">
                                    ${product.price}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    product.stock_quantity > 0 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {product.stock_quantity > 0 ? t('products.inStock') : t('products.outOfStock')}
                                </span>
                            </div>

                            <div className="prose prose-coffee max-w-none">
                                <p className="text-coffee-700 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Product Details */}
                            <div className="grid grid-cols-2 gap-4 py-4 border-t border-coffee-200">
                                {product.origin && (
                                    <div>
                                        <span className="text-sm font-medium text-coffee-600">{t('products.origin')}:</span>
                                        <p className="text-coffee-800">{product.origin}</p>
                                    </div>
                                )}
                                {product.roast_level && (
                                    <div>
                                        <span className="text-sm font-medium text-coffee-600">{t('products.roastLevel')}:</span>
                                        <p className="text-coffee-800">{product.roast_level}</p>
                                    </div>
                                )}
                                {product.flavor_profile && (
                                    <div>
                                        <span className="text-sm font-medium text-coffee-600">{t('products.flavor')}:</span>
                                        <p className="text-coffee-800">{product.flavor_profile}</p>
                                    </div>
                                )}
                                {product.processing_method && (
                                    <div>
                                        <span className="text-sm font-medium text-coffee-600">{t('products.processing')}:</span>
                                        <p className="text-coffee-800">{product.processing_method}</p>
                                    </div>
                                )}
                            </div>

                            {/* Weight Selection */}
                            <div>
                                <label className="block text-sm font-medium text-coffee-700 mb-2">
                                    {t('products.weight')}:
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {weights.map(weight => (
                                        <button
                                            key={weight}
                                            onClick={() => setSelectedWeight(weight)}
                                            className={`py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${
                                                selectedWeight === weight
                                                    ? 'border-coffee-600 bg-coffee-600 text-white'
                                                    : 'border-coffee-300 text-coffee-700 hover:border-coffee-400'
                                            }`}
                                        >
                                            {weight}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity and Add to Cart */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('cart.quantity')}:
                                    </label>
                                    <div className="flex items-center border border-coffee-300 rounded-lg w-32">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 text-coffee-600 hover:bg-coffee-50"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 border-x border-coffee-300 text-center min-w-[3rem]">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 text-coffee-600 hover:bg-coffee-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock_quantity === 0 || addingToCart}
                                        className="w-full bg-coffee-600 hover:bg-coffee-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-coffee-300 disabled:cursor-not-allowed"
                                    >
                                        {addingToCart ? t('common.loading') : 
                                         inCart ? `In Cart (${cartQuantity})` : t('products.addToCart')}
                                    </button>
                                    
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock_quantity === 0 || addingToCart}
                                        className="w-full bg-coffee-800 hover:bg-coffee-900 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:bg-coffee-300 disabled:cursor-not-allowed"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="border-t border-coffee-200 pt-6">
                                <div className="space-y-3 text-sm text-coffee-600">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        Free shipping on orders over $50
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Freshly roasted to order
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Satisfaction guaranteed
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-coffee-800 mb-8 text-center">
                                Related Products
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map(relatedProduct => (
                                    <Link
                                        key={relatedProduct.id}
                                        to={`/products/${relatedProduct.id}`}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
                                            {relatedProduct.image_url ? (
                                                <img
                                                    src={relatedProduct.image_url}
                                                    alt={relatedProduct.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl">☕</span>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                                                {relatedProduct.name}
                                            </h3>
                                            <p className="text-xl font-bold text-coffee-800">
                                                ${relatedProduct.price}
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
