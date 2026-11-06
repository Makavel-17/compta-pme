<script lang="ts">
  import { etat } from '../etat.svelte';
  import { operationsSaisies } from '../../engine/exercice';
  import { balance } from '../../engine/ledger';
  import { dt } from '../format';

  const s = $derived(etat.session!);
  const saisies = $derived(operationsSaisies(s.dossier).size);
  const paragraphes = $derived(
    (s.exercice.situation ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
  );

  function recommencer() {
    if (confirm("Recommencer l'exercice ? Toutes vos écritures seront effacées.")) etat.recommencer();
  }
  // L'accueil s'ouvre par-dessus le travail en cours : rien n'est effacé tant qu'un autre exercice n'est pas commencé.
  function quitter() {
    etat.accueilOuvert = true;
  }
</script>

<div class="titre"><h1>Tableau de bord</h1></div>

{#if paragraphes.length}
  <section class="carte situation">
    <h2>Votre situation</h2>
    <div class="corps-carte">
      {#each paragraphes as p}<p>{p}</p>{/each}
    </div>
  </section>
{/if}

<section class="carte">
  <h2>{s.exercice.titre}</h2>
  <div class="corps-carte">
    {#if s.dossier.debut === s.exercice.debut}
      <p>{s.exercice.introduction}</p>
      <p>
        <b>{saisies}</b> opération{saisies > 1 ? 's' : ''} sur {s.exercice.operations.length} saisie{saisies > 1 ? 's' : ''}
        · balance {balance(s.dossier).equilibree ? 'équilibrée' : 'non équilibrée'}.
      </p>
    {:else}
      <p>
        L'exercice {dt(s.exercice.debut).slice(6)} est bouclé et archivé. Vous travaillez sur l'exercice suivant
        ({dt(s.dossier.debut)} – {dt(s.dossier.fin)}), ouvert avec le bilan de clôture. L'énoncé ne contient pas
        d'opération pour cet exercice.
      </p>
    {/if}
    <div class="actions">
      <button class="btn btn-principal" onclick={() => etat.commencerSaisie()}>
        {s.dossier.ecritures.length ? 'Continuer la saisie' : 'Commencer la saisie'}
      </button>
      <button class="btn" onclick={() => (etat.visiteOuverte = true)}>Revoir la visite guidée</button>
      <button class="btn" onclick={recommencer}>Recommencer l'exercice</button>
      <button class="btn" onclick={quitter}>Changer d'exercice</button>
    </div>
  </div>
</section>

<style>
  .situation p { max-width: 75ch; line-height: 1.5; margin: 0 0 10px; white-space: pre-line; }
  .situation p:last-child { margin-bottom: 0; }
  .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
</style>
