import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { balance } from '../src/engine/ledger';
import { resultatExercice } from '../src/engine/statements';
import { multiplierTexte, varianteExercice } from '../src/engine/variante';
import { plan } from './fixtures';

describe('variante d’évaluation', () => {
  it('multiplie les montants d’un texte, pas les taux, quantités ni cours', () => {
    expect(multiplierTexte("Achat de 300 actions au cours de 85.00, frais 280.00 ; TVA 8,1 % ; total 25'780.00", 2)).toBe(
      "Achat de 300 actions au cours de 170.00, frais 560.00 ; TVA 8,1 % ; total 51'560.00",
    );
    expect(multiplierTexte('cours vente 0.94, année 2026', 3)).toBe('cours vente 0.94, année 2026');
  });

  it.each(exercicesDemo.map((e) => [e.titre, e] as const))('%s : variante valide, corrigé équilibré, bénéfice × facteur', (_t, ex) => {
    const v = varianteExercice(ex, 2, `${ex.id}-v`);
    expect(v.mode).toBe('evaluation');
    expect(controlerExercice(v, plan).erreurs).toEqual([]);
    const corriger = (e: typeof ex) => {
      let d = creerDossier(e, plan);
      (e.corrige ?? []).forEach((c, i) => {
        const op = e.operations.find((o) => o.numero === c.piece)!;
        const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
        expect(r.ok, c.piece).toBe(true);
        if (r.ok) d = r.valeur;
      });
      return d;
    };
    const dv = corriger(v);
    expect(balance(dv).equilibree).toBe(true);
    expect(resultatExercice(dv)).toBe(2 * resultatExercice(corriger(ex)));
  });
});
