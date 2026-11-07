<script lang="ts">
  import { etat } from '../etat.svelte';
  import { bilan } from '../../engine/statements';
  import { estBoucle } from '../../engine/closing';
  import { dt, m } from '../format';
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
  /** Chiffres clés lus dans le bilan affiché (liquidités = comptes 1000 à 1059, comme le tableau des flux). */
  const postes = $derived(b.actif.flatMap((g) => g.postes));
  const liquidites = $derived(postes.filter((p) => p.numero >= '1000' && p.numero <= '1059').reduce((x, p) => x + p.montant, 0));
  const capitauxPropres = $derived(b.passif.find((g) => g.titre === 'Capitaux propres')?.total ?? 0);
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

<div class="chiffres" aria-label="Chiffres clés">
  <div class="tuile"><span class="etiq">Total du bilan</span><span class="val num">{m(b.totalActif)}</span></div>
  <div class="tuile"><span class="etiq">Liquidités</span><span class="val num">{m(liquidites)}</span></div>
  <div class="tuile"><span class="etiq">Capitaux propres</span><span class="val num">{m(capitauxPropres)}</span></div>
  <div class="tuile">
    <span class="etiq">{b.resultat < 0 ? "Perte de l'exercice" : "Bénéfice de l'exercice"}</span>
    <span class="val num" class:negatif={b.resultat < 0}>{m(Math.abs(b.resultat))}</span>
  </div>
</div>

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
  .chiffres { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
  .tuile { background: #fff; border: 1px solid var(--c-bordure-2); border-radius: var(--rayon); box-shadow: var(--ombre); padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
  .etiq { font-size: 12px; color: var(--c-texte-2); text-transform: uppercase; letter-spacing: 0.05em; font-weight: bold; }
  .val { font-size: 21px; font-weight: bold; color: var(--c-texte); }
  .val.negatif { color: var(--c-negatif); }
  @media (max-width: 1100px) { .chiffres { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  p { margin-top: 12px; }
</style>
