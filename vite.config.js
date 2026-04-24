import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: '.',
  base: '/dist/',
  build: {
    outDir: 'public/dist',
    manifest: true,
    rollupOptions: {
      input: {
        app: 'src/js/app.js',
        styles: 'src/scss/app.scss',
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      srcDir: 'src',
      filename: 'sw.js',
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'src/sw.js',
        swDest: 'public/dist/sw.js',
        globDirectory: 'public/dist',
      },
      manifest: {
        name: 'OpenEMR PWA',
        short_name: 'OpenEMR',
        description: 'Electronic Medical Records — PWA',
        theme_color: '#1a6ea0',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        shortcuts: [
          { name: 'New Patient', url: '/patients/new', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Calendar', url: '/calendar', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy all non-asset requests to the PHP backend
      '^(?!/dist/).*': {
        target: 'http://localhost:8300',
        changeOrigin: true,
      },
    },
  },
});
