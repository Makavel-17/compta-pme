// Jeu d'essai : petite raison individuelle (niveau CFC1).
import csv from '../src/data/plan-pme.csv?raw';
import type { Dossier, Ecriture, LigneEcriture } from '../src/engine/dossier';
import { ouvertureDepuisBilan } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { lirePlanCsv } from '../src/engine/plan';

export const plan = lirePlanCsv(csv);

/** Francs → centimes, pour la lisibilité des tests. */
export const chf = (francs: number): number => Math.round(francs * 100);

export function dossierVide(): Dossier {
  return {
    raisonSociale: 'Papeterie du Rhône',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    niveau: 'CFC1',
    plan,
    comptesAjoutes: [],
    comptesMasques: [],
    ouverture: ouvertureDepuisBilan(
      { '1000': chf(2000), '1020': chf(15000), '1200': chf(8000), '1510': chf(12000) },
      { '2000': chf(5000), '2400': chf(10000), '2800': chf(22000) },
    ),
    ecritures: [],
  };
}

export const simple = (debit: string, credit: string, francs: number): LigneEcriture[] => [
  { debit, credit, montant: chf(francs) },
];

let compteur = 0;
export function ecr(piece: string, lignes: LigneEcriture[], date = '2026-03-15', libelle = `Opération ${piece}`): Ecriture {
  compteur += 1;
  return { id: `T${compteur}`, date, piece, libelle, lignes };
}

export function passer(d: Dossier, ...ecritures: Ecriture[]): Dossier {
  for (const e of ecritures) {
    const r = ajouterEcriture(d, e);
    if (!r.ok) throw new Error(r.erreurs.join(' / '));
    d = r.valeur;
  }
  return d;
}

/**
 * Exercice complet. Produits 6'500, charges 6'000 : bénéfice 500. Prélèvement privé 500.
 * Soldes finaux : 1000 = 3'500 ; 1020 = 10'500 ; 1100 = 4'000 ; 2000 = 6'000.
 */
export function dossierExemple(): Dossier {
  return passer(
    dossierVide(),
    ecr('1', simple('4200', '2000', 3000), '2026-01-10', 'Achat de marchandises à crédit'),
    ecr('2', simple('1000', '3200', 2500), '2026-01-15', 'Ventes au comptant'),
    ecr('3', simple('1100', '3200', 4000), '2026-02-03', 'Vente à crédit'),
    ecr('4', simple('6000', '1020', 1200), '2026-02-28', 'Loyer de février'),
    ecr('5', simple('2850', '1000', 500), '2026-03-05', 'Prélèvement privé en espèces'),
    ecr(
      '6',
      [
        { debit: '2000', credit: null, montant: chf(2000) },
        { debit: null, credit: '1020', montant: chf(1500) },
        { debit: null, credit: '1000', montant: chf(500) },
      ],
      '2026-03-20',
      'Paiement fournisseur, banque et caisse',
    ),
    ecr('7', simple('5200', '1020', 1800), '2026-03-31', 'Salaire de mars'),
  );
}
