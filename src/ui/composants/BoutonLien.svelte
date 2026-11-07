<!-- Copie le lien direct d'un exercice du logiciel, à donner aux élèves (plateforme de la classe, courriel…). -->
<script lang="ts">
  import { lienEleves } from '../lien';

  let { exerciceId, classe = 'btn-lien' }: { exerciceId: string; classe?: string } = $props();
  let etat = $state<'repos' | 'copie' | 'manuel'>('repos');
  const lien = $derived(lienEleves(exerciceId));

  async function copier() {
    try {
      await navigator.clipboard.writeText(lien);
      etat = 'copie';
      setTimeout(() => (etat = 'repos'), 2500);
    } catch {
      // Presse-papiers refusé : le lien s'affiche, sélectionné, pour une copie à la main.
      etat = 'manuel';
    }
  }
</script>

{#if etat === 'manuel'}
  <span class="manuel">
    <input class="champ" readonly value={lien} aria-label="Lien pour les élèves" onfocus={(e) => (e.currentTarget as HTMLInputElement).select()} />
    <button class={classe} onclick={() => (etat = 'repos')}>Fermer</button>
  </span>
{:else}
  <button class={classe} onclick={copier} title={lien}>{etat === 'copie' ? 'Lien copié' : 'Copier le lien pour les élèves'}</button>
{/if}

<style>
  .manuel { display: inline-flex; gap: 6px; align-items: center; }
  .manuel input { width: 340px; max-width: 60vw; font-size: 12px; }
</style>
