// Partage avec les classes : lien direct vers un exercice, variante d'évaluation créée par l'enseignant.
import { expect, test } from '@playwright/test';

test('un lien direct ouvre l’accueil avec l’exercice déjà choisi', async ({ page }) => {
  await page.goto('./?exercice=dossier-cfc2-outils-et-cie-tva');
  await expect(page.getByRole('heading', { name: 'Exercice donné par votre enseignant' })).toBeVisible();
  await expect(page.getByText('Outils & Cie — dossier de pièces, TVA du premier trimestre').first()).toBeVisible();
  await page.getByLabel('Prénom').fill('Léa');
  await page.getByLabel('Nom', { exact: true }).fill('Martin');
  await page.getByLabel('Classe').fill('2CFC1');
  await page.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('heading', { name: 'Tableau de bord' })).toBeVisible();
  await expect(page.locator('.entete strong').first()).toHaveText('Outils & Cie');
  // Le lien est retiré de l'adresse : un rechargement ne rouvre pas l'accueil.
  expect(page.url()).not.toContain('exercice=');
});

test('un lien inconnu le signale', async ({ page }) => {
  await page.goto('./?exercice=inexistant');
  await expect(page.getByText('Ce lien ne correspond à aucun exercice')).toBeVisible();
});

test("l'enseignant crée une variante d'évaluation d'un dossier", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill('essai-e2e-7720');
  await page.getByLabel('Confirmer le code').fill('essai-e2e-7720');
  await page.getByRole('button', { name: 'Entrer' }).click();
  await page.getByRole('button', { name: 'Dossiers', exact: true }).click();
  await expect(page.getByText('Entraînement ou évaluation ?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copier le lien pour les élèves' }).first()).toBeVisible();
  await page.getByRole('button', { name: "Variante d'évaluation" }).first().click();
  await expect(page.locator('#ex-titre')).toHaveValue(/variante d'évaluation/);
});
