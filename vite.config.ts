import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5173,
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'deck-gl': ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers'],
          'map-libraries': ['maplibre-gl', 'topojson-client'],
          'd3-libs': ['d3'],
        },
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Maritime Monitor',
        short_name: 'Maritime',
        description: 'Real-time global maritime intelligence dashboard',
        theme_color: '#1a1a1a',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['productivity', 'utilities'],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '540x720',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.aishub\.net/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'ais-data',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300,
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.weather\.gov/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-data',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 600,
              },
            },
          },
          {
            urlPattern: /^https:\/\/(.*?)feed/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'rss-feeds',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 3600,
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  optimizeDeps: {
    include: [
      '@deck.gl/core',
      '@deck.gl/layers',
      'maplibre-gl',
      'd3',
      'topojson-client',
    ],
  },
});
