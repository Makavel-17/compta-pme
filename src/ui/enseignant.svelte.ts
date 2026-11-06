// Espace enseignant : code d'accès simple (sans prétention de sécurité) et exercices en préparation.

import type { Exercice } from '../engine/exercice';
import { CLE_ENSEIGNANT, ecrire, lire } from '../io/stockage';

interface DonneesEnseignant {
  code: string | null;
  exercices: Exercice[];
  /** Date ISO de la dernière sauvegarde exportée. */
  derniereSauvegarde?: string | null;
}

class Enseignant {
  code = $state<string | null>(null);
  exercices = $state<Exercice[]>([]);
  derniereSauvegarde = $state<string | null>(null);
  /** Espace affiché à la place de l'accueil élève. */
  ouvert = $state(false);
  deverrouille = $state(false);
  /** Onglet affiché ; gardé en mémoire pour revenir au même endroit après un aperçu. */
  onglet = $state<'exercices' | 'dossiers' | 'copies' | 'parametres'>('exercices');
  /** Exercice en cours d'édition (identifiant). */
  edition = $state<string | null>(null);

  constructor() {
    const d = lire<DonneesEnseignant>(CLE_ENSEIGNANT);
    if (d) {
      this.code = d.code;
      this.exercices = d.exercices ?? [];
      this.derniereSauvegarde = d.derniereSauvegarde ?? null;
    }
  }

  sauver() {
    ecrire($state.snapshot({ code: this.code, exercices: this.exercices, derniereSauvegarde: this.derniereSauvegarde }), CLE_ENSEIGNANT);
  }

  enregistrer(ex: Exercice) {
    const i = this.exercices.findIndex((x) => x.id === ex.id);
    if (i >= 0) this.exercices[i] = ex;
    else this.exercices.unshift(ex);
  }

  supprimer(id: string) {
    this.exercices = this.exercices.filter((x) => x.id !== id);
  }

  trouver(id: string | null): Exercice | undefined {
    return this.exercices.find((x) => x.id === id);
  }
}

export const enseignant = new Enseignant();

$effect.root(() => {
  $effect(() => {
    enseignant.sauver();
  });
});

export function nouvelIdentifiant(): string {
  return `ex-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
