// Dossiers d'exercices avec pièces comptables (un par grand thème).
import type { Exercice } from '../../engine/exercice';
import { dossierPolyglotte, dossierSaveurs } from './cfc-bases';
import { dossierBabel, dossierMenuiserie, dossierOutils } from './cfc-tva-cloture';
import { dossierBoulangerie, dossierFleurs, dossierMeubles } from './cfc-creances-salaires';
import { dossierOptique, dossierPrecimeca } from './mp';

export const DOSSIERS: Exercice[] = [
  dossierSaveurs, dossierPolyglotte, dossierOutils, dossierMenuiserie, dossierBabel,
  dossierMeubles, dossierBoulangerie, dossierFleurs, dossierOptique, dossierPrecimeca,
];
