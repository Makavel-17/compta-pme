// Décompte de salaire : vérification des calculs de l'élève.
// Les taux sont fournis par l'énoncé (ils changent chaque année) ; arrondi aux 5 centimes.
// Taux en centièmes de pour cent (5,30 % = 530) pour rester en entiers.

import type { Centimes } from './money';

export interface LigneRetenue {
  libelle: string;
  /** Taux en centièmes de pour cent (5,30 % = 530). null si montant fixe (ex. avance de salaire). */
  taux: number | null;
  /** Base de calcul ; par défaut le salaire brut. */
  base: Centimes | null;
  /** Montant calculé par l'élève. */
  montant: Centimes | null;
}

/** Montant attendu d'une retenue : base × taux, arrondi aux 5 centimes. */
export function montantRetenue(base: Centimes, taux: number): Centimes {
  const num = base * taux; // en centimes × 1/10'000
  return Math.floor((2 * num + 5 * 10000) / (10 * 10000)) * 5;
}

export interface ControleDecompte {
  totalRetenues: Centimes;
  net: Centimes;
  /** Indices des lignes dont le montant ne correspond pas à base × taux. */
  lignesFausses: number[];
}

export function controlerDecompte(brut: Centimes, lignes: readonly LigneRetenue[]): ControleDecompte {
  const lignesFausses: number[] = [];
  let total = 0;
  lignes.forEach((l, i) => {
    total += l.montant ?? 0;
    if (l.taux !== null && l.montant !== null) {
      const attendu = montantRetenue(l.base ?? brut, l.taux);
      if (Math.abs(attendu - l.montant) > 5) lignesFausses.push(i);
    }
  });
  return { totalRetenues: total, net: brut - total, lignesFausses };
}
