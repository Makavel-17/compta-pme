<!-- Compte de résultat à plusieurs degrés (plan PME) : l'élève calcule chaque degré d'après ses comptes. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { degres } from '../../engine/tableaux';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const g = $derived(degres(etat.dossier));
  const entrainement = $derived(etat.exercice.mode === 'entrainement');
  const session = etat.session!;
  if (!session.fiches.degres) session.fiches.degres = {};
  const saisies = session.fiches.degres;

  const sections = $derived<SectionCalcul[]>([
    {
      lignes: [
        { cle: 'margeBrute', libelle: 'Marge brute (résultat brut d’exploitation)', formule: "Chiffre d'affaires − charges de marchandises", type: 'chf', attendu: g.margeBrute, fort: true },
        { cle: 'ebitda', libelle: 'EBITDA', formule: '− charges de personnel − autres charges d’exploitation', type: 'chf', attendu: g.ebitda, fort: true },
        { cle: 'ebit', libelle: 'EBIT (résultat économique)', formule: '− amortissements', type: 'chf', attendu: g.ebit, fort: true },
        { cle: 'resultatNetExploitation', libelle: "Résultat net d'exploitation", formule: '− charges financières + produits financiers', type: 'chf', attendu: g.resultatNetExploitation, fort: true },
        { cle: 'ebt', libelle: 'EBT (résultat avant impôts)', formule: '± activités annexes ± hors exploitation ± exceptionnels', type: 'chf', attendu: g.ebt, fort: true },
        { cle: 'resultat', libelle: "Résultat de l'exercice", formule: '− impôts', type: 'chf', attendu: g.resultat, fort: true },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Compte de résultat à plusieurs degrés</h1>
  <span class="sous">Présentation selon le plan comptable PME, montants en CHF</span>
</div>

<FicheCalcul {sections} {saisies} {entrainement} />

<p class="discret note">
  Les degrés se calculent d'après les comptes actuels de votre dossier, avant les écritures de bouclement. Une perte
  s'écrit avec un signe moins (par exemple -1'250.00).
</p>

<style>
  .note { margin-top: 4px; max-width: 80ch; }
</style>
