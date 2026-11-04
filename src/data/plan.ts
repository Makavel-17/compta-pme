import csv from './plan-lpg.csv?raw';
import { lirePlanCsv } from '../engine/plan';

/** Plan comptable par défaut (LPG Fiduciaire, version du 28.10.2020). */
export const plan = lirePlanCsv(csv);
