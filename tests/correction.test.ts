import { describe, expect, it } from 'vitest';
import {
  diagnostiquer,
  enregistrerTentative,
  solutionDisponible,
  type Suivi,
} from '../src/engine/correction';
import type { Ecriture, LigneEcriture } from '../src/engine/dossier';
import type { EcritureCorrigee } from '../src/engine/exercice';
import { chf } from './fixtures';

let n = 0;
const e = (piece: string, lignes: LigneEcriture[], extra: Partial<Ecriture> = {}): Ecriture => ({
  id: `E${++n}`,
  date: '2026-01-01',
  piece,
  libelle: 'x',
  lignes,
  ...extra,
});
const s = (debit: string, credit: string, francs: number): LigneEcriture[] => [{ debit, credit, montant: chf(francs) }];

// Achat de marchandises 3'000 : 1'000 en espèces, solde à crédit.
const composee: EcritureCorrigee = {
  piece: '14',
  lignes: [
    { debit: '4200', credit: null, montant: chf(3000) },
    { debit: null, credit: '1000', montant: chf(1000) },
    { debit: null, credit: '2000', montant: chf(2000) },
  ],
};
const simple: EcritureCorrigee = { piece: '5', lignes: s('6000', '1020', 1850) };

describe('diagnostic', () => {
  it('juste, insensible à l\'ordre des lignes', () => {
    const lignes = [...composee.lignes].reverse();
    expect(diagnostiquer([e('14', lignes)], composee)).toBe('juste');
  });

  it('écriture composée ≡ sa décomposition en écritures simples', () => {
    const eleve = [e('14', s('4200', '1000', 1000)), e('14', s('4200', '2000', 2000))];
    expect(diagnostiquer(eleve, composee)).toBe('juste');
  });

  it('tolère un écart de 0.05', () => {
    expect(diagnostiquer([e('5', [{ debit: '6000', credit: '1020', montant: chf(1850) + 5 }])], simple)).toBe('juste');
    expect(diagnostiquer([e('5', [{ debit: '6000', credit: '1020', montant: chf(1850) + 6 }])], simple)).toBe('montant');
  });

  it('ignore les autres pièces et la date', () => {
    expect(diagnostiquer([e('5', s('6000', '1020', 1850), { date: '2026-12-31' }), e('6', s('1000', '3210', 1))], simple)).toBe('juste');
  });

  it('opération manquante', () => {
    expect(diagnostiquer([], simple)).toBe('manquante');
  });

  it('décomposition en cours : incomplète, pas fausse', () => {
    expect(diagnostiquer([e('14', s('4200', '1000', 1000))], composee)).toBe('incomplete');
  });

  it('débit et crédit inversés', () => {
    expect(diagnostiquer([e('5', s('1020', '6000', 1850))], simple)).toBe('inversee');
  });

  it('montant erroné', () => {
    expect(diagnostiquer([e('5', s('6000', '1020', 1580))], simple)).toBe('montant');
  });

  it('bonne classe mais mauvais compte', () => {
    expect(diagnostiquer([e('5', s('6000', '1000', 1850))], simple)).toBe('compte_classe');
  });

  it('mauvais compte, autre classe', () => {
    expect(diagnostiquer([e('5', s('5200', '1020', 1850))], simple)).toBe('compte');
  });

  it('TVA oubliée', () => {
    const avecTva: EcritureCorrigee = {
      piece: '3',
      lignes: [
        { debit: '1100', credit: null, montant: chf(1081) },
        { debit: null, credit: '3211', montant: chf(1000) },
        { debit: null, credit: '2200', montant: chf(81) },
      ],
    };
    expect(diagnostiquer([e('3', s('1100', '3211', 1081))], avecTva)).toBe('tva_oubliee');
  });

  it('une écriture extournée et son extourne ne comptent pas', () => {
    const faux = e('5', s('1020', '6000', 1850));
    const ext = e('5', s('6000', '1020', 1850), { extourneDe: faux.id });
    const juste = e('5', s('6000', '1020', 1850));
    expect(diagnostiquer([faux, ext], simple)).toBe('manquante');
    expect(diagnostiquer([faux, ext, juste], simple)).toBe('juste');
  });

  it('écriture sans rapport', () => {
    expect(diagnostiquer([e('5', s('1500', '2400', 99))], simple)).toBe('erronee');
  });
});

describe('suivi des tentatives', () => {
  it('indice après la 1re erreur, solution après une nouvelle tentative fausse', () => {
    let suivi: Suivi = {};
    suivi = enregistrerTentative(suivi, '5', 'inversee');
    expect(suivi['5']!.essais).toBe(1);
    expect(solutionDisponible(suivi['5'])).toBe(false);
    suivi = enregistrerTentative(suivi, '5', 'montant');
    expect(solutionDisponible(suivi['5'])).toBe(true);
    suivi = enregistrerTentative(suivi, '5', 'juste');
    expect(solutionDisponible(suivi['5'])).toBe(false);
  });

  it("une décomposition en cours n'est pas comptée comme une erreur", () => {
    const suivi = enregistrerTentative({}, '14', 'incomplete');
    expect(suivi['14']!.essais).toBe(0);
  });
});
