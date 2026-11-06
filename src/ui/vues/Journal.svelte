<script lang="ts">
  import { tick } from 'svelte';
  import { etat } from '../etat.svelte';
  import { comptesDisponibles } from '../../engine/dossier';
  import { ajouterEcriture, estExtournee, extourner, modifierEcriture, nouvelId } from '../../engine/journal';
  import { diagnostiquer, enregistrerTentative, solutionDisponible, INDICES, type Diagnostic } from '../../engine/correction';
  import type { Dossier, Ecriture } from '../../engine/dossier';
  import { bouclementCorrige, corrigeBouclement, diagnostiquerBouclement, PIECE_BOUCLEMENT } from '../../engine/correction-bouclement';
  import { operationsSaisies } from '../../engine/exercice';
  import { annee, lireDate } from '../../engine/dates';
  import type { Centimes } from '../../engine/money';
  import { m, dt } from '../format';
  import ChampCompte from '../composants/ChampCompte.svelte';
  import ChampMontant from '../composants/ChampMontant.svelte';
  import PieceVue from '../composants/PieceVue.svelte';
  import { chapitrePourComptes } from '../../data/theorie';

  type LigneSaisie = { cle: number; debit: string | null; credit: string | null; montant: Centimes | null };

  let compteur = 0;
  const nouvelleLigne = (): LigneSaisie => ({ cle: ++compteur, debit: null, credit: null, montant: null });

  const d = $derived(etat.dossier);
  const ex = $derived(etat.exercice);
  const comptes = $derived(comptesDisponibles(d));
  const intitules = $derived(new Map(d.plan.map((c) => [c.numero, c.intitule])));
  const saisies = $derived(operationsSaisies(d));
  const operations = $derived(d.debut === ex.debut ? ex.operations : []);

  // ---- Retour gradué (entraînement) ----
  const corrigeParPiece = $derived(new Map((ex.corrige ?? []).map((c) => [c.piece, c])));
  const avecBouclement = $derived(bouclementCorrige(ex));
  const retour = $derived(
    ex.mode === 'entrainement' &&
      etat.session!.role === 'eleve' &&
      (corrigeParPiece.size > 0 || avecBouclement) &&
      operations.length > 0,
  );
  /** Clé de suivi : le numéro d'opération, ou « Bouclement » pour les écritures de bouclement. */
  function cle(piece: string): string {
    return avecBouclement && !operations.some((o) => o.numero === piece) ? PIECE_BOUCLEMENT : piece;
  }
  function solutionDe(k: string) {
    return k === PIECE_BOUCLEMENT ? corrigeBouclement(d, ex) : corrigeParPiece.get(k);
  }
  const modifAutorisee = $derived(ex.mode === 'entrainement' && ex.parametres.modificationDirecte && etat.session!.role === 'eleve');
  const suivi = $derived(etat.session!.suivi);

  function evaluer(dossier: Dossier, piece: string, compter: boolean) {
    if (!retour) return;
    const p = cle(piece);
    let diag: Diagnostic | null;
    if (p === PIECE_BOUCLEMENT) diag = diagnostiquerBouclement(dossier, ex);
    else {
      const c = corrigeParPiece.get(p);
      diag = c ? diagnostiquer(dossier.ecritures, c) : null;
    }
    if (!diag) return;
    if (compter) etat.majSuivi(enregistrerTentative(suivi, p, diag));
    else {
      const ancien = suivi[p] ?? { essais: 0, solutionVue: false, dernier: diag };
      etat.majSuivi({ ...suivi, [p]: { ...ancien, dernier: diag } });
    }
  }

  function statut(p: string): Diagnostic | null {
    return retour ? (suivi[p]?.dernier ?? null) : null;
  }

  const libelleStatut = (x: Diagnostic | null) =>
    x === 'juste' ? 'Juste' : x === 'incomplete' ? 'Incomplète' : x && x !== 'manquante' ? 'À revoir' : '';
  const classeStatut = (x: Diagnostic | null) =>
    x === 'juste' ? 'juste' : x === 'incomplete' ? 'neutre' : x && x !== 'manquante' ? 'revoir' : '';

  /** Chapitre de théorie lié à une opération, d'après les comptes de son corrigé. */
  function chapitreDe(k: string) {
    const c = solutionDe(k);
    if (!c) return null;
    const comptes = c.lignes.flatMap((l) => [l.debit, l.credit]).filter((x): x is string => !!x);
    return chapitrePourComptes(comptes, ex.niveau);
  }
  function revoirTheorie(id: string) {
    etat.chapitreCible = id;
    etat.aller('theorie');
  }

  function voirSolution(p: string) {
    const ancien = suivi[p];
    if (ancien) etat.majSuivi({ ...suivi, [p]: { ...ancien, solutionVue: true } });
  }

  let editionId = $state<string | null>(null);
  let voirPiece = $state(true);

  function prochaineOperation() {
    return operations.find((o) => !saisies.has(o.numero));
  }

  const op0 = prochaineOperation();
  let date = $state(op0 ? dt(op0.date) : '');
  let piece = $state(op0?.numero ?? '');
  let libelle = $state('');
  let lignes = $state<LigneSaisie[]>([nouvelleLigne()]);
  let erreurs = $state<string[]>([]);
  let grille: HTMLElement | undefined = $state();

  const utiles = $derived(lignes.filter((l) => l.debit || l.credit || l.montant !== null));
  const totalDebit = $derived(utiles.reduce((s, l) => s + (l.debit ? (l.montant ?? 0) : 0), 0));
  const totalCredit = $derived(utiles.reduce((s, l) => s + (l.credit ? (l.montant ?? 0) : 0), 0));
  const ecart = $derived(totalDebit - totalCredit);
  const incomplete = $derived(utiles.some((l) => (!l.debit && !l.credit) || l.montant === null));
  const equilibree = $derived(utiles.length > 0 && !incomplete && ecart === 0 && totalDebit > 0);
  const operationCourante = $derived(operations.find((o) => o.numero === piece.trim()));

  // Ouverture depuis le récapitulatif de l'avancement : sélectionne l'opération demandée.
  $effect(() => {
    const cible = etat.pieceCiblee;
    if (cible) {
      etat.pieceCiblee = null;
      choisirOperation(cible);
    }
  });

  function choisirOperation(numero: string) {
    const o = operations.find((x) => x.numero === numero);
    if (!o) return;
    piece = o.numero;
    date = dt(o.date);
    erreurs = [];
    tick().then(() => document.getElementById('saisie-libelle')?.focus());
  }

  function reinitialiser() {
    editionId = null;
    const o = prochaineOperation();
    piece = o?.numero ?? '';
    date = o ? dt(o.date) : date;
    libelle = '';
    lignes = [nouvelleLigne()];
    erreurs = [];
  }

  async function valider() {
    const iso = lireDate(date, annee(d.debut));
    if (!iso) {
      erreurs = ['Indiquez une date valide au format JJ.MM.AAAA.'];
      return;
    }
    const p = piece.trim();
    const contenu = {
      date: iso,
      piece: p,
      libelle: libelle.trim(),
      lignes: utiles.map((l) => ({ debit: l.debit, credit: l.credit, montant: l.montant ?? 0 })),
    };
    const ancienne = editionId ? d.ecritures.find((e) => e.id === editionId) : undefined;
    const r = editionId ? modifierEcriture(d, editionId, contenu) : ajouterEcriture(d, { id: nouvelId(d), ...contenu });
    if (!r.ok) {
      erreurs = r.erreurs;
      return;
    }
    etat.majDossier(r.valeur);
    if (ancienne && ancienne.piece !== p) evaluer(r.valeur, ancienne.piece, false);
    evaluer(r.valeur, p, true);
    // Les écritures attendues du bouclement dépendent des comptes : on met son état à jour.
    if (cle(p) !== PIECE_BOUCLEMENT && etat.session!.suivi[PIECE_BOUCLEMENT]) evaluer(etat.dossier, PIECE_BOUCLEMENT, false);
    reinitialiser();
    await tick();
    document.getElementById('saisie-libelle')?.focus();
  }

  function champs(): HTMLElement[] {
    return grille ? [...grille.querySelectorAll<HTMLElement>('[data-champ]')] : [];
  }

  async function touche(e: KeyboardEvent) {
    const cible = e.target as HTMLElement;
    const tr = cible.closest<HTMLElement>('[data-ligne]');
    const i = tr ? Number(tr.dataset.ligne) : -1;
    if (e.key === 'Enter' && !e.defaultPrevented) {
      e.preventDefault();
      if (equilibree) return valider();
      const l = lignes[i];
      const ligneComplete = l && (l.debit || l.credit) && l.montant !== null;
      if (ligneComplete && i === lignes.length - 1) {
        lignes.push(nouvelleLigne());
        await tick();
        document.getElementById(`debit-${lignes[lignes.length - 1]!.cle}`)?.focus();
      } else {
        const tous = champs();
        tous[tous.indexOf(cible) + 1]?.focus();
      }
    } else if (e.key === 'Escape' && !e.defaultPrevented && i >= 0) {
      e.preventDefault();
      retirerLigne(i);
    }
  }

  function retirerLigne(i: number) {
    if (lignes.length > 1) lignes.splice(i, 1);
    else lignes = [nouvelleLigne()];
  }

  function demanderExtourne(id: string) {
    const e = d.ecritures.find((x) => x.id === id);
    if (!e) return;
    const ok = confirm(
      `Extourner la pièce ${e.piece} « ${e.libelle} » ?\n\nUne écriture inverse sera ajoutée au journal. L'écriture d'origine reste visible.`,
    );
    if (!ok) return;
    const r = extourner(d, id, e.date);
    if (!r.ok) return alert(r.erreurs.join('\n'));
    etat.majDossier(r.valeur);
    evaluer(r.valeur, e.piece, false);
  }

  async function modifier(e: Ecriture) {
    editionId = e.id;
    date = dt(e.date);
    piece = e.piece;
    libelle = e.libelle;
    lignes = e.lignes.map((l) => ({ cle: ++compteur, debit: l.debit, credit: l.credit, montant: l.montant }));
    erreurs = [];
    await tick();
    document.querySelector('.saisie')?.scrollIntoView({ block: 'nearest' });
    document.getElementById('saisie-libelle')?.focus();
  }

  const derniereParPiece = $derived.by(() => {
    const r = new Map<string, string>();
    for (const e of ecrituresTriees) if (!e.extourneDe && !estExtournee(d, e.id)) r.set(cle(e.piece), e.id);
    return r;
  });

  const nomCompte = (n: string | null) => (n ? `${intitules.get(n) ?? ''} (${n})` : '');

  const ecrituresTriees = $derived(
    d.ecritures.map((e, i) => ({ e, i })).sort((a, b) => (a.e.date < b.e.date ? -1 : a.e.date > b.e.date ? 1 : a.i - b.i)).map((x) => x.e),
  );

  function ecartTexte(x: Centimes) {
    return x > 0 ? `il manque ${m(x)} au crédit` : `il manque ${m(-x)} au débit`;
  }
</script>

<div class="titre">
  <h1>Journal</h1>
  <span class="sous">
    {d.ecritures.length} écriture{d.ecritures.length > 1 ? 's' : ''} validée{d.ecritures.length > 1 ? 's' : ''}
    {#if operations.length}· {saisies.size} opération{saisies.size > 1 ? 's' : ''} sur {operations.length} saisie{saisies.size > 1 ? 's' : ''}{/if}
  </span>
</div>

<div class="mise-en-page">
  <div class="colonne-principale">
    <section class="carte saisie" aria-label="Nouvelle écriture" data-visite="saisie">
      <h2>{editionId ? `Modification de la pièce ${piece}` : 'Nouvelle écriture'}</h2>
      {#if operationCourante}
        <div class="operation-courante">
          <b>{operationCourante.piece ? 'Pièce' : 'Opération'} {operationCourante.numero}.</b> {operationCourante.texte}
          {#if operationCourante.piece}
            <button class="btn-lien bascule-piece" onclick={() => (voirPiece = !voirPiece)}>
              {voirPiece ? 'Masquer la pièce' : 'Afficher la pièce'}
            </button>
          {/if}
        </div>
        {#if operationCourante.piece && voirPiece}
          <div class="zone-piece"><PieceVue piece={operationCourante.piece} /></div>
        {/if}
      {/if}
      <table>
        <thead>
          <tr>
            <th style="width:104px">Date</th>
            <th style="width:56px">Pièce</th>
            <th>Libellé</th>
            <th style="width:210px">Compte au débit</th>
            <th style="width:210px">Compte au crédit</th>
            <th style="width:118px" class="montant">Montant CHF</th>
            <th style="width:30px"><span class="sr-only">Retirer</span></th>
          </tr>
        </thead>
        <!-- Les touches proviennent des champs de saisie et remontent jusqu'ici (délégation). -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <tbody bind:this={grille} onkeydown={touche}>
          {#each lignes as l, i (l.cle)}
            <tr data-ligne={i}>
              {#if i === 0}
                <td><input id="saisie-date" class="champ num" aria-label="Date" placeholder="JJ.MM.AAAA" data-champ bind:value={date} /></td>
                <td><input id="saisie-piece" class="champ num" aria-label="Pièce" data-champ bind:value={piece} /></td>
                <td><input id="saisie-libelle" class="champ" aria-label="Libellé" data-champ bind:value={libelle} /></td>
              {:else}
                <td></td><td></td><td></td>
              {/if}
              <td><ChampCompte id={`debit-${l.cle}`} libelle={`Compte au débit, ligne ${i + 1}`} {comptes} bind:valeur={l.debit} /></td>
              <td><ChampCompte id={`credit-${l.cle}`} libelle={`Compte au crédit, ligne ${i + 1}`} {comptes} bind:valeur={l.credit} aligne="droite" /></td>
              <td><ChampMontant id={`montant-${l.cle}`} libelle={`Montant, ligne ${i + 1}`} bind:valeur={l.montant} /></td>
              <td>
                {#if lignes.length > 1}
                  <button class="retirer" title="Retirer la ligne" aria-label={`Retirer la ligne ${i + 1}`} onclick={() => retirerLigne(i)}>×</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="equilibre" data-visite="equilibre">
        <div class="totaux">
          <span>Total débit<br /><b class="num">{m(totalDebit)}</b></span>
          <span>Total crédit<br /><b class="num">{m(totalCredit)}</b></span>
        </div>
        <div class="etat-equilibre" aria-live="polite">
          {#if utiles.length && ecart !== 0}
            <div class="ecart">Écriture non équilibrée : {ecartTexte(ecart)}.</div>
          {:else if equilibree}
            <span class="ok">Écriture équilibrée</span>
          {/if}
        </div>
        <div class="boutons">
          <button class="btn" onclick={reinitialiser}>Annuler</button>
          <button class="btn btn-principal" disabled={!equilibree} onclick={valider}>{editionId ? 'Enregistrer la modification' : "Valider l'écriture"}</button>
        </div>
      </div>
      {#if erreurs.length}
        <div class="alerte erreurs" role="alert">
          <b>L'écriture n'a pas été validée :</b>
          <ul>{#each erreurs as e}<li>{e}</li>{/each}</ul>
        </div>
      {/if}
      <div class="aide-clavier">
        <kbd>Tab</kbd> champ suivant · <kbd>Entrée</kbd> ligne suivante, puis validation quand l'écriture est équilibrée ·
        <kbd>Échap</kbd> retire la ligne · compte : cliquez dans le champ ou tapez une partie du nom du compte
      </div>
    </section>

    <section class="carte" style="margin-top:20px" aria-label="Écritures validées">
      <h2>Écritures validées</h2>
      {#if d.ecritures.length === 0}
        <p class="vide">
          Aucune écriture pour l'instant.
          {#if operations[0]}Commencez par saisir l'opération {operations[0].numero}.{/if}
        </p>
      {:else}
        <table class="journal">
          <thead>
            <tr>
              <th style="width:90px">Date</th>
              <th style="width:52px">Pièce</th>
              <th>Libellé</th>
              <th style="width:170px">Débit</th>
              <th style="width:170px">Crédit</th>
              <th class="montant" style="width:96px">Montant</th>
              {#if retour}<th style="width:86px">Correction</th>{/if}
              <th style={`width:${modifAutorisee ? 140 : 84}px`}><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each ecrituresTriees as e, k (e.id)}
              {@const extournee = estExtournee(d, e.id)}
              {#each e.lignes as l, j}
                <tr class:zebre={k % 2 === 1} class:annulee={extournee || !!e.extourneDe}>
                  {#if j === 0}
                    <td class="num">{dt(e.date)}</td>
                    <td class="num">{e.piece}</td>
                    <td>
                      <span class:barre={extournee}>{e.libelle}</span>
                      {#if extournee}<span class="mention">extournée</span>{/if}
                    </td>
                  {:else}
                    <td></td><td></td><td></td>
                  {/if}
                  <td>{#if l.debit}{intitules.get(l.debit)}<span class="int num">{l.debit}</span>{/if}</td>
                  <td>{#if l.credit}{intitules.get(l.credit)}<span class="int num">{l.credit}</span>{/if}</td>
                  <td class="montant">{m(l.montant)}</td>
                  {#if retour}
                    <td>
                      {#if j === 0 && !extournee && !e.extourneDe}
                        <span class={`statut ${classeStatut(statut(cle(e.piece)))}`}>{libelleStatut(statut(cle(e.piece)))}</span>
                      {/if}
                    </td>
                  {/if}
                  <td class="actions">
                    {#if j === 0 && !extournee && !e.extourneDe}
                      {#if modifAutorisee}<button class="btn-lien" onclick={() => modifier(e)}>Modifier</button>{/if}
                      <button class="btn-lien" onclick={() => demanderExtourne(e.id)}>Extourner</button>
                    {/if}
                  </td>
                </tr>
              {/each}
              {@const kc = cle(e.piece)}
              {@const st = statut(kc)}
              {#if retour && derniereParPiece.get(kc) === e.id && st && st !== 'juste' && st !== 'manquante'}
                {@const s = suivi[kc]}
                {@const solution = s?.solutionVue ? solutionDe(kc) : null}
                <tr class="ligne-retour" class:zebre={k % 2 === 1}>
                  <td></td><td></td>
                  <td colspan="6">
                    {#if st === 'incomplete'}
                      <div class="retour neutre">{INDICES.incomplete}</div>
                    {:else}
                      <div class="retour">
                        <b>Indice :</b> {INDICES[st]}
                        {kc === PIECE_BOUCLEMENT ? '(Écritures de bouclement prises ensemble.) ' : ''}
                        {modifAutorisee
                          ? "Corrigez par une extourne ou modifiez l'écriture."
                          : "Corrigez par une extourne, puis saisissez à nouveau l'opération."}
                        {#if solutionDisponible(s) && !s?.solutionVue}
                          <button class="btn-lien solution" onclick={() => voirSolution(kc)}>Voir la solution</button>
                        {/if}
                        {#each [chapitreDe(kc)].filter((x) => x !== null) as ch (ch.id)}
                          <button class="btn-lien solution" onclick={() => revoirTheorie(ch.id)}>Revoir la théorie : {ch.titre}</button>
                        {/each}
                      </div>
                      {#if solution}
                        <div class="solution-detail">
                          <b>{kc === PIECE_BOUCLEMENT ? 'Écritures de bouclement attendues, d\'après vos comptes :' : `Solution de l'opération ${kc} :`}</b>
                          <table>
                            <tbody>
                              {#each solution.lignes as l}
                                <tr>
                                  <td>{l.debit ? 'Débit ' + nomCompte(l.debit) : ''}</td>
                                  <td>{l.credit ? 'Crédit ' + nomCompte(l.credit) : ''}</td>
                                  <td class="montant">{m(l.montant)}</td>
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      {/if}
                    {/if}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {/if}
    </section>
  </div>

  <aside class="carte enonce" aria-label="Énoncé" data-visite="enonce">
    <h2>Énoncé · opérations</h2>
    {#if operations.length === 0}
      <p class="vide">Aucune opération dans l'énoncé pour cet exercice.</p>
    {:else}
      <ol>
        {#each operations as o}
          <li class:courante={o.numero === piece.trim()}>
            <button onclick={() => choisirOperation(o.numero)}>
              <span class="no">{o.numero}</span>
              <span class="texte">{o.texte}</span>
              {#if retour && statut(o.numero) && statut(o.numero) !== 'manquante'}
                <span class={`etat statut ${classeStatut(statut(o.numero))}`}>{libelleStatut(statut(o.numero))}</span>
              {:else if saisies.has(o.numero)}<span class="etat">Saisie</span>{/if}
            </button>
          </li>
        {/each}
        {#if retour && avecBouclement}
          <li class="bouclement">
            <span class="no"></span>
            <span class="texte">Écritures de bouclement</span>
            {#if statut(PIECE_BOUCLEMENT) && statut(PIECE_BOUCLEMENT) !== 'manquante'}
              <span class={`etat statut ${classeStatut(statut(PIECE_BOUCLEMENT))}`}>{libelleStatut(statut(PIECE_BOUCLEMENT))}</span>
            {/if}
          </li>
        {/if}
      </ol>
    {/if}
  </aside>
</div>

<style>
  .mise-en-page { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 16px; align-items: start; }
  .colonne-principale { min-width: 0; }
  .saisie table th { background: var(--c-fond-2); color: var(--c-structure); border-bottom: 2px solid var(--c-structure); }
  .saisie td { padding: 4px 6px; border-bottom: none; }
  .operation-courante { padding: 8px 14px; background: var(--c-selection); border-bottom: 1px solid var(--c-bordure-2); }
  .bascule-piece { margin-left: 10px; font-size: 13px; }
  .zone-piece { padding: 12px 14px; background: var(--c-fond-2); border-bottom: 1px solid var(--c-bordure-2); max-height: 420px; overflow-y: auto; }
  .retirer {
    border: none; background: none; color: var(--c-texte-2); font-size: 18px; line-height: 1; cursor: pointer; padding: 6px 4px;
  }
  .retirer:hover { color: var(--c-negatif); }
  .equilibre {
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    padding: 10px 14px; border-top: 1px solid var(--c-bordure-2);
  }
  .totaux { display: flex; gap: 24px; color: var(--c-texte-2); }
  .totaux b { color: var(--c-texte); }
  .etat-equilibre { flex: 1; }
  .ecart { border-left: 4px solid var(--c-accent); padding: 4px 10px; color: var(--c-alerte-texte); font-weight: bold; background: var(--c-alerte-fond); }
  .boutons { display: flex; gap: 8px; flex: none; }
  .erreurs { margin: 0 14px 10px; }
  .aide-clavier { font-size: 12px; color: var(--c-texte-2); padding: 0 14px 10px; }

  .journal { font-size: 13px; table-layout: fixed; }
  .journal td { padding: 5px 8px; overflow: hidden; }
  .journal th { padding: 7px 8px; }
  .int { display: block; color: var(--c-texte-2); font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .actions { text-align: right; white-space: nowrap; }
  tr.annulee td { color: #7a8591; }
  .barre { text-decoration: line-through; }
  .statut { font-size: 12px; font-weight: bold; white-space: nowrap; }
  .statut.juste { color: var(--c-ok); }
  .statut.revoir { color: var(--c-alerte-texte); }
  .statut.neutre { color: var(--c-texte-2); }
  tr.ligne-retour td { padding-top: 0; }
  .retour { padding: 6px 10px; background: var(--c-alerte-fond); border-left: 4px solid var(--c-accent); font-size: 13px; }
  .retour.neutre { background: var(--c-fond-2); border-left-color: var(--c-bordure); color: var(--c-texte-2); }
  .solution { margin-left: 8px; font-weight: bold; }
  .solution-detail { margin-top: 6px; padding: 6px 10px; border-left: 4px solid var(--c-structure); background: var(--c-selection); font-size: 13px; }
  .solution-detail table { margin-top: 4px; width: auto; }
  .solution-detail td { border: none; padding: 2px 14px 2px 0; background: none !important; }
  .mention { font-size: 12px; color: var(--c-texte-2); font-style: italic; margin-left: 4px; }

  .enonce ol { margin: 0; padding: 0; list-style: none; max-height: calc(100vh - 170px); overflow-y: auto; }
  .enonce li { border-bottom: 1px solid var(--c-bordure-2); }
  .enonce li button {
    display: grid; grid-template-columns: 26px 1fr; gap: 2px 4px; width: 100%; text-align: left;
    font: inherit; color: inherit; background: none; border: none; padding: 9px 14px; cursor: pointer;
  }
  .enonce li button:hover { background: var(--c-zebra); }
  .enonce li.courante button { background: var(--c-selection); }
  .no { font-weight: bold; color: var(--c-structure); }
  .enonce li.bouclement { display: grid; grid-template-columns: 26px 1fr; gap: 2px 4px; padding: 9px 14px; font-style: italic; }
  .etat { grid-column: 2; font-size: 12px; color: var(--c-texte-2); }

  @media (max-width: 1440px) {
    .mise-en-page { grid-template-columns: 1fr; }
    .enonce ol { max-height: none; }
  }
</style>
