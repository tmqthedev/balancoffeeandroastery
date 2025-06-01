import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LanguageSwitcher from '../common/LanguageSwitcher';

const Navbar = () => {
    const { t } = useTranslation();
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
    };

    const navigation = [
        { name: t('nav.home'), href: '/' },
        { name: t('nav.products'), href: '/products' },
        { name: t('nav.about'), href: '/about' },
        { name: t('nav.blog'), href: '/blog' },
        { name: t('nav.contact'), href: '/contact' },
    ];

    return (        <nav className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
        }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 lg:h-20">{/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="flex-shrink-0">
                            <img 
                                src="/logo.png" 
                                alt="Balan Coffee & Roastery" 
                                className="h-10 w-10 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />                            
                        </div>
                    </Link>                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`text-sm font-medium transition-all duration-200 hover:text-coffee-600 relative py-2 ${
                                    location.pathname === item.href
                                        ? 'text-coffee-600'
                                        : 'text-coffee-800'
                                }`}
                            >
                                {item.name}
                                {location.pathname === item.href && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-coffee-600 rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-2 lg:space-x-4">
                        <div className="hidden md:block">
                            <LanguageSwitcher />
                        </div>
                        
                        {/* Search Icon */}
                        <button 
                            className="p-2 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200"
                            aria-label={t('common.search')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* Cart Icon */}
                        <Link 
                            to="/cart" 
                            className="relative p-2 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200"
                            aria-label={t('nav.cart')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7.5" />
                            </svg>
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-coffee-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                                </span>
                            )}
                        </Link>                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative group hidden lg:block">
                                <button className="flex items-center space-x-2 p-2 text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50 rounded-lg transition-all duration-200">
                                    <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="hidden xl:inline text-sm font-medium">{user?.firstName}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                                    <Link 
                                        to="/account" 
                                        className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {t('nav.account')}
                                    </Link>
                                    <Link 
                                        to="/orders" 
                                        className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        {t('nav.orders')}
                                    </Link>
                                    {user?.role === 'admin' && (
                                        <Link 
                                            to="/admin" 
                                            className="flex items-center px-4 py-2 text-sm text-coffee-700 hover:bg-coffee-50 transition-colors"
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {t('nav.admin')}
                                        </Link>
                                    )}
                                    <hr className="my-2 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        {t('common.logout')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 hidden lg:flex">
                                <Link 
                                    to="/login" 
                                    className="text-sm font-medium text-coffee-800 hover:text-coffee-600 px-3 py-2 rounded-lg hover:bg-coffee-50 transition-all duration-200"
                                >
                                    {t('auth.login')}
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {t('auth.register')}
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
                    <div className="lg:hidden bg-white border-t border-coffee-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2 text-base font-medium transition-colors ${
                                        location.pathname === item.href
                                            ? 'text-coffee-600 bg-coffee-50'
                                            : 'text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            
                            {!isAuthenticated ? (
                                <div className="border-t border-coffee-200 pt-3 mt-3 space-y-1">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50"
                                    >
                                        {t('auth.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50"
                                    >
                                        {t('auth.register')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="border-t border-coffee-200 pt-3 mt-3 space-y-1">
                                    <Link
                                        to="/account"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block px-3 py-2 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50"
                                    >
                                        {t('nav.account')}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-coffee-800 hover:text-coffee-600 hover:bg-coffee-50"
                                    >
                                        {t('common.logout')}
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
