<!-- Seuil de rentabilité : données de l'énoncé, calculs de l'élève vérifiés en entraînement. -->
<script lang="ts">
  import { etat } from '../etat.svelte';
  import { seuil } from '../../engine/tableaux';
  import { formatMontant as m } from '../../engine/money';
  import FicheCalcul, { type SectionCalcul } from '../composants/FicheCalcul.svelte';

  const donnees = $derived(etat.exercice.parametres.seuil!);
  const r = $derived(seuil(donnees));
  const entrainement = $derived(etat.exercice.mode === 'entrainement');
  const session = etat.session!;
  if (!session.fiches.seuil) session.fiches.seuil = {};
  const saisies = session.fiches.seuil;

  const sections = $derived<SectionCalcul[]>([
    {
      lignes: [
        { cle: 'mcu', libelle: `Marge contributive par ${donnees.unite}`, formule: 'prix de vente − coût variable', type: 'chf', attendu: r.margeContributiveUnitaire },
        { cle: 'taux', libelle: 'Taux de marge contributive', formule: 'marge contributive ÷ prix de vente × 100', type: 'pc', attendu: r.tauxMargeContributive },
        { cle: 'seuilQ', libelle: `Seuil de rentabilité en quantité (${donnees.unite}s)`, formule: 'charges fixes ÷ marge contributive unitaire', type: 'nombre', attendu: r.seuilQuantite, fort: true },
        { cle: 'seuilCA', libelle: "Seuil de rentabilité en chiffre d'affaires", formule: 'charges fixes ÷ taux de marge contributive', type: 'chf', attendu: r.seuilChiffreAffaires, fort: true },
        { cle: 'resultat', libelle: `Résultat pour ${donnees.quantite} ${donnees.unite}s`, formule: 'quantité × marge contributive − charges fixes', type: 'chf', attendu: r.resultatQuantite, fort: true },
      ],
    },
  ]);
</script>

<div class="titre">
  <h1>Seuil de rentabilité</h1>
  <span class="sous">Marge contributive et point mort</span>
</div>

<section class="carte donnees">
  <h2>Données</h2>
  <table>
    <tbody>
      <tr><td>Prix de vente par {donnees.unite}</td><td class="montant">{m(donnees.prixVente)}</td></tr>
      <tr class="zebre"><td>Coût variable par {donnees.unite}</td><td class="montant">{m(donnees.coutVariable)}</td></tr>
      <tr><td>Charges fixes de la période</td><td class="montant">{m(donnees.chargesFixes)}</td></tr>
      <tr class="zebre"><td>Quantité vendue prévue</td><td class="montant">{donnees.quantite}</td></tr>
    </tbody>
  </table>
</section>

<FicheCalcul {sections} {saisies} {entrainement} />

<style>
  .donnees { margin-bottom: 16px; max-width: 560px; }
  .donnees h2 { padding: 10px 14px; border-bottom: 1px solid var(--c-bordure-2); }
</style>
