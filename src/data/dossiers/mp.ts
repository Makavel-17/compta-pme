// Dossiers MP : société anonyme et répartition (niveau 1), titres, provisions et opérations financières (niveau 2).
// Entreprises fictives.
import { avisBancaire, avisDividende, facture, noteInterne, ticket } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S } from './outils';

// ─────────────────────────── Dossier 9 : Optique Rhône SA ───────────────────────────
const optique = { nom: 'Optique Rhône SA', adresse: ['Rue du Rhône 92', '1204 Genève'] };
const compteOptique = 'CH95 0000 4471 1182 6630 5';

const d9p1 = noteInterne({
  emetteur: optique, date: '2026-04-20', titre: "EXTRAIT DU PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE", numero: 'AG-2026',
  texte: [
    "L'assemblée générale ordinaire du 20 avril 2026 approuve les comptes 2025 (bénéfice de l'exercice 45'000.00, " +
      "bénéfice reporté de l'exercice précédent 3'000.00) et décide de répartir le bénéfice disponible comme suit. Le solde " +
      'reste en bénéfice reporté.',
  ],
  lignes: [
    { designation: 'Attribution à la réserve légale issue du bénéfice (5 % du bénéfice de l’exercice)', montant: f(2250) },
    { designation: 'Dividende de 15 % sur le capital-actions de 200\'000.00', montant: f(30000) },
    { designation: 'Attribution aux réserves libres', montant: f(10000) },
  ],
  mentions: ['Pour extrait conforme : le président du conseil d’administration'],
});
const d9p2 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-04-30',
  operations: [{ designation: 'Versement aux actionnaires du dividende 2025, net d’impôt anticipé (65 %)', montant: f(19500) }],
  mentions: ["L'impôt anticipé de 35 % est retenu et doit être versé à l'Administration fédérale des contributions."] });
const d9p3 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-05-25',
  operations: [{ designation: 'Administration fédérale des contributions — impôt anticipé sur le dividende 2025', montant: f(10500) }] });
const d9p4 = facture({
  emetteur: optique, destinataire: { nom: 'Clinique des Eaux-Vives', adresse: ['Rue du Lac 15', '1207 Genève'] },
  numero: '2026-311', date: '2026-06-03', tauxTva: 81,
  articles: [{ designation: 'Lunettes de protection pour le bloc opératoire', quantite: 50, prixUnitaire: f(200) }],
  mentions: ['Payable à 30 jours net ; 2 % d’escompte en cas de paiement dans les 10 jours.', `IBAN ${compteOptique}`],
});
const escVente = Math.round(d9p4.ttc * 2 / 100); // 216.20
const escVenteTva = Math.round(d9p4.tva * 2 / 100); // 16.20
const d9p5 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-06-11',
  operations: [{ designation: 'Virement de la Clinique des Eaux-Vives — facture 2026-311, sous déduction de 2 % d’escompte', montant: d9p4.ttc - escVente }],
  mentions: ["L'escompte accordé diminue aussi la TVA due."] });
const d9p6 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-06-30',
  operations: [
    { designation: 'Frais de tenue de compte, 1er semestre', montant: f(42) },
    { designation: 'Frais de virements et de cartes', montant: f(22.5) },
  ] });
const d9p7 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-06-30',
  operations: [{ designation: 'Intérêts créditeurs, 1er semestre', montant: f(120) }] });
const d9p8 = facture({
  emetteur: { nom: 'Verres Optiques Suisses SA', adresse: ['Bahnhofstrasse 51', '8001 Zurich'] }, destinataire: optique,
  numero: 'VOS-45120', date: '2026-07-06', tauxTva: 81,
  articles: [
    { designation: 'Verres progressifs (paires)', quantite: 30, prixUnitaire: f(180) },
    { designation: 'Montures en titane', quantite: 30, prixUnitaire: f(70) },
  ],
  mentions: ['Payable à 30 jours net ; 2 % d’escompte à 10 jours.'],
});
const escAchat = Math.round(d9p8.ttc * 2 / 100); // 162.15
const escAchatTva = Math.round(d9p8.tva * 2 / 100); // 12.15
const d9p9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: optique, compte: compteOptique, date: '2026-07-14',
  operations: [{ designation: 'Paiement à Verres Optiques Suisses SA — facture VOS-45120, sous déduction de 2 % d’escompte', montant: d9p8.ttc - escAchat }],
  mentions: ["L'escompte obtenu diminue aussi l'impôt préalable."] });
const d9p10 = ticket({
  emetteur: optique, date: '2026-07-31', titre: 'RAPPORT DE CAISSE — JUILLET', numero: 'Z-07', tauxTva: 81,
  articles: [
    { designation: 'Lunettes de soleil', montant: f(1945.8) },
    { designation: 'Lentilles et produits d’entretien', montant: f(1297.2) },
  ],
  mentions: ['Encaissements en espèces.'],
});

export const dossierOptique = construireDossier(
  {
    id: 'dossier-mp1-optique-rhone-sa',
    titre: 'Optique Rhône SA — dossier de pièces, société anonyme',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 1,
    sujets: ['Répartition du bénéfice décidée par l’assemblée générale', 'Dividende et impôt anticipé', 'Escomptes accordés et obtenus', 'Frais et intérêts bancaires', 'Bouclement d’une SA'],
    raisonSociale: 'Optique Rhône SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      'La société est assujettie à la TVA (méthode effective, au net, 8,1 %). Les escomptes sont comptabilisés dans les ' +
      'comptes de déductions, avec correction de la TVA. Le bénéfice de l’exercice est viré au bénéfice reporté.',
    situation:
      "Optique Rhône SA exploite un magasin d'optique au centre de Genève et fournit des lunettes de protection à des " +
      "cliniques. Son capital-actions de 200'000 francs est réparti entre trois actionnaires.\n\n" +
      "L'assemblée générale d'avril a approuvé les comptes de l'an dernier et décidé de verser un dividende. Le conseil " +
      "d'administration souhaite aussi profiter systématiquement des escomptes de ses fournisseurs.\n\n" +
      "Votre mission : comptabiliser la répartition du bénéfice, le dividende et l'impôt anticipé, puis les opérations " +
      "commerciales et bancaires, et enfin boucler les comptes.",
    ouvertureActif: { '1020': f(203000), '1100': f(40000), '1200': f(60000), '1510': f(50000) },
    ouverturePassif: { '1519': f(20000), '2000': f(25000), '2800': f(200000), '2950': f(60000), '2970': f(48000) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-04-20', piece: d9p1.piece, lignes: [D('2970', f(42250)), C('2950', f(2250)), C('2230', f(30000)), C('2960', f(10000))] },
    { date: '2026-04-30', piece: d9p2.piece, lignes: [D('2230', f(30000)), C('1020', f(19500)), C('2205', f(10500))] },
    { date: '2026-05-25', piece: d9p3.piece, lignes: S('2205', '1020', f(10500)) },
    { date: '2026-06-03', piece: d9p4.piece, lignes: [D('1100', d9p4.ttc), C('3200', d9p4.ht), C('2200', d9p4.tva)] },
    { date: '2026-06-11', piece: d9p5.piece, lignes: [D('1020', d9p5.total), D('3209', escVente - escVenteTva), D('2200', escVenteTva), C('1100', d9p4.ttc)] },
    { date: '2026-06-30', piece: d9p6.piece, lignes: S('6900', '1020', d9p6.total) },
    { date: '2026-06-30', piece: d9p7.piece, lignes: S('1020', '6950', d9p7.total) },
    { date: '2026-07-06', piece: d9p8.piece, lignes: [D('4200', d9p8.ht), D('1170', d9p8.tva), C('2000', d9p8.ttc)] },
    { date: '2026-07-14', piece: d9p9.piece, lignes: [D('2000', d9p8.ttc), C('1020', d9p9.total), C('4209', escAchat - escAchatTva), C('1170', escAchatTva)] },
    { date: '2026-07-31', piece: d9p10.piece, lignes: [D('1000', d9p10.ttc), C('3200', d9p10.ht), C('2200', d9p10.tva)] },
  ],
);

// ─────────────────────────── Dossier 10 : Précimeca SA ───────────────────────────
const precimeca = { nom: 'Précimeca SA', adresse: ['Chemin du Pré-Fleuri 18', '1228 Plan-les-Ouates'] };
const comptePrecimeca = 'CH08 0000 4471 5054 2219 6';
const avisP = (sens: 'debit' | 'credit', date: string, operations: { designation: string; montant: number }[], mentions?: string[]) =>
  avisBancaire({ sens, banque: BANQUE, titulaire: precimeca, compte: comptePrecimeca, date, operations, mentions });

const d10p1 = avisP('debit', '2026-02-12', [
  { designation: 'Achat de 300 actions Alpina Énergie SA au cours de 85.00', montant: f(25500) },
  { designation: 'Courtage et frais', montant: f(280) },
]);
const d10p2 = avisP('debit', '2026-03-31', [{ designation: "Intérêts de l'emprunt de 100'000.00 à 2,5 %, 1er trimestre", montant: f(625) }]);
const d10p3 = avisDividende({ banque: BANQUE, titulaire: precimeca, compte: comptePrecimeca, date: '2026-05-08',
  valeur: 'Actions Alpina Énergie SA', quantite: 300, dividendeParTitre: f(2.4) });
const d10p4 = avisP('credit', '2026-06-15', [
  { designation: 'Vente de 100 actions Alpina Énergie SA au cours de 92.00', montant: f(9200) },
  { designation: './. Courtage et frais', montant: -f(95) },
]);
const d10p5 = avisP('debit', '2026-06-30', [{ designation: "Intérêts de l'emprunt à 2,5 %, 2e trimestre", montant: f(625) }]);
const d10p6 = avisP('debit', '2026-06-30', [{ designation: 'Remboursement partiel de l’emprunt bancaire', montant: f(20000) }],
  ["Capital restant dû après remboursement : 80'000.00."]);
const d10p7 = avisP('debit', '2026-09-30', [{ designation: "Intérêts de l'emprunt à 2,5 %, 3e trimestre", montant: f(500) }]);
const d10p8 = avisP('debit', '2026-12-31', [{ designation: "Intérêts de l'emprunt à 2,5 %, 4e trimestre", montant: f(500) }]);
const d10p9 = noteInterne({
  emetteur: BANQUE, destinataire: precimeca, date: '2026-12-31', titre: 'RELEVÉ DE DÉPÔT DE TITRES', numero: 'DT-2026-12',
  texte: ['Évaluation de votre dépôt au cours de clôture du 31.12.2026.'],
  lignes: [{ designation: '200 actions Alpina Énergie SA, cours de clôture 81.50', montant: f(16300) }],
  mentions: ['Note du comptable : évaluer les titres au cours de clôture dans les comptes 2026.'],
});
const d10p10 = noteInterne({
  emetteur: precimeca, date: '2026-12-31', titre: 'PROVISION — RÉVISION DE LA PRESSE', numero: 'NI-12a',
  texte: [
    "La révision générale de la presse hydraulique, rendue nécessaire par l'usure de 2026, aura lieu en mars 2027. Le devis " +
      "s'élève à 12'000.00. Constituer une provision dans les comptes 2026.",
  ],
});
const d10p11 = noteInterne({
  emetteur: precimeca, date: '2026-12-31', titre: 'PROVISION — IMPÔTS', numero: 'NI-12b',
  texte: ["Les impôts sur le bénéfice et le capital de l'exercice 2026, qui seront facturés en 2027, sont estimés à 9'000.00. Constituer une provision."],
});
const valeurTitres = f(25500) - f(8500); // 200 actions à 85.00
const moinsValue = valeurTitres - f(16300);

export const dossierPrecimeca = construireDossier(
  {
    id: 'dossier-mp2-precimeca-sa-titres-provisions',
    titre: 'Précimeca SA — dossier de pièces, titres, provisions et opérations financières',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 2,
    sujets: ['Achat, vente et évaluation de titres', 'Dividendes reçus et impôt anticipé récupérable', 'Intérêts d’un emprunt', 'Provisions'],
    raisonSociale: 'Précimeca SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour ce dossier, la TVA est laissée de côté. Les frais d'achat et de vente de titres sont des charges financières ; " +
      "les gains sur titres et les dividendes sont des produits financiers. L'impôt anticipé retenu sur les dividendes est une créance envers l'AFC.",
    situation:
      "Précimeca SA usine des pièces de précision pour l'horlogerie et le médical à Plan-les-Ouates. Elle a financé ses " +
      "machines en partie par un emprunt bancaire de 100'000 francs.\n\n" +
      "Cette année, la trésorerie est abondante : le conseil d'administration place une partie des liquidités en actions " +
      "cotées, rembourse une tranche de l'emprunt et veut tenir compte, dès 2026, des dépenses importantes prévues pour 2027.\n\n" +
      "Votre mission : comptabiliser les opérations sur titres, les intérêts et le remboursement de l'emprunt, puis évaluer " +
      "les titres et constituer les provisions au 31 décembre.",
    ouvertureActif: { '1020': f(120000), '1100': f(60000), '1500': f(200000) },
    ouverturePassif: { '1509': f(80000), '2000': f(30000), '2400': f(100000), '2800': f(150000), '2950': f(10000), '2970': f(10000) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-02-12', piece: d10p1.piece, lignes: [D('1060', f(25500)), D('6900', f(280)), C('1020', d10p1.total)] },
    { date: '2026-03-31', piece: d10p2.piece, lignes: S('6900', '1020', d10p2.total) },
    { date: '2026-05-08', piece: d10p3.piece, lignes: [D('1020', d10p3.net), D('1176', d10p3.impotAnticipe), C('6950', d10p3.brut)] },
    { date: '2026-06-15', piece: d10p4.piece, lignes: [D('1020', d10p4.total), D('6900', f(95)), C('1060', f(8500)), C('6950', f(700))] },
    { date: '2026-06-30', piece: d10p5.piece, lignes: S('6900', '1020', d10p5.total) },
    { date: '2026-06-30', piece: d10p6.piece, lignes: S('2400', '1020', d10p6.total) },
    { date: '2026-09-30', piece: d10p7.piece, lignes: S('6900', '1020', d10p7.total) },
    { date: '2026-12-31', piece: d10p8.piece, lignes: S('6900', '1020', d10p8.total) },
    { date: '2026-12-31', piece: d10p9.piece, lignes: S('6900', '1060', moinsValue) },
    { date: '2026-12-31', piece: d10p10.piece, lignes: S('6100', '2600', f(12000)) },
    { date: '2026-12-31', piece: d10p11.piece, lignes: S('8900', '2640', f(9000)) },
  ],
);
