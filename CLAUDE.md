# Compta PME — règles du projet

Application pédagogique de comptabilité en partie double pour l'École de commerce Aimée-Stitelmann (Genève).
Publics : CFC employé·e de commerce 1re et 2e année (CFC1, CFC2), maturité professionnelle (MP).
Interlocuteur : l'enseignant de comptabilité. Toujours répondre en français, vouvoiement.

## Méthode de travail (impératif)

- **N'inventer aucune règle comptable, aucun numéro ni intitulé de compte.** En cas de doute ou d'écart entre usage scolaire et pratique, demander.
- **N'ajouter aucun contenu de niveau sans le soumettre à l'enseignant.**
- À la fin de chaque phase : lancer les tests, expliquer comment vérifier dans le navigateur, lister ce qui reste incomplet, **attendre l'accord** avant la phase suivante.
- Avant de coder l'interface : maquettes des écrans Journal et Bilan, puis attendre la validation.

## Phases

0. Squelette, plan comptable, CLAUDE.md — *terminée*
1. Moteur comptable et tests — *terminée* (montants, dates, journal, extourne, soldes, comptes en T, grand livre, balance, bilan, compte de résultat, bouclement RI, réouverture). TVA, correction et répartition du bénéfice sont testées dans leurs phases respectives.
2. 2a maquettes Journal + Bilan — *validées* (public/maquettes/) ; 2b interface CFC1 (journal, comptes en T, grand livre, balance, bilan, compte de résultat, bouclement, visite guidée, hors ligne) — *terminée et validée*. Exercice de démo CFC1 : `src/data/demo-cfc1.ts` (Cycles du Léman, 15 opérations, bénéfice 3'530.00).
3. Mode enseignant, création d'exercice, import/export, correction automatique, retour gradué — *terminée et validée*. Moteur `src/engine/correction.ts` (diagnostics, suivi des tentatives) ; fichiers `src/io/fichiers.ts` ; espace enseignant `src/ui/vues/EspaceEnseignant.svelte` et éditeur `EditeurExercice.svelte` ; le corrigé se saisit dans le journal (session `role: 'corrige'`, travail de l'élève mis de côté puis restauré). Synthèse des copies : phase 5.
4. CFC2 : TVA, amortissements, régularisations, ducroire, salaires — *terminée et validée*. Moteur `tva.ts` (calcul HT/TTC, arrondi 5 cts, décompte), `salaire.ts` (contrôle de la fiche) ; écrans TVA et « Décompte de salaire » ; options d'exercice `tvaMethode`, `ficheSalaire`, `calculatriceTva` ; exercice de démo `src/data/demo-cfc2.ts` (Papeterie de l'Arve, 16 opérations, bénéfice 9'582.20) à faire relire par l'enseignant.
5. Mode évaluation, barème, note, PDF, synthèse enseignant — *terminée et validée*. `src/engine/notation.ts` (barème par opération, points partiels, note suisse, statistiques) ; onglet « Copies » de l'espace enseignant (`SyntheseCopies.svelte`, copies gardées en mémoire seulement, export CSV) ; export PDF `src/pdf/copie.ts` (jsPDF + autotable chargés à la demande). Points partiels (proposition) : barème × (lignes justes − lignes en trop) / lignes attendues, arrondi au demi-point inférieur, pour les corrigés touchant au moins 3 comptes/côtés.
6. MP : Sàrl/SA, répartition du bénéfice, provisions, titres, ratios — *terminée et validée*. Sociétés : 2800 Capital / Capital-actions / Capital social selon la forme ; bénéfice viré 9000/2970 ; répartition depuis 2970 (`src/engine/repartition.ts`, art. 672 CO révisé : 5 % après compensation des pertes, plafond 50 % du capital inscrit pour réserves légales capital + bénéfice, 20 % holding ; impôt anticipé 35 % → 2205) ; fiche « Répartition du bénéfice » ; fiche « Analyse » (`src/engine/analyse.ts`, ratios du cours, ROI sur actif moyen, tolérance 0.1 point) ; titres selon F&C ch. 54 (validé 05.11.2026) : 1060 Titres au prix d'achat frais compris, vente créditée au net de frais (1020/1060), 6940 Charges des titres (droits de garde, perte de cours, moins-value) et 6952 Produits des titres (dividendes, impôt anticipé, bénéfice de cours, plus-value), différence de cours constatée à la clôture d'après l'inventaire ; dividendes reçus 1176 ; provisions par la charge par nature ; exercice `src/data/demo-mp.ts` (Lémantec SA, 15 opérations, bénéfice 76'415.00) à faire relire. Le manuel E&S 2022 enseigne encore l'ancienne règle (art. 671, superdividende) : ne pas la reprendre.

Dossiers de pièces comptables (05.11.2026, à faire relire par l'enseignant) : `src/data/dossiers/` — seize dossiers (CFC 1–4, MP 1–5), une entreprise fictive chacun, 10 à 12 pièces (factures, tickets, quittances, avis bancaires, fiches de salaire, notes internes), « pièces seules » (l'énoncé décrit le document, jamais l'écriture). Modèle `src/engine/pieces.ts`, affichage `PieceVue.svelte` dans le journal, PDF élève et corrigé `src/pdf/dossier.ts`, onglet « Dossiers » de l'espace enseignant, fichiers générés par `npm run dossiers` dans `dossiers/` (non versionné). Niveaux MP : 1 Sociétés, 2 Titres/provisions/opérations financières, 3 Synthèse (Lémantec).

Guide d'utilisation : contenu unique `src/data/guide.ts` (vue `Guide.svelte`) ; page autonome à partager `public/guide.html`, régénérée par `npm run guide` après toute modification du guide.

Trois exercices de démonstration (un par niveau, ~15 opérations, entreprise fictive) créés dans la phase qui introduit le niveau.

## Contraintes techniques

- Svelte 5 + Vite + TypeScript strict ; tests Vitest. Pas de bibliothèque UI, pas de routeur. Dépendances futures prévues : `jspdf` + `jspdf-autotable` (chargés à la demande, phase 5). Toute autre dépendance doit être justifiée.
- 100 % navigateur : aucun serveur, aucune donnée en ligne (LPD, LIPAD). Stockage localStorage, échanges par fichiers. Site statique (GitHub Pages, `base: './'`), utilisable hors ligne (service worker écrit à la main).
- **Montants en centimes entiers (`number` entier), jamais de flottants.** Format affiché `1'234.50`, dates `JJ.MM.AAAA`, monnaie CHF.
- Interface entièrement en français.
- `src/engine/` : moteur comptable pur (aucun import d'interface ni du DOM), entièrement testé dans `tests/`.
- `src/ui/` : composants Svelte. `src/io/` : fichiers, CSV, localStorage. `src/data/` : plan comptable, exercices de démo.
- Commandes : `npm run dev`, `npm test`, `npm run check`, `npm run build`.
- Conventions du moteur : solde positif = débiteur ; dates ISO `AAAA-MM-JJ` en interne ; fonctions pures retournant `Resultat<T>` (`ok` / `erreurs` en français) ; écriture = lignes `{debit, credit, montant}` (une ligne à deux comptes = écriture simple, lignes à un seul côté = écriture composée) ; une extourne garde le même numéro de pièce.
- Bouclement : en mode `compteDeResultat`, l'élève passe lui-même les écritures de bouclement au journal (pièces B1, B2…) ; question ouverte à l'enseignant : génération automatique ou non.
- Bouclement : deux modes — `compteDeResultat` (via 9000, **par défaut**) et `aLaReouverture` (résultat et privé intégrés au capital à la réouverture).
- Versionnement : Git, dépôt GitHub, déploiement GitHub Pages par GitHub Actions (`.github/workflows/`).

## Supports de cours de référence (inspiration uniquement)

- `D:\E&S_Edition 2022\` (manuel romand Économie & Société, CREME-CIIP : volumes CFC profils B/E, F&C profil M), `D:\Cours_Compta\`, `D:\Cours gestion\`.
- **Protégés : s'en inspirer uniquement, ne jamais reproduire de texte, d'exemple ni d'exercice.** Certains PDF F&C sont verrouillés : ne pas contourner.
- Usages relevés (04.11.2026) : TVA au net (B : calcul ; E/M : comptabilisation), 1170 IP s/marchandises et services + 1171 IP s/investissements et autres charges d'exploitation, décompte 2200/1170, 2200/1171, solde 2200/2205 puis paiement 2205/1020 ; amortissement direct (B) et indirect (E) avec « Fonds d'amortissements cumulés » en xxx9, linéaire/dégressif, prorata temporis ; transitoires 1300/2300 avec extourne au 01.01 par l'élève ; ducroire 3805↔1109 (ajustement de la différence), 1108 Créances douteuses, pas de correction TVA sur pertes ; créance amortie un exercice précédent puis récupérée → 1020/8510 Produits exceptionnels (validé 05.11.2026) ; frais de poursuite avancés → 1100 (à la charge du débiteur, validé) ; escomptes avec correction de la TVA : accordé 3209 + 2200 au débit, obtenu 4209 + 1170 au crédit (validé) ; salaires : retenues 5200/dettes par assurance, net 5200/1020, charges patronales 5270/dettes ; comptes en T avec San/Spb. Le plan comptable du manuel suit la numérotation PME (≠ plan LPG).

- Documents fournis par l'enseignant le 05.11.2026, utilisables pour enrichir le contenu (reformuler, ne pas recopier de longs passages) : `D:\Manuel_analyse_Etats_financiers.pdf`, `D:\comptabilité_générale.pdf` (F. Spada).

## Classement des exercices (proposition à valider)

- Chaque exercice porte `filiere` (CFC ou MP), `difficulte` (niveau 1, 2, 3…) et `chapitres` (chapitres du manuel E&S). L'accueil les regroupe par formation puis par niveau ; l'en-tête affiche « CFC · niveau 3 ». `niveau` (CFC1/CFC2/MP) ne règle plus que les comptes et fonctions disponibles (libellé « Comptes et fonctions » dans l'éditeur).
- CFC : 1 Bases (ch. 1, 12, 35), 2 TVA (ch. 14), 3 Opérations de clôture (ch. 22–25), 4 Synthèse. MP (validé 05.11.2026, d'après F&C profil M) : 1 Opérations financières et commerciales (ch. 2, 3, 12, 13), 2 Clôture de l'entreprise individuelle (ch. 35), 3 Société anonyme (ch. 36, 37), 4 Titres et immeubles (ch. 54, 55), 5 Analyse financière (ch. 51), 6 Synthèse.

## Plan comptable

- **Plan du cours (numérotation PME du manuel E&S)**, choisi par l'enseignant le 04.11.2026 à la place du plan LPG : `src/data/plan-pme.csv`. Numéros et intitulés alignés sur le cours (ex. 1020 Banque (n/avoir), 2170 Dette AVS, 3200 Ventes de marchandises, 3805 Pertes s/créances, 6800 Amortissements, 6900 Charges financières, 9000 Compte de résultat), sans recopier l'annexe du manuel.
- CSV `numero;intitule;classe;type;niveau_min`. Types : actif, passif, charge, produit, bouclement (classe 9). `niveau_min` : CFC1, CFC2, MP ou `-` (non utilisé par défaut, activable par l'enseignant).
- Les valeurs `niveau_min` du nouveau plan sont **une proposition à faire valider**.
- Titres de groupes du bilan et du compte de résultat : classes du plan du cours (actifs circulants / immobilisés ; capitaux étrangers à court / long terme ; capitaux propres ; chiffre d'affaires ; charges de marchandises et de services ; charges de personnel ; autres charges d'exploitation ; amortissements ; charges et produits financiers ; hors exploitation ; exceptionnels ; impôts).
- Dette envers l'AFC (TVA et impôt anticipé) : **2205 Dettes AFC** (choix de l'enseignant). 2800 s'intitule « Capital » (raison individuelle) ou « Capital-actions » (SA) selon la forme juridique (phase 6).
- Les maquettes validées (`public/maquettes/`) montrent encore des numéros LPG : ce sont des archives.

## Règles MP relevées dans F&C profil M (validées le 05.11.2026)

- Monnaies étrangères (ch. 13) : achat à l'étranger payé au cours **vente** des devises, vente à l'étranger encaissée au cours **achat** ; la différence de change entre facture et paiement est passée dans le compte de la marchandise (4200 Achats ou 3200 Ventes de marchandises), sans compte de change séparé. Les cours sont donnés par la pièce ou l'énoncé.
- Raison individuelle (ch. 35) : écritures internes facultatives — salaire du propriétaire 5200 Salaires / 2850 Privé, intérêt sur le capital 6900 Charges financières / 2850 Privé ; revenu de l'entrepreneur = salaire + intérêt + résultat.
- Immeubles (ch. 55) : immeuble d'une raison individuelle à usage mixte (usage commercial prépondérant) → 7500 Produits d'immeubles / 7510 Charges d'immeubles (classe 7, activité annexe, groupes propres dans le compte de résultat) ; loyers internes à la clôture : locaux de l'entreprise 6000/7500, logement du propriétaire 2850/7500 ; dépense qui augmente la valeur → 1600 ; annuité = intérêt (6900 immeuble commercial, 7510 usage mixte, 8000 locatif hors exploitation) + remboursement 2401. Immeuble locatif (8000/8100) non traité pour l'instant. L'analyse (EBIT) n'intègre pas encore la classe 7.
- Fondation et augmentation du capital (ch. 36) : souscription 1850 Actionnaires / 2800 ; libération en espèces ou en nature au crédit de 1850 (créances apportées : 1100 au brut, ducroire 1109, net à 1850) ; part non libérée = créance 1850 ; frais de fondation et d'augmentation → 6550 FAO (charge, CO 959 al. 2) ; agio → 2900 Réserves légales issues du capital, toujours libéré entièrement ; bons de participation 1860/2810. Comptes 6550, 1860, 2810 passés au niveau MP (proposition).
- Titres (ch. 54) : voir phase 6 ci-dessus (6940/6952). Moins-values toujours comptabilisées ; plus-values au choix (réserve latente possible).
- Sources : `C:\Users\41789\Desktop\Livre FIC\` (F&C et E&D profil M, scans protégés : inspiration uniquement, ne rien reproduire).

## Niveaux (validés)

- CFC1 : bilan d'ouverture, comptes actif/passif/charges/produits, journal, comptes en T, balance, bouclement simple d'une raison individuelle, compte privé.
- CFC2 : + TVA méthode effective, amortissements direct et indirect, actifs et passifs de régularisation, pertes sur créances et ducroire, salaires et charges sociales.
- MP : + Sàrl/SA, répartition du bénéfice et réserves, provisions, titres et produits financiers, analyse du bilan et du compte de résultat (ratios), **intérêts et frais bancaires, escomptes/rabais/frais d'achat, intérêt du capital propre et salaire de l'exploitant, monnaies étrangères**.
- Une fonction non activée n'apparaît pas du tout. L'enseignant ajuste les activations par exercice.

## Règles comptables validées

- Écritures composées acceptées ; débit = crédit obligatoire avant validation.
- Correction d'une écriture validée par **extourne** (terme suisse romand, choisi par l'enseignant de préférence à « contre-passation »), historique visible ; modification directe possible en entraînement si l'enseignant l'autorise.
- États financiers **en forme de compte** (deux colonnes), selon art. 959a / 959b CO adaptés au niveau.
- Bilan avant bouclement : bénéfice dans les capitaux propres ; **perte de l'exercice du côté de l'actif**, sur une ligne séparée (choix de l'enseignant).
- Comptes en T : abréviations **SI / SF** par défaut (solde initial / solde final) ; variante **San / Spb** (solde à nouveau / solde pour bilan) proposée en paramètre.
- Bouclement : l'enseignant n'a pas de préférence. **Par défaut, écritures de bouclement via 9000 Compte de résultat** (le compte en T 9000 reproduit le compte de résultat, lien avec le travail à la main) ; le mode « intégration à la réouverture » reste disponible en paramètre d'exercice.
- TVA méthode effective, taux 8,1 % / 2,6 % / 3,8 %. **Méthodes nette et brute** toutes deux disponibles (choix par exercice). **Arrondi aux 5 centimes.** Décompte simplifié : tableau TVA due − impôt préalable. Écritures proposées d'après le cours (à valider en phase 4) : 2200/1170, 2200/1171, solde 2200/2205 (ou 2205), paiement 2205/1020.
- Répartition du bénéfice : **règle du droit révisé (art. 672 CO, dès 2023)** ; relire le texte de loi avant d'implémenter.
- Salaires : les cotisations sont données par l'énoncé ; l'enseignant veut **plusieurs façons de comptabiliser et d'effectuer les calculs**, au choix par exercice. Variantes concrètes à proposer et faire valider au début de la phase 4.

## Correction automatique et notation (validées)

- Numéro de pièce = numéro de l'opération de l'énoncé ; correction insensible à l'ordre.
- Comparaison par opération des **totaux débit et crédit par compte**, tolérance 0.05 CHF (écriture composée ≡ sa décomposition ; un passage par un compte intermédiaire est une erreur). **Date non contrôlée.**
- Une écriture et son extourne s'annulent et ne sont pas notées.
- **Bouclement** (option d'exercice `corrigerBouclement`, mode compte de résultat) : écritures de bouclement = pièces qui ne sont pas des opérations de l'énoncé, comparées ensemble aux écritures attendues **calculées d'après les comptes de l'élève avant bouclement** (pas de double pénalité) ; retour gradué en entraînement, points en évaluation (barème `Bouclement`, 3 points par défaut). `src/engine/correction-bouclement.ts`.
- Fiches (salaire, répartition, analyse) enregistrées dans la session de l'élève et incluses dans la copie exportée.
- Degré d'autofinancement (cours) : (réserves issues du bénéfice + bénéfice reporté) / capitaux propres ; société : le bénéfice de l'exercice est compris (il rejoint 2970) ; raison individuelle : non (il va au capital).
- Entraînement : 1re erreur → indice nommant le type d'erreur (débit/crédit inversés, bonne classe mais mauvais compte, montant erroné, TVA oubliée) ; après une 2e tentative fausse → bouton « Voir la solution ».
- Évaluation : aucun retour pendant la saisie. Barème par écriture, **tout ou rien, sauf écritures multiples où des points partiels sont possibles**. Note = 1 + points/max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6.
- Fichier d'exercice : en évaluation **sans corrigé** (l'enseignant le conserve et corrige à l'import des copies) ; en entraînement corrigé inclus mais encodé.
- Copie élève : prénom, nom, **classe**.
- « Bonne classe mais mauvais compte » = même premier chiffre (classe du plan). Une opération incomplète (décomposition en cours) n'est pas comptée comme une erreur.
- Formats : `.compta-exercice.json` (élèves ; corrigé absent en évaluation, encodé en entraînement), version enseignant (corrigé en clair), `.compta-copie.json`.
- Mode enseignant : code simple stocké dans le navigateur (`compta-pme:enseignant:v1`), sans prétention de sécurité.

## Pédagogie

- Retour immédiat et précis en entraînement ; charge cognitive réduite (n'afficher que le niveau) ; vocabulaire identique au cours ; aucune gamification.
- L'élève choisit toujours lui-même le compte : aucune suggestion de contrepartie.
- Messages d'erreur en français clair qui disent quoi corriger ; états vides explicites ; infobulles rares ; visite guidée ≤ 5 étapes, désactivable.

## Interface et charte visuelle

- S'inspirer des logiciels comptables suisses professionnels (Banana, Abacus, bexio) : fond blanc, tableaux denses à lignes alternées, montants à droite en chiffres tabulaires, soldes négatifs en rouge, une seule couleur forte pour l'action principale.
- Barre latérale fixe (rubriques activées seulement), en-tête avec dossier, exercice, niveau, mode toujours visibles, une seule tâche à la fois.
- Saisie au clavier : Tab entre les champs, Entrée valide la ligne ; champ compte par numéro ou recherche dans l'intitulé, intitulé affiché immédiatement ; différence débit/crédit affichée en direct.
- **Comptes choisis par leur NOM** (exigence de l'enseignant, 04.11.2026 : en cours, les élèves apprennent les noms, très peu les numéros) : le champ affiche le nom, la recherche se fait dans le nom (les noms qui commencent par le texte d'abord), le numéro n'apparaît qu'en petit ; la saisie d'un numéro reste acceptée sans être mise en avant. Le journal affiche le nom avant le numéro.
- Champ compte = **liste déroulante** (exigence de l'enseignant : utilisation la plus simple possible) : clic ou flèche ↓ ouvre la liste complète des comptes de l'exercice groupés par classe ; la frappe d'un numéro ou d'un mot filtre ; choix souris, doigt ou clavier. Liste toujours complète et neutre. **Tab ne choisit jamais à la place de l'élève** : seulement s'il ne reste qu'un compte correspondant ou si l'élève l'a désigné avec les flèches ; sinon message « Plusieurs comptes correspondent : choisissez dans la liste ».
- Vocabulaire validé : **« Extourner » / « Extourne »** (jamais « contre-passer »).
- Couleurs validées avec les maquettes (`src/ui/theme.css`) : structure `#1F4E78` ; sélection `#D6E4F0` ; lignes alternées `#F1F6FB` (plus pâle) ; bouton principal `#C4501A` (orange de la charte assombri, texte blanc conforme AA) ; `#E8601C` pour bordures d'alerte, rubrique active et focus clavier ; texte d'alerte `#B34A12` ; statut « Juste » en vert `#1D6B3A`. Grille de saisie en haut du journal.
- Arial (Helvetica dans les PDF), aucun émoji, aucune illustration, aucune animation superflue. WCAG AA, lisible au projecteur, ordinateur et tablette en paysage.
