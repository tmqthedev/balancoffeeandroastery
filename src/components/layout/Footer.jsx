import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const Footer = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [subscribeLoading, setSubscribeLoading] = useState(false);
    const [subscribeMessage, setSubscribeMessage] = useState('');

    const handleNewsletterSubscribe = async (e) => {
        e.preventDefault();
        
        if (!email) return;

        setSubscribeLoading(true);
        setSubscribeMessage('');

        try {
            const response = await axios.post('/api/contacts/subscribe', { email });
            
            if (response.data.success) {
                setSubscribeMessage(t('contact.newsletter.success'));
                setEmail('');
            } else {
                setSubscribeMessage(response.data.message || t('contact.newsletter.error'));
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            setSubscribeMessage(error.response?.data?.message || t('contact.newsletter.error'));
        } finally {
            setSubscribeLoading(false);
        }
    };

    const quickLinks = [
        { path: '/products', label: t('navigation.products') },
        { path: '/blog', label: t('navigation.blog') },
        { path: '/about', label: t('navigation.about') },
        { path: '/contact', label: t('navigation.contact') }
    ];

    const customerServiceLinks = [
        { path: '/shipping', label: 'Shipping Info' },
        { path: '/returns', label: 'Returns & Exchanges' },
        { path: '/faq', label: 'FAQ' },
        { path: '/privacy', label: 'Privacy Policy' },
        { path: '/terms', label: 'Terms of Service' }
    ];

    const socialLinks = [
        { 
            name: 'Facebook', 
            url: 'https://facebook.com/balancoffee',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            )
        },
        { 
            name: 'Instagram', 
            url: 'https://instagram.com/balancoffee',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                </svg>
            )
        },
        { 
            name: 'YouTube', 
            url: 'https://youtube.com/@balancoffee',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            )
        },
        { 
            name: 'TikTok', 
            url: 'https://tiktok.com/@balancoffee',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
            )
        }
    ];

    return (
        <footer className="bg-coffee-900 text-cream-100">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-coffee-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">B</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-cream-50">Balan Coffee</h3>
                                <p className="text-sm text-cream-300">& Roastery</p>
                            </div>
                        </div>
                        <p className="text-cream-200 text-sm leading-relaxed">
                            {t('footer.about.description')}
                        </p>
                        <div className="flex space-x-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cream-300 hover:text-coffee-400 transition-colors duration-200"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-cream-50">{t('footer.quickLinks')}</h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-cream-200 hover:text-coffee-400 transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-cream-50">{t('footer.customerService')}</h4>
                        <ul className="space-y-2">
                            {customerServiceLinks.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-cream-200 hover:text-coffee-400 transition-colors duration-200 text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-cream-50">{t('footer.newsletter')}</h4>
                        <p className="text-cream-200 text-sm">{t('footer.newsletterDesc')}</p>
                        
                        <form onSubmit={handleNewsletterSubscribe} className="space-y-3">
                            <div className="flex">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('contact.newsletter.email')}
                                    className="flex-1 px-3 py-2 bg-coffee-800 border border-coffee-700 rounded-l-lg text-cream-100 placeholder-cream-400 focus:outline-none focus:border-coffee-500 text-sm"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={subscribeLoading}
                                    className="bg-coffee-600 text-white px-4 py-2 rounded-r-lg hover:bg-coffee-500 transition-colors duration-200 text-sm font-medium disabled:opacity-50"
                                >
                                    {subscribeLoading ? '...' : t('footer.subscribe')}
                                </button>
                            </div>
                            {subscribeMessage && (
                                <p className={`text-xs ${subscribeMessage.includes('success') || subscribeMessage.includes('thành công') ? 'text-green-400' : 'text-red-400'}`}>
                                    {subscribeMessage}
                                </p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-coffee-800 mt-8 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-cream-300 text-sm">
                            {t('footer.copyright')}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-cream-300">
                            <span>📍 123 Coffee Street, Vietnam</span>
                            <span>📞 +84 123 456 789</span>
                            <span>✉️ hello@balancoffee.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
