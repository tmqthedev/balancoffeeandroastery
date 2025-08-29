
import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa6';
import { SiZalo } from 'react-icons/si';

const Footer = () => {
    const socialLinks = [
        {
            name: 'Facebook',
            url: 'https://www.facebook.com/Balancoffeeroastery2023/',
            icon: <FaFacebookF className="w-5 h-5" />
        },
        {
            name: 'Instagram',
            url: 'https://instagram.com/balancoffee',
            icon: <FaInstagram className="w-5 h-5" />
        },
        {
            name: 'TikTok',
            url: 'https://www.tiktok.com/@blan.vin',
            icon: <FaTiktok className="w-5 h-5" />
        },
        {
            name: 'Zalo',
            url: 'https://zalo.me/balancoffee',
            icon: <SiZalo className="w-5 h-5" />
        }
    ];
    return (
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
                        <div className="space-y-2">
                            <p className="flex items-center text-white">
                                <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-white">S6.01 Vinhome Grand Park Phường Long Bình, Thủ Đức, Hồ Chí Minh, Việt Nam.</span>
                            </p>
                            <p className="flex items-center text-white">
                                <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-white">+84 964 822 269</span>
                            </p>
                            <p className="flex items-center text-white">
                                <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-white">info@balancoffee.com</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-brand-white/20 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-brand-white/80 text-sm">
                            © 2025 Balan Coffee & Roastery. Tất cả quyền được bảo lưu.
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
