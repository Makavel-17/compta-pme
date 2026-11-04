import { describe, expect, it } from 'vitest';
import { corrigerCopie, noteSuisse, pointsOperation, statistiquesOperations } from '../src/engine/notation';
import { demoCfc1 as demo } from '../src/data/demo-cfc1';

// Ces tests portent sur les opérations seules : bouclement non noté.
const demoCfc1 = { ...demo, parametres: { ...demo.parametres, corrigerBouclement: false } };
import { creerDossier, type EcritureCorrigee } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import type { Dossier, Ecriture, LigneEcriture } from '../src/engine/dossier';
import { chf, plan } from './fixtures';

describe('note selon l\'échelle suisse', () => {
  it.each([
    [0, 10, 1],
    [10, 10, 6],
    [5, 10, 3.5],
    [6.5, 10, 4.5], // 4.25 → 4.5
    [6.48, 10, 4], // 4.24 → 4.0
    [7.5, 10, 5], // 4.75 → 5.0
    [7.4, 10, 4.5], // 4.70 → 4.5
    [12, 10, 6], // bornée à 6
  ])('%d / %d points → %d', (pts, max, note) => {
    expect(noteSuisse(pts, max)).toBe(note);
  });
});

const D = (c: string, f: number): LigneEcriture => ({ debit: c, credit: null, montant: chf(f) });
const C = (c: string, f: number): LigneEcriture => ({ debit: null, credit: c, montant: chf(f) });
const e = (piece: string, lignes: LigneEcriture[]): Ecriture => ({ id: piece + Math.random(), date: '2026-03-20', piece, libelle: 'x', lignes });
const multiple: EcritureCorrigee = { piece: '14', lignes: [D('4200', 3000), C('1000', 1000), C('2000', 2000)] };
const simple: EcritureCorrigee = { piece: '5', lignes: [{ debit: '6000', credit: '1020', montant: chf(1850) }] };

describe('points par opération', () => {
  it('tout ou rien pour une écriture simple', () => {
    expect(pointsOperation([e('5', [{ debit: '6000', credit: '1020', montant: chf(1850) }])], simple, 2, true).points).toBe(2);
    expect(pointsOperation([e('5', [{ debit: '6000', credit: '1000', montant: chf(1850) }])], simple, 2, true).points).toBe(0);
  });

  it('points partiels pour une écriture multiple : justes moins lignes en trop', () => {
    // 2 lignes justes sur 3, une ligne en trop (2010 au lieu de 2000) : (2 − 1) / 3 × 3 = 1
    const r = pointsOperation([e('14', [D('4200', 3000), C('1000', 1000), C('2010', 2000)])], multiple, 3, true);
    expect(r.points).toBe(1);
    // 2 lignes justes, montant faux sur 2000, une ligne en trop (1020) : (2 − 1) / 3 × 3 = 1
    expect(pointsOperation([e('14', [D('4200', 3000), C('1000', 1000), C('2000', 1900), C('1020', 100)])], multiple, 3, true).points).toBe(1);
    // 1 ligne juste (1000), deux montants faux, rien en trop : 1 / 3 × 3 = 1
    expect(pointsOperation([e('14', [D('4200', 2900), C('1000', 1000), C('2000', 1900)])], multiple, 3, true).points).toBe(1);
    // 2000 réparti sur deux lignes (1'900 + 100) : équivalent au corrigé, tous les points
    expect(pointsOperation([e('14', [D('4200', 3000), C('1000', 1000), C('2000', 1900), C('2000', 100)])], multiple, 3, true).points).toBe(3);
  });

  it('arrondit les points partiels au demi-point inférieur', () => {
    // 2 / 3 × 2 = 1.33 → 1
    expect(pointsOperation([e('14', [D('4200', 3000), C('1000', 1000), C('2000', 1900), D('1020', 0.01)])], multiple, 2, true).points).toBeLessThanOrEqual(1);
  });

  it('sans points partiels si l\'enseignant les désactive', () => {
    expect(pointsOperation([e('14', [D('4200', 3000), C('1000', 1000), C('2010', 2000)])], multiple, 3, false).points).toBe(0);
  });
});

function dossierAvec(pieces: string[]): Dossier {
  let d = creerDossier(demoCfc1, plan);
  demoCfc1.corrige!.filter((c) => pieces.includes(c.piece)).forEach((c, i) => {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

describe('correction d\'une copie et synthèse', () => {
  it('copie parfaite : 6 ; copie vide : 1', () => {
    const tout = demoCfc1.corrige!.map((c) => c.piece);
    expect(corrigerCopie(demoCfc1, dossierAvec(tout)).note).toBe(6);
    expect(corrigerCopie(demoCfc1, dossierAvec([])).note).toBe(1);
  });

  it('applique le barème de l\'enseignant', () => {
    const ex = { ...demoCfc1, bareme: { '1': 5 } };
    const c = corrigerCopie(ex, dossierAvec(['1']));
    expect(c.max).toBe(19);
    expect(c.points).toBe(5);
  });

  it('statistiques par opération : réussites et erreurs les plus fréquentes', () => {
    const a = corrigerCopie(demoCfc1, dossierAvec(['1', '2']));
    const b = corrigerCopie(demoCfc1, dossierAvec(['1']));
    const stats = statistiquesOperations([a, b]);
    expect(stats.find((s) => s.piece === '1')).toMatchObject({ reussites: 2, total: 2 });
    expect(stats.find((s) => s.piece === '2')).toMatchObject({ reussites: 1, total: 2, erreurs: [{ diagnostic: 'manquante', nombre: 1 }] });
  });
});
