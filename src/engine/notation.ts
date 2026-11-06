// Notation : barème par opération, points partiels pour les écritures multiples, note selon l'échelle suisse.
//
// Règles validées :
// - tout ou rien par opération, sauf pour les écritures multiples où des points partiels sont possibles ;
// - note = 1 + points obtenus / points max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6.
//
// Points partiels (proposition à valider) : pour une opération dont le corrigé comporte au moins
// trois « lignes » (compte + côté), points = barème × (lignes justes − lignes en trop) / lignes attendues,
// arrondi vers le bas au demi-point, jamais négatif.

import type { Dossier, Ecriture, LigneEcriture } from './dossier';
import type { EcritureCorrigee, Exercice } from './exercice';
import { diagnostiquer, ecrituresRetenues, TOLERANCE, type Diagnostic } from './correction';
import {
  bouclementCorrige,
  corrigeBouclement,
  ecrituresPourNotation,
  PIECE_BOUCLEMENT,
  POINTS_BOUCLEMENT_PAR_DEFAUT,
} from './correction-bouclement';

export const POINTS_PAR_DEFAUT = 1;

function agreger(lignes: readonly LigneEcriture[]): Map<string, number> {
  const a = new Map<string, number>();
  for (const l of lignes) {
    if (l.debit) a.set(`${l.debit}|D`, (a.get(`${l.debit}|D`) ?? 0) + l.montant);
    if (l.credit) a.set(`${l.credit}|C`, (a.get(`${l.credit}|C`) ?? 0) + l.montant);
  }
  return a;
}

/** Une opération est « multiple » si son corrigé touche au moins trois comptes/côtés. */
export function estMultiple(c: EcritureCorrigee): boolean {
  return agreger(c.lignes).size >= 3;
}

const auDemiPointInferieur = (x: number) => Math.floor(x * 2 + 1e-9) / 2;

export interface ResultatOperation {
  piece: string;
  diagnostic: Diagnostic;
  points: number;
  max: number;
}

/** Points d'une opération. */
export function pointsOperation(
  eleve: readonly Ecriture[],
  corrige: EcritureCorrigee,
  max: number,
  pointsPartiels: boolean,
): ResultatOperation {
  const diagnostic = diagnostiquer(eleve, corrige);
  if (diagnostic === 'juste') return { piece: corrige.piece, diagnostic, points: max, max };
  if (!pointsPartiels || !estMultiple(corrige) || diagnostic === 'manquante') {
    return { piece: corrige.piece, diagnostic, points: 0, max };
  }
  const attendu = agreger(corrige.lignes);
  const saisi = agreger(ecrituresRetenues(eleve).filter((e) => e.piece === corrige.piece).flatMap((e) => e.lignes));
  let justes = 0;
  let enTrop = 0;
  for (const [k, v] of saisi) {
    const w = attendu.get(k);
    if (w !== undefined && Math.abs(v - w) <= TOLERANCE) justes++;
    else if (w === undefined) enTrop++;
  }
  const points = auDemiPointInferieur(Math.max(0, ((justes - enTrop) / attendu.size) * max));
  return { piece: corrige.piece, diagnostic, points, max };
}

/** Note suisse : 1 + points / max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6. */
export function noteSuisse(points: number, max: number): number {
  if (max <= 0) return 1;
  const brute = 1 + (points / max) * 5;
  const arrondie = Math.floor(brute * 2 + 0.5 + 1e-9) / 2;
  return Math.min(6, Math.max(1, arrondie));
}

export interface CorrectionCopie {
  operations: ResultatOperation[];
  points: number;
  max: number;
  note: number;
}

export function corrigerCopie(ex: Exercice, d: Dossier): CorrectionCopie {
  const bareme = ex.bareme ?? {};
  const partiels = ex.pointsPartiels ?? true;
  const ecritures = ecrituresPourNotation(d, ex);
  const operations = (ex.corrige ?? [])
    .filter((c) => ex.operations.some((o) => o.numero === c.piece))
    .map((c) => pointsOperation(ecritures, c, bareme[c.piece] ?? POINTS_PAR_DEFAUT, partiels));
  if (bouclementCorrige(ex)) {
    const max = bareme[PIECE_BOUCLEMENT] ?? POINTS_BOUCLEMENT_PAR_DEFAUT;
    const c = corrigeBouclement(d, ex);
    if (c && max > 0) operations.push(pointsOperation(ecritures, c, max, partiels));
  }
  const points = operations.reduce((s, o) => s + o.points, 0);
  const max = operations.reduce((s, o) => s + o.max, 0);
  return { operations, points, max, note: noteSuisse(points, max) };
}

// ---------- Synthèse de plusieurs copies ----------

export interface StatOperation {
  piece: string;
  reussites: number;
  total: number;
  /** Erreurs triées de la plus fréquente à la moins fréquente (hors « juste »). */
  erreurs: { diagnostic: Diagnostic; nombre: number }[];
}

export function statistiquesOperations(corrections: readonly CorrectionCopie[]): StatOperation[] {
  const parPiece = new Map<string, StatOperation>();
  for (const c of corrections) {
    for (const o of c.operations) {
      const s = parPiece.get(o.piece) ?? { piece: o.piece, reussites: 0, total: 0, erreurs: [] };
      s.total++;
      if (o.diagnostic === 'juste') s.reussites++;
      else {
        const e = s.erreurs.find((x) => x.diagnostic === o.diagnostic);
        if (e) e.nombre++;
        else s.erreurs.push({ diagnostic: o.diagnostic, nombre: 1 });
      }
      parPiece.set(o.piece, s);
    }
  }
  for (const s of parPiece.values()) s.erreurs.sort((a, b) => b.nombre - a.nombre);
  return [...parPiece.values()];
}

/** Écritures de l'élève et corrigé d'une opération, côte à côte (détail d'une copie). */
export function comparaisonOperation(ex: Exercice, d: Dossier, piece: string): { eleve: LigneEcriture[]; corrige: LigneEcriture[] } {
  const eleve = ecrituresRetenues(ecrituresPourNotation(d, ex))
    .filter((e) => e.piece === piece)
    .flatMap((e) => e.lignes);
  const corrige =
    piece === PIECE_BOUCLEMENT ? (corrigeBouclement(d, ex)?.lignes ?? []) : ((ex.corrige ?? []).find((c) => c.piece === piece)?.lignes ?? []);
  return { eleve, corrige };
}
