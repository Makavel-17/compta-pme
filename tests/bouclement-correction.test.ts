import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { creerDossier, type Exercice } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { ecrituresDeBouclement } from '../src/engine/closing';
import { diagnostiquerBouclement, PIECE_BOUCLEMENT } from '../src/engine/correction-bouclement';
import { corrigerCopie } from '../src/engine/notation';
import type { Dossier, LigneEcriture } from '../src/engine/dossier';
import { chf, plan } from './fixtures';

const ex: Exercice = { ...demoCfc1, parametres: { ...demoCfc1.parametres, corrigerBouclement: true } };

function operations(): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });
  return d;
}

function passer(d: Dossier, piece: string, lignes: LigneEcriture[]): Dossier {
  const r = ajouterEcriture(d, { id: `B${d.ecritures.length + 1}`, date: '2026-12-31', piece, libelle: 'Bouclement', lignes });
  if (!r.ok) throw new Error(r.erreurs.join());
  return r.valeur;
}

describe('correction du bouclement', () => {
  it('juste lorsque l\'élève passe les écritures attendues, quels que soient les numéros de pièce', () => {
    let d = operations();
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e, i) => (d = passer(d, `C${i + 1}`, e.lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('accepte la clôture compte par compte (décomposition)', () => {
    let d = operations();
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    for (const e of attendues.valeur) {
      // chaque compte soldé par une écriture simple contre 9000 ou le capital
      const contre = e.lignes.find((l) => l.debit === '9000' || l.credit === '9000') ? '9000' : '2800';
      for (const l of e.lignes) {
        if (l.debit && l.credit) {
          d = passer(d, 'B', [l]); // écriture déjà simple (virement du résultat ou du privé)
          continue;
        }
        if (l.debit === contre || l.credit === contre) continue;
        d = passer(d, 'B', [l.debit ? { debit: l.debit, credit: contre, montant: l.montant } : { debit: contre, credit: l.credit, montant: l.montant }]);
      }
    }
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('incomplète si seul le compte privé est viré, inversée si débit et crédit sont permutés', () => {
    const base = operations();
    expect(diagnostiquerBouclement(base, ex)).toBe('manquante');
    expect(diagnostiquerBouclement(passer(base, 'B1', [{ debit: '2800', credit: '2850', montant: chf(800) }]), ex)).toBe('incomplete');
    const attendues = ecrituresDeBouclement(base);
    if (!attendues.ok) throw new Error();
    let d = base;
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes.map((l) => ({ debit: l.credit, credit: l.debit, montant: l.montant })))));
    expect(diagnostiquerBouclement(d, ex)).toBe('inversee');
  });

  it('ne pénalise pas deux fois une erreur d\'opération', () => {
    // opération 5 fausse (loyer passé à 1'580 au lieu de 1'850) : le bouclement est jugé sur les comptes de l'élève
    let d = creerDossier(ex, plan);
    ex.corrige!.forEach((c, i) => {
      const lignes = c.piece === '5' ? [{ debit: '6000', credit: '1020', montant: chf(1580) }] : c.lignes;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: '2026-03-01', piece: c.piece, libelle: 'x', lignes });
      if (r.ok) d = r.valeur;
    });
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes)));
    expect(diagnostiquerBouclement(d, ex)).toBe('juste');
  });

  it('une écriture de bouclement extournée ne compte pas', () => {
    let d = passer(operations(), 'B1', [{ debit: '2850', credit: '2800', montant: chf(800) }]);
    const r = extourner(d, d.ecritures.at(-1)!.id, '2026-12-31');
    if (!r.ok) throw new Error();
    d = r.valeur;
    expect(diagnostiquerBouclement(d, ex)).toBe('manquante');
  });

  it('est noté (3 points par défaut) quand l\'enseignant l\'active', () => {
    let d = operations();
    const sans = corrigerCopie(ex, d);
    expect(sans.operations.at(-1)).toMatchObject({ piece: PIECE_BOUCLEMENT, points: 0, max: 3 });
    const attendues = ecrituresDeBouclement(d);
    if (!attendues.ok) throw new Error();
    attendues.valeur.forEach((e) => (d = passer(d, 'B', e.lignes)));
    const avec = corrigerCopie(ex, d);
    expect(avec.points).toBe(avec.max);
    expect(avec.note).toBe(6);
    const sansBouclement = { ...demoCfc1, parametres: { ...demoCfc1.parametres, corrigerBouclement: false } };
    expect(corrigerCopie(sansBouclement, d).operations.some((o) => o.piece === PIECE_BOUCLEMENT)).toBe(false);
  });
});
