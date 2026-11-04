// Bilan et compte de résultat en forme de compte (deux colonnes).
// Les intitulés de groupes reprennent ceux du plan LPG.

import type { Centimes } from './money';
import type { Dossier } from './dossier';
import { indexPlan } from './dossier';
import { soldes } from './ledger';
import type { Compte } from './plan';

export interface Poste {
  numero: string;
  intitule: string;
  /** Montant présenté : positif dans le sens normal de la colonne, négatif pour un compte de correction. */
  montant: Centimes;
}

export interface Groupe {
  titre: string;
  postes: Poste[];
  total: Centimes;
}

interface DefGroupe {
  titre: string;
  /** Plage de numéros de comptes couverte, bornes comprises. */
  de: string;
  a: string;
  type: Compte['type'];
}

const GROUPES_ACTIF: DefGroupe[] = [
  { titre: 'Actifs circulants', de: '1000', a: '1399', type: 'actif' },
  { titre: 'Actifs immobilisés', de: '1400', a: '1999', type: 'actif' },
];
const GROUPES_PASSIF: DefGroupe[] = [
  { titre: 'Dettes à court terme', de: '2000', a: '2399', type: 'passif' },
  { titre: 'Dettes à long terme', de: '2400', a: '2799', type: 'passif' },
  { titre: 'Capitaux propres', de: '2800', a: '2999', type: 'passif' },
];
const GROUPES_CHARGES: DefGroupe[] = [
  { titre: 'Charges liées aux marchandises', de: '4000', a: '4999', type: 'charge' },
  { titre: 'Charges liées aux employés', de: '5000', a: '5999', type: 'charge' },
  { titre: "Charges d'exploitation", de: '6000', a: '6799', type: 'charge' },
  { titre: 'Charges financières', de: '6800', a: '6849', type: 'charge' },
  { titre: 'Amortissements', de: '6900', a: '6999', type: 'charge' },
  { titre: 'Charges exceptionnelles et hors exploitation', de: '8000', a: '8899', type: 'charge' },
  { titre: "Charges d'impôt", de: '8900', a: '8999', type: 'charge' },
];
const GROUPES_PRODUITS: DefGroupe[] = [
  { titre: 'Ventes de marchandises', de: '3000', a: '3999', type: 'produit' },
  { titre: 'Produits financiers', de: '6850', a: '6899', type: 'produit' },
  { titre: "Bénéfice sur vente d'actifs", de: '7000', a: '7999', type: 'produit' },
  { titre: 'Produits exceptionnels et hors exploitation', de: '8000', a: '8999', type: 'produit' },
];

function construire(defs: DefGroupe[], plan: Map<string, Compte>, s: Map<string, { solde: Centimes }>): Groupe[] {
  const groupes: Groupe[] = [];
  for (const def of defs) {
    const postes: Poste[] = [...s.entries()]
      .filter(([n, x]) => x.solde !== 0 && n >= def.de && n <= def.a && plan.get(n)?.type === def.type)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([n, x]) => ({
        numero: n,
        intitule: plan.get(n)?.intitule ?? '',
        // Actif et charges : solde débiteur positif ; passif et produits : solde créditeur positif.
        montant: def.type === 'actif' || def.type === 'charge' ? x.solde : -x.solde,
      }));
    if (postes.length) groupes.push({ titre: def.titre, postes, total: postes.reduce((t, p) => t + p.montant, 0) });
  }
  return groupes;
}

function total(groupes: Groupe[]): Centimes {
  return groupes.reduce((t, g) => t + g.total, 0);
}

/** Résultat de l'exercice d'après les comptes de charges et de produits (positif = bénéfice). */
export function resultatExercice(d: Dossier): Centimes {
  const plan = indexPlan(d.plan);
  let r = 0;
  for (const [n, x] of soldes(d)) {
    const t = plan.get(n)?.type;
    if (t === 'produit' || t === 'charge') r -= x.solde;
  }
  return r;
}

export interface CompteDeResultat {
  charges: Groupe[];
  produits: Groupe[];
  totalCharges: Centimes;
  totalProduits: Centimes;
  /** Positif = bénéfice (inscrit du côté des charges), négatif = perte (côté des produits). */
  resultat: Centimes;
  /** Total de chaque colonne une fois le résultat inscrit. */
  totalEquilibre: Centimes;
}

export function compteDeResultat(d: Dossier): CompteDeResultat {
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  const charges = construire(GROUPES_CHARGES, plan, s);
  const produits = construire(GROUPES_PRODUITS, plan, s);
  const totalCharges = total(charges);
  const totalProduits = total(produits);
  return {
    charges,
    produits,
    totalCharges,
    totalProduits,
    resultat: totalProduits - totalCharges,
    totalEquilibre: Math.max(totalCharges, totalProduits),
  };
}

export interface Bilan {
  actif: Groupe[];
  passif: Groupe[];
  totalActif: Centimes;
  /** Total du passif, résultat de l'exercice compris. */
  totalPassif: Centimes;
  /**
   * Résultat non encore viré au capital (positif = bénéfice, présenté dans les capitaux propres ;
   * négatif = perte, présentée sur une ligne séparée à l'actif). 0 après bouclement.
   */
  resultat: Centimes;
  equilibre: boolean;
}

export function bilan(d: Dossier): Bilan {
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  const actif = construire(GROUPES_ACTIF, plan, s);
  const passif = construire(GROUPES_PASSIF, plan, s);
  const resultat = resultatExercice(d);
  if (resultat > 0) {
    // Bénéfice : dans les capitaux propres, au passif.
    const poste: Poste = { numero: '', intitule: "Bénéfice de l'exercice", montant: resultat };
    const cp = passif.find((g) => g.titre === 'Capitaux propres');
    if (cp) {
      cp.postes.push(poste);
      cp.total += resultat;
    } else {
      passif.push({ titre: 'Capitaux propres', postes: [poste], total: resultat });
    }
  } else if (resultat < 0) {
    // Perte : du côté de l'actif, sur une ligne séparée (choix de l'enseignant).
    actif.push({
      titre: '',
      postes: [{ numero: '', intitule: "Perte de l'exercice", montant: -resultat }],
      total: -resultat,
    });
  }
  const totalActif = total(actif);
  const totalPassif = total(passif);
  return { actif, passif, totalActif, totalPassif, resultat, equilibre: totalActif === totalPassif };
}
