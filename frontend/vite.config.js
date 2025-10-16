import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    cors: {
      origin: true, // Allow all origins
      credentials: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          // Add CORS headers for extension requests
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin && origin.startsWith('moz-extension://')) {
              proxyRes.headers['access-control-allow-origin'] = origin;
              proxyRes.headers['access-control-allow-credentials'] = 'true';
              proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PATCH, DELETE, OPTIONS';
              proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization';
            }
          });
        }
      }
    }
  }
})
