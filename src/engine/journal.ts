// Journal : contrôle des écritures, ajout, contre-passation, modification directe.

import type { Centimes } from './money';
import { formatMontant, somme } from './money';
import { estDateValide, formatDate } from './dates';
import type { Dossier, Ecriture, Resultat } from './dossier';
import { comptesDisponibles, echec, indexPlan, ok } from './dossier';

export function totalDebit(e: Pick<Ecriture, 'lignes'>): Centimes {
  return somme(e.lignes.filter((l) => l.debit).map((l) => l.montant));
}

export function totalCredit(e: Pick<Ecriture, 'lignes'>): Centimes {
  return somme(e.lignes.filter((l) => l.credit).map((l) => l.montant));
}

/** Différence débit − crédit, affichée en direct sous la grille. 0 = équilibrée. */
export function difference(e: Pick<Ecriture, 'lignes'>): Centimes {
  return totalDebit(e) - totalCredit(e);
}

/** Contrôle complet d'une écriture avant validation. Retourne la liste des erreurs (vide si correcte). */
export function controlerEcriture(d: Dossier, e: Ecriture): string[] {
  const erreurs: string[] = [];
  const plan = indexPlan(d.plan);
  const disponibles = new Set(comptesDisponibles(d).map((c) => c.numero));

  if (!e.date || !estDateValide(e.date)) {
    erreurs.push('Indiquez une date valide au format JJ.MM.AAAA.');
  } else if (e.date < d.debut || e.date > d.fin) {
    erreurs.push(
      `La date ${formatDate(e.date)} est hors de l'exercice (du ${formatDate(d.debut)} au ${formatDate(d.fin)}).`,
    );
  }
  if (!e.piece.trim()) erreurs.push('Indiquez le numéro de pièce (numéro de l\'opération).');
  if (!e.libelle.trim()) erreurs.push('Indiquez un libellé.');
  if (e.lignes.length === 0) erreurs.push("L'écriture ne comporte aucune ligne.");

  e.lignes.forEach((l, i) => {
    const n = `Ligne ${i + 1}`;
    if (!l.debit && !l.credit) erreurs.push(`${n} : indiquez un compte au débit ou au crédit.`);
    if (!Number.isSafeInteger(l.montant) || l.montant <= 0) {
      erreurs.push(`${n} : le montant doit être supérieur à zéro.`);
    }
    if (l.debit && l.debit === l.credit) {
      erreurs.push(`${n} : le même compte ne peut pas être à la fois au débit et au crédit.`);
    }
    for (const compte of [l.debit, l.credit]) {
      if (!compte) continue;
      if (!plan.has(compte)) erreurs.push(`${n} : le compte ${compte} n'existe pas dans le plan comptable.`);
      else if (!disponibles.has(compte)) erreurs.push(`${n} : le compte ${compte} n'est pas utilisé dans cet exercice.`);
    }
  });

  const diff = difference(e);
  if (e.lignes.length > 0 && diff !== 0) {
    erreurs.push(
      `L'écriture n'est pas équilibrée : total débit ${formatMontant(totalDebit(e))}, ` +
        `total crédit ${formatMontant(totalCredit(e))}, différence ${formatMontant(Math.abs(diff))}.`,
    );
  }
  return erreurs;
}

/** Identifiant suivant disponible (E1, E2, …). */
export function nouvelId(d: Dossier): string {
  const max = d.ecritures.reduce((m, e) => Math.max(m, Number(/^E(\d+)$/.exec(e.id)?.[1] ?? 0)), 0);
  return `E${max + 1}`;
}

export function ajouterEcriture(d: Dossier, e: Ecriture): Resultat<Dossier> {
  if (d.ecritures.some((x) => x.id === e.id)) return echec(`L'identifiant ${e.id} est déjà utilisé.`);
  const erreurs = controlerEcriture(d, e);
  if (erreurs.length) return echec(...erreurs);
  return ok({ ...d, ecritures: [...d.ecritures, e] });
}

export function estContrePassee(d: Dossier, id: string): boolean {
  return d.ecritures.some((e) => e.contrePassationDe === id);
}

/**
 * Corrige une écriture validée par contre-passation : nouvelle écriture, même pièce,
 * débit et crédit inversés. L'écriture d'origine reste visible dans le journal.
 */
export function contrePasser(d: Dossier, id: string, date: string): Resultat<Dossier> {
  const origine = d.ecritures.find((e) => e.id === id);
  if (!origine) return echec(`Écriture ${id} introuvable.`);
  if (origine.contrePassationDe) return echec('Une contre-passation ne peut pas elle-même être contre-passée.');
  if (estContrePassee(d, id)) return echec(`La pièce ${origine.piece} a déjà été contre-passée.`);
  const inverse: Ecriture = {
    id: nouvelId(d),
    date,
    piece: origine.piece,
    libelle: `Contre-passation : ${origine.libelle}`,
    lignes: origine.lignes.map((l) => ({ debit: l.credit, credit: l.debit, montant: l.montant })),
    contrePassationDe: origine.id,
  };
  return ajouterEcriture(d, inverse);
}

/** Modification directe (entraînement, si l'enseignant l'autorise). */
export function modifierEcriture(d: Dossier, id: string, nouvelle: Omit<Ecriture, 'id'>): Resultat<Dossier> {
  const i = d.ecritures.findIndex((e) => e.id === id);
  if (i < 0) return echec(`Écriture ${id} introuvable.`);
  const ancienne = d.ecritures[i]!;
  if (ancienne.contrePassationDe || estContrePassee(d, id)) {
    return echec('Une écriture liée à une contre-passation ne peut plus être modifiée.');
  }
  const e: Ecriture = { ...nouvelle, id };
  const erreurs = controlerEcriture(d, e);
  if (erreurs.length) return echec(...erreurs);
  const ecritures = [...d.ecritures];
  ecritures[i] = e;
  return ok({ ...d, ecritures });
}
