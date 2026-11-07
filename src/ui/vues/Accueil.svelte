<script lang="ts">
  import { etat } from '../etat.svelte';
  import { estDossier, exercicesDemo } from '../../data/demos';
  import { classerExercices, etiquetteNiveau, filiereDe, LIBELLES_FILIERE, LIBELLES_MODE, type Exercice, type Filiere } from '../../engine/exercice';
  import { EXT_EXERCICE, ErreurFichier, importerExercice, statutExport } from '../../io/fichiers';
  import { choisirFichiers } from '../fichiers-navigateur';
  import { avancementSession, avecCorrection } from '../avancement';
  import { dateHeure, normaliser } from '../format';
  import BarreAvancement from '../composants/BarreAvancement.svelte';
  import { exerciceDuLien, oublierLien } from '../lien';

  let { onEnseignant }: { onEnseignant: () => void } = $props();

  // ---- Travail en cours (reprise) ----
  /** Session au moment de l'ouverture de l'accueil : sert seulement à préremplir le formulaire. */
  const depart = etat.session?.role === 'eleve' ? etat.session : (Object.values(etat.autres)[0] ?? null);
  const enCours = $derived(etat.session && etat.session.role === 'eleve' ? etat.session : null);
  const av = $derived(enCours ? avancementSession(enCours) : null);
  const correction = $derived(enCours ? avecCorrection(enCours) : false);
  const exporte = $derived(enCours ? statutExport(enCours.dossier, $state.snapshot(enCours.fiches), enCours.dernierExport) : 'vide');

  // ---- Lien direct donné par l'enseignant ----
  const lienId = exerciceDuLien();
  const exLien = lienId ? (exercicesDemo.find((e) => e.id === lienId) ?? null) : null;

  // ---- Exercices ----
  let importes = $state<Exercice[]>([]);
  const tous = $derived([...importes, ...exercicesDemo]);
  let erreurImport = $state('');

  async function ouvrirFichier() {
    erreurImport = '';
    const [f] = await choisirFichiers(`${EXT_EXERCICE},.json`);
    if (!f) return;
    try {
      const ex = importerExercice(f.texte);
      importes = [ex, ...importes.filter((x) => x.id !== ex.id)];
      choix = ex.id;
    } catch (e) {
      erreurImport = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  let filiere = $state<Filiere>(exLien ? filiereDe(exLien) : (etat.prefs.filiere ?? (depart ? filiereDe(depart.exercice) : 'CFC')));
  function choisirFiliere(f: Filiere) {
    filiere = f;
    etat.prefs.filiere = f;
  }
  let recherche = $state('');
  let voirExercices = $state(true);
  let voirDossiers = $state(true);

  const correspond = (ex: Exercice) => {
    const r = normaliser(recherche.trim());
    if (!r) return true;
    return normaliser([ex.titre, ex.raisonSociale, ...(ex.sujets ?? [])].join(' ')).includes(r);
  };
  const visible = (ex: Exercice) => (estDossier(ex) ? voirDossiers : voirExercices) && correspond(ex);
  const groupes = $derived(
    classerExercices(exercicesDemo)
      .filter((g) => g.filiere === filiere)
      .map((g) => ({ ...g, visibles: g.exercices.filter(visible) }))
      .filter((g) => g.visibles.length > 0),
  );
  const rechercheActive = $derived(recherche.trim().length > 0);

  function etatExercice(ex: Exercice): { texte: string; classe: string } {
    const s = etat.sessionDe(ex.id);
    const a = s ? avancementSession(s) : null;
    if (!s || !a) return { texte: '', classe: '' };
    const fini = avecCorrection(s) ? a.justes === a.total : a.saisies === a.total;
    return fini ? { texte: 'Terminé', classe: 'fini' } : { texte: `En cours · ${a.saisies} / ${a.total}`, classe: 'encours' };
  }

  // Autres exercices commencés dans ce navigateur (l'exercice actif a sa propre carte).
  const autres = $derived(Object.values(etat.autres).sort((a, b) => (b.derniereActivite ?? '').localeCompare(a.derniereActivite ?? '')));
  /** Élève dont le travail est enregistré dans ce navigateur. */
  const eleveConnu = $derived(enCours?.eleve ?? autres[0]?.eleve ?? null);

  // ---- Élève et démarrage ----
  let prenom = $state(depart?.eleve.prenom ?? '');
  let nom = $state(depart?.eleve.nom ?? '');
  let classe = $state(depart?.eleve.classe ?? '');
  let choix = $state(exLien?.id ?? depart?.exercice.id ?? '');
  let erreurs = $state<string[]>([]);
  /** Un autre élève sur le même ordinateur : confirmation avant d'effacer le travail enregistré. */
  let confirmer = $state(false);
  const meme = (a: string, b: string) => normaliser(a.trim()) === normaliser(b.trim());

  function commencer(e: SubmitEvent) {
    e.preventDefault();
    const err: string[] = [];
    if (!prenom.trim()) err.push('Indiquez votre prénom.');
    if (!nom.trim()) err.push('Indiquez votre nom.');
    if (!classe.trim()) err.push('Indiquez votre classe (par exemple 1CFC3).');
    const ex = tous.find((x) => x.id === choix);
    if (!ex) err.push('Choisissez un exercice dans la liste.');
    erreurs = err;
    if (err.length || !ex) return;
    const autreEleve = eleveConnu && !(meme(eleveConnu.prenom, prenom) && meme(eleveConnu.nom, nom));
    if (autreEleve && !confirmer) {
      confirmer = true;
      return;
    }
    if (autreEleve) etat.quitter();
    confirmer = false;
    oublierLien();
    etat.commencer({ prenom: prenom.trim(), nom: nom.trim(), classe: classe.trim() }, ex);
  }
</script>

<div class="page">
  <header class="bandeau-haut"><span class="logo">Compta PME</span></header>
  <main class="contenu">
    <h1>{eleveConnu ? `Bon retour, ${eleveConnu.prenom}` : 'Bienvenue'}</h1>
    <p class="discret">
      Logiciel de comptabilité en partie double, plan comptable suisse. Vos données restent dans ce navigateur :
      rien n'est envoyé en ligne.
    </p>

    {#if exLien}
      <section class="carte lien" aria-labelledby="titre-lien">
        <h2 id="titre-lien" class="tete-simple">Exercice donné par votre enseignant</h2>
        <div class="corps-carte">
          <strong>{exLien.titre}</strong> <span class="discret petit">· {etiquetteNiveau(exLien)}</span>
          <p class="petit">Indiquez votre prénom, votre nom et votre classe plus bas, puis cliquez sur « {etat.sessionDe(exLien.id) ? 'Reprendre' : 'Commencer'} ».</p>
        </div>
      </section>
    {:else if lienId}
      <div class="alerte" role="alert">Ce lien ne correspond à aucun exercice du logiciel. Demandez un nouveau lien à votre enseignant, ou choisissez l'exercice dans la liste.</div>
    {/if}

    {#if enCours}
      <section class="carte reprise" aria-labelledby="titre-reprise">
        <div class="tete-carte">
          <div>
            <h2 id="titre-reprise">Reprendre où vous en étiez</h2>
            <div class="discret petit">
              {enCours.exercice.titre} · {etiquetteNiveau(enCours.exercice)} · {LIBELLES_MODE[enCours.exercice.mode]}
            </div>
          </div>
          <button class="btn btn-principal" onclick={() => etat.reprendre()}>Reprendre</button>
        </div>
        <div class="corps-carte ligne-reprise">
          {#if av}
            <div>
              <div><BarreAvancement a={av} {correction} largeur={260} /> <span class="petit">{av.saisies} / {av.total} pièces saisies</span></div>
              {#if correction}
                <div class="legende">
                  <span><span class="pastille juste"></span>{av.justes} justes</span>
                  <span><span class="pastille revoir"></span>{av.aRevoir} à revoir</span>
                  <span><span class="pastille saisie"></span>{av.incompletes} incomplètes</span>
                  <span>{av.nonSaisies} pas encore saisies</span>
                </div>
              {/if}
            </div>
          {/if}
          <div class="discret petit">
            {#if enCours.derniereActivite}Dernière activité : {dateHeure(enCours.derniereActivite)}<br />{/if}
            {#if exporte === 'a-jour' && enCours.dernierExport}Copie exportée le {dateHeure(enCours.dernierExport.le)}
            {:else if exporte === 'modifie'}<span class="a-exporter">Modifiée depuis le dernier export</span>
            {:else if exporte === 'jamais'}<span class="a-exporter">Copie jamais exportée</span>{/if}
          </div>
        </div>
      </section>
    {/if}

    {#if autres.length}
      <section class="carte" aria-labelledby="titre-autres">
        <h2 id="titre-autres" class="tete-simple">Vos autres exercices en cours</h2>
        {#each autres as s (s.exercice.id)}
          {@const a = avancementSession(s)}
          <div class="autre">
            <span class="infos">
              <strong>{s.exercice.titre}</strong><br />
              <span class="discret petit">
                {etiquetteNiveau(s.exercice)} · {LIBELLES_MODE[s.exercice.mode]}{s.derniereActivite ? ` · dernière activité : ${dateHeure(s.derniereActivite)}` : ''}
              </span>
            </span>
            {#if a}<span class="petit"><BarreAvancement {a} correction={avecCorrection(s)} largeur={120} /> {a.saisies} / {a.total}</span>{/if}
            <button class="btn" onclick={() => etat.commencer(s.eleve, s.exercice)}>Reprendre</button>
          </div>
        {/each}
      </section>
    {/if}

    <form class="carte" onsubmit={commencer} novalidate>
      <h2 class="tete-simple">{eleveConnu ? 'Choisir un autre exercice' : 'Vos informations'}</h2>
      <div class="corps-carte grille">
        <div>
          <label class="bloc" for="prenom">Prénom</label>
          <input id="prenom" class="champ" bind:value={prenom} autocomplete="given-name" />
        </div>
        <div>
          <label class="bloc" for="nom">Nom</label>
          <input id="nom" class="champ" bind:value={nom} autocomplete="family-name" />
        </div>
        <div>
          <label class="bloc" for="classe">Classe</label>
          <input id="classe" class="champ" bind:value={classe} placeholder="1CFC3" />
        </div>
      </div>

      <div class="separe corps-carte">
        <div class="filtres">
          <div class="onglets" role="group" aria-label="Formation">
            {#each ['CFC', 'MP'] as const as f}
              <button type="button" aria-pressed={filiere === f} onclick={() => choisirFiliere(f)}>{LIBELLES_FILIERE[f]}</button>
            {/each}
          </div>
          <input
            class="champ recherche"
            type="search"
            bind:value={recherche}
            placeholder="Rechercher : TVA, salaires, titres…"
            aria-label="Rechercher un exercice"
          />
          <label class="case"><input type="checkbox" bind:checked={voirExercices} /> Exercices</label>
          <label class="case"><input type="checkbox" bind:checked={voirDossiers} /> Dossiers de pièces</label>
        </div>
      </div>

      {#snippet ligne(ex: Exercice)}
        {@const st = etatExercice(ex)}
        <label class="exercice" class:choisi={choix === ex.id}>
          <input type="radio" name="exercice" value={ex.id} bind:group={choix} />
          <span class="infos">
            <strong>{ex.titre}</strong>
            <span class={`type ${estDossier(ex) ? 'dossier' : 'exo'}`}>{estDossier(ex) ? 'Dossier de pièces' : 'Exercice'}</span>
            {#if !exercicesDemo.includes(ex)}<span class="type exo">{LIBELLES_MODE[ex.mode]}</span>{/if}<br />
            <span class="discret petit">
              {ex.operations.length} {estDossier(ex) ? 'pièces' : 'opérations'}{ex.sujets?.length ? ` · ${ex.sujets.join(' · ')}` : ''}
            </span>
          </span>
          {#if st.texte}<span class={`etat ${st.classe}`}>{st.texte}</span>{/if}
        </label>
      {/snippet}

      {#if importes.length}
        <div class="bloc-niveaux">
          <h3 class="recus">Exercices reçus de votre enseignant</h3>
          <div class="cartes-exo">{#each importes as ex (ex.id)}{@render ligne(ex)}{/each}</div>
        </div>
      {/if}

      <div class="bloc-niveaux">
        {#each groupes as g (g.difficulte)}
          {@const ouvert = rechercheActive || g.visibles.some((x) => x.id === choix)}
          <details class="niveau" open={ouvert}>
            <summary>
              <strong>Niveau {g.difficulte}{g.titre ? ` — ${g.titre}` : ''}</strong>
              <span class="discret petit">{g.visibles.length} {g.visibles.length > 1 ? 'exercices' : 'exercice'}</span>
            </summary>
            <div class="cartes-exo">{#each g.visibles as ex (ex.id)}{@render ligne(ex)}{/each}</div>
          </details>
        {:else}
          <p class="vide">Aucun exercice ne correspond à votre recherche.</p>
        {/each}
      </div>

      <div class="corps-carte ouvrir">
        <button type="button" class="btn" onclick={ouvrirFichier}>Ouvrir un exercice reçu…</button>
        <span class="discret petit">Fichier {EXT_EXERCICE} remis par votre enseignant.</span>
      </div>
      {#if erreurImport}<div class="alerte" role="alert" style="margin:0 14px 14px">{erreurImport}</div>{/if}

      {#if erreurs.length}
        <div class="alerte" role="alert" style="margin:0 14px 14px">
          <ul>{#each erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
      {/if}
      {#if confirmer && eleveConnu}
        <div class="alerte" role="alert" style="margin:0 14px 14px">
          Ce navigateur contient le travail de {eleveConnu.prenom} {eleveConnu.nom}. Si vous n'êtes pas cette personne, ce
          travail sera effacé pour laisser la place au vôtre. S'il doit être rendu, reprenez-le d'abord et cliquez sur
          « Exporter ma copie ».
          <div class="actions-confirmation">
            <button type="submit" class="btn btn-principal">Effacer et commencer</button>
            <button type="button" class="btn" onclick={() => (confirmer = false)}>Annuler</button>
          </div>
        </div>
      {:else}
        <div class="actions">
          <button type="submit" class="btn btn-principal">{etat.sessionDe(choix) ? 'Reprendre' : 'Commencer'}</button>
        </div>
      {/if}
    </form>
    <p class="enseignant">
      <button class="btn-lien" onclick={() => (etat.guide = 'eleve')}>Guide d'utilisation</button>
      <span class="sep">·</span>
      <button class="btn-lien" onclick={onEnseignant}>Espace enseignant</button>
    </p>
  </main>
</div>

<style>
  .page { min-height: 100%; }
  .bandeau-haut { background: #fff; border-bottom: 1px solid var(--c-bordure-2); padding: 0 28px; height: 60px; display: flex; align-items: center; gap: 18px; }
  .logo { color: var(--c-texte); font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 10px; }
  .logo::before { content: 'CP'; width: 28px; height: 28px; border-radius: 7px; background: var(--c-action); color: #fff; display: grid; place-items: center; font-size: 12px; }
  .contenu { max-width: 980px; margin: 0 auto; padding: 32px 16px; }
  .contenu > p { margin: 8px 0 20px; }
  .carte + .carte, .carte + form { margin-top: 16px; }
  .tete-carte { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); flex-wrap: wrap; }
  .tete-simple { padding: 14px 18px; border-bottom: 1px solid var(--c-bordure-3); }
  .reprise { border-left: 4px solid var(--c-action); }
  .lien { border-left: 4px solid var(--c-structure); margin-bottom: 16px; }
  .lien p { margin: 6px 0 0; }
  .ligne-reprise { display: flex; gap: 24px; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .legende { display: flex; gap: 14px; font-size: 12px; color: var(--c-texte-2); margin-top: 6px; flex-wrap: wrap; }
  .pastille { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 4px; }
  .pastille.juste { background: var(--c-ok); }
  .pastille.revoir { background: var(--c-accent); }
  .pastille.saisie { background: #8fa9c4; }
  .a-exporter { color: var(--c-alerte-texte); font-weight: bold; }
  .separe { border-top: 1px solid var(--c-bordure-2); }
  .grille { display: grid; grid-template-columns: 1fr 1fr 160px; gap: 14px; }
  .filtres { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
  .onglets { display: inline-flex; background: #eef2f6; border-radius: 8px; padding: 3px; gap: 2px; }
  .onglets button { font: inherit; border: 0; background: transparent; color: var(--c-texte-2); padding: 6px 14px; cursor: pointer; border-radius: 6px; }
  .onglets button[aria-pressed='true'] { background: #fff; color: var(--c-structure); font-weight: bold; box-shadow: var(--ombre); }
  .recherche { width: 260px; max-width: 100%; }
  .case { display: inline-flex; gap: 6px; align-items: center; }
  .bloc-niveaux { border-top: 1px solid var(--c-bordure-2); }
  .recus { font-size: 14px; color: var(--c-structure); margin: 0; padding: 12px 18px 0; }
  details.niveau + details.niveau { border-top: 1px solid var(--c-bordure-3); }
  details.niveau > summary { padding: 12px 18px; cursor: pointer; display: flex; gap: 12px; align-items: baseline; }
  details.niveau > summary strong { color: var(--c-texte); flex: 1; }
  .cartes-exo { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; padding: 4px 18px 16px; }
  .exercice {
    display: flex; gap: 10px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--c-bordure-2); border-radius: 8px;
    cursor: pointer; background: #fff; transition: border-color 0.12s, box-shadow 0.12s;
  }
  .exercice:hover { border-color: #b8c7d8; box-shadow: var(--ombre); }
  .exercice.choisi { border-color: var(--c-structure); box-shadow: 0 0 0 2px var(--c-selection); background: #fbfdff; }
  .exercice input { margin-top: 3px; }
  .infos { flex: 1; min-width: 0; }
  .type { display: inline-block; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 999px; margin-left: 6px; white-space: nowrap; }
  .type.dossier { background: var(--c-alerte-fond); color: var(--c-alerte-texte); border: 1px solid #f2c7ad; }
  .type.exo { background: var(--c-selection); color: var(--c-structure); }
  .etat { font-size: 12px; font-weight: bold; white-space: nowrap; }
  .etat.encours { color: var(--c-action); }
  .etat.fini { color: var(--c-ok); }
  .vide { padding: 14px; color: var(--c-texte-2); margin: 0; }
  .petit { font-size: 12px; }
  .ouvrir { display: flex; align-items: center; gap: 12px; border-top: 1px solid var(--c-bordure-2); }
  .enseignant { text-align: right; margin-top: 16px; font-size: 13px; }
  .sep { margin: 0 8px; color: var(--c-texte-2); }
  .actions { padding: 0 14px 14px; text-align: right; }
  .autre { display: flex; gap: 16px; align-items: center; padding: 9px 14px; border-top: 1px solid var(--c-bordure-2); flex-wrap: wrap; }
  .tete-simple + .autre { border-top: 0; }
  .actions-confirmation { display: flex; gap: 8px; margin-top: 10px; }
  @media (max-width: 760px) { .cartes-exo { grid-template-columns: 1fr; } }
  @media (max-width: 640px) { .grille { grid-template-columns: 1fr; } }
</style>
