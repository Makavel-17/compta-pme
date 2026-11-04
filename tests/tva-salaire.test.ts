import { describe, expect, it } from 'vitest';
import { TAUX_TVA, decompteTva, tvaSurHT, tvaSurTTC } from '../src/engine/tva';
import { controlerDecompte, montantRetenue } from '../src/engine/salaire';
import { ajouterEcriture } from '../src/engine/journal';
import { chf, dossierVide } from './fixtures';
import type { Dossier } from '../src/engine/dossier';

describe('calcul de la TVA', () => {
  it('sur un montant hors taxe, aux trois taux', () => {
    expect(tvaSurHT(chf(1000), TAUX_TVA.normal)).toBe(chf(81));
    expect(tvaSurHT(chf(1000), TAUX_TVA.reduit)).toBe(chf(26));
    expect(tvaSurHT(chf(1000), TAUX_TVA.hebergement)).toBe(chf(38));
  });

  it('comprise dans un montant TTC', () => {
    expect(tvaSurTTC(chf(1081), TAUX_TVA.normal)).toBe(chf(81));
    expect(tvaSurTTC(chf(324.3), TAUX_TVA.normal)).toBe(chf(24.3));
    expect(tvaSurTTC(chf(5405), TAUX_TVA.normal)).toBe(chf(405));
  });

  it('arrondit aux 5 centimes', () => {
    // 123.45 × 8,1 % = 9.99945 → 10.00
    expect(tvaSurHT(12345, 81)).toBe(1000);
    // 99.90 × 8,1 % = 8.0919 → 8.10
    expect(tvaSurHT(9990, 81)).toBe(810);
    // 100 × 2,6 % = 2.60 ; 1.15 × 2,6 % = 0.0299 → 0.05
    expect(tvaSurHT(115, 26)).toBe(5);
  });

  it('fonctionne en nombres entiers, sans virgule flottante', () => {
    for (let ht = 1; ht < 5000; ht += 37) expect(Number.isInteger(tvaSurHT(ht, 81))).toBe(true);
  });
});

describe('décompte de TVA', () => {
  it('TVA due moins impôt préalable', () => {
    let d: Dossier = { ...dossierVide(), niveau: 'CFC2' };
    const passer = (id: string, lignes: { debit: string | null; credit: string | null; montant: number }[]) => {
      const r = ajouterEcriture(d, { id, date: '2026-02-01', piece: id, libelle: 'x', lignes });
      if (!r.ok) throw new Error(r.erreurs.join());
      d = r.valeur;
    };
    passer('1', [
      { debit: '4200', credit: null, montant: chf(1000) },
      { debit: '1170', credit: null, montant: chf(81) },
      { debit: null, credit: '2000', montant: chf(1081) },
    ]);
    passer('2', [
      { debit: '1100', credit: null, montant: chf(3243) },
      { debit: null, credit: '3200', montant: chf(3000) },
      { debit: null, credit: '2200', montant: chf(243) },
    ]);
    passer('3', [
      { debit: '6400', credit: null, montant: chf(300) },
      { debit: '1171', credit: null, montant: chf(24.3) },
      { debit: null, credit: '1020', montant: chf(324.3) },
    ]);
    expect(decompteTva(d)).toEqual({
      tvaDue: chf(243),
      ipMarchandises: chf(81),
      ipInvestissements: chf(24.3),
      solde: chf(137.7),
      detteAfc: 0,
    });
  });
});

describe('décompte de salaire', () => {
  it('retenue = base × taux, arrondie aux 5 centimes', () => {
    expect(montantRetenue(chf(5000), 640)).toBe(chf(320));
    expect(montantRetenue(chf(4700), 640)).toBe(chf(300.8));
    // 4'321.00 × 5,3 % = 229.013 → 229.00
    expect(montantRetenue(chf(4321), 530)).toBe(chf(229));
    // 4'333.00 × 5,3 % = 229.649 → 229.65
    expect(montantRetenue(chf(4333), 530)).toBe(chf(229.65));
  });

  it('calcule le net et signale les montants faux', () => {
    const r = controlerDecompte(chf(5000), [
      { libelle: 'AVS/AI/APG/AC', taux: 640, base: null, montant: chf(320) },
      { libelle: 'LPP', taux: 400, base: null, montant: chf(210) },
      { libelle: 'Avance de salaire', taux: null, base: null, montant: chf(500) },
    ]);
    expect(r.totalRetenues).toBe(chf(1030));
    expect(r.net).toBe(chf(3970));
    expect(r.lignesFausses).toEqual([1]);
  });
});
