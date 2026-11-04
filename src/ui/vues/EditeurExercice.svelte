<script lang="ts">
  import { enseignant } from '../enseignant.svelte';
  import { etat } from '../etat.svelte';
  import { plan } from '../../data/plan';
  import {
    controlerExercice,
    LIBELLES_NIVEAU,
    type Exercice,
    type LibellesT,
    type Mode,
  } from '../../engine/exercice';
  import type { FormeJuridique } from '../../engine/dossier';
  import type { ModeBouclement } from '../../engine/closing';
  import { comptesDuNiveau, NIVEAUX, type Niveau } from '../../engine/plan';
  import { lireDate } from '../../engine/dates';
  import type { Centimes } from '../../engine/money';
  import { dt, m } from '../format';
  import ChampCompte from '../composants/ChampCompte.svelte';
  import ChampMontant from '../composants/ChampMontant.svelte';

  let { id }: { id: string } = $props();

  type LigneBilan = { cle: number; compte: string | null; montant: Centimes | null };
  type LigneOp = { cle: number; numero: string; date: string; texte: string; points: number };
  let n = 0;

  // Brouillon initialisé une seule fois : le parent recrée l'éditeur quand l'exercice change ({#key}).
  // svelte-ignore state_referenced_locally
  const source = enseignant.trouver(id)!;
  const versLignes = (r: Record<string, Centimes>): LigneBilan[] =>
    Object.entries(r).map(([compte, montant]) => ({ cle: ++n, compte, montant }));

  let titre = $state(source.titre);
  let niveau = $state<Niveau>(source.niveau);
  let raisonSociale = $state(source.raisonSociale);
  let formeJuridique = $state<FormeJuridique>(source.formeJuridique);
  let debut = $state(dt(source.debut));
  let fin = $state(dt(source.fin));
  let introduction = $state(source.introduction);
  let mode = $state<Mode>(source.mode);
  let modificationDirecte = $state(source.parametres.modificationDirecte);
  let libellesT = $state<LibellesT>(source.parametres.libellesT);
  let modeBouclement = $state<ModeBouclement>(source.parametres.modeBouclement);
  let tvaMethode = $state<'net' | 'brut'>(source.parametres.tvaMethode ?? 'net');
  let ficheSalaire = $state(source.parametres.ficheSalaire ?? false);
  let calculatriceTva = $state(source.parametres.calculatriceTva ?? false);
  const rep0 = source.parametres.repartition;
  let repBenefice = $state<number | null>(rep0?.benefice ?? null);
  let repReporte = $state<number | null>(rep0 ? Math.abs(rep0.reporte) : null);
  let repPerte = $state(rep0 ? rep0.reporte < 0 : false);
  let repCapital = $state<number | null>(rep0?.capital ?? null);
  let repResCapital = $state<number | null>(rep0?.reserveLegaleCapital ?? null);
  let repResBenefice = $state<number | null>(rep0?.reserveLegaleBenefice ?? null);
  let repTaux = $state(rep0 ? String(rep0.tauxDividende / 100) : '');
  let repTantiemes = $state<number | null>(rep0?.tantiemes ?? null);
  let repLibres = $state<number | null>(rep0?.reservesLibres ?? null);
  let repHolding = $state(rep0?.holding ?? false);
  let actif = $state<LigneBilan[]>(versLignes(source.ouvertureActif));
  let passif = $state<LigneBilan[]>(versLignes(source.ouverturePassif));
  let operations = $state<LigneOp[]>(
    source.operations.map((o) => ({ cle: ++n, numero: o.numero, date: dt(o.date), texte: o.texte, points: source.bareme?.[o.numero] ?? 1 })),
  );
  let pointsPartiels = $state(source.pointsPartiels ?? true);
  const totalPoints = $derived(operations.reduce((s, o) => s + (Number(o.points) || 0), 0));
  let message = $state('');

  const comptesBilan = $derived(
    comptesDuNiveau(plan, niveau).filter((c) => c.type === 'actif' || c.type === 'passif'),
  );
  const totalActif = $derived(actif.reduce((s, l) => s + (l.montant ?? 0), 0));
  const totalPassif = $derived(passif.reduce((s, l) => s + (l.montant ?? 0), 0));

  function versRecord(lignes: LigneBilan[]): Record<string, Centimes> {
    const r: Record<string, Centimes> = {};
    for (const l of lignes) if (l.compte && l.montant) r[l.compte] = (r[l.compte] ?? 0) + l.montant;
    return r;
  }

  function construire(): Exercice {
    const actuel = enseignant.trouver(id)!;
    const iso = (t: string) => lireDate(t) ?? '';
    return {
      ...actuel,
      titre: titre.trim(),
      niveau,
      raisonSociale: raisonSociale.trim(),
      formeJuridique,
      debut: iso(debut),
      fin: iso(fin),
      introduction: introduction.trim(),
      mode,
      operations: operations.map((o) => ({ numero: o.numero.trim(), date: lireDate(o.date, Number(fin.slice(-4))) ?? '', texte: o.texte.trim() })),
      bareme: Object.fromEntries(operations.map((o) => [o.numero.trim(), Math.max(0, Number(o.points) || 0)])),
      pointsPartiels,
      ouvertureActif: versRecord(actif),
      ouverturePassif: versRecord(passif),
      parametres: {
        ...actuel.parametres,
        modificationDirecte: mode === 'entrainement' && modificationDirecte,
        libellesT,
        modeBouclement,
        tvaMethode,
        ficheSalaire,
        calculatriceTva,
        repartition:
          niveau === 'MP' && formeJuridique !== 'raison individuelle' && repBenefice !== null && repCapital !== null
            ? {
                benefice: repBenefice,
                reporte: (repPerte ? -1 : 1) * (repReporte ?? 0),
                capital: repCapital,
                reserveLegaleCapital: repResCapital ?? 0,
                reserveLegaleBenefice: repResBenefice ?? 0,
                holding: repHolding,
                tauxDividende: Math.round((Number(repTaux.replace(',', '.')) || 0) * 100),
                tantiemes: repTantiemes ?? 0,
                reservesLibres: repLibres ?? 0,
              }
            : undefined,
      },
    };
  }

  const controle = $derived(controlerExercice(construire(), plan));

  function enregistrer() {
    enseignant.enregistrer(construire());
    message = 'Exercice enregistré dans ce navigateur.';
  }

  function fermer() {
    enregistrer();
    enseignant.edition = null;
  }

  function ajouterOperation() {
    const dernier = operations.at(-1);
    const suivant = String((Number(dernier?.numero) || operations.length) + 1);
    operations.push({ cle: ++n, numero: suivant, date: dernier?.date ?? debut, texte: '', points: 1 });
  }

  function saisirCorrige() {
    const ex = construire();
    enseignant.enregistrer(ex);
    // Le journal a besoin de dates valides et d'un bilan d'ouverture équilibré ; le reste peut attendre.
    const bloquant = controlerExercice(ex, plan).erreurs.some(
      (e) => e.startsWith("Bilan d'ouverture") || e.startsWith("Le bilan d'ouverture") || e.includes("dates d'exercice") || e.startsWith('La fin'),
    );
    if (bloquant) {
      message = "Corrigez d'abord les dates et le bilan d'ouverture : le corrigé se saisit dans le journal de l'exercice.";
      return;
    }
    etat.ouvrirCorrige(ex);
    enseignant.ouvert = false;
  }

  const corrigeSaisi = $derived(new Set((enseignant.trouver(id)?.corrige ?? []).map((c) => c.piece)));
</script>

<div class="titre">
  <h1>{titre || 'Nouvel exercice'}</h1>
  <div class="boutons">
    <button class="btn" onclick={fermer}>Fermer</button>
    <button class="btn btn-principal" onclick={enregistrer}>Enregistrer</button>
  </div>
</div>
{#if message}<p class="info" role="status">{message}</p>{/if}

<section class="carte">
  <h2>Informations générales</h2>
  <div class="corps-carte grille">
    <div class="large">
      <label class="bloc" for="ex-titre">Titre de l'exercice</label>
      <input id="ex-titre" class="champ" bind:value={titre} placeholder="Ex. Cycles du Léman — premier trimestre" />
    </div>
    <div>
      <label class="bloc" for="ex-niveau">Niveau</label>
      <select id="ex-niveau" class="champ" bind:value={niveau}>
        {#each NIVEAUX as nv}<option value={nv}>{LIBELLES_NIVEAU[nv]}</option>{/each}
      </select>
    </div>
    <div>
      <label class="bloc" for="ex-mode">Mode</label>
      <select id="ex-mode" class="champ" bind:value={mode}>
        <option value="entrainement">Entraînement (retour immédiat)</option>
        <option value="evaluation">Évaluation (aucun retour)</option>
      </select>
    </div>
    <div class="large">
      <label class="bloc" for="ex-rs">Raison sociale</label>
      <input id="ex-rs" class="champ" bind:value={raisonSociale} />
    </div>
    <div>
      <label class="bloc" for="ex-forme">Forme juridique</label>
      <select id="ex-forme" class="champ" bind:value={formeJuridique}>
        <option value="raison individuelle">Raison individuelle</option>
        {#if niveau === 'MP'}
          <option value="Sàrl">Sàrl</option>
          <option value="SA">SA</option>
        {/if}
      </select>
      {#if niveau !== 'MP'}<span class="discret petit">Sàrl et SA : niveau MP.</span>{/if}
    </div>
    <div class="dates">
      <div>
        <label class="bloc" for="ex-debut">Début</label>
        <input id="ex-debut" class="champ num" bind:value={debut} placeholder="JJ.MM.AAAA" />
      </div>
      <div>
        <label class="bloc" for="ex-fin">Fin</label>
        <input id="ex-fin" class="champ num" bind:value={fin} placeholder="JJ.MM.AAAA" />
      </div>
    </div>
    <div class="tout">
      <label class="bloc" for="ex-intro">Introduction de l'énoncé</label>
      <textarea id="ex-intro" class="champ" rows="3" bind:value={introduction}></textarea>
    </div>
    <div>
      <label class="bloc" for="ex-t">Comptes en T</label>
      <select id="ex-t" class="champ" bind:value={libellesT}>
        <option value="SI/SF">SI / SF</option>
        <option value="San/Spb">San / Spb</option>
      </select>
    </div>
    <div>
      <label class="bloc" for="ex-b">Bouclement</label>
      <select id="ex-b" class="champ" bind:value={modeBouclement}>
        <option value="compteDeResultat">Écritures par le compte 9000</option>
        <option value="aLaReouverture">Intégration à la réouverture</option>
      </select>
    </div>
    {#if niveau !== 'CFC1'}
      <div>
        <label class="bloc" for="ex-tva">Comptabilisation de la TVA</label>
        <select id="ex-tva" class="champ" bind:value={tvaMethode}>
          <option value="net">Au net</option>
          <option value="brut">Au brut</option>
        </select>
      </div>
      <label class="case"><input type="checkbox" bind:checked={ficheSalaire} /> Fiche « Décompte de salaire »</label>
      <label class="case large"><input type="checkbox" bind:checked={calculatriceTva} /> Calculatrice de TVA (aide au calcul)</label>
    {/if}
    {#if mode === 'entrainement'}
      <label class="case large"><input type="checkbox" bind:checked={modificationDirecte} /> Autoriser la modification directe des écritures validées</label>
    {/if}
  </div>
</section>

{#if niveau === 'MP' && formeJuridique !== 'raison individuelle'}
  <section class="carte">
    <h2>Répartition du bénéfice (fiche de l'élève)</h2>
    <div class="corps-carte grille">
      <div><label class="bloc" for="rep-b">Bénéfice de l'exercice</label><ChampMontant id="rep-b" libelle="Bénéfice de l'exercice" bind:valeur={repBenefice} /></div>
      <div>
        <label class="bloc" for="rep-r">Report de l'exercice précédent</label>
        <ChampMontant id="rep-r" libelle="Report" bind:valeur={repReporte} />
        <label class="case petit"><input type="checkbox" bind:checked={repPerte} /> Il s'agit d'une perte reportée</label>
      </div>
      <div><label class="bloc" for="rep-c">Capital inscrit au RC</label><ChampMontant id="rep-c" libelle="Capital" bind:valeur={repCapital} /></div>
      <div><label class="bloc" for="rep-t">Dividende (% du capital)</label><input id="rep-t" class="champ montant num" bind:value={repTaux} inputmode="decimal" /></div>
      <div><label class="bloc" for="rep-rc">Réserve légale issue du capital</label><ChampMontant id="rep-rc" libelle="Réserve légale issue du capital" bind:valeur={repResCapital} /></div>
      <div><label class="bloc" for="rep-rb">Réserve légale issue du bénéfice</label><ChampMontant id="rep-rb" libelle="Réserve légale issue du bénéfice" bind:valeur={repResBenefice} /></div>
      <div><label class="bloc" for="rep-ta">Tantièmes</label><ChampMontant id="rep-ta" libelle="Tantièmes" bind:valeur={repTantiemes} /></div>
      <div><label class="bloc" for="rep-l">Réserves libres</label><ChampMontant id="rep-l" libelle="Réserves libres" bind:valeur={repLibres} /></div>
      <label class="case large"><input type="checkbox" bind:checked={repHolding} /> Société holding (plafond de 20 %)</label>
    </div>
  </section>
{/if}

<section class="carte">
  <h2>Bilan d'ouverture</h2>
  <div class="corps-carte deux">
    {#each [{ titre: 'Actif', lignes: actif, total: totalActif, cote: 'actif' }, { titre: 'Passif', lignes: passif, total: totalPassif, cote: 'passif' }] as col}
      <div>
        <h3>{col.titre}</h3>
        <table class="bilan">
          <tbody>
            {#each col.lignes as l, i (l.cle)}
              <tr>
                <td><ChampCompte id={`ouv-${l.cle}`} libelle={`Compte ${col.titre}, ligne ${i + 1}`} comptes={comptesBilan} bind:valeur={l.compte} /></td>
                <td style="width:140px"><ChampMontant id={`ouvm-${l.cle}`} libelle={`Montant, ligne ${i + 1}`} bind:valeur={l.montant} /></td>
                <td style="width:30px">
                  <button class="retirer" aria-label="Retirer la ligne" onclick={() => col.lignes.splice(i, 1)}>×</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="pied-bilan">
          <button class="btn-lien" onclick={() => col.lignes.push({ cle: ++n, compte: null, montant: null })}>Ajouter un compte</button>
          <span>Total <b class="num">{m(col.total)}</b></span>
        </div>
      </div>
    {/each}
  </div>
  {#if totalActif !== totalPassif}
    <p class="alerte ecart-bilan">Le bilan n'est pas équilibré : écart de {m(Math.abs(totalActif - totalPassif))}.</p>
  {/if}
</section>

<section class="carte">
  <h2>Opérations de l'énoncé</h2>
  <div class="corps-carte">
    {#if operations.length === 0}<p class="vide">Aucune opération. Ajoutez la première.</p>{/if}
    <table class="ops">
      {#if operations.length}
        <thead>
          <tr>
            <th style="width:70px">N°</th>
            <th style="width:120px">Date</th>
            <th>Texte de l'opération</th>
            <th style="width:80px">Points</th>
            <th style="width:110px">Corrigé</th>
            <th style="width:30px"><span class="sr-only">Retirer</span></th>
          </tr>
        </thead>
      {/if}
      <tbody>
        {#each operations as o, i (o.cle)}
          <tr>
            <td><input class="champ num" aria-label="Numéro" bind:value={o.numero} /></td>
            <td><input class="champ num" aria-label="Date" bind:value={o.date} /></td>
            <td><textarea class="champ" aria-label="Texte" rows="2" bind:value={o.texte}></textarea></td>
            <td><input class="champ num points" type="number" min="0" step="0.5" aria-label="Points" bind:value={o.points} /></td>
            <td class="petit">{corrigeSaisi.has(o.numero.trim()) ? 'Saisi' : 'À saisir'}</td>
            <td><button class="retirer" aria-label="Retirer l'opération" onclick={() => operations.splice(i, 1)}>×</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="pied-ops">
      <button class="btn" onclick={ajouterOperation}>Ajouter une opération</button>
      <label class="case"><input type="checkbox" bind:checked={pointsPartiels} /> Points partiels pour les écritures multiples</label>
      <span>Total du barème : <b class="num">{totalPoints}</b> points</span>
    </div>
  </div>
</section>

<section class="carte">
  <h2>Corrigé</h2>
  <div class="corps-carte">
    <p>
      Le corrigé se saisit dans le journal de l'exercice, exactement comme un élève, en indiquant le numéro de
      l'opération comme numéro de pièce. Les écritures existantes du corrigé y sont reprises.
    </p>
    <button class="btn btn-principal" onclick={saisirCorrige}>Saisir le corrigé dans le journal</button>
  </div>
</section>

{#if controle.erreurs.length || controle.avertissements.length}
  <section class="carte controle">
    <h2>Contrôle de l'exercice</h2>
    <div class="corps-carte">
      {#if controle.erreurs.length}
        <div class="alerte"><b>À corriger avant de distribuer l'exercice :</b><ul>{#each controle.erreurs as e}<li>{e}</li>{/each}</ul></div>
      {/if}
      {#if controle.avertissements.length}
        <div class="info" style="margin-top:8px"><ul>{#each controle.avertissements as a}<li>{a}</li>{/each}</ul></div>
      {/if}
    </div>
  </section>
{:else}
  <p class="ok">L'exercice est complet et peut être distribué.</p>
{/if}

<style>
  .boutons { display: flex; gap: 8px; }
  section { margin-bottom: 16px; }
  .grille { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; align-items: start; }
  .large { grid-column: span 2; }
  .tout { grid-column: 1 / -1; }
  .dates { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; grid-column: span 2; }
  .case { align-self: center; }
  textarea.champ { resize: vertical; font: inherit; }
  .petit { font-size: 12px; }
  .deux { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  h3 { font-size: 13px; color: var(--c-structure); margin: 0 0 6px; }
  .bilan td, .ops td { border: none; padding: 3px 4px; }
  .pied-bilan { display: flex; justify-content: space-between; padding: 6px 4px; border-top: 1px solid var(--c-texte); margin-top: 4px; }
  .retirer { border: none; background: none; color: var(--c-texte-2); font-size: 18px; cursor: pointer; padding: 6px 4px; }
  .retirer:hover { color: var(--c-negatif); }
  .pied-ops { display: flex; gap: 18px; align-items: center; margin-top: 10px; flex-wrap: wrap; }
  .points { text-align: right; }
  .ecart-bilan { margin: 0 14px 14px; }
  .info { margin: 0 0 14px; }
  .info ul, .alerte ul { margin: 4px 0 0; padding-left: 18px; }
  @media (max-width: 1100px) { .grille { grid-template-columns: 1fr 1fr; } .deux { grid-template-columns: 1fr; } }
</style>
