<script lang="ts">
  import { untrack } from 'svelte';
  import { lireMontant, formatMontant, type Centimes } from '../../engine/money';

  let {
    valeur = $bindable(null),
    libelle,
    id,
  }: { valeur: Centimes | null; libelle: string; id: string } = $props();

  let texte = $state(valeur === null ? '' : formatMontant(valeur));
  let invalide = $state(false);

  // Remise à zéro décidée par le parent : la valeur passe à null alors que le texte contient un montant.
  $effect(() => {
    if (valeur !== null) return;
    const c = lireMontant(untrack(() => texte));
    if (c !== null && c > 0) {
      texte = '';
      invalide = false;
    }
  });

  function saisie() {
    const t = texte.trim();
    const c = t === '' ? null : lireMontant(t);
    valeur = c !== null && c > 0 ? c : null;
    invalide = false;
  }

  function sortie() {
    const t = texte.trim();
    if (t === '') return;
    const c = lireMontant(t);
    if (c === null || c <= 0) invalide = true;
    else texte = formatMontant(c);
  }
</script>

<input
  {id}
  class="champ montant num"
  class:invalide
  aria-label={libelle}
  aria-invalid={invalide}
  inputmode="decimal"
  autocomplete="off"
  data-champ
  bind:value={texte}
  oninput={saisie}
  onblur={sortie}
/>
{#if invalide}<div class="erreur">Montant invalide, ex. 1'250.50</div>{/if}

<style>
  .erreur { font-size: 12px; color: var(--c-negatif); padding-top: 2px; text-align: right; }
</style>
