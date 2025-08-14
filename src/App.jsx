import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { LoadingSpinner } from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load route components
const PublicRoutes = React.lazy(() => import('./routes/PublicRoutes'));

// Component to conditionally render navbar and footer
const AppLayout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App min-h-screen">
      <Helmet>
        <title>Balan Coffee & Roastery - Cà phê rang mộc Việt Nam</title>
        <meta name="description" content="Cà phê rang mộc chất lượng cao từ Balan Coffee & Roastery. Arabica Cầu Đất, Robusta Lâm Đồng nguyên chất." />
      </Helmet>
      
      {!isAdminRoute && <Navbar />}
      
      <main className={isAdminRoute ? '' : 'pt-16'}>
        <Routes>
          <Route path="/*" element={
            <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang..." fullScreen />}>
              <PublicRoutes />
            </Suspense>
          } />
        </Routes>
      </main>
      
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppLayout />
            </Router>
          </CartProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
