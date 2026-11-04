// Analyse du bilan et du compte de résultat : ratios du cours (chapitre « Analyse de bilan et du résultat »).
// Les ratios servent à vérifier les calculs de l'élève ; ils sont exprimés en pour cent.

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import { indexPlan } from './dossier';
import { soldes } from './ledger';
import { resultatExercice } from './statements';

export interface Agregats {
  liquidites: Centimes;
  creances: Centimes; // ducroire déduit
  actifsCirculants: Centimes;
  actifsImmobilises: Centimes;
  totalActif: Centimes;
  totalActifOuverture: Centimes;
  ceCourtTerme: Centimes;
  ceLongTerme: Centimes;
  capitauxPropres: Centimes; // résultat de l'exercice compris
  capitauxPropresOuverture: Centimes;
  reservesEtReporte: Centimes; // réserves issues du bénéfice + bénéfice reporté (+ résultat non réparti)
  chiffreAffairesNet: Centimes;
  margeBrute: Centimes;
  ebitda: Centimes;
  ebit: Centimes;
  beneficeNet: Centimes;
}

const dans = (n: string, de: string, a: string) => n >= de && n <= a;

export function agregats(d: Dossier): Agregats {
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  const r: Omit<Agregats, 'totalActif' | 'capitauxPropres' | 'beneficeNet' | 'ebitda' | 'ebit' | 'margeBrute' | 'totalActifOuverture' | 'capitauxPropresOuverture'> = {
    liquidites: 0, creances: 0, actifsCirculants: 0, actifsImmobilises: 0, ceCourtTerme: 0, ceLongTerme: 0,
    reservesEtReporte: 0, chiffreAffairesNet: 0,
  };
  let cp = 0;
  let marchandises = 0, personnel = 0, autres = 0, amort = 0;
  let actifOuv = 0, cpOuv = 0;
  for (const [n, x] of s) {
    const t = plan.get(n)?.type;
    if (t === 'actif') {
      if (dans(n, '1000', '1099')) r.liquidites += x.solde;
      if (dans(n, '1100', '1199')) r.creances += x.solde;
      if (dans(n, '1000', '1399')) r.actifsCirculants += x.solde;
      else r.actifsImmobilises += x.solde;
      actifOuv += x.ouverture;
    } else if (t === 'passif') {
      if (dans(n, '2000', '2399')) r.ceCourtTerme -= x.solde;
      else if (dans(n, '2400', '2799')) r.ceLongTerme -= x.solde;
      else {
        cp -= x.solde;
        cpOuv -= x.ouverture;
        if (dans(n, '2950', '2979')) r.reservesEtReporte -= x.solde;
      }
    } else if (t === 'produit' || t === 'charge') {
      const v = t === 'produit' ? -x.solde : x.solde;
      if (dans(n, '3000', '3999')) r.chiffreAffairesNet += v;
      else if (dans(n, '4000', '4999')) marchandises += v;
      else if (dans(n, '5000', '5999')) personnel += v;
      else if (dans(n, '6000', '6799')) autres += v;
      else if (dans(n, '6800', '6899')) amort += v;
      // Résultat financier, hors exploitation et impôts : sous l'EBIT, compris dans le bénéfice net.
    }
  }
  const beneficeNet = resultatExercice(d);
  const margeBrute = r.chiffreAffairesNet - marchandises;
  const ebitda = margeBrute - personnel - autres;
  const ebit = ebitda - amort;
  return {
    ...r,
    totalActif: r.actifsCirculants + r.actifsImmobilises,
    totalActifOuverture: actifOuv,
    capitauxPropres: cp + beneficeNet,
    capitauxPropresOuverture: cpOuv,
    reservesEtReporte: r.reservesEtReporte + beneficeNet,
    margeBrute,
    ebitda,
    ebit,
    beneficeNet,
  };
}

export type CleRatio =
  | 'liquidite1'
  | 'liquidite2'
  | 'endettement'
  | 'financementPropre'
  | 'autofinancement'
  | 'couverture2'
  | 'margeBrute'
  | 'margeEconomique'
  | 'margeNette'
  | 'roi'
  | 'rfp';

export interface DefRatio {
  cle: CleRatio;
  libelle: string;
  formule: string;
}

export const RATIOS: DefRatio[] = [
  { cle: 'liquidite1', libelle: 'Liquidités 1 (cash ratio)', formule: 'Liquidités / capitaux étrangers à court terme' },
  { cle: 'liquidite2', libelle: 'Liquidités 2 (quick ratio)', formule: '(Liquidités + créances) / capitaux étrangers à court terme' },
  { cle: 'endettement', libelle: "Degré d'endettement", formule: 'Capitaux étrangers / total du passif' },
  { cle: 'financementPropre', libelle: 'Degré de financement propre', formule: 'Capitaux propres / total du passif' },
  { cle: 'autofinancement', libelle: "Degré d'autofinancement", formule: '(Réserves issues du bénéfice + bénéfice reporté) / capitaux propres' },
  { cle: 'couverture2', libelle: 'Degré de couverture des immobilisations 2', formule: '(Capitaux étrangers à long terme + capitaux propres) / actifs immobilisés' },
  { cle: 'margeBrute', libelle: 'Taux de marge brute', formule: "Marge brute / chiffre d'affaires net" },
  { cle: 'margeEconomique', libelle: 'Taux de marge économique', formule: "EBIT / chiffre d'affaires net" },
  { cle: 'margeNette', libelle: 'Taux de marge nette', formule: "Bénéfice net / chiffre d'affaires net" },
  { cle: 'roi', libelle: 'Rentabilité des capitaux investis (ROI)', formule: 'EBIT / actif moyen ((actif au début + actif à la fin) / 2)' },
  { cle: 'rfp', libelle: 'Rentabilité des fonds propres', formule: 'Bénéfice net / capitaux propres moyens' },
];

const pc = (a: number, b: number): number | null => (b === 0 ? null : (a / b) * 100);

/** Ratios en pour cent (null si le dénominateur est nul). */
export function ratios(d: Dossier): Record<CleRatio, number | null> {
  const a = agregats(d);
  const totalPassif = a.ceCourtTerme + a.ceLongTerme + a.capitauxPropres;
  return {
    liquidite1: pc(a.liquidites, a.ceCourtTerme),
    liquidite2: pc(a.liquidites + a.creances, a.ceCourtTerme),
    endettement: pc(a.ceCourtTerme + a.ceLongTerme, totalPassif),
    financementPropre: pc(a.capitauxPropres, totalPassif),
    autofinancement: pc(a.reservesEtReporte, a.capitauxPropres),
    couverture2: pc(a.ceLongTerme + a.capitauxPropres, a.actifsImmobilises),
    margeBrute: pc(a.margeBrute, a.chiffreAffairesNet),
    margeEconomique: pc(a.ebit, a.chiffreAffairesNet),
    margeNette: pc(a.beneficeNet, a.chiffreAffairesNet),
    roi: pc(a.ebit, (a.totalActifOuverture + a.totalActif) / 2),
    rfp: pc(a.beneficeNet, (a.capitauxPropresOuverture + a.capitauxPropres) / 2),
  };
}

/** Tolérance de vérification : 0.1 point de pour cent (arrondis de l'élève). */
export function ratioJuste(attendu: number | null, saisi: number): boolean {
  return attendu !== null && Math.abs(attendu - saisi) <= 0.1 + 1e-9;
}
