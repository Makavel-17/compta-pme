// Hors ligne : après une première visite, le site s'ouvre et l'export PDF fonctionne sans réseau.
import { expect, test } from '@playwright/test';

test('après une première visite, le logiciel fonctionne entièrement hors ligne', async ({ page, context }) => {
  await page.goto('./');
  // Attendre que le service worker ait tout mis en cache.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(async () => page.evaluate(async () => (await caches.keys()).some((n) => n.startsWith('compta-pme-'))), { timeout: 20_000 })
    .toBe(true);
  const nbFichiers = await page.evaluate(async () => {
    const nom = (await caches.keys()).find((n) => n.startsWith('compta-pme-'))!;
    return (await (await caches.open(nom)).keys()).length;
  });
  expect(nbFichiers).toBeGreaterThan(10);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Bienvenue|Bon retour/ })).toBeVisible();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByLabel('Rechercher un exercice').fill('cycles');
  await page.getByText(/Cycles du Léman/).first().click();
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();

  // Le module PDF, chargé à la demande, doit aussi être disponible hors ligne.
  const telechargement = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter en PDF' }).click();
  const fichier = await telechargement;
  expect(fichier.suggestedFilename()).toMatch(/\.pdf$/);
  await context.setOffline(false);
});
