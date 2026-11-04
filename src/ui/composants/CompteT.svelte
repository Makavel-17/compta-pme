<script lang="ts">
  import type { CompteEnT } from '../../engine/ledger';
  import { m } from '../format';

  let {
    t,
    libelles,
    compact = false,
  }: { t: CompteEnT; libelles: { initial: string; final: string; initialLong: string; finalLong: string }; compact?: boolean } =
    $props();
</script>

<div class="compte-t" class:compact>
  <div class="entete-t"><span class="num">{t.numero}</span> {t.intitule}</div>
  <div class="cotes">
    <div class="sens">Débit</div>
    <div class="sens">Crédit</div>
    {#each ['D', 'C'] as const as cote}
      {@const lignes = cote === 'D' ? t.debit : t.credit}
      <div class="cote" class:gauche={cote === 'D'}>
        {#each lignes as l}
          <div class="ligne" class:ouverture={l.nature === 'ouverture'}>
            <span class="ref" title={l.nature === 'ouverture' ? libelles.initialLong : `Pièce ${l.piece} · ${l.libelle}`}>
              {l.nature === 'ouverture' ? libelles.initial : l.piece}
            </span>
            {#if !compact && l.nature === 'mouvement'}<span class="lib">{l.libelle}</span>{/if}
            <span class="montant">{m(l.montant)}</span>
          </div>
        {/each}
        {#if t.solde.cote === cote}
          <div class="ligne solde">
            <span class="ref" title={libelles.finalLong}>{libelles.final}</span>
            {#if !compact}<span class="lib"></span>{/if}
            <span class="montant">{m(t.solde.montant)}</span>
          </div>
        {/if}
      </div>
    {/each}
    <div class="total gauche"><span class="montant">{m(t.totalEquilibre)}</span></div>
    <div class="total"><span class="montant">{m(t.totalEquilibre)}</span></div>
  </div>
</div>

<style>
  .compte-t { background: var(--c-fond); border: 1px solid var(--c-bordure); border-radius: 4px; padding: 10px 12px 12px; }
  .entete-t { text-align: center; font-weight: bold; color: var(--c-structure); padding-bottom: 6px; }
  .cotes { display: grid; grid-template-columns: 1fr 1fr; }
  .sens { text-align: center; font-size: 12px; color: var(--c-texte-2); border-bottom: 2px solid var(--c-texte); padding-bottom: 3px; }
  .cote { padding: 4px 8px 6px; display: flex; flex-direction: column; gap: 2px; }
  .gauche { border-right: 2px solid var(--c-texte); }
  .ligne { display: grid; grid-template-columns: 36px 1fr auto; gap: 6px; align-items: baseline; }
  .compact .ligne { grid-template-columns: 30px 1fr; }
  .ref { color: var(--c-texte-2); font-size: 12px; font-variant-numeric: tabular-nums; }
  .ouverture .ref, .solde .ref { font-weight: bold; color: var(--c-structure); }
  .lib { font-size: 12px; color: var(--c-texte-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .solde .montant { font-style: italic; }
  .total { padding: 3px 8px 0; border-top: 1px solid var(--c-texte); text-align: right; font-weight: bold; }
  .total .montant { border-bottom: 3px double var(--c-texte); display: inline-block; }
</style>
