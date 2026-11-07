// Variante d'un exercice : tous les montants sont multipliés par un facteur entier (2, 3…), ce qui garde chaque
// écriture équilibrée et chaque rapport (taux de TVA, pourcentages, quantités) inchangé. Le corrigé de la variante
// n'est pas public : elle sert aux évaluations. Les arrondis aux 5 centimes recalculés par l'élève restent dans la
// tolérance de correction (5 centimes).

import type { Centimes } from './money';
import { formatMontant } from './money';
import type { Exercice } from './exercice';
import type { PieceComptable } from './pieces';

/**
 * Multiplie les montants écrits dans un texte (format suisse avec décimales : 1'234.50, 85.00). Les nombres inférieurs
 * à 1.00 (cours de change, coefficients) et les nombres sans décimales (quantités, années, pour cent) sont laissés tels quels.
 */
export function multiplierTexte(texte: string, facteur: number): string {
  return texte.replace(/(?<![\d'.,])(\d{1,3}(?:'\d{3})*|\d+)\.(\d{2})(?![\d])/g, (tout, entier: string, dec: string) => {
    const centimes = Number(entier.replace(/'/g, '')) * 100 + Number(dec);
    if (centimes < 100) return tout;
    return formatMontant(centimes * facteur);
  });
}

const fois = (c: Centimes, k: number) => c * k;
const record = (r: Record<string, Centimes>, k: number) => Object.fromEntries(Object.entries(r).map(([n, v]) => [n, fois(v, k)]));

function multiplierPiece(p: PieceComptable, k: number): PieceComptable {
  const t = (x: string) => multiplierTexte(x, k);
  return {
    ...p,
    texte: p.texte?.map(t),
    mentions: p.mentions?.map(t),
    lignes: p.lignes.map((l) => ({
      ...l,
      designation: t(l.designation),
      montant: fois(l.montant, k),
      ...(l.prixUnitaire !== undefined ? { prixUnitaire: fois(l.prixUnitaire, k) } : {}),
    })),
    totaux: p.totaux.map((x) => ({ ...x, montant: fois(x.montant, k) })),
  };
}

/** Variante d'évaluation : nouvel identifiant, montants × facteur, mode évaluation. */
export function varianteExercice(ex: Exercice, facteur: number, id: string): Exercice {
  if (!Number.isInteger(facteur) || facteur < 2) throw new Error('Le facteur doit être un entier au moins égal à 2.');
  const k = facteur;
  const t = (x: string) => multiplierTexte(x, k);
  const p = ex.parametres;
  return {
    ...structuredClone(ex),
    id,
    titre: `${ex.titre.replace(/ — dossier de pièces/, '')} — variante d'évaluation`,
    mode: 'evaluation',
    introduction: t(ex.introduction),
    situation: ex.situation === undefined ? undefined : t(ex.situation),
    ouvertureActif: record(ex.ouvertureActif, k),
    ouverturePassif: record(ex.ouverturePassif, k),
    operations: ex.operations.map((o) => ({ ...o, texte: t(o.texte), ...(o.piece ? { piece: multiplierPiece(o.piece, k) } : {}) })),
    corrige: (ex.corrige ?? []).map((c) => ({ ...c, lignes: c.lignes.map((l) => ({ ...l, montant: fois(l.montant, k) })) })),
    parametres: {
      ...structuredClone(p),
      ...(p.repartition
        ? {
            repartition: {
              ...p.repartition,
              benefice: fois(p.repartition.benefice, k),
              reporte: fois(p.repartition.reporte, k),
              capital: fois(p.repartition.capital, k),
              reserveLegaleCapital: fois(p.repartition.reserveLegaleCapital, k),
              reserveLegaleBenefice: fois(p.repartition.reserveLegaleBenefice, k),
              tantiemes: fois(p.repartition.tantiemes, k),
              reservesLibres: fois(p.repartition.reservesLibres, k),
            },
          }
        : {}),
      ...(p.seuil
        ? { seuil: { ...p.seuil, prixVente: fois(p.seuil.prixVente, k), coutVariable: fois(p.seuil.coutVariable, k), chargesFixes: fois(p.seuil.chargesFixes, k) } }
        : {}),
    },
  };
}
