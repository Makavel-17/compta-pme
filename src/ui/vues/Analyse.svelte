<!-- Analyse du bilan et du compte de résultat : l'élève calcule les ratios ; en entraînement, ils sont vérifiés. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { RATIOS, ratios, ratioJuste } from '../../engine/analyse';

  const attendus = $derived(ratios(etat.dossier));
  const entrainement = $derived(etat.exercice.mode === 'entrainement');
  let saisies = $state<Record<string, string>>({});

  function etatRatio(cle: (typeof RATIOS)[number]['cle']): 'juste' | 'faux' | null {
    const t = (saisies[cle] ?? '').trim().replace(',', '.').replace('%', '');
    if (!entrainement || t === '' || Number.isNaN(Number(t))) return null;
    return ratioJuste(attendus[cle], Number(t)) ? 'juste' : 'faux';
  }
</script>

<div class="titre">
  <h1>Analyse financière</h1>
  <span class="sous">Ratios en pour cent, arrondis à une décimale</span>
</div>

<section class="carte">
  <table>
    <thead>
      <tr>
        <th>Ratio</th>
        <th>Formule</th>
        <th class="montant" style="width:130px">Votre calcul (%)</th>
        {#if entrainement}<th style="width:100px">Contrôle</th>{/if}
      </tr>
    </thead>
    <tbody>
      {#each RATIOS as r, i}
        {@const e = etatRatio(r.cle)}
        <tr class:zebre={i % 2 === 1}>
          <td><b>{r.libelle}</b></td>
          <td class="discret">{r.formule}</td>
          <td><input class="champ montant num" inputmode="decimal" aria-label={r.libelle} bind:value={saisies[r.cle]} /></td>
          {#if entrainement}
            <td class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</section>
<p class="discret note">
  Les ratios se calculent d'après les états financiers actuels de votre dossier (bilan et compte de résultat). Le ROI et la
  rentabilité des fonds propres utilisent la moyenne entre le début et la fin de l'exercice.
</p>

<style>
  .juste { color: var(--c-ok); font-weight: bold; }
  .faux { color: var(--c-alerte-texte); font-weight: bold; }
  .note { margin-top: 12px; }
</style>
