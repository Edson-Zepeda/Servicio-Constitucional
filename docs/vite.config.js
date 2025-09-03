import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png','icons/icon-512.png'],
      manifest: {
        name: 'Servicio Constitucional',
        short_name: 'Servicio',
        start_url: '/Servicio-Constitucional/',
        scope: '/Servicio-Constitucional/',
        display: 'standalone',
        background_color: '#121212',
        theme_color: '#121212',
        icons: [
          { src: '/Servicio-Constitucional/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/Servicio-Constitucional/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  base: '/Servicio-Constitucional/', // para GH Pages
})
