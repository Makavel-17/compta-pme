// Exercices de démonstration (un par niveau).
import type { Exercice } from '../engine/exercice';
import { demoCfc1 } from './demo-cfc1';
import { demoCfc2 } from './demo-cfc2';
import { demoMp } from './demo-mp';

export const exercicesDemo: Exercice[] = [demoCfc1, demoCfc2, demoMp];
