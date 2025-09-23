import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/sharedAuth';
import { useCart } from '../../constants/cartConstants';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { addToCart, loadCart } = useCart();
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [buyNowProduct, setBuyNowProduct] = useState(null);

    console.log('🔐 Login: Component mounted/rendered');
    console.log('🔗 Login: Current location:', location.pathname);
    console.log('📍 Login: Location state:', location.state);

    const from = location.state?.from?.pathname || '/';

    // Check for buy now product on component mount
    useEffect(() => {
        const savedBuyNowProduct = localStorage.getItem('buyNowProduct');
        console.log('🔍 Login: Checking for buy now product in localStorage:', savedBuyNowProduct);
        
        if (savedBuyNowProduct) {
            try {
                const product = JSON.parse(savedBuyNowProduct);
                console.log('📦 Login: Parsed buy now product:', product);
                
                // Check if product is not too old (within 30 minutes)
                if (Date.now() - product.timestamp < 30 * 60 * 1000) {
                    console.log('✅ Login: Buy now product is valid, setting state');
                    setBuyNowProduct(product);
                } else {
                    console.log('⏰ Login: Buy now product is too old, removing');
                    localStorage.removeItem('buyNowProduct');
                }
            } catch (error) {
                console.error('❌ Login: Error parsing buy now product:', error);
                localStorage.removeItem('buyNowProduct');
            }
        } else {
            console.log('❌ Login: No buy now product found in localStorage');
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('🔐 Login: Starting login process');
            await login(formData.email, formData.password, formData.remember);
            console.log('✅ Login: Login successful');
            
            // If there's a buy now product, add it to cart
            if (buyNowProduct) {
                console.log('🛒 Login: Found buy now product, attempting to add to cart:', buyNowProduct);
                try {
                    const productToAdd = {
                        id: buyNowProduct.productId,
                        name: buyNowProduct.name,
                        price: buyNowProduct.price,
                        selectedWeight: buyNowProduct.selectedWeight,
                        image_url: buyNowProduct.image_url
                    };
                    console.log('📦 Login: Product to add:', productToAdd);
                    
                    await addToCart(productToAdd, buyNowProduct.quantity);
                    console.log('✅ Login: Successfully added buy now product to cart');
                    
                    localStorage.removeItem('buyNowProduct');
                    console.log('🗑️ Login: Removed buy now product from localStorage');
                    
                    // Ensure cart is loaded before navigating
                    await loadCart();
                    console.log('🔄 Login: Cart reloaded, navigating to checkout');
                    navigate('/checkout', { replace: true });
                    return;
                } catch (cartError) {
                    console.error('❌ Login: Failed to add buy now product to cart:', cartError);
                    // Continue with normal navigation if cart addition fails
                }
            } else {
                console.log('❌ Login: No buy now product found');
            }
            
            console.log('🔄 Login: Navigating to original path:', from);
            navigate(from, { replace: true });
        } catch (error) {
            console.error('❌ Login: Login failed:', error);
            setError(error.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Đăng nhập - Balan Coffee</title>
                <meta name="description" content="Login to your Balan Coffee account to access your orders, wishlist, and account settings." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>            <div className="min-h-screen bg-cream-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 pt-20">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
                        <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center">
                            <img src="/images/logos/title.png" alt="Balan Coffee Logo" className='h-8 w-8 object-cover'/>
                        </div>                        
                    </Link>
                    
                    <h2 className="text-center text-3xl font-bold text-brand-primary">
                        Đăng nhập
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                        {buyNowProduct && (
                            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">
                                        Đăng nhập để thêm "{buyNowProduct.name}" vào giỏ hàng và thanh toán
                                    </span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-brand-primary">
                                    Email
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="Email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-brand-primary">
                                    Mật khẩu
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="Mật khẩu"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        name="remember"
                                        type="checkbox"
                                        checked={formData.remember}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember" className="ml-2 block text-sm text-brand-primary">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-brand-primary">
                                        Quên mật khẩu?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                                </button>
                            </div>

                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-brand-primary">                                Chưa có tài khoản?{' '}
                                <Link to="/register" className="font-medium text-brand-primary hover:text-brand-primary">
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;

