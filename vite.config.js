import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // increase limit to avoid noisy warnings for larger vendor chunks
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react-dom')) return 'vendor-react-dom';
          if (id.includes('react')) return 'vendor-react';
          if (id.includes('@mui') || id.includes('@emotion')) return 'vendor-mui';
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'vendor-pdf';
          return 'vendor';
        }
      }
    }
  },
})
