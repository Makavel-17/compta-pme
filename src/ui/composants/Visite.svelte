<!-- Visite guidée : cinq étapes au maximum, désactivable, sans animation. -->
<script lang="ts">
  import { tick } from 'svelte';
  import { etat } from '../etat.svelte';

  const etapes = [
    {
      cible: 'navigation',
      titre: 'Navigation',
      texte: 'La barre latérale donne accès aux parties du dossier : journal, comptes, états financiers et bouclement.',
    },
    {
      cible: 'entete',
      titre: 'En-tête',
      texte: "L'en-tête rappelle en permanence l'entreprise, l'exercice, votre niveau et le mode de travail.",
    },
    {
      cible: 'enonce',
      titre: 'Énoncé',
      texte: "L'énoncé liste les opérations à comptabiliser. Cliquez sur une opération pour la sélectionner.",
    },
    {
      cible: 'saisie',
      titre: 'Saisie des écritures',
      texte:
        'Indiquez la date, le numéro de pièce (numéro de l\'opération), le libellé, les comptes et le montant. Cliquez dans un champ compte pour ouvrir la liste. Tab passe au champ suivant, Entrée à la ligne suivante.',
    },
    {
      cible: 'equilibre',
      titre: 'Équilibre débit / crédit',
      texte:
        "Tant que le total débit et le total crédit diffèrent, l'écart s'affiche ici. L'écriture ne peut être validée qu'une fois équilibrée.",
    },
  ];

  let i = $state(0);
  let nePlusAfficher = $state(true);
  let rect = $state<DOMRect | null>(null);
  let bulle: HTMLDivElement | undefined = $state();

  async function mesurer() {
    if (etat.vue !== 'journal') etat.aller('journal');
    await tick();
    const el = document.querySelector<HTMLElement>(`[data-visite="${etapes[i]!.cible}"]`);
    el?.scrollIntoView({ block: 'nearest' });
    rect = el ? el.getBoundingClientRect() : null;
    await tick();
    bulle?.querySelector<HTMLElement>('button.btn-principal')?.focus();
  }

  $effect(() => {
    void i;
    mesurer();
    const r = () => mesurer();
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  });

  function fermer() {
    etat.prefs.visiteVue = nePlusAfficher;
    etat.visiteOuverte = false;
  }

  function touche(e: KeyboardEvent) {
    if (e.key === 'Escape') fermer();
  }

  const position = $derived.by(() => {
    if (!rect) return 'top:50%;left:50%;transform:translate(-50%,-50%)';
    const largeur = 340;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // À droite de la cible si la place le permet, sinon dessous, sinon dessus.
    if (rect.right + largeur + 24 < vw) return `top:${Math.max(12, Math.min(rect.top, vh - 260))}px;left:${rect.right + 16}px`;
    const left = Math.max(12, Math.min(rect.left, vw - largeur - 12));
    if (rect.bottom + 230 < vh) return `top:${rect.bottom + 12}px;left:${left}px`;
    return `top:${Math.max(12, rect.top - 230)}px;left:${left}px`;
  });
</script>

<svelte:window onkeydown={touche} />

<div class="voile" aria-hidden="true">
  {#if rect}
    <div class="cible" style={`top:${rect.top - 4}px;left:${rect.left - 4}px;width:${rect.width + 8}px;height:${rect.height + 8}px`}></div>
  {/if}
</div>

<div class="bulle" role="dialog" aria-modal="true" aria-labelledby="visite-titre" style={position} bind:this={bulle}>
  <div class="etape">Étape {i + 1} sur {etapes.length}</div>
  <h2 id="visite-titre">{etapes[i]!.titre}</h2>
  <p>{etapes[i]!.texte}</p>
  <label class="case"><input type="checkbox" bind:checked={nePlusAfficher} /> Ne plus afficher au démarrage</label>
  <div class="boutons">
    <button class="btn-lien" onclick={fermer}>Passer la visite</button>
    <span class="espace"></span>
    {#if i > 0}<button class="btn" onclick={() => i--}>Précédent</button>{/if}
    {#if i < etapes.length - 1}
      <button class="btn btn-principal" onclick={() => i++}>Suivant</button>
    {:else}
      <button class="btn btn-principal" onclick={fermer}>Terminer</button>
    {/if}
  </div>
</div>

<style>
  .voile { position: fixed; inset: 0; z-index: 100; pointer-events: auto; }
  .voile:not(:has(.cible)) { background: rgba(15, 30, 45, 0.45); }
  .cible {
    position: fixed; border: 3px solid var(--c-accent); border-radius: 4px;
    box-shadow: 0 0 0 9999px rgba(15, 30, 45, 0.45);
  }
  .bulle {
    position: fixed; z-index: 101; width: 340px; background: #fff; border-radius: 4px;
    border-top: 4px solid var(--c-structure); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); padding: 14px 16px;
  }
  .etape { font-size: 12px; color: var(--c-texte-2); }
  h2 { font-size: 16px; margin: 4px 0 8px; }
  p { margin: 0 0 12px; line-height: 1.45; }
  .case { font-size: 13px; color: var(--c-texte-2); display: block; margin-bottom: 12px; }
  .boutons { display: flex; align-items: center; gap: 8px; }
  .espace { flex: 1; }
</style>
