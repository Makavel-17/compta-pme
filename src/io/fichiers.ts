// Fichiers échangés entre l'enseignant et les élèves (JSON). Aucun envoi en ligne.
//
// - Exercice (.compta-exercice.json) : distribué aux élèves. En évaluation, le corrigé n'y figure pas ;
//   en entraînement, il y figure encodé (illisible à l'œil nu, sans prétention de sécurité).
// - Copie (.compta-copie.json) : rendue par l'élève, importée par l'enseignant.

import type { Dossier } from '../engine/dossier';
import type { EcritureCorrigee, Exercice } from '../engine/exercice';
import type { Suivi } from '../engine/correction';
import type { Relecture } from './relecture';

/**
 * Version du format des fichiers. Quand le format change : augmenter VERSION et ajouter dans MIGRATIONS la fonction
 * qui convertit un fichier de la version précédente, pour que les fichiers des années passées restent lisibles.
 */
export const VERSION = 1;

type Brut = Record<string, unknown>;
/** MIGRATIONS[n] convertit un fichier de la version n vers la version n + 1. */
const MIGRATIONS: Record<number, (f: Brut) => Brut> = {};

/** Amène un fichier à la version courante ; refuse un fichier plus récent que le logiciel. */
export function migrer(f: Brut, quoi: string, migrations: Record<number, (f: Brut) => Brut> = MIGRATIONS, versionCourante = VERSION): Brut {
  const v = f.version;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) throw new ErreurFichier(`${quoi} n'indique pas de version lisible.`);
  if (v > versionCourante) {
    throw new ErreurFichier(
      `${quoi} a été créé avec une version plus récente de Compta PME. Rechargez la page (Ctrl + F5) pour obtenir ` +
        'la dernière version du logiciel, puis réessayez.',
    );
  }
  let r = f;
  for (let n = v; n < versionCourante; n++) {
    const m = migrations[n];
    if (!m) throw new ErreurFichier(`${quoi} est dans un ancien format qui ne peut plus être converti.`);
    r = { ...m(r), version: n + 1 };
  }
  return r;
}
export const EXT_EXERCICE = '.compta-exercice.json';
export const EXT_COPIE = '.compta-copie.json';

export interface Eleve {
  prenom: string;
  nom: string;
  classe: string;
}

interface FichierExercice {
  format: 'compta-pme/exercice';
  version: number;
  exercice: Omit<Exercice, 'corrige'>;
  corrigeEncode?: string;
}

interface FichierCopie {
  format: 'compta-pme/copie';
  version: number;
  eleve: Eleve;
  exerciceId: string;
  exerciceTitre: string;
  mode: Exercice['mode'];
  dossier: Dossier;
  suivi: Suivi;
  fiches?: unknown;
  exporteLe: string;
}

export interface Copie {
  eleve: Eleve;
  exerciceId: string;
  exerciceTitre: string;
  mode: Exercice['mode'];
  dossier: Dossier;
  suivi: Suivi;
  /** Contenu des fiches de calcul (salaire, répartition, analyse). */
  fiches?: unknown;
  exporteLe: string;
}

export class ErreurFichier extends Error {}

/** Paramètres d'exercice par défaut (complètent un fichier qui n'en indique qu'une partie). */
const PARAMETRES_PAR_DEFAUT: Exercice['parametres'] = {
  libellesT: 'SI/SF',
  modificationDirecte: false,
  modeBouclement: 'compteDeResultat',
  comptesAjoutes: [],
  comptesMasques: [],
};

// ---------- Encodage du corrigé ----------

function versBase64(texte: string): string {
  const octets = new TextEncoder().encode(texte);
  let bin = '';
  for (const o of octets) bin += String.fromCharCode(o);
  return btoa(bin);
}

function depuisBase64(b64: string): string {
  const bin = atob(b64);
  const octets = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(octets);
}

export function encoderCorrige(c: EcritureCorrigee[]): string {
  return versBase64(JSON.stringify(c)).split('').reverse().join('');
}

export function decoderCorrige(s: string): EcritureCorrigee[] {
  return JSON.parse(depuisBase64(s.split('').reverse().join(''))) as EcritureCorrigee[];
}

// ---------- Exercice ----------

/** Fichier distribué aux élèves : sans corrigé en évaluation, corrigé encodé en entraînement. */
export function exporterExercice(ex: Exercice): string {
  const { corrige, ...sansCorrige } = ex;
  const f: FichierExercice = { format: 'compta-pme/exercice', version: VERSION, exercice: sansCorrige };
  if (ex.mode === 'entrainement' && corrige?.length) f.corrigeEncode = encoderCorrige(corrige);
  return JSON.stringify(f, null, 2);
}

/** Fichier complet conservé par l'enseignant (corrigé en clair). */
export function exporterExerciceEnseignant(ex: Exercice): string {
  return JSON.stringify({ format: 'compta-pme/exercice-enseignant', version: VERSION, exercice: ex }, null, 2);
}

// ---------- Rappel d'export de la copie ----------

export interface DernierExport {
  /** Date ISO de l'export. */
  le: string;
  /** Empreinte du travail au moment de l'export. */
  empreinte: string;
}

/** Empreinte courte du travail de l'élève (écritures et fiches) : change dès que le travail change. */
export function empreinteTravail(dossier: Pick<Dossier, 'ecritures'>, fiches?: unknown): string {
  const texte = JSON.stringify([dossier.ecritures, fiches ?? null]);
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h << 5) + h + texte.charCodeAt(i)) | 0;
  return `${dossier.ecritures.length}-${(h >>> 0).toString(36)}`;
}

export type StatutExport = 'vide' | 'jamais' | 'modifie' | 'a-jour';

/** Où en est l'export de la copie : rien à exporter, jamais exportée, modifiée depuis, ou à jour. */
export function statutExport(dossier: Pick<Dossier, 'ecritures'>, fiches: unknown, dernier?: DernierExport | null): StatutExport {
  if (!dernier) return dossier.ecritures.length === 0 ? 'vide' : 'jamais';
  return empreinteTravail(dossier, fiches) === dernier.empreinte ? 'a-jour' : 'modifie';
}

// ---------- Sauvegarde de l'espace enseignant ----------

export const EXT_SAUVEGARDE = '.compta-sauvegarde.json';

/** Tous les exercices de l'espace enseignant (corrigés en clair) dans un seul fichier. Le code d'accès n'y figure pas. */
export function exporterSauvegarde(exercices: Exercice[], maintenant = new Date(), relecture: Relecture = {}): string {
  return JSON.stringify(
    { format: 'compta-pme/sauvegarde-enseignant', version: VERSION, creeLe: maintenant.toISOString(), exercices, relecture },
    null,
    2,
  );
}

/** Lit une sauvegarde ; accepte aussi un fichier d'exercice isolé (version élève ou enseignant). */
export function importerSauvegarde(texte: string): Exercice[] {
  let f = lireJson(texte);
  if (f.format === 'compta-pme/exercice' || f.format === 'compta-pme/exercice-enseignant') return [importerExercice(texte)];
  if (f.format !== 'compta-pme/sauvegarde-enseignant') {
    throw new ErreurFichier(
      f.format === 'compta-pme/copie'
        ? "Ce fichier est une copie d'élève, pas une sauvegarde."
        : "Ce fichier n'est pas une sauvegarde Compta PME.",
    );
  }
  f = migrer(f, 'Cette sauvegarde');
  if (!Array.isArray(f.exercices)) throw new ErreurFichier('La sauvegarde est endommagée : liste des exercices absente.');
  return f.exercices.map((e) => verifierExercice(e));
}

/** Avis de relecture contenus dans une sauvegarde (vide pour un autre fichier ou une ancienne sauvegarde). */
export function relectureDeSauvegarde(texte: string): Relecture {
  try {
    const f = lireJson(texte);
    if (f.format !== 'compta-pme/sauvegarde-enseignant' || !f.relecture || typeof f.relecture !== 'object') return {};
    return f.relecture as Relecture;
  } catch {
    return {};
  }
}

/** Fusionne une sauvegarde dans la liste existante : un exercice de même identifiant est remplacé, les autres ajoutés. */
export function fusionnerExercices(existants: Exercice[], restaures: Exercice[]): { exercices: Exercice[]; ajoutes: number; remplaces: number } {
  const exercices = [...existants];
  let ajoutes = 0;
  let remplaces = 0;
  for (const ex of restaures) {
    const i = exercices.findIndex((x) => x.id === ex.id);
    if (i >= 0) {
      exercices[i] = ex;
      remplaces++;
    } else {
      exercices.push(ex);
      ajoutes++;
    }
  }
  return { exercices, ajoutes, remplaces };
}

function lireJson(texte: string): Record<string, unknown> {
  try {
    const v = JSON.parse(texte.replace(/^﻿/, ''));
    if (v && typeof v === 'object') return v as Record<string, unknown>;
  } catch {
    /* traité ci-dessous */
  }
  throw new ErreurFichier("Ce fichier n'est pas un fichier Compta PME lisible.");
}

function verifierExercice(ex: unknown): Exercice {
  const e = ex as Partial<Exercice>;
  const ok =
    e &&
    typeof e.id === 'string' &&
    typeof e.titre === 'string' &&
    ['CFC1', 'CFC2', 'MP'].includes(e.niveau as string) &&
    typeof e.debut === 'string' &&
    typeof e.fin === 'string' &&
    Array.isArray(e.operations) &&
    e.ouvertureActif &&
    e.ouverturePassif &&
    e.parametres;
  if (!ok) throw new ErreurFichier("Le fichier d'exercice est incomplet ou endommagé.");
  // Paramètres ajoutés au fil des versions : valeurs par défaut pour les fichiers plus anciens ou incomplets.
  const parametres = { ...PARAMETRES_PAR_DEFAUT, ...e.parametres } as Exercice['parametres'];
  return { mode: 'entrainement', ...e, parametres } as Exercice;
}

/** Lit un fichier d'exercice (version élève ou version enseignant). */
export function importerExercice(texte: string): Exercice {
  let f = lireJson(texte);
  f = migrer(f, 'Ce fichier');
  if (f.format === 'compta-pme/exercice-enseignant') return verifierExercice(f.exercice);
  if (f.format !== 'compta-pme/exercice') {
    throw new ErreurFichier(
      f.format === 'compta-pme/copie'
        ? "Ce fichier est une copie d'élève, pas un exercice."
        : "Ce fichier n'est pas un exercice Compta PME.",
    );
  }
  const ex = verifierExercice(f.exercice);
  if (typeof f.corrigeEncode === 'string') {
    try {
      ex.corrige = decoderCorrige(f.corrigeEncode);
    } catch {
      throw new ErreurFichier("Le corrigé contenu dans le fichier d'exercice est endommagé.");
    }
  }
  return ex;
}

// ---------- Copie ----------

export function exporterCopie(c: Omit<Copie, 'exporteLe'>, maintenant = new Date()): string {
  const f: FichierCopie = {
    format: 'compta-pme/copie',
    version: VERSION,
    ...c,
    exporteLe: maintenant.toISOString(),
  };
  return JSON.stringify(f, null, 2);
}

export function importerCopie(texte: string): Copie {
  let f = lireJson(texte);
  if (f.format !== 'compta-pme/copie') {
    throw new ErreurFichier(
      String(f.format).startsWith('compta-pme/exercice')
        ? "Ce fichier est un exercice, pas une copie d'élève."
        : "Ce fichier n'est pas une copie Compta PME.",
    );
  }
  f = migrer(f, 'Cette copie');
  const c = f as unknown as FichierCopie;
  if (!c.eleve || !c.dossier || !Array.isArray(c.dossier.ecritures)) {
    throw new ErreurFichier('La copie est incomplète ou endommagée.');
  }
  return {
    eleve: c.eleve,
    exerciceId: c.exerciceId,
    exerciceTitre: c.exerciceTitre,
    mode: c.mode,
    dossier: c.dossier,
    suivi: c.suivi ?? {},
    fiches: c.fiches,
    exporteLe: c.exporteLe,
  };
}

/** Nom de fichier sans caractères problématiques : « Martin_Lea_1CFC3_cycles-du-leman.compta-copie.json ». */
export function nomFichier(parties: string[], extension: string): string {
  const propre = parties
    .map((p) =>
      p
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^A-Za-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('_');
  return `${propre || 'compta'}${extension}`;
}
