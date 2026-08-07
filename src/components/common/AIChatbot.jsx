import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdClose, MdSend, MdCoffeeMaker } from 'react-icons/md';
import ProductCard from './ProductCard';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { 
            role: 'ai', 
            text: 'Chào bạn! Mình là AI Barista của Balan Coffee. Bạn đang tìm loại cà phê nào hôm nay? (Ví dụ: "Cà phê đậm đà để thức khuya" hoặc "Cà phê chua nhẹ để pha Pour Over")', 
            recommendations: [] 
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = inputValue.trim();
        // Add user message
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Note: The vite proxy should route /api to the backend, 
            // if not, we use absolute URL http://localhost:5000/api
            // Based on standard vite setups, we'll try relative first, but fallback if needed.
            // Let's use the explicit backend URL to be safe in dev environment, 
            // but ideally we should use environment variables.
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${apiUrl}/products/recommendations?query=${encodeURIComponent(userMsg)}`);
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: data.reply || 'Xin lỗi, mình chưa tìm thấy câu trả lời phù hợp.',
                recommendations: data.recommendations || []
            }]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: 'Xin lỗi, hệ thống AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau nhé!' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            {/* Chat Window */}
            <div 
                className={`transition-all duration-300 transform origin-bottom-right shadow-2xl rounded-2xl flex flex-col bg-white overflow-hidden border border-gray-100 ${
                    isOpen ? 'scale-100 opacity-100 mb-4 h-[550px] max-h-[80vh] w-[380px] max-w-[calc(100vw-3rem)]' : 'scale-0 opacity-0 h-0 w-0 mb-0'
                }`}
                aria-hidden={!isOpen}
            >
                {/* Header */}
                <div className="bg-brand-primary text-white p-4 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-2 rounded-full">
                            <MdCoffeeMaker size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-xl uppercase tracking-widest text-white drop-shadow-md">AI Barista</h3>
                            <p className="text-xs text-white/90 font-medium tracking-wide mt-0.5">SẴN SÀNG TƯ VẤN</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                        aria-label="Đóng cửa sổ chat"
                    >
                        <MdClose size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div 
                                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-brand-primary text-white rounded-br-sm' 
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                                }`}
                            >
                                <p className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                                    {msg.text}
                                </p>
                            </div>
                            
                            {/* Render Recommendations if AI role and has products */}
                            {msg.role === 'ai' && msg.recommendations && msg.recommendations.length > 0 && (
                                <div className="mt-3 w-[260px] flex gap-3 overflow-x-auto pb-2 snap-x">
                                    {msg.recommendations.map(product => (
                                        <div key={product._id} className="min-w-full snap-center shrink-0 border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                                            {/* Minimalist representation to fit chat window */}
                                            <div className="relative h-28 bg-gray-100">
                                                <img 
                                                    src={product.image_url || '/placeholder.png'} 
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-bold text-sm text-gray-900 truncate">{product.name}</h4>
                                                <p className="text-xs text-brand-primary font-semibold mt-1">
                                                    {product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : 'Liên hệ'}
                                                </p>
                                                <a 
                                                    href={`/san-pham/${product.slug || product._id}`}
                                                    className="mt-2 block text-center bg-gray-100 hover:bg-brand-primary hover:text-white text-gray-700 text-xs py-1.5 rounded-lg transition-colors"
                                                >
                                                    Xem chi tiết
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-start">
                            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form 
                    onSubmit={handleSend}
                    className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
                >
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Hỏi AI về cà phê..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className={`p-2 rounded-full flex-shrink-0 transition-all ${
                            !inputValue.trim() || isLoading 
                                ? 'bg-gray-100 text-gray-400' 
                                : 'bg-brand-primary text-white hover:bg-brand-secondary hover:shadow-md'
                        }`}
                        aria-label="Gửi tin nhắn"
                    >
                        <MdSend size={20} className={isLoading ? 'opacity-50' : ''} />
                    </button>
                </form>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center shadow-2xl transition-all duration-300 focus:outline-none ${
                    isOpen 
                        ? 'w-12 h-12 rounded-full bg-gray-800 text-white rotate-90 scale-0' 
                        : 'w-16 h-16 rounded-full bg-brand-primary text-white hover:scale-110 hover:shadow-brand-primary/40'
                }`}
                style={!isOpen ? { boxShadow: '0 10px 25px -5px rgba(212, 163, 115, 0.5)' } : {}}
                aria-label="Mở khung chat AI"
            >
                {!isOpen && <MdChat size={28} />}
            </button>
        </div>
    );
};

export default AIChatbot;
