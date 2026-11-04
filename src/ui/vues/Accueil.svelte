<script lang="ts">
  import { etat } from '../etat.svelte';
  import { exercicesDemo } from '../../data/demo-cfc1';
  import { LIBELLES_NIVEAU } from '../../engine/exercice';

  let prenom = $state('');
  let nom = $state('');
  let classe = $state('');
  let choix = $state(exercicesDemo[0]?.id ?? '');
  let erreurs = $state<string[]>([]);

  function commencer(e: SubmitEvent) {
    e.preventDefault();
    const err: string[] = [];
    if (!prenom.trim()) err.push('Indiquez votre prénom.');
    if (!nom.trim()) err.push('Indiquez votre nom.');
    if (!classe.trim()) err.push('Indiquez votre classe (par exemple 1CFC3).');
    const ex = exercicesDemo.find((x) => x.id === choix);
    if (!ex) err.push('Choisissez un exercice.');
    erreurs = err;
    if (err.length || !ex) return;
    etat.commencer({ prenom: prenom.trim(), nom: nom.trim(), classe: classe.trim() }, ex);
  }
</script>

<div class="page">
  <header class="bandeau-haut"><span class="logo">Compta PME</span></header>
  <main class="contenu">
    <h1>Bienvenue</h1>
    <p class="discret">
      Logiciel de comptabilité en partie double, plan comptable suisse. Vos données restent dans ce navigateur :
      rien n'est envoyé en ligne.
    </p>

    <form class="carte" onsubmit={commencer} novalidate>
      <h2>Vos informations</h2>
      <div class="corps-carte grille">
        <div>
          <label class="bloc" for="prenom">Prénom</label>
          <input id="prenom" class="champ" bind:value={prenom} autocomplete="given-name" />
        </div>
        <div>
          <label class="bloc" for="nom">Nom</label>
          <input id="nom" class="champ" bind:value={nom} autocomplete="family-name" />
        </div>
        <div>
          <label class="bloc" for="classe">Classe</label>
          <input id="classe" class="champ" bind:value={classe} placeholder="1CFC3" />
        </div>
      </div>

      <h2 class="separe">Exercice</h2>
      <div class="corps-carte">
        {#each exercicesDemo as ex}
          <label class="exercice" class:choisi={choix === ex.id}>
            <input type="radio" name="exercice" value={ex.id} bind:group={choix} />
            <span>
              <strong>{ex.titre}</strong>
              <span class="badge niveau">{LIBELLES_NIVEAU[ex.niveau]}</span><br />
              <span class="discret">{ex.raisonSociale} · {ex.operations.length} opérations · exercice de démonstration</span>
            </span>
          </label>
        {/each}
        <p class="discret petit">L'importation des exercices fournis par l'enseignant sera disponible prochainement.</p>
      </div>

      {#if erreurs.length}
        <div class="alerte" role="alert" style="margin:0 14px 14px">
          <ul>{#each erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
      {/if}
      <div class="actions">
        <button type="submit" class="btn btn-principal">Commencer</button>
      </div>
    </form>
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: var(--c-structure); padding: 14px 24px; }
  .logo { color: #fff; font-weight: bold; font-size: 16px; }
  .contenu { max-width: 720px; margin: 0 auto; padding: 32px 16px; }
  .contenu > p { margin: 8px 0 20px; }
  form h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
  .separe { border-top: 1px solid var(--c-bordure-2); }
  .grille { display: grid; grid-template-columns: 1fr 1fr 160px; gap: 14px; }
  .exercice {
    display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border: 1px solid var(--c-bordure);
    border-radius: 3px; cursor: pointer;
  }
  .exercice.choisi { background: var(--c-selection); border-color: var(--c-structure); }
  .exercice input { margin-top: 3px; }
  .niveau { background: var(--c-structure); color: #fff; margin-left: 8px; }
  .petit { font-size: 12px; margin: 10px 0 0; }
  .actions { padding: 0 14px 14px; text-align: right; }
  @media (max-width: 640px) { .grille { grid-template-columns: 1fr; } }
</style>
