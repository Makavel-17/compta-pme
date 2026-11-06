<!-- Théorie : sommaire des chapitres du niveau de l'exercice, puis lecture d'un chapitre. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { chapitresDuNiveau, THEORIE_VALIDEE, type ExempleEcriture } from '../../data/theorie';
  import { etiquetteNiveau } from '../../engine/exercice';
  import { formatMontant } from '../../engine/money';

  const chapitres = $derived(chapitresDuNiveau(etat.exercice.niveau));
  const intitules = $derived(new Map(etat.dossier.plan.map((c) => [c.numero, c.intitule])));
  let choisi = $state<string | null>(etat.chapitreCible);
  etat.chapitreCible = null;
  const chapitre = $derived(chapitres.find((c) => c.id === choisi) ?? null);
  const rang = $derived(chapitre ? chapitres.indexOf(chapitre) : -1);

  const compte = (n: string | null) => (n ? `${intitules.get(n) ?? n}` : '');
  const fr = (francs: number) => formatMontant(Math.round(francs * 100));

  /** Une ligne simple affiche les deux comptes ; les lignes d'une écriture composée n'en affichent qu'un. */
  function lignes(e: ExempleEcriture) {
    return e.lignes.map((l) => ({ debit: l.debit, credit: l.credit, montant: fr(l.montant) }));
  }

  function ouvrir(id: string | null) {
    choisi = id;
    document.querySelector('main')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }
</script>

<div class="titre">
  <h1>Théorie</h1>
  <span class="sous">Rappels de cours · {etiquetteNiveau(etat.exercice)}</span>
</div>

{#if !THEORIE_VALIDEE}
  <p class="discret petit avis">Contenu proposé, en cours de relecture par l'enseignant.</p>
{/if}

{#if !chapitre}
  <section class="carte">
    <h2>Sommaire</h2>
    <ol class="sommaire">
      {#each chapitres as c}
        <li>
          <button class="lien-chapitre" onclick={() => ouvrir(c.id)}>{c.titre}</button>
          <span class="discret">{c.resume}</span>
        </li>
      {/each}
    </ol>
  </section>
{:else}
  <nav class="fil" aria-label="Chapitres">
    <button class="btn-lien" onclick={() => ouvrir(null)}>Sommaire</button>
    <span class="discret">Chapitre {rang + 1} sur {chapitres.length}</span>
  </nav>

  <article class="carte chapitre">
    <h2>{chapitre.titre}</h2>
    <div class="corps-carte">
      <p class="resume">{chapitre.resume}</p>
      {#each chapitre.sections as sec}
        <h3>{sec.titre}</h3>
        {#each sec.blocs as b}
          {#if b.type === 'p'}
            <p>{b.texte}</p>
          {:else if b.type === 'retenir'}
            <p class="retenir"><b>À retenir :</b> {b.texte}</p>
          {:else if b.type === 'liste'}
            <ul>{#each b.items as it}<li>{it}</li>{/each}</ul>
          {:else if b.type === 'tableau'}
            <table class="tableau">
              <thead><tr>{#each b.entetes as e}<th>{e}</th>{/each}</tr></thead>
              <tbody>{#each b.lignes as l}<tr>{#each l as cel}<td>{cel}</td>{/each}</tr>{/each}</tbody>
            </table>
          {:else if b.type === 'ecritures'}
            {#if b.titre}<p class="titre-ex">{b.titre}</p>{/if}
            <table class="ecritures">
              <thead>
                <tr><th>Opération</th><th>Débit</th><th>Crédit</th><th class="montant">Montant</th></tr>
              </thead>
              <tbody>
                {#each b.exemples as ex}
                  {#each lignes(ex) as l, i}
                    <tr class:suite={i > 0}>
                      <td>{i === 0 ? ex.cas : ''}</td>
                      <td>{#if l.debit}{compte(l.debit)} <span class="numero">{l.debit}</span>{/if}</td>
                      <td>{#if l.credit}{compte(l.credit)} <span class="numero">{l.credit}</span>{/if}</td>
                      <td class="montant num">{l.montant}</td>
                    </tr>
                  {/each}
                {/each}
              </tbody>
            </table>
          {/if}
        {/each}
      {/each}
      {#if chapitre.bases?.length}
        <h3>Bases légales</h3>
        <ul class="bases">{#each chapitre.bases as base}<li>{base}</li>{/each}</ul>
      {/if}
    </div>
  </article>

  <div class="suivants">
    {#if rang > 0}
      <button class="btn" onclick={() => ouvrir(chapitres[rang - 1]!.id)}>Chapitre précédent : {chapitres[rang - 1]!.titre}</button>
    {/if}
    {#if rang < chapitres.length - 1}
      <button class="btn" onclick={() => ouvrir(chapitres[rang + 1]!.id)}>Chapitre suivant : {chapitres[rang + 1]!.titre}</button>
    {/if}
  </div>
{/if}

<style>
  .avis { margin: -6px 0 12px; }
  .petit { font-size: 12px; }
  .sommaire { margin: 0; padding: 10px 14px 14px 36px; }
  .sommaire li { padding: 6px 0; }
  .sommaire li span { display: block; font-size: 13px; }
  .lien-chapitre {
    border: none; background: none; padding: 0; font: inherit; font-weight: bold; color: var(--c-structure);
    cursor: pointer; text-align: left;
  }
  .lien-chapitre:hover { text-decoration: underline; }
  .fil { display: flex; gap: 16px; align-items: center; margin-bottom: 10px; }
  .chapitre p, .chapitre li { max-width: 80ch; line-height: 1.5; }
  .resume { font-style: italic; color: var(--c-texte-2); margin-top: 0; }
  h3 { font-size: 15px; color: var(--c-structure); margin: 20px 0 6px; }
  .retenir { border-left: 4px solid var(--c-structure); background: var(--c-zebra); padding: 8px 12px; }
  .titre-ex { font-weight: bold; margin-bottom: 4px; }
  table.tableau, table.ecritures { margin: 6px 0 12px; }
  .tableau td, .ecritures td { vertical-align: top; }
  .tableau tbody tr:nth-child(even) { background: var(--c-zebra); }
  .ecritures tbody tr:not(.suite) td { border-top: 1px solid var(--c-bordure); }
  .ecritures tbody tr:first-child td { border-top: none; }
  .numero { font-size: 11px; color: var(--c-texte-2); font-variant-numeric: tabular-nums; }
  .montant { text-align: right; white-space: nowrap; }
  .bases { font-size: 13px; }
  .suivants { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
</style>
