import csv from './plan-pme.csv?raw';
import { lirePlanCsv } from '../engine/plan';

/** Plan comptable par défaut : numérotation PME utilisée dans le cours (manuel E&S, CREME-CIIP). */
export const plan = lirePlanCsv(csv);
