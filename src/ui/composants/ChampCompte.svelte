<!--
  Champ compte : l'élève choisit le compte par son NOM (en cours, on apprend les noms, peu les numéros).
  Clic ou flèche bas : ouvre la liste complète et neutre des comptes de l'exercice.
  Frappe d'une partie du nom : filtre (le numéro reste accepté, sans être mis en avant).
  Flèches + Entrée, souris ou doigt : choix. Aucune contrepartie n'est suggérée.
-->
<script lang="ts">
  import { untrack } from 'svelte';
  import type { Compte } from '../../engine/plan';
  import { normaliser } from '../format';

  const TITRES_CLASSES: Record<number, string> = {
    1: 'Classe 1 : Actifs',
    2: 'Classe 2 : Passifs',
    3: "Classe 3 : Chiffre d'affaires (ventes et prestations de service)",
    4: 'Classe 4 : Charges de marchandises et de services',
    5: 'Classe 5 : Charges de personnel',
    6: "Classe 6 : Autres charges d'exploitation, amortissements, résultat financier",
    8: 'Classe 8 : Résultats hors exploitation et exceptionnels',
    9: 'Classe 9 : Clôture',
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

  const nomDe = (n: string | null) => comptes.find((c) => c.numero === n)?.intitule ?? '';
  /** Compte désigné exactement par le texte : nom complet (sans tenir compte des accents ni des majuscules) ou numéro. */
  const exact = (t: string) => {
    const x = normaliser(t.trim());
    return x ? comptes.find((c) => c.numero === x || normaliser(c.intitule) === x) : undefined;
  };

  // svelte-ignore state_referenced_locally
  let texte = $state(nomDe(valeur));
  let ouvert = $state(false);
  let actif = $state(0);
  let focus = $state(false);
  let liste: HTMLDivElement | undefined = $state();

  // Synchronisation quand la valeur est changée de l'extérieur (modification, remise à zéro de la ligne).
  $effect(() => {
    const v = valeur;
    if (untrack(() => focus)) return;
    const t = untrack(() => texte);
    if (v !== null) {
      const n = nomDe(v);
      if (n && t !== n) texte = n;
    } else if (exact(t)) texte = '';
  });

  const resultats = $derived.by(() => {
    const t = normaliser(texte.trim());
    if (!t || (valeur !== null && texte === nomDe(valeur))) return comptes;
    if (/^\d+$/.test(t)) return comptes.filter((c) => c.numero.startsWith(t));
    // Les noms qui commencent par le texte saisi d'abord, puis ceux où un mot commence ainsi, puis les autres.
    const rang = (c: Compte) => {
      const n = normaliser(c.intitule);
      return n.startsWith(t) ? 0 : n.split(/[\s/()'.,-]+/).some((m) => m.startsWith(t)) ? 1 : 2;
    };
    return comptes
      .filter((c) => normaliser(c.intitule).includes(t))
      .sort((a, b) => rang(a) - rang(b) || a.numero.localeCompare(b.numero));
  });

  const compte = $derived(comptes.find((c) => c.numero === valeur));
  const inconnu = $derived(!ouvert && texte.trim() !== '' && !compte);
  let navigue = $state(false);

  function choisir(c: Compte) {
    valeur = c.numero;
    texte = c.intitule;
    ouvert = false;
  }

  function ouvrir() {
    ouvert = true;
    const i = resultats.findIndex((c) => c.numero === valeur);
    actif = Math.max(i, 0);
  }

  function saisie() {
    valeur = exact(texte)?.numero ?? null;
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

  function sortie() {
    ouvert = false;
    focus = false;
    if (valeur !== null) texte = nomDe(valeur); // un numéro tapé s'affiche sous forme de nom
  }

  /** Liste complète : regroupée par classe ; liste filtrée : dans l'ordre de pertinence, sans titres. */
  const filtre = $derived(resultats !== comptes);

  function groupes() {
    if (filtre) return [{ classe: 0, items: resultats.map((c, i) => ({ c, i })) }];
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
    class="champ"
    class:invalide={inconnu}
    role="combobox"
    aria-label={libelle}
    aria-expanded={ouvert}
    aria-controls={`${id}-liste`}
    aria-activedescendant={ouvert && resultats[actif] ? `${id}-o${actif}` : undefined}
    autocomplete="off"
    placeholder="Nom du compte"
    data-champ
    bind:value={texte}
    oninput={saisie}
    onclick={ouvrir}
    onfocus={() => (focus = true)}
    onkeydown={touche}
    onblur={sortie}
  />
  {#if ouvert}
    <div class="liste" class:droite={aligne === 'droite'} id={`${id}-liste`} role="listbox" bind:this={liste}>
      {#if resultats.length === 0}
        <div class="aucun">Aucun compte ne correspond à « {texte} ».</div>
      {/if}
      {#each groupes() as g}
        {#if !filtre}<div class="groupe" role="presentation">{TITRES_CLASSES[g.classe] ?? `Classe ${g.classe}`}</div>{/if}
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
            <span class="nom">{c.intitule}</span><span class="n num">{c.numero}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
  <div class="intitule" class:erreur={inconnu}>
    {#if compte}n° {compte.numero}{:else if inconnu}{resultats.length > 1
        ? 'Plusieurs comptes correspondent : choisissez dans la liste'
        : 'Aucun compte de ce nom : choisissez dans la liste'}{/if}
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
  .option { padding: 6px 10px; display: flex; gap: 10px; cursor: pointer; justify-content: space-between; }
  .nom { min-width: 0; }
  .option:hover { background: var(--c-zebra); }
  .option.sel { background: var(--c-selection); }
  .n { font-size: 12px; color: var(--c-texte-2); flex: none; }
  .aucun { padding: 10px; color: var(--c-texte-2); }
</style>
