import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    <span className="ml-3 text-gray-600">Đang tải...</span>
  </div>
);

// Lazy load route components
const PublicRoutes = React.lazy(() => import('./routes/PublicRoutes'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App min-h-screen">
            <Helmet>
              <title>Balan Coffee & Roastery - Cà phê rang mộc Việt Nam</title>
              <meta name="description" content="Cà phê rang mộc chất lượng cao từ Balan Coffee & Roastery. Arabica Cầu Đất, Robusta Lâm Đồng nguyên chất." />
            </Helmet>
            <Navbar />
            <main className="pt-16">
              <Routes>
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
  );
}

export default App;
