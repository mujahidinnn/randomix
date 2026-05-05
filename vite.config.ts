import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          motion:   ['framer-motion'],
          export:   ['jspdf', 'html-to-image', 'exceljs'],
          zustand:  ['zustand'],
        },
      },
    },
  },
});
