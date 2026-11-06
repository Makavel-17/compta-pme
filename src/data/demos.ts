// Exercices de démonstration (un par niveau), puis exercices complémentaires (considérés comme validés le 06.11.2026).
import type { Exercice } from '../engine/exercice';
import { demoCfc1 } from './demo-cfc1';
import { demoCfc2 } from './demo-cfc2';
import { demoMp } from './demo-mp';
import { exercicesProposes } from './exercices-proposes';
import { DOSSIERS } from './dossiers';

export const exercicesDemo: Exercice[] = [demoCfc1, demoCfc2, demoMp, ...exercicesProposes, ...DOSSIERS];

/** Exercice accompagné de pièces comptables (dossier à distribuer). */
export const estDossier = (ex: Exercice) => ex.operations.length > 0 && ex.operations.every((o) => o.piece);
