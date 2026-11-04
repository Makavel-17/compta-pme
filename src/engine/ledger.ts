// Soldes, comptes en T, grand livre, balance de vérification.
// Convention interne : solde positif = débiteur, négatif = créditeur.

import type { Centimes } from './money';
import type { DateISO } from './dates';
import type { Dossier } from './dossier';
import { indexPlan } from './dossier';

export type Sens = 'D' | 'C';

export interface Mouvement {
  ecritureId: string;
  date: DateISO;
  piece: string;
  libelle: string;
  compte: string;
  sens: Sens;
  montant: Centimes;
  /** Compte de contrepartie, ou « Divers » dans une écriture composée. */
  contrepartie: string;
}

/** Tous les mouvements du journal, triés par date (ordre de saisie à date égale). */
export function mouvements(d: Dossier): Mouvement[] {
  const res: Mouvement[] = [];
  const ecritures = d.ecritures
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i));
  for (const { e } of ecritures) {
    const composee = e.lignes.length > 1;
    for (const l of e.lignes) {
      const base = { ecritureId: e.id, date: e.date, piece: e.piece, libelle: e.libelle, montant: l.montant };
      if (l.debit) {
        res.push({ ...base, compte: l.debit, sens: 'D', contrepartie: composee || !l.credit ? 'Divers' : l.credit });
      }
      if (l.credit) {
        res.push({ ...base, compte: l.credit, sens: 'C', contrepartie: composee || !l.debit ? 'Divers' : l.debit });
      }
    }
  }
  return res;
}

export interface SoldeCompte {
  ouverture: Centimes;
  debit: Centimes;
  credit: Centimes;
  /** ouverture + débit − crédit (positif = débiteur). */
  solde: Centimes;
}

export function soldes(d: Dossier): Map<string, SoldeCompte> {
  const s = new Map<string, SoldeCompte>();
  const get = (n: string): SoldeCompte => {
    let x = s.get(n);
    if (!x) s.set(n, (x = { ouverture: 0, debit: 0, credit: 0, solde: 0 }));
    return x;
  };
  for (const [n, m] of Object.entries(d.ouverture)) {
    const x = get(n);
    x.ouverture += m;
    x.solde += m;
  }
  for (const m of mouvements(d)) {
    const x = get(m.compte);
    if (m.sens === 'D') {
      x.debit += m.montant;
      x.solde += m.montant;
    } else {
      x.credit += m.montant;
      x.solde -= m.montant;
    }
  }
  return s;
}

export function soldeDe(d: Dossier, compte: string): Centimes {
  return soldes(d).get(compte)?.solde ?? 0;
}

// ---------- Compte en T ----------

export interface LigneT {
  /** 'ouverture' : solde reporté du bilan d'ouverture ; 'mouvement' : écriture du journal. */
  nature: 'ouverture' | 'mouvement';
  date?: DateISO;
  piece?: string;
  libelle?: string;
  contrepartie?: string;
  montant: Centimes;
}

export interface CompteEnT {
  numero: string;
  intitule: string;
  debit: LigneT[];
  credit: LigneT[];
  totalDebit: Centimes;
  totalCredit: Centimes;
  /** Solde inscrit du côté le plus faible pour équilibrer le compte. */
  solde: { cote: Sens | null; montant: Centimes };
  /** Total des deux côtés une fois le solde inscrit. */
  totalEquilibre: Centimes;
}

export function compteEnT(d: Dossier, numero: string): CompteEnT {
  const debit: LigneT[] = [];
  const credit: LigneT[] = [];
  const o = d.ouverture[numero] ?? 0;
  if (o > 0) debit.push({ nature: 'ouverture', montant: o });
  if (o < 0) credit.push({ nature: 'ouverture', montant: -o });
  for (const m of mouvements(d).filter((x) => x.compte === numero)) {
    const l: LigneT = {
      nature: 'mouvement',
      date: m.date,
      piece: m.piece,
      libelle: m.libelle,
      contrepartie: m.contrepartie,
      montant: m.montant,
    };
    (m.sens === 'D' ? debit : credit).push(l);
  }
  const totalDebit = debit.reduce((s, l) => s + l.montant, 0);
  const totalCredit = credit.reduce((s, l) => s + l.montant, 0);
  const ecart = totalDebit - totalCredit;
  return {
    numero,
    intitule: indexPlan(d.plan).get(numero)?.intitule ?? '',
    debit,
    credit,
    totalDebit,
    totalCredit,
    // Un compte débiteur s'équilibre en inscrivant le solde au crédit, et inversement.
    solde: { cote: ecart > 0 ? 'C' : ecart < 0 ? 'D' : null, montant: Math.abs(ecart) },
    totalEquilibre: Math.max(totalDebit, totalCredit),
  };
}

// ---------- Grand livre ----------

export interface LigneGrandLivre extends LigneT {
  sens: Sens;
  /** Solde progressif après la ligne (positif = débiteur). */
  soldeProgressif: Centimes;
}

export interface CompteGrandLivre {
  numero: string;
  intitule: string;
  lignes: LigneGrandLivre[];
  totalDebit: Centimes;
  totalCredit: Centimes;
  solde: Centimes;
}

/** Grand livre : comptes ayant un solde d'ouverture ou au moins un mouvement, par ordre de numéro. */
export function grandLivre(d: Dossier): CompteGrandLivre[] {
  const plan = indexPlan(d.plan);
  const parCompte = new Map<string, LigneGrandLivre[]>();
  const courant = new Map<string, Centimes>();
  const ajouter = (n: string, l: LigneT, sens: Sens) => {
    const s = (courant.get(n) ?? 0) + (sens === 'D' ? l.montant : -l.montant);
    courant.set(n, s);
    if (!parCompte.has(n)) parCompte.set(n, []);
    parCompte.get(n)!.push({ ...l, sens, soldeProgressif: s });
  };
  for (const [n, m] of Object.entries(d.ouverture)) {
    if (m !== 0) ajouter(n, { nature: 'ouverture', montant: Math.abs(m) }, m > 0 ? 'D' : 'C');
  }
  for (const m of mouvements(d)) {
    const { compte, sens, date, piece, libelle, contrepartie, montant } = m;
    ajouter(compte, { nature: 'mouvement', date, piece, libelle, contrepartie, montant }, sens);
  }
  return [...parCompte.keys()].sort().map((n) => {
    const lignes = parCompte.get(n)!;
    return {
      numero: n,
      intitule: plan.get(n)?.intitule ?? '',
      lignes,
      totalDebit: lignes.filter((l) => l.sens === 'D').reduce((s, l) => s + l.montant, 0),
      totalCredit: lignes.filter((l) => l.sens === 'C').reduce((s, l) => s + l.montant, 0),
      solde: courant.get(n) ?? 0,
    };
  });
}

// ---------- Balance de vérification ----------

export interface LigneBalance {
  numero: string;
  intitule: string;
  /** Totaux des mouvements, solde d'ouverture compris. */
  debit: Centimes;
  credit: Centimes;
  soldeDebiteur: Centimes;
  soldeCrediteur: Centimes;
}

export interface Balance {
  lignes: LigneBalance[];
  totalDebit: Centimes;
  totalCredit: Centimes;
  totalSoldesDebiteurs: Centimes;
  totalSoldesCrediteurs: Centimes;
  equilibree: boolean;
}

export function balance(d: Dossier): Balance {
  const plan = indexPlan(d.plan);
  const lignes: LigneBalance[] = [...soldes(d).entries()]
    .filter(([, s]) => s.ouverture !== 0 || s.debit !== 0 || s.credit !== 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([n, s]) => ({
      numero: n,
      intitule: plan.get(n)?.intitule ?? '',
      debit: s.debit + Math.max(s.ouverture, 0),
      credit: s.credit + Math.max(-s.ouverture, 0),
      soldeDebiteur: Math.max(s.solde, 0),
      soldeCrediteur: Math.max(-s.solde, 0),
    }));
  const t = (f: (l: LigneBalance) => Centimes) => lignes.reduce((s, l) => s + f(l), 0);
  const b = {
    lignes,
    totalDebit: t((l) => l.debit),
    totalCredit: t((l) => l.credit),
    totalSoldesDebiteurs: t((l) => l.soldeDebiteur),
    totalSoldesCrediteurs: t((l) => l.soldeCrediteur),
  };
  return {
    ...b,
    equilibree: b.totalDebit === b.totalCredit && b.totalSoldesDebiteurs === b.totalSoldesCrediteurs,
  };
}
