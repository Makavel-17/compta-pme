import { formatMontant } from '../engine/money';
import { formatDate } from '../engine/dates';
import type { LibellesT } from '../engine/exercice';

export const m = formatMontant;
export const dt = formatDate;

/** « Exercice 01.01.–31.12.2026 » ou dates complètes si l'exercice chevauche deux années. */
export function periode(debut: string, fin: string): string {
  const a = formatDate(debut);
  const b = formatDate(fin);
  return a.slice(6) === b.slice(6) ? `${a.slice(0, 6)}–${b}` : `${a}–${b}`;
}

export function libellesSoldes(l: LibellesT) {
  return l === 'SI/SF'
    ? { initial: 'SI', final: 'SF', initialLong: 'Solde initial', finalLong: 'Solde final' }
    : { initial: 'San', final: 'Spb', initialLong: 'Solde à nouveau', finalLong: 'Solde pour bilan' };
}

/** Recherche insensible à la casse et aux accents. */
export function normaliser(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
