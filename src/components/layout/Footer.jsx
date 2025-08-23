import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const socialLinks = [
        { 
            name: 'Facebook', 
            url: 'https://www.facebook.com/Balancoffeeroastery2023/',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            )
        },
        { 
            name: 'Instagram', 
            url: 'https://www.instagram.com/balancoffee/',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                </svg>
            )
        },
        { 
            name: 'TikTok', 
            url: 'https://www.tiktok.com/@blan.vin',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
            )
        }
    ];    return (
        <footer className="bg-brand-primary text-brand-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center space-x-3 mb-4">
                            <img src="backend\public\images\logos\logo.png" alt="Balan Coffee Logo" className='h-12 w-24 object-cover'/>  
                        </Link>
                        <p className="text-brand-white/80 mb-4 max-w-md">
                            Cà phê rang mộc chất lượng cao từ những vùng đất tốt nhất Việt Nam. Chúng tôi mang đến cho bạn hương vị cà phê đậm đà và tinh túy.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((social) => (
                                <a 
                                    key={social.name}
                                    href={social.url} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-white hover:text-brand-secondary transition-colors duration-300"
                                    aria-label={`Follow us on ${social.name}`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-brand-white">Liên kết nhanh</h4>
                        <ul className="space-y-2">
                            <li><Link to="/products" className="text-brand-white/80 hover:text-brand-secondary transition-colors duration-300">Sản phẩm</Link></li>
                            <li><Link to="/about" className="text-brand-white/80 hover:text-brand-secondary transition-colors duration-300">Giới thiệu</Link></li>
                            <li><Link to="/blog" className="text-brand-white/80 hover:text-brand-secondary transition-colors duration-300">Blog</Link></li>
                            <li><Link to="/contact" className="text-brand-white/80 hover:text-brand-secondary transition-colors duration-300">Liên hệ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-brand-white">Thông tin liên hệ</h4>
                        <div className="space-y-2 text-brand-white/80">
                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                123 Đường Cà Phê, Quận 1, TP.HCM
                            </p>
                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +84 123 456 789
                            </p>
                            <p className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                info@balancoffee.com
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-brand-white/20 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-brand-white/80 text-sm">
                            © 2023 Balan Coffee & Roastery. Tất cả quyền được bảo lưu.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/privacy" className="text-brand-white/80 hover:text-brand-secondary text-sm transition-colors duration-300">
                                Chính sách bảo mật
                            </Link>
                            <Link to="/terms" className="text-brand-white/80 hover:text-brand-secondary text-sm transition-colors duration-300">
                                Điều khoản sử dụng
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
