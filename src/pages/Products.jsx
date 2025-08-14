import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import AdvancedSearch from '../components/common/AdvancedSearch';
import CoffeeBeansTab from '../components/common/CoffeeBeansTab';
import BeveragesTab from '../components/common/BeveragesTab';
import ServicesTab from '../components/common/ServicesTab';
import { sortSearchResults, saveSearchHistory } from '../utils/searchUtils';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    
    // Tab management
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'coffee-beans');
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        inStock: searchParams.get('inStock') === 'true',
        search: searchParams.get('search') || ''
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchTime, setSearchTime] = useState(null);

    const productsPerPage = 12;

    // Tabs configuration
    const tabs = [
        {
            id: 'coffee-beans',
            name: 'Cà phê hạt',
            icon: '☕',
            description: 'Hạt cà phê nguyên chất, rang mộc từ các vùng miền khác nhau'
        },
        {
            id: 'beverages',
            name: 'Menu thức uống',
            icon: '🥤',
            description: 'Các loại thức uống cà phê và đồ uống khác'
        },
        {
            id: 'services',
            name: 'Dịch vụ',
            icon: '🏪',
            description: 'Setup quán cà phê, training nhân viên và tư vấn kinh doanh'
        }
    ];

    // Debounced search function
    const debouncedSearch = useCallback((searchTerm) => {
        const timeoutId = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, []);

    // Memoized filtered products count
    const displayedProductsCount = useMemo(() => {
        return Math.min(products.length, productsPerPage);
    }, [products.length]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Start timing search
            const startTime = performance.now();
            
            const params = {
                ...filters,
                sortBy,
                page: currentPage,
                limit: productsPerPage
            };
            
            // Clean up empty params
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });
            
            const response = await axios.get(`${API_BASE_URL}/api/products`, { 
                params,
                timeout: 10000
            });
            
            // Calculate search time
            const endTime = performance.now();
            const searchDuration = endTime - startTime;
            setSearchTime(searchDuration);
            
            if (response.data?.products) {
                let processedProducts = response.data.products;
                
                // Sort by relevance if searching
                if (filters.search?.trim()) {
                    processedProducts = sortSearchResults(processedProducts, filters.search);
                    // Save search history
                    saveSearchHistory(filters.search.trim());
                }
                
                setProducts(processedProducts);
                setTotalProducts(response.data.total || 0);
                setTotalPages(Math.ceil((response.data.total || 0) / productsPerPage));
            } else {
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError(error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [filters, sortBy, currentPage]);

    useEffect(() => {
        if (activeTab === 'coffee-beans') {
            fetchProducts();
        }
    }, [fetchProducts, filters, sortBy, currentPage, activeTab]);

    useEffect(() => {
        // Always fetch categories on component mount
        fetchCategories();
    }, []);

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        
        // Add tab to URL params
        if (activeTab !== 'coffee-beans') params.set('tab', activeTab);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.set(key, value.toString());
            }
        });
        if (sortBy !== 'newest') params.set('sortBy', sortBy);
        if (currentPage > 1) params.set('page', currentPage.toString());
        
        setSearchParams(params);
    }, [filters, sortBy, currentPage, activeTab, setSearchParams]);
    
    const fetchCategories = async () => {
        try {
            console.log('🔍 Fetching categories from:', `${API_BASE_URL}/api/categories`);
            const response = await axios.get(`${API_BASE_URL}/api/categories`, { timeout: 5000 });
            console.log('📦 Categories response:', response.data);
            if (response.data?.categories) {
                console.log('✅ Setting categories:', response.data.categories);
                // Categories are fetched but not stored in state since they're not used
            } else {
                console.log('❌ No categories in response');
            }
        } catch (error) {
            console.error('❌ Failed to fetch categories:', error);
        }
    };
    
    const handleFilterChange = useCallback((key, value) => {
        console.log('🔧 Filter change:', key, '=', value);
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            console.log('🔧 New filters:', newFilters);
            return newFilters;
        });
        setCurrentPage(1);
        setError(null);
    }, []);

    const handleSearchChange = useCallback((value) => {
        setFilters(prev => ({ ...prev, search: value }));
        const cleanup = debouncedSearch(value);
        return cleanup;
    }, [debouncedSearch]);

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            setError('Lỗi khi thêm sản phẩm vào giỏ hàng');
        }
    };

    const clearFilters = useCallback(() => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            search: ''
        });
        setSortBy('newest');
        setCurrentPage(1);
        setError(null);
    }, []);

    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        // Clear search when switching tabs
        setFilters(prev => ({ ...prev, search: '' }));
        setError(null);
    }, []);

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Generate pagination numbers with ellipsis
    const paginationNumbers = useMemo(() => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); 
             i <= Math.min(totalPages - 1, currentPage + delta); 
             i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    }, [currentPage, totalPages]);

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Sản phẩm cà phê",
        "description": "Premium Vietnamese coffee beans including Arabica Cầu Đất, Robusta Lâm Đồng",
        "url": window.location.href,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": totalProducts,
            "itemListElement": products.map((product, index) => ({
                "@type": "Product",
                "position": index + 1,
                "name": product.name,
                "description": product.description,
                "image": product.image_url,                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "VND",
                    "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
            }))
        }
    };

    return (
        <>
            <Helmet>
                <title>Sản phẩm - Balan Coffee & Roastery</title>
                <meta name="description" content="Khám phá cà phê hạt nguyên chất, menu thức uống đa dạng và dịch vụ setup quán cà phê chuyên nghiệp. Từ Arabica Cầu Đất đến training nhân viên." />
                <meta name="keywords" content="cà phê rang mộc, Arabica Cầu Đất, Robusta Lâm Đồng, menu thức uống, setup quán cà phê, training nhân viên, dịch vụ cà phê" />
                <meta property="og:title" content="Sản phẩm & Dịch vụ - Balan Coffee & Roastery" />
                <meta property="og:description" content="Khám phá cà phê hạt nguyên chất, menu thức uống đa dạng và dịch vụ setup quán cà phê chuyên nghiệp." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={window.location.href} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <div className="min-h-screen bg-cream-50">
                {/* Header */}
                <div className="bg-coffee-800 text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Sản phẩm & Dịch vụ
                        </h1>
                        <p className="text-xl text-cream-200 max-w-2xl mx-auto mb-8">
                            Từ hạt cà phê nguyên chất đến dịch vụ setup quán chuyên nghiệp
                        </p>
                        
                        {/* Main Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <AdvancedSearch
                                value={filters.search}
                                onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                                onSearch={handleSearchChange}
                                placeholder="Tìm kiếm cà phê, thức uống, dịch vụ..."
                                showSuggestions={true}
                                className="w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="bg-white border-b border-coffee-200">                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap justify-center lg:justify-start">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex-1 lg:flex-none flex flex-col items-center justify-center px-4 py-6 lg:px-8 lg:py-4 border-b-2 font-medium transition-colors duration-200 min-w-0 ${
                                        activeTab === tab.id
                                            ? 'border-coffee-600 text-coffee-600 bg-coffee-50'
                                            : 'border-transparent text-coffee-500 hover:text-coffee-600 hover:border-coffee-300'
                                    }`}
                                    aria-selected={activeTab === tab.id}
                                    role="tab"
                                >
                                    <span className="text-2xl lg:text-xl mb-2 lg:mb-0 lg:mr-2">{tab.icon}</span>
                                    <div className="text-center lg:text-left">
                                        <div className="font-semibold text-sm lg:text-base">{tab.name}</div>
                                        <div className="text-xs text-coffee-400 hidden lg:block mt-1">
                                            {tab.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar - Only show for coffee beans */}
                        {activeTab === 'coffee-beans' && (
                            <aside className="lg:w-1/4">
                                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold text-coffee-800">
                                            Bộ lọc
                                        </h2>
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
                                            aria-label="Clear all filters"
                                        >
                                            Xóa tất cả
                                        </button>
                                    </div>

                                    {/* Advanced Search */}
                                    <div className="mb-6">
                                        <div className="block text-sm font-medium text-coffee-700 mb-2">
                                            Tìm kiếm
                                        </div>
                                        <AdvancedSearch
                                            value={filters.search}
                                            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                                            onSearch={handleSearchChange}
                                            placeholder="Tìm kiếm sản phẩm cà phê..."
                                            showSuggestions={true}
                                            className="w-full"
                                        />
                                    </div>                                    {/* Categories */}
                                    <div className="mb-6">
                                        
                                    </div>{/* Price Range */}
                                    <div className="mb-6">
                                        <span className="block text-sm font-medium text-coffee-700 mb-2">
                                            Khoảng giá (VND)
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                placeholder="Tối thiểu"
                                                value={filters.minPrice}
                                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                                className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                                min="0"
                                                step="1000"
                                                aria-label="Giá tối thiểu"
                                            />                                            <input
                                                type="number"
                                                placeholder="Tối đa"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                                className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                                min="0"
                                                step="1000"
                                                aria-label="Giá tối đa"
                                            />
                                        </div>
                                    </div>

                                    {/* In Stock */}
                                    <div className="mb-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={filters.inStock}
                                                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                                                className="h-4 w-4 text-coffee-600 focus:ring-coffee-500 border-coffee-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-coffee-700">
                                                Chỉ hiển thị còn hàng
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </aside>
                        )}

                        {/* Main Content */}
                        <main className={activeTab === 'coffee-beans' ? 'lg:w-3/4' : 'w-full'}>
                            {/* Tab Content */}
                            {activeTab === 'coffee-beans' && (
                                <CoffeeBeansTab
                                    products={products}
                                    loading={loading}
                                    error={error}
                                    searchTerm={filters.search}
                                    searchTime={searchTime}
                                    totalProducts={totalProducts}
                                    displayedProductsCount={displayedProductsCount}
                                    onClearSearch={() => handleFilterChange('search', '')}
                                    handleAddToCart={handleAddToCart}
                                    clearFilters={clearFilters}
                                />
                            )}

                            {activeTab === 'beverages' && (
                                <BeveragesTab
                                    searchTerm={filters.search}
                                    onClearSearch={() => handleFilterChange('search', '')}
                                />
                            )}

                            {activeTab === 'services' && (
                                <ServicesTab
                                    searchTerm={filters.search}
                                    onClearSearch={() => handleFilterChange('search', '')}
                                />
                            )}

                            {/* Sort and Pagination for Coffee Beans only */}
                            {activeTab === 'coffee-beans' && !loading && !error && products.length > 0 && (
                                <>
                                    {/* Sort and Results */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 mt-8">
                                        <div className="text-coffee-600">
                                            {`Hiển thị ${displayedProductsCount} trong tổng số ${totalProducts} sản phẩm`}
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <label htmlFor="sort-select" className="text-sm font-medium text-coffee-700">
                                                Sắp xếp theo:
                                            </label>
                                            <select
                                                id="sort-select"
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                            >
                                                <option value="newest">Mới nhất</option>
                                                <option value="name">Tên</option>
                                                <option value="price_low">Giá thấp đến cao</option>
                                                <option value="price_high">Giá cao đến thấp</option>
                                                <option value="popularity">Phổ biến</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav className="flex justify-center items-center space-x-2 mt-8" aria-label="Product pagination">
                                            <button
                                                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-coffee-300 rounded-lg text-coffee-700 hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                                aria-label="Go to previous page"
                                            >
                                                Trước
                                            </button>
                                            
                                            {paginationNumbers.map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${currentPage}-${index}`} className="px-2 text-coffee-500">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500 ${
                                                            currentPage === page
                                                                ? 'bg-coffee-600 text-white border-coffee-600'
                                                                : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                                                        }`}
                                                        aria-label={`Go to page ${page}`}
                                                        aria-current={currentPage === page ? 'page' : undefined}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                            
                                            <button
                                                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-coffee-300 rounded-lg text-coffee-700 hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                                aria-label="Go to next page"
                                            >
                                                Sau
                                            </button>
                                        </nav>
                                    )}
                                </>
                            )}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Products;
