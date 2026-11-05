// Dossiers CFC, niveau 1 : bases (commerce de détail ; entreprise de services). Entreprises fictives.
import { avisBancaire, facture, quittance, ticket } from '../../engine/pieces';
import { BANQUE, construireDossier, f, S } from './outils';

// ─────────────────────────── Dossier 1 : Saveurs de Carouge (commerce) ───────────────────────────
const saveurs = { nom: 'Saveurs de Carouge', adresse: ['Rue Ancienne 18', '1227 Carouge'] };
const compteSaveurs = 'CH21 0000 4471 2205 8813 0';
const delicatessa = { nom: 'Delicatessa Import Sàrl', adresse: ['Route de Meyrin 210', '1217 Meyrin'] };
const treille = { nom: 'Restaurant La Treille', adresse: ['Place du Marché 3', '1227 Carouge'] };

const d1p1 = facture({
  emetteur: delicatessa, destinataire: saveurs, numero: 'DI-26-0042', date: '2026-01-05', tauxTva: 26,
  articles: [
    { designation: "Huile d'olive vierge extra 50 cl", quantite: 24, prixUnitaire: f(18.5) },
    { designation: 'Pâtes artisanales 500 g', quantite: 60, prixUnitaire: f(4.2) },
    { designation: "Coffret d'épices", quantite: 30, prixUnitaire: f(6.8) },
  ],
  mentions: ['Payable à 30 jours net.'],
});
const d1p2 = ticket({
  emetteur: saveurs, date: '2026-01-09', titre: 'RAPPORT DE CAISSE — VENTES DU 05 AU 09.01', numero: 'Z-002',
  articles: [
    { designation: 'Épicerie', montant: f(2918.4) },
    { designation: 'Fromages et charcuterie', montant: f(1214.7) },
    { designation: 'Vins', montant: f(609.5) },
  ],
  mentions: ['Encaissements en espèces.'],
});
const d1p3 = facture({
  emetteur: saveurs, destinataire: treille, numero: '2026-007', date: '2026-01-12',
  articles: [
    { designation: "Huile d'olive en bidon 5 l", quantite: 10, prixUnitaire: f(24) },
    { designation: "Fromage d'alpage (kg)", quantite: 6, prixUnitaire: f(32.5) },
  ],
  mentions: ['Payable à 30 jours.', `IBAN ${compteSaveurs}`],
});
const d1p4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: saveurs, compte: compteSaveurs, date: '2026-01-31',
  operations: [{ designation: 'Ordre permanent — loyer de janvier, Régie du Vieux-Carouge', montant: f(1650) }] });
const d1p5 = quittance({
  emetteur: saveurs, date: '2026-02-03', titre: 'BON DE PRÉLÈVEMENT', numero: 'P-01',
  texte: ['Retrait de la caisse du magasin par la propriétaire, Mme Nadia Berset, pour ses besoins personnels.'],
  montant: f(300), mentions: ['Signature : N. Berset'],
});
const d1p6 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: saveurs, compte: compteSaveurs, date: '2026-02-10',
  operations: [{ designation: 'Virement de Restaurant La Treille — facture 2026-007', montant: d1p3.ttc }] });
const d1p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: saveurs, compte: compteSaveurs, date: '2026-02-14',
  operations: [{ designation: 'Paiement à Delicatessa Import Sàrl — facture DI-26-0042', montant: d1p1.ttc }] });
const d1p8 = facture({
  emetteur: { nom: 'Services énergétiques du Lac', adresse: ['Chemin du Château-Bloch 2', '1219 Le Lignon'] },
  destinataire: saveurs, numero: 'E-558120', date: '2026-02-20', tauxTva: 81,
  articles: [{ designation: 'Électricité, période du 01.12.2025 au 31.01.2026', prixUnitaire: f(172.4) }],
  mentions: ['Payable dans les 30 jours.'],
});
const d1p9 = ticket({
  emetteur: { nom: 'Papeterie du Rond-Point', adresse: ['Rond-Point de Plainpalais 4', '1205 Genève'] }, date: '2026-02-25',
  numero: '88-4410', tauxTva: 81,
  articles: [
    { designation: 'Classeurs A4 (4 pièces)', montant: f(15.6) },
    { designation: 'Rouleaux pour caisse enregistreuse (12)', montant: f(21.6) },
  ],
  mentions: ['Payé en espèces.'],
});
const d1p10 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: saveurs, compte: compteSaveurs, date: '2026-02-27',
  operations: [{ designation: 'Assurance Lémanique — prime annuelle assurance incendie et vol', montant: f(540) }] });
const d1p11 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: saveurs, compte: compteSaveurs, date: '2026-03-05',
  operations: [{ designation: 'Versement en espèces au guichet', montant: f(1500) }] });
const d1p12 = facture({
  emetteur: { nom: 'Imprimerie Arc-en-Ciel', adresse: ['Rue des Noirettes 32', '1227 Carouge'] },
  destinataire: saveurs, numero: '26-0311', date: '2026-03-20', tauxTva: 81,
  articles: [
    { designation: 'Flyers A5 couleur', quantite: 2000, prixUnitaire: f(0.13) },
    { designation: 'Distribution dans les boîtes aux lettres du quartier', prixUnitaire: f(120) },
  ],
  mentions: ['Payable à 30 jours.'],
});

export const dossierSaveurs = construireDossier(
  {
    id: 'dossier-cfc1-saveurs-de-carouge',
    titre: 'Saveurs de Carouge — dossier de pièces, premier trimestre',
    niveau: 'CFC1',
    filiere: 'CFC',
    difficulte: 1,
    sujets: ["Bilan d'ouverture", 'Achats et ventes de marchandises', "Charges d'exploitation", 'Compte privé', 'Bouclement'],
    raisonSociale: 'Saveurs de Carouge',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise n'est pas assujettie à la TVA : comptabilisez les montants des pièces TVA comprise. Comptabilisez les " +
      "douze pièces, puis passez les écritures de bouclement au 31.12.2026 (aucune autre opération jusqu'à cette date).",
    situation:
      "Vous commencez votre apprentissage chez Saveurs de Carouge, une petite épicerie fine de la rue Ancienne tenue par " +
      "Nadia Berset depuis six ans. On y trouve des huiles, des pâtes artisanales, des épices, des fromages d'alpage et " +
      "une petite sélection de vins de la région.\n\n" +
      "Mme Berset s'occupe des achats et de la vente ; jusqu'ici, elle rangeait les pièces dans une boîte à chaussures. " +
      "Elle vous confie désormais la comptabilité : chaque semaine, vous recevez les factures, les tickets, les avis de la " +
      "banque et les bons de caisse.\n\n" +
      "Votre mission : comptabiliser les pièces du premier trimestre dans le journal, puis boucler l'exercice pour lui " +
      "montrer si son commerce dégage un bénéfice.",
    ouvertureActif: { '1000': f(1800), '1020': f(22000), '1200': f(9500), '1510': f(14000) },
    ouverturePassif: { '2000': f(4300), '2800': f(43000) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-01-05', piece: d1p1.piece, lignes: S('4200', '2000', d1p1.ttc) },
    { date: '2026-01-09', piece: d1p2.piece, lignes: S('1000', '3200', d1p2.ttc) },
    { date: '2026-01-12', piece: d1p3.piece, lignes: S('1100', '3200', d1p3.ttc) },
    { date: '2026-01-31', piece: d1p4.piece, lignes: S('6000', '1020', d1p4.total) },
    { date: '2026-02-03', piece: d1p5.piece, lignes: S('2850', '1000', d1p5.montant) },
    { date: '2026-02-10', piece: d1p6.piece, lignes: S('1020', '1100', d1p6.total) },
    { date: '2026-02-14', piece: d1p7.piece, lignes: S('2000', '1020', d1p7.total) },
    { date: '2026-02-20', piece: d1p8.piece, lignes: S('6400', '2010', d1p8.ttc) },
    { date: '2026-02-25', piece: d1p9.piece, lignes: S('6500', '1000', d1p9.ttc) },
    { date: '2026-02-27', piece: d1p10.piece, lignes: S('6300', '1020', d1p10.total) },
    { date: '2026-03-05', piece: d1p11.piece, lignes: S('1020', '1000', d1p11.total) },
    { date: '2026-03-20', piece: d1p12.piece, lignes: S('6600', '2010', d1p12.ttc) },
  ],
);

// ─────────────────────────── Dossier 2 : Traductions Polyglotte (services) ───────────────────────────
const poly = { nom: 'Traductions Polyglotte', adresse: ['Boulevard Carl-Vogt 61', '1205 Genève'] };
const comptePoly = 'CH58 0000 4471 3390 2214 6';
const asso = { nom: 'Association culturelle de Plainpalais', adresse: ['Rue de Carouge 54', '1205 Genève'] };

const d2p1 = facture({
  emetteur: poly, destinataire: asso, numero: 'TP-2026-01', date: '2026-01-08',
  articles: [{ designation: 'Traduction allemand-français de la brochure « Saison 2026 » (pages)', quantite: 24, prixUnitaire: f(85) }],
  mentions: ['Payable à 30 jours.', `IBAN ${comptePoly}`],
});
const d2p2 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-01-15',
  operations: [{ designation: 'Virement de Cabinet Moret & Associés — facture TP-2025-19 du 12.12.2025', montant: f(3200) }] });
const d2p3 = facture({
  emetteur: { nom: 'LinguaSoft Sàrl', adresse: ['Avenue de la Gare 9', '1003 Lausanne'] }, destinataire: poly,
  numero: 'LS-7781', date: '2026-01-20', tauxTva: 81,
  articles: [{ designation: 'Licence annuelle du logiciel de traduction assistée', prixUnitaire: f(480) }],
  mentions: ['Payable à 30 jours.'],
});
const d2p4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-01-31',
  operations: [{ designation: 'Ordre permanent — loyer du bureau, janvier', montant: f(950) }] });
const d2p5 = facture({
  emetteur: poly, destinataire: { nom: 'Fondation Horizons Santé', adresse: ['Chemin des Pins 4', '1206 Genève'] },
  numero: 'TP-2026-02', date: '2026-02-05',
  articles: [
    { designation: 'Interprétation simultanée, colloque du 03.02.2026 (journée)', prixUnitaire: f(1200) },
    { designation: 'Frais de déplacement', prixUnitaire: f(80) },
  ],
  mentions: ['Payable à 30 jours.', `IBAN ${comptePoly}`],
});
const d2p6 = ticket({
  emetteur: { nom: 'Bureau Express', adresse: ['Rue du Stand 40', '1204 Genève'] }, date: '2026-02-12', numero: '5521',
  tauxTva: 81, articles: [{ designation: "Cartouches d'encre pour imprimante (2)", montant: f(129.8) }], mentions: ['Payé en espèces.'],
});
const d2p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-02-18',
  operations: [{ designation: 'Paiement à LinguaSoft Sàrl — facture LS-7781', montant: d2p3.ttc }] });
const d2p8 = quittance({
  emetteur: poly, destinataire: { nom: 'M. Ricardo Alves' }, date: '2026-02-25', numero: 'Q-014',
  texte: ['Reçu de M. Ricardo Alves, en espèces, pour la traduction certifiée de son diplôme.'],
  montant: f(180), mentions: ['Pour acquit : M. Rochat'],
});
const d2p9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-02-28',
  operations: [{ designation: 'Virement sur le compte privé de Mélanie Rochat', montant: f(2000) }] });
const d2p10 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-03-10',
  operations: [{ designation: 'Télécom Romande — abonnement téléphone et internet, février', montant: f(89.9) }] });
const d2p11 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: poly, compte: comptePoly, date: '2026-03-15',
  operations: [{ designation: 'Virement de l’Association culturelle de Plainpalais — facture TP-2026-01', montant: d2p1.ttc }] });
const d2p12 = facture({
  emetteur: { nom: 'Mutuelle Romande Assurances', adresse: ['Rue du Rhône 100', '1204 Genève'] }, destinataire: poly,
  numero: 'RC-26-1187', date: '2026-03-20',
  articles: [{ designation: 'Assurance responsabilité civile professionnelle, prime 2026', prixUnitaire: f(640) }],
  mentions: ['Prime non soumise à la TVA.', 'Payable à 30 jours.'],
});

export const dossierPolyglotte = construireDossier(
  {
    id: 'dossier-cfc1-traductions-polyglotte',
    titre: 'Traductions Polyglotte — dossier de pièces, premier trimestre',
    niveau: 'CFC1',
    filiere: 'CFC',
    difficulte: 1,
    sujets: ['Prestations de services (honoraires)', "Charges d'exploitation", 'Compte privé', 'Bouclement'],
    raisonSociale: 'Traductions Polyglotte',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise n'est pas assujettie à la TVA : comptabilisez les montants des pièces TVA comprise. Les prestations " +
      "facturées sont des honoraires. Comptabilisez les douze pièces, puis passez les écritures de bouclement au 31.12.2026.",
    situation:
      "Mélanie Rochat a ouvert il y a trois ans son bureau, Traductions Polyglotte, au boulevard Carl-Vogt. Elle traduit des " +
      "documents de l'allemand, de l'anglais et de l'italien vers le français et assure des missions d'interprétation lors " +
      "de colloques.\n\n" +
      "Elle ne vend aucune marchandise : son chiffre d'affaires est fait d'honoraires. Elle travaille seule et vous engage " +
      "quelques heures par semaine pour tenir sa comptabilité.\n\n" +
      "Votre mission : comptabiliser les pièces du premier trimestre, puis boucler l'exercice et lui expliquer ce que " +
      "son activité lui a rapporté.",
    ouvertureActif: { '1000': f(600), '1020': f(18400), '1100': f(3200), '1520': f(4800), '1521': f(3500) },
    ouverturePassif: { '2010': f(950), '2800': f(29550) },
    parametres: { corrigerBouclement: true, comptesAjoutes: ['3400'], comptesMasques: ['1200', '3200', '4200', '4280'] },
  },
  [
    { date: '2026-01-08', piece: d2p1.piece, lignes: S('1100', '3400', d2p1.ttc) },
    { date: '2026-01-15', piece: d2p2.piece, lignes: S('1020', '1100', d2p2.total) },
    { date: '2026-01-20', piece: d2p3.piece, lignes: S('6500', '2010', d2p3.ttc) },
    { date: '2026-01-31', piece: d2p4.piece, lignes: S('6000', '1020', d2p4.total) },
    { date: '2026-02-05', piece: d2p5.piece, lignes: S('1100', '3400', d2p5.ttc) },
    { date: '2026-02-12', piece: d2p6.piece, lignes: S('6500', '1000', d2p6.ttc) },
    { date: '2026-02-18', piece: d2p7.piece, lignes: S('2010', '1020', d2p7.total) },
    { date: '2026-02-25', piece: d2p8.piece, lignes: S('1000', '3400', d2p8.montant) },
    { date: '2026-02-28', piece: d2p9.piece, lignes: S('2850', '1020', d2p9.total) },
    { date: '2026-03-10', piece: d2p10.piece, lignes: S('6510', '1020', d2p10.total) },
    { date: '2026-03-15', piece: d2p11.piece, lignes: S('1020', '1100', d2p11.total) },
    { date: '2026-03-20', piece: d2p12.piece, lignes: S('6300', '2010', d2p12.ttc) },
  ],
);

