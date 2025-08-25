import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { formatVND } from '../../utils/currency';

const API_BASE_URL = '/api';

const ProductPricing = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const weights = ['100g', '250g', '500g', '1kg'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/products`);
            setProducts(response.data.products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setMessage('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const updateProductPricing = async (productId, weightPricing) => {
        try {
            setSaving(true);
            await axios.put(`${API_BASE_URL}/products/${productId}/pricing`, {
                weightPricing
            });
            
            setMessage('✅ Cập nhật giá thành công!');
            setTimeout(() => setMessage(''), 3000);
            
            // Refresh products
            await fetchProducts();
        } catch (error) {
            console.error('Failed to update pricing:', error);
            setMessage('❌ Không thể cập nhật giá');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handlePriceChange = (productIndex, weight, newPrice) => {
        const updatedProducts = [...products];
        if (!updatedProducts[productIndex].weightPricing) {
            updatedProducts[productIndex].weightPricing = {};
        }
        updatedProducts[productIndex].weightPricing[weight] = parseInt(newPrice) || 0;
        setProducts(updatedProducts);
    };

    const saveProductPricing = async (productIndex) => {
        const product = products[productIndex];
        await updateProductPricing(product.id, product.weightPricing);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Quản Lý Giá Sản Phẩm - Balan Coffee Admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-brand-primary mb-2">
                            🏷️ Quản Lý Giá Theo Trọng Lượng
                        </h1>
                        <p className="text-brand-primary">
                            Thiết lập giá cho từng trọng lượng của sản phẩm cà phê
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.includes('✅') 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-6">
                        {products.map((product, productIndex) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-brand-secondary/20 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-brand-primary">
                                                {product.name}
                                            </h3>
                                            <p className="text-brand-primary text-sm">
                                                {product.category_name || 'Không có danh mục'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-brand-primary">Giá hiện tại:</p>
                                            <p className="text-lg font-bold text-brand-primary">
                                                {formatVND(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        {weights.map(weight => (
                                            <div key={weight} className="space-y-2">
                                                <label className="block text-sm font-medium text-brand-primary">
                                                    💰 Giá {weight}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        value={product.weightPricing?.[weight] || ''}
                                                        onChange={(e) => handlePriceChange(productIndex, weight, e.target.value)}
                                                        placeholder="Nhập giá..."
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors"
                                                    />
                                                    <span className="absolute right-3 top-2 text-gray-400 text-sm">đ</span>
                                                </div>
                                                {product.weightPricing?.[weight] && (
                                                    <p className="text-xs text-brand-primary">
                                                        {formatVND(product.weightPricing[weight])}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => {
                                                    // Auto-fill with suggested prices based on base price
                                                    const basePrice = product.price;
                                                    const suggestedPricing = {
                                                        '100g': Math.round(basePrice * 0.43),
                                                        '250g': basePrice,
                                                        '500g': Math.round(basePrice * 1.86),
                                                        '1kg': Math.round(basePrice * 3.5)
                                                    };
                                                    
                                                    const updatedProducts = [...products];
                                                    updatedProducts[productIndex].weightPricing = suggestedPricing;
                                                    setProducts(updatedProducts);
                                                }}
                                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                            >
                                                🎯 Điền giá gợi ý
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    const updatedProducts = [...products];
                                                    updatedProducts[productIndex].weightPricing = {};
                                                    setProducts(updatedProducts);
                                                }}
                                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                            >
                                                🗑️ Xóa tất cả
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => saveProductPricing(productIndex)}
                                            disabled={saving}
                                            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                        >
                                            {saving ? '⏳ Đang lưu...' : '💾 Lưu giá'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold text-yellow-800 mb-2">💡 Gợi ý về giá:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• <strong>100g</strong>: Thường là 40-45% giá gói 250g</li>
                            <li>• <strong>250g</strong>: Giá cơ sở (100%)</li>
                            <li>• <strong>500g</strong>: Thường là 180-190% giá gói 250g</li>
                            <li>• <strong>1kg</strong>: Thường là 340-360% giá gói 250g</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductPricing;
