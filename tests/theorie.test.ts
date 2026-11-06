import { describe, expect, it } from 'vitest';
import { CHAPITRES, chapitresDuNiveau } from '../src/data/theorie';
import { comptesDuNiveau } from '../src/engine/plan';
import { plan } from './fixtures';

const centimes = (francs: number) => Math.round(francs * 100);

describe('théorie', () => {
  it('affiche les chapitres de façon cumulative : CFC1 ⊂ CFC2 ⊂ MP', () => {
    const c1 = chapitresDuNiveau('CFC1').map((c) => c.id);
    const c2 = chapitresDuNiveau('CFC2').map((c) => c.id);
    const mp = chapitresDuNiveau('MP').map((c) => c.id);
    expect(c1).toEqual(['cadre-legal', 'bilan', 'comptes', 'journal', 'resultat', 'marchandises']);
    expect(mp).toContain('evaluation');
    expect(c2.slice(0, c1.length)).toEqual(c1);
    expect(c2).toContain('tva');
    expect(c2).not.toContain('societes');
    expect(mp).toHaveLength(CHAPITRES.length);
  });

  it('les identifiants de chapitre sont uniques', () => {
    expect(new Set(CHAPITRES.map((c) => c.id)).size).toBe(CHAPITRES.length);
  });

  it("chaque exemple d'écriture est équilibré et n'utilise que des comptes du plan disponibles au niveau du chapitre", () => {
    for (const ch of CHAPITRES) {
      const dispo = new Set(comptesDuNiveau(plan, ch.niveau).map((c) => c.numero));
      for (const sec of ch.sections) {
        for (const b of sec.blocs) {
          if (b.type !== 'ecritures') continue;
          for (const ex of b.exemples) {
            let debit = 0;
            let credit = 0;
            for (const l of ex.lignes) {
              expect(Number.isInteger(centimes(l.montant) / 5), `${ch.id} — ${ex.cas} : montant arrondi aux 5 centimes`).toBe(true);
              for (const n of [l.debit, l.credit]) {
                if (n) expect(dispo.has(n), `${ch.id} — ${ex.cas} : compte ${n}`).toBe(true);
              }
              if (l.debit) debit += centimes(l.montant);
              if (l.credit) credit += centimes(l.montant);
            }
            expect(debit, `${ch.id} — ${ex.cas}`).toBe(credit);
          }
        }
      }
    }
  });
});

describe('lien de l’indice vers la théorie', () => {
  it('reconnaît le thème d’après les comptes du corrigé, dans les chapitres du niveau', async () => {
    const { chapitrePourComptes } = await import('../src/data/theorie');
    expect(chapitrePourComptes(['1100', '3200', '2200'], 'CFC2')?.id).toBe('tva');
    expect(chapitrePourComptes(['6800', '1509'], 'CFC2')?.id).toBe('amortissements');
    expect(chapitrePourComptes(['1060', '1020'], 'MP')?.id).toBe('titres');
    // Chapitre hors niveau : on retombe sur le journal.
    expect(chapitrePourComptes(['1060', '1020'], 'CFC1')?.id).toBe('journal');
  });
});
