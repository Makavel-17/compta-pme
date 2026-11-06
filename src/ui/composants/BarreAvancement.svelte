<!-- Barre d'avancement : justes (vert), à revoir (orange), incomplètes ou saisies sans correction (gris-bleu). -->
<script lang="ts">
  import type { Avancement } from '../../engine/correction';

  let { a, correction, largeur = 160, sombre = false }: { a: Avancement; correction: boolean; largeur?: number; sombre?: boolean } = $props();
  const pc = (n: number) => (a.total ? (n / a.total) * 100 : 0);
  const description = $derived(
    correction
      ? `${a.saisies} pièces saisies sur ${a.total} : ${a.justes} justes, ${a.aRevoir} à revoir, ${a.incompletes} incomplètes`
      : `${a.saisies} pièces saisies sur ${a.total}`,
  );
</script>

<span class="barre" class:sombre style={`width:${largeur}px`} role="img" aria-label={description} title={description}>
  {#if correction}
    <span class="juste" style={`width:${pc(a.justes)}%`}></span>
    <span class="revoir" style={`width:${pc(a.aRevoir)}%`}></span>
    <span class="saisie" style={`width:${pc(a.incompletes)}%`}></span>
  {:else}
    <span class="neutre" style={`width:${pc(a.saisies)}%`}></span>
  {/if}
</span>

<style>
  .barre { display: inline-flex; height: 10px; border-radius: 5px; overflow: hidden; background: var(--c-bordure-2); vertical-align: middle; }
  .barre.sombre { background: rgba(255, 255, 255, 0.28); }
  .juste { background: var(--c-ok); }
  .revoir { background: var(--c-accent); }
  .saisie { background: #8fa9c4; }
  .neutre { background: #8fa9c4; }
  .sombre .neutre { background: #d6e4f0; }
</style>
