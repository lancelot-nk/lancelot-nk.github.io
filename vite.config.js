import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  logLevel: 'error',

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    watch: { usePolling: true },
    port: 3000,
    host: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    // Improve CSS delivery
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Granular manual chunks so each section loads only what it needs
        manualChunks(id) {
          // Core React — always loaded first
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // Animation library — loaded after react
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Markdown rendering — only needed for project previews
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype') || id.includes('node_modules/micromark') || id.includes('node_modules/mdast') || id.includes('node_modules/hast') || id.includes('node_modules/unified')) {
            return 'markdown';
          }
          // PDF generation — only loaded on demand
          if (id.includes('node_modules/jspdf')) {
            return 'pdf-gen';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Deterministic file names for long-term caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})