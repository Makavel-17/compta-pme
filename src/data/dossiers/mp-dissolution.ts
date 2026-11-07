// Dossier MP niveau 3 : dissolution des réserves latentes. Entreprise fictive.
// Règle (validée le 07.11.2026) : la dissolution crédite le compte de charge d'origine (ducroire 1109/3805, reprise
// d'amortissement 1509/6800, provision 2600/6100, stock porté à sa valeur réelle 1200/4280).
import { avisBancaire, noteInterne } from '../../engine/pieces';
import { formatMontant as m } from '../../engine/money';
import { BANQUE, construireDossier, C, D, f, S, type TableauComplement } from './outils';

const cl = { nom: 'Cartonnages du Léman SA', adresse: ['Chemin du Château-Bloch 18', '1219 Le Lignon'] };
const compte = 'CH72 0000 4471 2058 6634 9';
const avis = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: cl, compte, date, operations });
const note = (date: string, numero: string, titre: string, texte: string[], lignes?: { designation: string; montant: number }[]) =>
  noteInterne({ emetteur: cl, date, numero, titre, texte, lignes, mentions: ["Pour le conseil d'administration : Mme N. Perrin, présidente"] });

// Valeurs au 01.01 (comptables et réelles)
const ducroireOuv = f(15000);
const risqueOuv = f(5000);
const stockOuv = f(60000);
const stockReelOuv = f(90000);
const machinesVA = f(300000);
const facOuv = f(200000);
const machinesReellesOuv = f(140000);
const provisionOuv = f(25000);
const risqueProvision = f(5000);

// Année et clôture
const ventes = f(700000);
const encaissements = f(690000);
const creancesFin = f(100000) + ventes - encaissements;
const risqueFin = Math.round(creancesFin * 5 / 100);
const stockReelFin = f(95000);
const amortNormal = Math.round(machinesVA * 10 / 100);
const machinesReellesFin = machinesReellesOuv - amortNormal;
const repriseAmort = machinesReellesFin - (machinesVA - facOuv - amortNormal);

const p1 = note('2026-11-30', 'R-01', 'RÉCAPITULATIF DES VENTES À CRÉDIT', ['Total des factures de vente de 2026, à comptabiliser en une seule écriture.'],
  [{ designation: 'Ventes de cartons et d’emballages, janvier à novembre', montant: ventes }]);
const p2 = avis('credit', '2026-12-15', [{ designation: 'Récapitulatif des paiements de clients reçus en 2026', montant: encaissements }]);
const p3 = note('2026-11-30', 'R-02', 'RÉCAPITULATIF DES ACHATS À CRÉDIT', ['Total des factures de carton brut et de fournitures de 2026, à comptabiliser en une seule écriture.'],
  [{ designation: 'Achats de marchandises, janvier à novembre', montant: f(380000) }]);
const p4 = avis('debit', '2026-12-15', [{ designation: 'Récapitulatif des paiements aux fournisseurs en 2026', montant: f(375000) }]);
const p5 = avis('debit', '2026-12-20', [
  { designation: 'Salaires nets et retenues versés aux assurances', montant: f(180000) },
  { designation: "Charges sociales de l'employeur", montant: f(30000) },
]);
const p6 = avis('debit', '2026-12-20', [
  { designation: "Loyer de l'atelier, janvier à décembre", montant: f(36000) },
  { designation: 'Assurances', montant: f(9000) },
  { designation: 'Publicité et salon de l’emballage', montant: f(15000) },
]);
const p7 = note('2026-12-31', 'CA-1', 'DUCROIRE', [
  `Les créances clients s'élèvent à ${m(creancesFin)} au 31.12.2026 ; le risque réel de perte est de 5 %.`,
  "Le nouveau conseil d'administration veut des comptes qui montrent la situation réelle : ramener le ducroire au risque réel.",
]);
const p8 = note('2026-12-31', 'CA-2', 'STOCK DE MARCHANDISES', [
  `L'inventaire au prix de revient d'achat s'élève à ${m(stockReelFin)}. Porter le stock au bilan à cette valeur, sans sous-évaluation.`,
]);
const p9 = note('2026-12-31', 'CA-3', 'AMORTISSEMENT DES MACHINES', [
  `Amortir les machines de 10 % de leur valeur d'acquisition (${m(machinesVA)}), ce qui correspond à leur perte de valeur réelle de l'année. Méthode indirecte.`,
]);
const p10 = note('2026-12-31', 'CA-4', 'VALEUR RÉELLE DES MACHINES', [
  `Après l'amortissement de l'année, les machines valent en réalité ${m(machinesReellesFin)} selon l'expertise de décembre.`,
  "Les amortissements des années passées ont été excessifs : ramener la valeur comptable des machines à leur valeur réelle.",
]);
const p11 = note('2026-12-31', 'CA-5', 'PROVISION POUR RÉPARATIONS', [
  `La révision de la presse prévue pour 2027 coûtera ${m(risqueProvision)} selon le devis reçu. Ramener la provision pour réparations à ce montant.`,
]);

export const dossierCartonnages = construireDossier(
  {
    id: 'dossier-mp3-cartonnages-du-leman-dissolution',
    titre: 'Cartonnages du Léman SA — dossier de pièces, dissolution des réserves latentes',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 3,
    sujets: ['Dissolution des réserves latentes', 'Reprise d’amortissement', 'Bénéfice réel et bénéfice publié'],
    raisonSociale: 'Cartonnages du Léman SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "La TVA est laissée de côté. Au 01.01.2026, la société avait des réserves latentes : le ducroire de " +
      `${m(ducroireOuv)} couvrait un risque réel de ${m(risqueOuv)} ; le stock de ${m(stockOuv)} valait ${m(stockReelOuv)} ; ` +
      `les machines, d'une valeur comptable de ${m(machinesVA - facOuv)}, valaient ${m(machinesReellesOuv)} ; la provision ` +
      `pour réparations de ${m(provisionOuv)} couvrait un risque de ${m(risqueProvision)}. Pour dissoudre une réserve latente, ` +
      "on crédite le compte de charge d'origine. Après les pièces, établissez le tableau des réserves latentes et calculez " +
      'le bénéfice réel.',
    situation:
      "Cartonnages du Léman SA fabrique des cartons et des emballages au Lignon. L'ancien conseil d'administration avait " +
      "constitué de nombreuses réserves cachées pour lisser les résultats.\n\n" +
      "Le nouveau conseil veut présenter des comptes qui reflètent la réalité avant de chercher de nouveaux actionnaires. " +
      "Il décide de dissoudre toutes les réserves latentes au 31 décembre 2026. Le bénéfice publié va fortement augmenter : " +
      "les futurs actionnaires doivent comprendre qu'il ne vient pas seulement de l'activité de l'année.\n\n" +
      "Votre mission : comptabiliser les pièces de l'année et les décisions de clôture, puis expliquer l'écart entre le " +
      'bénéfice publié et le bénéfice réel.',
    ouvertureActif: { '1020': f(80000), '1100': f(100000), '1200': stockOuv, '1500': machinesVA },
    ouverturePassif: { '1109': ducroireOuv, '1509': facOuv, '2000': f(40000), '2600': provisionOuv, '2800': f(200000), '2950': f(40000), '2970': f(20000) },
  },
  [
    { date: '2026-11-30', piece: p1.piece, lignes: S('1100', '3200', ventes) },
    { date: '2026-11-30', piece: p3.piece, lignes: S('4200', '2000', f(380000)) },
    { date: '2026-12-15', piece: p2.piece, lignes: S('1020', '1100', encaissements) },
    { date: '2026-12-15', piece: p4.piece, lignes: S('2000', '1020', f(375000)) },
    { date: '2026-12-20', piece: p5.piece, lignes: [D('5200', f(180000)), D('5270', f(30000)), C('1020', f(210000))] },
    { date: '2026-12-20', piece: p6.piece, lignes: [D('6000', f(36000)), D('6300', f(9000)), D('6600', f(15000)), C('1020', f(60000))] },
    { date: '2026-12-31', piece: p7.piece, lignes: S('1109', '3805', ducroireOuv - risqueFin) },
    { date: '2026-12-31', piece: p8.piece, lignes: S('1200', '4280', stockReelFin - stockOuv) },
    { date: '2026-12-31', piece: p9.piece, lignes: S('6800', '1509', amortNormal) },
    { date: '2026-12-31', piece: p10.piece, lignes: S('1509', '6800', repriseAmort) },
    { date: '2026-12-31', piece: p11.piece, lignes: S('2600', '6100', provisionOuv - risqueProvision) },
  ],
);

const rl = [
  { poste: 'Ducroire', ouv: ducroireOuv - risqueOuv },
  { poste: 'Stock de marchandises', ouv: stockReelOuv - stockOuv },
  { poste: 'Machines', ouv: machinesReellesOuv - (machinesVA - facOuv) },
  { poste: 'Provision pour réparations', ouv: provisionOuv - risqueProvision },
];
const totalOuv = rl.reduce((s, x) => s + x.ouv, 0);
const beneficeComptable =
  ventes + (ducroireOuv - risqueFin) - (f(380000) - (stockReelFin - stockOuv)) - f(210000) - f(60000) - (amortNormal - repriseAmort) +
  (provisionOuv - risqueProvision);
const fondsPropres = f(200000) + f(40000) + f(20000) + beneficeComptable;

export const complementCartonnages: TableauComplement[] = [
  {
    titre: 'Tableau des réserves latentes',
    entetes: ['Poste', 'Au 01.01', 'Au 31.12', 'Variation'],
    lignes: [...rl.map((x) => [x.poste, m(x.ouv), m(0), m(-x.ouv)]), ['Total', m(totalOuv), m(0), m(-totalOuv)]],
  },
  {
    titre: 'Bénéfice réel et fonds propres réels',
    entetes: ['Élément', 'Montant CHF'],
    lignes: [
      ['Bénéfice comptable (publié)', m(beneficeComptable)],
      ['+ Variation des réserves latentes (dissolution)', m(-totalOuv)],
      ['= Bénéfice réel', m(beneficeComptable - totalOuv)],
      ['Fonds propres comptables au 31.12 (bénéfice compris)', m(fondsPropres)],
      ['+ Réserves latentes au 31.12', m(0)],
      ['= Fonds propres réels', m(fondsPropres)],
    ],
  },
];
