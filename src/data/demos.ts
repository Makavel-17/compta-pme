// Exercices de démonstration (un par niveau), puis exercices proposés en attente de validation.
import type { Exercice } from '../engine/exercice';
import { demoCfc1 } from './demo-cfc1';
import { demoCfc2 } from './demo-cfc2';
import { demoMp } from './demo-mp';
import { exercicesProposes } from './exercices-proposes';

export const exercicesDemo: Exercice[] = [demoCfc1, demoCfc2, demoMp, ...exercicesProposes];
