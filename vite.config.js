import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  // Base path for deployment (Standard for Vercel/Netlify)
  base: '/',
  
  // Keep the terminal clean from warnings, focusing only on critical errors
  logLevel: 'error',

  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      // Maps '@' to the 'src' directory for cleaner imports
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    // Ensuring HMR (Hot Module Replacement) works smoothly with Framer Motion
    watch: {
      usePolling: true,
    },
    port: 3000,
    host: true,
  },

  build: {
    // Optimization for production rollouts
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separates heavy animation/icon libraries for faster initial loads
          vendor: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
        },
      },
    },
  }
})