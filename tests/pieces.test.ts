import { describe, expect, it } from 'vitest';
import { avisBancaire, avisDividende, facture, ficheSalaire, ticket } from '../src/engine/pieces';
import { chf } from './fixtures';

const A = { nom: 'Fournisseur SA' };
const B = { nom: 'Client' };

describe('pièces comptables', () => {
  it('facture : quantité × prix, TVA 8,1 % arrondie aux 5 centimes', () => {
    const f = facture({ emetteur: A, destinataire: B, numero: '1', date: '2026-01-10', tauxTva: 81, articles: [
      { designation: 'Article', quantite: 3, prixUnitaire: chf(12.35) },
      { designation: 'Port', prixUnitaire: chf(8) },
    ] });
    expect(f.ht).toBe(chf(45.05));
    expect(f.tva).toBe(chf(3.65)); // 45.05 × 8,1 % = 3.649 → 3.65
    expect(f.ttc).toBe(chf(48.7));
    expect(f.piece.totaux.at(-1)).toEqual({ libelle: 'Total à payer', montant: chf(48.7), fort: true });
  });

  it('facture sans TVA', () => {
    const f = facture({ emetteur: A, destinataire: B, numero: '2', date: '2026-01-10', articles: [{ designation: 'X', prixUnitaire: chf(100) }] });
    expect([f.tva, f.ttc]).toEqual([0, chf(100)]);
  });

  it('ticket : TVA comprise extraite', () => {
    const t = ticket({ emetteur: A, date: '2026-01-10', tauxTva: 81, articles: [{ designation: 'Ventes', montant: chf(1081) }] });
    expect([t.ttc, t.tva, t.ht]).toEqual([chf(1081), chf(81), chf(1000)]);
  });

  it('avis bancaire : total des opérations', () => {
    expect(avisBancaire({ sens: 'debit', banque: A, titulaire: B, compte: 'CH00', date: '2026-01-10', operations: [
      { designation: 'Loyer', montant: chf(1500) }, { designation: 'Frais', montant: chf(5) },
    ] }).total).toBe(chf(1505));
  });

  it('fiche de salaire : retenues en % arrondies, montants fixes, net', () => {
    const f = ficheSalaire({ employeur: A, employe: B, periode: 'janvier 2026', date: '2026-01-25', brut: chf(4800), retenues: [
      { libelle: 'AVS/AI/APG', taux: 530 }, { libelle: 'AC', taux: 110 }, { libelle: 'LPP', montant: chf(210) },
    ] });
    expect(f.retenues.map((r) => r.montant)).toEqual([chf(254.4), chf(52.8), chf(210)]);
    expect(f.net).toBe(chf(4800 - 254.4 - 52.8 - 210));
  });

  it('avis de dividende : impôt anticipé 35 %', () => {
    const a = avisDividende({ banque: A, titulaire: B, compte: 'CH00', date: '2026-05-20', valeur: 'Action X', quantite: 150, dividendeParTitre: chf(3.2) });
    expect([a.brut, a.impotAnticipe, a.net]).toEqual([chf(480), chf(168), chf(312)]);
  });
});
