<!-- Espace enseignant, onglet « Relecture » : valider le contenu proposé (exercices, dossiers, théorie) et noter des remarques. -->
<script lang="ts">
  import { enseignant } from '../enseignant.svelte';
  import { etat } from '../etat.svelte';
  import { estDossier, exercicesDemo } from '../../data/demos';
  import { CHAPITRES } from '../../data/theorie';
  import { classerExercices, LIBELLES_FILIERE, type Exercice } from '../../engine/exercice';
  import { compterValides, texteRelecture, type ElementRelecture } from '../../io/relecture';
  import { nomFichier } from '../../io/fichiers';
  import { telecharger } from '../fichiers-navigateur';
  import { dateHeure } from '../format';

  type Ligne = ElementRelecture & { exercice?: Exercice; chapitre?: string; precision: string };
  type Section = { titre: string; lignes: Ligne[] };

  const LIBELLES_NIVEAU = { CFC1: 'CFC 1re année', CFC2: 'CFC 2e année', MP: 'Maturité professionnelle' } as const;

  const sections: Section[] = [
    {
      titre: 'Théorie',
      lignes: CHAPITRES.map((c) => ({
        cle: `th:${c.id}`,
        groupe: 'Théorie',
        titre: c.titre,
        chapitre: c.id,
        precision: `À partir de ${LIBELLES_NIVEAU[c.niveau]}`,
      })),
    },
    ...classerExercices(exercicesDemo).map((g) => ({
      titre: `${LIBELLES_FILIERE[g.filiere]} · niveau ${g.difficulte}${g.titre ? ` — ${g.titre}` : ''}`,
      lignes: g.exercices.map((ex) => ({
        cle: `ex:${ex.id}`,
        groupe: `${g.filiere} · niveau ${g.difficulte}`,
        titre: ex.titre,
        exercice: ex,
        precision: `${estDossier(ex) ? 'Dossier de pièces' : 'Exercice'} · ${ex.operations.length} ${estDossier(ex) ? 'pièces' : 'opérations'}`,
      })),
    })),
    {
      titre: 'Plan comptable',
      lignes: [
        {
          cle: 'plan:niveaux',
          groupe: 'Plan comptable',
          titre: "Niveaux d'accès des comptes (quels comptes sont proposés en CFC 1re, CFC 2e et MP)",
          precision: "Visible dans l'éditeur d'exercice, rubrique « Comptes de l'exercice »",
        },
      ],
    },
  ];
  const elements = sections.flatMap((s) => s.lignes);

  let filtre = $state<'tout' | 'arelire' | 'remarques'>('arelire');
  const avis = (cle: string) => enseignant.relecture[cle];
  const visible = (l: Ligne) =>
    filtre === 'tout' ? true : filtre === 'arelire' ? !avis(l.cle)?.valide : !!avis(l.cle)?.remarque.trim();
  const valides = $derived(compterValides(elements, enseignant.relecture));
  const ouverts = $state<Record<string, boolean>>({});

  function apercu(ex: Exercice) {
    etat.ouvrirApercu(ex);
    enseignant.ouvert = false;
  }

  /** Ouvre un chapitre dans l'aperçu d'un exercice du même niveau (la théorie s'affiche selon le niveau). */
  function lire(chapitre: string) {
    const ch = CHAPITRES.find((c) => c.id === chapitre)!;
    const ex = exercicesDemo.find((e) => e.niveau === ch.niveau) ?? exercicesDemo[0]!;
    etat.ouvrirApercu(ex);
    etat.chapitreCible = chapitre;
    etat.aller('theorie');
    enseignant.ouvert = false;
  }

  function exporter() {
    const jour = new Date().toISOString().slice(0, 10);
    telecharger(nomFichier(['relecture', 'compta-pme', jour], '.txt'), texteRelecture(elements, $state.snapshot(enseignant.relecture)), 'text/plain');
  }
</script>

<section class="carte">
  <div class="corps-carte entete-relecture">
    <div>
      <strong>{valides} / {elements.length} éléments validés</strong>
      <span class="barre" aria-hidden="true"><span style={`width:${(valides / elements.length) * 100}%`}></span></span>
    </div>
    <div class="segments" role="group" aria-label="Afficher">
      <button aria-pressed={filtre === 'arelire'} onclick={() => (filtre = 'arelire')}>À relire</button>
      <button aria-pressed={filtre === 'remarques'} onclick={() => (filtre = 'remarques')}>Avec remarque</button>
      <button aria-pressed={filtre === 'tout'} onclick={() => (filtre = 'tout')}>Tout</button>
    </div>
    <button class="btn btn-principal" onclick={exporter}>Exporter mes remarques (texte)</button>
  </div>
  <p class="discret petit aide">
    Cochez « Validé » quand un contenu est juste ; notez vos corrections dans « Remarque ». Vos avis restent dans ce
    navigateur et dans votre sauvegarde. Pour que les corrections et les validations apparaissent chez les élèves,
    transmettez le fichier « Exporter mes remarques » : le contenu officiel du logiciel sera mis à jour en conséquence.
  </p>
</section>

{#each sections as s (s.titre)}
  {@const lignes = s.lignes.filter(visible)}
  {#if lignes.length}
    <section class="carte">
      <h2>{s.titre} <span class="discret petit">· {compterValides(s.lignes, enseignant.relecture)} / {s.lignes.length} validés</span></h2>
      <table>
        <tbody>
          {#each lignes as l, i (l.cle)}
            {@const a = avis(l.cle)}
            <tr class:zebre={i % 2 === 1}>
              <td class="case">
                <label>
                  <input
                    type="checkbox"
                    checked={a?.valide ?? false}
                    onchange={(e) => enseignant.avis(l.cle, { valide: (e.currentTarget as HTMLInputElement).checked })}
                  />
                  Validé
                </label>
              </td>
              <td>
                <strong>{l.titre}</strong><br />
                <span class="discret petit">{l.precision}{a?.le ? ` · modifié le ${dateHeure(a.le)}` : ''}</span>
                {#if ouverts[l.cle] || a?.remarque}
                  <textarea
                    class="champ remarque"
                    rows="2"
                    placeholder="Ce qu'il faut corriger : numéro de pièce ou section, montant, compte, formulation…"
                    aria-label={`Remarque sur ${l.titre}`}
                    value={a?.remarque ?? ''}
                    oninput={(e) => enseignant.avis(l.cle, { remarque: (e.currentTarget as HTMLTextAreaElement).value })}
                  ></textarea>
                {/if}
              </td>
              <td class="actions">
                {#if l.exercice}<button class="btn-lien" onclick={() => apercu(l.exercice!)}>Aperçu</button>{/if}
                {#if l.chapitre}<button class="btn-lien" onclick={() => lire(l.chapitre!)}>Lire</button>{/if}
                {#if !ouverts[l.cle] && !a?.remarque}
                  <button class="btn-lien" onclick={() => (ouverts[l.cle] = true)}>Remarque</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
{/each}

{#if elements.filter(visible).length === 0}
  <p class="vide carte">
    {filtre === 'arelire' ? 'Tout le contenu est validé.' : 'Aucune remarque pour le moment.'}
  </p>
{/if}

<style>
  section { margin-bottom: 16px; }
  h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
  .entete-relecture { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: space-between; }
  .barre { display: inline-block; width: 200px; height: 10px; border-radius: 5px; background: var(--c-bordure-2); overflow: hidden; vertical-align: middle; margin-left: 10px; }
  .barre span { display: block; height: 100%; background: var(--c-ok); }
  .aide { padding: 0 14px 12px; margin: 0; max-width: 900px; }
  .petit { font-size: 12px; }
  .case { width: 90px; white-space: nowrap; vertical-align: top; }
  .case label { display: inline-flex; gap: 6px; align-items: center; }
  td { vertical-align: top; }
  .actions { width: 190px; text-align: right; white-space: nowrap; }
  .actions .btn-lien { margin-left: 10px; }
  .remarque { display: block; width: 100%; margin-top: 6px; resize: vertical; font: inherit; }
  .vide { padding: 14px; }
</style>
