import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Products = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToCart } = useCart();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        inStock: searchParams.get('inStock') === 'true' || false,
        search: searchParams.get('search') || ''
    });
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const productsPerPage = 12;

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [filters, sortBy, currentPage]);

    useEffect(() => {
        // Update URL params when filters change
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        if (sortBy !== 'newest') params.set('sortBy', sortBy);
        if (currentPage > 1) params.set('page', currentPage);
        setSearchParams(params);
    }, [filters, sortBy, currentPage, setSearchParams]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                sortBy,
                page: currentPage,
                limit: productsPerPage
            };
            
            const response = await axios.get('/api/products', { params });
            setProducts(response.data.products);
            setTotalPages(Math.ceil(response.data.total / productsPerPage));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleAddToCart = async (product) => {
        try {
            await addToCart(product.id, 1);
        } catch (error) {
            console.error('Failed to add to cart:', error);
        }
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            search: ''
        });
        setSortBy('newest');
        setCurrentPage(1);
    };

    return (
        <>
            <Helmet>
                <title>{t('products.title')} - Balan Coffee</title>
                <meta name="description" content="Shop premium Vietnamese coffee beans including Arabica Cầu Đất, Robusta Lâm Đồng, and expertly crafted blends. Free shipping on orders over $50." />
                <meta name="keywords" content={t('seo.keywords')} />
                <meta property="og:title" content={`${t('products.title')} - Balan Coffee`} />
                <meta property="og:description" content="Shop premium Vietnamese coffee beans including Arabica Cầu Đất, Robusta Lâm Đồng, and expertly crafted blends." />
                <meta property="og:type" content="website" />
                <link rel="canonical" href={window.location.href} />
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
                                    <h3 className="text-lg font-semibold text-coffee-800">
                                        {t('common.filter')}
                                    </h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-coffee-600 hover:text-coffee-800"
                                    >
                                        Clear All
                                    </button>
                                </div>

                                {/* Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('common.search')}
                                    </label>
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                    />
                                </div>

                                {/* Categories */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-coffee-700 mb-2">
                                        {t('products.categories')}
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
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
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
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
                                            {t('products.inStock')} only
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
                                    ) : (
                                        `Showing ${products.length} products`
                                    )}
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-coffee-700">
                                        {t('products.sortBy')}:
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
                                    >
                                        <option value="newest">{t('products.newest')}</option>
                                        <option value="name">{t('products.name')}</option>
                                        <option value="price_low">{t('products.price')} (Low to High)</option>
                                        <option value="price_high">{t('products.price')} (High to Low)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Products Grid */}
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">☕</div>
                                    <h3 className="text-xl font-semibold text-coffee-800 mb-2">
                                        No products found
                                    </h3>
                                    <p className="text-coffee-600 mb-4">
                                        Try adjusting your filters or search terms
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-2 rounded-lg transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {products.map(product => (
                                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                                <Link to={`/products/${product.id}`}>
                                                    <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-4xl">☕</span>
                                                        )}
                                                    </div>
                                                </Link>
                                                
                                                <div className="p-4">
                                                    <Link to={`/products/${product.id}`}>
                                                        <h3 className="text-lg font-semibold text-coffee-800 mb-2 hover:text-coffee-600">
                                                            {product.name}
                                                        </h3>
                                                    </Link>
                                                    
                                                    <p className="text-coffee-600 text-sm mb-3 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xl font-bold text-coffee-800">
                                                            ${product.price}
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
                                                            className="flex-1 bg-coffee-600 hover:bg-coffee-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:bg-coffee-300 disabled:cursor-not-allowed"
                                                        >
                                                            {t('products.addToCart')}
                                                        </button>
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="bg-coffee-100 hover:bg-coffee-200 text-coffee-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            {t('products.viewDetails')}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-coffee-300 rounded-lg text-coffee-700 hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('common.previous')}
                                            </button>
                                            
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-4 py-2 border rounded-lg ${
                                                        currentPage === page
                                                            ? 'bg-coffee-600 text-white border-coffee-600'
                                                            : 'border-coffee-300 text-coffee-700 hover:bg-coffee-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-coffee-300 rounded-lg text-coffee-700 hover:bg-coffee-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('common.next')}
                                            </button>
                                        </div>
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
