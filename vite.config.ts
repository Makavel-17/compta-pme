import { defineConfig, type Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Fichiers du dossier public, chemins relatifs (copiés tels quels dans le site). */
function fichiersPublics(dossier = 'public', base = dossier): string[] {
  return readdirSync(dossier).flatMap((n) => {
    const p = join(dossier, n);
    return statSync(p).isDirectory() ? fichiersPublics(p, base) : [relative(base, p).split(sep).join('/')];
  });
}

/** Écrit sw.js avec la liste complète des fichiers du site et une version qui change à chaque compilation différente. */
function horsLigne(): Plugin {
  return {
    name: 'compta-pme-hors-ligne',
    apply: 'build',
    generateBundle(_options, bundle) {
      const fichiers = [
        './',
        './index.html',
        ...fichiersPublics().map((f) => `./${f}`),
        ...Object.keys(bundle)
          .filter((f) => !f.endsWith('.map'))
          .map((f) => `./${f}`),
      ];
      const version = createHash('sha256').update(fichiers.join('\n')).digest('hex').slice(0, 12);
      const source = readFileSync('hors-ligne/sw-modele.js', 'utf-8')
        .replace('__VERSION__', version)
        .replace('__FICHIERS__', JSON.stringify([...new Set(fichiers)]));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// base './' : le site fonctionne depuis n'importe quel sous-dossier (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [svelte(), horsLigne()],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
