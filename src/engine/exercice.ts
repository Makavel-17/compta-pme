// Exercice fourni par l'enseignant : énoncé, opérations, bilan d'ouverture, paramètres.
// Le corrigé et le barème seront formalisés en phase 3.

import type { Centimes } from './money';
import type { DateISO } from './dates';
import type { Dossier, FormeJuridique, LigneEcriture } from './dossier';
import { ouvertureDepuisBilan } from './dossier';
import type { ModeBouclement } from './closing';
import type { Compte, Niveau } from './plan';
import { NIVEAUX } from './plan';

export type LibellesT = 'SI/SF' | 'San/Spb';

/** Rubriques de l'application ; une rubrique non activée n'apparaît pas. */
export type Fonction = 'tva';

export interface Operation {
  numero: string;
  date: DateISO;
  texte: string;
}

export interface EcritureCorrigee {
  piece: string;
  lignes: LigneEcriture[];
}

export interface Exercice {
  id: string;
  titre: string;
  niveau: Niveau;
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  debut: DateISO;
  fin: DateISO;
  /** Texte d'introduction de l'énoncé. */
  introduction: string;
  operations: Operation[];
  /** Bilan d'ouverture en montants positifs. */
  ouvertureActif: Record<string, Centimes>;
  ouverturePassif: Record<string, Centimes>;
  parametres: {
    libellesT: LibellesT;
    modeBouclement: ModeBouclement;
    comptesAjoutes: string[];
    comptesMasques: string[];
  };
  corrige?: EcritureCorrigee[];
}

/** Fonctions activées par défaut selon le niveau (TVA dès CFC 2). */
export function fonctionsDuNiveau(niveau: Niveau): Set<Fonction> {
  const f = new Set<Fonction>();
  if (NIVEAUX.indexOf(niveau) >= NIVEAUX.indexOf('CFC2')) f.add('tva');
  return f;
}

/** Crée le dossier comptable de l'élève à partir de l'exercice. */
export function creerDossier(ex: Exercice, plan: Compte[]): Dossier {
  const ajoutes = [...ex.parametres.comptesAjoutes];
  // En mode « compte de résultat », le compte 9000 est nécessaire aux écritures de bouclement.
  if (ex.parametres.modeBouclement === 'compteDeResultat' && !ajoutes.includes('9000')) ajoutes.push('9000');
  return {
    raisonSociale: ex.raisonSociale,
    formeJuridique: ex.formeJuridique,
    debut: ex.debut,
    fin: ex.fin,
    niveau: ex.niveau,
    plan,
    comptesAjoutes: ajoutes,
    comptesMasques: [...ex.parametres.comptesMasques],
    ouverture: ouvertureDepuisBilan(ex.ouvertureActif, ex.ouverturePassif),
    ecritures: [],
  };
}

/** Numéros d'opérations ayant au moins une écriture non extournée dans le journal. */
export function operationsSaisies(d: Dossier): Set<string> {
  const extournees = new Set(d.ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  return new Set(d.ecritures.filter((e) => !e.extourneDe && !extournees.has(e.id)).map((e) => e.piece));
}

export const LIBELLES_NIVEAU: Record<Niveau, string> = { CFC1: 'CFC 1', CFC2: 'CFC 2', MP: 'MP' };
