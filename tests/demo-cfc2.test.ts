import { describe, expect, it } from 'vitest';
import { demoCfc2 } from '../src/data/demo-cfc2';
import { controlerExercice, creerDossier } from '../src/engine/exercice';
import type { Dossier } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, compteDeResultat } from '../src/engine/statements';
import { decompteTva } from '../src/engine/tva';
import { boucler, reouvrir } from '../src/engine/closing';
import { chf, plan } from './fixtures';

function corrige(jusqua = Infinity): Dossier {
  let d = creerDossier(demoCfc2, plan);
  demoCfc2.corrige!.forEach((c, i) => {
    if (Number(c.piece) > jusqua) return;
    const op = demoCfc2.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
    d = r.valeur;
  });
  return d;
}

describe('exercice de démonstration CFC 2', () => {
  it('est valide et complet', () => {
    expect(controlerExercice(demoCfc2, plan)).toEqual({ erreurs: [], avertissements: [] });
    expect(demoCfc2.operations).toHaveLength(16);
  });

  it("le décompte de TVA du 1er trimestre donne 2'486.70 à payer", () => {
    const d = corrige(8);
    expect(decompteTva(d).solde).toBe(chf(2486.7));
    const apres = corrige(10);
    expect(decompteTva(apres)).toEqual({ tvaDue: 0, ipMarchandises: 0, ipInvestissements: 0, solde: 0, detteAfc: 0 });
  });

  it('le corrigé complet est équilibré, bénéfice 9\'582.20, ducroire 2\'737.80', () => {
    const d = corrige();
    expect(balance(d).equilibree).toBe(true);
    expect(bilan(d).equilibre).toBe(true);
    expect(compteDeResultat(d).resultat).toBe(chf(9582.2));
    expect(soldeDe(d, '1109')).toBe(chf(-2737.8));
    expect(soldeDe(d, '2170')).toBe(0);
    expect(soldeDe(d, '1020')).toBe(chf(15059));
  });

  it('présente les comptes FAC et le ducroire en déduction de l\'actif', () => {
    const b = bilan(corrige());
    const postes = b.actif.flatMap((g) => g.postes);
    expect(postes.find((p) => p.numero === '1539')?.montant).toBe(chf(-22000));
    expect(postes.find((p) => p.numero === '1109')?.montant).toBe(chf(-2737.8));
  });

  it('se boucle et se rouvre', () => {
    const b = boucler(corrige());
    if (!b.ok) throw new Error(b.erreurs.join());
    const r = reouvrir(b.valeur, 'compteDeResultat');
    expect(r.ok).toBe(true);
  });
});
