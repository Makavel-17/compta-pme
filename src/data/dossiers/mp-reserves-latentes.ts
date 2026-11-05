// Dossier MP niveau 3 : réserves latentes. Entreprise fictive.
// Règles (F&C ch. 37) : réserve latente = valeur réelle − valeur comptable (actifs) ou valeur comptable − risque réel
// (provisions, ducroire) ; création par amortissement excessif, stock sous-évalué, provision surévaluée ;
// bénéfice réel = bénéfice comptable + variation des réserves latentes ; fonds propres réels = comptables + réserves latentes.
import { avisBancaire, noteInterne } from '../../engine/pieces';
import { formatMontant as m } from '../../engine/money';
import { BANQUE, construireDossier, C, D, f, S, type TableauComplement } from './outils';

const ateliers = { nom: 'Ateliers Genevois de Précision SA', adresse: ['Rue des Gazomètres 7', '1205 Genève'] };
const compte = 'CH39 0000 4471 6650 8812 7';
const avis = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: ateliers, compte, date, operations });
const note = (date: string, numero: string, titre: string, texte: string[]) =>
  noteInterne({ emetteur: ateliers, date, numero, titre, texte, mentions: ["Pour le conseil d'administration : M. Delaloye, président"] });

// Valeurs au 01.01 (comptables / réelles)
const creancesOuv = f(120000);
const ducroireOuv = f(12000);
const risqueReelOuv = f(6000);
const stockOuv = f(90000);
const stockReelOuv = f(120000);
const machinesVA = f(200000);
const fac0 = f(90000);
const machinesReellesOuv = f(130000);
const litiges = f(15000);
const risqueLitige = f(5000);

// Opérations
const ventes = f(900000);
const encaissements = f(880000);
const achats = f(560000);
const paiements = f(550000);
const stockReelFin = f(140000);
const stockComptableFin = Math.round(stockReelFin * 75 / 100); // sous-évalué de 25 %
const amortReel = Math.round(machinesVA * 10 / 100);
const amortComptable = Math.round(machinesVA * 25 / 100);
const machinesReellesFin = machinesReellesOuv - amortReel;
const creancesFin = creancesOuv + ventes - encaissements;
const risqueReelFin = Math.round(creancesFin * 5 / 100);
const ducroireFin = Math.round(creancesFin * 10 / 100);

const r1 = note('2026-11-30', 'R-01', 'RÉCAPITULATIF DES VENTES À CRÉDIT', [
  "Total des factures de vente de pièces usinées de janvier à novembre 2026 : 900'000.00, à comptabiliser en une seule écriture.",
]);
const r2 = avis('credit', '2026-12-15', [{ designation: 'Récapitulatif des paiements de clients reçus en 2026', montant: encaissements }]);
const r3 = note('2026-11-30', 'R-02', 'RÉCAPITULATIF DES ACHATS À CRÉDIT', [
  "Total des factures d'achat de barres d'acier, de laiton et de composants de janvier à novembre 2026 : 560'000.00, à comptabiliser en une seule écriture.",
]);
const r4 = avis('debit', '2026-12-15', [{ designation: 'Récapitulatif des paiements aux fournisseurs en 2026', montant: paiements }]);
const r5 = avis('debit', '2026-12-20', [{ designation: 'Salaires nets et retenues versés aux assurances, année 2026', montant: f(180000) }]);
const r6 = avis('debit', '2026-12-20', [{ designation: "Charges sociales de l'employeur, année 2026", montant: f(30000) }]);
const r7 = avis('debit', '2026-12-20', [
  { designation: "Loyer de l'atelier, janvier à décembre", montant: f(48000) },
  { designation: 'Assurances choses et responsabilité civile', montant: f(7000) },
  { designation: 'Publicité et salons professionnels', montant: f(15000) },
]);
const r8 = note('2026-12-31', 'CA-12a', 'ÉVALUATION DU STOCK', [
  `L'inventaire du 31.12.2026, au prix de revient d'achat, s'élève à ${m(stockReelFin)}.`,
  "Par prudence, le conseil d'administration décide de porter le stock au bilan avec une sous-évaluation de 25 %. Ajuster le compte de stock.",
]);
const r9 = note('2026-12-31', 'CA-12b', 'AMORTISSEMENT DES MACHINES', [
  `La perte de valeur réelle des machines en 2026 est estimée à 10 % de leur valeur d'acquisition de ${m(machinesVA)}.`,
  "Le conseil d'administration décide néanmoins de les amortir de 25 % de cette valeur (méthode indirecte).",
]);
const r10 = note('2026-12-31', 'CA-12c', 'DUCROIRE', [
  `Les créances clients s'élèvent à ${m(creancesFin)} au 31.12.2026. Le risque réel de perte est estimé à 5 % de ce montant.`,
  "Le conseil d'administration décide de fixer le ducroire à 10 % des créances. Ajuster le ducroire.",
]);

export const dossierAteliers = construireDossier(
  {
    id: 'dossier-mp3-ateliers-genevois-reserves-latentes',
    titre: 'Ateliers Genevois de Précision SA — dossier de pièces, réserves latentes',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 3,
    sujets: ['Création de réserves latentes', 'Tableau des réserves latentes', 'Bénéfice réel et fonds propres réels'],
    raisonSociale: 'Ateliers Genevois de Précision SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "La TVA est laissée de côté. Au 01.01.2026, la société avait déjà des réserves latentes : le ducroire de " +
      `${m(ducroireOuv)} couvrait un risque réel de ${m(risqueReelOuv)} ; le stock de ${m(stockOuv)} valait en réalité ` +
      `${m(stockReelOuv)} ; les machines, d'une valeur comptable de ${m(machinesVA - fac0)}, valaient ${m(machinesReellesOuv)} ; ` +
      `la provision pour litiges de ${m(litiges)} couvre un risque estimé à ${m(risqueLitige)}, inchangé en 2026. ` +
      "Comptabilisez les pièces, puis établissez le tableau des réserves latentes au 01.01 et au 31.12, et calculez le " +
      'bénéfice réel et les fonds propres réels.',
    situation:
      "Les Ateliers Genevois de Précision SA usinent des pièces en acier et en laiton pour l'horlogerie et l'industrie. " +
      "Leur conseil d'administration est réputé très prudent : il préfère montrer un bénéfice modeste et garder des " +
      "réserves pour les années difficiles.\n\n" +
      "Un investisseur envisage d'entrer au capital et demande à connaître la situation réelle de l'entreprise, au-delà " +
      'des comptes publiés.\n\n' +
      "Votre mission : comptabiliser les pièces de l'année et les décisions de clôture du conseil d'administration, puis " +
      'mesurer les réserves latentes, le bénéfice réel et les fonds propres réels.',
    ouvertureActif: { '1020': f(90000), '1100': creancesOuv, '1200': stockOuv, '1500': machinesVA },
    ouverturePassif: { '1109': ducroireOuv, '1509': fac0, '2000': f(50000), '2660': litiges, '2800': f(300000), '2950': f(25000), '2970': f(8000) },
  },
  [
    { date: '2026-11-30', piece: r1.piece, lignes: S('1100', '3200', ventes) },
    { date: '2026-11-30', piece: r3.piece, lignes: S('4200', '2000', achats) },
    { date: '2026-12-15', piece: r2.piece, lignes: S('1020', '1100', encaissements) },
    { date: '2026-12-15', piece: r4.piece, lignes: S('2000', '1020', paiements) },
    { date: '2026-12-20', piece: r5.piece, lignes: S('5200', '1020', r5.total) },
    { date: '2026-12-20', piece: r6.piece, lignes: S('5270', '1020', r6.total) },
    { date: '2026-12-20', piece: r7.piece, lignes: [D('6000', f(48000)), D('6300', f(7000)), D('6600', f(15000)), C('1020', r7.total)] },
    { date: '2026-12-31', piece: r8.piece, lignes: S('1200', '4280', stockComptableFin - stockOuv) },
    { date: '2026-12-31', piece: r9.piece, lignes: S('6800', '1509', amortComptable) },
    { date: '2026-12-31', piece: r10.piece, lignes: S('3805', '1109', ducroireFin - ducroireOuv) },
  ],
);

// Corrigé complémentaire : tableau des réserves latentes, bénéfice et fonds propres réels.
const rl = [
  { poste: 'Ducroire', ouv: ducroireOuv - risqueReelOuv, fin: ducroireFin - risqueReelFin },
  { poste: 'Stock de marchandises', ouv: stockReelOuv - stockOuv, fin: stockReelFin - stockComptableFin },
  { poste: 'Machines', ouv: machinesReellesOuv - (machinesVA - fac0), fin: machinesReellesFin - (machinesVA - fac0 - amortComptable) },
  { poste: 'Provision pour litiges', ouv: litiges - risqueLitige, fin: litiges - risqueLitige },
];
const totalOuv = rl.reduce((s, x) => s + x.ouv, 0);
const totalFin = rl.reduce((s, x) => s + x.fin, 0);
const variation = totalFin - totalOuv;
const beneficeComptable =
  ventes - (ducroireFin - ducroireOuv) - (achats - (stockComptableFin - stockOuv)) - f(210000) - f(70000) - amortComptable;
const fondsPropresComptables = f(300000) + f(25000) + f(8000) + beneficeComptable;
const signe = (x: number) => (x > 0 ? `+${m(x)}` : m(x));

export const complementAteliers: TableauComplement[] = [
  {
    titre: 'Tableau des réserves latentes',
    entetes: ['Poste', 'Au 01.01', 'Au 31.12', 'Variation'],
    lignes: [
      ...rl.map((x) => [x.poste, m(x.ouv), m(x.fin), signe(x.fin - x.ouv)]),
      ['Total', m(totalOuv), m(totalFin), signe(variation)],
    ],
  },
  {
    titre: 'Bénéfice réel et fonds propres réels',
    entetes: ['Élément', 'Montant CHF'],
    lignes: [
      ['Bénéfice comptable (publié)', m(beneficeComptable)],
      ['+ Variation des réserves latentes', signe(variation)],
      ['= Bénéfice réel', m(beneficeComptable + variation)],
      ['Fonds propres comptables au 31.12 (bénéfice compris)', m(fondsPropresComptables)],
      ['+ Réserves latentes au 31.12', m(totalFin)],
      ['= Fonds propres réels', m(fondsPropresComptables + totalFin)],
    ],
  },
];
