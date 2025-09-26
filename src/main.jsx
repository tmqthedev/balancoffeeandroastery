import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startPerformanceMonitoring } from './utils/performanceMonitor.js'

// Khởi tạo performance monitoring
if (import.meta.env.DEV || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING) {
  startPerformanceMonitoring();
}

// Hide loading spinner
const hideLoadingSpinner = () => {
  const loadingEl = document.getElementById('app-loading');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    loadingEl.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => {
      loadingEl.style.display = 'none';
    }, 300);
  }
};

// Performance-optimized root creation
const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  const root = createRoot(rootElement);
  
  root.render(
    // <StrictMode>
      <App />
    // </StrictMode>
  );
  
  // Hide loading spinner after React renders
  setTimeout(hideLoadingSpinner, 100);
};

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
