// Tests des écrans dans un vrai navigateur (Chromium), sur le site compilé servi en local.
// Lancer avec : npm run test:ecrans (après npm run build). Outil de développement seulement : rien n'est livré aux élèves.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  // Un seul navigateur à la fois : le serveur de prévisualisation répond mal à plusieurs pages en parallèle.
  workers: 1,
  reporter: process.env.CI ? 'list' : [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    locale: 'fr-CH',
    // Écran d'ordinateur de classe ; un test vérifie aussi la tablette en paysage.
    viewport: { width: 1366, height: 768 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } } }],
  webServer: {
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
  },
});
