<script lang="ts">
  import { etat, type Vue } from './etat.svelte';
  import { LIBELLES_MODE, LIBELLES_NIVEAU } from '../engine/exercice';
  import { enseignant } from './enseignant.svelte';
  import { EXT_COPIE, exporterCopie, nomFichier } from '../io/fichiers';
  import { telecharger } from './fichiers-navigateur';
  import EspaceEnseignant from './vues/EspaceEnseignant.svelte';
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

  function exporterMaCopie() {
    const s = etat.session!;
    const texte = exporterCopie({
      eleve: s.eleve,
      exerciceId: s.exercice.id,
      exerciceTitre: s.exercice.titre,
      mode: s.exercice.mode,
      dossier: s.dossier,
      suivi: s.suivi,
    });
    telecharger(nomFichier([s.eleve.nom, s.eleve.prenom, s.eleve.classe, s.exercice.titre], EXT_COPIE), texte);
  }

  function terminerCorrige(garder: boolean) {
    if (!garder && !confirm('Abandonner la saisie du corrigé ? Les modifications seront perdues.')) return;
    const r = etat.fermerCorrige(garder);
    if (r) {
      const ex = enseignant.trouver(r.exerciceId);
      if (ex) enseignant.enregistrer({ ...ex, corrige: r.corrige });
      enseignant.edition = r.exerciceId;
    }
    enseignant.ouvert = true;
  }

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

{#if enseignant.ouvert}
  <EspaceEnseignant />
{:else if !etat.session}
  <Accueil onEnseignant={() => (enseignant.ouvert = true)} />
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
        <span class="badge badge-mode" class:corrige={s.role === 'corrige'} title="Mode">
          {s.role === 'corrige' ? 'Saisie du corrigé' : LIBELLES_MODE[s.exercice.mode]}
        </span>
      </div>
      {#if s.role === 'eleve'}<div class="eleve">{s.eleve.prenom} {s.eleve.nom} · {s.eleve.classe}</div>{/if}
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
      <div class="bas">
        {#if s.role === 'corrige'}
          <button class="action-lateral principale" onclick={() => terminerCorrige(true)}>Enregistrer le corrigé</button>
          <button class="action-lateral" onclick={() => terminerCorrige(false)}>Abandonner</button>
        {:else}
          <button class="action-lateral principale" onclick={exporterMaCopie}>Exporter ma copie</button>
          <button class="action-lateral discrete" onclick={() => (enseignant.ouvert = true)}>Espace enseignant</button>
        {/if}
      </div>
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
  .lateral { display: flex; flex-direction: column; }
  .bas { margin-top: auto; padding: 16px 12px 4px; display: flex; flex-direction: column; gap: 6px; }
  .action-lateral {
    font: inherit; text-align: left; padding: 8px 10px; border-radius: 3px; cursor: pointer;
    background: transparent; color: #fff; border: 1px solid rgba(255, 255, 255, 0.35);
  }
  .action-lateral:hover { background: var(--c-structure-2); }
  .action-lateral.principale { background: var(--c-action); border-color: var(--c-action); font-weight: bold; }
  .action-lateral.discrete { border: none; color: #b9cde0; font-size: 12px; padding: 4px 10px; }
  .badge-mode.corrige { background: var(--c-action); color: #fff; }
  .principal { overflow: auto; padding: 20px 24px 40px; min-width: 0; }
  @media (max-width: 1280px) { .eleve { display: none; } }
  @media (max-width: 1100px) {
    .app { grid-template-columns: 170px minmax(0, 1fr); }
    .logo { width: 130px; }
    .principal { padding: 16px; }
  }
</style>
