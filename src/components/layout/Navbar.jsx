import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { cart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };    const navigation = [
        { name: 'Trang chủ', href: '/' },
        { name: 'Sản phẩm', href: '/products' },
        { name: 'Giới thiệu', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Liên hệ', href: '/contact' },
    ];return (        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
        }`}>
            <div className="container mx-auto px-2 sm:px-4 lg:px-6">
                <div className="flex justify-between items-center py-1 sm:py-2">{/* Logo */}                    {/* Logo */}
                    <Link to="/" className="flex items-center hover:opacity-80 transition-opacity py-1">
                        <div className="flex-shrink-0">
                            <img 
                                src="/logo.png" 
                                alt="Balan Coffee & Roastery" 
                                className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <div className="hidden h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 bg-coffee-600 rounded-lg flex items-center justify-center text-white font-bold text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                                B
                            </div>
                        </div>
                    </Link>{/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`text-sm xl:text-base font-medium transition-all duration-200 hover:text-coffee-600 relative py-2 px-1 ${
                                    location.pathname === item.href
                                        ? 'text-coffee-600'
                                        : 'text-coffee-800'
                                }`}
                            >
                                {item.name}
                                {location.pathname === item.href && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-coffee-600 rounded-full transform scale-100 transition-transform duration-200"></span>
                                )}
                                {location.pathname !== item.href && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-coffee-600 rounded-full transform scale-0 hover:scale-100 transition-transform duration-200"></span>
                                )}
                            </Link>
                        ))}
                    </div>                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                        {/* Search Icon */}                        <button 
                            className="p-2 lg:p-2.5 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200 group"
                            aria-label="Search"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Cart Icon */}                        <Link 
                            to="/cart" 
                            className="relative p-2 lg:p-2.5 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200 group"
                            aria-label="Shopping Cart"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7.5" />
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-coffee-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse border-2 border-white">
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </span>
                            )}
                        </Link>                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative group hidden lg:block">
                                <button className="flex items-center space-x-2 p-2 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200 group">
                                    <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-coffee-500 to-coffee-700 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden xl:inline text-sm font-medium max-w-24 truncate">{user?.firstName}</span>
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-coffee-800 truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-coffee-600 truncate">{user?.email}</p>
                                    </div><Link 
                                        to="/account" 
                                        className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                    >                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Account
                                    </Link>                                    <Link 
                                        to="/orders" 
                                        className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                    >                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Orders
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                        >                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Quản trị
                                        </Link>
                                    )}
                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 hidden lg:flex">                                <Link 
                                    to="/login" 
                                    className="text-sm font-medium text-coffee-800 hover:text-coffee-600 px-4 py-2.5 rounded-lg hover:bg-coffee-50 transition-all duration-200 border border-transparent hover:border-coffee-200"
                                >
                                    Đăng nhập
                                </Link>                                <Link 
                                    to="/register" 
                                    className="bg-gradient-to-r from-coffee-600 to-coffee-700 hover:from-coffee-700 hover:to-coffee-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                    Đăng ký
                                </Link>
                            </div>
                        )}                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-coffee-200 shadow-lg">
                        <div className="px-4 pt-4 pb-6 space-y-1">                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-4 py-3 text-base font-medium transition-colors rounded-lg ${
                                        location.pathname === item.href
                                            ? 'text-coffee-600 bg-coffee-50 border-l-4 border-coffee-600'
                                            : 'text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            
                            {!isAuthenticated ? (
                                <div className="border-t border-coffee-200 pt-4 mt-4 space-y-2">                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-4 py-3 text-base font-medium bg-coffee-600 text-white hover:bg-coffee-700 rounded-lg transition-colors text-center"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div className="border-t border-coffee-200 pt-4 mt-4 space-y-2">
                                    <div className="px-4 py-2 bg-coffee-50 rounded-lg">
                                        <p className="text-sm font-medium text-coffee-800">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-coffee-600">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/account"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                    >                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Tài khoản
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                    >                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Đơn hàng
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            onClick={() => setIsMenuOpen(false)}
                                            className="flex items-center px-4 py-3 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-colors"
                                        >                                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Quản trị
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    >                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
