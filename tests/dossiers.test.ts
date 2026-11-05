import { describe, expect, it } from 'vitest';
import { DOSSIERS } from '../src/data/dossiers';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import { comptesDisponibles } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { balance } from '../src/engine/ledger';
import { bilan } from '../src/engine/statements';
import { boucler } from '../src/engine/closing';
import { plan } from './fixtures';

describe.each(DOSSIERS.map((d) => [d.titre, d] as const))('dossier %s', (_titre, ex) => {
  it('est valide et complet, 10 à 12 pièces, une pièce par opération', () => {
    expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
    expect(ex.operations.length).toBeGreaterThanOrEqual(10);
    expect(ex.operations.length).toBeLessThanOrEqual(12);
    for (const op of ex.operations) expect(op.piece, op.numero).toBeDefined();
    expect(ex.situation?.length ?? 0).toBeGreaterThan(200);
    expect(ex.situation).toContain(ex.raisonSociale);
  });

  it('le corrigé passe entièrement, avec des comptes disponibles, et se boucle', () => {
    let d = creerDossier(ex, plan);
    const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
    ex.corrige!.forEach((c, i) => {
      for (const l of c.lignes) for (const n of [l.debit, l.credit]) if (n) expect(dispo.has(n), `${c.piece} : ${n}`).toBe(true);
      const op = ex.operations.find((o) => o.numero === c.piece)!;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
      if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
      d = r.valeur;
    });
    expect(balance(d).equilibree).toBe(true);
    expect(bilan(d).equilibre).toBe(true);
    if (ex.parametres.corrigerBouclement) expect(boucler(d).ok).toBe(true);
  });
});
