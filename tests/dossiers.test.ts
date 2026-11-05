import { describe, expect, it } from 'vitest';
import { DOSSIERS } from '../src/data/dossiers';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { comptesDisponibles } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { balance } from '../src/engine/ledger';
import { bilan } from '../src/engine/statements';
import { boucler } from '../src/engine/closing';
import { plan } from './fixtures';

describe.each(DOSSIERS.map((d) => [d.titre, d] as const))('dossier %s', (_titre, ex) => {
  it('est valide et complet, 10 à 12 pièces, une pièce par opération', () => {
    expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
    expect(ex.operations.length).toBeGreaterThanOrEqual(10);
    expect(ex.operations.length).toBeLessThanOrEqual(12);
    for (const op of ex.operations) expect(op.piece, op.numero).toBeDefined();
    expect(ex.situation?.length ?? 0).toBeGreaterThan(200);
    expect(ex.situation).toContain(ex.raisonSociale);
  });

  it('le corrigé passe entièrement, avec des comptes disponibles, et se boucle', () => {
    let d = creerDossier(ex, plan);
    const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
    ex.corrige!.forEach((c, i) => {
      for (const l of c.lignes) for (const n of [l.debit, l.credit]) if (n) expect(dispo.has(n), `${c.piece} : ${n}`).toBe(true);
      const op = ex.operations.find((o) => o.numero === c.piece)!;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
      if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
      d = r.valeur;
    });
    expect(balance(d).equilibree).toBe(true);
    expect(bilan(d).equilibre).toBe(true);
    if (ex.parametres.corrigerBouclement) expect(boucler(d).ok).toBe(true);
  });
});

describe('réserves latentes : le corrigé complémentaire concorde avec les comptes', () => {
  it('le bénéfice comptable du tableau est celui du dossier corrigé', async () => {
    const { COMPLEMENTS_CORRIGE } = await import('../src/data/dossiers');
    const { dossierCorrige } = await import('../src/pdf/dossier');
    const { resultatExercice } = await import('../src/engine/statements');
    const { formatMontant } = await import('../src/engine/money');
    const ex = DOSSIERS.find((d) => d.id === 'dossier-mp3-ateliers-genevois-reserves-latentes')!;
    const benefice = resultatExercice(dossierCorrige(ex, plan));
    const tableau = COMPLEMENTS_CORRIGE[ex.id]![1]!;
    expect(tableau.lignes[0]![1]).toBe(formatMontant(benefice));
  });
});

describe('corrigés complémentaires : concordance avec les comptes', () => {
  it("Zufferey : le bénéfice du revenu de l'entrepreneur est celui du dossier corrigé", async () => {
    const { COMPLEMENTS_CORRIGE } = await import('../src/data/dossiers');
    const { dossierCorrige } = await import('../src/pdf/dossier');
    const { resultatExercice } = await import('../src/engine/statements');
    const { formatMontant } = await import('../src/engine/money');
    const ex = DOSSIERS.find((d) => d.id === 'dossier-mp2-atelier-zufferey')!;
    expect(COMPLEMENTS_CORRIGE[ex.id]![0]!.lignes[2]![1]).toBe(formatMontant(resultatExercice(dossierCorrige(ex, plan))));
  });
  it("Carrosserie : le résultat de l'immeuble est le solde de 7500 moins 7510", async () => {
    const { COMPLEMENTS_CORRIGE } = await import('../src/data/dossiers');
    const { dossierCorrige } = await import('../src/pdf/dossier');
    const { soldes } = await import('../src/engine/ledger');
    const { formatMontant } = await import('../src/engine/money');
    const ex = DOSSIERS.find((d) => d.id === 'dossier-mp4-carrosserie-du-saleve-immeuble')!;
    const s = soldes(dossierCorrige(ex, plan));
    const resultat = -(s.get('7500')?.solde ?? 0) - (s.get('7510')?.solde ?? 0);
    expect(COMPLEMENTS_CORRIGE[ex.id]![0]!.lignes[2]![1]).toBe(formatMontant(resultat));
  });
});
