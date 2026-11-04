// Plan comptable : types, lecture et écriture CSV, filtrage par niveau.
// Module pur, sans dépendance à l'interface.

export type Niveau = 'CFC1' | 'CFC2' | 'MP';
export type TypeCompte = 'actif' | 'passif' | 'charge' | 'produit' | 'bouclement';

export interface Compte {
  numero: string;
  intitule: string;
  classe: number;
  type: TypeCompte;
  /** Niveau à partir duquel le compte est visible ; null = non utilisé par défaut. */
  niveauMin: Niveau | null;
}

export const NIVEAUX: readonly Niveau[] = ['CFC1', 'CFC2', 'MP'];
const TYPES: readonly TypeCompte[] = ['actif', 'passif', 'charge', 'produit', 'bouclement'];
export const ENTETE_CSV = 'numero;intitule;classe;type;niveau_min';

export class ErreurPlan extends Error {}

/** Lit un plan comptable CSV (séparateur « ; », BOM toléré). Lève ErreurPlan avec un message clair. */
export function lirePlanCsv(texte: string): Compte[] {
  const lignes = texte.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  const entete = lignes.shift();
  if (entete?.trim().toLowerCase() !== ENTETE_CSV) {
    throw new ErreurPlan(`La première ligne doit être : ${ENTETE_CSV}`);
  }
  const vus = new Set<string>();
  return lignes.map((ligne, i) => {
    const n = i + 2;
    const champs = ligne.split(';').map((c) => c.trim());
    if (champs.length !== 5) throw new ErreurPlan(`Ligne ${n} : 5 colonnes attendues, ${champs.length} trouvées.`);
    const [numero, intitule, classeTxt, type, niveau] = champs as [string, string, string, string, string];
    if (!/^\d{4}$/.test(numero)) throw new ErreurPlan(`Ligne ${n} : le numéro « ${numero} » doit comporter 4 chiffres.`);
    if (vus.has(numero)) throw new ErreurPlan(`Ligne ${n} : le compte ${numero} figure deux fois.`);
    vus.add(numero);
    if (intitule === '') throw new ErreurPlan(`Ligne ${n} : l'intitulé du compte ${numero} est vide.`);
    const classe = Number(classeTxt);
    if (String(classe) !== numero[0]) {
      throw new ErreurPlan(`Ligne ${n} : la classe ${classeTxt} ne correspond pas au premier chiffre du compte ${numero}.`);
    }
    if (!TYPES.includes(type as TypeCompte)) {
      throw new ErreurPlan(`Ligne ${n} : type « ${type} » inconnu (attendu : ${TYPES.join(', ')}).`);
    }
    if (niveau !== '-' && !NIVEAUX.includes(niveau as Niveau)) {
      throw new ErreurPlan(`Ligne ${n} : niveau « ${niveau} » inconnu (attendu : CFC1, CFC2, MP ou -).`);
    }
    return {
      numero,
      intitule,
      classe,
      type: type as TypeCompte,
      niveauMin: niveau === '-' ? null : (niveau as Niveau),
    };
  });
}

export function ecrirePlanCsv(plan: readonly Compte[]): string {
  const lignes = plan.map((c) => [c.numero, c.intitule, c.classe, c.type, c.niveauMin ?? '-'].join(';'));
  return [ENTETE_CSV, ...lignes].join('\n') + '\n';
}

/** Comptes visibles pour un niveau donné (un compte CFC1 reste visible en CFC2 et MP). */
export function comptesDuNiveau(plan: readonly Compte[], niveau: Niveau): Compte[] {
  const rang = NIVEAUX.indexOf(niveau);
  return plan.filter((c) => c.niveauMin !== null && NIVEAUX.indexOf(c.niveauMin) <= rang);
}
