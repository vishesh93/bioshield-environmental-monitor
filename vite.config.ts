import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'BioShield Environmental Monitor',
        short_name: 'BioShield',
        description: 'Real-time water quality monitoring system',
        theme_color: '#1f2937',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
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
