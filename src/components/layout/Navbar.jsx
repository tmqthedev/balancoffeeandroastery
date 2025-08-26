import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/sharedAuth';
import { useCart } from '../../constants/cartConstants';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const { getCartTotals } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const cartItemsCount = getCartTotals()?.itemCount || 0;

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navigation = [
        { name: 'Giới thiệu', href: '/about' },
        { name: 'Sản phẩm', href: '/products' },
        { name: 'Blog', href: '/blog' },
        { name: 'Liên hệ', href: '/contact' },    ];

    return (
        <nav className="fixed w-full z-50 bg-brand-primary shadow-lg">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between h-16">                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity focus:outline-none">
                            <img src="backend\public\images\logos\logo.png" alt="Balan Coffee Logo" className='h-12 w-24 object-cover'/>                      
                        </Link>
                    </div>

                    {/* Desktop Navigation - Centered */}
                    <div className="hidden lg:flex flex-1 justify-center">
                        <div className="flex items-center space-x-8">                            {navigation.map((item) => {
                                // Sửa logic isActive để chính xác hơn
                                let isActive = false;
                                
                                if (item.href === '/about') {
                                    isActive = location.pathname === '/' || 
                                              location.pathname === '/about' || 
                                              location.pathname === '/gioi-thieu';
                                } else {
                                    isActive = location.pathname === item.href;
                                }
                                
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`text-base font-medium transition-all duration-200 hover:text-brand-secondary relative py-2 px-1 ${
                                            isActive ? 'text-brand-secondary' : 'text-brand-white'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-auto lg:ml-0">                        {/* Cart Icon */}
                        <Link 
                            to="/cart" 
                            className="relative p-2 text-brand-white hover:text-brand-secondary hover:bg-brand-primary/10 rounded-lg transition-all duration-200 group focus:outline-none "
                            aria-label="Shopping Cart"
                        ><svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7.5" />
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-secondary text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium border-2 border-brand-primary">
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </span>
                            )}
                        </Link>                        {/* User Account */}
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 text-brand-white hover:text-brand-secondary hover:bg-brand-primary/10 rounded-lg transition-all duration-200 focus:outline-none ">
                                    <div className="w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center text-black text-sm font-medium shadow-sm">
                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden xl:inline text-sm font-medium max-w-24 truncate">{user?.firstName}</span>
                                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-brand-primary truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                                    </div>                                    <Link 
                                        to="/account" 
                                        className="flex items-center px-4 py-2 text-sm text-brand-primary hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Tài khoản
                                    </Link>

                                    <Link 
                                        to="/orders" 
                                        className="flex items-center px-4 py-2 text-sm text-brand-primary hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-100"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Đơn hàng
                                    </Link>

                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:bg-red-100"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>                        ) : (                            <Link 
                                to="/auth" 
                                className="hidden lg:inline-flex items-center space-x-2 bg-brand-secondary hover:bg-brand-secondary/90 text-black px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Tài khoản</span>
                            </Link>
                        )}                        {/* Mobile Menu Button */}                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-brand-white hover:text-brand-secondary hover:bg-brand-primary/10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary"
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
                </div>

                {/* Mobile Menu */}                {isMenuOpen && (
                    <div className="lg:hidden bg-brand-primary border-t border-brand-white/20 shadow-lg">
                        <div className="px-4 pt-4 pb-6 space-y-1">                            {navigation.map((item) => {
                                // Sửa logic isActive cho mobile menu
                                let isActive = false;
                                
                                if (item.href === '/about') {
                                    isActive = location.pathname === '/' || 
                                              location.pathname === '/about' || 
                                              location.pathname === '/gioi-thieu';
                                } else {
                                    isActive = location.pathname === item.href;
                                }
                                
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`block px-4 py-3 text-base font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary ${
                                            isActive
                                                ? 'text-brand-secondary bg-brand-white/10 border-l-4 border-brand-secondary'
                                                : 'text-brand-white hover:text-brand-secondary hover:bg-brand-white/10'
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {!isAuthenticated ? (
                                <div className="border-t border-brand-white/20 pt-4 mt-4">                                    <Link
                                        to="/auth"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-center space-x-2 px-4 py-3 text-base font-medium bg-brand-secondary text-black hover:bg-brand-secondary/90 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Tài khoản</span>
                                    </Link>
                                </div>
                            ) : (
                                <div className="border-t border-brand-white/20 pt-4 mt-4 space-y-2">
                                    <div className="px-4 py-2 bg-brand-white/10 rounded-lg">
                                        <p className="text-sm font-medium text-brand-white">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-brand-white/70">{user?.email}</p>
                                    </div>                                    <Link
                                        to="/account"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-base font-medium text-brand-white hover:text-brand-secondary hover:bg-brand-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Tài khoản
                                    </Link>
                                    <Link
                                        to="/orders"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center px-4 py-3 text-base font-medium text-brand-white hover:text-brand-secondary hover:bg-brand-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Đơn hàng
                                    </Link>

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                                    >
                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
