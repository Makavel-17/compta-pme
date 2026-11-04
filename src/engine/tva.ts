// TVA, méthode effective. Taux en dixièmes de pour cent (8,1 % = 81) pour rester en entiers.
// Arrondi aux 5 centimes (règle validée par l'enseignant).

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import { soldes } from './ledger';

export const TAUX_TVA = { normal: 81, reduit: 26, hebergement: 38 } as const;
export type TauxTva = number;

export const LIBELLES_TAUX: Record<keyof typeof TAUX_TVA, string> = {
  normal: 'Taux normal 8,1 %',
  reduit: 'Taux réduit 2,6 %',
  hebergement: 'Taux spécial hébergement 3,8 %',
};

/** Arrondi aux 5 centimes d'une fraction positive num / den (en centimes), demi vers le haut. */
function arrondi5Fraction(num: number, den: number): Centimes {
  return Math.floor((2 * num + 5 * den) / (10 * den)) * 5;
}

/** TVA sur un montant hors taxe. */
export function tvaSurHT(ht: Centimes, taux: TauxTva): Centimes {
  return ht < 0 ? -tvaSurHT(-ht, taux) : arrondi5Fraction(ht * taux, 1000);
}

/** TVA comprise dans un montant TTC : TTC × taux / (100 + taux). */
export function tvaSurTTC(ttc: Centimes, taux: TauxTva): Centimes {
  return ttc < 0 ? -tvaSurTTC(-ttc, taux) : arrondi5Fraction(ttc * taux, 1000 + taux);
}

export const COMPTE_TVA_DUE = '2200';
export const COMPTES_IP = ['1170', '1171'] as const;
export const COMPTE_DETTE_AFC = '2206';

export interface DecompteTva {
  tvaDue: Centimes;
  ipMarchandises: Centimes;
  ipInvestissements: Centimes;
  /** Positif : montant dû à l'AFC ; négatif : montant à recevoir de l'AFC. */
  solde: Centimes;
  /** Solde actuel du compte de dette envers l'AFC (positif = dette). */
  detteAfc: Centimes;
}

/** Récapitulatif d'après les soldes actuels des comptes de TVA. */
export function decompteTva(d: Dossier): DecompteTva {
  const s = soldes(d);
  const v = (n: string) => s.get(n)?.solde ?? 0;
  const neg = (x: number) => (x === 0 ? 0 : -x); // évite -0
  const tvaDue = neg(v(COMPTE_TVA_DUE));
  const ipMarchandises = v('1170');
  const ipInvestissements = v('1171');
  return {
    tvaDue,
    ipMarchandises,
    ipInvestissements,
    solde: tvaDue - ipMarchandises - ipInvestissements,
    detteAfc: neg(v(COMPTE_DETTE_AFC)),
  };
}
