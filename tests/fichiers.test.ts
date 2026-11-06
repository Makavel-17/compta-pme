import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import {
  ErreurFichier,
  exporterCopie,
  exporterExercice,
  exporterExerciceEnseignant,
  importerCopie,
  importerExercice,
  nomFichier,
} from '../src/io/fichiers';
import { creerDossier } from '../src/engine/exercice';
import { plan } from './fixtures';

describe("fichier d'exercice", () => {
  it('entraînement : corrigé inclus mais illisible à l\'œil nu, relu à l\'identique', () => {
    const texte = exporterExercice(demoCfc1);
    expect(texte).not.toContain('"corrige"');
    expect(texte).not.toContain('"debit"');
    expect(texte).not.toContain('"credit"');
    const ex = importerExercice(texte);
    expect(ex.corrige).toEqual(demoCfc1.corrige);
    expect(ex.operations).toEqual(demoCfc1.operations);
  });

  it('évaluation : aucun corrigé dans le fichier distribué', () => {
    const texte = exporterExercice({ ...demoCfc1, mode: 'evaluation' });
    expect(texte).not.toContain('corrigeEncode');
    expect(importerExercice(texte).corrige).toBeUndefined();
  });

  it("version enseignant : corrigé en clair, relu à l'identique", () => {
    const ex = importerExercice(exporterExerciceEnseignant({ ...demoCfc1, mode: 'evaluation' }));
    expect(ex.corrige).toEqual(demoCfc1.corrige);
    expect(ex.mode).toBe('evaluation');
  });

  it('messages clairs pour un mauvais fichier', () => {
    expect(() => importerExercice('pas du json')).toThrow(ErreurFichier);
    expect(() => importerExercice('{"format":"autre","version":1}')).toThrow(/pas un exercice/);
  });

  it("préserve les caractères accentués de l'énoncé", () => {
    const ex = importerExercice(exporterExercice(demoCfc1));
    expect(ex.introduction).toContain('Léman');
  });
});

describe('copie', () => {
  const copie = {
    eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CFC3' },
    exerciceId: demoCfc1.id,
    exerciceTitre: demoCfc1.titre,
    mode: demoCfc1.mode,
    dossier: creerDossier(demoCfc1, plan),
    suivi: { '1': { essais: 1, dernier: 'inversee' as const, solutionVue: false } },
  };

  it("s'exporte et se relit", () => {
    const relue = importerCopie(exporterCopie(copie, new Date('2026-11-05T10:00:00Z')));
    expect(relue.eleve).toEqual(copie.eleve);
    expect(relue.dossier.ouverture).toEqual(copie.dossier.ouverture);
    expect(relue.suivi).toEqual(copie.suivi);
    expect(relue.exporteLe).toBe('2026-11-05T10:00:00.000Z');
  });

  it('refuse un exercice importé comme copie', () => {
    expect(() => importerCopie(exporterExercice(demoCfc1))).toThrow(/exercice, pas une copie/);
  });
});

describe('noms de fichiers', () => {
  it('sans accents ni espaces', () => {
    expect(nomFichier(['Martin', 'Léa', '1CFC3', 'Cycles du Léman'], '.compta-copie.json')).toBe(
      'Martin_Lea_1CFC3_Cycles-du-Leman.compta-copie.json',
    );
  });
});

describe('compatibilité des fichiers dans la durée', () => {
  it('refuse un fichier plus récent avec un message clair', async () => {
    const { importerExercice, exporterExerciceEnseignant } = await import('../src/io/fichiers');
    const f = JSON.parse(exporterExerciceEnseignant(demoCfc1));
    f.version = 99;
    expect(() => importerExercice(JSON.stringify(f))).toThrow(/version plus récente/);
  });

  it('complète les paramètres manquants d’un ancien fichier', async () => {
    const { importerExercice, exporterExerciceEnseignant } = await import('../src/io/fichiers');
    const f = JSON.parse(exporterExerciceEnseignant(demoCfc1));
    f.exercice.parametres = { libellesT: 'San/Spb' };
    const ex = importerExercice(JSON.stringify(f));
    expect(ex.parametres.libellesT).toBe('San/Spb');
    expect(ex.parametres.modeBouclement).toBe('compteDeResultat');
    expect(ex.parametres.comptesAjoutes).toEqual([]);
  });

  it('applique les conversions successives d’un ancien format', async () => {
    const { migrer } = await import('../src/io/fichiers');
    const migrations = { 1: (f: Record<string, unknown>) => ({ ...f, a: 1 }), 2: (f: Record<string, unknown>) => ({ ...f, b: 2 }) };
    expect(migrer({ version: 1 }, 'Ce fichier', migrations, 3)).toEqual({ version: 3, a: 1, b: 2 });
    expect(() => migrer({ version: 1 }, 'Ce fichier', {}, 2)).toThrow(/ancien format/);
    expect(() => migrer({}, 'Ce fichier')).toThrow(/version lisible/);
  });
});
