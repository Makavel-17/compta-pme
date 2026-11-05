// Guide d'utilisation du logiciel, pour les élèves et pour l'enseignant.

export type BlocGuide =
  | { type: 'p'; texte: string }
  | { type: 'etapes'; items: string[] }
  | { type: 'liste'; items: string[] }
  | { type: 'retenir'; texte: string };

export interface SectionGuide {
  id: string;
  titre: string;
  blocs: BlocGuide[];
}

export interface PartieGuide {
  id: 'eleve' | 'enseignant';
  titre: string;
  intro: string;
  sections: SectionGuide[];
}

export const GUIDE: PartieGuide[] = [
  {
    id: 'eleve',
    titre: 'Pour les élèves',
    intro:
      "Compta PME est un logiciel de comptabilité en partie double. Vous y tenez la comptabilité d'une entreprise " +
      'fictive : vous passez les écritures au journal, puis vous consultez les comptes et les états financiers.',
    sections: [
      {
        id: 'demarrer',
        titre: 'Démarrer un exercice',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Sur la page d’accueil, indiquez votre prénom, votre nom et votre classe.',
              "Choisissez l'exercice : soit un exercice de la liste, classé par formation (CFC ou maturité) et par niveau, " +
                "soit le fichier reçu de votre enseignant avec le bouton « Ouvrir un exercice reçu… ».",
              'Cliquez sur « Commencer ». Le tableau de bord présente votre situation dans l’entreprise : lisez-la avant de commencer.',
              'Cliquez sur « Commencer la saisie » pour ouvrir le journal.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Votre travail est enregistré automatiquement dans ce navigateur, sur cet ordinateur. Rien n’est envoyé sur internet.',
          },
        ],
      },
      {
        id: 'ecran',
        titre: "Se repérer à l'écran",
        blocs: [
          {
            type: 'liste',
            items: [
              "En haut : l'entreprise, l'exercice, la formation et le niveau, le mode (entraînement ou évaluation).",
              'À gauche : les rubriques. Saisie (journal, fiches), Consultation (comptes en T, grand livre, balance), ' +
                'États financiers (bilan, compte de résultat), Clôture (TVA, bouclement), Cours (théorie, ce guide).',
              'Au centre : une seule tâche à la fois.',
              'Dans le journal, l’énoncé et ses opérations sont affichés à droite ou en dessous, selon la taille de l’écran.',
            ],
          },
        ],
      },
      {
        id: 'saisir',
        titre: 'Saisir une écriture',
        blocs: [
          {
            type: 'etapes',
            items: [
              "Cliquez sur une opération de l'énoncé : la date et le numéro de pièce se remplissent. Le numéro de pièce est " +
                "toujours le numéro de l'opération.",
              'Écrivez un libellé court (par exemple « Achat de marchandises à crédit »).',
              'Choisissez le compte au débit, puis le compte au crédit, puis tapez le montant.',
              "Appuyez sur Entrée : si l'écriture est équilibrée, elle est validée.",
            ],
          },
          {
            type: 'p',
            texte:
              'Touches utiles : Tab pour passer au champ suivant, Entrée pour passer à la ligne suivante ou valider, Échap pour ' +
              'retirer une ligne. Les montants s’écrivent librement : 1250, 1250.50 ou 1’250,50.',
          },
        ],
      },
      {
        id: 'comptes',
        titre: 'Choisir un compte',
        blocs: [
          {
            type: 'p',
            texte:
              'Cliquez dans un champ compte : la liste de tous les comptes de l’exercice s’ouvre, classée par classe. Vous ' +
              'pouvez aussi taper une partie du nom (« banque », « dettes four ») : la liste se réduit. Choisissez avec la ' +
              'souris, au doigt ou avec les flèches puis Entrée.',
          },
          {
            type: 'retenir',
            texte:
              'Le logiciel ne propose jamais la contrepartie : c’est à vous de décider quels comptes l’opération modifie.',
          },
        ],
      },
      {
        id: 'composee',
        titre: 'Écriture composée',
        blocs: [
          {
            type: 'p',
            texte:
              "Quand une opération touche plus de deux comptes, saisissez plusieurs lignes : sur chaque ligne, un compte au " +
              "débit ou au crédit avec son montant. Après chaque ligne, Entrée ouvre une nouvelle ligne. Sous la grille, " +
              "l'écart entre débit et crédit s'affiche tant que l'écriture n'est pas équilibrée ; elle se valide dès que " +
              "l'écart est nul.",
          },
          {
            type: 'p',
            texte: 'Vous pouvez aussi décomposer l’opération en plusieurs écritures simples avec le même numéro de pièce.',
          },
        ],
      },
      {
        id: 'corriger',
        titre: 'Corriger une erreur : l’extourne',
        blocs: [
          {
            type: 'p',
            texte:
              "Une écriture validée ne s'efface pas. Pour la corriger, cliquez sur « Extourner » : le logiciel passe l'écriture " +
              "inverse, avec le même numéro de pièce. L'écriture fausse et son extourne restent visibles dans le journal. " +
              "Saisissez ensuite l'écriture juste.",
          },
        ],
      },
      {
        id: 'retour',
        titre: 'Le retour en mode entraînement',
        blocs: [
          {
            type: 'liste',
            items: [
              '« Juste » : l’opération est correctement comptabilisée.',
              '« Incomplète » : une partie de l’opération manque encore (par exemple une ligne d’une écriture composée).',
              "« À revoir » avec un indice : l'indice dit quel type d'erreur vous avez fait (débit et crédit inversés, " +
                'mauvais compte, montant erroné, TVA oubliée…), sans donner la réponse.',
              'Après une deuxième tentative fausse, le bouton « Voir la solution » apparaît.',
            ],
          },
          {
            type: 'p',
            texte: 'En mode évaluation, aucun retour n’est affiché pendant le travail : votre enseignant corrige votre copie.',
          },
        ],
      },
      {
        id: 'consulter',
        titre: 'Consulter les comptes et les états',
        blocs: [
          {
            type: 'liste',
            items: [
              'Comptes : chaque compte en T, avec le solde initial (SI) et le solde final (SF), un compte à la fois ou tous ensemble.',
              'Grand livre : le détail de chaque compte avec le solde après chaque écriture.',
              'Balance : contrôle que le total des débits égale le total des crédits.',
              "Bilan et compte de résultat : présentés en forme de compte ; le bilan d'ouverture est aussi consultable.",
            ],
          },
        ],
      },
      {
        id: 'fiches',
        titre: 'Les fiches de calcul et la clôture',
        blocs: [
          {
            type: 'liste',
            items: [
              'Décompte de salaire : calculez les retenues et le salaire net avant de passer l’écriture.',
              'TVA : le décompte TVA due moins impôt préalable, d’après vos comptes.',
              'Répartition du bénéfice et Analyse (maturité) : calculez les montants et les ratios demandés.',
              "Bouclement : passez vous-même les écritures de bouclement au journal (pièces B1, B2…). Selon l'exercice, " +
                'elles sont corrigées comme les opérations.',
            ],
          },
          { type: 'p', texte: 'Ce que vous écrivez dans les fiches est enregistré avec votre travail.' },
        ],
      },
      {
        id: 'rendre',
        titre: 'Rendre son travail',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Cliquez sur « Exporter ma copie » (en bas à gauche) : un fichier .compta-copie.json est enregistré dans vos téléchargements.',
              'Remettez ce fichier à votre enseignant (par la plateforme de l’école, par courriel ou sur une clé USB).',
              'Pour garder une trace imprimable, « Exporter en PDF » produit un document avec le journal, la balance et les états.',
            ],
          },
          {
            type: 'retenir',
            texte:
              "Votre travail n'existe que dans le navigateur de cet ordinateur. Exportez votre copie avant de changer " +
              "d'ordinateur ou de vider l'historique du navigateur.",
          },
        ],
      },
    ],
  },
  {
    id: 'enseignant',
    titre: "Pour l'enseignant",
    intro:
      "L'espace enseignant permet de créer des exercices, de les distribuer, puis de corriger les copies. Il est protégé " +
      "par un code simple, sans prétention de sécurité. Tout reste dans le navigateur de l'ordinateur utilisé.",
    sections: [
      {
        id: 'acces',
        titre: "Accéder à l'espace enseignant",
        blocs: [
          {
            type: 'p',
            texte:
              "Cliquez sur « Espace enseignant » (page d'accueil ou bas de la barre latérale). À la première visite, " +
              'choisissez un code d’au moins 4 caractères ; il est demandé ensuite à chaque ouverture.',
          },
        ],
      },
      {
        id: 'creer',
        titre: 'Créer un exercice',
        blocs: [
          {
            type: 'etapes',
            items: [
              "« Nouvel exercice », ou « Partir d'un exemple » puis « Copier cet exemple » pour reprendre un exercice existant.",
              'Informations générales : titre, comptes et fonctions disponibles, formation, niveau, mode, entreprise, dates, ' +
                'sujets traités, introduction et situation de départ.',
              'Comptes de l’exercice : cochez ou décochez les comptes proposés aux élèves.',
              "Bilan d'ouverture : comptes et montants ; l'équilibre est contrôlé.",
              'Opérations : numéro, date, texte et points de chaque opération.',
              '« Saisir le corrigé dans le journal » : passez les écritures comme un élève, puis « Enregistrer le corrigé ».',
              'Vérifiez le cadre « Contrôle de l’exercice » en bas de page : il signale ce qui manque.',
            ],
          },
        ],
      },
      {
        id: 'distribuer',
        titre: 'Distribuer un exercice',
        blocs: [
          {
            type: 'liste',
            items: [
              '« Exporter pour les élèves » : le fichier à distribuer. En évaluation, il ne contient pas le corrigé ; en ' +
                'entraînement, le corrigé y est encodé pour permettre le retour immédiat.',
              '« Version enseignant » : fichier complet avec le corrigé, à conserver. Il permet aussi de rouvrir et modifier ' +
                "l'exercice sur un autre ordinateur (« Importer un exercice… »).",
            ],
          },
        ],
      },
      {
        id: 'corriger-copies',
        titre: 'Corriger les copies',
        blocs: [
          {
            type: 'etapes',
            items: [
              'Onglet « Copies » de l’espace enseignant : choisissez l’exercice.',
              '« Importer des copies… » : sélectionnez tous les fichiers .compta-copie.json reçus.',
              'Le tableau donne les points et la note de chaque élève, le détail par opération et les erreurs les plus ' +
                'fréquentes de la classe.',
              '« Exporter les résultats (CSV) » produit un fichier qui s’ouvre dans Excel.',
            ],
          },
          {
            type: 'retenir',
            texte: 'Note = 1 + points obtenus / points maximum × 5, arrondie au demi-point.',
          },
        ],
      },
      {
        id: 'donnees',
        titre: 'Données et confidentialité',
        blocs: [
          {
            type: 'p',
            texte:
              "Le logiciel fonctionne entièrement dans le navigateur. Aucune donnée d'élève n'est envoyée sur internet : les " +
              'échanges se font uniquement par fichiers. Les copies importées dans l’onglet « Copies » ne sont pas enregistrées.',
          },
        ],
      },
    ],
  },
];
