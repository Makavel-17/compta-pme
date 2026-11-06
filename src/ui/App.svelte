<script lang="ts">
  import { etat, type Vue } from './etat.svelte';
  import { etiquetteNiveau, LIBELLES_MODE } from '../engine/exercice';
  import { enseignant } from './enseignant.svelte';
  import { EXT_COPIE, empreinteTravail, exporterCopie, nomFichier, statutExport } from '../io/fichiers';
  import { telecharger, telechargerBlob } from './fichiers-navigateur';
  import EspaceEnseignant from './vues/EspaceEnseignant.svelte';
  import AvancementEntete from './composants/AvancementEntete.svelte';
  import { dateHeure, periode } from './format';
  import Accueil from './vues/Accueil.svelte';
  import TableauDeBord from './vues/TableauDeBord.svelte';
  import Journal from './vues/Journal.svelte';
  import Comptes from './vues/Comptes.svelte';
  import GrandLivre from './vues/GrandLivre.svelte';
  import Balance from './vues/Balance.svelte';
  import Bilan from './vues/Bilan.svelte';
  import CompteResultat from './vues/CompteResultat.svelte';
  import Bouclement from './vues/Bouclement.svelte';
  import Tva from './vues/Tva.svelte';
  import Salaire from './vues/Salaire.svelte';
  import Repartition from './vues/Repartition.svelte';
  import Theorie from './vues/Theorie.svelte';
  import Analyse from './vues/Analyse.svelte';
  import Visite from './composants/Visite.svelte';
  import Guide from './vues/Guide.svelte';

  function exporterMaCopie() {
    const s = etat.session!;
    const texte = exporterCopie({
      eleve: s.eleve,
      exerciceId: s.exercice.id,
      exerciceTitre: s.exercice.titre,
      mode: s.exercice.mode,
      dossier: s.dossier,
      suivi: s.suivi,
      fiches: s.fiches,
    });
    telecharger(nomFichier([s.eleve.nom, s.eleve.prenom, s.eleve.classe, s.exercice.titre], EXT_COPIE), texte);
    s.dernierExport = { le: new Date().toISOString(), empreinte: empreinteTravail(s.dossier, $state.snapshot(s.fiches)) };
  }

  const statut = $derived(
    etat.session && etat.session.role === 'eleve'
      ? statutExport(etat.session.dossier, $state.snapshot(etat.session.fiches), etat.session.dernierExport)
      : 'vide',
  );
  const heureExport = $derived(
    etat.session?.dernierExport
      ? dateHeure(etat.session.dernierExport.le)
      : '',
  );

  let pdfEnCours = $state(false);
  async function exporterPdf() {
    const s = etat.session!;
    pdfEnCours = true;
    try {
      const { genererPdfCopie } = await import('../pdf/copie');
      const nom = nomFichier([s.eleve.nom, s.eleve.prenom, s.eleve.classe, s.exercice.titre], '.pdf');
      telechargerBlob(nom, await genererPdfCopie(s.eleve, s.exercice, s.dossier, nom));
    } catch {
      alert("Le PDF n'a pas pu être créé. Vérifiez votre connexion lors du premier export, puis réessayez.");
    } finally {
      pdfEnCours = false;
    }
  }

  function fermerApercu() {
    etat.fermerApercu();
    enseignant.ouvert = true;
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
      {
        titre: 'Saisie',
        entrees: [
          { vue: 'journal', libelle: 'Journal' },
          ...(f.has('salaire') ? [{ vue: 'salaire' as Vue, libelle: 'Décompte de salaire' }] : []),
        ],
      },
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
          ...(f.has('analyse') ? [{ vue: 'analyse' as Vue, libelle: 'Analyse' }] : []),
        ],
      },
      {
        titre: 'Clôture',
        entrees: [
          ...(f.has('tva') ? [{ vue: 'tva' as Vue, libelle: 'TVA' }] : []),
          { vue: 'bouclement', libelle: 'Bouclement' },
          ...(f.has('repartition') ? [{ vue: 'repartition' as Vue, libelle: 'Répartition du bénéfice' }] : []),
        ],
      },
      { titre: 'Cours', entrees: [{ vue: 'theorie', libelle: 'Théorie' }] },
    ];
  });
</script>

{#if etat.guide}
  <Guide partie={etat.guide} onFermer={() => (etat.guide = null)} />
{:else if enseignant.ouvert}
  <EspaceEnseignant />
{:else if !etat.session || etat.accueilOuvert}
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
        <span class="badge badge-niveau" title="Formation et niveau de difficulté">{etiquetteNiveau(s.exercice)}</span>
        <span class="badge badge-mode" class:corrige={s.role === 'corrige'} title="Mode">
          {s.role === 'corrige' ? 'Saisie du corrigé' : LIBELLES_MODE[s.exercice.mode]}
        </span>
      </div>
      {#if s.role === 'eleve'}<AvancementEntete />{/if}
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
        {:else if s.apercu}
          <button class="action-lateral principale" onclick={fermerApercu}>Fermer l'aperçu</button>
        {:else}
          <button class="action-lateral principale" onclick={exporterMaCopie}>Exporter ma copie</button>
          {#if statut !== 'vide'}
            <p class="rappel-export" class:a-faire={statut !== 'a-jour'} role="status">
              {#if statut === 'jamais'}Copie jamais exportée. Votre travail n'existe que dans ce navigateur.
              {:else if statut === 'modifie'}Modifiée depuis le dernier export ({heureExport}). Exportez à nouveau avant de rendre.
              {:else}Copie exportée le {heureExport}.{/if}
            </p>
          {/if}
          <button class="action-lateral" onclick={exporterPdf} disabled={pdfEnCours}>{pdfEnCours ? 'Création du PDF…' : 'Exporter en PDF'}</button>
          <button class="action-lateral discrete" onclick={() => (etat.guide = 'eleve')}>Guide d'utilisation</button>
          <button class="action-lateral discrete" onclick={() => (enseignant.ouvert = true)}>Espace enseignant</button>
        {/if}
      </div>
    </nav>

    <main class="principal">
      {#if s.apercu}
        <div class="bandeau-apercu" role="status">
          <span><b>Aperçu enseignant.</b> Vous voyez l'exercice comme vos élèves{s.exercice.mode === 'evaluation' ? ' (évaluation : aucun retour pendant la saisie)' : ''}. Ce que vous saisissez ici n'est ni enregistré dans l'exercice, ni dans une copie.</span>
          <button class="btn" onclick={fermerApercu}>Fermer l'aperçu</button>
        </div>
      {/if}
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
      {:else if etat.vue === 'tva' && etat.fonctions.has('tva')}<Tva />
      {:else if etat.vue === 'salaire' && etat.fonctions.has('salaire')}<Salaire />
      {:else if etat.vue === 'repartition' && etat.fonctions.has('repartition')}<Repartition />
      {:else if etat.vue === 'analyse' && etat.fonctions.has('analyse')}<Analyse />
      {:else if etat.vue === 'theorie'}<Theorie />
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
  .rappel-export { margin: 0 2px 4px; font-size: 12px; line-height: 1.35; color: #b9cde0; }
  .rappel-export.a-faire { color: #fff; border-left: 3px solid var(--c-accent); padding-left: 7px; }
  .action-lateral.discrete { border: none; color: #b9cde0; font-size: 12px; padding: 4px 10px; }
  .badge-mode.corrige { background: var(--c-action); color: #fff; }
  .bandeau-apercu {
    display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: -4px 0 16px; padding: 10px 14px;
    background: var(--c-alerte-fond); border: 1px solid var(--c-accent); border-radius: 3px;
  }
  .principal { overflow: auto; padding: 20px 24px 40px; min-width: 0; }
  @media (max-width: 1280px) { .eleve { display: none; } }
  @media (max-width: 1100px) {
    .app { grid-template-columns: 170px minmax(0, 1fr); }
    .logo { width: 130px; }
    .principal { padding: 16px; }
  }
</style>
