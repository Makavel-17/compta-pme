import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { demoMp } from '../src/data/demo-mp';
import {
  ErreurFichier,
  exporterCopie,
  exporterExerciceEnseignant,
  exporterSauvegarde,
  fusionnerExercices,
  importerSauvegarde,
} from '../src/io/fichiers';
import { creerDossier } from '../src/engine/exercice';
import { plan } from './fixtures';

describe("sauvegarde de l'espace enseignant", () => {
  it('relit tous les exercices à l’identique, corrigés compris, sans le code', () => {
    const texte = exporterSauvegarde([demoCfc1, demoMp], new Date('2026-11-05T18:00:00Z'));
    expect(texte).not.toContain('"code"');
    const relus = importerSauvegarde(texte);
    expect(relus).toEqual([demoCfc1, demoMp]);
  });

  it('accepte un fichier d’exercice isolé', () => {
    expect(importerSauvegarde(exporterExerciceEnseignant(demoMp))).toEqual([demoMp]);
  });

  it('refuse une copie d’élève ou un fichier quelconque avec un message clair', () => {
    const copie = exporterCopie({
      eleve: { prenom: 'Léa', nom: 'Martin', classe: '1CFC3' },
      exerciceId: demoCfc1.id, exerciceTitre: demoCfc1.titre, mode: 'entrainement',
      dossier: creerDossier(demoCfc1, plan), suivi: {},
    });
    expect(() => importerSauvegarde(copie)).toThrow(/copie d'élève/);
    expect(() => importerSauvegarde('{"a":1}')).toThrow(ErreurFichier);
    expect(() => importerSauvegarde('pas du json')).toThrow(ErreurFichier);
  });

  it('fusionne : même identifiant remplacé, nouveaux ajoutés, rien de perdu', () => {
    const modifie = { ...demoCfc1, titre: 'Titre modifié' };
    const r = fusionnerExercices([demoCfc1], [modifie, demoMp]);
    expect(r.ajoutes).toBe(1);
    expect(r.remplaces).toBe(1);
    expect(r.exercices.map((e) => e.titre)).toEqual(['Titre modifié', demoMp.titre]);
  });
});

describe("rappel d'export de la copie", () => {
  it('vide, jamais exportée, à jour, puis modifiée', async () => {
    const { empreinteTravail, statutExport } = await import('../src/io/fichiers');
    const { ajouterEcriture } = await import('../src/engine/journal');
    const vide = creerDossier(demoCfc1, plan);
    expect(statutExport(vide, {}, null)).toBe('vide');
    const c = demoCfc1.corrige![0]!;
    const r = ajouterEcriture(vide, { id: 'E1', date: demoCfc1.operations[0]!.date, piece: c.piece, libelle: 'x', lignes: c.lignes });
    expect(r.ok).toBe(true);
    const d = r.ok ? r.valeur : vide;
    expect(statutExport(d, {}, null)).toBe('jamais');
    const dernier = { le: '2026-11-05T18:00:00Z', empreinte: empreinteTravail(d, {}) };
    expect(statutExport(d, {}, dernier)).toBe('a-jour');
    expect(statutExport(d, { analyse: { roi: '5' } }, dernier)).toBe('modifie');
    expect(statutExport(vide, {}, dernier)).toBe('modifie');
  });
});
