<script lang="ts">
  import { etat } from '../etat.svelte';
  import { estBoucle, reouvrir } from '../../engine/closing';
  import { compteDeResultat } from '../../engine/statements';
  import { m } from '../format';
  import { bouclementCorrige, diagnostiquerBouclement } from '../../engine/correction-bouclement';
  import { INDICES } from '../../engine/correction';

  const d = $derived(etat.dossier);
  const mode = $derived(etat.exercice.parametres.modeBouclement);
  const boucle = $derived(d.ecritures.length > 0 && estBoucle(d));
  const cr = $derived(compteDeResultat(d));
  const correction = $derived(
    etat.exercice.mode === 'entrainement' && etat.session!.role === 'eleve' && bouclementCorrige(etat.exercice)
      ? diagnostiquerBouclement(d, etat.exercice)
      : null,
  );

  function rouvrir() {
    if (!confirm("Ouvrir l'exercice suivant ? L'exercice actuel sera archivé.")) return;
    const r = reouvrir(d, mode);
    if (!r.ok) return alert(r.erreurs.join('\n'));
    etat.session!.archives.push(d);
    etat.majDossier(r.valeur);
  }
</script>

<div class="titre"><h1>Bouclement</h1></div>

{#if correction}
  <section class="carte correction">
    <h2>Correction du bouclement</h2>
    <div class="corps-carte">
      {#if correction === 'juste'}
        <p class="ok">Vos écritures de bouclement sont justes.</p>
      {:else if correction === 'manquante'}
        <p class="discret">Aucune écriture de bouclement saisie pour l'instant.</p>
      {:else if correction === 'incomplete'}
        <p class="discret">{INDICES.incomplete}</p>
      {:else}
        <p class="revoir"><b>À revoir.</b> {INDICES[correction]}</p>
      {/if}
      <p class="discret petit">
        Les écritures attendues sont calculées d'après vos propres comptes : une erreur dans une opération n'est pas
        comptée une deuxième fois au bouclement.
      </p>
    </div>
  </section>
{/if}

<section class="carte">
  <h2>Détermination du résultat</h2>
  <div class="corps-carte">
    {#if boucle}
      <p class="ok">L'exercice est bouclé : charges, produits, compte privé et compte de résultat sont soldés.</p>
    {:else}
      <p>Total des produits {m(cr.totalProduits)} − total des charges {m(cr.totalCharges)} =
        <b>{cr.resultat >= 0 ? 'bénéfice' : 'perte'} de {m(Math.abs(cr.resultat))}</b>.</p>
      {#if mode === 'compteDeResultat'}
        <p class="discret">Passez au journal les écritures de bouclement (compte privé, clôture des charges et produits par le compte 9000, résultat), avec des pièces B1, B2, B3.</p>
      {/if}
    {/if}
    <button class="btn btn-principal" disabled={mode === 'compteDeResultat' && !boucle} onclick={rouvrir}>Ouvrir l'exercice suivant</button>
  </div>
</section>

<style>
  section { margin-bottom: 16px; }
  .revoir { color: var(--c-alerte-texte); }
  .petit { font-size: 12px; margin: 6px 0 0; }
</style>
