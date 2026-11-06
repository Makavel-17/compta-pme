import { describe, expect, it } from 'vitest';
import { demoCfc2 } from '../src/data/demo-cfc2';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { genererPdfCopie } from '../src/pdf/copie';
import { plan } from './fixtures';

describe('export PDF de la copie', () => {
  it('contient journal, balance, états et un pied de page numéroté', async () => {
    let d = creerDossier(demoCfc2, plan);
    demoCfc2.corrige!.forEach((c, i) => {
      const op = demoCfc2.operations.find((o) => o.numero === c.piece)!;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 50), lignes: c.lignes });
      if (r.ok) d = r.valeur;
    });
    const nom = 'Martin_Lea_2CFC1_Papeterie.pdf';
    const blob = await genererPdfCopie({ prenom: 'Léa', nom: 'Martin', classe: '2CFC1' }, demoCfc2, d, nom);
    const texte = await blob.text();
    expect(texte.startsWith('%PDF')).toBe(true);
    for (const t of ['Journal', 'Balance de v', 'Bilan', 'Compte de r', nom, 'Page 1 /']) expect(texte).toContain(t);
  });
});

describe('PDF des copies corrigées', () => {
  it('contient la page de résultats et une page par élève avec la comparaison', async () => {
    const { genererPdfCopiesCorrigees } = await import('../src/pdf/copies-corrigees');
    const { corrigerCopie } = await import('../src/engine/notation');
    let d = creerDossier(demoCfc2, plan);
    const c1 = demoCfc2.corrige![0]!;
    const r = ajouterEcriture(d, {
      id: 'E1', date: demoCfc2.operations[0]!.date, piece: c1.piece, libelle: 'faux',
      lignes: c1.lignes.map((l) => ({ debit: l.credit, credit: l.debit, montant: l.montant })),
    });
    if (r.ok) d = r.valeur;
    const copie = { eleve: { prenom: 'Léa', nom: 'Martin', classe: '2CFC1' }, exerciceId: demoCfc2.id, exerciceTitre: demoCfc2.titre, mode: demoCfc2.mode, dossier: d, suivi: {}, exporteLe: '2026-11-06T10:00:00Z' };
    const blob = await genererPdfCopiesCorrigees(demoCfc2, [{ copie, correction: corrigerCopie(demoCfc2, d) }], 'copies.pdf');
    const texte = await blob.text();
    expect(texte.startsWith('%PDF')).toBe(true);
    for (const t of ['Copies corrig', 'Martin L', 'Corrig', 'Page 2 /']) expect(texte).toContain(t);
  });
});
