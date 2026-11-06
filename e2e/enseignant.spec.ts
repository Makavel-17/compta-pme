// Parcours enseignant : création du code (valeur d'essai), onglets, aperçu d'un dossier, relecture.
import { expect, test } from '@playwright/test';

const CODE_ESSAI = 'essai-e2e-4821';

test("l'enseignant ouvre son espace, regarde un dossier en aperçu et revient sur le même onglet", async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Espace enseignant' }).click();
  await page.getByLabel('Code', { exact: true }).fill(CODE_ESSAI);
  await page.getByLabel('Confirmer le code').fill(CODE_ESSAI);
  await page.getByRole('button', { name: 'Entrer' }).click();
  for (const o of ['Exercices', 'Dossiers', 'Copies', 'Relecture', 'Paramètres']) {
    await expect(page.getByRole('button', { name: o, exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: 'Dossiers', exact: true }).click();
  await page.getByRole('button', { name: 'Aperçu' }).first().click();
  await expect(page.getByText('Aperçu enseignant.')).toBeVisible();
  await page.locator('.bandeau-apercu').getByRole('button', { name: "Fermer l'aperçu" }).click();
  await expect(page.getByRole('heading', { name: 'Dossiers de pièces comptables' })).toBeVisible();

  await page.getByRole('button', { name: 'Relecture', exact: true }).click();
  await expect(page.getByText(/0 \/ \d+ éléments validés/)).toBeVisible();
});
