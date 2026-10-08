/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { dossierDeSortie } from './config/sortie.ts';

const dossierApp = fileURLToPath(new URL('.', import.meta.url));

// Publié par GitHub Pages sous https://alhyanmaz.github.io/Fit-dad/v2/ (docs/SPEC.md §8).
export default defineConfig({
  base: '/Fit-dad/v2/',
  plugins: [react()],
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
