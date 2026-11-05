import { formatMontant } from '../engine/money';
import { formatDate } from '../engine/dates';
import type { LibellesT } from '../engine/exercice';

export const m = formatMontant;
export const dt = formatDate;

/** Date et heure locales au format suisse : « 05.11.2026 à 18:40 ». */
export function dateHeure(iso: string): string {
  const d = new Date(iso);
  const z = (n: number) => String(n).padStart(2, '0');
  return `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()} à ${z(d.getHours())}:${z(d.getMinutes())}`;
}

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

/** Titres des classes du plan du cours (listes de comptes groupées par classe). */
export const TITRES_CLASSES: Record<number, string> = {
  1: 'Classe 1 : Actifs',
  2: 'Classe 2 : Passifs',
  3: "Classe 3 : Chiffre d'affaires (ventes et prestations de service)",
  4: 'Classe 4 : Charges de marchandises et de services',
  5: 'Classe 5 : Charges de personnel',
  6: "Classe 6 : Autres charges d'exploitation, amortissements, résultat financier",
  8: 'Classe 8 : Résultats hors exploitation et exceptionnels',
  9: 'Classe 9 : Clôture',
};
