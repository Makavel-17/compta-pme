<!-- Affichage d'une pièce comptable avec l'aspect d'un document (facture, avis bancaire, quittance…). -->
<script lang="ts">
  import type { PieceComptable } from '../../engine/pieces';
  import { dt, m } from '../format';

  let { piece }: { piece: PieceComptable } = $props();
  const monnaie = $derived(piece.monnaie ?? 'CHF');
  const avecQuantites = $derived(piece.lignes.some((l) => l.quantite !== undefined));
</script>

<article class="piece" class:etroite={piece.type === 'ticket'} aria-label={piece.titre}>
  <header>
    <div class="emetteur">
      <strong>{piece.emetteur.nom}</strong>
      {#each piece.emetteur.adresse ?? [] as l}<div>{l}</div>{/each}
    </div>
    <div class="titre-piece">
      <div class="titre">{piece.titre}</div>
      {#if piece.numero}<div>N° {piece.numero}</div>{/if}
      <div>{dt(piece.date)}</div>
    </div>
  </header>

  {#if piece.destinataire}
    <div class="destinataire">
      <strong>{piece.destinataire.nom}</strong>
      {#each piece.destinataire.adresse ?? [] as l}<div>{l}</div>{/each}
    </div>
  {/if}

  {#each piece.texte ?? [] as t}<p>{t}</p>{/each}

  {#if piece.lignes.length}
    <table>
      <thead>
        <tr>
          <th>Désignation</th>
          {#if avecQuantites}<th class="montant">Quantité</th><th class="montant">Prix unitaire</th>{/if}
          <th class="montant">Montant {monnaie}</th>
        </tr>
      </thead>
      <tbody>
        {#each piece.lignes as l}
          <tr>
            <td>{l.designation}</td>
            {#if avecQuantites}
              <td class="montant">{l.quantite ?? ''}</td>
              <td class="montant">{l.prixUnitaire !== undefined ? m(l.prixUnitaire) : ''}</td>
            {/if}
            <td class="montant">{m(l.montant)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if piece.totaux.length}
    <div class="totaux">
      {#each piece.totaux as t}
        <div class:fort={t.fort}><span>{t.libelle}</span><span class="montant">{monnaie} {m(t.montant)}</span></div>
      {/each}
    </div>
  {/if}

  {#if piece.mentions?.length}
    <footer>{#each piece.mentions as x}<div>{x}</div>{/each}</footer>
  {/if}
</article>

<style>
  .piece {
    background: #fff; border: 1px solid #b8c2cc; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    padding: 16px 18px; max-width: 640px; font-size: 13px; color: #222;
  }
  .piece.etroite { max-width: 360px; }
  header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid #d5dbe1; padding-bottom: 8px; }
  .titre-piece { text-align: right; }
  .titre { font-weight: bold; letter-spacing: 0.04em; font-size: 14px; }
  .destinataire { margin: 10px 0 10px 50%; }
  p { margin: 8px 0; line-height: 1.45; }
  table { margin-top: 8px; }
  th { background: #eef2f6; color: #222; font-size: 12px; }
  td { padding: 4px 8px; }
  .totaux { margin: 8px 0 0 auto; max-width: 300px; }
  .totaux div { display: flex; justify-content: space-between; gap: 12px; padding: 2px 0; }
  .totaux .fort { font-weight: bold; border-top: 1px solid #222; padding-top: 4px; }
  footer { margin-top: 10px; font-size: 12px; color: #555; border-top: 1px dashed #c9d1d9; padding-top: 6px; }
</style>
