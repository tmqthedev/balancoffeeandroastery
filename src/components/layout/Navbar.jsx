import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const { getCartTotals } = useCart();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const { itemCount } = getCartTotals();

    const navigationItems = [
        { path: '/', label: t('navigation.home') },
        { path: '/products', label: t('navigation.products') },
        { path: '/blog', label: t('navigation.blog') },
        { path: '/about', label: t('navigation.about') },
        { path: '/contact', label: t('navigation.contact') }
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsUserMenuOpen(false);
    };

    const isActivePath = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-40">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-coffee-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-coffee-800">Balan Coffee</h1>
                            <p className="text-xs text-coffee-600">& Roastery</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-sm font-medium transition-colors duration-200 hover:text-coffee-600 ${
                                    isActivePath(item.path)
                                        ? 'text-coffee-600 border-b-2 border-coffee-600 pb-1'
                                        : 'text-coffee-800'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-coffee-700 hover:text-coffee-600 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2a1 1 0 00.95 1.3h9.9m-11-6h12" />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-coffee-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-cream-100 transition-colors duration-200"
                                >
                                    <div className="w-8 h-8 bg-coffee-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-coffee-800">
                                        {user?.full_name || user?.username}
                                    </span>
                                    <svg className={`w-4 h-4 text-coffee-600 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-cream-200 py-2">
                                        <Link
                                            to="/account"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-2 text-sm text-coffee-700 hover:bg-cream-50 transition-colors duration-150"
                                        >
                                            {t('navigation.account')}
                                        </Link>
                                        {user?.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-coffee-700 hover:bg-cream-50 transition-colors duration-150"
                                            >
                                                {t('navigation.admin')}
                                            </Link>
                                        )}
                                        <hr className="my-2 border-cream-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                        >
                                            {t('common.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-coffee-700 hover:text-coffee-600 transition-colors duration-200"
                                >
                                    {t('common.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-coffee-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-coffee-700 transition-colors duration-200"
                                >
                                    {t('common.register')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-coffee-700 hover:text-coffee-600 transition-colors duration-200"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-cream-200 py-4">
                        <div className="flex flex-col space-y-3">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 ${
                                        isActivePath(item.path)
                                            ? 'text-coffee-600 bg-coffee-50'
                                            : 'text-coffee-800 hover:text-coffee-600 hover:bg-cream-50'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Click outside to close menus */}
            {(isUserMenuOpen || isMobileMenuOpen) && (
                <div 
                    className="fixed inset-0 z-[-1]" 
                    onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsMobileMenuOpen(false);
                    }}
                />
            )}
        </nav>
    );
};

export default Navbar;
