// Builds a single self-contained IIFE for injection into existing OpenEMR.
// Run: npm run build:inject
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../openemr/public/openemr-pwa',
    emptyOutDir: false,
    lib: {
      entry:    'src/js/inject.js',
      name:     'OpenEMRPWA',
      fileName: () => 'inject.js',
      formats:  ['iife'],  // single file, all deps inlined, no imports
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
