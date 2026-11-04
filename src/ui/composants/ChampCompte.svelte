<!--
  Champ compte : liste déroulante complète et neutre des comptes de l'exercice.
  Clic ou flèche bas : ouvre la liste. Frappe d'un numéro ou d'un mot : filtre.
  Flèches + Entrée, souris ou doigt : choix. Aucune contrepartie n'est suggérée.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Compte } from '../../engine/plan';
  import { normaliser } from '../format';

  const TITRES_CLASSES: Record<number, string> = {
    1: 'Classe 1 : Actif',
    2: 'Classe 2 : Passif',
    3: 'Classe 3 : Ventes de marchandises',
    4: 'Classe 4 : Charges liées aux marchandises',
    5: 'Classe 5 : Charges liées aux employés',
    6: "Classe 6 : Charges d'exploitation et résultat financier",
    7: "Classe 7 : Bénéfice sur vente d'actifs",
    8: 'Classe 8 : Résultat exceptionnel ou hors exploitation',
    9: 'Classe 9 : Compte de bilan et de résultat',
  };

  let {
    valeur = $bindable(null),
    comptes,
    libelle,
    id,
    aligne = 'gauche',
  }: {
    valeur: string | null;
    comptes: Compte[];
    libelle: string;
    id: string;
    aligne?: 'gauche' | 'droite';
  } = $props();

  let texte = $state(valeur ?? '');
  let ouvert = $state(false);
  let actif = $state(0);
  let liste: HTMLDivElement | undefined = $state();

  // Synchronisation quand la valeur est changée de l'extérieur (remise à zéro de la ligne).
  $effect(() => {
    const v = valeur;
    const t = untrack(() => texte).trim();
    if (v !== null && v !== t) texte = v;
    if (v === null && comptes.some((c) => c.numero === t)) texte = '';
  });

  const resultats = $derived.by(() => {
    const t = normaliser(texte.trim());
    if (!t || comptes.some((c) => c.numero === texte.trim())) return comptes;
    if (/^\d+$/.test(t)) return comptes.filter((c) => c.numero.startsWith(t));
    return comptes.filter((c) => normaliser(c.intitule).includes(t));
  });

  const compte = $derived(comptes.find((c) => c.numero === valeur));
  const inconnu = $derived(!ouvert && texte.trim() !== '' && !compte);
  let navigue = $state(false);

  function choisir(c: Compte) {
    valeur = c.numero;
    texte = c.numero;
    ouvert = false;
  }

  function ouvrir() {
    ouvert = true;
    const i = resultats.findIndex((c) => c.numero === valeur);
    actif = Math.max(i, 0);
  }

  function saisie() {
    const t = texte.trim();
    valeur = comptes.some((c) => c.numero === t) ? t : null;
    ouvert = true;
    actif = 0;
    navigue = false;
  }

  function touche(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!ouvert) ouvrir();
      else actif = Math.min(actif + 1, resultats.length - 1);
      defiler();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      actif = Math.max(actif - 1, 0);
      defiler();
    } else if (e.key === 'Enter' && ouvert && resultats.length) {
      e.preventDefault();
      e.stopPropagation();
      choisir(resultats[actif]!);
    } else if (e.key === 'Escape' && ouvert) {
      e.stopPropagation();
      ouvert = false;
    } else if (e.key === 'Tab' && ouvert) {
      // Tab ne choisit jamais à la place de l'élève : seulement s'il ne reste qu'un compte
      // ou si l'élève a lui-même désigné un compte avec les flèches.
      if (texte.trim() && !compte && (resultats.length === 1 || navigue)) choisir(resultats[actif]!);
      ouvert = false;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') navigue = true;
  }

  function defiler() {
    queueMicrotask(() => liste?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }));
  }

  function groupes() {
    const g: { classe: number; items: { c: Compte; i: number }[] }[] = [];
    resultats.forEach((c, i) => {
      const dernier = g[g.length - 1];
      if (dernier && dernier.classe === c.classe) dernier.items.push({ c, i });
      else g.push({ classe: c.classe, items: [{ c, i }] });
    });
    return g;
  }
</script>

<div class="champ-compte">
  <input
    {id}
    class="champ num"
    class:invalide={inconnu}
    role="combobox"
    aria-label={libelle}
    aria-expanded={ouvert}
    aria-controls={`${id}-liste`}
    aria-activedescendant={ouvert && resultats[actif] ? `${id}-o${actif}` : undefined}
    autocomplete="off"
    placeholder="N° ou intitulé"
    data-champ
    bind:value={texte}
    oninput={saisie}
    onclick={ouvrir}
    onkeydown={touche}
    onblur={() => (ouvert = false)}
  />
  {#if ouvert}
    <div class="liste" class:droite={aligne === 'droite'} id={`${id}-liste`} role="listbox" bind:this={liste}>
      {#if resultats.length === 0}
        <div class="aucun">Aucun compte ne correspond à « {texte} ».</div>
      {/if}
      {#each groupes() as g}
        <div class="groupe" role="presentation">{TITRES_CLASSES[g.classe] ?? `Classe ${g.classe}`}</div>
        {#each g.items as { c, i }}
          <div
            id={`${id}-o${i}`}
            role="option"
            tabindex="-1"
            aria-selected={i === actif}
            class="option"
            class:sel={i === actif}
            onmousedown={(e) => {
              e.preventDefault();
              choisir(c);
            }}
          >
            <span class="n num">{c.numero}</span>{c.intitule}
          </div>
        {/each}
      {/each}
    </div>
  {/if}
  <div class="intitule" class:erreur={inconnu}>
    {#if compte}{compte.intitule}{:else if inconnu}{resultats.length > 1
        ? 'Plusieurs comptes correspondent : choisissez dans la liste'
        : 'Compte introuvable'}{/if}
  </div>
</div>

<style>
  .champ-compte { position: relative; }
  .intitule { font-size: 12px; color: var(--c-texte-2); padding: 2px 2px 0; min-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .intitule.erreur { color: var(--c-negatif); white-space: normal; }
  .liste {
    position: absolute; z-index: 20; left: 0; top: 34px; width: 380px; max-height: 300px; overflow-y: auto;
    background: #fff; border: 1px solid var(--c-bordure); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  .liste.droite { left: auto; right: 0; }
  .groupe {
    position: sticky; top: 0; background: var(--c-fond-2); color: var(--c-structure);
    font-weight: bold; font-size: 12px; padding: 5px 10px; border-bottom: 1px solid var(--c-bordure-2);
  }
  .option { padding: 6px 10px; display: flex; gap: 10px; cursor: pointer; }
  .option:hover { background: var(--c-zebra); }
  .option.sel { background: var(--c-selection); }
  .n { font-weight: bold; width: 40px; flex: none; }
  .aucun { padding: 10px; color: var(--c-texte-2); }
</style>
