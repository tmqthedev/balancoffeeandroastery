import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Loading component for public routes
const PublicLoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    <span className="ml-3 text-gray-600">Đang tải...</span>
  </div>
);

// Lazy load public pages
const Home = React.lazy(() => import('../pages/Home'));
const Products = React.lazy(() => import('../pages/Products'));
const ProductDetail = React.lazy(() => import('../pages/ProductDetail'));
const Cart = React.lazy(() => import('../pages/Cart'));
const Blog = React.lazy(() => import('../pages/BlogSimple'));
const BlogPost = React.lazy(() => import('../pages/BlogPost'));
const About = React.lazy(() => import('../pages/About'));
const Contact = React.lazy(() => import('../pages/Contact'));
const Auth = React.lazy(() => import('../pages/auth/Auth'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

// Protected pages
const Checkout = React.lazy(() => import('../pages/Checkout'));
const PaymentResult = React.lazy(() => import('../components/payment/PaymentResult'));
const Account = React.lazy(() => import('../pages/Account'));

const PublicRoutes = () => {
  return (
    <Suspense fallback={<PublicLoadingSpinner />}>      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
          {/* Auth Routes */}
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/payment/result" element={
          <ProtectedRoute>
            <PaymentResult />
          </ProtectedRoute>
        } />
        <Route path="/account/*" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default PublicRoutes;
