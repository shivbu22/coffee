import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (/node_modules\/(react|react-dom|scheduler)\//.test(normalized)) {
            return 'vendor-react';
          }
          if (normalized.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
          if (/node_modules\/(motion|framer-motion)\//.test(normalized)) {
            return 'vendor-motion';
          }
          if (normalized.includes('node_modules/canvas-confetti/')) {
            return 'vendor-confetti';
          }
        },
      },
    },
  },
})

