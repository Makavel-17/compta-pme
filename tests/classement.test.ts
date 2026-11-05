import { describe, expect, it } from 'vitest';
import { exercicesDemo } from '../src/data/demos';
import { classerExercices, difficulteDe, etiquetteNiveau, exerciceVierge, filiereDe } from '../src/engine/exercice';

describe('classement des exercices par formation et niveau', () => {
  it('chaque exercice fourni a une formation, un niveau et des chapitres du manuel', () => {
    for (const ex of exercicesDemo) {
      expect(ex.filiere, ex.titre).toBeDefined();
      expect(ex.difficulte, ex.titre).toBeGreaterThanOrEqual(1);
      expect(ex.chapitres?.length, ex.titre).toBeGreaterThan(0);
    }
  });

  it('CFC avant MP, niveaux croissants', () => {
    const g = classerExercices(exercicesDemo);
    expect(g.map((x) => `${x.filiere}${x.difficulte}`)).toEqual(['CFC1', 'CFC2', 'CFC3', 'CFC4', 'MP1', 'MP2']);
    expect(g[0]!.exercices).toHaveLength(3);
    expect(g[0]!.titre).toMatch(/^Bases/);
  });

  it('valeurs par défaut pour les fichiers plus anciens', () => {
    const ancien = { ...exerciceVierge('x', 2026), niveau: 'MP' as const, filiere: undefined, difficulte: undefined };
    expect(filiereDe(ancien)).toBe('MP');
    expect(difficulteDe(ancien)).toBe(1);
    expect(etiquetteNiveau(ancien)).toBe('MP · niveau 1');
  });
});
