import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Use 127.0.0.1 instead of localhost
    port: 8080,
    strictPort: false,
    open: 'http://127.0.0.1:8080' // Open with IP instead of localhost
  },
  preview: {
    host: 'localhost',
    port: 4173,
    open: true
  }
})
