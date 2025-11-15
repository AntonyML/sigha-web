/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,   // Permite acceso desde otras IPs en la red
    port: 5173,  
  },
  publicDir: 'public',
  assetsInclude: ['**/*.json'],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      external: [],
    },
    copyPublicDir: true
  }
})
