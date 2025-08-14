import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatVND } from '../utils/currency';

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { 
        cartItems, 
        loading, 
        updateQuantity, 
        removeFromCart, 
        clearCart, 
        getCartTotals 
    } = useCart();

    const { subtotal, shipping, tax, total, itemCount } = getCartTotals();

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
        } else {
            navigate('/checkout');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
            </div>
        );
    }

    return (
        <>            <Helmet>
                <title>Giỏ hàng - Balan Coffee</title>
                <meta name="description" content="Xem lại lựa chọn cà phê của bạn và tiến hành thanh toán." />
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-cream-50">
                {/* Header */}
                <div className="bg-coffee-800 text-white py-12">
                    <div className="container mx-auto px-4">                        <h1 className="text-3xl md:text-4xl font-bold">
                            Giỏ hàng ({itemCount})
                        </h1>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    {cartItems.length === 0 ? (
                        /* Empty Cart */                        <div className="text-center py-16">
                            <div className="text-6xl mb-6">🛒</div>
                            <h2 className="text-2xl font-semibold text-coffee-800 mb-4">
                                Giỏ hàng trống
                            </h2>
                            <p className="text-coffee-600 mb-8 max-w-md mx-auto">
                                Khám phá bộ sưu tập cà phê Việt Nam cao cấp và thêm một số loại hạt thơm ngon vào giỏ hàng của bạn.
                            </p>
                            <Link
                                to="/products"
                                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                            >
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    ) : (
                        /* Cart with Items */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow-md">
                                    <div className="p-6 border-b border-coffee-100">                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-semibold text-coffee-800">
                                                Sản phẩm trong giỏ ({itemCount})
                                            </h2>
                                            <button
                                                onClick={clearCart}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Xóa giỏ hàng
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="divide-y divide-coffee-100">
                                        {cartItems.map((item) => (
                                            <div key={item.product_id} className="p-6">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    {/* Product Image */}
                                                    <div className="w-24 h-24 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl">☕</span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Product Details */}
                                                    <div className="flex-grow">
                                                        <div className="flex flex-col sm:flex-row justify-between">
                                                            <div className="mb-2 sm:mb-0">
                                                                <Link 
                                                                    to={`/products/${item.product_id}`}
                                                                    className="text-lg font-semibold text-coffee-800 hover:text-coffee-600"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <p className="text-coffee-600 text-sm mt-1">
                                                                    {item.description && item.description.length > 100 
                                                                        ? `${item.description.substring(0, 100)}...`
                                                                        : item.description
                                                                    }
                                                                </p>                                                                <p className="text-coffee-800 font-semibold mt-2">
                                                                    {formatVND(item.price)} mỗi sản phẩm
                                                                </p>
                                                            </div>
                                                            
                                                            {/* Quantity and Remove */}
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex items-center border border-coffee-300 rounded-lg">
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                                                        className="px-3 py-1 text-coffee-600 hover:bg-coffee-50"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="px-4 py-1 border-x border-coffee-300 min-w-[3rem] text-center">
                                                                        {item.quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                                                        className="px-3 py-1 text-coffee-600 hover:bg-coffee-50"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>                                                                  <div className="text-right">
                                                                    <p className="text-lg font-semibold text-coffee-800">
                                                                        {formatVND(item.price * item.quantity)}
                                                                    </p>
                                                                </div>
                                                                
                                                                <button
                                                                    onClick={() => removeFromCart(item.product_id)}
                                                                    className="text-red-600 hover:text-red-800 p-1"
                                                                    aria-label="Remove item"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Continue Shopping */}
                                <div className="mt-6">                                    <Link
                                        to="/products"
                                        className="inline-flex items-center text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Tiếp tục mua sắm
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">                                    <h3 className="text-xl font-semibold text-coffee-800 mb-6">
                                        Tóm tắt đơn hàng
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex justify-between">
                                            <span className="text-coffee-600">Tạm tính</span>
                                            <span className="font-semibold text-coffee-800">{formatVND(subtotal)}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-coffee-600">Phí vận chuyển</span>
                                            <span className="font-semibold text-coffee-800">
                                                {shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-coffee-600">Thuế</span>
                                            <span className="font-semibold text-coffee-800">{formatVND(tax)}</span>
                                        </div>
                                        
                                        <hr className="border-coffee-200" />
                                        
                                        <div className="flex justify-between text-lg">
                                            <span className="font-semibold text-coffee-800">Tổng cộng</span>
                                            <span className="font-bold text-coffee-800">{formatVND(total)}</span>
                                        </div>
                                    </div>
                                      {/* Shipping Notice */}
                                    {subtotal < 1000000 && (
                                        <div className="mt-4 p-3 bg-coffee-50 border border-coffee-200 rounded-lg">
                                            <p className="text-sm text-coffee-700">
                                                Thêm {formatVND(1000000 - subtotal)} nữa để được miễn phí vận chuyển!
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Checkout Button */}
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full mt-6 bg-coffee-600 hover:bg-coffee-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                                    >
                                        {isAuthenticated ? 'Thanh toán' : 'Đăng nhập và thanh toán'}
                                    </button>
                                    
                                    {/* Security Notice */}
                                    <div className="mt-4 flex items-center justify-center text-sm text-coffee-600">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Thanh toán bảo mật
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;

