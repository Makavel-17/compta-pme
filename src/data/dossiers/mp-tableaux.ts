// Dossier MP niveau 5 : compte de résultat à plusieurs degrés, tableau des flux de trésorerie, seuil de rentabilité,
// avec un immeuble locatif hors exploitation (8000/8100). Entreprise fictive.
import { avisBancaire, noteInterne } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S } from './outils';

const rm = { nom: 'Rhône Mobilité SA', adresse: ['Route des Acacias 45', '1227 Les Acacias'] };
const compte = 'CH63 0000 4471 8842 1907 3';
const avis = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[], mentions?: string[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: rm, compte, date, operations, mentions });
const note = (date: string, numero: string, titre: string, texte: string[], lignes?: { designation: string; montant: number }[]) =>
  noteInterne({ emetteur: rm, date, numero, titre, texte, lignes, mentions: ['Service comptable'] });

const p1 = noteInterne({
  emetteur: rm, date: '2026-04-15', titre: "EXTRAIT DU PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE", numero: 'AG-2026',
  texte: [
    "L'exercice 2025 n'a dégagé ni bénéfice ni perte. L'assemblée générale décide de verser aux actionnaires un dividende " +
      "de 10 % du capital-actions de 300'000.00, prélevé sur le bénéfice reporté des exercices précédents.",
  ],
  mentions: ['Pour extrait conforme : la présidente du conseil d’administration'],
});
const p2 = avis('debit', '2026-04-30', [{ designation: 'Versement aux actionnaires du dividende, net d’impôt anticipé (65 %)', montant: f(19500) }],
  ["L'impôt anticipé de 35 % est retenu et doit être versé à l'Administration fédérale des contributions."]);
const p3 = avis('debit', '2026-05-28', [{ designation: 'Administration fédérale des contributions — impôt anticipé sur le dividende', montant: f(10500) }]);
const p4 = note('2026-11-30', 'R-01', 'RÉCAPITULATIF DES VENTES À CRÉDIT', [
  "Total des factures de vente de vélos électriques et d'accessoires de janvier à novembre 2026, à comptabiliser en une seule écriture.",
], [{ designation: 'Ventes de marchandises, janvier à novembre', montant: f(1200000) }]);
const p5 = avis('credit', '2026-12-15', [{ designation: 'Récapitulatif des paiements de clients reçus en 2026', montant: f(1170000) }]);
const p6 = note('2026-11-30', 'R-02', 'RÉCAPITULATIF DES ACHATS À CRÉDIT', [
  "Total des factures d'achat de vélos et de pièces de janvier à novembre 2026, à comptabiliser en une seule écriture.",
], [{ designation: 'Achats de marchandises, janvier à novembre', montant: f(720000) }]);
const p7 = avis('debit', '2026-12-15', [{ designation: 'Récapitulatif des paiements aux fournisseurs en 2026', montant: f(700000) }]);
const p8 = avis('debit', '2026-12-20', [
  { designation: 'Salaires nets et retenues versés aux assurances', montant: f(215000) },
  { designation: "Charges sociales de l'employeur", montant: f(35000) },
  { designation: 'Loyer du magasin, janvier à décembre', montant: f(48000) },
  { designation: 'Assurances choses et responsabilité civile', montant: f(12000) },
  { designation: 'Publicité', montant: f(30000) },
]);
const p9 = avis('debit', '2026-06-10', [{ designation: "Cycles Atelier SA — machine d'assemblage et de réglage, livrée et installée", montant: f(40000) }]);
const p10 = avis('credit', '2026-12-20', [{ designation: "Loyers de l'immeuble locatif du chemin des Vignes 3, janvier à décembre", montant: f(54000) }],
  ["L'immeuble est entièrement loué à des tiers ; il ne sert pas à l'activité de la société."]);
const p11 = avis('debit', '2026-12-20', [
  { designation: "Immeuble locatif — entretien, chauffage, assurance et impôt foncier de l'année", montant: f(14000) },
  { designation: "Annuité hypothécaire — intérêt 2 % sur 500'000.00", montant: f(10000) },
  { designation: 'Annuité hypothécaire — remboursement', montant: f(20000) },
]);
const p12 = note('2026-12-31', 'NI-12', 'ÉCRITURES DE CLÔTURE', [
  "1. L'inventaire évalue le stock de marchandises à 130'000.00 au 31.12.2026. Ajuster le compte de stock.",
  "2. Amortir les machines de 10 % de leur valeur d'acquisition au 31.12 (190'000.00) et l'immeuble locatif de 1 % de sa valeur d'acquisition (800'000.00), méthode indirecte.",
  "3. Constituer une provision de 12'000.00 pour les impôts sur le bénéfice et le capital de 2026.",
]);

export const dossierRhoneMobilite = construireDossier(
  {
    id: 'dossier-mp5-rhone-mobilite-tableaux',
    titre: 'Rhône Mobilité SA — dossier de pièces, résultat par degrés, flux de trésorerie et seuil de rentabilité',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 5,
    sujets: ['Compte de résultat à plusieurs degrés', 'Tableau des flux de trésorerie', 'Seuil de rentabilité', 'Immeuble locatif hors exploitation'],
    raisonSociale: 'Rhône Mobilité SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour ce dossier, la TVA est laissée de côté. L'immeuble locatif est hors exploitation. Après avoir comptabilisé les " +
      "pièces, remplissez les fiches « Résultat par degrés », « Flux de trésorerie » et « Seuil de rentabilité » " +
      '(barre latérale, États financiers) ; le logiciel vérifie vos calculs.',
    situation:
      "Rhône Mobilité SA vend des vélos électriques et des accessoires dans son magasin des Acacias. Elle possède aussi un " +
      "petit immeuble locatif, acheté il y a dix ans comme placement.\n\n" +
      "Le conseil d'administration prépare le lancement d'un vélo cargo et veut comprendre ses chiffres : d'où vient le " +
      "bénéfice, pourquoi la banque contient plus d'argent qu'en début d'année, et combien de vélos cargo il faudra vendre " +
      "pour couvrir les charges fixes de la nouvelle ligne.\n\n" +
      "Votre mission : comptabiliser les pièces de l'année et les écritures de clôture, puis établir le compte de résultat " +
      'à plusieurs degrés, le tableau des flux de trésorerie et le seuil de rentabilité du vélo cargo.',
    ouvertureActif: { '1020': f(60000), '1100': f(90000), '1200': f(120000), '1500': f(150000), '1600': f(800000) },
    ouverturePassif: { '1109': f(4500), '1509': f(50000), '1609': f(80000), '2000': f(70000), '2401': f(500000), '2800': f(300000), '2950': f(30000), '2970': f(185500) },
    parametres: {
      seuil: { unite: 'vélo cargo', prixVente: f(3200), coutVariable: f(2000), chargesFixes: f(360000), quantite: 450 },
    },
  },
  [
    { date: '2026-04-15', piece: p1.piece, lignes: S('2970', '2230', f(30000)) },
    { date: '2026-04-30', piece: p2.piece, lignes: [D('2230', f(30000)), C('1020', f(19500)), C('2205', f(10500))] },
    { date: '2026-05-28', piece: p3.piece, lignes: S('2205', '1020', f(10500)) },
    { date: '2026-06-10', piece: p9.piece, lignes: S('1500', '1020', f(40000)) },
    { date: '2026-11-30', piece: p4.piece, lignes: S('1100', '3200', f(1200000)) },
    { date: '2026-11-30', piece: p6.piece, lignes: S('4200', '2000', f(720000)) },
    { date: '2026-12-15', piece: p5.piece, lignes: S('1020', '1100', f(1170000)) },
    { date: '2026-12-15', piece: p7.piece, lignes: S('2000', '1020', f(700000)) },
    { date: '2026-12-20', piece: p8.piece, lignes: [D('5200', f(215000)), D('5270', f(35000)), D('6000', f(48000)), D('6300', f(12000)), D('6600', f(30000)), C('1020', f(340000))] },
    { date: '2026-12-20', piece: p10.piece, lignes: S('1020', '8100', f(54000)) },
    { date: '2026-12-20', piece: p11.piece, lignes: [D('8000', f(24000)), D('2401', f(20000)), C('1020', f(44000))] },
    {
      date: '2026-12-31',
      piece: p12.piece,
      lignes: [D('1200', f(10000)), C('4280', f(10000)), D('6800', f(19000)), C('1509', f(19000)), D('8000', f(8000)), C('1609', f(8000)), D('8900', f(12000)), C('2640', f(12000))],
    },
  ],
);
