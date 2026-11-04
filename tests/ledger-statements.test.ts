import { describe, expect, it } from 'vitest';
import { balance, compteEnT, grandLivre, soldes } from '../src/engine/ledger';
import { bilan, compteDeResultat, resultatExercice } from '../src/engine/statements';
import { chf, dossierExemple, dossierVide } from './fixtures';

describe('soldes', () => {
  const s = soldes(dossierExemple());
  it.each([
    ['1000', 3500],
    ['1020', 10500],
    ['1100', 4000],
    ['2000', -6000],
    ['2850', 500],
    ['3210', -2500],
    ['4200', 3000],
  ])('compte %s : %i', (n, francs) => {
    expect(s.get(n)?.solde).toBe(chf(francs));
  });
});

describe('compte en T', () => {
  it('place le solde d\'ouverture et équilibre par le côté le plus faible', () => {
    const t = compteEnT(dossierExemple(), '1000');
    expect(t.intitule).toBe('Caisse');
    expect(t.debit.map((l) => l.montant)).toEqual([chf(2000), chf(2500)]);
    expect(t.debit[0]!.nature).toBe('ouverture');
    expect(t.credit.map((l) => l.montant)).toEqual([chf(500), chf(500)]);
    expect(t.credit[1]!.contrepartie).toBe('Divers');
    expect(t.solde).toEqual({ cote: 'C', montant: chf(3500) });
    expect(t.totalEquilibre).toBe(chf(4500));
  });

  it('place un solde créditeur au débit', () => {
    const t = compteEnT(dossierExemple(), '2000');
    expect(t.solde).toEqual({ cote: 'D', montant: chf(6000) });
    expect(t.totalEquilibre).toBe(chf(8000));
  });

  it('compte sans mouvement', () => {
    expect(compteEnT(dossierVide(), '6000').solde).toEqual({ cote: null, montant: 0 });
  });
});

describe('grand livre', () => {
  it('donne un solde progressif par compte, comptes triés', () => {
    const gl = grandLivre(dossierExemple());
    expect(gl.map((c) => c.numero)).toEqual([
      '1000', '1020', '1100', '1200', '1510', '2000', '2400', '2800', '2850', '3210', '3211', '4200', '5200', '6000',
    ]);
    const banque = gl.find((c) => c.numero === '1020')!;
    expect(banque.lignes.map((l) => l.soldeProgressif)).toEqual([chf(15000), chf(13800), chf(12300), chf(10500)]);
    expect(banque.solde).toBe(chf(10500));
  });
});

describe('balance de vérification', () => {
  it('est équilibrée', () => {
    const b = balance(dossierExemple());
    expect(b.equilibree).toBe(true);
    expect(b.totalDebit).toBe(b.totalCredit);
    expect(b.totalSoldesDebiteurs).toBe(chf(3500 + 10500 + 4000 + 8000 + 12000 + 500 + 3000 + 1800 + 1200));
  });

  it('inclut le bilan d\'ouverture dans les totaux', () => {
    const b = balance(dossierVide());
    expect(b.totalDebit).toBe(chf(37000));
    expect(b.equilibree).toBe(true);
  });
});

describe('états financiers', () => {
  const d = dossierExemple();

  it('compte de résultat en forme de compte : bénéfice 500', () => {
    const cr = compteDeResultat(d);
    expect(cr.totalProduits).toBe(chf(6500));
    expect(cr.totalCharges).toBe(chf(6000));
    expect(cr.resultat).toBe(chf(500));
    expect(cr.totalEquilibre).toBe(chf(6500));
    expect(cr.charges.map((g) => g.titre)).toEqual([
      'Charges liées aux marchandises',
      'Charges liées aux employés',
      "Charges d'exploitation",
    ]);
  });

  it('bilan équilibré, résultat présenté dans les capitaux propres', () => {
    const b = bilan(d);
    expect(b.equilibre).toBe(true);
    expect(b.totalActif).toBe(chf(38000));
    const cp = b.passif.find((g) => g.titre === 'Capitaux propres')!;
    expect(cp.postes.map((p) => [p.numero, p.montant])).toEqual([
      ['2800', chf(22000)],
      ['2850', chf(-500)],
      ['', chf(500)],
    ]);
    expect(cp.postes[2]!.intitule).toBe("Bénéfice de l'exercice");
  });

  it('concordance du résultat entre bilan et compte de résultat', () => {
    expect(bilan(d).resultat).toBe(compteDeResultat(d).resultat);
    expect(resultatExercice(d)).toBe(chf(500));
  });

  it("présente une perte du côté de l'actif", () => {
    const vide = dossierVide();
    const perte = { ...vide, ecritures: [{ id: 'E1', date: '2026-05-01', piece: '1', libelle: 'Loyer', lignes: [{ debit: '6000', credit: '1020', montant: chf(800) }] }] };
    const b = bilan(perte);
    expect(b.resultat).toBe(chf(-800));
    expect(b.equilibre).toBe(true);
    expect(b.totalActif).toBe(chf(37000)); // 36'200 de biens + 800 de perte
    expect(b.actif.at(-1)!.postes).toEqual([{ numero: '', intitule: "Perte de l'exercice", montant: chf(800) }]);
    expect(b.passif.flatMap((g) => g.postes).some((p) => p.intitule.startsWith('Perte'))).toBe(false);
    expect(compteDeResultat(perte).resultat).toBe(chf(-800));
  });
});
