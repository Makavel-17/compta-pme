import { describe, expect, it } from 'vitest';
import { demoMp } from '../src/data/demo-mp';
import { controlerExercice, creerDossier, fonctionsExercice } from '../src/engine/exercice';
import type { Dossier } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, compteDeResultat } from '../src/engine/statements';
import { repartir } from '../src/engine/repartition';
import { boucler } from '../src/engine/closing';
import { ratios } from '../src/engine/analyse';
import { chf, plan } from './fixtures';

function corrige(): Dossier {
  let d = creerDossier(demoMp, plan);
  demoMp.corrige!.forEach((c, i) => {
    const op = demoMp.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
    d = r.valeur;
  });
  return d;
}

describe('exercice de démonstration MP', () => {
  it('est valide, en SA, avec répartition et analyse', () => {
    expect(controlerExercice(demoMp, plan)).toEqual({ erreurs: [], avertissements: [] });
    expect([...fonctionsExercice(demoMp)].sort()).toEqual(['analyse', 'repartition', 'tva']);
    expect(creerDossier(demoMp, plan).plan.find((c) => c.numero === '2800')!.intitule).toBe('Capital-actions');
  });

  it('la répartition du corrigé correspond à la règle de l\'art. 672 CO', () => {
    const r = repartir(demoMp.parametres.repartition!);
    if (!r.ok) throw new Error(r.erreur);
    expect(r.tableau).toMatchObject({ reserveLegale: chf(3000), dividendes: chf(36000), nouveauReporte: chf(16000), impotAnticipe: chf(12600), dividendeNet: chf(23400) });
  });

  it('le corrigé est équilibré, bénéfice 76\'415.00, et se boucle vers 2970', () => {
    const d = corrige();
    expect(balance(d).equilibree).toBe(true);
    expect(bilan(d).equilibre).toBe(true);
    expect(compteDeResultat(d).resultat).toBe(chf(76415));
    expect(soldeDe(d, '2970')).toBe(chf(-16000));
    expect(soldeDe(d, '2206')).toBe(0);
    const b = boucler(d);
    if (!b.ok) throw new Error(b.erreurs.join());
    expect(soldeDe(b.valeur, '2970')).toBe(chf(-92415));
  });

  it('fournit des ratios calculables', () => {
    const r = ratios(corrige());
    for (const v of Object.values(r)) expect(v).not.toBeNull();
  });
});
