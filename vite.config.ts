import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-engine': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-engine': ['gsap', 'motion', 'lenis'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'zustand'],
        },
      },
    },
  },
});
