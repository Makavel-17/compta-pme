<script lang="ts">
  import { enseignant, nouvelIdentifiant } from '../enseignant.svelte';
  import { etat } from '../etat.svelte';
  import { exercicesDemo } from '../../data/demos';
  import { plan } from '../../data/plan';
  import { controlerExercice, etiquetteNiveau, exerciceVierge, LIBELLES_MODE, type Exercice } from '../../engine/exercice';
  import {
    EXT_EXERCICE,
    ErreurFichier,
    exporterExercice,
    exporterExerciceEnseignant,
    exporterSauvegarde,
    EXT_SAUVEGARDE,
    fusionnerExercices,
    importerExercice,
    importerSauvegarde,
    nomFichier,
  } from '../../io/fichiers';
  import { choisirFichiers, telecharger } from '../fichiers-navigateur';
  import EditeurExercice from './EditeurExercice.svelte';
  import { dateHeure } from '../format';
  import SyntheseCopies from './SyntheseCopies.svelte';
  import DossiersEnseignant from './DossiersEnseignant.svelte';

  let code = $state('');
  let confirmation = $state('');
  let message = $state('');
  let onglet = $state<'exercices' | 'dossiers' | 'copies' | 'parametres'>('exercices');
  let nouveauCode = $state('');
  let modeleId = $state('');

  function deverrouiller(e: SubmitEvent) {
    e.preventDefault();
    message = '';
    if (enseignant.code === null) {
      if (code.trim().length < 4) return (message = 'Le code doit comporter au moins 4 caractères.');
      if (code !== confirmation) return (message = 'Les deux codes ne sont pas identiques.');
      enseignant.code = code;
    } else if (code !== enseignant.code) {
      return (message = 'Code incorrect.');
    }
    code = confirmation = '';
    enseignant.deverrouille = true;
  }

  function fermer() {
    enseignant.deverrouille = false;
    enseignant.edition = null;
    enseignant.ouvert = false;
  }

  function nouveau() {
    const ex = exerciceVierge(nouvelIdentifiant(), new Date().getFullYear());
    enseignant.enregistrer(ex);
    enseignant.edition = ex.id;
  }

  function depuisExemple(modele: Exercice) {
    const ex: Exercice = { ...structuredClone(modele), id: nouvelIdentifiant(), titre: `${modele.titre} (copie)` };
    enseignant.enregistrer(ex);
    enseignant.edition = ex.id;
  }

  async function importer() {
    message = '';
    const [f] = await choisirFichiers(`${EXT_EXERCICE},.json`);
    if (!f) return;
    try {
      const ex = importerExercice(f.texte);
      enseignant.enregistrer(ex);
      message = `Exercice « ${ex.titre} » importé.`;
    } catch (e) {
      message = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  function sauvegarder() {
    const maintenant = new Date();
    const jour = maintenant.toISOString().slice(0, 10);
    telecharger(nomFichier(['compta-pme', 'sauvegarde', jour], EXT_SAUVEGARDE), exporterSauvegarde($state.snapshot(enseignant.exercices) as Exercice[], maintenant));
    enseignant.derniereSauvegarde = maintenant.toISOString();
    message = `Sauvegarde de ${enseignant.exercices.length} exercice(s) enregistrée dans vos téléchargements. Conservez ce fichier en lieu sûr.`;
  }

  async function restaurer() {
    message = '';
    const [f] = await choisirFichiers(`${EXT_SAUVEGARDE},${EXT_EXERCICE},.json`);
    if (!f) return;
    try {
      const r = fusionnerExercices($state.snapshot(enseignant.exercices) as Exercice[], importerSauvegarde(f.texte));
      enseignant.exercices = r.exercices;
      message =
        `Restauration terminée : ${r.ajoutes} exercice(s) ajouté(s)` +
        (r.remplaces ? `, ${r.remplaces} remplacé(s) par la version de la sauvegarde.` : '.');
    } catch (e) {
      message = e instanceof ErreurFichier ? e.message : "Le fichier n'a pas pu être lu.";
    }
  }

  const texteSauvegarde = $derived(
    enseignant.derniereSauvegarde
      ? `Dernière sauvegarde : ${dateHeure(enseignant.derniereSauvegarde)}`
      : 'Aucune sauvegarde',
  );

  function exporter(ex: Exercice, version: 'eleves' | 'enseignant') {
    message = '';
    if (version === 'eleves') {
      const { erreurs } = controlerExercice(ex, plan);
      if (erreurs.length) {
        message = `L'exercice « ${ex.titre || 'sans titre'} » contient des erreurs : ouvrez-le pour les corriger avant de le distribuer.`;
        return;
      }
      telecharger(nomFichier([ex.titre], EXT_EXERCICE), exporterExercice(ex));
    } else {
      telecharger(nomFichier([ex.titre, 'enseignant'], EXT_EXERCICE), exporterExerciceEnseignant(ex));
    }
  }

  function supprimer(ex: Exercice) {
    if (confirm(`Supprimer l'exercice « ${ex.titre || 'sans titre'} » de ce navigateur ?`)) enseignant.supprimer(ex.id);
  }

  function changerCode(e: SubmitEvent) {
    e.preventDefault();
    if (nouveauCode.trim().length < 4) return (message = 'Le code doit comporter au moins 4 caractères.');
    enseignant.code = nouveauCode;
    nouveauCode = '';
    message = 'Le code a été modifié.';
  }
</script>

<div class="page">
  <header class="bandeau-haut">
    <span class="logo">Compta PME</span>
    <span class="titre-espace">Espace enseignant</span>
    <button class="btn-lien fermer" onclick={() => (etat.guide = 'enseignant')}>Guide</button>
    <button class="btn-lien fermer" onclick={fermer}>Fermer l'espace enseignant</button>
  </header>

  {#if !enseignant.deverrouille}
    <main class="contenu etroit">
      <form class="carte" onsubmit={deverrouiller}>
        <h2>{enseignant.code === null ? "Définir le code d'accès" : "Code d'accès"}</h2>
        <div class="corps-carte">
          {#if enseignant.code === null}
            <p class="discret">
              Choisissez un code simple pour réserver cet espace à l'enseignant. Il n'offre pas de sécurité
              informatique : il évite seulement qu'un élève y entre par mégarde.
            </p>
          {/if}
          <label class="bloc" for="code">Code</label>
          <input id="code" class="champ" type="password" bind:value={code} autocomplete="off" />
          {#if enseignant.code === null}
            <label class="bloc" for="confirmation" style="margin-top:10px">Confirmer le code</label>
            <input id="confirmation" class="champ" type="password" bind:value={confirmation} autocomplete="off" />
          {/if}
          {#if message}<p class="alerte" role="alert">{message}</p>{/if}
          <div class="actions"><button class="btn btn-principal" type="submit">Entrer</button></div>
        </div>
      </form>
    </main>
  {:else if enseignant.edition && enseignant.trouver(enseignant.edition)}
    <main class="contenu">
      {#key enseignant.edition}<EditeurExercice id={enseignant.edition} />{/key}
    </main>
  {:else}
    <main class="contenu">
      <div class="titre">
        <h1>{onglet === 'copies' ? 'Copies des élèves' : onglet === 'dossiers' ? 'Dossiers de pièces comptables' : onglet === 'parametres' ? 'Paramètres' : 'Exercices'}</h1>
        <div class="segments" role="group" aria-label="Rubrique">
          <button aria-pressed={onglet === 'exercices'} onclick={() => (onglet = 'exercices')}>Exercices</button>
          <button aria-pressed={onglet === 'dossiers'} onclick={() => (onglet = 'dossiers')}>Dossiers</button>
          <button aria-pressed={onglet === 'copies'} onclick={() => (onglet = 'copies')}>Copies</button>
          <button aria-pressed={onglet === 'parametres'} onclick={() => (onglet = 'parametres')}>Paramètres</button>
        </div>
      </div>
      {#if message}<p class="info" role="status">{message}</p>{/if}

      {#if onglet === 'exercices'}
        <div class="barre">
          <button class="btn btn-principal" onclick={nouveau}>Nouvel exercice</button>
          <select class="champ modele" bind:value={modeleId} aria-label="Exercice de départ">
            <option value="">Partir d'un exemple…</option>
            {#each exercicesDemo as modele}
              <option value={modele.id}>{etiquetteNiveau(modele)} — {modele.titre}</option>
            {/each}
          </select>
          <button
            class="btn"
            disabled={!modeleId}
            onclick={() => {
              const m = exercicesDemo.find((x) => x.id === modeleId);
              if (m) depuisExemple(m);
            }}>Copier cet exemple</button
          >
          <button class="btn" onclick={importer}>Importer un exercice…</button>
        </div>
        <div class="barre sauvegarde" role="group" aria-label="Sauvegarde">
          <button class="btn" onclick={sauvegarder} disabled={enseignant.exercices.length === 0}>Sauvegarder tous mes exercices</button>
          <button class="btn" onclick={restaurer}>Restaurer une sauvegarde…</button>
          <span class="discret petit" class:alerte-texte={enseignant.exercices.length > 0 && !enseignant.derniereSauvegarde}>
            {texteSauvegarde}. Vos exercices ne sont enregistrés que dans ce navigateur : sauvegardez-les régulièrement.
          </span>
        </div>
        <section class="carte">
          {#if enseignant.exercices.length === 0}
            <p class="vide">Aucun exercice pour l'instant. Créez-en un ou partez de l'exemple.</p>
          {:else}
            <table>
              <thead>
                <tr>
                  <th>Titre</th>
                  <th style="width:120px">Niveau</th>
                  <th style="width:110px">Mode</th>
                  <th style="width:100px">Opérations</th>
                  <th style="width:100px">Corrigé</th>
                  <th style="width:340px"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {#each enseignant.exercices as ex, i (ex.id)}
                  {@const ctrl = controlerExercice(ex, plan)}
                  <tr class:zebre={i % 2 === 1}>
                    <td>
                      <b>{ex.titre || 'Sans titre'}</b><br />
                      <span class="discret petit">{ex.raisonSociale}</span>
                      {#if ctrl.erreurs.length}<br /><span class="a-corriger">À compléter</span>{/if}
                    </td>
                    <td>{etiquetteNiveau(ex)}</td>
                    <td>{LIBELLES_MODE[ex.mode]}</td>
                    <td class="num">{ex.operations.length}</td>
                    <td class="num">{ex.corrige?.length ?? 0} / {ex.operations.length}</td>
                    <td class="actions">
                      <button class="btn-lien" onclick={() => (enseignant.edition = ex.id)}>Modifier</button>
                      <button class="btn-lien" onclick={() => exporter(ex, 'eleves')}>Exporter pour les élèves</button>
                      <button class="btn-lien" onclick={() => exporter(ex, 'enseignant')}>Version enseignant</button>
                      <button class="btn-lien" onclick={() => supprimer(ex)}>Supprimer</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </section>
        <p class="discret petit aide">
          « Exporter pour les élèves » crée le fichier à distribuer : sans corrigé en évaluation, avec corrigé encodé en
          entraînement. « Version enseignant » contient le corrigé en clair : conservez-la pour corriger les copies.
        </p>
      {:else if onglet === 'dossiers'}
        <DossiersEnseignant />
      {:else if onglet === 'copies'}
        <SyntheseCopies />
      {:else}
        <form class="carte etroit" onsubmit={changerCode}>
          <h2>Code d'accès</h2>
          <div class="corps-carte">
            <label class="bloc" for="nouveau-code">Nouveau code</label>
            <input id="nouveau-code" class="champ" type="password" bind:value={nouveauCode} autocomplete="off" />
            <div class="actions"><button class="btn" type="submit">Modifier le code</button></div>
          </div>
        </form>
      {/if}
    </main>
  {/if}
</div>

<style>
  .sauvegarde { align-items: center; flex-wrap: wrap; }
  .alerte-texte { color: var(--c-alerte-texte, #B34A12); font-weight: bold; }
  .page { min-height: 100%; }
  .bandeau-haut { background: var(--c-structure); padding: 14px 24px; display: flex; align-items: baseline; gap: 18px; }
  .logo { color: #fff; font-weight: bold; font-size: 16px; }
  .titre-espace { color: #b9cde0; flex: 1; }
  .fermer { color: #fff; }
  .contenu { max-width: 1200px; margin: 0 auto; padding: 24px 16px; }
  .etroit { max-width: 460px; }
  .actions { text-align: right; margin-top: 12px; display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap; }
  td.actions { margin: 0; }
  .barre { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
  .modele { width: 360px; }
  .petit { font-size: 12px; }
  .aide { margin-top: 10px; }
  .a-corriger { font-size: 12px; font-weight: bold; color: var(--c-alerte-texte); }
  .info { margin: 0 0 14px; }
  p.alerte { margin: 12px 0 0; }
</style>
