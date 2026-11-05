<!-- Espace enseignant, onglet « Dossiers » : dossiers de pièces comptables à distribuer (PDF et fichiers d'exercice). -->
<script lang="ts">
  import { COMPLEMENTS_CORRIGE, DOSSIERS, versionEvaluation } from '../../data/dossiers';
  import { plan } from '../../data/plan';
  import { classerExercices, etiquetteNiveau, LIBELLES_FILIERE, type Exercice } from '../../engine/exercice';
  import { EXT_EXERCICE, exporterExercice, nomFichier } from '../../io/fichiers';
  import { telecharger, telechargerBlob } from '../fichiers-navigateur';

  const groupes = classerExercices(DOSSIERS);
  let enCours = $state<string | null>(null);
  let erreur = $state('');

  async function pdf(ex: Exercice, quoi: 'dossier' | 'corrige') {
    erreur = '';
    enCours = `${ex.id}:${quoi}`;
    try {
      const m = await import('../../pdf/dossier');
      if (quoi === 'dossier') {
        const nom = nomFichier([ex.raisonSociale, 'dossier'], '.pdf');
        telechargerBlob(nom, await m.genererPdfDossier(ex, plan, nom));
      } else {
        const nom = nomFichier([ex.raisonSociale, 'corrige'], '.pdf');
        telechargerBlob(nom, await m.genererPdfCorrige(ex, plan, nom, COMPLEMENTS_CORRIGE[ex.id]));
      }
    } catch (e) {
      erreur = `Le PDF n'a pas pu être créé : ${e instanceof Error ? e.message : String(e)}`;
    } finally {
      enCours = null;
    }
  }

  function fichier(ex: Exercice, mode: 'entrainement' | 'evaluation') {
    const e = mode === 'evaluation' ? versionEvaluation(ex) : ex;
    telecharger(nomFichier([ex.raisonSociale, mode === 'evaluation' ? 'evaluation' : 'entrainement'], EXT_EXERCICE), exporterExercice(e));
  }
</script>

<p class="discret aide-haut">
  Un dossier par grand thème, chacun avec une entreprise fictive et 10 à 12 pièces comptables. Distribuez aux élèves le
  dossier PDF et le fichier d'exercice ; les pièces s'affichent aussi dans le journal. Les dossiers sont déjà proposés
  à l'accueil en entraînement.
</p>
{#if erreur}<div class="alerte" role="alert">{erreur}</div>{/if}

{#each groupes as g, i}
  {#if i === 0 || groupes[i - 1]!.filiere !== g.filiere}<h2 class="filiere">{LIBELLES_FILIERE[g.filiere]}</h2>{/if}
  <section class="carte">
    <h3>Niveau {g.difficulte}{g.titre ? ` — ${g.titre}` : ''}</h3>
    <table class="tableau">
      <thead>
        <tr><th>Dossier</th><th class="num">Pièces</th><th>Pour les élèves</th><th>Pour l'enseignant</th></tr>
      </thead>
      <tbody>
        {#each g.exercices as ex (ex.id)}
          <tr>
            <td>
              <strong>{ex.raisonSociale}</strong> <span class="badge niveau">{etiquetteNiveau(ex)}</span><br />
              <span class="discret petit">{(ex.sujets ?? []).join(' · ')}</span>
            </td>
            <td class="num">{ex.operations.length}</td>
            <td class="actions">
              <button class="btn" disabled={enCours !== null} onclick={() => pdf(ex, 'dossier')}>
                {enCours === `${ex.id}:dossier` ? 'Création…' : 'Dossier PDF'}
              </button>
              <button class="btn" onclick={() => fichier(ex, 'entrainement')}>Fichier entraînement</button>
              <button class="btn" onclick={() => fichier(ex, 'evaluation')}>Fichier évaluation</button>
            </td>
            <td class="actions">
              <button class="btn" disabled={enCours !== null} onclick={() => pdf(ex, 'corrige')}>
                {enCours === `${ex.id}:corrige` ? 'Création…' : 'Corrigé PDF'}
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/each}

<p class="discret petit aide">
  Fichier entraînement : corrigé encodé, retour immédiat. Fichier évaluation : sans corrigé, aucun retour pendant la
  saisie ; les copies se corrigent dans l'onglet « Copies » (le corrigé y est déjà connu). Le corrigé PDF contient les
  écritures de chaque pièce, le bouclement s'il est demandé et les états financiers.
</p>

<style>
  .aide-haut { margin: 0 0 12px; max-width: 900px; }
  h2.filiere { font-size: 16px; color: var(--c-structure); margin: 18px 0 8px; }
  .carte { margin-bottom: 14px; }
  .carte h3 { margin: 0; padding: 10px 14px; font-size: 14px; border-bottom: 1px solid #d5dbe1; }
  .num { text-align: right; width: 70px; }
  .actions { white-space: nowrap; }
  .actions .btn { margin: 2px 4px 2px 0; }
  .aide { margin-top: 8px; max-width: 900px; }
</style>
