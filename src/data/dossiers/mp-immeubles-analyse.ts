// Dossiers MP : immeuble à usage mixte (niveau 4), analyse financière (niveau 5). Entreprises fictives.
// Règles immeubles (F&C ch. 55, validées le 05.11.2026) : 7500 Produits d'immeubles / 7510 Charges d'immeubles,
// loyers internes 6000/7500 et 2850/7500, plus-value d'investissement portée à 1600.
import { avisBancaire, facture, noteInterne } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S, type TableauComplement } from './outils';

// ─────────────────────────── Dossier MP 4 : Carrosserie du Salève (immeuble à usage mixte) ───────────────────────────
const carrosserie = { nom: 'Carrosserie du Salève', adresse: ['Route de Troinex 41', '1256 Troinex'] };
const compteCarrosserie = 'CH26 0000 4471 3065 9921 4';
const avisC = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[], mentions?: string[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: carrosserie, compte: compteCarrosserie, date, operations, mentions });
const noteC = (date: string, numero: string, titre: string, texte: string) =>
  noteInterne({ emetteur: carrosserie, date, numero, titre, texte: [texte], mentions: ['Signé : D. Rochat'] });

const detteInitiale = f(400000);
const remboursement = f(10000);
const interetAnnuite = Math.round(detteInitiale * 2 / 100); // 2 % du 01.07.2025 au 30.06.2026
const interetsCourusOuverture = Math.round(detteInitiale * 2 / 100 / 2); // 01.07–31.12.2025
const interetsCourusCloture = Math.round((detteInitiale - remboursement) * 2 / 100 / 2); // 01.07–31.12.2026
const valeurAcquisition = f(800000);

const i1 = noteC('2026-01-01', 'NI-01', 'EXTOURNE — INTÉRÊTS HYPOTHÉCAIRES COURUS',
  "Au 31.12.2025, les intérêts hypothécaires courus du 01.07 au 31.12.2025, 4'000.00, avaient été portés en passifs transitoires. Extourner cette écriture.");
const i2 = avisC('debit', '2026-06-30', [
  { designation: "Annuité hypothécaire — intérêt 2 % du 01.07.2025 au 30.06.2026 sur 400'000.00", montant: interetAnnuite },
  { designation: 'Annuité hypothécaire — remboursement (amortissement financier)', montant: remboursement },
], ["Dette hypothécaire après remboursement : 390'000.00."]);
const i3 = facture({
  emetteur: { nom: 'Couvertures Bussard Sàrl', adresse: ['Chemin des Ouches 4', '1256 Troinex'] }, destinataire: carrosserie,
  numero: 'CB-26-114', date: '2026-04-14',
  articles: [{ designation: 'Réparation de la toiture après la tempête de mars, tuiles et ferblanterie', prixUnitaire: f(6500) }],
  mentions: ['Payable à 30 jours.'],
});
const i4 = facture({
  emetteur: { nom: 'Combustibles du Léman SA', adresse: ['Route du Nant-d’Avril 120', '1214 Vernier'] }, destinataire: carrosserie,
  numero: 'CL-90311', date: '2026-10-20',
  articles: [{ designation: "Mazout de chauffage pour l'immeuble (litres)", quantite: 2000, prixUnitaire: f(1.2) }],
  mentions: ['Payable à 30 jours.'],
});
const i5 = avisC('debit', '2026-02-15', [{ designation: 'Assurance cantonale des bâtiments — prime 2026 de l’immeuble route de Troinex 41', montant: f(1150) }]);
const i6 = facture({
  emetteur: { nom: 'SolÉnergie Genève SA', adresse: ['Rue de Veyrier 18', '1227 Carouge'] }, destinataire: carrosserie,
  numero: 'SE-2026-58', date: '2026-08-31',
  articles: [{ designation: 'Installation photovoltaïque sur la toiture, raccordement compris (installation nouvelle)', prixUnitaire: f(24000) }],
  mentions: ['Payable à 60 jours.'],
});
const i7 = avisC('credit', '2026-12-20', [{ designation: 'Loyers du studio du 2e étage versés par Mme Ana Ferreira, janvier à décembre (12 × 1’200.00)', montant: f(14400) }]);
const i8 = noteC('2026-12-31', 'NI-12a', 'LOYER DE LA CARROSSERIE',
  "La carrosserie occupe l'atelier et le bureau du rez-de-chaussée de l'immeuble. Comptabiliser le loyer annuel de ces locaux, estimé à 30'000.00.");
const i9 = noteC('2026-12-31', 'NI-12b', 'LOGEMENT DU PROPRIÉTAIRE',
  "M. Rochat et sa famille occupent l'appartement du 1er étage. Comptabiliser la valeur locative annuelle de ce logement, 21'600.00.");
const i10 = noteC('2026-12-31', 'NI-12c', "AMORTISSEMENT DE L'IMMEUBLE",
  "Amortir l'immeuble de 1 % de sa valeur d'acquisition de 800'000.00 (méthode indirecte). L'installation photovoltaïque n'est pas amortie cette année.");
const i11 = noteC('2026-12-31', 'NI-12d', 'INTÉRÊTS HYPOTHÉCAIRES COURUS',
  "L'annuité payée le 30.06.2027 comprendra l'intérêt de 2 % sur la dette restante depuis le 01.07.2026. Comptabiliser la part qui concerne l'exercice 2026.");

export const dossierCarrosserie = construireDossier(
  {
    id: 'dossier-mp4-carrosserie-du-saleve-immeuble',
    titre: 'Carrosserie du Salève — dossier de pièces, immeuble à usage mixte',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 4,
    sujets: ["Charges et produits d'immeubles", 'Loyers internes (entreprise et propriétaire)', 'Annuité et intérêts hypothécaires courus', "Plus-value d'un immeuble"],
    raisonSociale: 'Carrosserie du Salève',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour ce dossier, la TVA est laissée de côté et seules les opérations liées à l'immeuble sont présentées. L'immeuble " +
      "abrite la carrosserie, le logement du propriétaire et un studio loué : ses charges et ses produits ont leurs propres " +
      "comptes (activité annexe). Les loyers internes se comptabilisent à la clôture, sans paiement.",
    situation:
      "Daniel Rochat exploite la Carrosserie du Salève à Troinex. Il est propriétaire du bâtiment : l'atelier occupe le " +
      "rez-de-chaussée, sa famille habite le premier étage et un studio est loué au deuxième.\n\n" +
      "Son fiduciaire lui a dit que l'immeuble « coûte cher ». M. Rochat veut le vérifier : combien rapporte-t-il vraiment " +
      "une fois comptés le loyer de l'atelier et la valeur de son propre logement ?\n\n" +
      "Votre mission : comptabiliser les pièces de l'immeuble pour 2026, puis les écritures de clôture (loyers internes, " +
      "amortissement, intérêts courus), et déterminer le résultat de l'immeuble (produits d'immeubles − charges d'immeubles).",
    ouvertureActif: { '1020': f(60000), '1100': f(18000), '1500': f(90000), '1600': valeurAcquisition },
    ouverturePassif: { '1509': f(30000), '1609': f(120000), '2000': f(9000), '2300': interetsCourusOuverture, '2401': detteInitiale, '2800': f(405000) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-01-01', piece: i1.piece, lignes: S('2300', '7510', interetsCourusOuverture) },
    { date: '2026-02-15', piece: i5.piece, lignes: S('7510', '1020', i5.total) },
    { date: '2026-04-14', piece: i3.piece, lignes: S('7510', '2000', i3.ttc) },
    { date: '2026-06-30', piece: i2.piece, lignes: [D('7510', interetAnnuite), D('2401', remboursement), C('1020', i2.total)] },
    { date: '2026-08-31', piece: i6.piece, lignes: S('1600', '2000', i6.ttc) },
    { date: '2026-10-20', piece: i4.piece, lignes: S('7510', '2000', i4.ttc) },
    { date: '2026-12-20', piece: i7.piece, lignes: S('1020', '7500', i7.total) },
    { date: '2026-12-31', piece: i8.piece, lignes: S('6000', '7500', f(30000)) },
    { date: '2026-12-31', piece: i9.piece, lignes: S('2850', '7500', f(21600)) },
    { date: '2026-12-31', piece: i10.piece, lignes: S('7510', '1609', Math.round(valeurAcquisition / 100)) },
    { date: '2026-12-31', piece: i11.piece, lignes: S('7510', '2300', interetsCourusCloture) },
  ],
);

// ─────────────────────────── Dossier MP 5 : Sports & Montagne SA (analyse financière) ───────────────────────────
const sports = { nom: 'Sports & Montagne SA', adresse: ['Avenue de Châtelaine 81', '1219 Châtelaine'] };
const compteSports = 'CH58 0000 4471 2214 7780 3';
const avisS = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: sports, compte: compteSports, date, operations });
const noteS = (date: string, numero: string, titre: string, texte: string, lignes?: { designation: string; montant: number }[]) =>
  noteInterne({ emetteur: sports, date, numero, titre, texte: [texte], lignes, mentions: ['Service comptable'] });

const a1 = noteS('2026-11-30', 'R-01', 'RÉCAPITULATIF DES VENTES À CRÉDIT',
  "Total des factures de vente de l'année (n° 2026-0001 à 2026-1342), à comptabiliser en une seule écriture.",
  [{ designation: 'Ventes de skis, vélos et équipement, janvier à novembre', montant: f(820000) }]);
const a2 = avisS('credit', '2026-12-15', [{ designation: 'Récapitulatif des paiements de clients reçus en 2026', montant: f(790000) }]);
const a3 = noteS('2026-11-30', 'R-02', 'RÉCAPITULATIF DES ACHATS À CRÉDIT',
  "Total des factures de fournisseurs de marchandises de l'année, à comptabiliser en une seule écriture.",
  [{ designation: 'Achats de marchandises, janvier à novembre', montant: f(480000) }]);
const a4 = avisS('debit', '2026-12-15', [{ designation: 'Récapitulatif des paiements aux fournisseurs de marchandises en 2026', montant: f(470000) }]);
const a5 = avisS('debit', '2026-12-20', [
  { designation: 'Salaires nets et retenues versés aux assurances, année 2026', montant: f(160000) },
  { designation: "Charges sociales de l'employeur, année 2026", montant: f(30000) },
]);
const a6 = avisS('debit', '2026-12-20', [{ designation: 'Loyer du magasin et de l’entrepôt, janvier à décembre', montant: f(48000) }]);
const a7 = avisS('debit', '2026-12-20', [
  { designation: 'Assurances choses et responsabilité civile', montant: f(6000) },
  { designation: 'Électricité et chauffage', montant: f(9000) },
  { designation: 'Campagnes publicitaires', montant: f(12000) },
]);
const a8 = avisS('debit', '2026-12-31', [
  { designation: "Intérêt annuel de 2,5 % sur l'emprunt de 120'000.00", montant: f(3000) },
  { designation: "Remboursement partiel de l'emprunt", montant: f(20000) },
]);
const a9 = noteS('2026-12-31', 'NI-12a', 'INVENTAIRE DU STOCK',
  "L'inventaire du 31.12.2026 évalue le stock de marchandises à 175'000.00. Ajuster le compte de stock.");
const a10 = noteS('2026-12-31', 'NI-12b', 'AMORTISSEMENTS',
  "Amortissements directs de l'exercice : mobilier et installations 10 % de la valeur comptable, véhicules 20 % de la valeur comptable.");
const a11 = noteS('2026-12-31', 'NI-12c', 'PROVISION POUR IMPÔTS',
  "Les impôts sur le bénéfice et le capital de 2026, facturés en 2027, sont estimés à 14'000.00. Constituer une provision.");

export const dossierSports = construireDossier(
  {
    id: 'dossier-mp5-sports-et-montagne-analyse',
    titre: 'Sports & Montagne SA — dossier de pièces, analyse financière',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 5,
    sujets: ['Écritures de clôture', 'Ratios de liquidité et de financement', 'Rentabilité et marges', 'Interprétation des résultats'],
    raisonSociale: 'Sports & Montagne SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour ce dossier, la TVA est laissée de côté. Les opérations de l'année sont résumées par des récapitulatifs. Après " +
      "avoir comptabilisé toutes les pièces, ouvrez la fiche « Analyse » et calculez les ratios d'après vos comptes avant " +
      "bouclement ; le logiciel vérifie vos résultats à 0.1 point près. Commentez ensuite la situation de l'entreprise.",
    situation:
      "Sports & Montagne SA vend des skis, des vélos et de l'équipement de montagne dans son magasin de Châtelaine. Elle " +
      "a été fondée il y a douze ans par trois associés, aujourd'hui actionnaires.\n\n" +
      "La société veut ouvrir une deuxième succursale et demande un crédit à sa banque. Le conseiller exige les comptes " +
      "2026 et une analyse : l'entreprise peut-elle payer ses dettes à court terme ? Est-elle assez financée par ses fonds " +
      "propres ? Est-elle rentable ?\n\n" +
      "Votre mission : comptabiliser les pièces de l'année et les écritures de clôture, puis calculer et interpréter les " +
      "ratios de liquidité, de financement et de rentabilité.",
    ouvertureActif: { '1000': f(3000), '1020': f(47000), '1100': f(85000), '1200': f(160000), '1510': f(60000), '1530': f(50000) },
    ouverturePassif: { '2000': f(70000), '2400': f(120000), '2800': f(150000), '2950': f(25000), '2970': f(40000) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-11-30', piece: a1.piece, lignes: S('1100', '3200', f(820000)) },
    { date: '2026-11-30', piece: a3.piece, lignes: S('4200', '2000', f(480000)) },
    { date: '2026-12-15', piece: a2.piece, lignes: S('1020', '1100', a2.total) },
    { date: '2026-12-15', piece: a4.piece, lignes: S('2000', '1020', a4.total) },
    { date: '2026-12-20', piece: a5.piece, lignes: [D('5200', f(160000)), D('5270', f(30000)), C('1020', a5.total)] },
    { date: '2026-12-20', piece: a6.piece, lignes: S('6000', '1020', a6.total) },
    { date: '2026-12-20', piece: a7.piece, lignes: [D('6300', f(6000)), D('6400', f(9000)), D('6600', f(12000)), C('1020', a7.total)] },
    { date: '2026-12-31', piece: a8.piece, lignes: [D('6900', f(3000)), D('2400', f(20000)), C('1020', a8.total)] },
    { date: '2026-12-31', piece: a9.piece, lignes: S('1200', '4280', f(15000)) },
    { date: '2026-12-31', piece: a10.piece, lignes: [D('6800', f(16000)), C('1510', f(6000)), C('1530', f(10000))] },
    { date: '2026-12-31', piece: a11.piece, lignes: S('8900', '2640', f(14000)) },
  ],
);

// Corrigé complémentaire : résultat de l'immeuble (Carrosserie du Salève).
const produitsImmeuble = i7.total + f(30000) + f(21600);
const chargesImmeuble =
  -interetsCourusOuverture + i5.total + i3.ttc + interetAnnuite + i4.ttc + Math.round(valeurAcquisition / 100) + interetsCourusCloture;
const mI = (c: number) => (c / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
export const complementCarrosserie: TableauComplement[] = [
  {
    titre: "Résultat de l'immeuble",
    entetes: ['Élément', 'Montant CHF'],
    lignes: [
      ["Produits d'immeubles (7500) : loyers du studio, loyer interne de l'atelier, valeur locative du logement", mI(produitsImmeuble)],
      ["./. Charges d'immeubles (7510), extourne du 01.01 déduite", mI(chargesImmeuble)],
      ["= Résultat de l'immeuble", mI(produitsImmeuble - chargesImmeuble)],
    ],
  },
];
