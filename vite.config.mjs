import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// This repo now ships the user-supplied single-file HTML application.
// Do not inject the retired ARM v0.11 CSS/JS or its data schema.
export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icons/strength-5x5.svg'],
      workbox: {
        globPatterns: ['**/*.{html,js,css,svg,png,jpg,webp,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: 'StrongFits',
        short_name: 'StrongFits',
        description: 'Strength workouts, nutrition, calorie and macro tracking',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        orientation: 'portrait-primary',
        icons: [
          { src: 'icons/strength-5x5.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/strength-5x5.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      }
    })
  ]
});
