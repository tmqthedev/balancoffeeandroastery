import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  publicDir: 'src/assets', // This makes src/assets available as static files
  server: {
    port: 5173,
    host: 'localhost',
    hmr: {
      overlay: false, // Disable error overlay that might cause issues
      port: 5173,
    },
    watch: {
      usePolling: false, // Disable polling to reduce connection load
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production to reduce size
    chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React and core libraries
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
            // Other node_modules go to vendor
            return 'vendor';
          }
          
          // Admin chunk for admin-only components
          if (id.includes('/pages/admin/') || id.includes('/routes/AdminRoutes')) {
            return 'admin';
          }
          
          // Auth chunk for authentication components
          if (id.includes('/pages/auth/') || id.includes('/components/auth/')) {
            return 'auth';
          }
          
          // Payment chunk for payment components
          if (id.includes('/payment/') || id.includes('Checkout')) {
            return 'payment';
          }
        },
        // Optimize chunk names
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
    // Optimize build performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      }
    }
  }
});
