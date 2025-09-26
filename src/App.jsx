import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
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
  return (
    <div className="App min-h-screen">
      <Navbar />
      
      <main className="pt-16">
        <Routes>
          <Route path="/*" element={
            <Suspense fallback={<LoadingSpinner size="large" message="Đang tải trang..." fullScreen />}>
              <PublicRoutes />
            </Suspense>
          } />
        </Routes>
      </main>
      
      <Footer />
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
