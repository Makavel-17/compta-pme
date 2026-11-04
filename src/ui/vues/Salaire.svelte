<!-- Fiche « Décompte de salaire » : l'élève calcule les retenues ; en entraînement, les montants faux sont signalés. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { controlerDecompte, type LigneRetenue } from '../../engine/salaire';
  import { formatMontant, lireMontant } from '../../engine/money';
  import { m } from '../format';
  import ChampMontant from '../composants/ChampMontant.svelte';

  type Ligne = { cle: number; libelle: string; taux: string; montant: number | null };
  let n = 0;
  const ligne = (libelle: string): Ligne => ({ cle: ++n, libelle, taux: '', montant: null });

  let brut = $state<number | null>(null);
  let lignes = $state<Ligne[]>([
    ligne('AVS/AI/APG/AC'),
    ligne('LPP'),
    ligne('Assurance accidents non professionnels (AANP)'),
    ligne('Avance de salaire'),
  ]);

  /** « 6,4 » ou « 6.4 » → 640 (centièmes de pour cent). */
  const lireTaux = (t: string): number | null => (t.trim() === '' ? null : lireMontant(t));

  const retenues = $derived<LigneRetenue[]>(
    lignes.map((l) => ({ libelle: l.libelle, taux: lireTaux(l.taux), base: null, montant: l.montant })),
  );
  const controle = $derived(brut !== null ? controlerDecompte(brut, retenues) : null);
  const entrainement = $derived(etat.exercice.mode === 'entrainement');
  const fausses = $derived(new Set(entrainement && controle ? controle.lignesFausses : []));
</script>

<div class="titre">
  <h1>Décompte de salaire</h1>
  <span class="sous">Fiche de calcul · les taux sont donnés par l'énoncé</span>
</div>

<section class="carte">
  <table class="fiche">
    <thead>
      <tr>
        <th>Rubrique</th>
        <th style="width:110px" class="montant">Taux en %</th>
        <th style="width:150px" class="montant">Montant CHF</th>
        <th style="width:30px"><span class="sr-only">Retirer</span></th>
      </tr>
    </thead>
    <tbody>
      <tr class="brut">
        <td><b>Salaire brut</b></td>
        <td></td>
        <td><ChampMontant id="fiche-brut" libelle="Salaire brut" bind:valeur={brut} /></td>
        <td></td>
      </tr>
      {#each lignes as l, i (l.cle)}
        <tr>
          <td><input class="champ" aria-label="Rubrique" bind:value={l.libelle} /></td>
          <td><input class="champ montant num" aria-label="Taux en %" inputmode="decimal" bind:value={l.taux} placeholder="—" /></td>
          <td>
            <ChampMontant id={`fiche-${l.cle}`} libelle={`Montant ${l.libelle}`} bind:valeur={l.montant} />
            {#if fausses.has(i)}<div class="faux">Montant à revoir (taux × salaire brut, arrondi aux 5 centimes)</div>{/if}
          </td>
          <td><button class="retirer" aria-label="Retirer la ligne" onclick={() => lignes.splice(i, 1)}>×</button></td>
        </tr>
      {/each}
      <tr class="total">
        <td>Total des retenues</td>
        <td></td>
        <td class="montant">{controle ? m(controle.totalRetenues) : ''}</td>
        <td></td>
      </tr>
      <tr class="total">
        <td>Salaire net à verser</td>
        <td></td>
        <td class="montant">{controle ? m(controle.net) : ''}</td>
        <td></td>
      </tr>
    </tbody>
  </table>
  <div class="actions">
    <button class="btn-lien" onclick={() => lignes.push(ligne(''))}>Ajouter une rubrique</button>
    <span class="discret">Taux vide = montant fixe (par exemple une avance de salaire).</span>
  </div>
</section>

<p class="discret note">
  Cette fiche sert au calcul. Les écritures du décompte se passent ensuite dans le journal.
  {#if brut !== null && controle && controle.net < 0}<span class="faux">Le total des retenues dépasse le salaire brut ({formatMontant(brut)}).</span>{/if}
</p>

<style>
  .fiche td { border-bottom: none; padding: 4px 8px; vertical-align: top; }
  .fiche tr.brut td { background: var(--c-selection); }
  .retirer { border: none; background: none; color: var(--c-texte-2); font-size: 18px; cursor: pointer; padding: 6px 4px; }
  .faux { font-size: 12px; color: var(--c-alerte-texte); font-weight: bold; padding-top: 2px; }
  .actions { display: flex; gap: 14px; align-items: center; padding: 10px 14px; border-top: 1px solid var(--c-bordure-2); }
  .note { margin-top: 12px; }
</style>
