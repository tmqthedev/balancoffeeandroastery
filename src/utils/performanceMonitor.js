/**
 * Performance testing utilities
 * Sử dụng để test và monitor performance của ứng dụng
 */

// Web Vitals measurement
export const measureWebVitals = () => {
  if (typeof window === 'undefined') return;

  const vitals = {};

  // First Contentful Paint (FCP)
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = entry.startTime;
            console.log('First Contentful Paint:', entry.startTime);
          }
        });
      });
      observer.observe({ type: 'paint', buffered: true });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  // Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      vitals.lcp = lastEntry.startTime;
      console.log('Largest Contentful Paint:', lastEntry.startTime);
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    console.warn('LCP measurement not supported:', error);
  }

  // First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        vitals.fid = entry.processingStart - entry.startTime;
        console.log('First Input Delay:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    console.warn('FID measurement not supported:', error);
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  try {
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      vitals.cls = clsValue;
      console.log('Cumulative Layout Shift:', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch (error) {
    console.warn('CLS measurement not supported:', error);
  }

  return vitals;
};

// Bundle size tracking
export const trackBundleSize = () => {
  if (typeof window === 'undefined') return;

  const resourceEntries = performance.getEntriesByType('resource');
  const jsFiles = resourceEntries.filter(entry => 
    entry.name.endsWith('.js') && !entry.name.includes('node_modules')
  );
  
  const totalJSSize = jsFiles.reduce((total, entry) => {
    return total + (entry.transferSize || 0);
  }, 0);

  console.log('Total JS bundle size:', (totalJSSize / 1024).toFixed(2) + ' KB');
  
  // Track individual chunks
  jsFiles.forEach(entry => {
    const size = entry.transferSize ? (entry.transferSize / 1024).toFixed(2) : 'unknown';
    console.log(`${entry.name.split('/').pop()}: ${size} KB`);
  });

  return { totalJSSize, jsFiles };
};

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof window === 'undefined' || !performance.memory) return;

  const memory = performance.memory;
  const memoryInfo = {
    used: (memory.usedJSHeapSize / 1048576).toFixed(2), // MB
    total: (memory.totalJSHeapSize / 1048576).toFixed(2), // MB
    limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) // MB
  };

  console.log('Memory Usage:', memoryInfo);
  return memoryInfo;
};

// Network performance tracking
export const trackNetworkPerformance = () => {
  if (typeof navigator === 'undefined' || !navigator.connection) return;

  const connection = navigator.connection;
  const networkInfo = {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };

  console.log('Network Info:', networkInfo);
  return networkInfo;
};

// Component render timing
export const measureComponentRender = (componentName, renderFunction) => {
  const startTime = performance.now();
  
  const result = renderFunction();
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  if (renderTime > 16) { // Over one frame (60fps)
    console.warn(`${componentName} render time: ${renderTime.toFixed(2)}ms (slow)`);
  } else {
    console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
  }
  
  return { result, renderTime };
};

// Long task detection
export const detectLongTasks = () => {
  if (typeof window === 'undefined' || !window.PerformanceObserver) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, entry);
        
        // Send to analytics if configured
        if (window.gtag) {
          window.gtag('event', 'long_task', {
            duration: entry.duration,
            start_time: entry.startTime
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('Long task detection not supported:', error);
  }
};

// Image loading performance
export const measureImageLoading = (imageUrl) => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`Image loaded: ${imageUrl} (${loadTime.toFixed(2)}ms)`);
      resolve({ success: true, loadTime, imageUrl });
    };
    
    img.onerror = () => {
      const errorTime = performance.now() - startTime;
      console.error(`Image failed to load: ${imageUrl} (${errorTime.toFixed(2)}ms)`);
      resolve({ success: false, loadTime: errorTime, imageUrl });
    };
    
    img.src = imageUrl;
  });
};

// API request performance
export const measureAPIRequest = async (url, options = {}) => {
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const requestTime = endTime - startTime;
    
    console.log(`API Request: ${url} (${requestTime.toFixed(2)}ms) - ${response.status}`);
    
    return {
      response,
      requestTime,
      success: response.ok
    };
  } catch (error) {
    const endTime = performance.now();
    const requestTime = endTime - startTime;
    
    console.error(`API Request Failed: ${url} (${requestTime.toFixed(2)}ms)`, error);
    
    return {
      error,
      requestTime,
      success: false
    };
  }
};

// Performance monitoring suite
export const startPerformanceMonitoring = () => {
  console.log('🚀 Starting performance monitoring...');
  
  // Measure Web Vitals
  measureWebVitals();
  
  // Detect long tasks
  detectLongTasks();
  
  // Track memory usage periodically
  setInterval(() => {
    trackMemoryUsage();
  }, 30000); // Every 30 seconds
  
  // Track bundle size on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      trackBundleSize();
      trackNetworkPerformance();
    }, 1000);
  });
  
  console.log('✅ Performance monitoring started');
};

// React DevTools Profiler wrapper
export const ProfilerWrapper = ({ id, onRender, children }) => {
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  // Since this is a utility file, we'll export this as a factory function
  // The actual JSX should be used in React components
  return { id, onRender, children };
};

export default {
  measureWebVitals,
  trackBundleSize,
  trackMemoryUsage,
  trackNetworkPerformance,
  measureComponentRender,
  detectLongTasks,
  measureImageLoading,
  measureAPIRequest,
  startPerformanceMonitoring,
  ProfilerWrapper
};