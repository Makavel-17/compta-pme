import { describe, expect, it } from 'vitest';
import { exercicesProposes, propNovaterm } from '../src/data/exercices-proposes';
import { boucler } from '../src/engine/closing';
import type { Dossier } from '../src/engine/dossier';
import { controlerExercice, creerDossier, type Exercice } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { repartir } from '../src/engine/repartition';
import { bilan, compteDeResultat } from '../src/engine/statements';
import { chf, plan } from './fixtures';

function dossierCorrige(ex: Exercice): Dossier {
  let d = creerDossier(ex, plan);
  ex.corrige!.forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 60), lignes: c.lignes });
    if (!r.ok) throw new Error(`${ex.id}, pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
    d = r.valeur;
  });
  return d;
}

/** Résultat attendu (calculé à la main) et soldes de contrôle. */
const attendus: Record<string, { resultat: number; soldes: Record<string, number> }> = {
  'prop-cfc1-bouquinerie-du-bourg': { resultat: 5425, soldes: { '1020': 20245, '1000': 10640, '2850': 640 } },
  'prop-cfc1-atelier-lumen': { resultat: 7750, soldes: { '1020': 15360, '1010': 790, '1100': 9400 } },
  'prop-cfc2-electro-saleve-tva': { resultat: 29550, soldes: { '1020': 9285, '2200': 0, '1170': 0, '1171': 0, '2205': 0 } },
  'prop-cfc2-imprimerie-mandement': { resultat: 30000, soldes: { '1020': 15200, '1300': 1800, '2300': -750, '1509': -41800, '1510': 9600, '1539': -15750 } },
  'prop-cfc2-sport-evasion-creances': { resultat: 20350, soldes: { '1020': 49650, '1100': 20000, '1108': 0, '1109': -1000 } },
  'prop-cfc2-jardins-morel-salaires': { resultat: 11410.6, soldes: { '1020': 19911.4, '1140': 0, '2170': -1100.8, '2171': 0 } },
  'prop-mp-novaterm-sa': { resultat: 115510, soldes: { '1020': 276072.5, '2970': -15500, '2950': -44500, '1060': 30000, '2205': 0, '2230': 0 } },
};

describe('exercices proposés', () => {
  it('sont sept, sans mention « proposé » (validés le 06.11.2026), avec une situation de départ', () => {
    expect(exercicesProposes).toHaveLength(7);
    for (const ex of exercicesProposes) {
      expect(ex.titre).not.toContain('(proposé)');
      expect(ex.situation).toContain(ex.raisonSociale);
      expect(ex.operations.length).toBeGreaterThanOrEqual(10);
      expect(ex.operations.length).toBeLessThanOrEqual(15);
    }
  });

  for (const ex of exercicesProposes) {
    describe(ex.titre, () => {
      it('passe le contrôle de l\'exercice sans erreur ni avertissement', () => {
        expect(controlerExercice(ex, plan)).toEqual({ erreurs: [], avertissements: [] });
      });

      it('a un corrigé complet, équilibré pièce par pièce', () => {
        expect(ex.corrige!.map((c) => c.piece)).toEqual(ex.operations.map((o) => o.numero));
        for (const c of ex.corrige!) {
          const debit = c.lignes.filter((l) => l.debit).reduce((t, l) => t + l.montant, 0);
          const credit = c.lignes.filter((l) => l.credit).reduce((t, l) => t + l.montant, 0);
          expect(debit, `pièce ${c.piece}`).toBe(credit);
          for (const l of c.lignes) expect(Number.isInteger(l.montant / 5), `pièce ${c.piece} : arrondi 5 cts`).toBe(true);
        }
      });

      it('le corrigé donne le résultat et les soldes attendus, puis se boucle', () => {
        const d = dossierCorrige(ex);
        const a = attendus[ex.id]!;
        expect(balance(d).equilibree).toBe(true);
        expect(bilan(d).equilibre).toBe(true);
        expect(compteDeResultat(d).resultat).toBe(chf(a.resultat));
        for (const [n, v] of Object.entries(a.soldes)) expect(soldeDe(d, n), `solde ${n}`).toBe(chf(v));
        const b = boucler(d);
        if (!b.ok) throw new Error(b.erreurs.join());
      });
    });
  }

  it('Novaterm SA : la répartition de la fiche correspond au corrigé (perte reportée compensée)', () => {
    const r = repartir(propNovaterm.parametres.repartition!);
    if (!r.ok) throw new Error(r.erreur);
    expect(r.tableau.reserveLegale).toBe(chf(4500));
    expect(r.tableau.dividendes).toBe(chf(50000));
    expect(r.tableau.impotAnticipe).toBe(chf(17500));
    expect(r.tableau.nouveauReporte).toBe(chf(15500));
    expect(propNovaterm.ouverturePassif['2970']).toBe(chf(90000));
  });
});
