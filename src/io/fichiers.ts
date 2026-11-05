// Fichiers échangés entre l'enseignant et les élèves (JSON). Aucun envoi en ligne.
//
// - Exercice (.compta-exercice.json) : distribué aux élèves. En évaluation, le corrigé n'y figure pas ;
//   en entraînement, il y figure encodé (illisible à l'œil nu, sans prétention de sécurité).
// - Copie (.compta-copie.json) : rendue par l'élève, importée par l'enseignant.

import type { Dossier } from '../engine/dossier';
import type { EcritureCorrigee, Exercice } from '../engine/exercice';
import type { Suivi } from '../engine/correction';

const VERSION = 1;
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

// ---------- Sauvegarde de l'espace enseignant ----------

export const EXT_SAUVEGARDE = '.compta-sauvegarde.json';

/** Tous les exercices de l'espace enseignant (corrigés en clair) dans un seul fichier. Le code d'accès n'y figure pas. */
export function exporterSauvegarde(exercices: Exercice[], maintenant = new Date()): string {
  return JSON.stringify(
    { format: 'compta-pme/sauvegarde-enseignant', version: VERSION, creeLe: maintenant.toISOString(), exercices },
    null,
    2,
  );
}

/** Lit une sauvegarde ; accepte aussi un fichier d'exercice isolé (version élève ou enseignant). */
export function importerSauvegarde(texte: string): Exercice[] {
  const f = lireJson(texte);
  if (f.format === 'compta-pme/exercice' || f.format === 'compta-pme/exercice-enseignant') return [importerExercice(texte)];
  if (f.format !== 'compta-pme/sauvegarde-enseignant') {
    throw new ErreurFichier(
      f.format === 'compta-pme/copie'
        ? "Ce fichier est une copie d'élève, pas une sauvegarde."
        : "Ce fichier n'est pas une sauvegarde Compta PME.",
    );
  }
  if (f.version !== VERSION) throw new ErreurFichier('Cette sauvegarde a été créée avec une autre version de Compta PME.');
  if (!Array.isArray(f.exercices)) throw new ErreurFichier('La sauvegarde est endommagée : liste des exercices absente.');
  return f.exercices.map((e) => verifierExercice(e));
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
  return { mode: 'entrainement', ...e } as Exercice;
}

/** Lit un fichier d'exercice (version élève ou version enseignant). */
export function importerExercice(texte: string): Exercice {
  const f = lireJson(texte);
  if (f.version !== VERSION) throw new ErreurFichier('Ce fichier a été créé avec une autre version de Compta PME.');
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
  const f = lireJson(texte);
  if (f.format !== 'compta-pme/copie') {
    throw new ErreurFichier(
      String(f.format).startsWith('compta-pme/exercice')
        ? "Ce fichier est un exercice, pas une copie d'élève."
        : "Ce fichier n'est pas une copie Compta PME.",
    );
  }
  if (f.version !== VERSION) throw new ErreurFichier('Cette copie a été créée avec une autre version de Compta PME.');
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
