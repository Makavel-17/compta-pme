<script lang="ts">
  import { etat } from '../etat.svelte';
  import { compteEnT, grandLivre } from '../../engine/ledger';
  import { libellesSoldes, m } from '../format';
  import CompteT from '../composants/CompteT.svelte';

  const d = $derived(etat.dossier);
  const libelles = $derived(libellesSoldes(etat.exercice.parametres.libellesT));
  const actifs = $derived(grandLivre(d));
  let mode = $state<'un' | 'tous'>('un');
  let choisi = $state<string | null>(null);
  const numero = $derived(choisi && actifs.some((c) => c.numero === choisi) ? choisi : (actifs[0]?.numero ?? null));
</script>

<div class="titre">
  <h1>Comptes</h1>
  <div class="segments" role="group" aria-label="Affichage">
    <button aria-pressed={mode === 'un'} onclick={() => (mode = 'un')}>Un compte</button>
    <button aria-pressed={mode === 'tous'} onclick={() => (mode = 'tous')}>Tous les comptes</button>
  </div>
</div>

<p class="discret legende">
  Comptes en T. {libelles.initial} = {libelles.initialLong.toLowerCase()}, {libelles.final} = {libelles.finalLong.toLowerCase()} ;
  les autres lignes portent le numéro de pièce.
</p>

{#if actifs.length === 0}
  <p class="vide carte">Aucun compte n'a encore de mouvement.</p>
{:else if mode === 'un' && numero}
  <div class="un">
    <nav class="carte liste" aria-label="Choix du compte">
      {#each actifs as c}
        <button class:sel={c.numero === numero} onclick={() => (choisi = c.numero)}>
          <span class="num n">{c.numero}</span>
          <span class="lib">{c.intitule}</span>
          <span class="num solde">{c.solde === 0 ? "0.00" : `${m(Math.abs(c.solde))} ${c.solde > 0 ? "D" : "C"}`}</span>
        </button>
      {/each}
    </nav>
    <div><CompteT t={compteEnT(d, numero)} {libelles} /></div>
  </div>
{:else}
  <div class="mosaique">
    {#each actifs as c}
      <CompteT t={compteEnT(d, c.numero)} {libelles} compact />
    {/each}
  </div>
{/if}

<style>
  .legende { margin: -8px 0 14px; font-size: 13px; }
  .un { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; align-items: start; }
  .liste { max-height: calc(100vh - 190px); overflow-y: auto; }
  .liste button {
    display: grid; grid-template-columns: 42px 1fr auto; gap: 6px; width: 100%; text-align: left;
    font: inherit; color: inherit; background: none; border: none; border-bottom: 1px solid var(--c-bordure-2);
    padding: 7px 12px; cursor: pointer;
  }
  .liste button:hover { background: var(--c-zebra); }
  .liste button.sel { background: var(--c-selection); font-weight: bold; }
  .n { font-weight: bold; }
  .lib { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .solde { color: var(--c-texte-2); font-size: 12px; }
  .mosaique { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
  @media (max-width: 1100px) { .un { grid-template-columns: 220px minmax(0, 1fr); } }
</style>
