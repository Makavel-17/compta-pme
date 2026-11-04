import { describe, expect, it } from 'vitest';
import { arrondi5, formatMontant, lireMontant } from '../src/engine/money';
import { anneeSuivante, formatDate, jourSuivant, lireDate } from '../src/engine/dates';

describe('montants', () => {
  it.each([
    ['1234.50', 123450],
    ["1'234.50", 123450],
    ['1 234,5', 123450],
    ['0.05', 5],
    ['.5', 50],
    ['12', 1200],
    ['12.', 1200],
    ['-12.30', -1230],
    ["1'000'000", 100000000],
  ])('lit « %s »', (saisie, attendu) => {
    expect(lireMontant(saisie)).toBe(attendu);
  });

  it.each(['', 'abc', '1.234', '1,234.50', '12.3.4', '-', '.'])('refuse « %s »', (saisie) => {
    expect(lireMontant(saisie)).toBeNull();
  });

  it('évite les erreurs de virgule flottante (0.1 + 0.2)', () => {
    expect(lireMontant('0.10')! + lireMontant('0.20')!).toBe(lireMontant('0.30'));
  });

  it.each([
    [0, '0.00'],
    [5, '0.05'],
    [123450, "1'234.50"],
    [100000000, "1'000'000.00"],
    [-123450, "-1'234.50"],
  ])('formate %i en %s', (c, attendu) => {
    expect(formatMontant(c)).toBe(attendu);
  });

  it('refuse de formater un montant non entier', () => {
    expect(() => formatMontant(1.5)).toThrow();
  });

  it.each([
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 5],
    [7, 5],
    [8, 10],
    [12345, 12345],
    [12348, 12350],
    [-3, -5],
  ])('arrondit %i centimes aux 5 centimes : %i', (c, attendu) => {
    expect(arrondi5(c)).toBe(attendu);
  });
});

describe('dates', () => {
  it('lit les formats suisses', () => {
    expect(lireDate('31.12.2026')).toBe('2026-12-31');
    expect(lireDate('1.2.2026')).toBe('2026-02-01');
    expect(lireDate('5.3.26')).toBe('2026-03-05');
    expect(lireDate('5.3.', 2026)).toBe('2026-03-05');
  });

  it('refuse les dates inexistantes', () => {
    expect(lireDate('29.02.2026')).toBeNull();
    expect(lireDate('31.04.2026')).toBeNull();
    expect(lireDate('2026-01-01')).toBeNull();
    expect(lireDate('5.3.')).toBeNull();
  });

  it('accepte le 29 février d\'une année bissextile', () => {
    expect(lireDate('29.02.2028')).toBe('2028-02-29');
  });

  it('formate en JJ.MM.AAAA', () => {
    expect(formatDate('2026-03-05')).toBe('05.03.2026');
  });

  it('calcule le jour et l\'exercice suivants', () => {
    expect(jourSuivant('2026-12-31')).toBe('2027-01-01');
    expect(jourSuivant('2028-02-28')).toBe('2028-02-29');
    expect(anneeSuivante('2028-02-29')).toBe('2029-02-28');
  });
});
