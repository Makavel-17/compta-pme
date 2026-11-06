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
    id: 'cadre-legal',
    titre: 'Le cadre légal de la comptabilité',
    niveau: 'CFC1',
    resume: 'Qui doit tenir une comptabilité, selon quels principes, et combien de temps conserver les pièces.',
    bases: ['CO art. 957 à 958f (comptabilité commerciale et présentation des comptes)'],
    sections: [
      {
        titre: 'Qui doit tenir une comptabilité ?',
        blocs: [
          {
            type: 'p',
            texte:
              "Depuis 2015, c'est la taille de l'entreprise qui compte, plus sa forme juridique. Une raison individuelle " +
              "ou une société de personnes dont le chiffre d'affaires du dernier exercice dépasse 500'000 francs doit tenir " +
              "une comptabilité complète. Les personnes morales (SA, Sàrl, etc.) y sont toujours soumises, quelle que soit " +
              "leur taille (CO art. 957 al. 1).",
          },
          {
            type: 'p',
            texte:
              "En dessous de 500'000 francs, une raison individuelle peut se contenter d'une comptabilité des recettes, " +
              "des dépenses et du patrimoine (CO art. 957 al. 2). Elle doit tout de même être tenue avec soin.",
          },
        ],
      },
      {
        titre: 'Les principes de régularité',
        blocs: [
          {
            type: 'p',
            texte:
              'La comptabilité enregistre toutes les opérations qui permettent de connaître la situation économique de ' +
              "l'entreprise : son patrimoine, sa situation financière et ses résultats (CO art. 957a). Elle doit être :",
          },
          {
            type: 'liste',
            items: [
              'complète, fidèle et systématique : aucune opération n’est oubliée ni inventée ;',
              'justifiée : chaque écriture repose sur une pièce (facture, quittance, relevé bancaire…) ;',
              'claire et adaptée à la taille de l’entreprise ;',
              'traçable : on doit pouvoir remonter de l’écriture à la pièce, et inversement.',
            ],
          },
          {
            type: 'p',
            texte:
              "Pour établir les comptes annuels, le Code des obligations ajoute plusieurs principes (CO art. 958c), dont : " +
              "la clarté, l'intégralité, la fiabilité, l'importance relative, la prudence, la permanence des méthodes " +
              "d'une année à l'autre et l'interdiction de compenser des actifs avec des passifs ou des charges avec des produits.",
          },
          {
            type: 'retenir',
            texte:
              "Pas d'écriture sans pièce justificative. Les pièces et les comptes annuels se conservent 10 ans " +
              '(CO art. 958f).',
          },
        ],
      },
      {
        titre: "Continuité de l'exploitation et exercice comptable",
        blocs: [
          {
            type: 'p',
            texte:
              "Les comptes partent de l'idée que l'entreprise va poursuivre son activité (CO art. 958a). Ils sont " +
              "établis pour une période déterminée, en principe une année : l'exercice comptable (CO art. 958b). " +
              "Les charges et les produits sont rattachés à l'exercice qu'ils concernent, ce qui explique les écritures " +
              'de régularisation (transitoires) au bouclement.',
          },
        ],
      },
    ],
  },
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
      {
        titre: 'Inventaire intermittent ou permanent',
        blocs: [
          {
            type: 'p',
            texte:
              "Avec l'inventaire intermittent, utilisé dans le cours, les achats sont enregistrés directement en charge " +
              "(4200) et le stock n'est corrigé qu'une fois par an, après l'inventaire physique : on enregistre alors la " +
              'variation de stock.',
          },
          {
            type: 'p',
            texte:
              "Avec l'inventaire permanent, chaque entrée et chaque sortie de marchandises est enregistrée dans le compte de " +
              "stock au moment où elle a lieu. Le stock est donc connu à tout moment, mais la tenue demande un suivi " +
              "précis des quantités (en pratique, un logiciel de gestion des stocks).",
          },
          {
            type: 'retenir',
            texte:
              "Inventaire intermittent : le stock du bilan n'est juste qu'après l'écriture de variation de stock au bouclement.",
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
        titre: 'Qui paie la TVA ?',
        blocs: [
          {
            type: 'p',
            texte:
              "Une entreprise devient assujettie dès que son chiffre d'affaires soumis à la TVA atteint 100'000 francs " +
              "par an (LTVA art. 10). Certaines prestations sont exclues du champ de l'impôt (par exemple la plupart des " +
              "soins médicaux, de l'enseignement ou des locations d'immeubles) : elles ne portent pas de TVA et ne donnent " +
              "pas droit à la déduction de l'impôt préalable.",
          },
          {
            type: 'p',
            texte:
              "Les petites entreprises peuvent, à certaines conditions, choisir la méthode des taux de la dette fiscale " +
              "nette : elles appliquent un taux forfaitaire à leur chiffre d'affaires et ne déduisent pas l'impôt " +
              "préalable. Le cours travaille avec la méthode effective, présentée ci-dessous.",
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
      {
        titre: "Vente d'une immobilisation",
        blocs: [
          {
            type: 'p',
            texte:
              "Quand une immobilisation est vendue, on compare le prix de vente à sa valeur comptable (valeur " +
              "d'acquisition moins les amortissements cumulés). Si le prix est plus élevé, la vente dégage un bénéfice ; " +
              "s'il est plus bas, une perte. Avec la méthode indirecte, le compte FAC de l'objet vendu doit aussi être " +
              'soldé, puisque l’objet quitte le bilan.',
          },
          {
            type: 'retenir',
            texte:
              "Valeur comptable = valeur d'acquisition − amortissements cumulés. Le bénéfice sur la vente va en 8510 " +
              'Produits exceptionnels, la perte en 8500 Charges exceptionnelles.',
          },
          {
            type: 'ecritures',
            titre: 'Exemples (montants fictifs)',
            exemples: [
              {
                cas:
                  "Méthode indirecte : machine achetée 20'000.00, amortie de 15'000.00 (valeur comptable 5'000.00), vendue " +
                  "6'000.00 payés par la banque : bénéfice de 1'000.00.",
                lignes: [D('1020', 6000), D('1509', 15000), C('1500', 20000), C('8510', 1000)],
              },
              {
                cas:
                  "Méthode directe : véhicule d'une valeur comptable de 4'000.00, vendu 3'000.00 payés par la banque : " +
                  "perte de 1'000.00.",
                lignes: [D('1020', 3000), D('8500', 1000), C('1530', 4000)],
              },
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
    id: 'monnaies',
    titre: 'Monnaies étrangères',
    niveau: 'MP',
    resume: "Factures en euros ou en dollars : quel cours utiliser, et où passer la différence de change.",
    sections: [
      {
        titre: 'Cours achat et cours vente',
        blocs: [
          {
            type: 'p',
            texte:
              "La banque publie pour chaque monnaie deux cours : le cours achat, auquel elle achète la monnaie étrangère, " +
              "et le cours vente, auquel elle la vend. Les cours « devises » s'appliquent aux virements, les cours " +
              "« billets » aux espèces. Le cours est indiqué pour 1 unité (EUR, USD) ou pour 100 unités (JPY, SEK…).",
          },
          {
            type: 'liste',
            items: [
              "L'entreprise paie un fournisseur étranger : elle doit acheter la monnaie à la banque, donc au cours vente.",
              "Un client étranger paie l'entreprise : la banque lui achète la monnaie reçue, donc au cours achat.",
            ],
          },
          {
            type: 'retenir',
            texte: 'Montant en CHF = montant en monnaie étrangère × cours (÷ 100 si le cours est donné pour 100 unités).',
          },
        ],
      },
      {
        titre: 'Achat de marchandises à l’étranger',
        blocs: [
          {
            type: 'p',
            texte:
              "La facture est comptabilisée en CHF au cours du jour de la facture. Au paiement, le cours a souvent changé. " +
              "La différence entre le montant comptabilisé et le montant payé est passée dans le compte Achats de " +
              "marchandises : un gain de change diminue les achats, une perte de change les augmente.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Facture d'un fournisseur allemand, EUR 5'000.00 au cours vente de 0.96", lignes: s('4200', '2000', 4800) },
              {
                cas: 'Paiement par la banque au cours vente de 0.95 : gain de change de 50.00',
                lignes: [D('2000', 4800), C('1020', 4750), C('4200', 50)],
              },
            ],
          },
        ],
      },
      {
        titre: 'Vente de marchandises à l’étranger',
        blocs: [
          {
            type: 'p',
            texte:
              "La vente est comptabilisée au cours achat du jour de la facture. Si le cours baisse avant le paiement, " +
              "l'entreprise encaisse moins de francs : la perte de change diminue les ventes. Si le cours monte, le gain " +
              'de change augmente les ventes.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Facture à un client américain, USD 3'000.00 au cours achat de 0.88", lignes: s('1100', '3200', 2640) },
              {
                cas: 'Encaissement par la banque au cours achat de 0.86 : perte de change de 60.00',
                lignes: [D('1020', 2580), D('3200', 60), C('1100', 2640)],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'proprietaire',
    titre: 'Rémunération du propriétaire',
    niveau: 'MP',
    resume: "Dans une raison individuelle : salaire du propriétaire, intérêt sur son capital et revenu de l'entrepreneur.",
    sections: [
      {
        titre: 'Pourquoi des écritures internes ?',
        blocs: [
          {
            type: 'p',
            texte:
              "Le propriétaire d'une raison individuelle n'est pas un employé : sans écriture particulière, son travail et " +
              "le capital qu'il a investi ne coûtent rien à l'entreprise, et le bénéfice paraît plus élevé qu'il ne l'est. " +
              "Pour juger le résultat réel, on peut comptabiliser un salaire du propriétaire et un intérêt sur son capital. " +
              "Ces écritures sont internes et facultatives : aucun argent ne sort de l'entreprise, la contrepartie est le " +
              'compte Privé.',
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Salaire du propriétaire pour l'année, 60'000.00", lignes: s('5200', '2850', 60000) },
              { cas: "Intérêt de 5 % sur un capital de 80'000.00", lignes: s('6900', '2850', 4000) },
            ],
          },
        ],
      },
      {
        titre: "Le revenu de l'entrepreneur",
        blocs: [
          {
            type: 'p',
            texte:
              "Le propriétaire est rémunéré de trois façons : par son salaire (son travail), par l'intérêt (son capital) et " +
              "par le résultat (le risque qu'il prend). Leur somme est le revenu de l'entrepreneur ; elle ne dépend pas des " +
              "écritures internes, qui ne font que déplacer une partie du bénéfice vers le salaire et l'intérêt.",
          },
          {
            type: 'tableau',
            entetes: ['Élément', 'Montant CHF'],
            lignes: [
              ['Salaire du propriétaire', "60'000.00"],
              ['Intérêt sur le capital', "4'000.00"],
              ["Bénéfice de l'exercice", "15'000.00"],
              ["Revenu de l'entrepreneur", "79'000.00"],
            ],
          },
          {
            type: 'retenir',
            texte:
              "Les retraits du propriétaire se comptabilisent au débit du compte Privé ; le salaire et l'intérêt au crédit. " +
              'Au bouclement, le solde du compte Privé est viré au capital, comme le résultat.',
          },
        ],
      },
    ],
  },
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
        titre: "Fondation d'une SA",
        blocs: [
          {
            type: 'p',
            texte:
              "Le capital-actions d'une SA est d'au moins 100'000 francs. À la fondation, les actionnaires souscrivent les " +
              "actions, c'est-à-dire qu'ils s'engagent à les payer : la société a alors une créance envers eux (1850 " +
              "Actionnaires). Ils libèrent ensuite leurs actions, en espèces sur un compte bancaire ou en nature (machines, " +
              "véhicules, créances, marchandises). Chaque action doit être libérée à 20 % au moins, et 50'000 francs au " +
              "moins doivent être couverts par les apports. La part non libérée reste dans le compte Actionnaires.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Souscription de 200 actions de 1'000.00", lignes: s('1850', '2800', 200000) },
              { cas: "Libération en espèces versée à la banque, 120'000.00", lignes: s('1020', '1850', 120000) },
              { cas: "Apport d'une machine estimée à 40'000.00", lignes: s('1500', '1850', 40000) },
              {
                cas: "Apport de créances clients de 10'000.00, dont 5 % sont jugées douteuses",
                lignes: [D('1100', 10000), C('1109', 500), C('1850', 9500)],
              },
            ],
          },
          {
            type: 'p',
            texte:
              "Les frais de fondation (acte notarié, inscription au registre du commerce, honoraires pour les statuts et " +
              "le rapport de fondation, commission bancaire) sont une charge de l'exercice : compte 6550 FAO (frais de " +
              "fondation, d'augmentation de capital et d'organisation). Ils ne sont pas portés à l'actif.",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Facture du notaire pour l'acte constitutif, 2'800.00", lignes: s('6550', '2000', 2800) }],
          },
        ],
      },
      {
        titre: 'Augmentation du capital',
        blocs: [
          {
            type: 'p',
            texte:
              "Quand la société se porte bien, l'assemblée générale peut émettre de nouvelles actions au-dessus de leur " +
              "valeur nominale. La différence entre le prix d'émission et le nominal est la prime d'émission (agio) : elle " +
              "va aux réserves légales issues du capital (2900) et doit toujours être versée entièrement, même si le " +
              "nominal n'est libéré qu'en partie.",
          },
          {
            type: 'ecritures',
            exemples: [
              {
                cas: "Souscription de 100 actions de 1'000.00 émises à 1'150.00",
                lignes: [D('1850', 115000), C('2800', 100000), C('2900', 15000)],
              },
              { cas: 'Libération de 60 % du nominal et de la totalité de l’agio à la banque', lignes: s('1020', '1850', 75000) },
              { cas: "Frais de l'augmentation de capital payés par la banque, 3'200.00", lignes: s('6550', '1020', 3200) },
            ],
          },
          {
            type: 'p',
            texte:
              "La société peut aussi émettre des bons de participation (2810 Capital-participations, souscription à 1860 " +
              "Participants) : ils donnent droit au dividende, mais pas au vote. Le capital-participations ne peut pas " +
              'dépasser le double du capital-actions.',
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
              "Les titres achetés comme placement à court terme vont au compte 1060 Titres de placement, au prix payé : " +
              "cours × nombre de titres, frais d'achat (courtage, timbre, taxe de bourse) compris. Les charges liées aux " +
              'titres vont à 6940 Charges des titres, les produits à 6952 Produits des titres.',
          },
          {
            type: 'ecritures',
            exemples: [{ cas: "Achat de 100 actions à 80.00, frais 120.00, par la banque", lignes: s('1060', '1020', 8120) }],
          },
        ],
      },
      {
        titre: 'Dividendes reçus',
        blocs: [
          {
            type: 'p',
            texte:
              "Le dividende brut est un produit des titres (6952). La banque ne crédite que 65 % ; les 35 % d'impôt " +
              "anticipé retenus sont récupérables auprès de l'AFC (1176 Créances AFC).",
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Dividende brut de 200.00 crédité sous déduction de 35 %', lignes: [D('1020', 130), D('1176', 70), C('6952', 200)] }],
          },
        ],
      },
      {
        titre: 'Vente de titres',
        blocs: [
          {
            type: 'p',
            texte:
              "À la vente, la banque crédite le produit net : cours × nombre de titres, moins les frais de vente. On " +
              "crédite 1060 de ce montant net. Le bénéfice ou la perte de cours n'est pas calculé à ce moment : il " +
              'apparaît à la clôture, avec l’évaluation du portefeuille.',
          },
          {
            type: 'ecritures',
            exemples: [{ cas: 'Vente de 40 actions à 95.00, frais 60.00 : la banque crédite 3’740.00', lignes: s('1020', '1060', 3740) }],
          },
        ],
      },
      {
        titre: 'Clôture du compte Titres',
        blocs: [
          {
            type: 'p',
            texte:
              "Au 31.12, les titres restants sont inventoriés au cours du jour du bilan. La différence entre ce montant " +
              "et le solde du compte 1060 est une moins-value (6940 Charges des titres) ou une plus-value (6952 Produits " +
              "des titres). La moins-value doit toujours être comptabilisée ; la plus-value peut ne pas l'être (réserve latente).",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Solde de 1060 : 8’500.00, inventaire au cours de clôture : 8’000.00', lignes: s('6940', '1060', 500) },
              { cas: 'Solde de 1060 : 8’500.00, inventaire au cours de clôture : 8’800.00', lignes: s('1060', '6952', 300) },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'immeubles',
    titre: 'Immeubles',
    niveau: 'MP',
    resume: "Immeuble de l'entreprise aussi habité par le propriétaire : charges et produits d'immeubles, loyers internes, dette hypothécaire.",
    sections: [
      {
        titre: 'Trois situations',
        blocs: [
          {
            type: 'liste',
            items: [
              "Immeuble commercial : il sert seulement à l'activité. Ses charges sont des charges d'exploitation ordinaires (classes 5 et 6).",
              "Immeuble d'une raison individuelle aussi utilisé à des fins privées, l'usage commercial restant prépondérant : " +
                "ses charges et ses produits ont leurs propres comptes, 7510 Charges d'immeubles et 7500 Produits d'immeubles (activité annexe).",
              "Immeuble entièrement loué à des tiers : son résultat est hors exploitation (classe 8).",
            ],
          },
          {
            type: 'p',
            texte:
              "La suite de ce chapitre traite la deuxième situation. Le solde des deux comptes d'immeubles montre ce que " +
              "l'immeuble rapporte ou coûte à l'entreprise.",
          },
        ],
      },
      {
        titre: "Charges d'immeubles",
        blocs: [
          {
            type: 'p',
            texte:
              "Entretien et réparations, chauffage, électricité des parties communes, assurance du bâtiment, impôt foncier, " +
              "intérêts hypothécaires et amortissement de l'immeuble vont au débit de 7510. Une dépense qui augmente " +
              "durablement la valeur de l'immeuble (agrandissement, installation nouvelle) n'est pas une charge : elle est " +
              "portée au compte 1600 Immeubles.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: 'Facture du ramonage et de l’entretien de la chaudière, 680.00', lignes: s('7510', '2000', 680) },
              { cas: "Amortissement indirect de 1 % sur une valeur d'acquisition de 600'000.00", lignes: s('7510', '1609', 6000) },
              { cas: "Pose d'un ascenseur qui augmente la valeur du bâtiment, 45'000.00", lignes: s('1600', '2000', 45000) },
            ],
          },
        ],
      },
      {
        titre: 'Loyers internes',
        blocs: [
          {
            type: 'p',
            texte:
              "Pour connaître le vrai résultat de l'immeuble, on comptabilise à la clôture deux loyers qui ne donnent lieu à " +
              "aucun paiement : le loyer des locaux utilisés par l'entreprise elle-même, qui est une charge d'exploitation, et " +
              "la valeur locative du logement occupé par le propriétaire, qui est un prélèvement privé. Les loyers de " +
              "locataires tiers sont aussi des produits d'immeubles.",
          },
          {
            type: 'ecritures',
            exemples: [
              { cas: "Loyer annuel de l'atelier utilisé par l'entreprise, 24'000.00", lignes: s('6000', '7500', 24000) },
              { cas: "Valeur locative de l'appartement du propriétaire, 18'000.00", lignes: s('2850', '7500', 18000) },
            ],
          },
          {
            type: 'retenir',
            texte:
              "Le loyer interne de l'entreprise ne change pas le bénéfice : il déplace une charge de l'immeuble vers " +
              "l'exploitation. La valeur locative du propriétaire, elle, augmente le bénéfice et diminue le compte Privé.",
          },
        ],
      },
      {
        titre: 'Dette hypothécaire et annuité',
        blocs: [
          {
            type: 'p',
            texte:
              "L'annuité payée à la banque comprend l'intérêt hypothécaire, qui est une charge, et le remboursement d'une " +
              "partie de la dette (amortissement financier), qui diminue le compte 2401 Dettes hypothécaires. Avec une " +
              "annuité dégressive, le remboursement est constant et l'intérêt diminue chaque année ; avec une annuité " +
              "constante, le total payé reste le même et la part de remboursement augmente.",
          },
          {
            type: 'ecritures',
            exemples: [
              {
                cas: "Annuité sur une dette de 300'000.00 : intérêt 2 % et remboursement de 5'000.00, débités par la banque",
                lignes: [D('7510', 6000), D('2401', 5000), C('1020', 11000)],
              },
              { cas: "Intérêts courus du 01.07 au 31.12 sur 295'000.00 à 2 %, à la clôture", lignes: s('7510', '2300', 2950) },
            ],
          },
          {
            type: 'retenir',
            texte:
              "Intérêt hypothécaire : 6900 pour un immeuble commercial, 7510 pour un immeuble à usage mixte, compte de " +
              'charges hors exploitation pour un immeuble locatif.',
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
    id: 'evaluation',
    titre: "Principes d'évaluation et réserves latentes",
    niveau: 'MP',
    resume: 'Comment les actifs et les dettes sont évalués, et pourquoi le bilan publié peut sous-estimer la valeur réelle.',
    bases: ['CO art. 960 à 960e (évaluation)'],
    sections: [
      {
        titre: "Les règles d'évaluation",
        blocs: [
          {
            type: 'p',
            texte:
              "Un actif est inscrit au bilan au plus à son coût d'acquisition ou de fabrication (CO art. 960a). Par " +
              "prudence, il ne doit pas être surévalué : s'il perd de la valeur, on l'amortit ou on corrige sa valeur. " +
              'Les dettes sont inscrites à leur valeur nominale. Les risques futurs probables sont couverts par des provisions.',
          },
          {
            type: 'p',
            texte:
              "Les titres cotés en bourse font exception : ils peuvent être évalués au cours du jour du bilan (CO art. 960b).",
          },
        ],
      },
      {
        titre: 'Les réserves latentes',
        blocs: [
          {
            type: 'p',
            texte:
              "Une réserve latente (ou cachée) est la différence entre la valeur réelle d'un poste et sa valeur au bilan, " +
              "quand le bilan est volontairement prudent : un actif sous-évalué (stock, machine amortie plus que nécessaire) " +
              "ou une dette surévaluée (provision trop élevée). Elle n'apparaît pas dans les comptes publiés, d'où son nom.",
          },
          {
            type: 'liste',
            items: [
              'Constituer une réserve latente diminue le bénéfice publié (amortissement ou provision plus élevés).',
              'Dissoudre une réserve latente augmente le bénéfice publié, sans que l’entreprise ait réellement gagné plus.',
              "Le droit suisse les admet, mais une dissolution importante doit être signalée dans l'annexe aux comptes.",
            ],
          },
          {
            type: 'retenir',
            texte:
              'Bénéfice réel = bénéfice publié + constitution de réserves latentes − dissolution de réserves latentes.',
          },
        ],
      },
      {
        titre: "L'apurement",
        blocs: [
          {
            type: 'p',
            texte:
              "Pour analyser une entreprise, on « apure » ses comptes : on remplace les valeurs comptables prudentes par des " +
              "valeurs proches de la réalité (bilan interne). Les ratios calculés sur le bilan interne donnent une image " +
              'plus fidèle que ceux calculés sur le bilan publié (bilan externe).',
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
      {
        titre: 'Le compte de résultat à plusieurs degrés',
        blocs: [
          {
            type: 'p',
            texte:
              "Pour l'analyse, on présente le compte de résultat en cascade : chaque degré retire une catégorie de charges.",
          },
          {
            type: 'tableau',
            entetes: ['Degré', 'Calcul'],
            lignes: [
              ["Chiffre d'affaires net", "Ventes − déductions accordées − pertes sur créances"],
              ['Marge brute', "Chiffre d'affaires net − charges de marchandises"],
              ['EBITDA', 'Marge brute − charges de personnel − autres charges d’exploitation'],
              ['EBIT (résultat d’exploitation)', 'EBITDA − amortissements'],
              ['Bénéfice net', 'EBIT ± résultat financier ± résultats hors exploitation et exceptionnels − impôts'],
            ],
          },
        ],
      },
      {
        titre: 'Fonds de roulement',
        blocs: [
          {
            type: 'p',
            texte:
              "Le fonds de roulement est la part des actifs circulants financée par des capitaux à long terme : actifs " +
              "circulants − capitaux étrangers à court terme (ou, ce qui revient au même, capitaux permanents − actifs " +
              'immobilisés). Positif, il signifie que les dettes à court terme sont couvertes par des actifs qui se ' +
              'transformeront rapidement en argent.',
          },
        ],
      },
      {
        titre: "L'effet de levier",
        blocs: [
          {
            type: 'p',
            texte:
              "S'endetter peut augmenter la rentabilité des fonds propres : tant que l'argent emprunté rapporte plus " +
              "(rentabilité des capitaux investis) qu'il ne coûte (taux d'intérêt), le surplus revient aux propriétaires. " +
              "Mais l'effet joue aussi à l'envers : si la rentabilité tombe sous le taux d'intérêt, l'endettement fait " +
              'baisser la rentabilité des fonds propres. Plus le degré d’endettement est élevé, plus le risque est grand.',
          },
        ],
      },
      {
        titre: 'Le modèle DuPont',
        blocs: [
          {
            type: 'p',
            texte:
              "Le modèle DuPont décompose la rentabilité des capitaux investis (ROI) en deux facteurs : la marge " +
              "(EBIT / chiffre d'affaires) et la rotation des capitaux (chiffre d'affaires / actif). Une entreprise peut " +
              "être rentable avec une petite marge si elle vend beaucoup par rapport à ses capitaux, ou avec une rotation " +
              'lente si sa marge est élevée.',
          },
          { type: 'retenir', texte: "ROI = marge × rotation = (EBIT / chiffre d'affaires) × (chiffre d'affaires / actif)." },
        ],
      },
      {
        titre: 'Le cash-flow',
        blocs: [
          {
            type: 'p',
            texte:
              "Le cash-flow mesure l'argent dégagé par l'exploitation. Certaines charges ne provoquent aucune sortie " +
              "d'argent (amortissements, constitution de provisions) : on les ajoute donc au bénéfice. En version " +
              'simplifiée : cash-flow = bénéfice net + amortissements + constitution de provisions − dissolution de provisions.',
          },
          {
            type: 'p',
            texte:
              "Le cash-flow sert à financer les investissements, à rembourser les dettes et à verser les dividendes sans " +
              "recourir à de nouveaux capitaux (autofinancement).",
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

/**
 * Chapitre de théorie à revoir pour une opération, d'après les comptes de son corrigé (premier thème reconnu).
 * Sert au lien « Revoir la théorie » sous l'indice ; null si aucun chapitre du niveau ne correspond.
 */
const THEMES: { id: string; comptes: string[] }[] = [
  { id: 'tva', comptes: ['1170', '1171', '2200', '2205'] },
  { id: 'salaires', comptes: ['5200', '5270', '2170', '2171', '2172', '1140'] },
  { id: 'creances', comptes: ['1108', '1109', '3805'] },
  { id: 'transitoires', comptes: ['1300', '2300'] },
  { id: 'amortissements', comptes: ['6800', '1509', '1519', '1529', '1539', '1609', '8510', '8500'] },
  { id: 'titres', comptes: ['1060', '6940', '6952', '1176'] },
  { id: 'immeubles', comptes: ['7500', '7510', '2401'] },
  { id: 'societes', comptes: ['1850', '1860', '2810', '2900', '2950', '2960', '2970', '2230', '6550'] },
  { id: 'provisions', comptes: ['2600', '2640', '2660', '2690'] },
  { id: 'interets', comptes: ['6900', '6950'] },
  { id: 'marchandises', comptes: ['1200', '3200', '3209', '4200', '4209', '4270', '4280'] },
];

export function chapitrePourComptes(comptes: readonly string[], niveau: Niveau): Chapitre | null {
  const dispo = chapitresDuNiveau(niveau);
  const presents = new Set(comptes);
  for (const t of THEMES) {
    if (t.comptes.some((c) => presents.has(c))) {
      const ch = dispo.find((c) => c.id === t.id);
      if (ch) return ch;
    }
  }
  return dispo.find((c) => c.id === 'journal') ?? null;
}
