<script lang="ts">
  import { etat } from '../etat.svelte';
  import { bilan } from '../../engine/statements';
  import { estBoucle } from '../../engine/closing';
  import { dt } from '../format';
  import EtatEnCompte from '../composants/EtatEnCompte.svelte';

  const d = $derived(etat.dossier);
  let quel = $state<'actuel' | 'ouverture'>('actuel');
  const source = $derived(quel === 'ouverture' ? { ...d, ecritures: [] } : d);
  const b = $derived(bilan(source));
  const boucle = $derived(d.ecritures.length > 0 && estBoucle(d));
  const derniereDate = $derived(d.ecritures.reduce((x, e) => (e.date > x ? e.date : x), d.debut));
  const titre = $derived(
    quel === 'ouverture'
      ? `Bilan d'ouverture au ${dt(d.debut)}`
      : boucle
        ? `Bilan de clôture au ${dt(d.fin)}`
        : `Bilan au ${dt(derniereDate)}`,
  );
</script>

<div class="titre">
  <h1>{titre}</h1>
  <div class="options">
    <div class="segments" role="group" aria-label="Bilan affiché">
      <button aria-pressed={quel === 'ouverture'} onclick={() => (quel = 'ouverture')}>Ouverture</button>
      <button aria-pressed={quel === 'actuel'} onclick={() => (quel = 'actuel')}>Actuel</button>
    </div>
    <label><input type="checkbox" bind:checked={etat.prefs.numerosComptes} /> Numéros de comptes</label>
    <span class="discret">Montants en CHF</span>
  </div>
</div>

{#if quel === 'actuel' && !boucle && d.ecritures.length > 0}
  <div class="info bandeau">
    <b>Bilan provisoire.</b> L'exercice n'est pas bouclé :
    {#if b.resultat > 0}le bénéfice de l'exercice figure dans les capitaux propres.
    {:else if b.resultat < 0}la perte de l'exercice figure à l'actif.
    {:else}le résultat de l'exercice est nul.{/if}
  </div>
{/if}

<EtatEnCompte
  gauche={{ titre: 'Actif', groupes: b.actif, total: b.totalActif, libelleTotal: "Total de l'actif" }}
  droite={{ titre: 'Passif', groupes: b.passif, total: b.totalPassif, libelleTotal: 'Total du passif' }}
  numeros={etat.prefs.numerosComptes}
/>

{#if b.equilibre}
  <p class="ok">Total de l'actif = total du passif</p>
{:else}
  <p class="alerte">Le total de l'actif ne correspond pas au total du passif. Vérifiez le bilan d'ouverture.</p>
{/if}

<style>
  .options { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
  .bandeau { margin-bottom: 16px; }
  p { margin-top: 12px; }
</style>
