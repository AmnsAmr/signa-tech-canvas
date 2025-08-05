import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get proxy target from environment or use default
  const proxyTarget = env.VITE_DEV_PROXY_TARGET || env.VITE_API_URL || 'http://localhost:3001';
  
  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      historyApiFallback: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            console.log(`API Proxy configured: /api -> ${proxyTarget}`);
          }
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            console.log(`Uploads Proxy configured: /uploads -> ${proxyTarget}`);
          }
        }
      }
      },
    plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-query': ['react-router-dom', '@tanstack/react-query'],
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast'
          ],
          'utils': ['lucide-react', 'clsx', 'tailwind-merge']
        },
      },
    },
    },
    optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
    exclude: ['@radix-ui/react-navigation-menu']
    },
    esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    define: {
      // Expose environment variables to the client
      __DEV__: mode === 'development',
      __PROD__: mode === 'production',
    },
  };
});
