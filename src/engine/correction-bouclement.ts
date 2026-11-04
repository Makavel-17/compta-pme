// Correction des écritures de bouclement (mode « compte de résultat »).
//
// Les écritures attendues sont calculées à partir des propres comptes de l'élève, juste avant son
// bouclement : une erreur commise dans une opération n'est donc pas pénalisée une seconde fois.
// Les écritures de bouclement de l'élève sont celles dont le numéro de pièce n'est pas un numéro
// d'opération de l'énoncé ; elles sont comparées ensemble (une écriture composée équivaut à sa
// décomposition, les numéros de pièce choisis n'ont pas d'importance).

import type { Dossier, Ecriture } from './dossier';
import type { EcritureCorrigee, Exercice } from './exercice';
import { ecrituresDeBouclement } from './closing';
import { diagnostiquer, type Diagnostic } from './correction';

export const PIECE_BOUCLEMENT = 'Bouclement';
export const POINTS_BOUCLEMENT_PAR_DEFAUT = 3;

/** Le bouclement est-il corrigé (et noté) dans cet exercice ? */
export function bouclementCorrige(ex: Exercice): boolean {
  return ex.parametres.modeBouclement === 'compteDeResultat' && !!ex.parametres.corrigerBouclement;
}

/** Une écriture appartient au bouclement si sa pièce n'est pas une opération de l'énoncé. */
export function estEcritureBouclement(e: Ecriture, ex: Exercice): boolean {
  return !ex.operations.some((o) => o.numero === e.piece);
}

/** Écritures de bouclement attendues, d'après les comptes de l'élève avant son bouclement. */
export function corrigeBouclement(d: Dossier, ex: Exercice): EcritureCorrigee | null {
  if (ex.parametres.modeBouclement !== 'compteDeResultat') return null;
  const avant: Dossier = { ...d, ecritures: d.ecritures.filter((e) => !estEcritureBouclement(e, ex)) };
  const r = ecrituresDeBouclement(avant);
  if (!r.ok || r.valeur.length === 0) return null;
  return { piece: PIECE_BOUCLEMENT, lignes: r.valeur.flatMap((e) => e.lignes) };
}

/** Diagnostic du bouclement de l'élève (null si le bouclement n'est pas corrigé). */
export function diagnostiquerBouclement(d: Dossier, ex: Exercice): Diagnostic | null {
  const c = corrigeBouclement(d, ex);
  if (!c) return null;
  const eleve = d.ecritures
    .filter((e) => estEcritureBouclement(e, ex))
    .map((e) => ({ ...e, piece: PIECE_BOUCLEMENT }));
  return diagnostiquer(eleve, c);
}

/** Écritures de l'élève ramenées à la pièce « Bouclement », pour la notation. */
export function ecrituresPourNotation(d: Dossier, ex: Exercice): Ecriture[] {
  return d.ecritures.map((e) => (estEcritureBouclement(e, ex) ? { ...e, piece: PIECE_BOUCLEMENT } : e));
}
