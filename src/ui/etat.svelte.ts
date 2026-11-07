// État global de l'application (Svelte 5), sauvegardé automatiquement dans le navigateur.

import type { Dossier } from '../engine/dossier';
import type { Exercice } from '../engine/exercice';
import { corrigeDepuisEcritures, creerDossier, fonctionsExercice, type EcritureCorrigee } from '../engine/exercice';
import { ajouterEcriture } from '../engine/journal';
import { plan as planParDefaut } from '../data/plan';
import { ecrire, lire } from '../io/stockage';
import type { DernierExport } from '../io/fichiers';
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
  | 'degres'
  | 'flux'
  | 'seuil'
  | 'bouclement'
  | 'theorie';

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
  /** Contenu des fiches de calcul, enregistré avec le travail de l'élève. */
  fiches: Fiches;
  /** Dernier export de la copie (rappel d'export). */
  dernierExport?: DernierExport | null;
  /** Date ISO de la dernière écriture enregistrée (accueil : « Reprendre où vous en étiez »). */
  derniereActivite?: string | null;
  /** Aperçu enseignant : l'exercice vu comme un élève ; le travail de l'élève est mis de côté puis restauré. */
  apercu?: boolean;
}

export interface FicheSalaire {
  brut: number | null;
  lignes: { cle: number; libelle: string; taux: string; montant: number | null }[];
}

export interface Fiches {
  salaire?: FicheSalaire;
  repartition?: Record<string, number | null>;
  analyse?: Record<string, string>;
  degres?: Record<string, string>;
  flux?: Record<string, string>;
  seuil?: Record<string, string>;
}

interface Preferences {
  visiteVue: boolean;
  numerosComptes: boolean;
  /** Formation affichée à l'accueil (mémorisée). */
  filiere?: 'CFC' | 'MP';
}

interface Sauvegarde {
  session: Session | null;
  sessionMiseDeCote?: Session | null;
  /** Autres exercices commencés dans ce navigateur, par identifiant d'exercice. */
  autres?: Record<string, Session>;
  prefs: Preferences;
}

/** Sessions enregistrées avant l'ajout du suivi, du rôle et des fiches : valeurs par défaut. */
function completer(s: (Partial<Session> & Omit<Session, 'suivi' | 'role' | 'fiches'>) | null | undefined): Session | null {
  return s ? { ...s, suivi: s.suivi ?? {}, role: s.role ?? 'eleve', fiches: s.fiches ?? {} } : null;
}

const VUES: Vue[] = ['tableau', 'journal', 'comptes', 'grandlivre', 'balance', 'bilan', 'resultat', 'tva', 'salaire', 'repartition', 'analyse', 'degres', 'flux', 'seuil', 'bouclement', 'theorie'];

function vueDepuisAdresse(): Vue {
  const h = location.hash.replace('#', '') as Vue;
  return VUES.includes(h) ? h : 'tableau';
}

class Etat {
  session = $state<Session | null>(null);
  /** Travail de l'élève mis de côté pendant que l'enseignant saisit un corrigé ou regarde un aperçu. */
  sessionMiseDeCote = $state<Session | null>(null);
  /** Autres exercices commencés par l'élève dans ce navigateur (l'exercice actif est dans `session`). */
  autres = $state<Record<string, Session>>({});
  prefs = $state<Preferences>({ visiteVue: false, numerosComptes: true });
  vue = $state<Vue>(vueDepuisAdresse());
  visiteOuverte = $state(false);
  /** Guide d'utilisation ouvert (partie affichée), ou null. */
  guide = $state<null | 'eleve' | 'enseignant'>(null);
  stockageIndisponible = $state(false);
  /** Accueil affiché par-dessus une session en cours (reprise ou choix d'un autre exercice). */
  accueilOuvert = $state(false);
  /** Opération à sélectionner à l'ouverture du journal (récapitulatif de l'avancement). */
  pieceCiblee = $state<string | null>(null);
  /** Chapitre de théorie à ouvrir (lien « Revoir la théorie » sous un indice). */
  chapitreCible = $state<string | null>(null);

  constructor() {
    const s = lire<Sauvegarde>();
    if (s) {
      this.session = completer(s.session);
      this.prefs = { ...this.prefs, ...s.prefs };
      this.sessionMiseDeCote = s.sessionMiseDeCote ?? null;
      this.autres = Object.fromEntries(Object.entries(s.autres ?? {}).map(([k, v]) => [k, completer(v)!]));
    }
    // Arrivée sur le site (sans rubrique dans l'adresse) avec un travail en cours : l'accueil propose de le reprendre.
    const lienExercice = new URLSearchParams(location.search).has('exercice');
    if (this.session?.role === 'eleve' && !this.session.apercu && (lienExercice || !location.hash || location.hash === '#')) this.accueilOuvert = true;
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
    this.session!.derniereActivite = new Date().toISOString();
  }

  /** Revient au travail en cours depuis l'accueil. */
  reprendre() {
    this.accueilOuvert = false;
    if (!location.hash || location.hash === '#') this.aller('tableau');
  }

  /** Ouvre le journal sur une opération donnée. */
  ouvrirOperation(numero: string) {
    this.pieceCiblee = numero;
    this.aller('journal');
  }

  /** Session neuve, sans toucher aux autres exercices (corrigé et aperçu passent par ici). */
  private nouvelleSession(eleve: Eleve, exercice: Exercice, role: Session['role']) {
    this.session = { eleve, exercice, dossier: creerDossier(exercice, planParDefaut), archives: [], suivi: {}, role, fiches: {} };
    this.accueilOuvert = false;
    this.aller(role === 'eleve' ? 'tableau' : 'journal');
  }

  /** Session d'un exercice : en cours (active ou mise en réserve) ou nulle. */
  sessionDe(exerciceId: string): Session | null {
    if (this.session && this.session.role === 'eleve' && !this.session.apercu && this.session.exercice.id === exerciceId) return this.session;
    return this.autres[exerciceId] ?? null;
  }

  /**
   * Ouvre un exercice pour l'élève. L'exercice actif est mis en réserve ; un exercice déjà commencé est repris là où
   * l'élève l'avait laissé, sinon une session neuve est créée.
   */
  commencer(eleve: Eleve, exercice: Exercice, role: Session['role'] = 'eleve') {
    if (role !== 'eleve') return this.nouvelleSession(eleve, exercice, role);
    const actif = this.session;
    if (actif && actif.role === 'eleve' && !actif.apercu) {
      if (actif.exercice.id === exercice.id) {
        actif.eleve = eleve;
        return this.reprendre();
      }
      this.autres[actif.exercice.id] = actif;
    }
    const existante = this.autres[exercice.id];
    if (existante) {
      delete this.autres[exercice.id];
      this.session = { ...existante, eleve };
      this.accueilOuvert = false;
      this.aller('tableau');
      return;
    }
    this.session = { eleve, exercice, dossier: creerDossier(exercice, planParDefaut), archives: [], suivi: {}, role, fiches: {} };
    this.accueilOuvert = false;
    // L'élève découvre d'abord sa situation sur le tableau de bord ; l'enseignant va directement au journal.
    this.aller(role === 'eleve' ? 'tableau' : 'journal');
  }

  /** Bouton « Commencer la saisie » : ouvre le journal, avec la visite guidée la première fois. */
  commencerSaisie() {
    this.aller('journal');
    if (!this.prefs.visiteVue && this.session?.role === 'eleve') this.visiteOuverte = true;
  }

  majSuivi(s: Suivi) {
    this.session!.suivi = s;
  }

  recommencer() {
    const s = this.session!;
    s.dossier = creerDossier(s.exercice, s.dossier.plan);
    s.archives = [];
    s.suivi = {};
    s.fiches = {};
  }

  /** L'enseignant saisit le corrigé dans le journal ; les écritures existantes du corrigé sont reprises. */
  ouvrirCorrige(ex: Exercice) {
    if (this.session && this.session.role === 'eleve') this.sessionMiseDeCote = this.session;
    this.nouvelleSession({ prenom: 'Enseignant', nom: '', classe: '' }, { ...ex, corrige: [] }, 'corrige');
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

  /** Aperçu enseignant : ouvre l'exercice comme un élève, sans toucher au travail en cours dans ce navigateur. */
  ouvrirApercu(ex: Exercice) {
    if (this.session && this.session.role === 'eleve' && !this.session.apercu) this.sessionMiseDeCote = this.session;
    this.nouvelleSession({ prenom: 'Aperçu', nom: 'enseignant', classe: '—' }, ex, 'eleve');
    this.session!.apercu = true;
  }

  /** Ferme l'aperçu et restaure le travail mis de côté. */
  fermerApercu() {
    this.session = this.sessionMiseDeCote;
    this.sessionMiseDeCote = null;
    this.aller('tableau');
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

  /** Efface tout le travail d'élève de ce navigateur (autre élève sur le même ordinateur). */
  quitter() {
    this.session = null;
    this.autres = {};
    this.aller('tableau');
  }

  sauver() {
    const ok = ecrire(
      $state.snapshot({ session: this.session, sessionMiseDeCote: this.sessionMiseDeCote, autres: this.autres, prefs: this.prefs }),
    );
    this.stockageIndisponible = !ok;
  }
}

export const etat = new Etat();

$effect.root(() => {
  $effect(() => {
    etat.sauver();
  });
});
