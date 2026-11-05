// Pièces comptables des dossiers d'exercices : factures, tickets, quittances, documents bancaires, fiches de salaire,
// notes internes, avis de dividende. Les constructeurs calculent les montants (TVA arrondie aux 5 centimes,
// retenues de salaire, impôt anticipé) pour que la pièce et le corrigé concordent toujours.
// Entreprises, personnes et numéros sont fictifs.

import type { Centimes } from './money';
import type { DateISO } from './dates';
import { arrondi5 } from './money';
import { tvaSurHT, tvaSurTTC } from './tva';
import { montantRetenue } from './salaire';
import { TAUX_IMPOT_ANTICIPE } from './repartition';

export type TypePiece =
  | 'facture'
  | 'ticket'
  | 'quittance'
  | 'avis-debit'
  | 'avis-credit'
  | 'fiche-salaire'
  | 'note-interne'
  | 'avis-dividende';

export interface Partie {
  nom: string;
  adresse?: string[];
}

export interface LignePiece {
  designation: string;
  quantite?: string;
  prixUnitaire?: Centimes;
  montant: Centimes;
}

export interface TotalPiece {
  libelle: string;
  montant: Centimes;
  fort?: boolean;
}

export interface PieceComptable {
  type: TypePiece;
  titre: string;
  numero?: string;
  date: DateISO;
  emetteur: Partie;
  destinataire?: Partie;
  /** Paragraphes de texte (notes internes, quittances, procès-verbaux). */
  texte?: string[];
  lignes: LignePiece[];
  totaux: TotalPiece[];
  /** Mentions en pied de pièce : conditions de paiement, compte, TVA comprise… */
  mentions?: string[];
}

const pc = (tauxDixiemes: number) => `${(tauxDixiemes / 10).toFixed(1).replace('.', ',')} %`;

// ---------- Facture ----------

export interface ArticleFacture {
  designation: string;
  quantite?: number;
  prixUnitaire: Centimes;
}

export interface Facture {
  piece: PieceComptable;
  ht: Centimes;
  tva: Centimes;
  ttc: Centimes;
}

/** Facture avec montants hors taxe ; TVA ajoutée si un taux est donné (en dixièmes de %, 8,1 % = 81). */
export function facture(o: {
  emetteur: Partie;
  destinataire: Partie;
  numero: string;
  date: DateISO;
  articles: ArticleFacture[];
  tauxTva?: number | null;
  mentions?: string[];
  titre?: string;
}): Facture {
  const lignes = o.articles.map((a) => {
    const q = a.quantite ?? 1;
    return {
      designation: a.designation,
      quantite: a.quantite !== undefined ? String(a.quantite) : undefined,
      prixUnitaire: a.quantite !== undefined ? a.prixUnitaire : undefined,
      montant: q * a.prixUnitaire,
    };
  });
  const ht = lignes.reduce((s, l) => s + l.montant, 0);
  const tva = o.tauxTva ? tvaSurHT(ht, o.tauxTva) : 0;
  const ttc = ht + tva;
  const totaux: TotalPiece[] = o.tauxTva
    ? [
        { libelle: 'Total hors TVA', montant: ht },
        { libelle: `TVA ${pc(o.tauxTva)}`, montant: tva },
        { libelle: 'Total à payer', montant: ttc, fort: true },
      ]
    : [{ libelle: 'Total à payer', montant: ttc, fort: true }];
  return {
    piece: {
      type: 'facture',
      titre: o.titre ?? 'FACTURE',
      numero: o.numero,
      date: o.date,
      emetteur: o.emetteur,
      destinataire: o.destinataire,
      lignes,
      totaux,
      mentions: o.mentions,
    },
    ht,
    tva,
    ttc,
  };
}

// ---------- Ticket de caisse ou rapport de caisse (montants TVA comprise) ----------

export function ticket(o: {
  emetteur: Partie;
  date: DateISO;
  numero?: string;
  titre?: string;
  articles: { designation: string; montant: Centimes }[];
  tauxTva?: number | null;
  mentions?: string[];
}): { piece: PieceComptable; ttc: Centimes; tva: Centimes; ht: Centimes } {
  const ttc = o.articles.reduce((s, a) => s + a.montant, 0);
  const tva = o.tauxTva ? tvaSurTTC(ttc, o.tauxTva) : 0;
  const mentions = [...(o.tauxTva ? [`TVA ${pc(o.tauxTva)} comprise : CHF ${(tva / 100).toFixed(2)}`] : []), ...(o.mentions ?? [])];
  return {
    piece: {
      type: 'ticket',
      titre: o.titre ?? 'TICKET DE CAISSE',
      numero: o.numero,
      date: o.date,
      emetteur: o.emetteur,
      lignes: o.articles.map((a) => ({ designation: a.designation, montant: a.montant })),
      totaux: [{ libelle: 'Total payé', montant: ttc, fort: true }],
      mentions,
    },
    ttc,
    tva,
    ht: ttc - tva,
  };
}

// ---------- Quittance ----------

export function quittance(o: {
  emetteur: Partie;
  destinataire?: Partie;
  date: DateISO;
  numero?: string;
  titre?: string;
  texte: string[];
  montant: Centimes;
  mentions?: string[];
}): { piece: PieceComptable; montant: Centimes } {
  return {
    piece: {
      type: 'quittance',
      titre: o.titre ?? 'QUITTANCE',
      numero: o.numero,
      date: o.date,
      emetteur: o.emetteur,
      destinataire: o.destinataire,
      texte: o.texte,
      lignes: [],
      totaux: [{ libelle: 'Montant', montant: o.montant, fort: true }],
      mentions: o.mentions,
    },
    montant: o.montant,
  };
}

// ---------- Avis bancaire ----------

export function avisBancaire(o: {
  sens: 'debit' | 'credit';
  banque: Partie;
  titulaire: Partie;
  compte: string;
  date: DateISO;
  numero?: string;
  operations: { designation: string; montant: Centimes }[];
  mentions?: string[];
}): { piece: PieceComptable; total: Centimes } {
  const total = o.operations.reduce((s, x) => s + x.montant, 0);
  return {
    piece: {
      type: o.sens === 'debit' ? 'avis-debit' : 'avis-credit',
      titre: o.sens === 'debit' ? 'AVIS DE DÉBIT' : 'AVIS DE CRÉDIT',
      numero: o.numero,
      date: o.date,
      emetteur: o.banque,
      destinataire: o.titulaire,
      lignes: o.operations.map((x) => ({ designation: x.designation, montant: x.montant })),
      totaux: [{ libelle: o.sens === 'debit' ? 'Montant débité' : 'Montant crédité', montant: total, fort: true }],
      mentions: [`Compte : ${o.compte}`, ...(o.mentions ?? [])],
    },
    total,
  };
}

// ---------- Fiche de salaire ----------

export interface RetenueSalaire {
  libelle: string;
  /** Taux en centièmes de pour cent (5,30 % = 530) ; absent pour un montant fixe. */
  taux?: number;
  montant?: Centimes;
}

export function ficheSalaire(o: {
  employeur: Partie;
  employe: Partie;
  periode: string;
  date: DateISO;
  brut: Centimes;
  retenues: RetenueSalaire[];
  mentions?: string[];
}): { piece: PieceComptable; brut: Centimes; retenues: { libelle: string; montant: Centimes }[]; totalRetenues: Centimes; net: Centimes } {
  const retenues = o.retenues.map((r) => ({
    libelle: r.taux !== undefined ? `${r.libelle} ${(r.taux / 100).toFixed(2).replace('.', ',')} %` : r.libelle,
    montant: r.taux !== undefined ? montantRetenue(o.brut, r.taux) : (r.montant ?? 0),
  }));
  const totalRetenues = retenues.reduce((s, r) => s + r.montant, 0);
  const net = o.brut - totalRetenues;
  return {
    piece: {
      type: 'fiche-salaire',
      titre: `DÉCOMPTE DE SALAIRE — ${o.periode}`,
      date: o.date,
      emetteur: o.employeur,
      destinataire: o.employe,
      lignes: [
        { designation: 'Salaire brut', montant: o.brut },
        ...retenues.map((r) => ({ designation: `./. ${r.libelle}`, montant: r.montant })),
      ],
      totaux: [
        { libelle: 'Total des retenues', montant: totalRetenues },
        { libelle: 'Salaire net versé', montant: net, fort: true },
      ],
      mentions: o.mentions,
    },
    brut: o.brut,
    retenues,
    totalRetenues,
    net,
  };
}

// ---------- Note interne (opérations de clôture, décisions) ----------

export function noteInterne(o: {
  emetteur: Partie;
  destinataire?: Partie;
  date: DateISO;
  titre?: string;
  numero?: string;
  texte: string[];
  lignes?: LignePiece[];
  totaux?: TotalPiece[];
  mentions?: string[];
}): { piece: PieceComptable } {
  return {
    piece: {
      type: 'note-interne',
      titre: o.titre ?? 'NOTE INTERNE',
      numero: o.numero,
      date: o.date,
      emetteur: o.emetteur,
      destinataire: o.destinataire,
      texte: o.texte,
      lignes: o.lignes ?? [],
      totaux: o.totaux ?? [],
      mentions: o.mentions,
    },
  };
}

// ---------- Avis de dividende (titres détenus) ----------

export function avisDividende(o: {
  banque: Partie;
  titulaire: Partie;
  compte: string;
  date: DateISO;
  valeur: string;
  quantite: number;
  dividendeParTitre: Centimes;
}): { piece: PieceComptable; brut: Centimes; impotAnticipe: Centimes; net: Centimes } {
  const brut = o.quantite * o.dividendeParTitre;
  const impotAnticipe = arrondi5(Math.round((brut * TAUX_IMPOT_ANTICIPE) / 100));
  const net = brut - impotAnticipe;
  return {
    piece: {
      type: 'avis-dividende',
      titre: 'AVIS DE DIVIDENDE',
      date: o.date,
      emetteur: o.banque,
      destinataire: o.titulaire,
      lignes: [
        { designation: `${o.valeur} — dividende brut`, quantite: String(o.quantite), prixUnitaire: o.dividendeParTitre, montant: brut },
        { designation: `./. Impôt anticipé ${TAUX_IMPOT_ANTICIPE} %`, montant: impotAnticipe },
      ],
      totaux: [{ libelle: 'Montant net crédité', montant: net, fort: true }],
      mentions: [`Crédité sur le compte ${o.compte}`],
    },
    brut,
    impotAnticipe,
    net,
  };
}
