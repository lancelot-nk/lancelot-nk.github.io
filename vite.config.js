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
        // Single vendor chunk — avoids ESM circular-dependency issues that
        // occur when React internals share code with other libs across chunks.
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})