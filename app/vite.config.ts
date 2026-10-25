/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { dossierDeSortie } from './config/sortie.ts';

const dossierApp = fileURLToPath(new URL('.', import.meta.url));

// Publié par GitHub Pages sous https://alhyanmaz.github.io/Fit-dad/v2/ (docs/SPEC.md §8).
export default defineConfig({
  base: '/Fit-dad/v2/',
  plugins: [
    react(),
    // Hors ligne (docs/SPEC.md §8 et §8.1) : service worker limité à /Fit-dad/v2/ jusqu'au J6 ; la
    // v1 et son sw.js, à la racine, ne sont pas touchés. Une nouvelle version attend José
    // (bandeau « Recharger »).
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      scope: '/Fit-dad/v2/',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Fit-dad v2',
        short_name: 'Fit-dad v2',
        description: "Suivi d'entraînement de José",
        lang: 'fr',
        start_url: '/Fit-dad/v2/',
        scope: '/Fit-dad/v2/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    outDir: dossierDeSortie(dossierApp),
    emptyOutDir: true,
  },
  server: {
    // Le programme est lu dans ../data/programme.json.
    fs: { allow: ['..'] },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'config/**/*.test.ts'],
  },
});
