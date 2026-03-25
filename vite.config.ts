import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('lucide-react')) return 'lucide-icons';
            return 'vendor'; 
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
  }
})