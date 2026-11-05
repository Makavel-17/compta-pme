// Exercice fourni par l'enseignant : énoncé, opérations, bilan d'ouverture, paramètres.
// Le corrigé et le barème seront formalisés en phase 3.

import type { Centimes } from './money';
import type { DateISO } from './dates';
import type { Dossier, FormeJuridique, LigneEcriture } from './dossier';
import { comptesDisponibles, controlerOuverture, ouvertureDepuisBilan } from './dossier';
import { estDateValide } from './dates';
import type { ModeBouclement } from './closing';
import type { Compte, Niveau } from './plan';
import { comptesDuNiveau, NIVEAUX } from './plan';
import type { DonneesRepartition } from './repartition';
import type { PieceComptable } from './pieces';

export type LibellesT = 'SI/SF' | 'San/Spb';
export type Mode = 'entrainement' | 'evaluation';

/** Rubriques de l'application ; une rubrique non activée n'apparaît pas. */
export type Fonction = 'tva' | 'salaire' | 'calculatriceTva' | 'repartition' | 'analyse';

export interface Operation {
  numero: string;
  date: DateISO;
  texte: string;
  /** Pièce comptable à lire (dossiers « pièces seules ») ; l'élève en déduit l'écriture. */
  piece?: PieceComptable;
}

export interface EcritureCorrigee {
  piece: string;
  lignes: LigneEcriture[];
}

export type Filiere = 'CFC' | 'MP';

export interface Exercice {
  id: string;
  titre: string;
  /** Comptes et fonctions disponibles (CFC 1re année, CFC 2e année, maturité professionnelle). */
  niveau: Niveau;
  /** Formation visée : CFC ou maturité professionnelle (par défaut d'après `niveau`). */
  filiere?: Filiere;
  /** Niveau de difficulté dans la formation : 1 = le plus simple. */
  difficulte?: number;
  /** Sujets traités, affichés aux élèves (par exemple « TVA », « Amortissements »). */
  sujets?: string[];
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  debut: DateISO;
  fin: DateISO;
  /** Texte d'introduction de l'énoncé. */
  introduction: string;
  /**
   * Situation de départ : récit qui place l'élève dans l'entreprise (rôle, produits, collègues, attentes).
   * Facultatif pour les fichiers créés avant son introduction.
   */
  situation?: string;
  operations: Operation[];
  /** Bilan d'ouverture en montants positifs. */
  ouvertureActif: Record<string, Centimes>;
  ouverturePassif: Record<string, Centimes>;
  mode: Mode;
  parametres: {
    libellesT: LibellesT;
    /** Entraînement : l'enseignant autorise la modification directe des écritures validées. */
    modificationDirecte: boolean;
    modeBouclement: ModeBouclement;
    comptesAjoutes: string[];
    comptesMasques: string[];
    /** CFC 2 et plus : méthode de comptabilisation de la TVA (au net par défaut). */
    tvaMethode?: 'net' | 'brut';
    /** Fiche « Décompte de salaire » pour calculer les retenues. */
    ficheSalaire?: boolean;
    /** Calculatrice de TVA (aide au calcul, désactivée par défaut). */
    calculatriceTva?: boolean;
    /** Corriger (entraînement) et noter (évaluation) les écritures de bouclement. */
    corrigerBouclement?: boolean;
    /** MP, sociétés : données de la répartition du bénéfice décidée par l'assemblée générale. */
    repartition?: DonneesRepartition;
  };
  corrige?: EcritureCorrigee[];
  /** Points par opération (numéro → points) ; 1 point par défaut. */
  bareme?: Record<string, number>;
  /** Points partiels pour les écritures multiples (oui par défaut). */
  pointsPartiels?: boolean;
}

/** Fonctions activées par défaut selon le niveau (TVA dès CFC 2). */
export function fonctionsDuNiveau(niveau: Niveau): Set<Fonction> {
  const f = new Set<Fonction>();
  if (NIVEAUX.indexOf(niveau) >= NIVEAUX.indexOf('CFC2')) f.add('tva');
  return f;
}

export const INTITULE_CAPITAL: Record<FormeJuridique, string> = {
  'raison individuelle': 'Capital',
  SA: 'Capital-actions',
  Sàrl: 'Capital social',
};

/** Le compte 2800 porte l'intitulé correspondant à la forme juridique. */
export function planSelonForme(plan: Compte[], forme: FormeJuridique): Compte[] {
  return plan.map((c) => (c.numero === '2800' ? { ...c, intitule: INTITULE_CAPITAL[forme] } : c));
}

/** Fonctions visibles pour un exercice : celles du niveau, plus les options choisies par l'enseignant. */
export function fonctionsExercice(ex: Exercice): Set<Fonction> {
  const f = fonctionsDuNiveau(ex.niveau);
  const cfc2 = NIVEAUX.indexOf(ex.niveau) >= NIVEAUX.indexOf('CFC2');
  if (cfc2 && ex.parametres.ficheSalaire) f.add('salaire');
  if (cfc2 && ex.parametres.calculatriceTva) f.add('calculatriceTva');
  if (ex.niveau === 'MP') {
    f.add('analyse');
    if (ex.formeJuridique !== 'raison individuelle') f.add('repartition');
  }
  return f;
}

/** Crée le dossier comptable de l'élève à partir de l'exercice. */
export function creerDossier(ex: Exercice, plan: Compte[]): Dossier {
  const ajoutes = [...ex.parametres.comptesAjoutes];
  // En mode « compte de résultat », le compte 9000 est nécessaire aux écritures de bouclement.
  if (ex.parametres.modeBouclement === 'compteDeResultat' && !ajoutes.includes('9000')) ajoutes.push('9000');
  return {
    raisonSociale: ex.raisonSociale,
    formeJuridique: ex.formeJuridique,
    debut: ex.debut,
    fin: ex.fin,
    niveau: ex.niveau,
    plan: planSelonForme(plan, ex.formeJuridique),
    comptesAjoutes: ajoutes,
    comptesMasques: [...ex.parametres.comptesMasques],
    ouverture: ouvertureDepuisBilan(ex.ouvertureActif, ex.ouverturePassif),
    ecritures: [],
  };
}

/** Comptes du plan choisis pour l'exercice : ceux du niveau, plus les ajoutés, moins les masqués. */
export function comptesChoisis(
  plan: readonly Compte[],
  niveau: Niveau,
  choix: { comptesAjoutes: readonly string[]; comptesMasques: readonly string[] },
): Set<string> {
  const s = new Set(comptesDuNiveau(plan, niveau).map((c) => c.numero));
  for (const n of choix.comptesAjoutes) s.add(n);
  for (const n of choix.comptesMasques) s.delete(n);
  return s;
}

/**
 * Coche ou décoche un compte dans l'éditeur : un compte hors niveau coché va dans `comptesAjoutes`,
 * un compte du niveau décoché va dans `comptesMasques`. Les listes restent minimales et triées.
 */
export function basculerCompte(
  plan: readonly Compte[],
  niveau: Niveau,
  choix: { comptesAjoutes: readonly string[]; comptesMasques: readonly string[] },
  numero: string,
  coche: boolean,
): { comptesAjoutes: string[]; comptesMasques: string[] } {
  const duNiveau = new Set(comptesDuNiveau(plan, niveau).map((c) => c.numero));
  const ajoutes = new Set(choix.comptesAjoutes.filter((n) => !duNiveau.has(n)));
  const masques = new Set(choix.comptesMasques.filter((n) => duNiveau.has(n)));
  if (duNiveau.has(numero)) {
    if (coche) masques.delete(numero);
    else masques.add(numero);
  } else if (coche) ajoutes.add(numero);
  else ajoutes.delete(numero);
  return { comptesAjoutes: [...ajoutes].sort(), comptesMasques: [...masques].sort() };
}

/** Numéros d'opérations ayant au moins une écriture non extournée dans le journal. */
export function operationsSaisies(d: Dossier): Set<string> {
  const extournees = new Set(d.ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  return new Set(d.ecritures.filter((e) => !e.extourneDe && !extournees.has(e.id)).map((e) => e.piece));
}

/** Contrôle d'un exercice avant distribution : erreurs bloquantes et avertissements. */
export function controlerExercice(ex: Exercice, plan: Compte[]): { erreurs: string[]; avertissements: string[] } {
  const erreurs: string[] = [];
  const avertissements: string[] = [];
  if (!ex.titre.trim()) erreurs.push("Indiquez le titre de l'exercice.");
  if (!ex.raisonSociale.trim()) erreurs.push("Indiquez la raison sociale de l'entreprise.");
  const datesOk = estDateValide(ex.debut) && estDateValide(ex.fin);
  if (!datesOk) erreurs.push("Indiquez des dates d'exercice valides (JJ.MM.AAAA).");
  else if (ex.debut >= ex.fin) erreurs.push("La fin de l'exercice doit être postérieure à son début.");

  const d = creerDossier(ex, plan);
  erreurs.push(...controlerOuverture(d));
  const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
  for (const n of Object.keys(d.ouverture)) {
    if (!dispo.has(n)) erreurs.push(`Bilan d'ouverture : le compte ${n} n'est pas disponible au niveau choisi.`);
  }

  if (ex.operations.length === 0) erreurs.push("Ajoutez au moins une opération à l'énoncé.");
  const vus = new Set<string>();
  ex.operations.forEach((o) => {
    if (vus.has(o.numero)) erreurs.push(`Le numéro d'opération ${o.numero} figure deux fois.`);
    vus.add(o.numero);
    if (!o.texte.trim()) erreurs.push(`Opération ${o.numero} : le texte est vide.`);
    if (!estDateValide(o.date)) erreurs.push(`Opération ${o.numero} : la date est invalide.`);
    else if (datesOk && (o.date < ex.debut || o.date > ex.fin)) {
      erreurs.push(`Opération ${o.numero} : la date est hors de l'exercice.`);
    }
  });

  const corrige = new Map((ex.corrige ?? []).map((c) => [c.piece, c]));
  const sansCorrige = ex.operations.filter((o) => !corrige.has(o.numero)).map((o) => o.numero);
  if (sansCorrige.length) {
    const msg = `Opérations sans corrigé : ${sansCorrige.join(', ')}.`;
    if (ex.mode === 'entrainement') avertissements.push(`${msg} Aucun retour ne sera donné aux élèves pour ces opérations.`);
    else avertissements.push(`${msg} Elles ne pourront pas être corrigées automatiquement.`);
  }
  for (const c of ex.corrige ?? []) {
    if (!vus.has(c.piece)) avertissements.push(`Le corrigé contient une pièce ${c.piece} qui n'est pas une opération de l'énoncé.`);
  }
  return { erreurs, avertissements };
}

/** Exercice vierge pour l'éditeur de l'enseignant. */
export function exerciceVierge(id: string, annee: number): Exercice {
  return {
    id,
    titre: '',
    niveau: 'CFC1',
    raisonSociale: '',
    formeJuridique: 'raison individuelle',
    debut: `${annee}-01-01`,
    fin: `${annee}-12-31`,
    introduction: '',
    situation: '',
    operations: [],
    ouvertureActif: {},
    ouverturePassif: {},
    mode: 'entrainement',
    parametres: {
      libellesT: 'SI/SF',
      modificationDirecte: false,
      modeBouclement: 'compteDeResultat',
      comptesAjoutes: [],
      comptesMasques: [],
    },
    corrige: [],
  };
}

/** Transforme les écritures saisies par l'enseignant en corrigé (une entrée par pièce). */
export function corrigeDepuisEcritures(d: Dossier): EcritureCorrigee[] {
  const extournees = new Set(d.ecritures.filter((e) => e.extourneDe).map((e) => e.extourneDe!));
  const parPiece = new Map<string, LigneEcriture[]>();
  for (const e of d.ecritures) {
    if (e.extourneDe || extournees.has(e.id)) continue;
    parPiece.set(e.piece, [...(parPiece.get(e.piece) ?? []), ...e.lignes]);
  }
  return [...parPiece].map(([piece, lignes]) => ({ piece, lignes }));
}

export const LIBELLES_MODE: Record<Mode, string> = { entrainement: 'Entraînement', evaluation: 'Évaluation' };

export const LIBELLES_NIVEAU: Record<Niveau, string> = { CFC1: 'CFC 1', CFC2: 'CFC 2', MP: 'MP' };

/** Contenu disponible selon `niveau` (comptes et fonctions), libellés de l'éditeur. */
export const LIBELLES_CONTENU: Record<Niveau, string> = {
  CFC1: 'Bases (CFC, 1re année)',
  CFC2: 'CFC complet (2e année : TVA, clôture, salaires)',
  MP: 'Maturité professionnelle (sociétés, titres, analyse)',
};

export const LIBELLES_FILIERE: Record<Filiere, string> = { CFC: 'CFC', MP: 'Maturité professionnelle' };

/** Titres des niveaux de difficulté (proposition à faire valider par l'enseignant). */
export const TITRES_DIFFICULTE: Record<Filiere, Record<number, string>> = {
  CFC: {
    1: 'Bases : bilan, comptes, journal, bouclement',
    2: 'TVA',
    3: 'Opérations de clôture : amortissements, transitoires, créances, salaires',
    4: 'Synthèse de plusieurs chapitres',
  },
  MP: {
    1: 'Sociétés : clôture et répartition du bénéfice',
    2: 'Titres, provisions et opérations financières',
    3: 'Synthèse de plusieurs chapitres',
  },
};

export function filiereDe(ex: Pick<Exercice, 'filiere' | 'niveau'>): Filiere {
  return ex.filiere ?? (ex.niveau === 'MP' ? 'MP' : 'CFC');
}

export function difficulteDe(ex: Pick<Exercice, 'difficulte'>): number {
  return ex.difficulte && ex.difficulte > 0 ? Math.floor(ex.difficulte) : 1;
}

/** « CFC · niveau 3 » */
export function etiquetteNiveau(ex: Pick<Exercice, 'filiere' | 'niveau' | 'difficulte'>): string {
  return `${filiereDe(ex)} · niveau ${difficulteDe(ex)}`;
}

export interface GroupeExercices {
  filiere: Filiere;
  difficulte: number;
  titre: string;
  exercices: Exercice[];
}

/** Exercices classés par formation (CFC puis MP), puis par niveau de difficulté croissant. */
export function classerExercices(exercices: readonly Exercice[]): GroupeExercices[] {
  const groupes = new Map<string, GroupeExercices>();
  for (const ex of exercices) {
    const filiere = filiereDe(ex);
    const difficulte = difficulteDe(ex);
    const cle = `${filiere}|${difficulte}`;
    if (!groupes.has(cle)) {
      groupes.set(cle, { filiere, difficulte, titre: TITRES_DIFFICULTE[filiere][difficulte] ?? '', exercices: [] });
    }
    groupes.get(cle)!.exercices.push(ex);
  }
  const ordre = (f: Filiere) => (f === 'CFC' ? 0 : 1);
  return [...groupes.values()].sort((a, b) => ordre(a.filiere) - ordre(b.filiere) || a.difficulte - b.difficulte);
}
