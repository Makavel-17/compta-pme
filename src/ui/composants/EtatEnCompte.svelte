<!-- État financier en forme de compte : deux colonnes, groupes, sous-totaux, totaux soulignés deux fois. -->
<script lang="ts" module>
  import type { Groupe, Poste } from '../../engine/statements';

  export interface Colonne {
    titre: string;
    groupes: Groupe[];
    /** Ligne de résultat ajoutée en bas de la colonne (compte de résultat). */
    resultat?: Poste | null;
    total: number;
    /** Libellé de la ligne de total (par défaut « Total »). */
    libelleTotal?: string;
  }
</script>

<script lang="ts">
  import { m } from '../format';

  let { gauche, droite, numeros }: { gauche: Colonne; droite: Colonne; numeros: boolean } = $props();
</script>

<section class="carte etat" class:sans-numeros={!numeros}>
  {#each [gauche, droite] as col, ci}
    <div class="colonne" class:separee={ci === 1}>
      <div class="tete">{col.titre}</div>
      <div class="corps">
        {#if col.groupes.length === 0 && !col.resultat}
          <p class="vide">Aucun montant.</p>
        {/if}
        {#each col.groupes as g}
          {#if g.titre}<div class="groupe">{g.titre}</div>{/if}
          {#each g.postes as p, i}
            <div class="poste" class:zebre={i % 2 === 1} class:resultat={p.numero === ''}>
              <span class="n num">{p.numero}</span>
              <span class="lib">{p.intitule}</span>
              <span class="montant" class:negatif={p.montant < 0}>{g.titre ? m(p.montant) : ''}</span>
              <span class="montant" class:sous-total={!g.titre}>{g.titre ? '' : m(p.montant)}</span>
            </div>
          {/each}
          {#if g.titre}
            <div class="poste"><span></span><span></span><span></span><span class="montant sous-total">{m(g.total)}</span></div>
          {/if}
        {/each}
        {#if col.resultat}
          <div class="poste resultat">
            <span></span>
            <span class="lib">{col.resultat.intitule}</span>
            <span></span>
            <span class="montant">{m(col.resultat.montant)}</span>
          </div>
        {/if}
      </div>
      <div class="pied"><span>{col.libelleTotal ?? 'Total'}</span><span class="montant">{m(col.total)}</span></div>
    </div>
  {/each}
</section>

<style>
  .etat { display: grid; grid-template-columns: 1fr 1fr; }
  .colonne { display: flex; flex-direction: column; min-width: 0; }
  .separee { border-left: 2px solid var(--c-structure); }
  .tete { background: var(--c-structure); color: #fff; font-weight: bold; padding: 8px 14px; }
  .corps { flex: 1; padding: 6px 0; }
  .groupe { font-weight: bold; color: var(--c-structure); padding: 10px 14px 4px; }
  .poste { display: grid; grid-template-columns: 48px minmax(0, 1fr) 110px 110px; padding: 4px 14px; }
  .sans-numeros .poste { grid-template-columns: 0 minmax(0, 1fr) 110px 110px; }
  .sans-numeros .n { visibility: hidden; }
  .poste.zebre { background: var(--c-zebra); }
  .n { color: var(--c-texte-2); }
  .sous-total { border-top: 1px solid var(--c-texte); font-weight: bold; }
  .resultat .lib { font-style: italic; }
  .pied {
    display: flex; justify-content: space-between; padding: 9px 14px; font-weight: bold;
    border-top: 1px solid var(--c-texte); border-bottom: 3px double var(--c-texte);
  }
  @media (max-width: 1100px) {
    .poste { grid-template-columns: 40px minmax(0, 1fr) 90px 90px; }
    .sans-numeros .poste { grid-template-columns: 0 minmax(0, 1fr) 90px 90px; }
  }
</style>
