<script lang="ts">
  import { etat } from '../etat.svelte';
  import { decompteTva, tvaSurHT, tvaSurTTC, TAUX_TVA, LIBELLES_TAUX } from '../../engine/tva';
  import { lireMontant, type Centimes } from '../../engine/money';
  import { m } from '../format';

  const d = $derived(etat.dossier);
  const ex = $derived(etat.exercice);
  const dec = $derived(decompteTva(d));
  const intitules = $derived(new Map(d.plan.map((c) => [c.numero, c.intitule])));
  const entrainement = $derived(ex.mode === 'entrainement');
  const methode = $derived(ex.parametres.tvaMethode === 'brut' ? 'au brut' : 'au net');

  // Calculatrice (si activée par l'enseignant)
  let saisie = $state('');
  let base = $state<'HT' | 'TTC'>('HT');
  let taux = $state<number>(TAUX_TVA.normal);
  const calcul = $derived.by(() => {
    const montant = lireMontant(saisie);
    if (montant === null || montant <= 0) return null;
    const tva: Centimes = base === 'HT' ? tvaSurHT(montant, taux) : tvaSurTTC(montant, taux);
    return base === 'HT' ? { ht: montant, tva, ttc: montant + tva } : { ht: montant - tva, tva, ttc: montant };
  });
</script>

<div class="titre">
  <h1>TVA</h1>
  <span class="sous">Méthode effective · comptabilisation {methode}</span>
</div>

<section class="carte">
  <h2>Décompte de TVA d'après les soldes actuels</h2>
  <table class="decompte">
    <tbody>
      <tr><td class="num">2200</td><td>{intitules.get('2200')}</td><td class="montant">{m(dec.tvaDue)}</td></tr>
      <tr><td class="num">1170</td><td>./. {intitules.get('1170')}</td><td class="montant">{m(dec.ipMarchandises)}</td></tr>
      <tr><td class="num">1171</td><td>./. {intitules.get('1171')}</td><td class="montant">{m(dec.ipInvestissements)}</td></tr>
      <tr class="total">
        <td></td>
        <td>{dec.solde >= 0 ? "Solde dû à l'AFC" : "Solde à recevoir de l'AFC"}</td>
        <td class="montant">{m(Math.abs(dec.solde))}</td>
      </tr>
    </tbody>
  </table>
  <p class="discret pied">
    Solde actuel du compte 2205 {intitules.get('2205')} : <b class="num">{m(dec.detteAfc)}</b>.
  </p>
</section>

{#if entrainement}
  <div class="info rappel">
    <b>Rappel de la démarche.</b> À la fin de la période de décompte, l'impôt préalable est viré en diminution de la TVA
    due ; le solde est ensuite viré dans le compte de dette envers l'AFC, puis payé. Ces écritures se passent dans le
    journal.
  </div>
{/if}

<section class="carte">
  <h2>Taux de TVA</h2>
  <ul class="taux">
    {#each Object.entries(LIBELLES_TAUX) as [, libelle]}<li>{libelle}</li>{/each}
  </ul>
  <p class="discret pied">Les montants de TVA s'arrondissent aux 5 centimes.</p>
</section>

{#if etat.fonctions.has('calculatriceTva')}
  <section class="carte">
    <h2>Calculatrice de TVA</h2>
    <div class="calc">
      <label>
        <span class="discret">Montant</span>
        <input class="champ montant num" bind:value={saisie} inputmode="decimal" placeholder="0.00" />
      </label>
      <div class="segments" role="group" aria-label="Le montant est">
        <button aria-pressed={base === 'HT'} onclick={() => (base = 'HT')}>Hors taxe</button>
        <button aria-pressed={base === 'TTC'} onclick={() => (base = 'TTC')}>TVA comprise</button>
      </div>
      <select class="champ" bind:value={taux} aria-label="Taux">
        <option value={TAUX_TVA.normal}>8,1 %</option>
        <option value={TAUX_TVA.reduit}>2,6 %</option>
        <option value={TAUX_TVA.hebergement}>3,8 %</option>
      </select>
    </div>
    {#if calcul}
      <table class="decompte">
        <tbody>
          <tr><td>Hors taxe</td><td class="montant">{m(calcul.ht)}</td></tr>
          <tr><td>TVA</td><td class="montant">{m(calcul.tva)}</td></tr>
          <tr class="total"><td>TVA comprise</td><td class="montant">{m(calcul.ttc)}</td></tr>
        </tbody>
      </table>
    {/if}
  </section>
{/if}

<style>
  section { margin-bottom: 16px; }
  .decompte { width: auto; min-width: 460px; margin: 10px 14px; }
  .decompte td { border-bottom: 1px solid var(--c-bordure-2); }
  .decompte td.montant { width: 130px; }
  .pied { padding: 0 14px 12px; margin: 0; }
  .rappel { margin-bottom: 16px; }
  .taux { margin: 10px 0 6px; }
  .calc { display: flex; gap: 12px; align-items: flex-end; padding: 12px 14px 0; flex-wrap: wrap; }
  .calc label { display: flex; flex-direction: column; gap: 4px; width: 160px; }
  .calc select { width: 110px; }
</style>
