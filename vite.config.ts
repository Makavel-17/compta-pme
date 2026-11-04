import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' : le site fonctionne depuis n'importe quel sous-dossier (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [svelte()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
