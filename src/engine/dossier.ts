// Dossier comptable d'un exercice : identité, plan, bilan d'ouverture, écritures.

import type { Centimes } from './money';
import { formatMontant, somme } from './money';
import type { DateISO } from './dates';
import type { Compte, Niveau } from './plan';
import { comptesDuNiveau } from './plan';

export type FormeJuridique = 'raison individuelle' | 'Sàrl' | 'SA';

/**
 * Ligne d'écriture. Écriture simple : une ligne avec compte au débit ET au crédit.
 * Écriture composée : plusieurs lignes dont certaines n'ont qu'un côté renseigné.
 */
export interface LigneEcriture {
  debit: string | null;
  credit: string | null;
  montant: Centimes;
}

export interface Ecriture {
  id: string;
  date: DateISO;
  /** Numéro de pièce = numéro de l'opération de l'énoncé. */
  piece: string;
  libelle: string;
  lignes: LigneEcriture[];
  /** Renseigné si cette écriture est l'extourne d'une autre. */
  extourneDe?: string;
}

export interface Dossier {
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  debut: DateISO;
  fin: DateISO;
  niveau: Niveau;
  plan: Compte[];
  /** Ajustements de l'enseignant par rapport au niveau. */
  comptesAjoutes: string[];
  comptesMasques: string[];
  /** Soldes d'ouverture, en centimes, positif = débiteur, négatif = créditeur. */
  ouverture: Record<string, Centimes>;
  ecritures: Ecriture[];
}

export type Resultat<T> = { ok: true; valeur: T } | { ok: false; erreurs: string[] };

export function ok<T>(valeur: T): Resultat<T> {
  return { ok: true, valeur };
}
export function echec<T>(...erreurs: string[]): Resultat<T> {
  return { ok: false, erreurs };
}

export function indexPlan(plan: readonly Compte[]): Map<string, Compte> {
  return new Map(plan.map((c) => [c.numero, c]));
}

/** Comptes utilisables dans ce dossier : ceux du niveau, plus les ajouts, moins les masqués. */
export function comptesDisponibles(d: Dossier): Compte[] {
  const visibles = new Set(comptesDuNiveau(d.plan, d.niveau).map((c) => c.numero));
  for (const n of d.comptesAjoutes) visibles.add(n);
  for (const n of d.comptesMasques) visibles.delete(n);
  return d.plan.filter((c) => visibles.has(c.numero));
}

/**
 * Construit les soldes d'ouverture à partir d'un bilan saisi en montants positifs
 * (actif d'un côté, passif de l'autre), comme le fait l'élève ou l'enseignant.
 */
export function ouvertureDepuisBilan(
  actif: Record<string, Centimes>,
  passif: Record<string, Centimes>,
): Record<string, Centimes> {
  const o: Record<string, Centimes> = {};
  for (const [n, m] of Object.entries(actif)) o[n] = (o[n] ?? 0) + m;
  for (const [n, m] of Object.entries(passif)) o[n] = (o[n] ?? 0) - m;
  return o;
}

/** Contrôle du bilan d'ouverture : comptes existants, de bilan, et total actif = total passif. */
export function controlerOuverture(d: Pick<Dossier, 'plan' | 'ouverture'>): string[] {
  const erreurs: string[] = [];
  const idx = indexPlan(d.plan);
  for (const [n, m] of Object.entries(d.ouverture)) {
    const c = idx.get(n);
    if (!c) erreurs.push(`Bilan d'ouverture : le compte ${n} n'existe pas dans le plan comptable.`);
    else if (c.type !== 'actif' && c.type !== 'passif') {
      erreurs.push(`Bilan d'ouverture : le compte ${n} ${c.intitule} n'est pas un compte de bilan.`);
    }
    if (!Number.isSafeInteger(m)) erreurs.push(`Bilan d'ouverture : montant invalide pour le compte ${n}.`);
  }
  const diff = somme(Object.values(d.ouverture));
  if (diff !== 0) {
    const sens = diff > 0 ? 'dépasse le passif' : 'est inférieur au passif';
    erreurs.push(`Le bilan d'ouverture n'est pas équilibré : l'actif ${sens} de ${formatMontant(Math.abs(diff))} CHF.`);
  }
  return erreurs;
}
