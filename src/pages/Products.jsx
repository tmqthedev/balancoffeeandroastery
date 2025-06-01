import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useCart } from '../context/CartContext';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Products = () => {
    const { t } = useTranslation();
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
    }, [products.length]);

    useEffect(() => {
        fetchProducts();
    }, [filters, sortBy, currentPage]);

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
    }, [filters, sortBy, currentPage, setSearchParams]);

    const fetchProducts = async () => {
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
            
            if (response.data && response.data.products) {
                setProducts(response.data.products);
                setTotalProducts(response.data.total || 0);
                setTotalPages(Math.ceil((response.data.total || 0) / productsPerPage));
            } else {
                setProducts([]);
                setTotalProducts(0);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setError(error.response?.data?.message || t('common.errorLoadingProducts'));
            setProducts([]);
            setTotalProducts(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/categories`, { timeout: 5000 });
            if (response.data && response.data.categories) {
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
    }, [debouncedSearch]);

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product.id, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            setError(t('cart.addError'));
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
    }, [currentPage, totalPages]);

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": t('products.title'),
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

    return (
        <>
            <Helmet>
                <title>{t('products.title')} - Balan Coffee & Roastery</title>
                <meta name="description" content="Shop premium Vietnamese coffee beans including Arabica Cầu Đất, Robusta Lâm Đồng, and expertly crafted blends. Free shipping on orders over $50." />
                <meta name="keywords" content={`${t('seo.keywords')}, cà phê rang mộc, Arabica Cầu Đất, Robusta Lâm Đồng, coffee beans, Vietnamese coffee`} />
                <meta property="og:title" content={`${t('products.title')} - Balan Coffee & Roastery`} />
                <meta property="og:description" content="Shop premium Vietnamese coffee beans including Arabica Cầu Đất, Robusta Lâm Đồng, and expertly crafted blends." />
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
                            {t('products.title')}
                        </h1>
                        <p className="text-xl text-cream-200 max-w-2xl mx-auto">
                            {t('products.subtitle')}
                        </p>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar */}
                        <aside className="lg:w-1/4">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-coffee-800">
                                        {t('common.filter')}
                                    </h2>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-coffee-600 hover:text-coffee-800 transition-colors"
                                        aria-label="Clear all filters"
                                    >
                                        {t('common.clearAll')}
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <label htmlFor="search-input" className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('common.search')}
                                    </label>
                                    <input
                                        id="search-input"
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        placeholder={t('products.searchPlaceholder')}
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <label htmlFor="category-select" className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('products.categories')}
                                    </label>
                                    <select
                                        id="category-select"
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                    >
                                        <option value="">{t('products.allCategories')}</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.slug}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('products.priceRange')}
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number"
                                            placeholder={t('common.min')}
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                            min="0"
                                            step="0.01"
                                        />
                                        <input
                                            type="number"
                                            placeholder={t('common.max')}
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                            min="0"
                                            step="0.01"
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
                                            {t('products.inStock')} {t('common.only')}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </aside>

                        {/* Products Grid */}
                        <main className="lg:w-3/4">
                            {/* Sort and Results */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <div className="text-coffee-600">
                                    {loading ? (
                                        t('common.loading')
                                    ) : error ? (
                                        <span className="text-red-600">{error}</span>
                                    ) : (
                                        t('products.showingResults', { 
                                            count: displayedProductsCount, 
                                            total: totalProducts 
                                        })
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <label htmlFor="sort-select" className="text-sm font-medium text-coffee-700">
                                        {t('products.sortBy')}:
                                    </label>
                                    <select
                                        id="sort-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 transition-colors"
                                    >
                                        <option value="newest">{t('products.newest')}</option>
                                        <option value="name">{t('products.name')}</option>
                                        <option value="price_low">{t('products.priceLowToHigh')}</option>
                                        <option value="price_high">{t('products.priceHighToLow')}</option>
                                        <option value="popularity">{t('products.popularity')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Error State */}
                            {error && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                                        {t('common.error')}
                                    </h3>
                                    <p className="text-coffee-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            fetchProducts();
                                        }}
                                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        {t('common.tryAgain')}
                                    </button>
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && !error && (
                                <div className="flex justify-center items-center h-64" role="status" aria-label={t('common.loading')}>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
                                </div>
                            )}

                            {/* No Products Found */}
                            {!loading && !error && products.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">☕</div>
                                    <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                                        {t('products.noProductsFound')}
                                    </h3>
                                    <p className="text-coffee-600 mb-4">
                                        {t('products.tryAdjustingFilters')}
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        {t('common.clearFilters')}
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
                                                            />
                                                        ) : (
                                                            <span className="text-4xl" role="img" aria-label="Coffee">☕</span>
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
                                                        </span>
                                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                                            product.stock_quantity > 0 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.stock_quantity > 0 ? t('products.inStock') : t('products.outOfStock')}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleAddToCart(product)}
                                                            disabled={product.stock_quantity === 0}
                                                            className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:bg-coffee-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2"
                                                            aria-label={`Add ${product.name} to cart`}
                                                        >
                                                            {t('products.addToCart')}
                                                        </button>
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:ring-offset-2 text-center"
                                                            aria-label={`View ${product.name} details`}
                                                        >
                                                            {t('products.viewDetails')}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav className="flex justify-center items-center space-x-2" aria-label="Product pagination">
                                            <button
                                                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-coffee-300 rounded-lg text-coffee-700 hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coffee-500"
                                                aria-label="Go to previous page"
                                            >
                                                {t('common.previous')}
                                            </button>
                                            
                                            {paginationNumbers.map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="px-2 text-coffee-500">
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
                                                {t('common.next')}
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
