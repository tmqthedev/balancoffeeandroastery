import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Alternative configuration for WebSocket issues
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    // Disable HMR WebSocket completely - you'll need to refresh manually
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor';
            }
            if (id.includes('axios') || id.includes('prop-types')) {
              return 'utils';
            }
            if (id.includes('react-helmet')) {
              return 'ui';
            }
            return 'vendor';
          }
          
          if (id.includes('/pages/admin/') || id.includes('/routes/AdminRoutes')) {
            return 'admin';
          }
          
          if (id.includes('/pages/auth/') || id.includes('/components/auth/')) {
            return 'auth';
          }
          
          if (id.includes('/payment/') || id.includes('Checkout')) {
            return 'payment';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '') : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const fileName = assetInfo.names?.[0] || 'asset';
          const info = fileName.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});
