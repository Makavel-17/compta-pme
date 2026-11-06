import { describe, expect, it } from 'vitest';
import { demoMp } from '../src/data/demo-mp';
import { demoCfc2 } from '../src/data/demo-cfc2';
import { creerDossier, type Exercice } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { resultatExercice } from '../src/engine/statements';
import { degres, fluxTresorerie, seuil } from '../src/engine/tableaux';
import { plan } from './fixtures';

function corrige(ex: Exercice) {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (r.ok) d = r.valeur;
  });
  return d;
}

describe('tableaux MP', () => {
  it('compte de résultat à plusieurs degrés : le dernier degré est le résultat de l’exercice', () => {
    for (const ex of [demoMp, demoCfc2]) {
      const d = corrige(ex);
      const g = degres(d);
      expect(g.resultat).toBe(resultatExercice(d));
      expect(g.margeBrute - g.chargesPersonnel - g.autresCharges).toBe(g.ebitda);
    }
  });
  it('flux de trésorerie : la somme des trois secteurs égale la variation des liquidités', () => {
    for (const ex of [demoMp, demoCfc2]) {
      const f = fluxTresorerie(corrige(ex));
      expect(f.exploitation + f.investissement + f.financement).toBe(f.variationLiquidites);
    }
  });
  it('seuil de rentabilité', () => {
    const r = seuil({ unite: 'vélo', prixVente: 320000, coutVariable: 200000, chargesFixes: 36000000, quantite: 450 });
    expect(r.margeContributiveUnitaire).toBe(120000);
    expect(r.tauxMargeContributive).toBeCloseTo(37.5);
    expect(r.seuilQuantite).toBe(300);
    expect(r.seuilChiffreAffaires).toBe(96000000);
    expect(r.resultatQuantite).toBe(18000000);
  });
});
