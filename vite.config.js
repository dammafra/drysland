import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import glsl from 'vite-plugin-glsl'
import { VitePWA } from 'vite-plugin-pwa'
import restart from 'vite-plugin-restart'

export default {
  root: 'src/',
  publicDir: '../static/',
  base: './',
  server: {
    host: true, // Open to local network and display URL
  },
  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
  plugins: [
    tailwindcss(), // Restart server on static file change
    restart({ restart: ['../static/**'] }),
    glsl(),
    sentryVitePlugin({
      org: 'dammafra',
      project: 'drysland',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,glb,mp3,ttf,webp}'],
        runtimeCaching: [
          {
            urlPattern: /.*fontawesome.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fontawesome-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Drysland',
        short_name: 'Drysland',
        description: 'Rotate the tiles to restore the course of the river and un-Dry the Island!',
        theme_color: '#79b2c3',
        background_color: '#79b2c3',
        display: 'standalone',
        icons: [
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, 'src/experience/blocks'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@experience': path.resolve(__dirname, 'src/experience/experience.js'),
      '@fire': path.resolve(__dirname, 'src/firebase'),
      '@grid': path.resolve(__dirname, 'src/experience/grid'),
      '@shaders': path.resolve(__dirname, 'src/shaders'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}
