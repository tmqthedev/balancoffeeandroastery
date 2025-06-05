import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useCart } from '../context/CartContext';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
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

    const productsPerPage = 12;

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
    }, [products.length]);    useEffect(() => {
        fetchProducts();
    }, [filters, sortBy, currentPage]); // Direct dependencies instead of fetchProducts

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.set(key, value.toString());
            }
        });
        if (sortBy !== 'newest') params.set('sortBy', sortBy);
        if (currentPage > 1) params.set('page', currentPage.toString());
        
        setSearchParams(params);
    }, [filters, sortBy, currentPage, setSearchParams]);    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
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
              if (response.data?.products) {
                setProducts(response.data.products);
                setTotalProducts(response.data.total || 0);
                setTotalPages(Math.ceil((response.data.total || 0) / productsPerPage));
            } else {
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(1);
            }        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError(error.response?.data?.message || 'Lỗi khi tải danh sách sản phẩm');
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(1);
                } finally {
            setLoading(false);
        }
    }, [filters, sortBy, currentPage]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/categories`, { timeout: 5000 });
            if (response.data?.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
        setError(null);
    }, []);

    const handleSearchChange = useCallback((value) => {
        setFilters(prev => ({ ...prev, search: value }));
        const cleanup = debouncedSearch(value);
        return cleanup;
    }, [debouncedSearch]);    const handleAddToCart = async (product) => {
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
    }, [currentPage, totalPages]);    const structuredData = {
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
                "image": product.image_url,
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "USD",
                    "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                }
            }))
        }
    };

    return (        <>
            <Helmet>
                <title>Sản phẩm - Balan Coffee & Roastery</title>
                <meta name="description" content="Mua hạt cà phê Việt Nam cao cấp bao gồm Arabica Cầu Đất, Robusta Lâm Đồng và các blend chuyên nghiệp. Miễn phí vận chuyển cho đơn hàng trên 1,000,000đ." />
                <meta name="keywords" content="cà phê rang mộc, Arabica Cầu Đất, Robusta Lâm Đồng, hạt cà phê, cà phê Việt Nam, coffee beans, Vietnamese coffee" />
                <meta property="og:title" content="Sản phẩm - Balan Coffee & Roastery" />
                <meta property="og:description" content="Mua hạt cà phê Việt Nam cao cấp bao gồm Arabica Cầu Đất, Robusta Lâm Đồng và các blend chuyên nghiệp." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href={window.location.href} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <div className="min-h-screen bg-cream-50">
                {/* Header */}                <div className="bg-coffee-800 text-white py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Sản phẩm
                        </h1>
                        <p className="text-xl text-cream-200 max-w-2xl mx-auto">
                            Khám phá bộ sưu tập cà phê rang mộc chất lượng cao của chúng tôi
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <aside className="lg:w-1/4">                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
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

                                {/* Search */}
                                <div className="mb-6">
                                    <label htmlFor="search-input" className="block text-sm font-medium text-coffee-700 mb-2">
                                        Tìm kiếm
                                    </label>
                                    <input
                                        id="search-input"
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder="Tìm kiếm sản phẩm..."
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <label htmlFor="category-select" className="block text-sm font-medium text-coffee-700 mb-2">
                                        Danh mục
                                    </label>
                                    <select
                                        id="category-select"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                    >
                                        <option value="">Tất cả danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.slug}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>                                {/* Price Range */}
                                <div className="mb-6">
                                    <h3 className="block text-sm font-medium text-coffee-700 mb-2">
                                        Khoảng giá
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder="Tối thiểu"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                            min="0"
                                            step="0.01"
                                            aria-label="Giá tối thiểu"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Tối đa"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                            min="0"
                                            step="0.01"
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

                        {/* Products Grid */}
                        <main className="lg:w-3/4">
                            {/* Sort and Results */}                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div className="text-coffee-600">
                                    {(() => {
                                        if (loading) {
                                            return 'Đang tải...';
                                        }
                                        if (error) {
                                            return <span className="text-red-600">{error}</span>;
                                        }
                                        return `Hiển thị ${displayedProductsCount} trong tổng số ${totalProducts} sản phẩm`;
                                    })()}
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
                            </div>                            {/* Error State */}
                            {error && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                                        Có lỗi xảy ra
                                    </h3>
                                    <p className="text-coffee-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            fetchProducts();
                                        }}
                                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}                            
                            
                            {/* Loading State */}
                            {loading && !error && (
                                <div className="flex justify-center items-center h-64">
                                    <output aria-live="polite" aria-label="Đang tải">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
                                    </output>
                                </div>
                            )}

                            {/* No Products Found */}
                            {!loading && !error && products.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">☕</div>
                                    <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                                        Không tìm thấy sản phẩm
                                    </h3>
                                    <p className="text-coffee-600 mb-4">
                                        Hãy thử điều chỉnh bộ lọc để tìm kiếm
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                </div>
                            )}

                            {/* Products Grid */}
                            {!loading && !error && products.length > 0 && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {products.map(product => (
                                            <article key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                <Link to={`/products/${product.id}`} aria-label={`View ${product.name} details`}>
                                                    <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center overflow-hidden">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                                loading="lazy"
                                                            />                                                        ) : (
                                                            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMyIDJDMTcuNjQgMiA2IDE0LjM2IDYgMjlDNiAzMy42NCA3LjQ0IDM3LjkyIDEwIDQxLjQyVjQ4QzEwIDUwLjIxIDExLjc5IDUyIDEzIDUySDUxQzUzLjIxIDUyIDU1IDUwLjIxIDU1IDQ4VjQxLjQyQzU3LjU2IDM3LjkyIDU5IDMzLjY0IDU5IDI5QzU5IDE0LjM2IDQ3LjM2IDIgMzMgMkgzMloiIGZpbGw9IiM2RjQ1MzAiLz4KPHBhdGggZD0iTTE2IDI5QzE2IDM0LjUyIDIwLjQ4IDM5IDI2IDM5SDM4QzQzLjUyIDM5IDQ4IDM0LjUyIDQ4IDI5QzQ4IDIzLjQ4IDQzLjUyIDE5IDM4IDE5SDI2QzIwLjQ4IDE5IDE2IDIzLjQ4IDE2IDI5WiIgZmlsbD0iIzg3NjM0NSIvPgo8L3N2Zz4K" alt="Coffee placeholder" className="text-4xl w-16 h-16 mx-auto text-coffee-400" />
                                                        )}
                                                    </div>
                                                </Link>
                                                
                                                <div className="p-4">
                                                    <Link to={`/products/${product.id}`}>
                                                        <h3 className="text-lg font-semibold text-coffee-800 mb-2 hover:text-coffee-600 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                    
                                                    <p className="text-coffee-600 text-sm mb-3 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xl font-bold text-coffee-800">
                                                            ${product.price?.toFixed(2)}
                                                        </span>                                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                                            product.stock_quantity > 0 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.stock_quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                                                        </span>
                                                    </div>
                                                      <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.stock_quantity === 0}
                                                            className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:bg-coffee-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2"
                                                            aria-label={`Add ${product.name} to cart`}
                                                        >
                                                            Thêm vào giỏ
                                                        </button>
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 text-center"
                                                            aria-label={`View ${product.name} details`}
                                                        >
                                                            Xem chi tiết
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav className="flex justify-center items-center space-x-2" aria-label="Product pagination">
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
