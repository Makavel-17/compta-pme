<!--
  Fiche de calcul générique : l'élève saisit des résultats ; en entraînement, chacun est vérifié
  (montants à 5 centimes près, pour cent à 0.1 point près, quantités à 0.01 près).
-->
<script lang="ts" module>
  export type TypeValeur = 'chf' | 'pc' | 'nombre';
  export interface LigneCalcul {
    cle: string;
    libelle: string;
    formule?: string;
    type: TypeValeur;
    /** Valeur attendue : centimes pour « chf », nombre pour « pc » et « nombre ». */
    attendu: number | null;
    /** Ligne de résultat (mise en gras). */
    fort?: boolean;
  }
  export interface SectionCalcul {
    titre?: string;
    lignes: LigneCalcul[];
  }
</script>

<script lang="ts">
  import { lireMontant } from '../../engine/money';

  let {
    sections,
    saisies,
    entrainement,
  }: { sections: SectionCalcul[]; saisies: Record<string, string>; entrainement: boolean } = $props();

  const unite = (t: TypeValeur) => (t === 'chf' ? 'CHF' : t === 'pc' ? '%' : '');

  function controle(l: LigneCalcul): 'juste' | 'faux' | null {
    const brut = (saisies[l.cle] ?? '').trim();
    if (!entrainement || brut === '' || l.attendu === null || !Number.isFinite(l.attendu)) return null;
    if (l.type === 'chf') {
      const c = lireMontant(brut);
      if (c === null) return 'faux';
      return Math.abs(c - l.attendu) <= 5 ? 'juste' : 'faux';
    }
    const n = Number(brut.replace(/['\s]/g, '').replace(',', '.').replace('%', ''));
    if (Number.isNaN(n)) return 'faux';
    const tolerance = l.type === 'pc' ? 0.1 : 0.01;
    return Math.abs(n - l.attendu) <= tolerance + 1e-9 ? 'juste' : 'faux';
  }
</script>

{#each sections as s, k (k)}
  <section class="carte">
    {#if s.titre}<h2>{s.titre}</h2>{/if}
    <table>
      <thead>
        <tr>
          <th>Élément</th>
          <th>Calcul</th>
          <th class="montant" style="width:160px">Votre résultat</th>
          {#if entrainement}<th style="width:100px">Contrôle</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each s.lignes as l, i (l.cle)}
          {@const e = controle(l)}
          <tr class:zebre={i % 2 === 1} class:fort={l.fort}>
            <td>{l.libelle}</td>
            <td class="discret">{l.formule ?? ''}</td>
            <td>
              <span class="saisie">
                <input class="champ montant num" inputmode="decimal" aria-label={l.libelle} bind:value={saisies[l.cle]} />
                <span class="unite">{unite(l.type)}</span>
              </span>
            </td>
            {#if entrainement}
              <td class:juste={e === 'juste'} class:faux={e === 'faux'}>{e === 'juste' ? 'Juste' : e === 'faux' ? 'À revoir' : ''}</td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/each}

<style>
  section { margin-bottom: 16px; }
  h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
  .fort td:first-child { font-weight: bold; }
  .saisie { display: flex; align-items: center; gap: 6px; }
  .unite { width: 28px; color: var(--c-texte-2); font-size: 12px; }
  .juste { color: var(--c-ok); font-weight: bold; }
  .faux { color: var(--c-alerte-texte); font-weight: bold; }
</style>
