import { describe, expect, it } from 'vitest';
import { boucler, ecrituresDeBouclement, estBoucle, reouvrir } from '../src/engine/closing';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan } from '../src/engine/statements';
import { chf, dossierExemple } from './fixtures';

describe('bouclement par le compte de résultat (9000)', () => {
  it('propose les trois écritures attendues', () => {
    const r = ecrituresDeBouclement(dossierExemple());
    if (!r.ok) throw new Error(r.erreurs.join());
    const [prive, cloture, resultat] = r.valeur;
    expect(r.valeur).toHaveLength(3);
    expect(prive!.lignes).toEqual([{ debit: '2800', credit: '2850', montant: chf(500) }]);
    expect(cloture!.lignes[0]).toEqual({ debit: '9000', credit: null, montant: chf(6000) });
    expect(cloture!.lignes.at(-1)).toEqual({ debit: null, credit: '9000', montant: chf(6500) });
    expect(resultat!.lignes).toEqual([{ debit: '9000', credit: '2800', montant: chf(500) }]);
    expect(r.valeur.map((e) => e.piece)).toEqual(['B1', 'B2', 'B3']);
    expect(r.valeur.every((e) => e.date === '2026-12-31')).toBe(true);
  });

  it('solde les comptes de résultat et met à jour le capital', () => {
    const r = boucler(dossierExemple());
    if (!r.ok) throw new Error(r.erreurs.join());
    const d = r.valeur;
    expect(estBoucle(d)).toBe(true);
    expect(soldeDe(d, '9000')).toBe(0);
    expect(soldeDe(d, '2850')).toBe(0);
    expect(soldeDe(d, '2800')).toBe(chf(-22000)); // 22'000 − 500 privé + 500 bénéfice
    expect(balance(d).equilibree).toBe(true);
    const b = bilan(d);
    expect(b.resultat).toBe(0);
    expect(b.equilibre).toBe(true);
    expect(b.totalActif).toBe(chf(38000));
  });

  it("n'est pas considéré bouclé avant les écritures", () => {
    expect(estBoucle(dossierExemple())).toBe(false);
  });

  it('traite une perte (capital au débit)', () => {
    const d0 = dossierExemple();
    const d = { ...d0, ecritures: d0.ecritures.filter((e) => e.piece !== '3') }; // sans la vente à crédit
    const r = ecrituresDeBouclement(d);
    if (!r.ok) throw new Error();
    expect(r.valeur.at(-1)!.lignes).toEqual([{ debit: '2800', credit: '9000', montant: chf(3500) }]);
    expect(r.valeur.at(-1)!.libelle).toBe("Perte de l'exercice");
  });

  it('SA : le bénéfice est viré au bénéfice reporté (2970), sans compte privé', () => {
    const base = dossierExemple();
    const d = {
      ...base,
      formeJuridique: 'SA' as const,
      niveau: 'MP' as const,
      ecritures: base.ecritures.filter((e) => e.piece !== '5'), // pas de prélèvement privé dans une SA
    };
    const r = ecrituresDeBouclement(d);
    if (!r.ok) throw new Error(r.erreurs.join());
    expect(r.valeur.at(-1)!.lignes).toEqual([{ debit: '9000', credit: '2970', montant: chf(500) }]);
    const b = boucler(d);
    if (!b.ok) throw new Error(b.erreurs.join());
    expect(soldeDe(b.valeur, '2970')).toBe(chf(-500));
  });
});

describe("réouverture de l'exercice suivant", () => {
  it('reprend le bilan de clôture après bouclement', () => {
    const b = boucler(dossierExemple());
    if (!b.ok) throw new Error();
    const r = reouvrir(b.valeur, 'compteDeResultat');
    if (!r.ok) throw new Error(r.erreurs.join());
    const n = r.valeur;
    expect(n.debut).toBe('2027-01-01');
    expect(n.fin).toBe('2027-12-31');
    expect(n.ecritures).toEqual([]);
    expect(n.ouverture).toEqual({
      '1000': chf(3500),
      '1020': chf(10500),
      '1100': chf(4000),
      '1200': chf(8000),
      '1510': chf(12000),
      '2000': chf(-6000),
      '2400': chf(-10000),
      '2800': chf(-22000),
    });
  });

  it('refuse de rouvrir un exercice non bouclé en mode compte de résultat', () => {
    expect(reouvrir(dossierExemple(), 'compteDeResultat').ok).toBe(false);
  });

  it('donne le même bilan d\'ouverture en intégrant résultat et privé à la réouverture', () => {
    const b = boucler(dossierExemple());
    if (!b.ok) throw new Error();
    const viaBouclement = reouvrir(b.valeur, 'compteDeResultat');
    const direct = reouvrir(dossierExemple(), 'aLaReouverture');
    if (!viaBouclement.ok || !direct.ok) throw new Error();
    expect(direct.valeur.ouverture).toEqual(viaBouclement.valeur.ouverture);
  });
});
