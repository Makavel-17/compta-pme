<!-- Tableau de répartition du bénéfice (SA, Sàrl) : l'élève calcule ; en entraînement, les montants faux sont signalés. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { repartir, TAUX_IMPOT_ANTICIPE, type TableauRepartition } from '../../engine/repartition';
  import { m } from '../format';
  import ChampMontant from '../composants/ChampMontant.svelte';

  const ex = $derived(etat.exercice);
  const donnees = $derived(ex.parametres.repartition);
  const attendu = $derived(donnees ? repartir(donnees) : null);
  const entrainement = $derived(ex.mode === 'entrainement');
  const capital = $derived(ex.formeJuridique === 'SA' ? 'capital-actions' : 'capital social');

  type Cle = keyof TableauRepartition;
  const lignes: { cle: Cle; libelle: string }[] = [
    { cle: 'disponible', libelle: 'Bénéfice disponible (bénéfice de l\'exercice ± report)' },
    { cle: 'reserveLegale', libelle: 'Attribution à la réserve légale issue du bénéfice' },
    { cle: 'dividendes', libelle: 'Dividendes (brut)' },
    { cle: 'tantiemes', libelle: 'Tantièmes' },
    { cle: 'reservesLibres', libelle: 'Attribution aux réserves libres' },
    { cle: 'nouveauReporte', libelle: 'Nouveau bénéfice reporté' },
    { cle: 'impotAnticipe', libelle: `Impôt anticipé (${TAUX_IMPOT_ANTICIPE} % des dividendes)` },
    { cle: 'dividendeNet', libelle: 'Dividendes nets versés aux associés' },
  ];
  let saisies = $state(Object.fromEntries(lignes.map((l) => [l.cle, null])) as Record<Cle, number | null>);

  function faux(cle: Cle): boolean {
    const v = saisies[cle];
    return entrainement && !!attendu?.ok && v !== null && v !== undefined && Math.abs(v - attendu.tableau[cle]) > 5;
  }
</script>

<div class="titre">
  <h1>Répartition du bénéfice</h1>
  <span class="sous">Art. 672 CO (droit révisé, dès 2023)</span>
</div>

{#if !donnees}
  <p class="vide carte">L'enseignant n'a pas défini de données de répartition pour cet exercice.</p>
{:else}
  <section class="carte">
    <h2>Données</h2>
    <table class="donnees">
      <tbody>
        <tr><td>Bénéfice de l'exercice</td><td class="montant">{m(donnees.benefice)}</td></tr>
        <tr><td>{donnees.reporte >= 0 ? 'Bénéfice reporté' : 'Perte reportée'}</td><td class="montant">{m(Math.abs(donnees.reporte))}</td></tr>
        <tr><td>Capital inscrit au registre du commerce ({capital})</td><td class="montant">{m(donnees.capital)}</td></tr>
        <tr><td>Réserve légale issue du capital</td><td class="montant">{m(donnees.reserveLegaleCapital)}</td></tr>
        <tr><td>Réserve légale issue du bénéfice</td><td class="montant">{m(donnees.reserveLegaleBenefice)}</td></tr>
        <tr><td>Dividende décidé par l'assemblée générale</td><td class="montant">{(donnees.tauxDividende / 100).toFixed(2)} % du capital</td></tr>
        <tr><td>Tantièmes</td><td class="montant">{m(donnees.tantiemes)}</td></tr>
        <tr><td>Attribution aux réserves libres</td><td class="montant">{m(donnees.reservesLibres)}</td></tr>
        {#if donnees.holding}<tr><td colspan="2">Société holding</td></tr>{/if}
      </tbody>
    </table>
  </section>

  <section class="carte">
    <h2>Tableau de répartition</h2>
    <table class="tableau">
      <tbody>
        {#each lignes as l}
          <tr>
            <td>{l.libelle}</td>
            <td style="width:170px">
              <ChampMontant id={`rep-${l.cle}`} libelle={l.libelle} bind:valeur={saisies[l.cle]} />
              {#if faux(l.cle)}<div class="faux">Montant à revoir</div>{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if entrainement && attendu && !attendu.ok}
      <p class="alerte" style="margin:0 14px 14px">{attendu.erreur}</p>
    {/if}
  </section>
  <p class="discret note">
    Cette fiche sert au calcul. Les écritures de la répartition (depuis 2970 Bénéfice reporté) et du paiement des dividendes
    se passent ensuite dans le journal.
  </p>
{/if}

<style>
  section { margin-bottom: 16px; }
  .donnees, .tableau { width: auto; min-width: 560px; margin: 8px 14px 12px; }
  .donnees td { border-bottom: 1px solid var(--c-bordure-2); }
  .tableau td { border-bottom: none; padding: 4px 8px; vertical-align: top; }
  .faux { font-size: 12px; color: var(--c-alerte-texte); font-weight: bold; text-align: right; }
  .note { margin-top: 0; }
</style>
