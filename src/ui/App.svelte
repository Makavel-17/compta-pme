<script lang="ts">
  import { etat, type Vue } from './etat.svelte';
  import { LIBELLES_NIVEAU } from '../engine/exercice';
  import { periode } from './format';
  import Accueil from './vues/Accueil.svelte';
  import TableauDeBord from './vues/TableauDeBord.svelte';
  import Journal from './vues/Journal.svelte';
  import Comptes from './vues/Comptes.svelte';
  import GrandLivre from './vues/GrandLivre.svelte';
  import Balance from './vues/Balance.svelte';
  import Bilan from './vues/Bilan.svelte';
  import CompteResultat from './vues/CompteResultat.svelte';
  import Bouclement from './vues/Bouclement.svelte';
  import Visite from './composants/Visite.svelte';
  type Entree = { vue: Vue; libelle: string };
  type Rubrique = { titre: string | null; entrees: Entree[] };

  const rubriques = $derived.by((): Rubrique[] => {
    const f = etat.session ? etat.fonctions : new Set();
    return [
      { titre: null, entrees: [{ vue: 'tableau', libelle: 'Tableau de bord' }] },
      { titre: 'Saisie', entrees: [{ vue: 'journal', libelle: 'Journal' }] },
      {
        titre: 'Consultation',
        entrees: [
          { vue: 'comptes', libelle: 'Comptes' },
          { vue: 'grandlivre', libelle: 'Grand livre' },
          { vue: 'balance', libelle: 'Balance' },
        ],
      },
      {
        titre: 'États financiers',
        entrees: [
          { vue: 'bilan', libelle: 'Bilan' },
          { vue: 'resultat', libelle: 'Compte de résultat' },
        ],
      },
      {
        titre: 'Clôture',
        entrees: [
          ...(f.has('tva') ? [{ vue: 'tva' as Vue, libelle: 'TVA' }] : []),
          { vue: 'bouclement', libelle: 'Bouclement' },
        ],
      },
    ];
  });
</script>

{#if !etat.session}
  <Accueil />
{:else}
  {@const s = etat.session}
  <div class="app">
    <header class="entete" data-visite="entete">
      <div class="logo">Compta PME</div>
      <div class="dossier">
        <strong>{s.dossier.raisonSociale}</strong>
        <span class="meta">{s.dossier.formeJuridique === 'raison individuelle' ? 'Raison individuelle' : s.dossier.formeJuridique}</span>
        <span class="meta">Exercice {periode(s.dossier.debut, s.dossier.fin)}</span>
        <span class="badge badge-niveau" title="Niveau">{LIBELLES_NIVEAU[s.exercice.niveau]}</span>
        <span class="badge badge-mode" title="Mode">Entraînement</span>
      </div>
      <div class="eleve">{s.eleve.prenom} {s.eleve.nom} · {s.eleve.classe}</div>
    </header>

    <nav class="lateral" aria-label="Navigation" data-visite="navigation">
      {#each rubriques as r}
        {#if r.titre}<div class="rubrique">{r.titre}</div>{/if}
        {#each r.entrees as e}
          <a
            href={`#${e.vue}`}
            class:actif={etat.vue === e.vue}
            aria-current={etat.vue === e.vue ? 'page' : undefined}
            onclick={(ev) => {
              ev.preventDefault();
              etat.aller(e.vue);
            }}>{e.libelle}</a
          >
        {/each}
      {/each}
    </nav>

    <main class="principal">
      {#if etat.stockageIndisponible}
        <div class="alerte" style="margin-bottom:16px">
          Le navigateur refuse l'enregistrement local (navigation privée ?). Votre travail sera perdu à la fermeture de
          la page.
        </div>
      {/if}
      {#if etat.vue === 'tableau'}<TableauDeBord />
      {:else if etat.vue === 'journal'}<Journal />
      {:else if etat.vue === 'comptes'}<Comptes />
      {:else if etat.vue === 'grandlivre'}<GrandLivre />
      {:else if etat.vue === 'balance'}<Balance />
      {:else if etat.vue === 'bilan'}<Bilan />
      {:else if etat.vue === 'resultat'}<CompteResultat />
      {:else if etat.vue === 'bouclement'}<Bouclement />
      {:else}<TableauDeBord />
      {/if}
    </main>
  </div>
  {#if etat.visiteOuverte}<Visite />{/if}
{/if}

<style>
  .app { display: grid; grid-template-columns: 210px minmax(0, 1fr); grid-template-rows: 52px minmax(0, 1fr); height: 100vh; }
  .entete {
    grid-column: 1 / -1; display: flex; align-items: center; gap: 24px; padding: 0 20px;
    background: var(--c-fond); border-bottom: 1px solid var(--c-bordure);
  }
  .logo { font-weight: bold; color: var(--c-structure); font-size: 16px; width: 170px; flex: none; }
  .dossier { display: flex; align-items: baseline; gap: 16px; flex: 1; min-width: 0; }
  .dossier strong { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { color: var(--c-texte-2); white-space: nowrap; }
  .badge-niveau { background: var(--c-structure); color: #fff; }
  .badge-mode { background: var(--c-selection); color: var(--c-structure); }
  .eleve { color: var(--c-texte-2); white-space: nowrap; }
  .lateral { background: var(--c-structure); color: #fff; padding: 12px 0; overflow-y: auto; }
  .rubrique { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #b9cde0; padding: 14px 20px 6px; }
  .lateral a { display: block; padding: 8px 20px; color: #fff; text-decoration: none; border-left: 4px solid transparent; }
  .lateral a:hover { background: var(--c-structure-2); }
  .lateral a.actif { background: var(--c-structure-2); border-left-color: var(--c-accent); font-weight: bold; }
  .principal { overflow: auto; padding: 20px 24px 40px; min-width: 0; }
  @media (max-width: 1280px) { .eleve { display: none; } }
  @media (max-width: 1100px) {
    .app { grid-template-columns: 170px minmax(0, 1fr); }
    .logo { width: 130px; }
    .principal { padding: 16px; }
  }
</style>
