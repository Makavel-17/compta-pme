// Tableaux d'analyse du cours MP (manuel F&C, profil M), validés par l'enseignant le 06.11.2026 :
// - compte de résultat à plusieurs degrés selon le plan comptable PME (ch. 56) ;
// - tableau des flux de trésorerie, cash flow d'exploitation par la méthode indirecte (ch. 57) ;
// - seuil de rentabilité et marge contributive (ch. 44).
// Tous les montants sont en centimes ; les tableaux se calculent sur les comptes avant bouclement.

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import { indexPlan } from './dossier';
import { soldes } from './ledger';
import { resultatExercice } from './statements';

const dans = (n: string, de: string, a: string) => n >= de && n <= a;

// ---------- Compte de résultat à plusieurs degrés ----------

export interface Degres {
  chiffreAffaires: Centimes;
  chargesMarchandises: Centimes;
  margeBrute: Centimes;
  chargesPersonnel: Centimes;
  autresCharges: Centimes;
  ebitda: Centimes;
  amortissements: Centimes;
  ebit: Centimes;
  /** Produits financiers − charges financières. */
  resultatFinancier: Centimes;
  resultatNetExploitation: Centimes;
  /** Activités annexes d'exploitation (classe 7, immeubles). */
  resultatAnnexes: Centimes;
  /** Hors exploitation (8000–8499) : produits − charges. */
  resultatHorsExploitation: Centimes;
  /** Exceptionnels (8500–8599) : produits − charges. */
  resultatExceptionnel: Centimes;
  ebt: Centimes;
  impots: Centimes;
  resultat: Centimes;
}

export function degres(d: Dossier): Degres {
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  let ca = 0, march = 0, pers = 0, autres = 0, amort = 0, fin = 0, annexes = 0, hors = 0, exc = 0, impots = 0;
  for (const [n, x] of s) {
    const t = plan.get(n)?.type;
    if (t !== 'produit' && t !== 'charge') continue;
    // Montant « en produit » : positif pour un produit, négatif pour une charge.
    const p = -x.solde;
    if (dans(n, '3000', '3999')) ca += p;
    else if (dans(n, '4000', '4999')) march -= p;
    else if (dans(n, '5000', '5999')) pers -= p;
    else if (dans(n, '6000', '6799')) autres -= p;
    else if (dans(n, '6800', '6899')) amort -= p;
    else if (dans(n, '6900', '6999')) fin += p;
    else if (dans(n, '7000', '7999')) annexes += p;
    else if (dans(n, '8000', '8499')) hors += p;
    else if (dans(n, '8500', '8599')) exc += p;
    else if (dans(n, '8900', '8999')) impots -= p;
  }
  const margeBrute = ca - march;
  const ebitda = margeBrute - pers - autres;
  const ebit = ebitda - amort;
  const resultatNetExploitation = ebit + fin;
  const ebt = resultatNetExploitation + annexes + hors + exc;
  return {
    chiffreAffaires: ca,
    chargesMarchandises: march,
    margeBrute,
    chargesPersonnel: pers,
    autresCharges: autres,
    ebitda,
    amortissements: amort,
    ebit,
    resultatFinancier: fin,
    resultatNetExploitation,
    resultatAnnexes: annexes,
    resultatHorsExploitation: hors,
    resultatExceptionnel: exc,
    ebt,
    impots,
    resultat: ebt - impots,
  };
}

// ---------- Tableau des flux de trésorerie ----------

export interface FluxTresorerie {
  benefice: Centimes;
  /** Charges sans effet monétaire : amortissements (crédits non monétaires aux immobilisations). */
  amortissements: Centimes;
  /** Augmentation (+) ou diminution (−) des provisions (26xx). */
  variationProvisions: Centimes;
  /** Variation des actifs circulants hors liquidités (créances nettes, stocks, actifs transitoires) : augmentation positive. */
  variationActifsCirculants: Centimes;
  /** Variation des dettes d'exploitation à court terme et des passifs transitoires : augmentation positive. */
  variationDettesExploitation: Centimes;
  exploitation: Centimes;
  investissement: Centimes;
  financement: Centimes;
  liquiditesDebut: Centimes;
  liquiditesFin: Centimes;
  variationLiquidites: Centimes;
}

/** Fonds de trésorerie : caisse, poste et banque (1000–1059). */
const estLiquidite = (n: string) => dans(n, '1000', '1059');
/** Capital non versé (actionnaires, participants) : flux de financement. */
const estCapitalNonVerse = (n: string) => dans(n, '1850', '1869');

export function fluxTresorerie(d: Dossier): FluxTresorerie {
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  const benefice = resultatExercice(d);
  // Variation d'un solde (positif = débiteur) entre ouverture et fin.
  const delta = (filtre: (n: string) => boolean) => {
    let v = 0;
    for (const [n, x] of s) if (filtre(n) && ['actif', 'passif'].includes(plan.get(n)?.type ?? '')) v += x.solde - x.ouverture;
    return v;
  };
  const somme = (filtre: (n: string) => boolean, quand: 'ouverture' | 'solde') => {
    let v = 0;
    for (const [n, x] of s) if (filtre(n)) v += x[quand];
    return v;
  };

  // Amortissements : crédits aux immobilisations dans des écritures sans liquidités qui débitent une charge.
  let amortissements = 0;
  for (const e of d.ecritures) {
    const comptes = e.lignes.flatMap((l) => [l.debit, l.credit]).filter((x): x is string => !!x);
    if (comptes.some(estLiquidite)) continue;
    if (!e.lignes.some((l) => l.debit && plan.get(l.debit)?.type === 'charge')) continue;
    for (const l of e.lignes) if (l.credit && dans(l.credit, '1400', '1999') && !estCapitalNonVerse(l.credit)) amortissements += l.montant;
    // Extourne d'un amortissement : le débit sur une immobilisation le diminue.
    for (const l of e.lignes) if (l.debit && dans(l.debit, '1400', '1999') && !estCapitalNonVerse(l.debit) && e.extourneDe) amortissements -= l.montant;
  }

  const actifsCirculants = delta((n) => dans(n, '1060', '1399'));
  const provisions = -delta((n) => dans(n, '2600', '2699'));
  const dettesExploitation = -delta((n) => dans(n, '2000', '2399') && n !== '2100' && n !== '2230');
  const exploitation = benefice + amortissements + provisions - actifsCirculants + dettesExploitation;

  const immobilisations = delta((n) => dans(n, '1400', '1999') && !estCapitalNonVerse(n));
  const investissement = -(immobilisations + amortissements);

  const financement =
    -delta((n) => n === '2100' || n === '2230' || dans(n, '2400', '2599') || dans(n, '2700', '2999')) -
    delta(estCapitalNonVerse);

  const liquiditesDebut = somme(estLiquidite, 'ouverture');
  const liquiditesFin = somme(estLiquidite, 'solde');
  return {
    benefice,
    amortissements,
    variationProvisions: provisions,
    variationActifsCirculants: actifsCirculants,
    variationDettesExploitation: dettesExploitation,
    exploitation,
    investissement,
    financement,
    liquiditesDebut,
    liquiditesFin,
    variationLiquidites: liquiditesFin - liquiditesDebut,
  };
}

// ---------- Seuil de rentabilité ----------

export interface DonneesSeuil {
  /** Désignation de l'unité vendue (« vélo », « repas »…). */
  unite: string;
  prixVente: Centimes;
  coutVariable: Centimes;
  chargesFixes: Centimes;
  /** Quantité vendue pour laquelle l'élève calcule le résultat. */
  quantite: number;
}

export interface Seuil {
  margeContributiveUnitaire: Centimes;
  /** Taux de marge contributive, en pour cent du prix de vente. */
  tauxMargeContributive: number;
  /** Quantité au seuil de rentabilité (peut ne pas être entière). */
  seuilQuantite: number;
  seuilChiffreAffaires: Centimes;
  resultatQuantite: Centimes;
}

export function seuil(x: DonneesSeuil): Seuil {
  const mcu = x.prixVente - x.coutVariable;
  return {
    margeContributiveUnitaire: mcu,
    tauxMargeContributive: x.prixVente ? (mcu / x.prixVente) * 100 : 0,
    seuilQuantite: mcu > 0 ? x.chargesFixes / mcu : Infinity,
    seuilChiffreAffaires: mcu > 0 ? Math.round((x.chargesFixes / mcu) * x.prixVente) : Infinity,
    resultatQuantite: x.quantite * mcu - x.chargesFixes,
  };
}
