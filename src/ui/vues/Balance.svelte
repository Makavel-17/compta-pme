<script lang="ts">
  import { etat } from '../etat.svelte';
  import { balance } from '../../engine/ledger';
  import { m } from '../format';

  const b = $derived(balance(etat.dossier));
  const z = (x: number) => (x === 0 ? '' : m(x));
</script>

<div class="titre">
  <h1>Balance de vérification</h1>
  <span class="sous">Solde d'ouverture compris dans les totaux</span>
</div>

<section class="carte">
  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width:70px">Compte</th>
        <th rowspan="2">Intitulé</th>
        <th colspan="2" class="centre">Totaux</th>
        <th colspan="2" class="centre">Soldes</th>
      </tr>
      <tr>
        <th class="montant" style="width:120px">Débit</th>
        <th class="montant" style="width:120px">Crédit</th>
        <th class="montant" style="width:120px">Débiteurs</th>
        <th class="montant" style="width:120px">Créditeurs</th>
      </tr>
    </thead>
    <tbody>
      {#each b.lignes as l, i}
        <tr class:zebre={i % 2 === 1}>
          <td class="num">{l.numero}</td>
          <td>{l.intitule}</td>
          <td class="montant">{z(l.debit)}</td>
          <td class="montant">{z(l.credit)}</td>
          <td class="montant">{z(l.soldeDebiteur)}</td>
          <td class="montant">{z(l.soldeCrediteur)}</td>
        </tr>
      {/each}
      <tr class="total">
        <td colspan="2">Totaux</td>
        <td class="montant">{m(b.totalDebit)}</td>
        <td class="montant">{m(b.totalCredit)}</td>
        <td class="montant">{m(b.totalSoldesDebiteurs)}</td>
        <td class="montant">{m(b.totalSoldesCrediteurs)}</td>
      </tr>
    </tbody>
  </table>
</section>

{#if b.equilibree}
  <p class="ok">La balance est équilibrée : total débit = total crédit, soldes débiteurs = soldes créditeurs.</p>
{:else}
  <p class="alerte">La balance n'est pas équilibrée. Vérifiez le bilan d'ouverture.</p>
{/if}

<style>
  th.centre { text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.3); }
  p { margin-top: 12px; }
</style>
