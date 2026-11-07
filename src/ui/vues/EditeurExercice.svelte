<script lang="ts">
  import { enseignant } from '../enseignant.svelte';
  import { etat } from '../etat.svelte';
  import { plan } from '../../data/plan';
  import {
    basculerCompte,
    comptesChoisis,
    controlerExercice,
    LIBELLES_NIVEAU,
    LIBELLES_CONTENU,
    TITRES_DIFFICULTE,
    filiereDe,
    difficulteDe,
    type Filiere,
    type Exercice,
    type LibellesT,
    type Mode,
  } from '../../engine/exercice';
  import type { FormeJuridique } from '../../engine/dossier';
  import type { ModeBouclement } from '../../engine/closing';
  import { comptesDuNiveau, NIVEAUX, type Niveau } from '../../engine/plan';
  import { lireDate } from '../../engine/dates';
  import type { Centimes } from '../../engine/money';
  import { dt, m, normaliser, TITRES_CLASSES } from '../format';
  import ChampCompte from '../composants/ChampCompte.svelte';
  import ChampMontant from '../composants/ChampMontant.svelte';
  import { PIECE_BOUCLEMENT, POINTS_BOUCLEMENT_PAR_DEFAUT } from '../../engine/correction-bouclement';

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
  const SAUT = String.fromCharCode(10); // saut de ligne entre les sujets
  let filiere = $state<Filiere>(filiereDe(source));
  let difficulte = $state<number>(difficulteDe(source));
  let sujets = $state((source.sujets ?? []).join(SAUT));
  let raisonSociale = $state(source.raisonSociale);
  let formeJuridique = $state<FormeJuridique>(source.formeJuridique);
  let debut = $state(dt(source.debut));
  let fin = $state(dt(source.fin));
  let introduction = $state(source.introduction);
  let situation = $state(source.situation ?? '');
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
  const seuil0 = source.parametres.seuil;
  let seuilUnite = $state(seuil0?.unite ?? '');
  let seuilPrix = $state<number | null>(seuil0?.prixVente ?? null);
  let seuilCout = $state<number | null>(seuil0?.coutVariable ?? null);
  let seuilFixes = $state<number | null>(seuil0?.chargesFixes ?? null);
  let seuilQuantite = $state(seuil0 ? String(seuil0.quantite) : '');
  let actif = $state<LigneBilan[]>(versLignes(source.ouvertureActif));
  let passif = $state<LigneBilan[]>(versLignes(source.ouverturePassif));
  let operations = $state<LigneOp[]>(
    source.operations.map((o) => ({ cle: ++n, numero: o.numero, date: dt(o.date), texte: o.texte, points: source.bareme?.[o.numero] ?? 1 })),
  );
  let pointsPartiels = $state(source.pointsPartiels ?? true);
  let corrigerBouclement = $state(source.parametres.corrigerBouclement ?? false);
  let bouclementAutomatique = $state(source.parametres.bouclementAutomatique ?? false);
  let pointsBouclement = $state<number>(source.bareme?.[PIECE_BOUCLEMENT] ?? POINTS_BOUCLEMENT_PAR_DEFAUT);
  const totalPoints = $derived(operations.reduce((s, o) => s + (Number(o.points) || 0), 0));
  let message = $state('');

  let comptesAjoutes = $state<string[]>([...source.parametres.comptesAjoutes]);
  let comptesMasques = $state<string[]>([...source.parametres.comptesMasques]);
  let filtreComptes = $state('');
  const choisis = $derived(comptesChoisis(plan, niveau, { comptesAjoutes, comptesMasques }));
  const duNiveau = $derived(new Set(comptesDuNiveau(plan, niveau).map((c) => c.numero)));
  const groupesComptes = $derived.by(() => {
    const t = normaliser(filtreComptes.trim());
    const liste = t ? plan.filter((c) => normaliser(c.intitule).includes(t) || c.numero.startsWith(t)) : plan;
    const g: { classe: number; comptes: typeof plan }[] = [];
    for (const c of liste) {
      const dernier = g.at(-1);
      if (dernier && dernier.classe === c.classe) dernier.comptes.push(c);
      else g.push({ classe: c.classe, comptes: [c] });
    }
    return g;
  });

  function basculer(numero: string, coche: boolean) {
    const r = basculerCompte(plan, niveau, { comptesAjoutes, comptesMasques }, numero, coche);
    comptesAjoutes = r.comptesAjoutes;
    comptesMasques = r.comptesMasques;
  }

  function retablirNiveau() {
    comptesAjoutes = [];
    comptesMasques = [];
  }

  const comptesBilan = $derived(
    plan.filter((c) => choisis.has(c.numero) && (c.type === 'actif' || c.type === 'passif')),
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
      filiere,
      difficulte: Math.max(1, Math.floor(Number(difficulte) || 1)),
      sujets: sujets.split(SAUT).map((c) => c.trim()).filter(Boolean),
      raisonSociale: raisonSociale.trim(),
      formeJuridique,
      debut: iso(debut),
      fin: iso(fin),
      introduction: introduction.trim(),
      situation: situation.trim(),
      mode,
      operations: operations.map((o) => ({ numero: o.numero.trim(), date: lireDate(o.date, Number(fin.slice(-4))) ?? '', texte: o.texte.trim() })),
      bareme: {
        ...Object.fromEntries(operations.map((o) => [o.numero.trim(), Math.max(0, Number(o.points) || 0)])),
        [PIECE_BOUCLEMENT]: Math.max(0, Number(pointsBouclement) || 0),
      },
      pointsPartiels,
      ouvertureActif: versRecord(actif),
      ouverturePassif: versRecord(passif),
      parametres: {
        ...actuel.parametres,
        ...basculerCompte(plan, niveau, { comptesAjoutes, comptesMasques }, '', false),
        modificationDirecte: mode === 'entrainement' && modificationDirecte,
        libellesT,
        modeBouclement,
        corrigerBouclement: modeBouclement === 'compteDeResultat' && !bouclementAutomatique && corrigerBouclement,
        bouclementAutomatique: modeBouclement === 'compteDeResultat' && bouclementAutomatique,
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
        seuil:
          niveau === 'MP' && seuilUnite.trim() && seuilPrix !== null && seuilCout !== null && seuilFixes !== null
            ? {
                unite: seuilUnite.trim(),
                prixVente: seuilPrix,
                coutVariable: seuilCout,
                chargesFixes: seuilFixes,
                quantite: Math.max(0, Math.round(Number(seuilQuantite) || 0)),
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
      <label class="bloc" for="ex-niveau">Comptes et fonctions</label>
      <select id="ex-niveau" class="champ" bind:value={niveau}>
        {#each NIVEAUX as nv}<option value={nv}>{LIBELLES_CONTENU[nv]}</option>{/each}
      </select>
    </div>
    <div>
      <label class="bloc" for="ex-filiere">Formation</label>
      <select id="ex-filiere" class="champ" bind:value={filiere}>
        <option value="CFC">CFC</option>
        <option value="MP">Maturité professionnelle</option>
      </select>
    </div>
    <div>
      <label class="bloc" for="ex-difficulte">Niveau de difficulté</label>
      <select id="ex-difficulte" class="champ" bind:value={difficulte}>
        {#each [1, 2, 3, 4, 5] as n}
          <option value={n}>Niveau {n}{TITRES_DIFFICULTE[filiere][n] ? ` — ${TITRES_DIFFICULTE[filiere][n]}` : ''}</option>
        {/each}
      </select>
    </div>
    <div class="large">
      <label class="bloc" for="ex-sujets">Sujets traités (un par ligne, affichés aux élèves)</label>
      <textarea id="ex-sujets" class="champ" rows="2" bind:value={sujets} placeholder="TVA"></textarea>
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
    <div class="tout">
      <label class="bloc" for="ex-situation">Situation de départ (affichée à l'élève dans « Votre situation »)</label>
      <textarea
        id="ex-situation"
        class="champ"
        rows="5"
        bind:value={situation}
        placeholder="Qui est l'élève dans l'entreprise, que vend-elle, avec qui travaille-t-il, qu'attend-on de lui ?"
      ></textarea>
      <span class="discret petit">Une ligne vide sépare deux paragraphes.</span>
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
    {#if modeBouclement === 'compteDeResultat'}
      <label class="case">
        <input type="checkbox" bind:checked={bouclementAutomatique} /> Bouclement automatique (le logiciel passe les écritures ; non noté)
      </label>
    {/if}
    {#if modeBouclement === 'compteDeResultat' && !bouclementAutomatique}
      <label class="case">
        <input type="checkbox" bind:checked={corrigerBouclement} /> Corriger et noter les écritures de bouclement
      </label>
      {#if corrigerBouclement}
        <label class="case">
          Points du bouclement
          <input class="champ num points-b" type="number" min="0" step="0.5" bind:value={pointsBouclement} />
        </label>
      {/if}
    {/if}
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

{#if niveau === 'MP'}
  <section class="carte">
    <h2>Seuil de rentabilité (fiche de l'élève, facultative)</h2>
    <div class="corps-carte grille">
      <div><label class="bloc" for="seuil-u">Unité vendue (au singulier)</label><input id="seuil-u" class="champ" bind:value={seuilUnite} placeholder="vélo" /></div>
      <div><label class="bloc" for="seuil-p">Prix de vente par unité</label><ChampMontant id="seuil-p" libelle="Prix de vente par unité" bind:valeur={seuilPrix} /></div>
      <div><label class="bloc" for="seuil-c">Coût variable par unité</label><ChampMontant id="seuil-c" libelle="Coût variable par unité" bind:valeur={seuilCout} /></div>
      <div><label class="bloc" for="seuil-f">Charges fixes de la période</label><ChampMontant id="seuil-f" libelle="Charges fixes" bind:valeur={seuilFixes} /></div>
      <div><label class="bloc" for="seuil-q">Quantité vendue prévue</label><input id="seuil-q" class="champ montant num" inputmode="numeric" bind:value={seuilQuantite} /></div>
    </div>
    <p class="petit discret aide-seuil">Laissez l'unité vide pour ne pas proposer la fiche aux élèves.</p>
  </section>
{/if}

<section class="carte">
  <h2>Comptes de l'exercice</h2>
  <div class="corps-carte">
    <p class="petit discret">
      Cochés par défaut : les comptes du niveau {LIBELLES_NIVEAU[niveau]}. Cochez un compte pour l'ajouter, décochez-le
      pour le retirer de la liste proposée aux élèves. {choisis.size} comptes choisis.
    </p>
    <div class="outils-comptes">
      <label class="sr-only" for="ex-filtre-comptes">Rechercher un compte</label>
      <input id="ex-filtre-comptes" class="champ" type="search" placeholder="Rechercher par nom ou numéro" bind:value={filtreComptes} />
      {#if comptesAjoutes.length || comptesMasques.length}
        <button class="btn-lien" onclick={retablirNiveau}>Revenir aux comptes du niveau</button>
      {/if}
    </div>
    {#if groupesComptes.length === 0}<p class="vide">Aucun compte ne correspond à « {filtreComptes} ».</p>{/if}
    <div class="classes">
      {#each groupesComptes as g (g.classe)}
        <fieldset>
          <legend>{TITRES_CLASSES[g.classe] ?? `Classe ${g.classe}`}</legend>
          {#each g.comptes as c (c.numero)}
            <label class="compte" class:hors={!duNiveau.has(c.numero)}>
              <input type="checkbox" checked={choisis.has(c.numero)} onchange={(e) => basculer(c.numero, e.currentTarget.checked)} />
              <span>{c.intitule}</span> <span class="numero">{c.numero}</span>
            </label>
          {/each}
        </fieldset>
      {/each}
    </div>
    <p class="petit discret">En italique : comptes hors du niveau (ajout facultatif).</p>
  </div>
</section>

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
      <span>Total du barème : <b class="num">{totalPoints + (modeBouclement === 'compteDeResultat' && !bouclementAutomatique && corrigerBouclement ? Number(pointsBouclement) || 0 : 0)}</b> points</span>
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
  .aide-seuil { padding: 0 14px 12px; margin: 0; }
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
  .points-b { width: 80px; text-align: right; margin-left: 8px; }
  .ecart-bilan { margin: 0 14px 14px; }
  .info { margin: 0 0 14px; }
  .info ul, .alerte ul { margin: 4px 0 0; padding-left: 18px; }
  .outils-comptes { display: flex; gap: 14px; align-items: center; margin: 8px 0 10px; }
  .outils-comptes input { max-width: 320px; }
  .classes { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; max-height: 420px; overflow-y: auto; }
  fieldset { border: 1px solid var(--c-bordure-2); padding: 6px 10px 8px; margin: 0; }
  legend { font-size: 12px; font-weight: bold; color: var(--c-structure); padding: 0 4px; }
  .compte { display: flex; gap: 6px; align-items: baseline; padding: 2px 0; cursor: pointer; }
  .compte.hors span:first-of-type { font-style: italic; color: var(--c-texte-2); }
  .numero { font-size: 11px; color: var(--c-texte-2); font-variant-numeric: tabular-nums; }
  @media (max-width: 1100px) { .grille { grid-template-columns: 1fr 1fr; } .deux { grid-template-columns: 1fr; } }
</style>
