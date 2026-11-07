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
              "Choisissez votre formation (CFC ou maturité professionnelle), puis ouvrez un niveau et choisissez l'exercice. " +
                "La recherche trouve un exercice par sujet (« TVA », « salaires »…). Un fichier reçu de votre enseignant " +
                "s'ouvre avec le bouton « Ouvrir un exercice reçu… ».",
              'Cliquez sur « Commencer ». Le tableau de bord présente votre situation dans l’entreprise : lisez-la avant de commencer.',
              'Cliquez sur « Commencer la saisie » pour ouvrir le journal.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Votre travail est enregistré automatiquement dans ce navigateur, sur cet ordinateur. Rien n’est envoyé sur internet.',
          },
          {
            type: 'p',
            texte:
              "Quand vous revenez sur le site, l'accueil affiche « Reprendre où vous en étiez » avec votre avancement, puis vos " +
              "autres exercices en cours. Vous pouvez travailler sur plusieurs exercices : le bouton « Changer d'exercice » du " +
              "tableau de bord ouvre l'accueil, et chaque exercice reprend là où vous l'aviez laissé. Dans la liste, chaque " +
              "exercice commencé indique « En cours » ou « Terminé ».",
          },
          {
            type: 'retenir',
            texte:
              "Ordinateur partagé : si un autre élève indique son nom, le logiciel prévient que le travail enregistré sera " +
              "effacé. Exportez toujours votre copie avant de laisser l'ordinateur à quelqu'un d'autre.",
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
              'Sous l’indice, le lien « Revoir la théorie » ouvre le chapitre du cours qui correspond à l’opération.',
              'Après une deuxième tentative fausse, le bouton « Voir la solution » apparaît.',
            ],
          },
          {
            type: 'p',
            texte:
              "En haut à droite, la barre d'avancement indique combien de pièces vous avez saisies : en vert les justes, en " +
              "orange celles à revoir. Un clic ouvre le récapitulatif de toutes les pièces ; un clic sur une pièce l'ouvre " +
              "dans le journal. En évaluation, la barre indique seulement le nombre de pièces saisies.",
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
              'Résultat par degrés, Flux de trésorerie et Seuil de rentabilité (maturité) : calculez chaque degré ou chaque ' +
                'flux d’après vos comptes avant bouclement ; en entraînement, chaque résultat est contrôlé.',
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
            type: 'p',
            texte:
              'Sous le bouton « Exporter ma copie », une ligne indique où vous en êtes : copie jamais exportée, modifiée ' +
              'depuis le dernier export (exportez-la à nouveau avant de la rendre), ou exportée à telle date et heure.',
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
      "L'espace enseignant permet de créer des exercices, d'importer ceux de collègues, de distribuer des dossiers de " +
      "pièces comptables et de corriger les copies. Il est protégé par un code simple, sans prétention de sécurité. Tout " +
      "reste dans le navigateur de l'ordinateur utilisé : aucun compte, aucune inscription.",
    sections: [
      {
        id: 'acces',
        titre: "Accéder à l'espace enseignant",
        blocs: [
          {
            type: 'etapes',
            items: [
              "Cliquez sur « Espace enseignant » (page d'accueil ou bas de la barre latérale).",
              'À la première visite dans un navigateur, choisissez vous-même un code d’au moins 4 caractères et confirmez-le. ' +
                'Il n’existe pas de code par défaut.',
              'Le code est ensuite demandé à chaque ouverture. Il se modifie dans l’onglet « Paramètres ».',
            ],
          },
          {
            type: 'retenir',
            texte:
              'Le code et vos exercices sont enregistrés dans le navigateur de cet ordinateur seulement. Sur un autre ' +
              'ordinateur, vous créez un nouveau code et vous restaurez votre sauvegarde (voir « Sauvegarder et restaurer »).',
          },
        ],
      },
      {
        id: 'onglets',
        titre: 'Les onglets',
        blocs: [
          {
            type: 'liste',
            items: [
              'Exercices : vos exercices (création, modification, import, export).',
              'Dossiers : les dossiers de pièces comptables prêts à distribuer (PDF élève, corrigé PDF, fichiers d’exercice).',
              'Copies : correction automatique des copies rendues par les élèves, notes et statistiques de la classe.',
              'Relecture : liste de tout le contenu proposé (théorie, exercices, dossiers, niveaux des comptes) à valider ou à commenter.',
              'Paramètres : changement du code d’accès.',
            ],
          },
        ],
      },
      {
        id: 'creer',
        titre: 'Créer son propre exercice',
        blocs: [
          {
            type: 'p',
            texte:
              "Le plus rapide est de partir d'un exemple proche de ce que vous voulez : choisissez-le dans « Partir d'un " +
              "exemple… », cliquez sur « Copier cet exemple », puis adaptez l'entreprise, le bilan et les opérations. Pour " +
              'partir de zéro, cliquez sur « Nouvel exercice ».',
          },
          {
            type: 'etapes',
            items: [
              'Informations générales : titre, raison sociale, forme juridique, dates de l’exercice, formation (CFC ou ' +
                'maturité), niveau de difficulté, mode (entraînement ou évaluation), sujets traités (un par ligne), ' +
                'introduction et situation de départ présentée à l’élève.',
              '« Comptes et fonctions » (CFC 1re, CFC 2e, MP) fixe les comptes et les fonctions disponibles (TVA, fiches…). ' +
                'Dans « Comptes de l’exercice », cochez ou décochez ensuite les comptes proposés aux élèves.',
              "Bilan d'ouverture : choisissez les comptes et tapez les montants ; l'équilibre actif = passif est contrôlé.",
              "Opérations de l'énoncé : pour chacune, un numéro, une date, le texte et les points en évaluation. Le numéro " +
                "de l'opération est le numéro de pièce que l'élève inscrit dans le journal.",
              'Options : SI/SF ou San/Spb dans les comptes en T, bouclement par le compte 9000 ou intégration à la ' +
                'réouverture, correction des écritures de bouclement, TVA au net ou au brut, fiche « Décompte de salaire », ' +
                'calculatrice de TVA, modification directe des écritures validées, répartition du bénéfice (sociétés).',
              '« Saisir le corrigé dans le journal » : passez les écritures exactement comme un élève, puis enregistrez le ' +
                'corrigé. Votre éventuel travail d’élève est mis de côté puis restauré.',
              'Vérifiez le cadre « Contrôle de l’exercice » en bas de page : il liste ce qui manque. Quand il indique ' +
                '« L’exercice est complet et peut être distribué », l’exercice est prêt.',
              "« Aperçu » (dans la liste de vos exercices, à côté des exemples et dans l'onglet « Dossiers ») ouvre " +
                "l'exercice exactement comme vos élèves le verront, avec le retour en entraînement. « Fermer l'aperçu » vous " +
                "ramène dans l'espace enseignant ; ce que vous avez saisi pendant l'aperçu n'est conservé nulle part.",
            ],
          },
          {
            type: 'liste',
            items: [
              'Écritures composées : le corrigé peut contenir plusieurs lignes ; l’élève peut aussi décomposer l’opération en ' +
                'plusieurs écritures simples avec le même numéro de pièce, c’est accepté.',
              'La date n’est pas contrôlée ; les montants le sont à 5 centimes près.',
              'Points partiels : cochez l’option pour accorder une partie des points sur les écritures touchant au moins trois ' +
                'comptes.',
              "Exercices tirés d'un manuel : reformulez l'énoncé et changez les données (entreprise, montants). Les manuels " +
                'protégés ne doivent pas être recopiés dans un fichier distribué.',
            ],
          },
        ],
      },
      {
        id: 'distribuer',
        titre: 'Distribuer un exercice aux élèves',
        blocs: [
          {
            type: 'etapes',
            items: [
              '« Exporter pour les élèves » enregistre un fichier .compta-exercice.json dans vos téléchargements.',
              'Déposez ce fichier sur la plateforme de la classe (ou envoyez-le par courriel, sur une clé USB…).',
              "L'élève ouvre le site, clique sur « Ouvrir un exercice reçu… » et choisit le fichier.",
            ],
          },
          {
            type: 'liste',
            items: [
              'En entraînement, le fichier contient le corrigé sous forme encodée : l’élève reçoit un retour immédiat.',
              'En évaluation, le fichier ne contient pas le corrigé et l’élève ne reçoit aucun retour pendant le travail.',
              '« Version enseignant » : fichier complet, corrigé en clair. Conservez-le : il sert à corriger les copies, à ' +
                'retrouver l’exercice sur un autre ordinateur et à le partager avec un collègue.',
            ],
          },
        ],
      },
      {
        id: 'partager',
        titre: 'Partager ses exercices entre collègues',
        blocs: [
          {
            type: 'etapes',
            items: [
              "L'auteur exporte la « Version enseignant » de l'exercice et la transmet à son collègue.",
              'Le collègue ouvre l’espace enseignant, onglet « Exercices », clique sur « Importer un exercice… » et choisit ' +
                'le fichier.',
              "L'exercice apparaît dans sa liste : il peut le modifier, l'exporter pour ses élèves et corriger les copies.",
            ],
          },
          {
            type: 'retenir',
            texte:
              "Ne remettez jamais la version enseignant d'une évaluation aux élèves : elle contient le corrigé en clair. " +
              'Un fichier élève peut aussi être importé, mais une évaluation arrive alors sans corrigé.',
          },
        ],
      },
      {
        id: 'sauvegarde',
        titre: 'Sauvegarder et restaurer ses exercices',
        blocs: [
          {
            type: 'p',
            texte:
              "Vos exercices ne sont enregistrés que dans le navigateur de cet ordinateur. Ils disparaissent si l'on vide les " +
              "données du navigateur, si l'on change d'ordinateur ou si l'adresse du site change. Sauvegardez-les régulièrement.",
          },
          {
            type: 'etapes',
            items: [
              'Onglet « Exercices » : « Sauvegarder tous mes exercices » enregistre un seul fichier .compta-sauvegarde.json ' +
                'dans vos téléchargements, avec tous les exercices et leurs corrigés.',
              'Rangez ce fichier en lieu sûr (dossier personnel de l’école, clé USB). La date de la dernière sauvegarde est ' +
                'affichée sous les boutons.',
              'Sur un autre ordinateur, ou après une perte : « Restaurer une sauvegarde… » et choisissez le fichier. Les ' +
                'exercices sont ajoutés ; un exercice déjà présent est remplacé par sa version sauvegardée.',
            ],
          },
          {
            type: 'retenir',
            texte:
              'La sauvegarde contient les corrigés en clair : ne la donnez pas aux élèves. Le code d’accès n’y figure pas.',
          },
        ],
      },
      {
        id: 'dossiers',
        titre: 'Les dossiers de pièces comptables',
        blocs: [
          {
            type: 'p',
            texte:
              "Dix-huit dossiers prêts à l'emploi, un par grand thème (CFC niveaux 1 à 4, maturité niveaux 1 à 5). Chacun présente " +
              'une entreprise fictive et 10 à 12 pièces : factures, tickets de caisse, quittances, avis bancaires, fiches de ' +
              "salaire, notes internes. L'élève doit trouver lui-même l'écriture à partir du document.",
          },
          {
            type: 'liste',
            items: [
              'Paquet élèves (ZIP) : le dossier PDF et le fichier d’entraînement, à déposer tels quels pour la classe.',
              'Paquet complet (ZIP) : en plus, le corrigé PDF, le fichier d’évaluation et sa version enseignant. Il contient ' +
                'les corrigés : gardez-le pour vous.',
              'Dossier PDF : à imprimer ou à déposer pour les élèves (situation, consignes, bilan d’ouverture, une pièce par page).',
              'Corrigé PDF : écritures de chaque pièce, bouclement et états financiers, pour l’enseignant.',
              'Fichier entraînement et fichier évaluation : à distribuer comme un exercice ordinaire. Dans le journal, la pièce ' +
                's’affiche au-dessus de la grille de saisie.',
              'Les dossiers figurent aussi dans la liste de la page d’accueil, en entraînement.',
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
              'Les élèves cliquent sur « Exporter ma copie » et vous remettent leur fichier .compta-copie.json.',
              'Onglet « Copies » : choisissez l’exercice. Il doit se trouver dans vos exercices avec son corrigé ; pour une ' +
                'évaluation préparée par un collègue, importez d’abord sa version enseignant.',
              '« Importer des copies… » : sélectionnez tous les fichiers reçus en une fois.',
              'Le tableau donne les points et la note de chaque élève, le détail par opération et les erreurs les plus ' +
                'fréquentes de la classe.',
              '« Détail » affiche, pour chaque opération fausse, les écritures de l’élève à côté du corrigé (la case à ' +
                'cocher montre aussi celles des opérations justes).',
              '« Exporter les résultats (CSV) » produit un fichier qui s’ouvre dans Excel.',
              '« Copies corrigées (PDF) » produit un seul document pour la classe : le tableau des notes, puis une page par ' +
                'élève avec le résultat de chaque opération et, pour les erreurs, ses écritures à côté du corrigé.',
            ],
          },
          {
            type: 'retenir',
            texte: 'Note = 1 + points obtenus / points maximum × 5, arrondie au demi-point.',
          },
        ],
      },
      {
        id: 'relecture',
        titre: 'Relire et valider le contenu',
        blocs: [
          {
            type: 'p',
            texte:
              "La théorie, les exercices et les dossiers fournis avec le logiciel sont des propositions à relire. L'onglet " +
              "« Relecture » les liste tous, avec l'avancement de votre relecture.",
          },
          {
            type: 'etapes',
            items: [
              '« Aperçu » ouvre un exercice ou un dossier comme le voient les élèves ; « Lire » ouvre un chapitre de théorie.',
              'Cochez « Validé » quand le contenu est juste. Sinon, cliquez sur « Remarque » et notez ce qu’il faut corriger ' +
                '(numéro de pièce ou section, montant, compte, formulation).',
              'Les boutons « À relire », « Avec remarque » et « Tout » filtrent la liste.',
              '« Exporter mes remarques (texte) » produit un fichier qui classe les éléments : à corriger, validés, pas encore relus.',
            ],
          },
          {
            type: 'retenir',
            texte:
              "Vos avis restent dans ce navigateur et sont inclus dans votre sauvegarde. Ils ne changent pas ce que voient les " +
              "élèves : transmettez le fichier de remarques pour que le contenu officiel soit corrigé et que la mention " +
              "« proposé » disparaisse.",
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
              'échanges se font uniquement par fichiers. Les copies importées dans l’onglet « Copies » ne sont pas ' +
              'enregistrées : conservez les fichiers reçus. Vider les données du navigateur efface vos exercices : gardez ' +
              'toujours la version enseignant de chacun.',
          },
        ],
      },
    ],
  },
];
