<!-- Guide d'utilisation : accessible depuis l'accueil, la barre latérale et l'espace enseignant. -->
<script lang="ts">
  import { GUIDE } from '../../data/guide';

  let { onFermer, partie = 'eleve' }: { onFermer: () => void; partie?: 'eleve' | 'enseignant' } = $props();
  // svelte-ignore state_referenced_locally
  let active = $state<'eleve' | 'enseignant'>(partie);
  const p = $derived(GUIDE.find((x) => x.id === active)!);
</script>

<div class="page">
  <header class="bandeau-haut">
    <span class="logo">Compta PME</span>
    <span class="titre-espace">Guide d'utilisation</span>
    <button class="btn-lien fermer" onclick={onFermer}>Fermer le guide</button>
  </header>
  <main class="contenu">
    <div class="titre">
      <h1>Guide d'utilisation</h1>
      <div class="segments" role="group" aria-label="Partie du guide">
        {#each GUIDE as g}
          <button aria-pressed={active === g.id} onclick={() => (active = g.id)}>{g.titre}</button>
        {/each}
      </div>
    </div>
    <p class="intro">{p.intro}</p>
    {#if active === 'enseignant'}
      <p class="intro">
        Version complète à transmettre à vos collègues (page web, imprimable) :
        <a href="./guide.html" target="_blank" rel="noopener">guide d'utilisation de Compta PME</a>.
      </p>
    {/if}

    <nav class="carte sommaire" aria-label="Sommaire">
      <h2>Sommaire</h2>
      <ol>
        {#each p.sections as sec}
          <li><a href={`#guide-${sec.id}`} onclick={(e) => { e.preventDefault(); document.getElementById(`guide-${sec.id}`)?.scrollIntoView({ block: 'start' }); }}>{sec.titre}</a></li>
        {/each}
      </ol>
    </nav>

    {#each p.sections as sec, i}
      <section class="carte" id={`guide-${sec.id}`}>
        <h2>{i + 1}. {sec.titre}</h2>
        <div class="corps-carte">
          {#each sec.blocs as b}
            {#if b.type === 'p'}<p>{b.texte}</p>
            {:else if b.type === 'etapes'}<ol class="etapes">{#each b.items as it}<li>{it}</li>{/each}</ol>
            {:else if b.type === 'liste'}<ul>{#each b.items as it}<li>{it}</li>{/each}</ul>
            {:else if b.type === 'retenir'}<p class="retenir">{b.texte}</p>{/if}
          {/each}
        </div>
      </section>
    {/each}
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: #fff; border-bottom: 1px solid var(--c-bordure-2); padding: 0 28px; height: 60px; display: flex; align-items: center; gap: 18px; }
  .logo { color: var(--c-texte); font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 10px; }
  .logo::before { content: 'CP'; width: 28px; height: 28px; border-radius: 7px; background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: 12px; }
  .titre-espace { color: var(--c-texte-2); flex: 1; }
  .fermer { color: var(--c-structure); }
  .contenu { max-width: 900px; margin: 0 auto; padding: 24px 16px 48px; }
  .intro { margin: 0 0 16px; line-height: 1.5; }
  section, .sommaire { margin-bottom: 14px; }
  .sommaire ol { margin: 8px 0 12px; padding-left: 34px; columns: 2; }
  .sommaire li { margin: 3px 0; }
  .corps-carte p, .corps-carte li { line-height: 1.5; }
  .corps-carte p { margin: 0 0 10px; }
  .etapes li, ul li { margin-bottom: 6px; }
  .retenir {
    border-left: 4px solid var(--c-structure); background: var(--c-selection); padding: 8px 12px; font-weight: bold;
  }
  @media (max-width: 700px) { .sommaire ol { columns: 1; } }
</style>
