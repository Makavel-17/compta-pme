// Dossiers d'exercices avec pièces comptables (un par grand thème).
import type { Exercice } from '../../engine/exercice';
import type { TableauComplement } from './outils';
import { dossierPolyglotte, dossierSaveurs } from './cfc-bases';
import { dossierBabel, dossierMenuiserie, dossierOutils } from './cfc-tva-cloture';
import { dossierBoulangerie, dossierFleurs, dossierMeubles } from './cfc-creances-salaires';
import { dossierOptique, dossierPrecimeca } from './mp';
import { complementZufferey, dossierTerroirs, dossierZufferey } from './mp-operations';
import { complementCarrosserie, dossierCarrosserie, dossierSports } from './mp-immeubles-analyse';
import { dossierBrasserie, dossierLemanbio } from './mp-capital';
import { complementAteliers, dossierAteliers } from './mp-reserves-latentes';

export const DOSSIERS: Exercice[] = [
  dossierSaveurs, dossierPolyglotte, dossierOutils, dossierMenuiserie, dossierBabel,
  dossierMeubles, dossierBoulangerie, dossierFleurs, dossierTerroirs, dossierZufferey, dossierBrasserie, dossierLemanbio, dossierAteliers, dossierOptique, dossierPrecimeca, dossierCarrosserie, dossierSports,
];

/** Version d'évaluation d'un dossier : même contenu, aucun retour pendant la saisie, corrigé absent du fichier élève. */
export function versionEvaluation(ex: Exercice): Exercice {
  return { ...ex, id: `${ex.id}-evaluation`, titre: `${ex.titre} (évaluation)`, mode: 'evaluation' };
}

/** Versions d'évaluation, connues de l'espace enseignant pour corriger les copies. */
export const DOSSIERS_EVALUATION: Exercice[] = DOSSIERS.map(versionEvaluation);

/** Tableaux complémentaires du corrigé PDF, par identifiant de dossier. */
export const COMPLEMENTS_CORRIGE: Record<string, TableauComplement[]> = {
  [dossierAteliers.id]: complementAteliers,
  [dossierZufferey.id]: complementZufferey,
  [dossierCarrosserie.id]: complementCarrosserie,
};
