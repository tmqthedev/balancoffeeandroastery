import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Home = () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('seo.title')}</title>
                <meta name="description" content={t('seo.description')} />
                <meta name="keywords" content={t('seo.keywords')} />
                <meta property="og:title" content={t('seo.title')} />
                <meta property="og:description" content={t('seo.description')} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-coffee-800 via-coffee-700 to-coffee-900 text-white">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="relative container mx-auto px-4 py-20 md:py-32">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                {t('hero.title')}
                            </h1>
                            <p className="text-xl md:text-2xl mb-4 text-cream-100 opacity-90">
                                {t('hero.subtitle')}
                            </p>
                            <p className="text-lg mb-8 text-cream-200 max-w-2xl mx-auto leading-relaxed">
                                {t('hero.description')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/products"
                                    className="bg-coffee-500 hover:bg-coffee-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg"
                                >
                                    {t('hero.shopNow')}
                                </Link>
                                <Link
                                    to="/about"
                                    className="bg-transparent border-2 border-cream-200 hover:bg-white hover:text-coffee-800 text-cream-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200"
                                >
                                    {t('hero.learnMore')}
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Coffee Bean Decoration */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden">
                        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-20">
                            <path d="M0,96L1200,0L1200,120L0,120Z" fill="rgb(254, 252, 232)"></path>
                        </svg>
                    </div>
                </section>

                {/* Featured Products Section */}
                <section className="py-16 bg-cream-50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-4">
                                {t('products.title')}
                            </h2>
                            <p className="text-lg text-coffee-600 max-w-2xl mx-auto">
                                {t('products.subtitle')}
                            </p>
                        </div>

                        {/* Product Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
                                    <span className="text-6xl">☕</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">{t('products.arabica')}</h3>
                                    <p className="text-coffee-600 mb-4">Premium Arabica coffee from Vietnam highlands</p>
                                    <Link
                                        to="/products?category=arabica"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        {t('products.viewDetails')} →
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-300 to-coffee-400 flex items-center justify-center">
                                    <span className="text-6xl">🌱</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">{t('products.robusta')}</h3>
                                    <p className="text-coffee-600 mb-4">Strong and bold Robusta from Lam Dong</p>
                                    <Link
                                        to="/products?category=robusta"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        {t('products.viewDetails')} →
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gradient-to-br from-coffee-400 to-coffee-500 flex items-center justify-center">
                                    <span className="text-6xl">🔥</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-coffee-800 mb-2">{t('products.blend')}</h3>
                                    <p className="text-coffee-600 mb-4">Expertly crafted coffee blends</p>
                                    <Link
                                        to="/products?category=blend"
                                        className="text-coffee-600 hover:text-coffee-800 font-medium"
                                    >
                                        {t('products.viewDetails')} →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/products"
                                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                            >
                                {t('products.viewDetails')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-6">
                                    {t('footer.about.title')}
                                </h2>
                                <p className="text-lg text-coffee-600 mb-6 leading-relaxed">
                                    {t('footer.about.description')}
                                </p>
                                <p className="text-coffee-600 mb-8 leading-relaxed">
                                    From the misty highlands of Vietnam to your cup, we ensure every bean tells a story of passion, tradition, and excellence. Our sustainable farming practices and direct trade relationships guarantee the finest quality while supporting local communities.
                                </p>
                                <Link
                                    to="/about"
                                    className="bg-coffee-600 hover:bg-coffee-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                                >
                                    {t('hero.learnMore')}
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">100%</div>
                                    <div className="text-coffee-600">Vietnamese Coffee</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">50+</div>
                                    <div className="text-coffee-600">Coffee Varieties</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">15+</div>
                                    <div className="text-coffee-600">Years Experience</div>
                                </div>
                                <div className="bg-coffee-100 rounded-lg p-6 text-center">
                                    <div className="text-3xl font-bold text-coffee-800 mb-2">1000+</div>
                                    <div className="text-coffee-600">Happy Customers</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-coffee-800 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Experience Premium Vietnamese Coffee?
                        </h2>
                        <p className="text-xl text-cream-100 mb-8 max-w-2xl mx-auto">
                            Join thousands of coffee lovers who trust us for their daily brew. Start your coffee journey today.
                        </p>
                        <Link
                            to="/products"
                            className="bg-coffee-500 hover:bg-coffee-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 inline-block"
                        >
                            {t('hero.shopNow')}
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Home;
