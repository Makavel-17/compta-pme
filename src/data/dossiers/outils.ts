// Outils communs aux dossiers d'exercices avec pièces comptables.
import type { Exercice, EcritureCorrigee, Operation } from '../../engine/exercice';
import type { LigneEcriture } from '../../engine/dossier';
import type { Partie, PieceComptable } from '../../engine/pieces';
import type { DateISO } from '../../engine/dates';

export const f = (francs: number) => Math.round(francs * 100);
export const D = (compte: string, centimes: number): LigneEcriture => ({ debit: compte, credit: null, montant: centimes });
export const C = (compte: string, centimes: number): LigneEcriture => ({ debit: null, credit: compte, montant: centimes });
export const S = (debit: string, credit: string, centimes: number): LigneEcriture[] => [{ debit, credit, montant: centimes }];

/** Banque et office fictifs, communs aux dossiers. */
export const BANQUE: Partie = { nom: 'Banque Rhodanienne', adresse: ['Place des Bergues 12', '1201 Genève'] };
export const POSTE: Partie = { nom: 'Service postal des paiements', adresse: ['Case postale', '3030 Berne'] };

export interface ElementDossier {
  date: DateISO;
  piece: PieceComptable;
  lignes: LigneEcriture[];
}

function majusculeInitiale(t: string): string {
  const bas = t.toLocaleLowerCase('fr-CH');
  return bas.charAt(0).toLocaleUpperCase('fr-CH') + bas.slice(1);
}

/** Texte de l'énoncé : décrit le document, jamais l'écriture (« pièces seules »). */
export function texteDePiece(p: PieceComptable): string {
  const numero = p.numero ? ` n° ${p.numero}` : '';
  return `${majusculeInitiale(p.titre)}${numero} — ${p.emetteur.nom}`;
}

export type ParametresDossier = Partial<Exercice['parametres']>;

/** Construit un exercice « pièces seules » : opérations numérotées 1, 2, 3… avec leur pièce et leur corrigé. */
export function construireDossier(
  base: Omit<Exercice, 'operations' | 'corrige' | 'mode' | 'parametres'> & { parametres?: ParametresDossier },
  elements: ElementDossier[],
): Exercice {
  const operations: Operation[] = [];
  const corrige: EcritureCorrigee[] = [];
  elements.forEach((e, i) => {
    const numero = String(i + 1);
    operations.push({ numero, date: e.date, texte: texteDePiece(e.piece), piece: e.piece });
    corrige.push({ piece: numero, lignes: e.lignes });
  });
  const { parametres, ...reste } = base;
  return {
    ...reste,
    operations,
    corrige,
    mode: 'entrainement',
    parametres: {
      libellesT: 'SI/SF',
      modificationDirecte: false,
      modeBouclement: 'compteDeResultat',
      comptesAjoutes: [],
      comptesMasques: [],
      tvaMethode: 'net',
      ficheSalaire: false,
      calculatriceTva: false,
      ...parametres,
    },
  };
}
