// État global de l'application (Svelte 5), sauvegardé automatiquement dans le navigateur.

import type { Dossier } from '../engine/dossier';
import type { Exercice } from '../engine/exercice';
import { corrigeDepuisEcritures, creerDossier, fonctionsExercice, type EcritureCorrigee } from '../engine/exercice';
import { ajouterEcriture } from '../engine/journal';
import { plan as planParDefaut } from '../data/plan';
import { ecrire, lire } from '../io/stockage';
import type { Suivi } from '../engine/correction';

export type Vue =
  | 'tableau'
  | 'journal'
  | 'comptes'
  | 'grandlivre'
  | 'balance'
  | 'bilan'
  | 'resultat'
  | 'tva'
  | 'salaire'
  | 'repartition'
  | 'analyse'
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
  /** Tentatives par opération (retour gradué en entraînement). */
  suivi: Suivi;
  /** 'corrige' : l'enseignant saisit le corrigé d'un exercice dans le journal. */
  role: 'eleve' | 'corrige';
}

interface Preferences {
  visiteVue: boolean;
  numerosComptes: boolean;
}

interface Sauvegarde {
  session: Session | null;
  sessionMiseDeCote?: Session | null;
  prefs: Preferences;
}

const VUES: Vue[] = ['tableau', 'journal', 'comptes', 'grandlivre', 'balance', 'bilan', 'resultat', 'tva', 'salaire', 'repartition', 'analyse', 'bouclement'];

function vueDepuisAdresse(): Vue {
  const h = location.hash.replace('#', '') as Vue;
  return VUES.includes(h) ? h : 'tableau';
}

class Etat {
  session = $state<Session | null>(null);
  /** Travail de l'élève mis de côté pendant que l'enseignant saisit un corrigé. */
  sessionMiseDeCote = $state<Session | null>(null);
  prefs = $state<Preferences>({ visiteVue: false, numerosComptes: true });
  vue = $state<Vue>(vueDepuisAdresse());
  visiteOuverte = $state(false);
  stockageIndisponible = $state(false);

  constructor() {
    const s = lire<Sauvegarde>();
    if (s) {
      // Sessions enregistrées avant l'ajout du suivi et du rôle : valeurs par défaut.
      const ancienne = s.session as (Partial<Session> & Omit<Session, 'suivi' | 'role'>) | null;
      this.session = ancienne ? { ...ancienne, suivi: ancienne.suivi ?? {}, role: ancienne.role ?? 'eleve' } : null;
      this.prefs = { ...this.prefs, ...s.prefs };
      this.sessionMiseDeCote = s.sessionMiseDeCote ?? null;
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
    return fonctionsExercice(this.session!.exercice);
  }

  aller(v: Vue) {
    this.vue = v;
    if (location.hash !== `#${v}`) history.pushState(null, '', `#${v}`);
  }

  majDossier(d: Dossier) {
    this.session!.dossier = d;
  }

  commencer(eleve: Eleve, exercice: Exercice, role: Session['role'] = 'eleve') {
    this.session = { eleve, exercice, dossier: creerDossier(exercice, planParDefaut), archives: [], suivi: {}, role };
    this.aller('journal');
    if (!this.prefs.visiteVue && role === 'eleve') this.visiteOuverte = true;
  }

  majSuivi(s: Suivi) {
    this.session!.suivi = s;
  }

  recommencer() {
    const s = this.session!;
    s.dossier = creerDossier(s.exercice, s.dossier.plan);
    s.archives = [];
    s.suivi = {};
  }

  /** L'enseignant saisit le corrigé dans le journal ; les écritures existantes du corrigé sont reprises. */
  ouvrirCorrige(ex: Exercice) {
    if (this.session && this.session.role === 'eleve') this.sessionMiseDeCote = this.session;
    this.commencer({ prenom: 'Enseignant', nom: '', classe: '' }, { ...ex, corrige: [] }, 'corrige');
    let d = this.session!.dossier;
    (ex.corrige ?? []).forEach((c, i) => {
      const op = ex.operations.find((o) => o.numero === c.piece);
      const r = ajouterEcriture(d, {
        id: `E${i + 1}`,
        date: op?.date ?? d.debut,
        piece: c.piece,
        libelle: op ? op.texte.slice(0, 60) : `Pièce ${c.piece}`,
        lignes: c.lignes,
      });
      if (r.ok) d = r.valeur;
    });
    this.session!.dossier = d;
  }

  /** Termine la saisie du corrigé ; renvoie le corrigé (ou null si abandon) et restaure le travail de l'élève. */
  fermerCorrige(garder: boolean): { exerciceId: string; corrige: EcritureCorrigee[] } | null {
    const s = this.session!;
    const res = garder ? { exerciceId: s.exercice.id, corrige: corrigeDepuisEcritures(s.dossier) } : null;
    this.session = this.sessionMiseDeCote;
    this.sessionMiseDeCote = null;
    this.aller('tableau');
    return res;
  }

  quitter() {
    this.session = null;
    this.aller('tableau');
  }

  sauver() {
    const ok = ecrire($state.snapshot({ session: this.session, sessionMiseDeCote: this.sessionMiseDeCote, prefs: this.prefs }));
    this.stockageIndisponible = !ok;
  }
}

export const etat = new Etat();

$effect.root(() => {
  $effect(() => {
    etat.sauver();
  });
});
