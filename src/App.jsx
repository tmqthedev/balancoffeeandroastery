import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { initAnalytics } from './utils/analytics';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    <span className="ml-3 text-gray-600">Đang tải...</span>
  </div>
);

// Lazy load route components for better code splitting
const PublicRoutes = React.lazy(() => import('./routes/PublicRoutes'));
const AdminRoutes = React.lazy(() => import('./routes/AdminRoutes'));

function App() {
  // Initialize analytics on app mount
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <Navbar />
              <main className="pt-16">
                <Routes>
                  {/* Admin Routes - Separate chunk */}
                  <Route path="/admin/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminRoutes />
                    </Suspense>
                  } />
                  
                  {/* Public Routes - Main chunk */}
                  <Route path="/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PublicRoutes />
                    </Suspense>
                  } />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
