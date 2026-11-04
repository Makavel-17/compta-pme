<script lang="ts">
  import { etat } from '../etat.svelte';
  import { estBoucle, reouvrir } from '../../engine/closing';
  import { compteDeResultat } from '../../engine/statements';
  import { m } from '../format';

  const d = $derived(etat.dossier);
  const mode = $derived(etat.exercice.parametres.modeBouclement);
  const boucle = $derived(d.ecritures.length > 0 && estBoucle(d));
  const cr = $derived(compteDeResultat(d));

  function rouvrir() {
    if (!confirm("Ouvrir l'exercice suivant ? L'exercice actuel sera archivé.")) return;
    const r = reouvrir(d, mode);
    if (!r.ok) return alert(r.erreurs.join('\n'));
    etat.session!.archives.push(d);
    etat.majDossier(r.valeur);
  }
</script>

<div class="titre"><h1>Bouclement</h1></div>

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
