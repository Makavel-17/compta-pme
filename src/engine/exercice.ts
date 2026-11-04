// Exercice fourni par l'enseignant : énoncé, opérations, bilan d'ouverture, paramètres.
// Le corrigé et le barème seront formalisés en phase 3.

import type { Centimes } from './money';
import type { DateISO } from './dates';
import type { Dossier, FormeJuridique, LigneEcriture } from './dossier';
import { comptesDisponibles, controlerOuverture, ouvertureDepuisBilan } from './dossier';
import { estDateValide } from './dates';
import type { ModeBouclement } from './closing';
import type { Compte, Niveau } from './plan';
import { NIVEAUX } from './plan';
import type { DonneesRepartition } from './repartition';

export type LibellesT = 'SI/SF' | 'San/Spb';
export type Mode = 'entrainement' | 'evaluation';

/** Rubriques de l'application ; une rubrique non activée n'apparaît pas. */
export type Fonction = 'tva' | 'salaire' | 'calculatriceTva' | 'repartition' | 'analyse';

export interface Operation {
  numero: string;
  date: DateISO;
  texte: string;
}

export interface EcritureCorrigee {
  piece: string;
  lignes: LigneEcriture[];
}

export interface Exercice {
  id: string;
  titre: string;
  niveau: Niveau;
  raisonSociale: string;
  formeJuridique: FormeJuridique;
  debut: DateISO;
  fin: DateISO;
  /** Texte d'introduction de l'énoncé. */
  introduction: string;
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
