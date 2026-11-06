import { describe, expect, it } from 'vitest';
import { compterValides, texteRelecture, type ElementRelecture } from '../src/io/relecture';

const el: ElementRelecture[] = [
  { cle: 'th:tva', groupe: 'Théorie', titre: 'TVA' },
  { cle: 'ex:a', groupe: 'CFC · niveau 1', titre: 'Exercice A' },
  { cle: 'ex:b', groupe: 'CFC · niveau 2', titre: 'Exercice B' },
];

describe('relecture', () => {
  it('compte les validés et classe les remarques', () => {
    const r = {
      'th:tva': { valide: true, remarque: '' },
      'ex:a': { valide: false, remarque: 'Pièce 3 : montant faux' },
    };
    expect(compterValides(el, r)).toBe(1);
    const t = texteRelecture(el, r, new Date(2026, 10, 6));
    expect(t).toContain('Relecture de Compta PME — 06.11.2026');
    expect(t).toContain('1 élément(s) validé(s) sur 3.');
    expect(t.indexOf('À CORRIGER (1)')).toBeLessThan(t.indexOf('Exercice A'));
    expect(t).toContain('Remarque : Pièce 3 : montant faux');
    expect(t).toContain('PAS ENCORE RELUS (1)\r\n- [CFC · niveau 2] Exercice B');
  });
});
