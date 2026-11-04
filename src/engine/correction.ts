// Correction automatique : comparaison des écritures de l'élève au corrigé, opération par opération.
//
// Règles validées par l'enseignant :
// - le numéro de pièce identifie l'opération ; l'ordre de saisie et la date ne comptent pas ;
// - on compare, par opération, les totaux au débit et au crédit de chaque compte,
//   avec une tolérance de 0.05 CHF : une écriture composée équivaut à sa décomposition ;
// - une écriture et son extourne s'annulent et ne sont pas prises en compte.

import type { Centimes } from './money';
import type { Ecriture } from './dossier';
import type { EcritureCorrigee } from './exercice';

export const TOLERANCE: Centimes = 5;

/** Comptes de TVA : impôt préalable (1170, 1171) et TVA due (2200). */
const COMPTES_TVA = new Set(['1170', '1171', '2200']);

export type Diagnostic =
  | 'juste'
  | 'manquante'
  | 'incomplete'
  | 'inversee'
  | 'tva_oubliee'
  | 'montant'
  | 'compte_classe'
  | 'compte'
  | 'erronee';

/** Indices du 1er niveau : nomment le type d'erreur sans donner la réponse. */
export const INDICES: Record<Diagnostic, string> = {
  juste: '',
  manquante: "Cette opération n'a pas encore été saisie.",
  incomplete: "L'opération n'est pas encore complète : il manque une partie de l'écriture.",
  inversee: 'Le débit et le crédit sont inversés.',
  tva_oubliee: "La TVA n'a pas été comptabilisée.",
  montant: 'Les comptes sont justes, mais un montant ne correspond pas à l\'opération.',
  compte_classe: "Bonne classe de comptes, mais un compte n'est pas le bon.",
  compte: "Au moins un compte n'est pas le bon : demandez-vous quels comptes l'opération modifie.",
  erronee: "L'écriture ne correspond pas à l'opération. Relisez l'énoncé.",
};

type Agregat = Map<string, Centimes>; // clé « compte|D » ou « compte|C »

function agreger(lignes: { debit: string | null; credit: string | null; montant: Centimes }[]): Agregat {
  const a: Agregat = new Map();
  const ajouter = (cle: string, m: Centimes) => a.set(cle, (a.get(cle) ?? 0) + m);
  for (const l of lignes) {
    if (l.debit) ajouter(`${l.debit}|D`, l.montant);
    if (l.credit) ajouter(`${l.credit}|C`, l.montant);
  }
  return a;
}

/** Écritures de l'élève à prendre en compte : sans les écritures extournées ni leurs extournes. */
export function ecrituresRetenues(ecritures: readonly Ecriture[]): Ecriture[] {
  const extournees = new Set(ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  return ecritures.filter((e) => !e.extourneDe && !extournees.has(e.id));
}

function egaux(a: Agregat, b: Agregat): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (w === undefined || Math.abs(v - w) > TOLERANCE) return false;
  }
  return true;
}

function inverser(a: Agregat): Agregat {
  const r: Agregat = new Map();
  for (const [k, v] of a) {
    const [c, s] = k.split('|');
    r.set(`${c}|${s === 'D' ? 'C' : 'D'}`, v);
  }
  return r;
}

const compteDe = (cle: string) => cle.split('|')[0]!;
const sensDe = (cle: string) => cle.split('|')[1]!;

/** Diagnostic d'une opération : écritures de l'élève (même pièce) comparées au corrigé. */
export function diagnostiquer(eleve: readonly Ecriture[], corrige: EcritureCorrigee): Diagnostic {
  const e = agreger(ecrituresRetenues(eleve).filter((x) => x.piece === corrige.piece).flatMap((x) => x.lignes));
  const c = agreger(corrige.lignes);
  if (e.size === 0) return 'manquante';
  if (egaux(e, c)) return 'juste';
  if (egaux(inverser(e), c)) return 'inversee';

  const tvaAttendue = [...c.keys()].some((k) => COMPTES_TVA.has(compteDe(k)));
  const tvaSaisie = [...e.keys()].some((k) => COMPTES_TVA.has(compteDe(k)));
  if (tvaAttendue && !tvaSaisie) return 'tva_oubliee';

  // Mêmes comptes, mêmes côtés : seul un montant diffère.
  if (e.size === c.size && [...e.keys()].every((k) => c.has(k))) return 'montant';

  // Partie juste d'une opération décomposée en plusieurs écritures.
  if ([...e].every(([k, v]) => c.has(k) && v <= c.get(k)! + TOLERANCE)) return 'incomplete';

  // Même structure, mais des comptes différents : on apparie par côté et par montant.
  const enTrop = [...e].filter(([k]) => !c.has(k));
  const manquants = [...c].filter(([k]) => !e.has(k));
  const communsJustes = [...e].filter(([k]) => c.has(k)).every(([k, v]) => Math.abs(v - c.get(k)!) <= TOLERANCE);
  if (communsJustes && enTrop.length === manquants.length) {
    const libres = [...manquants];
    let memeClasse = true;
    for (const [k, v] of enTrop) {
      const i = libres.findIndex(([k2, v2]) => sensDe(k2) === sensDe(k) && Math.abs(v2 - v) <= TOLERANCE);
      if (i < 0) return 'erronee';
      if (compteDe(libres[i]![0])[0] !== compteDe(k)[0]) memeClasse = false;
      libres.splice(i, 1);
    }
    return memeClasse ? 'compte_classe' : 'compte';
  }
  return 'erronee';
}

// ---------- Suivi des tentatives (entraînement) ----------

export interface SuiviOperation {
  /** Nombre de tentatives jugées fausses. */
  essais: number;
  dernier: Diagnostic;
  solutionVue: boolean;
}

export type Suivi = Record<string, SuiviOperation>;

/**
 * Enregistre une tentative après la validation d'une écriture de la pièce donnée.
 * Une opération incomplète (décomposition en cours) ne compte pas comme une erreur.
 */
export function enregistrerTentative(suivi: Suivi, piece: string, d: Diagnostic): Suivi {
  const ancien = suivi[piece] ?? { essais: 0, dernier: 'manquante' as Diagnostic, solutionVue: false };
  const faux = d !== 'juste' && d !== 'incomplete' && d !== 'manquante';
  return { ...suivi, [piece]: { ...ancien, essais: ancien.essais + (faux ? 1 : 0), dernier: d } };
}

/** Le bouton « Voir la solution » n'apparaît qu'après une nouvelle tentative fausse. */
export function solutionDisponible(s: SuiviOperation | undefined): boolean {
  return !!s && s.essais >= 2 && s.dernier !== 'juste';
}
