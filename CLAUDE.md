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
1. Moteur comptable et tests — *terminée, en attente de validation* (montants, dates, journal, contre-passation, soldes, comptes en T, grand livre, balance, bilan, compte de résultat, bouclement RI, réouverture). TVA, correction et répartition du bénéfice sont testées dans leurs phases respectives.
2. 2a maquettes Journal + Bilan (validation) ; 2b interface CFC1 (journal, comptes en T, grand livre, balance, bilan, compte de résultat, bouclement, visite guidée)
3. Mode enseignant, création d'exercice, import/export, correction automatique, retour gradué
4. CFC2 : TVA, amortissements, régularisations, ducroire, salaires
5. Mode évaluation, barème, note, PDF, synthèse enseignant
6. MP : Sàrl/SA, répartition du bénéfice, provisions, titres, ratios

Trois exercices de démonstration (un par niveau, ~15 opérations, entreprise fictive) créés dans la phase qui introduit le niveau.

## Contraintes techniques

- Svelte 5 + Vite + TypeScript strict ; tests Vitest. Pas de bibliothèque UI, pas de routeur. Dépendances futures prévues : `jspdf` + `jspdf-autotable` (chargés à la demande, phase 5). Toute autre dépendance doit être justifiée.
- 100 % navigateur : aucun serveur, aucune donnée en ligne (LPD, LIPAD). Stockage localStorage, échanges par fichiers. Site statique (GitHub Pages, `base: './'`), utilisable hors ligne (service worker écrit à la main).
- **Montants en centimes entiers (`number` entier), jamais de flottants.** Format affiché `1'234.50`, dates `JJ.MM.AAAA`, monnaie CHF.
- Interface entièrement en français.
- `src/engine/` : moteur comptable pur (aucun import d'interface ni du DOM), entièrement testé dans `tests/`.
- `src/ui/` : composants Svelte. `src/io/` : fichiers, CSV, localStorage. `src/data/` : plan comptable, exercices de démo.
- Commandes : `npm run dev`, `npm test`, `npm run check`, `npm run build`.
- Conventions du moteur : solde positif = débiteur ; dates ISO `AAAA-MM-JJ` en interne ; fonctions pures retournant `Resultat<T>` (`ok` / `erreurs` en français) ; écriture = lignes `{debit, credit, montant}` (une ligne à deux comptes = écriture simple, lignes à un seul côté = écriture composée) ; une contre-passation garde le même numéro de pièce.
- Bouclement : deux modes — `compteDeResultat` (via 9000, **par défaut**) et `aLaReouverture` (résultat et privé intégrés au capital à la réouverture).
- Versionnement : Git, dépôt GitHub, déploiement GitHub Pages par GitHub Actions (`.github/workflows/`).

## Plan comptable

- Source retenue par l'enseignant : **plan LPG Fiduciaire** (lpg-fiduciaire-de-suisse.ch, version du 28.10.2020), **numéros et intitulés repris tels quels** dans `src/data/plan-lpg.csv`.
- CSV `numero;intitule;classe;type;niveau_min`. Types : actif, passif, charge, produit, bouclement (classe 9). `niveau_min` : CFC1, CFC2, MP ou `-` (non utilisé par défaut, activable par l'enseignant).
- Les valeurs `niveau_min` du CSV sont **validées par l'enseignant** (04.11.2026).
- Titres de groupes du bilan et du compte de résultat : **ceux du plan LPG** (validé).
- Points connus à trancher plus tard : intitulés 3220-3222 / 4210-4212 mentionnant des taux périmés (8.00 %, 2.50 %) ; « 2900 Réserve générale » (terminologie antérieure au droit 2023) ; absence de comptes de correction pour l'amortissement indirect hors 1209/1609 ; absence de comptes de titres et produits de titres.

## Niveaux (validés)

- CFC1 : bilan d'ouverture, comptes actif/passif/charges/produits, journal, comptes en T, balance, bouclement simple d'une raison individuelle, compte privé.
- CFC2 : + TVA méthode effective, amortissements direct et indirect, actifs et passifs de régularisation, pertes sur créances et ducroire, salaires et charges sociales.
- MP : + Sàrl/SA, répartition du bénéfice et réserves, provisions, titres et produits financiers, analyse du bilan et du compte de résultat (ratios), **intérêts et frais bancaires, escomptes/rabais/frais d'achat, intérêt du capital propre et salaire de l'exploitant, monnaies étrangères**.
- Une fonction non activée n'apparaît pas du tout. L'enseignant ajuste les activations par exercice.

## Règles comptables validées

- Écritures composées acceptées ; débit = crédit obligatoire avant validation.
- Correction d'une écriture validée par contre-passation, historique visible ; modification directe possible en entraînement si l'enseignant l'autorise.
- États financiers **en forme de compte** (deux colonnes), selon art. 959a / 959b CO adaptés au niveau.
- Bilan avant bouclement : bénéfice dans les capitaux propres ; **perte de l'exercice du côté de l'actif**, sur une ligne séparée (choix de l'enseignant).
- Comptes en T : abréviations **SI / SF** par défaut (solde initial / solde final) ; variante **San / Spb** (solde à nouveau / solde pour bilan) proposée en paramètre.
- Bouclement : l'enseignant n'a pas de préférence. **Par défaut, écritures de bouclement via 9000 Compte de résultat** (le compte en T 9000 reproduit le compte de résultat, lien avec le travail à la main) ; le mode « intégration à la réouverture » reste disponible en paramètre d'exercice.
- TVA méthode effective, taux 8,1 % / 2,6 % / 3,8 %. **Méthodes nette et brute** toutes deux disponibles (choix par exercice). **Arrondi aux 5 centimes.** Décompte simplifié : tableau TVA due − impôt préalable, compensation 2200/1170, paiement 2200/1020.
- Répartition du bénéfice : **règle du droit révisé (art. 672 CO, dès 2023)** ; relire le texte de loi avant d'implémenter.
- Salaires : les cotisations sont données par l'énoncé ; l'enseignant veut **plusieurs façons de comptabiliser et d'effectuer les calculs**, au choix par exercice. Variantes concrètes à proposer et faire valider au début de la phase 4.

## Correction automatique et notation (validées)

- Numéro de pièce = numéro de l'opération de l'énoncé ; correction insensible à l'ordre.
- Comparaison par opération des **totaux débit et crédit par compte**, tolérance 0.05 CHF (écriture composée ≡ sa décomposition ; un passage par un compte intermédiaire est une erreur). **Date non contrôlée.**
- Une écriture et sa contre-passation s'annulent et ne sont pas notées.
- Entraînement : 1re erreur → indice nommant le type d'erreur (débit/crédit inversés, bonne classe mais mauvais compte, montant erroné, TVA oubliée) ; après une 2e tentative fausse → bouton « Voir la solution ».
- Évaluation : aucun retour pendant la saisie. Barème par écriture, **tout ou rien, sauf écritures multiples où des points partiels sont possibles**. Note = 1 + points/max × 5, arrondie au demi-point le plus proche (x.25 → x.5), bornée 1–6.
- Fichier d'exercice : en évaluation **sans corrigé** (l'enseignant le conserve et corrige à l'import des copies) ; en entraînement corrigé inclus mais encodé.
- Copie élève : prénom, nom, **classe**.

## Pédagogie

- Retour immédiat et précis en entraînement ; charge cognitive réduite (n'afficher que le niveau) ; vocabulaire identique au cours ; aucune gamification.
- L'élève choisit toujours lui-même le compte : aucune suggestion de contrepartie.
- Messages d'erreur en français clair qui disent quoi corriger ; états vides explicites ; infobulles rares ; visite guidée ≤ 5 étapes, désactivable.

## Interface et charte visuelle

- S'inspirer des logiciels comptables suisses professionnels (Banana, Abacus, bexio) : fond blanc, tableaux denses à lignes alternées, montants à droite en chiffres tabulaires, soldes négatifs en rouge, une seule couleur forte pour l'action principale.
- Barre latérale fixe (rubriques activées seulement), en-tête avec dossier, exercice, niveau, mode toujours visibles, une seule tâche à la fois.
- Saisie au clavier : Tab entre les champs, Entrée valide la ligne ; champ compte par numéro ou recherche dans l'intitulé, intitulé affiché immédiatement ; différence débit/crédit affichée en direct.
- Couleurs (`src/ui/theme.css`) : structure `#1F4E78`, sélection/lignes alternées `#D6E4F0`, action `#E8601C` (parcimonie ; texte blanc en gras ≥ 14 pt pour le contraste), texte d'alerte `#B34A12`.
- Arial (Helvetica dans les PDF), aucun émoji, aucune illustration, aucune animation superflue. WCAG AA, lisible au projecteur, ordinateur et tablette en paysage.
