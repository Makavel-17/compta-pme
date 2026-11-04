// État global de l'application (Svelte 5), sauvegardé automatiquement dans le navigateur.

import type { Dossier } from '../engine/dossier';
import type { Exercice } from '../engine/exercice';
import { creerDossier, fonctionsDuNiveau } from '../engine/exercice';
import { plan as planParDefaut } from '../data/plan';
import { ecrire, lire } from '../io/stockage';

export type Vue =
  | 'tableau'
  | 'journal'
  | 'comptes'
  | 'grandlivre'
  | 'balance'
  | 'bilan'
  | 'resultat'
  | 'tva'
  | 'bouclement';

export interface Eleve {
  prenom: string;
  nom: string;
  classe: string;
}

export interface Session {
  eleve: Eleve;
  exercice: Exercice;
  dossier: Dossier;
  /** Exercices précédents, après réouverture. */
  archives: Dossier[];
}

interface Preferences {
  visiteVue: boolean;
  numerosComptes: boolean;
}

interface Sauvegarde {
  session: Session | null;
  prefs: Preferences;
}

const VUES: Vue[] = ['tableau', 'journal', 'comptes', 'grandlivre', 'balance', 'bilan', 'resultat', 'tva', 'bouclement'];

function vueDepuisAdresse(): Vue {
  const h = location.hash.replace('#', '') as Vue;
  return VUES.includes(h) ? h : 'tableau';
}

class Etat {
  session = $state<Session | null>(null);
  prefs = $state<Preferences>({ visiteVue: false, numerosComptes: true });
  vue = $state<Vue>(vueDepuisAdresse());
  visiteOuverte = $state(false);
  stockageIndisponible = $state(false);

  constructor() {
    const s = lire<Sauvegarde>();
    if (s) {
      this.session = s.session;
      this.prefs = { ...this.prefs, ...s.prefs };
    }
    window.addEventListener('hashchange', () => (this.vue = vueDepuisAdresse()));
  }

  get dossier(): Dossier {
    return this.session!.dossier;
  }

  get exercice(): Exercice {
    return this.session!.exercice;
  }

  get fonctions() {
    return fonctionsDuNiveau(this.session!.exercice.niveau);
  }

  aller(v: Vue) {
    this.vue = v;
    if (location.hash !== `#${v}`) history.pushState(null, '', `#${v}`);
  }

  majDossier(d: Dossier) {
    this.session!.dossier = d;
  }

  commencer(eleve: Eleve, exercice: Exercice) {
    this.session = { eleve, exercice, dossier: creerDossier(exercice, planParDefaut), archives: [] };
    this.aller('journal');
    if (!this.prefs.visiteVue) this.visiteOuverte = true;
  }

  recommencer() {
    const s = this.session!;
    s.dossier = creerDossier(s.exercice, s.dossier.plan);
    s.archives = [];
  }

  quitter() {
    this.session = null;
    this.aller('tableau');
  }

  sauver() {
    const ok = ecrire($state.snapshot({ session: this.session, prefs: this.prefs }));
    this.stockageIndisponible = !ok;
  }
}

export const etat = new Etat();

$effect.root(() => {
  $effect(() => {
    etat.sauver();
  });
});
