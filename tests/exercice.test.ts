import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { controlerExercice, corrigeDepuisEcritures, creerDossier, exerciceVierge } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { chf, plan } from './fixtures';

describe("contrôle d'un exercice", () => {
  it("l'exercice de démonstration est valide, sans avertissement", () => {
    expect(controlerExercice(demoCfc1, plan)).toEqual({ erreurs: [], avertissements: [] });
  });

  it('un exercice vierge signale ce qui manque', () => {
    const { erreurs } = controlerExercice(exerciceVierge('x', 2026), plan);
    expect(erreurs).toContain("Indiquez le titre de l'exercice.");
    expect(erreurs).toContain("Ajoutez au moins une opération à l'énoncé.");
  });

  it('refuse un bilan déséquilibré, un compte hors niveau, une opération hors exercice', () => {
    const ex = {
      ...demoCfc1,
      ouvertureActif: { ...demoCfc1.ouvertureActif, '1170': chf(100) },
      operations: [...demoCfc1.operations, { numero: '16', date: '2027-01-02', texte: 'Hors exercice' }],
    };
    const { erreurs } = controlerExercice(ex, plan);
    expect(erreurs.some((e) => e.includes("n'est pas équilibré"))).toBe(true);
    expect(erreurs).toContain("Bilan d'ouverture : le compte 1170 n'est pas disponible au niveau choisi.");
    expect(erreurs).toContain("Opération 16 : la date est hors de l'exercice.");
  });

  it('avertit des opérations sans corrigé', () => {
    const { erreurs, avertissements } = controlerExercice({ ...demoCfc1, corrige: demoCfc1.corrige!.slice(1) }, plan);
    expect(erreurs).toEqual([]);
    expect(avertissements[0]).toMatch(/^Opérations sans corrigé : 1\./);
  });
});

describe('corrigé saisi dans le journal', () => {
  it('regroupe les écritures par pièce et ignore les extournes', () => {
    let d = creerDossier(demoCfc1, plan);
    const ajout = (id: string, piece: string, debit: string, credit: string, francs: number) => {
      const r = ajouterEcriture(d, { id, date: '2026-03-20', piece, libelle: 'x', lignes: [{ debit, credit, montant: chf(francs) }] });
      if (!r.ok) throw new Error(r.erreurs.join());
      d = r.valeur;
    };
    ajout('E1', '14', '4200', '1000', 1000);
    ajout('E2', '14', '4200', '2000', 2000);
    ajout('E3', '5', '1020', '6000', 1850);
    const r = extourner(d, 'E3', '2026-01-31');
    if (!r.ok) throw new Error();
    d = r.valeur;
    ajout('E5', '5', '6000', '1020', 1850);
    expect(corrigeDepuisEcritures(d)).toEqual([
      {
        piece: '14',
        lignes: [
          { debit: '4200', credit: '1000', montant: chf(1000) },
          { debit: '4200', credit: '2000', montant: chf(2000) },
        ],
      },
      { piece: '5', lignes: [{ debit: '6000', credit: '1020', montant: chf(1850) }] },
    ]);
  });
});
