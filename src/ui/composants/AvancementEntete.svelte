<!-- En-tête : avancement de l'élève ; un clic ouvre le récapitulatif des pièces avec un lien vers chacune. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { avancementSession, avecCorrection } from '../avancement';
  import type { StatutOperation } from '../../engine/correction';
  import BarreAvancement from './BarreAvancement.svelte';

  const s = $derived(etat.session!);
  const a = $derived(avancementSession(s));
  const correction = $derived(avecCorrection(s));
  let ouvert = $state(false);

  const LIBELLES: Record<StatutOperation, string> = {
    juste: 'Juste',
    revoir: 'À revoir',
    incomplete: 'Incomplète',
    saisie: 'Saisie',
    manquante: 'Pas encore saisie',
  };
  const texte = (numero: string) => s.exercice.operations.find((o) => o.numero === numero)?.texte ?? '';

  function ouvrir(numero: string) {
    ouvert = false;
    etat.ouvrirOperation(numero);
  }
</script>

{#if a}
  <div class="avancement">
    <button class="declencheur" aria-expanded={ouvert} aria-controls="recap-avancement" onclick={() => (ouvert = !ouvert)}>
      <span>{a.saisies} / {a.total} pièces</span>
      <BarreAvancement {a} {correction} largeur={120} />
    </button>
    {#if ouvert}
      <div class="panneau" id="recap-avancement" role="dialog" aria-label="Récapitulatif des pièces">
        <div class="tete">
          <strong>Récapitulatif</strong>
          <span class="discret">
            {#if correction}{a.justes} justes · {a.aRevoir} à revoir · {a.incompletes} incomplètes · {a.nonSaisies} à faire
            {:else}{a.saisies} saisies · {a.nonSaisies} à faire (évaluation : pas de correction pendant le travail){/if}
          </span>
          <button class="fermer" aria-label="Fermer le récapitulatif" onclick={() => (ouvert = false)}>×</button>
        </div>
        <ul>
          {#each a.parOperation as o (o.numero)}
            <li>
              <button onclick={() => ouvrir(o.numero)}>
                <span class="num">{o.numero}</span>
                <span class="texte">{texte(o.numero)}</span>
                <span class={`statut ${o.statut}`}>{LIBELLES[o.statut]}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

<style>
  .avancement { position: relative; flex: none; }
  .declencheur {
    display: inline-flex; align-items: center; gap: 10px; font: inherit; font-size: 13px; color: var(--c-texte); cursor: pointer;
    background: #fff; border: 1px solid var(--c-bordure); border-radius: 3px; padding: 4px 10px; white-space: nowrap;
  }
  .declencheur:hover { background: var(--c-selection); }
  .panneau {
    position: absolute; right: 0; top: calc(100% + 6px); z-index: 30; width: min(560px, 92vw); max-height: 70vh; overflow: auto;
    background: #fff; color: var(--c-texte); border: 1px solid var(--c-bordure); border-radius: 4px; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  }
  .tete { display: flex; align-items: baseline; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--c-bordure-2); position: sticky; top: 0; background: #fff; }
  .tete .discret { font-size: 12px; flex: 1; }
  .fermer { border: 0; background: none; font-size: 18px; cursor: pointer; color: var(--c-texte-2); }
  ul { list-style: none; margin: 0; padding: 0; }
  li button {
    width: 100%; display: grid; grid-template-columns: 32px 1fr auto; gap: 10px; align-items: baseline; text-align: left;
    font: inherit; font-size: 13px; padding: 7px 12px; border: 0; border-top: 1px solid var(--c-bordure-2); background: #fff; cursor: pointer;
  }
  li:nth-child(even) button { background: var(--c-zebra); }
  li button:hover { background: var(--c-selection); }
  .num { font-weight: bold; color: var(--c-structure); }
  .texte { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .statut { font-size: 12px; font-weight: bold; white-space: nowrap; }
  .statut.juste { color: var(--c-ok); }
  .statut.revoir { color: var(--c-alerte-texte); }
  .statut.incomplete, .statut.saisie { color: var(--c-texte-2); }
  .statut.manquante { color: var(--c-texte-2); font-weight: normal; }
</style>
