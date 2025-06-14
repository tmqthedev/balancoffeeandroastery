import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { LoadingSpinner } from './components/common/Loading';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load route components
const PublicRoutes = React.lazy(() => import('./routes/PublicRoutes'));

function App() {  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App min-h-screen">
              <Helmet>
                <title>Balan Coffee & Roastery - Cà phê rang mộc Việt Nam</title>
                <meta name="description" content="Cà phê rang mộc chất lượng cao từ Balan Coffee & Roastery. Arabica Cầu Đất, Robusta Lâm Đồng nguyên chất." />
              </Helmet>
              <Navbar />            <main className="pt-16">
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
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
