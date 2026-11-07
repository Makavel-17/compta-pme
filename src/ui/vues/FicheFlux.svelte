<!-- Tableau des flux de trésorerie, cash flow par la méthode indirecte : l'élève calcule chaque flux. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { fluxTresorerie } from '../../engine/tableaux';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const f = $derived(fluxTresorerie(etat.dossier));
  const entrainement = $derived(etat.exercice.mode === 'entrainement');
  const session = etat.session!;
  if (!session.fiches.flux) session.fiches.flux = {};
  const saisies = session.fiches.flux;

  const sections = $derived<SectionCalcul[]>([
    {
      titre: 'Flux de trésorerie liés à l’exploitation (cash flow, méthode indirecte)',
      lignes: [
        { cle: 'benefice', libelle: "Bénéfice de l'exercice", type: 'chf', attendu: f.benefice },
        { cle: 'amortissements', libelle: '+ Amortissements', formule: 'charges sans effet monétaire', type: 'chf', attendu: f.amortissements },
        { cle: 'provisions', libelle: '± Variation des provisions', formule: 'augmentation + / diminution −', type: 'chf', attendu: f.variationProvisions },
        { cle: 'actifsCirculants', libelle: '∓ Variation des créances, stocks et actifs transitoires', formule: 'augmentation − / diminution +', type: 'chf', attendu: -f.variationActifsCirculants },
        { cle: 'dettes', libelle: '± Variation des dettes d’exploitation et passifs transitoires', formule: 'augmentation + / diminution −', type: 'chf', attendu: f.variationDettesExploitation },
        { cle: 'exploitation', libelle: '= Cash flow d’exploitation', type: 'chf', attendu: f.exploitation, fort: true },
      ],
    },
    {
      titre: 'Investissement, financement et contrôle',
      lignes: [
        { cle: 'investissement', libelle: 'Flux de trésorerie liés à l’investissement', formule: 'achats − (ventes d’immobilisations)', type: 'chf', attendu: f.investissement, fort: true },
        { cle: 'financement', libelle: 'Flux de trésorerie liés au financement', formule: 'emprunts, capital, remboursements, dividendes versés', type: 'chf', attendu: f.financement, fort: true },
        { cle: 'variation', libelle: 'Variation des liquidités', formule: 'somme des trois flux = liquidités fin − début', type: 'chf', attendu: f.variationLiquidites, fort: true },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Tableau des flux de trésorerie</h1>
  <span class="sous">Liquidités : caisse, poste et banque ; montants en CHF, sorties avec un signe moins</span>
</div>

<FicheCalcul {sections} {saisies} {entrainement} />

<p class="discret note">
  Le tableau se calcule d'après votre bilan d'ouverture et vos comptes actuels, avant les écritures de bouclement. Les
  encaissements sont positifs, les décaissements négatifs.
</p>

<style>
  .note { margin-top: 4px; max-width: 80ch; }
</style>
