import { describe, expect, it } from 'vitest';
import csv from '../src/data/plan-pme.csv?raw';
import { comptesDuNiveau, ecrirePlanCsv, ErreurPlan, lirePlanCsv } from '../src/engine/plan';

describe('plan comptable PME du cours', () => {
  const plan = lirePlanCsv(csv);

  it('se charge sans erreur et contient les comptes attendus', () => {
    expect(plan.length).toBeGreaterThan(90);
    expect(plan.find((c) => c.numero === '1020')?.intitule).toBe('Banque (n/avoir)');
    expect(plan.find((c) => c.numero === '2200')?.intitule).toBe('TVA due');
  });

  it('respecte la relecture CSV aller-retour', () => {
    expect(lirePlanCsv(ecrirePlanCsv(plan))).toEqual(plan);
  });

  it('filtre par niveau de façon cumulative', () => {
    const cfc1 = comptesDuNiveau(plan, 'CFC1');
    const cfc2 = comptesDuNiveau(plan, 'CFC2');
    const mp = comptesDuNiveau(plan, 'MP');
    expect(cfc1.length).toBeLessThan(cfc2.length);
    expect(cfc2.length).toBeLessThan(mp.length);
    expect(cfc1.some((c) => c.numero === '1170')).toBe(false);
    expect(cfc2.some((c) => c.numero === '1170')).toBe(true);
  });
});

describe('lecture CSV : messages d\'erreur', () => {
  const entete = 'numero;intitule;classe;type;niveau_min\n';
  it('refuse un numéro en double', () => {
    expect(() => lirePlanCsv(entete + '1000;Caisse;1;actif;CFC1\n1000;Caisse;1;actif;CFC1')).toThrow(ErreurPlan);
  });
  it('refuse une classe incohérente', () => {
    expect(() => lirePlanCsv(entete + '1000;Caisse;2;actif;CFC1')).toThrow(/classe/);
  });
  it('refuse un en-tête incorrect', () => {
    expect(() => lirePlanCsv('a;b;c\n1000;Caisse;1;actif;CFC1')).toThrow(/première ligne/);
  });
});
