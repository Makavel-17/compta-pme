// Théorie : rappels de cours rédigés pour l'application, en nos propres mots.
// Les manuels E&S (CREME-CIIP) sont protégés : aucune phrase, aucun exemple ni exercice n'en est repris.
// Numéros et intitulés de comptes : plan du cours (src/data/plan-pme.csv). Montants des exemples en francs.
// Contenu PROPOSÉ, à faire relire par l'enseignant (voir THEORIE_VALIDEE).

import type { Niveau } from '../engine/plan';
import { RATIOS } from '../engine/analyse';

/** Passe à true une fois le contenu relu et validé par l'enseignant (retire la mention « proposé »). */
export const THEORIE_VALIDEE = false;

/** Ligne d'un exemple d'écriture : une ligne simple (débit et crédit) ou une ligne d'écriture composée (un seul côté). */
export interface LigneExemple {
  debit: string | null;
  credit: string | null;
  montant: number;
}

export interface ExempleEcriture {
  cas: string;
  lignes: LigneExemple[];
}

export type Bloc =
  | { type: 'p'; texte: string }
  | { type: 'liste'; items: string[] }
  | { type: 'ecritures'; titre?: string; exemples: ExempleEcriture[] }
  | { type: 'tableau'; entetes: string[]; lignes: string[][] }
  | { type: 'retenir'; texte: string };

export interface Section {
  titre: string;
  blocs: Bloc[];
}

export interface Chapitre {
  id: string;
  titre: string;
  /** Niveau à partir duquel le chapitre est affiché (CFC1 ⊂ CFC2 ⊂ MP). */
  niveau: Niveau;
  resume: string;
  bases?: string[];
  sections: Section[];
}

const s = (debit: string, credit: string, montant: number): LigneExemple[] => [{ debit, credit, montant }];
const D = (compte: string, montant: number): LigneExemple => ({ debit: compte, credit: null, montant });
const C = (compte: string, montant: number): LigneExemple => ({ debit: null, credit: compte, montant });

export const CHAPITRES: Chapitre[] = [
  // ───────────────────────────── CFC 1 ─────────────────────────────
  {
    id: 'bilan',
    titre: 'Le bilan',
    niveau: 'CFC1',
    resume: "Ce que l'entreprise possède et comment elle le finance, à une date précise.",
    bases: ['CO art. 957 ss (obligation de tenir une comptabilité)', 'CO art. 959a (structure minimale du bilan)'],
    sections: [
      {
        titre: 'À quoi sert le bilan ?',
        blocs: [
          {
            type: 'p',
            texte:
              "Le bilan est une photographie du patrimoine de l'entreprise à un jour donné, par exemple au 31 décembre. " +
              "À gauche, l'actif montre comment les fonds sont utilisés : argent, créances, marchandises, machines, " +
              "véhicules. À droite, le passif montre d'où viennent ces fonds : dettes envers des tiers (capitaux étrangers) " +
              "et apport du propriétaire (capitaux propres).",
          },
          { type: 'retenir', texte: "Le total de l'actif est toujours égal au total du passif." },
          {
            type: 'p',
            texte:
              "Une entreprise individuelle ou une société de personnes dont le chiffre d'affaires atteint 500'000 francs " +
              "doit tenir une comptabilité complète et établir un bilan (CO art. 957). En dessous de ce seuil, une simple " +
              'comptabilité des recettes et des dépenses suffit.',
          },
        ],
      },
      {
        titre: 'Ordre des postes',
        blocs: [
          {
            type: 'p',
            texte:
              "Selon CO art. 959a, l'actif se divise en actifs circulants (liquidités, créances, stocks, actifs " +
              'transitoires) et actifs immobilisés (machines, mobilier, véhicules, immeubles). On classe les actifs ' +
              "du plus liquide au moins liquide. Le passif se divise en capitaux étrangers à court terme, capitaux " +
              "étrangers à long terme et capitaux propres ; on les classe du plus exigible au moins exigible.",
          },
          {
            type: 'tableau',
            entetes: ['Actif', 'Passif'],
            lignes: [
              ['Actifs circulants : Caisse, Poste, Banque, Créances clients, Stock de marchandises', 'Capitaux étrangers à court terme : Dettes fournisseurs, Autres dettes, Banque (n/dette)'],
              ['Actifs immobilisés : Machines et appareils, Mobilier et installations, Véhicules, Immeubles', 'Capitaux étrangers à long terme : Emprunt bancaire à long terme, Dettes hypothécaires'],
              ['', 'Capitaux propres : Capital (et Privé pour la raison individuelle)'],
            ],
          },
        ],
      },
      {
        titre: 'Bénéfice ou perte avant bouclement',
        blocs: [
          {
            type: 'p',
            texte:
              "Si le bilan est établi avant le bouclement, le résultat de l'exercice y figure sur une ligne séparée. " +
              "Un bénéfice augmente les capitaux propres : il apparaît au passif. Une perte, dans cette application, " +
              "figure du côté de l'actif, sur sa propre ligne, pour que le bilan reste équilibré.",
          },
        ],
      },
    ],
  },
  {
    id: 'comptes',
    titre: 'Les comptes et les règles du débit et du crédit',
    niveau: 'CFC1',
    resume: "Chaque poste a son compte ; le type de compte dit de quel côté il augmente.",
    sections: [
      {
        titre: 'Le compte en T',
        blocs: [
          {
            type: 'p',
            texte:
              "Un compte enregistre les augmentations et les diminutions d'un poste. On le dessine comme un T : " +
              "le côté gauche s'appelle le débit, le côté droit le crédit. Le solde est la différence entre les deux " +
              'côtés ; on l\'inscrit du côté le plus faible pour équilibrer le compte.',
          },
          {
            type: 'p',
            texte:
              "Abréviations utilisées : SI (solde initial) et SF (solde final). Selon le choix de l'enseignant, on " +
              'peut aussi rencontrer San (solde à nouveau) et Spb (solde pour bilan).',
          },
        ],
      },
      {
        titre: 'Les quatre types de comptes',
        blocs: [
          {
            type: 'tableau',
            entetes: ['Type de compte', 'Solde initial', 'Augmentation', 'Diminution', 'Solde final'],
            lignes: [
              ['Actif (classe 1)', 'au débit', 'au débit', 'au crédit', 'au crédit'],
              ['Passif (classe 2)', 'au crédit', 'au crédit', 'au débit', 'au débit'],
              ['Charge (classes 4 à 8)', '—', 'au débit', 'au crédit (rare)', 'au crédit'],
              ['Produit (classes 3 et 8)', '—', 'au crédit', 'au débit (rare)', 'au débit'],
            ],
          },
          {
            type: 'p',
            texte:
              "Les comptes de bilan (actifs et passifs) reprennent le solde de l'exercice précédent. Les comptes de " +
              "résultat (charges et produits) partent de zéro à chaque exercice : ils mesurent ce qui a été consommé " +
              'ou gagné pendant la période.',
          },
          {
            type: 'retenir',
            texte: 'Chaque opération touche au moins deux comptes : le montant inscrit au débit est égal au montant inscrit au crédit.',
          },
        ],
      },
    ],
  },
  {
    id: 'journal',
    titre: 'Le journal et les écritures',
    niveau: 'CFC1',
    resume: 'Écriture simple, écriture composée, et correction par extourne.',
    sections: [
      {
        titre: "Lire et rédiger une écriture",
        blocs: [
          {
            type: 'p',
            texte:
              "Le journal enregistre toutes les opérations dans l'ordre chronologique. Chaque écriture indique la date, " +
              'le numéro de pièce justificative, un libellé court, le compte débité, le compte crédité et le montant. ' +
              "Pour trouver l'écriture, posez-vous deux questions : quels comptes sont touchés ? Chacun augmente-t-il ou diminue-t-il ?",
          },
          {
            type: 'ecritures',
            titre: 'Écritures simples (un compte au débit, un compte au crédit)',
            exemples: [
              { cas: 'Le propriétaire verse de la caisse 2\'000.00 sur le compte bancaire', lignes: s('1020', '1000', 2000) },
              { cas: 'Achat de marchandises à crédit, 3\'500.00', lignes: s('4200', '2000', 3500) },
              { cas: 'Vente de marchandises au comptant, 900.00', lignes: s('1000', '3200', 900) },
              { cas: 'Paiement du loyer par la banque, 1\'400.00', lignes: s('6000', '1020', 1400) },
            ],
          },
        ],
      },
      {
        titre: 'Écriture composée',
        blocs: [
          {
            type: 'p',
            texte:
              "Lorsqu'une opération touche plus de deux comptes, on passe une écriture composée : plusieurs lignes au " +
              'débit et/ou plusieurs lignes au crédit. Le total des débits doit égaler le total des crédits.',
          },
          {
            type: 'ecritures',
            exemples: [
              {
                cas: "Achat d'une machine de 8'000.00 : 3'000.00 payés par la banque, le solde à crédit",
                lignes: [D('1500', 8000), C('1020', 3000), C('2000', 5000)],
              },
            ],
          },
        ],
      },
      {
        titre: "Corriger une écriture : l'extourne",
        blocs: [
          {
            type: 'p',
            texte:
              "Une écriture validée ne s'efface pas. Pour la corriger, on l'extourne : on passe la même écriture avec le " +
              "débit et le crédit inversés, sous le même numéro de pièce. L'écriture fausse est ainsi annulée, et on " +
              'passe ensuite l\'écriture juste. Le journal garde la trace de la correction.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Écriture fausse : loyer comptabilisé au débit de Publicité', lignes: s('6600', '1020', 1400) },
              { cas: 'Extourne (même pièce)', lignes: s('1020', '6600', 1400) },
              { cas: 'Écriture juste', lignes: s('6000', '1020', 1400) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'resultat',
    titre: 'Compte de résultat, compte privé et bouclement',
    niveau: 'CFC1',
    resume: "Calculer le bénéfice ou la perte, puis boucler l'exercice d'une raison individuelle.",
    bases: ['CO art. 959b (structure minimale du compte de résultat)'],
    sections: [
      {
        titre: 'Le compte de résultat',
        blocs: [
          {
            type: 'p',
            texte:
              "Le compte de résultat oppose les charges (consommations de l'exercice : achats de marchandises, salaires, " +
              "loyers, énergie…) aux produits (ventes, prestations). Si les produits dépassent les charges, l'entreprise " +
              "réalise un bénéfice ; dans le cas contraire, elle subit une perte. Il est présenté ici en forme de compte, " +
              'les charges à gauche, les produits à droite (CO art. 959b, adapté au niveau).',
          },
          { type: 'retenir', texte: 'Le bénéfice du compte de résultat est le même que la différence qui apparaît au bilan.' },
        ],
      },
      {
        titre: 'Le compte privé de la raison individuelle',
        blocs: [
          {
            type: 'p',
            texte:
              "Le propriétaire d'une raison individuelle ne reçoit pas de salaire de son entreprise : il y prélève de " +
              "l'argent ou des biens pour ses besoins personnels. Ces prélèvements se comptabilisent au débit du compte " +
              '2850 Privé, un compte de capitaux propres. En fin d\'exercice, le solde du compte privé est viré au capital.',
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Le propriétaire prélève 500.00 en espèces pour ses besoins privés', lignes: s('2850', '1000', 500) }],
          },
        ],
      },
      {
        titre: 'Le bouclement par le compte 9000',
        blocs: [
          {
            type: 'p',
            texte:
              "À la fin de l'exercice, on solde les comptes de charges et de produits par le compte 9000 Compte de résultat. " +
              "Le compte en T 9000 reproduit alors le compte de résultat. Les écritures de bouclement portent les pièces " +
              'B1, B2, B3…, dans cet ordre :',
          },
          {
            type: 'liste',
            items: [
              'virer le solde du compte privé au capital ;',
              'solder chaque compte de charges et de produits par le compte 9000 ;',
              'virer le solde du compte 9000 (bénéfice ou perte) au capital.',
            ],
          },
          {
            type: 'ecritures',
            titre: 'Exemple (montants fictifs)',
            exemples: [
              { cas: 'B1 — Virement du compte privé au capital', lignes: s('2800', '2850', 6000) },
              { cas: 'B2 — Clôture des charges', lignes: [D('9000', 52000), C('4200', 30000), C('5200', 15000), C('6000', 7000)] },
              { cas: 'B2 — Clôture des produits', lignes: s('3200', '9000', 61000) },
              { cas: "B3 — Bénéfice de l'exercice viré au capital", lignes: s('9000', '2800', 9000) },
            ],
          },
          {
            type: 'p',
            texte:
              "Variante possible selon l'exercice : sans écritures de bouclement, le résultat et le compte privé sont " +
              "intégrés au capital lors de la réouverture de l'exercice suivant.",
          },
        ],
      },
    ],
  },
  {
    id: 'marchandises',
    titre: 'Marchandises et stock',
    niveau: 'CFC1',
    resume: 'Achats, ventes, marge brute et variation du stock.',
    sections: [
      {
        titre: 'Achats et ventes',
        blocs: [
          {
            type: 'p',
            texte:
              "Les achats de marchandises sont une charge (4200 Achats de marchandises) ; les ventes sont un produit " +
              "(3200 Ventes de marchandises). Pendant l'exercice, on ne touche pas au compte 1200 Stock de marchandises : " +
              'il garde la valeur du dernier inventaire.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Achat de marchandises à crédit, 6\'000.00', lignes: s('4200', '2000', 6000) },
              { cas: 'Vente de marchandises à crédit, 9\'500.00', lignes: s('1100', '3200', 9500) },
            ],
          },
        ],
      },
      {
        titre: "Variation du stock en fin d'exercice",
        blocs: [
          {
            type: 'p',
            texte:
              "À la clôture, on compte les marchandises restantes (inventaire). La différence entre le stock final et " +
              "le stock initial s'appelle la variation de stock. Elle corrige la charge de marchandises : si le stock " +
              "augmente, une partie des achats n'a pas été vendue ; s'il diminue, on a vendu plus que ce qu'on a acheté.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Augmentation du stock de 1'200.00", lignes: s('1200', '4280', 1200) },
              { cas: 'Diminution du stock de 800.00', lignes: s('4280', '1200', 800) },
            ],
          },
          {
            type: 'p',
            texte:
              "Prix de revient des marchandises vendues = achats − augmentation du stock (ou + diminution du stock). " +
              'Marge brute = ventes − prix de revient des marchandises vendues.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── CFC 2 ─────────────────────────────
  {
    id: 'tva',
    titre: 'TVA — méthode effective',
    niveau: 'CFC2',
    resume: 'TVA due sur les ventes, impôt préalable sur les achats, décompte et paiement à l\'AFC.',
    bases: ['Loi fédérale régissant la taxe sur la valeur ajoutée (LTVA)'],
    sections: [
      {
        titre: 'Principe',
        blocs: [
          {
            type: 'p',
            texte:
              "L'entreprise assujettie facture la TVA à ses clients : c'est la TVA due, qu'elle doit verser à " +
              "l'Administration fédérale des contributions (AFC). Elle paie elle-même la TVA à ses fournisseurs : c'est " +
              "l'impôt préalable (IP), qu'elle peut déduire. Elle verse donc à l'AFC la différence entre les deux.",
          },
          {
            type: 'tableau',
            entetes: ['Taux', 'Application'],
            lignes: [
              ['8,1 %', 'taux normal (la plupart des biens et des services)'],
              ['2,6 %', 'taux réduit (notamment denrées alimentaires, livres, médicaments)'],
              ['3,8 %', "taux spécial pour l'hébergement"],
            ],
          },
          {
            type: 'p',
            texte:
              "Calcul : TVA = montant hors taxe × taux. À partir d'un montant TTC : TVA = TTC × taux / (100 % + taux). " +
              'Les montants de TVA sont arrondis aux 5 centimes.',
          },
        ],
      },
      {
        titre: 'Comptes utilisés',
        blocs: [
          {
            type: 'liste',
            items: [
              '2200 TVA due : TVA facturée aux clients (passif) ;',
              '1170 IP s/marchandises et services : impôt préalable sur les achats de marchandises et de services (actif) ;',
              "1171 IP s/investissements et AGE : impôt préalable sur les investissements et les autres charges d'exploitation (actif) ;",
              "2205 Dettes AFC : montant à verser à l'AFC après le décompte.",
            ],
          },
        ],
      },
      {
        titre: 'Comptabilisation au net',
        blocs: [
          {
            type: 'p',
            texte:
              "Au net, la TVA est séparée à chaque opération : le compte de charge ou de produit reçoit le montant hors " +
              'taxe, la TVA va directement dans son propre compte.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Vente à crédit, 2'000.00 + TVA 8,1 %", lignes: [D('1100', 2162), C('3200', 2000), C('2200', 162)] },
              { cas: "Achat de marchandises à crédit, 1'000.00 + TVA 8,1 %", lignes: [D('4200', 1000), D('1170', 81), C('2000', 1081)] },
              { cas: 'Facture de réparation payée par la banque, 400.00 + TVA 8,1 %', lignes: [D('6100', 400), D('1171', 32.4), C('1020', 432.4)] },
            ],
          },
        ],
      },
      {
        titre: 'Comptabilisation au brut',
        blocs: [
          {
            type: 'p',
            texte:
              "Au brut, on comptabilise les montants TVA comprise dans les comptes de charges et de produits. En fin de " +
              "période, on extrait la TVA contenue dans ces comptes et on la vire dans les comptes de TVA.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Vente à crédit, 2'162.00 TVA comprise", lignes: s('1100', '3200', 2162) },
              { cas: 'Fin de période : TVA contenue dans les ventes', lignes: s('3200', '2200', 162) },
              { cas: "Achat à crédit, 1'081.00 TVA comprise", lignes: s('4200', '2000', 1081) },
              { cas: 'Fin de période : impôt préalable contenu dans les achats', lignes: s('1170', '4200', 81) },
            ],
          },
        ],
      },
      {
        titre: 'Décompte et paiement',
        blocs: [
          {
            type: 'p',
            texte:
              "À la fin de chaque période (en général le trimestre), on établit le décompte : TVA due − impôt préalable. " +
              "On vire l'impôt préalable en diminution de la TVA due, puis le solde dans le compte 2205 Dettes AFC, " +
              "qui est réglé ensuite par la banque.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Virement de l\'impôt préalable s/marchandises', lignes: s('2200', '1170', 81) },
              { cas: 'Virement de l\'impôt préalable s/investissements et AGE', lignes: s('2200', '1171', 32.4) },
              { cas: 'Solde de la TVA due viré à l\'AFC', lignes: s('2200', '2205', 48.6) },
              { cas: "Paiement à l'AFC", lignes: s('2205', '1020', 48.6) },
            ],
          },
          {
            type: 'p',
            texte: "Les trois premières lignes peuvent aussi être passées en une seule écriture composée.",
          },
        ],
      },
    ],
  },
  {
    id: 'amortissements',
    titre: 'Amortissements',
    niveau: 'CFC2',
    resume: 'Répartir le coût des immobilisations sur leur durée d\'utilisation.',
    sections: [
      {
        titre: 'Pourquoi amortir ?',
        blocs: [
          {
            type: 'p',
            texte:
              "Une machine, un véhicule ou du mobilier perdent de la valeur avec l'usage et le temps. L'amortissement " +
              "enregistre cette perte de valeur comme une charge de l'exercice (6800 Amortissements) et réduit la valeur " +
              'de l\'immobilisation au bilan.',
          },
        ],
      },
      {
        titre: 'Calcul : linéaire ou dégressif',
        blocs: [
          {
            type: 'tableau',
            entetes: ['Méthode', 'Base de calcul', "Conséquence"],
            lignes: [
              ['Linéaire', "valeur d'acquisition × taux", 'même montant chaque année'],
              ['Dégressif', 'valeur comptable au début de l\'exercice × taux', 'montant qui diminue chaque année'],
            ],
          },
          {
            type: 'p',
            texte:
              "Prorata temporis : si l'immobilisation est achetée en cours d'exercice, on n'amortit que les mois " +
              "d'utilisation. Exemple : machine achetée le 1er avril, amortissement annuel 4'000.00 → 4'000.00 × 9 / 12 = 3'000.00.",
          },
        ],
      },
      {
        titre: 'Comptabilisation : directe ou indirecte',
        blocs: [
          {
            type: 'p',
            texte:
              "Méthode directe : l'amortissement est porté au crédit du compte de l'immobilisation, dont le solde " +
              'montre directement la valeur comptable.',
          },
          {
            type: 'p',
            texte:
              "Méthode indirecte : le compte de l'immobilisation garde la valeur d'acquisition ; les amortissements " +
              "s'accumulent dans un compte correctif d'actif, le fonds d'amortissements cumulés (FAC), dont le numéro se " +
              "termine par 9. Valeur comptable = valeur d'acquisition − FAC.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Méthode directe : amortissement du mobilier, 2'500.00", lignes: s('6800', '1510', 2500) },
              { cas: "Méthode indirecte : amortissement du mobilier, 2'500.00", lignes: s('6800', '1519', 2500) },
              { cas: "Méthode indirecte : amortissement du véhicule, 7'000.00", lignes: s('6800', '1539', 7000) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'transitoires',
    titre: 'Actifs et passifs transitoires',
    niveau: 'CFC2',
    resume: 'Rattacher chaque charge et chaque produit au bon exercice.',
    sections: [
      {
        titre: 'Principe',
        blocs: [
          {
            type: 'p',
            texte:
              "Le résultat d'un exercice ne doit contenir que les charges et les produits qui le concernent, quelle que " +
              "soit la date du paiement. Au bouclement, on corrige donc les montants payés ou encaissés à cheval sur deux " +
              'exercices, et ceux qui ne sont pas encore payés ou encaissés.',
          },
          {
            type: 'tableau',
            entetes: ['Situation au 31.12', 'Compte', 'Écriture'],
            lignes: [
              ["Charge payée d'avance (concerne l'exercice suivant)", '1300 Actifs transitoires', '1300 / compte de charge'],
              ['Produit à recevoir (gagné, pas encore encaissé)', '1300 Actifs transitoires', '1300 / compte de produit'],
              ['Charge à payer (consommée, pas encore payée)', '2300 Passifs transitoires', 'compte de charge / 2300'],
              ["Produit encaissé d'avance (concerne l'exercice suivant)", '2300 Passifs transitoires', 'compte de produit / 2300'],
            ],
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Prime d'assurance payée d'avance pour janvier à mars : 900.00", lignes: s('1300', '6300', 900) },
              { cas: "Facture d'électricité de décembre pas encore reçue : 350.00", lignes: s('6400', '2300', 350) },
            ],
          },
        ],
      },
      {
        titre: 'Extourne au 1er janvier',
        blocs: [
          {
            type: 'p',
            texte:
              "Au début de l'exercice suivant, vous extournez vous-même les écritures de régularisation : on passe " +
              "l'écriture inverse au 01.01. Le compte transitoire revient à zéro et la charge ou le produit se retrouve " +
              "dans l'exercice qu'il concerne.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "01.01 — Extourne de l'assurance payée d'avance", lignes: s('6300', '1300', 900) },
              { cas: "01.01 — Extourne de l'électricité à payer", lignes: s('2300', '6400', 350) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'creances',
    titre: 'Pertes sur créances, créances douteuses et ducroire',
    niveau: 'CFC2',
    resume: 'Quand un client ne paie pas, ou risque de ne pas payer.',
    sections: [
      {
        titre: 'Perte définitive',
        blocs: [
          {
            type: 'p',
            texte:
              "Lorsqu'une créance est définitivement perdue (faillite du client, acte de défaut de biens), on la sort " +
              'des créances clients et on enregistre une charge au compte 3805 Pertes s/créances. Dans ce cours, on ne ' +
              'corrige pas la TVA sur les pertes sur créances.',
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Créance de 1'500.00 définitivement perdue", lignes: s('3805', '1100', 1500) }],
          },
          {
            type: 'p',
            texte:
              "Si un client paie plus tard une créance déjà amortie, l'encaissement est un produit exceptionnel " +
              '(8510 Produits exceptionnels).',
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Encaissement par la banque de 400.00 sur une créance amortie l\'année précédente', lignes: s('1020', '8510', 400) }],
          },
        ],
      },
      {
        titre: 'Créances douteuses',
        blocs: [
          {
            type: 'p',
            texte:
              "Une créance dont le paiement devient incertain est isolée dans le compte 1108 Créances douteuses. Elle " +
              "n'est pas encore perdue : on la suit à part.",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Le client X est en difficulté ; sa créance de 2'000.00 devient douteuse", lignes: s('1108', '1100', 2000) }],
          },
        ],
      },
      {
        titre: 'Le ducroire',
        blocs: [
          {
            type: 'p',
            texte:
              "Le ducroire (1109) est un compte correctif d'actif : il estime en bloc les pertes probables sur les " +
              "créances clients, par exemple en pour cent des créances au 31.12. Il a un solde créditeur. Chaque année, " +
              "on ne comptabilise que la différence entre le ducroire nécessaire et le ducroire existant.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Augmentation du ducroire de 300.00', lignes: s('3805', '1109', 300) },
              { cas: 'Diminution du ducroire de 200.00', lignes: s('1109', '3805', 200) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'salaires',
    titre: 'Salaires et assurances sociales',
    niveau: 'CFC2',
    resume: 'Du salaire brut au salaire net, et les charges sociales de l\'employeur.',
    sections: [
      {
        titre: 'Du brut au net',
        blocs: [
          {
            type: 'p',
            texte:
              "L'employeur retient sur le salaire brut les cotisations dues par l'employé (AVS/AI/APG, assurance-chômage, " +
              "prévoyance professionnelle LPP, etc.) et ne verse que le salaire net. Les taux sont donnés par l'énoncé : " +
              'ils changent selon les années et les caisses.',
          },
          { type: 'retenir', texte: 'Salaire net = salaire brut − retenues. Le compte 5200 Salaires est débité du salaire brut.' },
        ],
      },
      {
        titre: 'Comptabilisation',
        blocs: [
          {
            type: 'p',
            texte:
              "Les retenues ne sont pas encore payées : ce sont des dettes envers chaque assurance (2170 Dette AVS, " +
              "2171 Dette LPP, …). L'employeur paie en plus ses propres cotisations, comptabilisées en charges sociales " +
              '(5270) et elles aussi portées en dette envers les assurances.',
          },
          {
            type: 'ecritures',
            titre: 'Exemple : salaire brut 6\'000.00, retenues AVS 384.00 et LPP 300.00',
            exemples: [
              { cas: 'Retenues sur le salaire', lignes: [D('5200', 684), C('2170', 384), C('2171', 300)] },
              { cas: 'Versement du salaire net par la banque', lignes: s('5200', '1020', 5316) },
              { cas: "Cotisations de l'employeur", lignes: [D('5270', 684), C('2170', 384), C('2171', 300)] },
              { cas: 'Paiement de la caisse AVS', lignes: s('2170', '1020', 768) },
            ],
          },
          {
            type: 'p',
            texte:
              "Les deux premières lignes peuvent être réunies en une écriture composée (5200 au débit pour le brut, les " +
              'dettes et la banque au crédit). Une avance accordée à un employé se comptabilise au compte 1140 Avances de salaire.',
          },
        ],
      },
    ],
  },

  // ───────────────────────────── MP ─────────────────────────────
  {
    id: 'societes',
    titre: 'Sociétés (SA, Sàrl) et répartition du bénéfice',
    niveau: 'MP',
    resume: 'Capitaux propres des sociétés, réserves, dividendes et impôt anticipé.',
    bases: [
      'CO art. 672 (attribution à la réserve légale issue du bénéfice, droit révisé en vigueur depuis 2023)',
      'CO art. 801 (Sàrl : règles de la SA applicables par analogie aux réserves)',
      "Loi fédérale sur l'impôt anticipé (LIA)",
    ],
    sections: [
      {
        titre: 'Les capitaux propres d\'une société',
        blocs: [
          {
            type: 'p',
            texte:
              "Dans une SA, le compte 2800 s'appelle Capital-actions ; dans une Sàrl, Capital social. Contrairement à la " +
              "raison individuelle, il n'y a pas de compte privé et le bénéfice n'est pas ajouté au capital : il est viré " +
              "au compte 2970 Bénéfice reporté, en attendant la décision de l'assemblée générale.",
          },
          {
            type: 'liste',
            items: [
              '2900 Réserves légales issues du capital ;',
              '2950 Réserves légales issues du bénéfice ;',
              '2960 Réserves libres ;',
              '2970 Bénéfice reporté (./. Perte reportée).',
            ],
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Bouclement : bénéfice de l'exercice, 50'000.00", lignes: s('9000', '2970', 50000) }],
          },
        ],
      },
      {
        titre: 'Répartition selon le droit révisé (art. 672 CO)',
        blocs: [
          {
            type: 'liste',
            items: [
              "Une perte reportée doit d'abord être compensée par le bénéfice.",
              "5 % du bénéfice (après compensation des pertes) sont attribués à la réserve légale issue du bénéfice.",
              "Cette attribution n'est plus obligatoire lorsque les réserves légales issues du capital et du bénéfice " +
                'atteignent ensemble 50 % du capital inscrit au registre du commerce (20 % pour une société holding).',
              "L'assemblée générale décide ensuite des dividendes, des éventuels tantièmes, des attributions aux réserves " +
                'libres ; le solde reste reporté.',
            ],
          },
          {
            type: 'retenir',
            texte: "L'ancienne règle (superdividende, art. 671 de l'ancien droit) ne s'applique plus.",
          },
        ],
      },
      {
        titre: 'Impôt anticipé sur les dividendes',
        blocs: [
          {
            type: 'p',
            texte:
              "La société retient 35 % d'impôt anticipé sur chaque dividende et le verse à l'AFC ; l'actionnaire ne reçoit " +
              'que 65 %. La retenue est une dette envers l\'AFC (2205 Dettes AFC).',
          },
          {
            type: 'ecritures',
            titre: "Exemple : bénéfice 40'000.00 (aucune perte reportée), réserve légale 5 % = 2'000.00, dividende 30'000.00",
            exemples: [
              { cas: "Décision de l'assemblée générale", lignes: [D('2970', 32000), C('2950', 2000), C('2230', 30000)] },
              { cas: 'Paiement des dividendes, impôt anticipé retenu', lignes: [D('2230', 30000), C('1020', 19500), C('2205', 10500)] },
              { cas: "Versement de l'impôt anticipé à l'AFC", lignes: s('2205', '1020', 10500) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'provisions',
    titre: 'Provisions',
    niveau: 'MP',
    resume: 'Prendre en compte une charge probable dont le montant ou l\'échéance est incertain.',
    sections: [
      {
        titre: 'Principe',
        blocs: [
          {
            type: 'p',
            texte:
              "Une provision est une dette probable : l'entreprise sait qu'une dépense va survenir à cause d'un fait de " +
              "l'exercice (réparation prévue, litige, impôts), mais le montant exact ou la date restent incertains. " +
              "On la constitue au débit du compte de charge par nature et au crédit d'un compte de provision (classe 26).",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Provision pour une grosse réparation prévue, 5'000.00", lignes: s('6100', '2600', 5000) },
              { cas: "Provision pour les impôts de l'exercice, 4'000.00", lignes: s('8900', '2640', 4000) },
            ],
          },
          {
            type: 'p',
            texte: "Lorsque la dépense survient, on la paie en débitant la provision constituée.",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Paiement de la réparation par la banque, 5'000.00", lignes: s('2600', '1020', 5000) }],
          },
        ],
      },
    ],
  },
  {
    id: 'titres',
    titre: 'Titres et produits financiers',
    niveau: 'MP',
    resume: 'Achat de titres, dividendes reçus, impôt anticipé à récupérer et évaluation au bilan.',
    sections: [
      {
        titre: 'Titres de placement',
        blocs: [
          {
            type: 'p',
            texte:
              "Les titres achetés comme placement à court terme vont au compte 1060 Titres de placement, au cours " +
              "d'achat. Les frais (courtage, commissions) sont une charge financière (6900).",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Achat de 100 actions à 80.00, courtage 120.00, par la banque", lignes: [D('1060', 8000), D('6900', 120), C('1020', 8120)] }],
          },
        ],
      },
      {
        titre: 'Dividendes reçus',
        blocs: [
          {
            type: 'p',
            texte:
              "Le dividende brut est un produit financier (6950). La banque ne crédite que 65 % ; les 35 % d'impôt " +
              "anticipé retenus sont récupérables auprès de l'AFC (1176 Créances AFC).",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Dividende brut de 200.00 crédité sous déduction de 35 %', lignes: [D('1020', 130), D('1176', 70), C('6950', 200)] }],
          },
        ],
      },
      {
        titre: 'Évaluation au 31.12',
        blocs: [
          {
            type: 'p',
            texte:
              "Les titres cotés sont évalués au cours du jour du bilan. Une baisse de cours est une charge financière, " +
              'une hausse un produit financier.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Baisse de valeur des titres, 500.00', lignes: s('6900', '1060', 500) },
              { cas: 'Hausse de valeur des titres, 300.00', lignes: s('1060', '6950', 300) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'interets',
    titre: 'Intérêts, frais bancaires, escomptes et frais d\'achat',
    niveau: 'MP',
    resume: 'Charges et produits financiers ; déductions accordées et obtenues.',
    sections: [
      {
        titre: 'Intérêts et frais bancaires',
        blocs: [
          {
            type: 'p',
            texte:
              "Intérêt = capital × taux × durée. Les intérêts payés et les frais bancaires vont au compte 6900 Charges " +
              'financières ; les intérêts reçus au compte 6950 Produits financiers.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Intérêt annuel de 2 % sur un emprunt de 50'000.00, débité par la banque", lignes: s('6900', '1020', 1000) },
              { cas: 'Frais de tenue de compte, 60.00', lignes: s('6900', '1020', 60) },
            ],
          },
        ],
      },
      {
        titre: 'Escomptes et rabais',
        blocs: [
          {
            type: 'p',
            texte:
              "Un escompte (paiement rapide) ou un rabais accordé à un client diminue le chiffre d'affaires : il va au " +
              "compte 3209 Déductions accordées. Un escompte obtenu d'un fournisseur va au compte 4209 Déductions " +
              "obtenues. Avec la TVA au net, la TVA est corrigée dans la même proportion.",
          },
          {
            type: 'ecritures',
            exemples: [
              {
                cas: "Le client règle une facture de 10'810.00 (10'000.00 + TVA 8,1 %) en déduisant 2 % d'escompte",
                lignes: [D('1020', 10593.8), D('3209', 200), D('2200', 16.2), C('1100', 10810)],
              },
              {
                cas: "Paiement d'une facture fournisseur de 10'810.00 (TVA 8,1 % comprise) sous déduction de 2 % d'escompte",
                lignes: [D('2000', 10810), C('1020', 10593.8), C('4209', 200), C('1170', 16.2)],
              },
            ],
          },
        ],
      },
      {
        titre: "Frais d'achat",
        blocs: [
          {
            type: 'p',
            texte: "Les frais liés à l'achat de marchandises (transport, douane) vont au compte 4270 Frais d'achats.",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Transport payé par la banque, 200.00 + TVA 8,1 %', lignes: [D('4270', 200), D('1170', 16.2), C('1020', 216.2)] }],
          },
        ],
      },
    ],
  },
  {
    id: 'analyse',
    titre: 'Analyse du bilan et du compte de résultat',
    niveau: 'MP',
    resume: 'Les ratios du cours, pour juger la liquidité, le financement et la rentabilité.',
    sections: [
      {
        titre: 'Les ratios',
        blocs: [
          {
            type: 'p',
            texte:
              "Les ratios comparent deux grandeurs du bilan ou du compte de résultat. Ils s'expriment en pour cent et " +
              "prennent leur sens en les comparant d'une année à l'autre ou avec d'autres entreprises de la branche.",
          },
          { type: 'tableau', entetes: ['Ratio', 'Formule'], lignes: RATIOS.map((r) => [r.libelle, r.formule]) },
          {
            type: 'p',
            texte:
              "Degré d'autofinancement : dans une société, le bénéfice de l'exercice est compris dans le numérateur " +
              "(il rejoint le bénéfice reporté) ; dans une raison individuelle, il ne l'est pas (il est viré au capital).",
          },
        ],
      },
    ],
  },
];

/** Chapitres visibles pour un niveau donné (CFC1 ⊂ CFC2 ⊂ MP). */
export function chapitresDuNiveau(niveau: Niveau): Chapitre[] {
  const ordre: Niveau[] = ['CFC1', 'CFC2', 'MP'];
  return CHAPITRES.filter((c) => ordre.indexOf(c.niveau) <= ordre.indexOf(niveau));
}
