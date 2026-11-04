<script lang="ts">
  import { etat } from '../etat.svelte';
  import { compteDeResultat } from '../../engine/statements';
  import { estBoucle } from '../../engine/closing';
  import { dt, m } from '../format';
  import EtatEnCompte from '../composants/EtatEnCompte.svelte';

  const d = $derived(etat.dossier);
  const boucle = $derived(d.ecritures.length > 0 && estBoucle(d));
  // Après bouclement, les comptes de charges et de produits sont soldés : on présente
  // le compte de résultat tel qu'il était juste avant les écritures de bouclement.
  const source = $derived(boucle ? { ...d, ecritures: d.ecritures.filter((e) => !e.piece.startsWith('B')) } : d);
  const cr = $derived(compteDeResultat(source));
  const derniereDate = $derived(d.ecritures.reduce((x, e) => (e.date > x ? e.date : x), d.debut));
</script>

<div class="titre">
  <h1>Compte de résultat du {dt(d.debut)} au {dt(boucle ? d.fin : derniereDate)}</h1>
  <div class="options">
    <label><input type="checkbox" bind:checked={etat.prefs.numerosComptes} /> Numéros de comptes</label>
    <span class="discret">Montants en CHF</span>
  </div>
</div>

{#if d.ecritures.length === 0}
  <p class="vide carte">Aucune charge ni aucun produit pour l'instant. Saisissez des écritures dans le journal.</p>
{:else}
  <EtatEnCompte
    gauche={{
      titre: 'Charges',
      groupes: cr.charges,
      resultat: cr.resultat > 0 ? { numero: '', intitule: "Bénéfice de l'exercice", montant: cr.resultat } : null,
      total: cr.totalEquilibre,
    }}
    droite={{
      titre: 'Produits',
      groupes: cr.produits,
      resultat: cr.resultat < 0 ? { numero: '', intitule: "Perte de l'exercice", montant: -cr.resultat } : null,
      total: cr.totalEquilibre,
    }}
    numeros={etat.prefs.numerosComptes}
  />
  <p class="discret">
    Total des produits moins total des charges :
    <b>{cr.resultat >= 0 ? 'bénéfice' : 'perte'} de {m(Math.abs(cr.resultat))}</b>.
  </p>
{/if}

<style>
  .options { display: flex; gap: 18px; align-items: center; }
  p { margin-top: 12px; }
</style>
