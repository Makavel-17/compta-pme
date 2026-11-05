# Travail en cours (demandes de l'enseignant du 04.11.2026)

Ce fichier sert à reprendre le travail automatiquement si la session est interrompue (limite d'utilisation).
Lire d'abord `CLAUDE.md` (règles du projet). Cocher chaque tâche terminée, avec un commit et une publication.
Toujours : `npm test` et `npm run check` sans erreur avant chaque commit ; message de commit en français terminé par
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` ; `git push` (la publication GitHub Pages est automatique).
Git : `C:\Program Files\Git\cmd\git.exe` ; GitHub CLI : `C:\Program Files\GitHub CLI\gh.exe`.

## Tâches

- [x] **A. Éditeur : choix des comptes de l'exercice.** Dans `src/ui/vues/EditeurExercice.svelte`, section « Comptes de
  l'exercice » : tous les comptes du plan groupés par classe, avec une case à cocher ; cochés par défaut ceux du niveau.
  Cocher un compte hors niveau l'ajoute à `parametres.comptesAjoutes`, décocher un compte du niveau l'ajoute à
  `parametres.comptesMasques`. Filtre de recherche par nom. Test du moteur si nécessaire.

- [x] **B. Situation de départ.** Nouveau champ `situation` (texte) dans `Exercice` (`src/engine/exercice.ts`) : un récit
  qui place l'élève dans l'entreprise (son rôle, l'entreprise, ses produits, ses collègues, ce qu'on attend de lui).
  Éditeur : zone de texte. Affichage : carte « Votre situation » en tête du tableau de bord ; au démarrage d'un
  exercice, ouvrir le tableau de bord (et non le journal) avec un bouton « Commencer la saisie ». Rédiger une situation
  originale pour chaque exercice de démonstration. Texte entièrement original (aucune reprise des manuels).

- [x] **C. Onglet « Théorie ».** Rubrique de la barre latérale, visible à tous les niveaux, n'affichant que les
  chapitres du niveau de l'exercice (CFC1 ⊂ CFC2 ⊂ MP). Contenu rédigé EN NOS PROPRES MOTS (les manuels E&S sont
  protégés : s'en inspirer seulement, ne jamais recopier de phrase, d'exemple ou d'exercice), cohérent avec le plan
  comptable du cours (`src/data/plan-pme.csv`) et le vocabulaire validé (extourne, SI/SF, San/Spb, FAC…).
  Chapitres : bilan ; comptes et règles débit/crédit ; journal et écritures (simples, composées, extourne) ; compte de
  résultat et bouclement de la raison individuelle, compte privé ; marchandises et stock (CFC1) ; TVA méthode effective
  (au net / au brut, décompte, 2205) ; amortissements (direct/indirect, linéaire/dégressif, prorata) ; transitoires et
  extourne au 01.01 ; pertes sur créances, créances douteuses, ducroire ; salaires et assurances sociales (sans taux
  figés) ; sociétés (SA, Sàrl), répartition du bénéfice (art. 672 CO révisé), impôt anticipé ; provisions ; titres ;
  intérêts, escomptes ; analyse financière (ratios du cours). Bases légales citées (CO 957 ss, 959a, 959b, 672 ;
  LTVA). Données en fichier TS (`src/data/theorie.ts`), écran `src/ui/vues/Theorie.svelte` (sommaire + chapitre,
  exemples d'écritures en tableau, mise en page sobre selon la charte).

- [x] **D. Nouveaux exercices** (proposés, à faire valider par l'enseignant), entreprises fictives et montants
  originaux, inspirés de la structure des chapitres du cours, chacun avec situation de départ, ~10–15 opérations,
  corrigé complet et test (corrigé équilibré, `controlerExercice` sans erreur) :
  1. CFC1 — commerce de détail : bilan d'ouverture, achats/ventes, charges, privé, bouclement noté.
  2. CFC1 — entreprise de services (honoraires 3400 activé via comptes ajoutés), bouclement.
  3. CFC2 — TVA : un trimestre complet au net, décompte et paiement (2205).
  4. CFC2 — amortissements (direct et indirect, linéaire et dégressif, prorata) et transitoires.
  5. CFC2 — pertes sur créances, créances douteuses, ducroire, récupération d'une créance amortie (8510).
  6. CFC2 — salaires : décomptes de plusieurs employés, charges patronales, paiements aux assurances.
  7. MP — SA : répartition avec perte reportée compensée, dividendes et impôt anticipé, titres et provisions.
  Les ajouter à `src/data/demos.ts` (marquer « proposé » dans le titre ou la description tant que non validé).

## Journal de reprise

(ajouter une ligne datée à chaque reprise : ce qui a été fait, ce qui reste)

- 05.11.2026 — A terminée : section « Comptes de l'exercice » (cases par classe, recherche, retour aux comptes du niveau), moteur `comptesChoisis` / `basculerCompte` testé ; le bilan d'ouverture de l'éditeur propose les comptes choisis. Reste B, C, D.
- 05.11.2026 — B terminée : champ `situation` (facultatif, rétrocompatible), zone de texte dans l'éditeur, carte « Votre situation » en tête du tableau de bord, démarrage sur le tableau de bord avec « Commencer la saisie » (visite guidée lancée à ce moment), situations originales des trois démos (à relire). Non vérifié dans le navigateur (serveur de prévisualisation non autorisé pendant la reprise automatique). Reste C, D.
- 05.11.2026 — C terminée : rubrique « Cours › Théorie » (tous niveaux), 15 chapitres cumulatifs (5 CFC1, 5 CFC2, 5 MP ; voir `src/data/theorie.ts`), exemples d'écritures en tableau vérifiés par test (équilibre, comptes du plan disponibles au niveau, arrondi 5 cts), mention « Contenu proposé » tant que `THEORIE_VALIDEE = false`. Points à valider : variation de stock 1200/4280 (CFC1), TVA au brut (3200/2200 et 1170/4200 en fin de période), récupération d'une créance amortie en 8510, hausse de cours des titres 1060/6950, provisions (constitution et utilisation seulement). Reste D.
- 05.11.2026 — D terminée : 7 exercices proposés dans `src/data/exercices-proposes.ts` (titres « (proposé) »), ajoutés à la liste des démos ; test `tests/exercices-proposes.test.ts` (contrôle sans erreur ni avertissement, corrigé complet et équilibré, résultat et soldes calculés à la main, bouclement, répartition Novaterm). Choix à valider : D1 prélèvement privé payé par la banque (pas de prélèvement de marchandises) ; D2 comptes de marchandises masqués et 3400 ajouté ; D3 loyer non soumis à la TVA ; D4 et D5 entreprises non assujetties à la TVA, méthodes directe et indirecte dans le même exercice ; D6 LPP en montants fixes, part patronale égale à la part salariale, compte 3410 ajouté ; D7 frais d'achat de titres en 6900, provisions 6100/2600 et 8900/2640. Toutes les tâches sont terminées.
