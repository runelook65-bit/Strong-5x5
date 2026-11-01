import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate', // activate newer offline assets instead of leaving a waiting worker with no prompt UI
      injectRegister: 'auto',
      includeAssets: ['icons/arm-5x5.svg'],
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,jpg,webp,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: 'ARM 5×5 — Kol Antrenmanı',
        short_name: 'ARM 5×5',
        description: '12 haftalık çevrimdışı kol antrenmanı takipçisi',
        lang: 'tr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#07080a',
        theme_color: '#07080a',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icons/arm-5x5.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/arm-5x5.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      }
    })
  ]
});
