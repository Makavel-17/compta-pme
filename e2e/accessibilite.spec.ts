// Contrôle d'accessibilité automatique (axe-core, règles WCAG 2.1 A et AA) sur les écrans principaux.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function controler(page: Page, nom: string) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const resume = graves.map(
    (v) =>
      `${nom} — ${v.id} (${v.impact}) : ${v.help} — ${v.nodes.length} élément(s) : ` +
      v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(' | '),
  );
  expect(resume, resume.join('\n')).toEqual([]);
}

test('accueil, journal, comptes, bilan, théorie et espace enseignant sans défaut grave', async ({ page }) => {
  await page.goto('./');
  await controler(page, 'Accueil');
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill('outils');
  await page.getByText(/Outils & Cie/).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
  await controler(page, 'Tableau de bord');
  for (const vue of ['journal', 'comptes', 'balance', 'bilan', 'resultat', 'tva', 'theorie']) {
    await page.goto(`./#${vue}`);
    await page.waitForTimeout(300);
    await controler(page, vue);
  }
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await controler(page, 'Espace enseignant (code)');
});
