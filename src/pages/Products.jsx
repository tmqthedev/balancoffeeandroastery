import React, { useState, useEffect, useCallback, useMemo, useRef, Suspense } from 'react';
import SEOHelmet from '../components/common/SEOHelmet';
import { useCart } from '../constants/cartConstants';
import { useSafeDebounce, useSafeSearch, useSafeIntersectionObserver } from '../hooks/useSafeHooks';
import { LoadingSpinner, ProductCardSkeleton } from '../components/common/LoadingComponents';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load tab components để giảm initial bundle size
const CoffeeBeansTab = React.lazy(() => import('../components/common/CoffeeBeansTab'));
const BeveragesTab = React.lazy(() => import('../components/common/BeveragesTab'));
const ServicesTab = React.lazy(() => import('../components/common/ServicesTab'));

// Use Vite proxy instead of hardcoded URL
const API_BASE_URL = '/api';

// Memoized tab configuration
const TAB_CONFIG = {
    'coffee-beans': { 
        title: 'Hạt Cà Phê', 
        component: CoffeeBeansTab,
        seoTitle: 'Hạt Cà Phê Rang Mộc Nguyên Chất - Arabica & Robusta',
        seoDescription: 'Khám phá bộ sưu tập hạt cà phê rang mộc Arabica và Robusta chất lượng cao từ Cầu Đất, Lâm Đồng.'
    },
    'beverages': { 
        title: 'Đồ Uống', 
        component: BeveragesTab,
        seoTitle: 'Đồ Uống Cà Phê & Trà Đặc Biệt - Pha Chế Thủ Công',
        seoDescription: 'Thưởng thức các loại đồ uống cà phê và trà được pha chế thủ công với hương vị độc đáo.'
    },
    'services': { 
        title: 'Dịch Vụ', 
        component: ServicesTab,
        seoTitle: 'Dịch Vụ Cà Phê Chuyên Nghiệp - Tư Vấn & Rang Xay',
        seoDescription: 'Dịch vụ tư vấn cà phê chuyên nghiệp, rang xay theo yêu cầu và các giải pháp cà phê doanh nghiệp.'
    }
};

const Products = () => {
    const [activeTab, setActiveTab] = useState('coffee-beans');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isScrolled, setIsScrolled] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false
    });
    const [sortBy] = useState('name'); // setSortBy not used yet
    
    // Ref for the tab navigation section
    const tabNavigationRef = useRef(null);

    // Cart functionality
    // addToCart is intentionally unused in this listing page; cart operations happen in product cards/components
    // keep useCart for potential future use
    useCart();

    // Performance hooks - using safe versions
    const debouncedSearch = useSafeDebounce(filters.search, 300);
    const { searchResults, isSearching } = useSafeSearch(debouncedSearch, products);

    // Intersection observer để lazy load content
    const [shouldLoadContent, setShouldLoadContent] = useState(false);
    const [setContentRef, entry] = useSafeIntersectionObserver({ threshold: 0.1 });
    
    useEffect(() => {
        if (entry?.isIntersecting) {
            setShouldLoadContent(true);
        }
    }, [entry]);

    // Tab change handler (used by desktop & mobile tab buttons)
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        setCurrentPage(1);
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false
        });
        // Scroll to the tab navigation position for better UX
        if (tabNavigationRef.current) {
            const navTop = tabNavigationRef.current.offsetTop;
            const headerHeight = 64;
            window.scrollTo({ top: navTop - headerHeight - 10, behavior: 'smooth' });
        }
    }, []);

    // Memoized current tab config
    const currentTabConfig = useMemo(() => TAB_CONFIG[activeTab], [activeTab]);

    // Memoized tab component
    const CurrentTabComponent = useMemo(() => {
        const Component = currentTabConfig.component;
        return (
            <ErrorBoundary>
                <Suspense fallback={
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {Array.from({ length: 6 }, (_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                }>
                    <Component 
                        products={debouncedSearch ? searchResults : products}
                        loading={loading || isSearching}
                        error={error}
                        currentPage={currentPage}
                        filters={filters}
                        setFilters={setFilters}
                        sortBy={sortBy}
                        setCurrentPage={setCurrentPage}
                    />
                </Suspense>
            </ErrorBoundary>
        );
    }, [currentTabConfig.component, debouncedSearch, searchResults, products, loading, isSearching, error, currentPage, filters, sortBy, setCurrentPage]);

    // Scroll effect với debounce
    useEffect(() => {
        let timeoutId;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setIsScrolled(window.scrollY > 100);
            }, 10);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, []);

    const productsPerPage = 12;

    // Handle scroll effect for tab navigation
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const tabs = [
        {
            id: 'coffee-beans',
            name: 'Cà phê hạt',
            icon: '☕',
            description: 'Arabica & Robusta nguyên chất'
        },
        {
            id: 'beverages',
            name: 'Thức uống',
            icon: '🥤',
            description: 'Menu đa dạng & sáng tạo'
        },
        {
            id: 'services',
            name: 'Dịch vụ',
            icon: '🏪',
            description: 'Setup & Training chuyên nghiệp'
        }
    ];

    // Fetch products function
    const fetchProducts = useCallback(async () => {
        if (activeTab !== 'coffee-beans') return;
        
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.inStock) params.append('inStock', 'true');
            params.append('page', currentPage.toString());
            params.append('limit', productsPerPage.toString());
            params.append('sortBy', sortBy);
            
            const response = await fetch(`${API_BASE_URL}/products?${params}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            
            const data = await response.json();
            setProducts(data.products || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, filters, currentPage, sortBy]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const totalProducts = useMemo(() => products.length, [products]);

    // Clear search functionality
    const handleClearSearch = () => {
        setFilters(prev => ({ ...prev, search: '' }));
        setCurrentPage(1);
    };

    // clearFilters used by CoffeeBeansTab to reset local search/filters
    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false
        });
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-white">
            <SEOHelmet
                title="Sản phẩm - Balan Coffee & Roastery"
                description="Khám phá bộ sưu tập cà phê rang mộc chất lượng cao từ Balan Coffee & Roastery. Hạt cà phê Arabica Cầu Đất, Typica Kongo, Robusta Lâm Đồng và các dịch vụ cà phê tuyệt vời."
                keywords="sản phẩm cà phê, hạt cà phê rang mộc, Arabica Cầu Đất, Typica Kongo, Robusta Lâm Đồng, dịch vụ cà phê, đồ uống cà phê"
            />
            {/* Enhanced Sticky Tab Navigation - Always Visible Below Header */}
            <div 
                ref={tabNavigationRef}
                className={`bg-white shadow-lg border-b border-gray-200 sticky top-16 z-40 transition-all duration-300 ${
                    isScrolled 
                        ? 'backdrop-blur-md bg-white/98 shadow-xl border-gray-300' 
                        : 'backdrop-blur-sm bg-white/95 shadow-md border-gray-200'
                }`}
            >
                <div className="container mx-auto px-4">
                    {/* Desktop Tab Navigation */}
                    <div className="hidden md:flex justify-center">
                        <div className={`inline-flex bg-gray-50/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50 transition-all duration-300 ${
                            isScrolled ? 'm-3 scale-95' : 'm-4 scale-100'
                        }`}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`relative px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 group min-w-[140px] tab-button-enhanced ${
                                        activeTab === tab.id
                                            ? 'bg-white text-brand-primary shadow-lg border border-gray-100/50 scale-105 active'
                                            : 'text-gray-600 hover:text-brand-primary hover:bg-white/80 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className={`text-lg transition-all duration-300 ${
                                            activeTab === tab.id 
                                                ? 'scale-110 drop-shadow-sm filter brightness-110' 
                                                : 'group-hover:scale-105'
                                        }`}>
                                            {tab.icon}
                                        </span>
                                        <div className="text-center">
                                            <div className="font-semibold tracking-wide whitespace-nowrap">{tab.name}</div>
                                            <div className={`text-xs transition-opacity duration-300 whitespace-nowrap ${
                                                activeTab === tab.id ? 'opacity-80' : 'opacity-60'
                                            } ${isScrolled ? 'hidden' : 'block'}`}>
                                                {tab.description}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Enhanced Active glow effect */}
                                    {activeTab === tab.id && (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 via-brand-secondary/5 to-brand-primary/5 rounded-xl pointer-events-none"></div>
                                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl blur-sm pointer-events-none"></div>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Tab Navigation - Enhanced */}
                    <div className="md:hidden px-2 py-3">
                        <div className={`flex justify-between bg-gray-50/90 backdrop-blur-sm rounded-xl p-1.5 border border-gray-200/50 shadow-md transition-all duration-300 ${
                            isScrolled ? 'scale-95' : 'scale-100'
                        }`}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex-1 py-3 px-1 rounded-lg font-medium text-xs transition-all duration-300 tab-button-enhanced ${
                                        isScrolled ? 'min-h-[50px]' : 'min-h-[60px]'
                                    } ${
                                        activeTab === tab.id
                                            ? 'bg-white text-brand-primary shadow-lg scale-105 active'
                                            : 'text-gray-600 hover:text-brand-primary hover:bg-white/70 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex flex-col items-center justify-center space-y-1">
                                        <span className={`text-lg transition-all duration-300 ${
                                            activeTab === tab.id ? 'scale-110 drop-shadow-sm' : ''
                                        }`}>
                                            {tab.icon}
                                        </span>
                                        <div className={`font-semibold whitespace-nowrap text-center px-1 ${
                                            isScrolled ? 'text-xs leading-tight' : 'text-xs'
                                        }`}>{tab.name}</div>
                                    </div>
                                    {/* Mobile active indicator */}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area with Enhanced Spacing */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Tab Content Transition */}
                <div className="transition-all duration-500 ease-in-out">
                    {/* Coffee Beans Tab */}
                    {activeTab === 'coffee-beans' && (
                        <div className="animate-fadeIn">
                            <CoffeeBeansTab
                                products={products}
                                loading={loading}
                                error={error}
                                searchTerm={filters.search}
                                searchTime={0}
                                totalProducts={totalProducts}
                                onClearSearch={handleClearSearch}
                                clearFilters={clearFilters}
                            />
                        </div>
                    )}

                    {/* Beverages Tab */}
                    {activeTab === 'beverages' && (
                        <div className="animate-fadeIn">
                            <BeveragesTab 
                                searchTerm={filters.search}
                                onClearSearch={handleClearSearch}
                            />
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === 'services' && (
                        <div className="animate-fadeIn">
                            <ServicesTab 
                                searchTerm={filters.search}
                                onClearSearch={handleClearSearch}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Wrap với ErrorBoundary để catch hook errors
const ProductsWithErrorBoundary = () => (
    <ErrorBoundary showErrorDetails={true}>
        <Products />
    </ErrorBoundary>
);

export default ProductsWithErrorBoundary;
