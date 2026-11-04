// Bouclement d'une raison individuelle et réouverture de l'exercice suivant.
//
// Deux modes, l'usage de la classe 9 restant à valider par l'enseignant :
// - 'compteDeResultat' : les charges et produits sont soldés par le compte 9000, puis le
//   résultat est viré au capital propre. Le compte 9000 reproduit alors le compte de résultat.
// - 'aLaReouverture' : aucune écriture de bouclement ; le résultat et le compte privé sont
//   intégrés au capital propre lors de la réouverture (pratique des logiciels comptables).

import type { Centimes } from './money';
import { anneeSuivante, jourSuivant } from './dates';
import type { Dossier, Ecriture, LigneEcriture, Resultat } from './dossier';
import { controlerOuverture, echec, indexPlan, ok } from './dossier';
import { ajouterEcriture, nouvelId } from './journal';
import { soldes } from './ledger';
import { resultatExercice } from './statements';

export type ModeBouclement = 'compteDeResultat' | 'aLaReouverture';

export interface OptionsBouclement {
  compteCapital: string;
  /** Comptes privés (2850 et suivants) à virer au capital. */
  comptesPrives: string[];
  compteResultat: string;
  /** Préfixe des numéros de pièce des écritures de bouclement. */
  prefixePiece: string;
}

export const OPTIONS_RI: OptionsBouclement = {
  compteCapital: '2800',
  comptesPrives: ['2850', '2851', '2852', '2853', '2854', '2855', '2856'],
  compteResultat: '9000',
  prefixePiece: 'B',
};

function verifierForme(d: Dossier): string | null {
  return d.formeJuridique === 'raison individuelle'
    ? null
    : 'Le bouclement des sociétés (Sàrl, SA) sera disponible au niveau MP.';
}

/**
 * Écritures de bouclement proposées (servent aussi de corrigé) en mode 'compteDeResultat' :
 * 1. virement du compte privé au capital ;
 * 2. clôture des charges et produits par le compte de résultat ;
 * 3. virement du résultat au capital.
 */
export function ecrituresDeBouclement(d: Dossier, o: OptionsBouclement = OPTIONS_RI): Resultat<Ecriture[]> {
  const err = verifierForme(d);
  if (err) return echec(err);
  const plan = indexPlan(d.plan);
  const s = soldes(d);
  const res: Ecriture[] = [];
  let num = 1;
  let id = Number(nouvelId(d).slice(1));
  const ecriture = (libelle: string, lignes: LigneEcriture[]): Ecriture => ({
    id: `E${id++}`,
    date: d.fin,
    piece: `${o.prefixePiece}${num++}`,
    libelle,
    lignes,
  });

  // 1. Compte privé
  const lignesPrive: LigneEcriture[] = [];
  let totalPrive: Centimes = 0;
  for (const n of o.comptesPrives) {
    const solde = s.get(n)?.solde ?? 0;
    if (solde === 0) continue;
    totalPrive += solde;
    lignesPrive.push(solde > 0 ? { debit: null, credit: n, montant: solde } : { debit: n, credit: null, montant: -solde });
  }
  if (lignesPrive.length) {
    lignesPrive.push(
      totalPrive > 0
        ? { debit: o.compteCapital, credit: null, montant: totalPrive }
        : { debit: null, credit: o.compteCapital, montant: -totalPrive },
    );
    res.push(ecriture('Virement du compte privé au capital propre', simplifier(lignesPrive)));
  }

  // 2. Clôture des charges et des produits
  const lignes: LigneEcriture[] = [];
  let auDebitDuCR: Centimes = 0; // soldes débiteurs repris au débit du compte de résultat
  let auCreditDuCR: Centimes = 0;
  for (const [n, x] of [...s.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const t = plan.get(n)?.type;
    if ((t !== 'charge' && t !== 'produit') || x.solde === 0) continue;
    if (x.solde > 0) {
      lignes.push({ debit: null, credit: n, montant: x.solde });
      auDebitDuCR += x.solde;
    } else {
      lignes.push({ debit: n, credit: null, montant: -x.solde });
      auCreditDuCR -= x.solde;
    }
  }
  if (lignes.length) {
    if (auDebitDuCR) lignes.unshift({ debit: o.compteResultat, credit: null, montant: auDebitDuCR });
    if (auCreditDuCR) lignes.push({ debit: null, credit: o.compteResultat, montant: auCreditDuCR });
    res.push(ecriture('Clôture des comptes de charges et de produits', lignes));
  }

  // 3. Résultat
  const r = resultatExercice(d);
  if (r > 0) res.push(ecriture("Bénéfice de l'exercice", [{ debit: o.compteResultat, credit: o.compteCapital, montant: r }]));
  if (r < 0) res.push(ecriture("Perte de l'exercice", [{ debit: o.compteCapital, credit: o.compteResultat, montant: -r }]));
  return ok(res);
}

/** Ramène une écriture à deux comptes à une ligne simple. */
function simplifier(lignes: LigneEcriture[]): LigneEcriture[] {
  if (lignes.length !== 2) return lignes;
  const [a, b] = lignes as [LigneEcriture, LigneEcriture];
  const deb = a.debit ? a : b;
  const cre = a.debit ? b : a;
  return [{ debit: deb.debit, credit: cre.credit, montant: a.montant }];
}

/** Passe les écritures de bouclement dans le journal. */
export function boucler(d: Dossier, o: OptionsBouclement = OPTIONS_RI): Resultat<Dossier> {
  const e = ecrituresDeBouclement(d, o);
  if (!e.ok) return e;
  // Les comptes de bouclement sont toujours utilisables pour ces écritures.
  let courant: Dossier = {
    ...d,
    comptesAjoutes: [...d.comptesAjoutes, o.compteResultat],
    comptesMasques: d.comptesMasques.filter((n) => n !== o.compteResultat),
  };
  for (const ecr of e.valeur) {
    const r = ajouterEcriture(courant, ecr);
    if (!r.ok) return r;
    courant = r.valeur;
  }
  return ok({ ...courant, comptesAjoutes: d.comptesAjoutes, comptesMasques: d.comptesMasques });
}

/** Vrai si les charges, produits, comptes privés et de bouclement sont tous soldés. */
export function estBoucle(d: Dossier, o: OptionsBouclement = OPTIONS_RI): boolean {
  const plan = indexPlan(d.plan);
  for (const [n, x] of soldes(d)) {
    const t = plan.get(n)?.type;
    if (x.solde !== 0 && (t === 'charge' || t === 'produit' || t === 'bouclement' || o.comptesPrives.includes(n))) {
      return false;
    }
  }
  return true;
}

/**
 * Crée le dossier de l'exercice suivant. Le bilan d'ouverture reprend le bilan de clôture.
 * Mode 'compteDeResultat' : le dossier doit être bouclé.
 * Mode 'aLaReouverture' : le compte privé et le résultat sont intégrés au capital.
 */
export function reouvrir(d: Dossier, mode: ModeBouclement, o: OptionsBouclement = OPTIONS_RI): Resultat<Dossier> {
  const err = verifierForme(d);
  if (err) return echec(err);
  if (mode === 'compteDeResultat' && !estBoucle(d, o)) {
    return echec("L'exercice n'est pas bouclé : passez d'abord les écritures de bouclement.");
  }
  const plan = indexPlan(d.plan);
  const ouverture: Record<string, Centimes> = {};
  let versCapital: Centimes = 0;
  for (const [n, x] of soldes(d)) {
    const t = plan.get(n)?.type;
    if (x.solde === 0 || (t !== 'actif' && t !== 'passif')) continue;
    if (o.comptesPrives.includes(n)) versCapital += x.solde;
    else ouverture[n] = x.solde;
  }
  if (mode === 'aLaReouverture') {
    // Bénéfice = solde créditeur supplémentaire du capital (convention : négatif).
    const capital = (ouverture[o.compteCapital] ?? 0) + versCapital - resultatExercice(d);
    if (capital === 0) delete ouverture[o.compteCapital];
    else ouverture[o.compteCapital] = capital;
  }
  const debut = jourSuivant(d.fin);
  const suivant: Dossier = {
    ...d,
    debut,
    fin: anneeSuivante(d.fin),
    ouverture,
    ecritures: [],
  };
  const erreurs = controlerOuverture(suivant);
  return erreurs.length ? echec(...erreurs) : ok(suivant);
}
