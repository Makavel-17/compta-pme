// Dossiers CFC : créances et ducroire, salaires (niveau 3), synthèse (niveau 4). Entreprises fictives.
import { avisBancaire, facture, ficheSalaire, noteInterne, quittance, ticket } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S } from './outils';

// ─────────────────────────── Dossier 6 : Meubles Confort (créances, pertes, ducroire) ───────────────────────────
const meubles = { nom: 'Meubles Confort', adresse: ['Route de Meyrin 210', '1217 Meyrin'] };
const compteMeubles = 'CH81 0000 4471 3390 5512 7';
const mentionsVente = ['Payable à 30 jours net.', `IBAN ${compteMeubles}`];

const d6p1 = facture({
  emetteur: meubles, destinataire: { nom: 'Mme Claire Dubey', adresse: ['Avenue de Vaudagne 14', '1217 Meyrin'] },
  numero: '2026-112', date: '2026-02-03',
  articles: [
    { designation: 'Canapé d’angle en tissu', prixUnitaire: f(2900) },
    { designation: 'Table basse en noyer', prixUnitaire: f(900) },
  ],
  mentions: mentionsVente,
});
const d6p2 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-02-10',
  operations: [{ designation: 'Office des poursuites — avance de frais, poursuite contre M. Yann Rossier (à la charge du débiteur)', montant: f(103) }] });
const d6p3 = noteInterne({
  emetteur: meubles, date: '2026-03-31', titre: 'CRÉANCE DOUTEUSE', numero: 'NI-03',
  texte: [
    "M. Yann Rossier ne paie pas sa facture de 5'600.00 malgré la poursuite. Avec les frais de poursuite avancés, il nous " +
      "doit 5'703.00. Le recouvrement est incertain : transférer cette créance dans le compte des créances douteuses.",
  ],
  mentions: ['Signé : H. Bersier'],
});
const d6p4 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-05-20',
  operations: [{ designation: 'Office des poursuites — produit de la saisie, poursuite contre M. Yann Rossier', montant: f(1200) }],
  mentions: ["Pour le solde, un acte de défaut de biens a été délivré : il n'y a plus rien à attendre de ce débiteur."] });
const d6p5 = facture({
  emetteur: meubles, destinataire: { nom: 'Hôtel du Parc', adresse: ['Quai du Mont-Blanc 40', '1201 Genève'] },
  numero: '2026-140', date: '2026-06-12',
  articles: [
    { designation: 'Chaise de salle à manger en hêtre', quantite: 40, prixUnitaire: f(185) },
    { designation: 'Table de restaurant 4 places', quantite: 10, prixUnitaire: f(200) },
  ],
  mentions: mentionsVente,
});
const d6p6 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-07-02',
  operations: [{ designation: 'Virement de Mme Claire Dubey — facture 2026-112', montant: d6p1.ttc }] });
const d6p7 = noteInterne({
  emetteur: { nom: 'Office des faillites', adresse: ['Case postale', '1211 Genève 8'] }, destinataire: meubles,
  date: '2026-09-15', titre: 'AVIS DE CLÔTURE DE FAILLITE', numero: 'F-2026-0391',
  texte: [
    "La faillite de l'Atelier Morand Sàrl est clôturée. L'actif ne suffit pas à couvrir les créances de troisième classe : " +
      "aucun dividende ne sera versé aux créanciers.",
  ],
  lignes: [{ designation: 'Votre créance produite (facture 2025-187)', montant: f(2100) }],
});
const d6p8 = facture({
  emetteur: { nom: 'Fabrique de meubles du Jura SA', adresse: ['Rue des Artisans 7', '2800 Delémont'] }, destinataire: meubles,
  numero: 'FMJ-77120', date: '2026-10-05',
  articles: [{ designation: 'Armoire deux portes en chêne', quantite: 4, prixUnitaire: f(1200) }],
  mentions: ['Payable à 30 jours.'],
});
const d6p9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-10-30',
  operations: [{ designation: 'Paiements aux fournisseurs — factures de fin 2025', montant: f(12000) }] });
const d6p10 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-11-20',
  operations: [{ designation: 'Virement de l’Hôtel du Parc — facture 2026-140', montant: d6p5.ttc }] });
const d6p10b = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: meubles, compte: compteMeubles, date: '2026-11-27',
  operations: [{ designation: 'Versement de M. Luc Vernier — acte de défaut de biens de 2024 (créance amortie en 2024)', montant: f(750) }],
  mentions: ["Cette créance avait été entièrement comptabilisée en perte lors de l'exercice 2024."] });
const creancesFin6 = f(46000) + d6p1.ttc + f(103) - f(5703) + d6p5.ttc - d6p6.total - f(2100) - d6p10.total; // 38'300.00
const ducroire6 = Math.round(creancesFin6 * 5 / 100); // 1'915.00
const d6p11 = noteInterne({
  emetteur: meubles, date: '2026-12-31', titre: 'BOUCLEMENT — DUCROIRE', numero: 'NI-12',
  texte: [
    'Adapter le ducroire à 5 % des créances clients au 31.12 (solde du compte Créances clients après les pièces de ce dossier).',
  ],
  mentions: ['Signé : H. Bersier'],
});

export const dossierMeubles = construireDossier(
  {
    id: 'dossier-cfc3-meubles-confort-creances',
    titre: 'Meubles Confort — dossier de pièces, créances et ducroire',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Créances douteuses', 'Pertes sur créances (poursuite, faillite)', 'Récupération d’une créance amortie', 'Ajustement du ducroire'],
    raisonSociale: 'Meubles Confort',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      'Pour ce dossier, la TVA est laissée de côté : les montants des pièces sont sans TVA. Le ducroire est ajusté par la ' +
      'différence entre le montant nécessaire et le montant existant. Une créance amortie lors d’un exercice précédent ' +
      'et récupérée est un produit exceptionnel.',
    situation:
      "Meubles Confort est un magasin d'ameublement de Meyrin tenu par Hugo Bersier. Il vend aux particuliers et équipe " +
      "aussi quelques hôtels et restaurants de la région, toujours sur facture à 30 jours.\n\n" +
      "Plusieurs clients paient mal : l'un d'eux est poursuivi, un atelier a fait faillite. M. Bersier veut savoir ce qu'il " +
      "peut encore espérer encaisser et que son bilan montre une valeur prudente des créances.\n\n" +
      "Votre mission : comptabiliser les ventes, les encaissements et le traitement des créances en difficulté, puis " +
      "ajuster le ducroire au 31 décembre.",
    ouvertureActif: { '1020': f(20000), '1100': f(46000), '1200': f(30000), '1510': f(15000) },
    ouverturePassif: { '1109': f(2300), '2000': f(12000), '2800': f(96700) },
  },
  [
    { date: '2026-02-03', piece: d6p1.piece, lignes: S('1100', '3200', d6p1.ttc) },
    { date: '2026-02-10', piece: d6p2.piece, lignes: S('1100', '1020', d6p2.total) },
    { date: '2026-03-31', piece: d6p3.piece, lignes: S('1108', '1100', f(5703)) },
    { date: '2026-05-20', piece: d6p4.piece, lignes: [D('1020', f(1200)), D('3805', f(4503)), C('1108', f(5703))] },
    { date: '2026-06-12', piece: d6p5.piece, lignes: S('1100', '3200', d6p5.ttc) },
    { date: '2026-07-02', piece: d6p6.piece, lignes: S('1020', '1100', d6p6.total) },
    { date: '2026-09-15', piece: d6p7.piece, lignes: S('3805', '1100', f(2100)) },
    { date: '2026-10-05', piece: d6p8.piece, lignes: S('4200', '2000', d6p8.ttc) },
    { date: '2026-10-30', piece: d6p9.piece, lignes: S('2000', '1020', d6p9.total) },
    { date: '2026-11-20', piece: d6p10.piece, lignes: S('1020', '1100', d6p10.total) },
    { date: '2026-11-27', piece: d6p10b.piece, lignes: S('1020', '8510', d6p10b.total) },
    { date: '2026-12-31', piece: d6p11.piece, lignes: S('1109', '3805', f(2300) - ducroire6) },
  ],
);

// ─────────────────────────── Dossier 7 : Boulangerie Au Bon Grain (salaires) ───────────────────────────
const boulangerie = { nom: 'Boulangerie Au Bon Grain', adresse: ['Rue de Carouge 58', '1205 Genève'] };
const compteBoulangerie = 'CH50 0000 4471 2287 6604 1';
const sofia = { nom: 'Mme Sofia Lopes', adresse: ['Rue des Maraîchers 9', '1205 Genève'] };
const thomas = { nom: 'M. Thomas Girod', adresse: ['Avenue du Mail 3', '1205 Genève'] };
const AVS = { libelle: 'AVS/AI/APG', taux: 530 };
const AC = { libelle: 'AC', taux: 110 };
const versement = (date: string) => [`Salaire net viré sur votre compte bancaire le ${date}.`];

const d7p1 = quittance({
  emetteur: boulangerie, date: '2026-01-15', numero: 'Q-01', titre: 'QUITTANCE — AVANCE SUR SALAIRE',
  texte: ["Je soussigné, Thomas Girod, reconnais avoir reçu en espèces une avance sur mon salaire de janvier."],
  montant: f(500), mentions: ['Signé : T. Girod'],
});
const d7p2 = ficheSalaire({ employeur: boulangerie, employe: sofia, periode: 'JANVIER 2026', date: '2026-01-25', brut: f(4600),
  retenues: [AVS, AC, { libelle: 'LPP', montant: f(230) }], mentions: versement('25.01.2026') });
const d7p3 = ficheSalaire({ employeur: boulangerie, employe: thomas, periode: 'JANVIER 2026', date: '2026-01-25', brut: f(5800),
  retenues: [AVS, AC, { libelle: 'LPP', montant: f(290) }, { libelle: 'Avance du 15.01', montant: f(500) }], mentions: versement('25.01.2026') });
const masse = f(4600) + f(5800);
const patronAvs = Math.round(masse * 530 / 10000) + Math.round(masse * 110 / 10000); // 665.60
const patronLpp = f(230) + f(290);
const patronAlfa = Math.round(masse * 240 / 10000); // 249.60
const notePatronale = (date: string, numero: string, mois: string) => noteInterne({
  emetteur: boulangerie, date, numero, titre: `CHARGES SOCIALES DE L'EMPLOYEUR — ${mois}`,
  texte: [
    "Part de l'employeur sur les salaires bruts du mois : AVS/AI/APG et AC au même taux que les employés, LPP du même " +
      'montant que la part des employés, allocations familiales (ALFA) 2,40 % à la charge de l’employeur seul.',
  ],
  lignes: [
    { designation: 'AVS/AI/APG et AC (caisse de compensation)', montant: patronAvs },
    { designation: 'LPP (caisse de pension)', montant: patronLpp },
    { designation: 'Allocations familiales', montant: patronAlfa },
  ],
  totaux: [{ libelle: 'Total des charges patronales', montant: patronAvs + patronLpp + patronAlfa, fort: true }],
  mentions: ['Signé : M. Jaquet'],
});
const d7p4 = notePatronale('2026-01-31', 'NI-01', 'JANVIER 2026');
const partAvs = (r: typeof d7p2) => r.retenues.filter((x) => x.libelle.startsWith('AVS') || x.libelle.startsWith('AC')).reduce((s, x) => s + x.montant, 0);
const avsEmployes = partAvs(d7p2) + partAvs(d7p3);
const d7p5 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: boulangerie, compte: compteBoulangerie, date: '2026-02-10',
  operations: [{ designation: 'Caisse de compensation AVS — cotisations AVS/AI/APG et AC de janvier (parts employés et employeur)', montant: avsEmployes + patronAvs }] });
const d7p6 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: boulangerie, compte: compteBoulangerie, date: '2026-02-10',
  operations: [{ designation: 'Caisse d’allocations familiales — cotisations de janvier', montant: patronAlfa }] });
const d7p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: boulangerie, compte: compteBoulangerie, date: '2026-02-10',
  operations: [{ designation: 'Caisse de pension des métiers de bouche — cotisations LPP de janvier (parts employés et employeur)', montant: 2 * patronLpp }] });
const d7p8 = ficheSalaire({ employeur: boulangerie, employe: sofia, periode: 'FÉVRIER 2026', date: '2026-02-25', brut: f(4600),
  retenues: [AVS, AC, { libelle: 'LPP', montant: f(230) }], mentions: versement('25.02.2026') });
const d7p9 = ficheSalaire({ employeur: boulangerie, employe: thomas, periode: 'FÉVRIER 2026', date: '2026-02-25', brut: f(5800),
  retenues: [AVS, AC, { libelle: 'LPP', montant: f(290) }], mentions: versement('25.02.2026') });
const d7p10 = notePatronale('2026-02-28', 'NI-02', 'FÉVRIER 2026');
const d7p11 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: boulangerie, compte: compteBoulangerie, date: '2026-02-28',
  operations: [{ designation: 'Assurance accidents Romande SA — prime LAA 2026 (accidents professionnels, à la charge de l’employeur)', montant: f(1860) }] });

const ecritureFiche = (r: typeof d7p2) => {
  const avs = r.retenues.filter((x) => x.libelle.startsWith('AVS') || x.libelle.startsWith('AC')).reduce((s, x) => s + x.montant, 0);
  const lpp = r.retenues.filter((x) => x.libelle.startsWith('LPP')).reduce((s, x) => s + x.montant, 0);
  const avance = r.retenues.filter((x) => x.libelle.startsWith('Avance')).reduce((s, x) => s + x.montant, 0);
  return [D('5200', r.brut), C('2170', avs), C('2171', lpp), ...(avance ? [C('1140', avance)] : []), C('1020', r.net)];
};
const ecriturePatronale = [D('5270', patronAvs + patronLpp + patronAlfa), C('2170', patronAvs), C('2171', patronLpp), C('2172', patronAlfa)];

export const dossierBoulangerie = construireDossier(
  {
    id: 'dossier-cfc3-boulangerie-au-bon-grain-salaires',
    titre: 'Boulangerie Au Bon Grain — dossier de pièces, salaires et charges sociales',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Décompte de salaire', 'Retenues et charges sociales patronales', 'Avance sur salaire', 'Paiement des assurances sociales'],
    raisonSociale: 'Boulangerie Au Bon Grain',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Les retenues sur le salaire sont portées dans le compte de dette de chaque assurance ; le salaire net est viré par la " +
      "banque. Les cotisations AVS/AI/APG et AC sont payées à la même caisse de compensation. Les charges de l'employeur " +
      'sont comptabilisées en charges sociales.',
    situation:
      "La Boulangerie Au Bon Grain, à la rue de Carouge, appartient à Marc Jaquet. Il fabrique le pain la nuit ; deux employés " +
      "l'aident au laboratoire et à la vente : Sofia Lopes, vendeuse, et Thomas Girod, boulanger.\n\n" +
      "Jusqu'ici, une fiduciaire s'occupait des salaires. M. Jaquet veut désormais les comptabiliser lui-même et comprendre " +
      "ce que coûte réellement un employé, au-delà du salaire versé.\n\n" +
      "Votre mission : comptabiliser l'avance, les salaires de janvier et février, les charges sociales de l'employeur et " +
      'le paiement des assurances sociales.',
    ouvertureActif: { '1000': f(2000), '1020': f(45000), '1200': f(3000), '1500': f(25000) },
    ouverturePassif: { '2000': f(4000), '2800': f(71000) },
  },
  [
    { date: '2026-01-15', piece: d7p1.piece, lignes: S('1140', '1000', d7p1.montant) },
    { date: '2026-01-25', piece: d7p2.piece, lignes: ecritureFiche(d7p2) },
    { date: '2026-01-25', piece: d7p3.piece, lignes: ecritureFiche(d7p3) },
    { date: '2026-01-31', piece: d7p4.piece, lignes: ecriturePatronale },
    { date: '2026-02-10', piece: d7p5.piece, lignes: S('2170', '1020', d7p5.total) },
    { date: '2026-02-10', piece: d7p6.piece, lignes: S('2172', '1020', d7p6.total) },
    { date: '2026-02-10', piece: d7p7.piece, lignes: S('2171', '1020', d7p7.total) },
    { date: '2026-02-25', piece: d7p8.piece, lignes: ecritureFiche(d7p8) },
    { date: '2026-02-25', piece: d7p9.piece, lignes: ecritureFiche(d7p9) },
    { date: '2026-02-28', piece: d7p10.piece, lignes: ecriturePatronale },
    { date: '2026-02-28', piece: d7p11.piece, lignes: S('5270', '1020', d7p11.total) },
  ],
);

// ─────────────────────────── Dossier 8 : Fleurs & Jardins Mermoud (synthèse CFC) ───────────────────────────
const fleurs = { nom: 'Fleurs & Jardins Mermoud', adresse: ['Place du Marché 6', '1227 Carouge'] };
const compteFleurs = 'CH29 0000 4471 9045 1170 8';

const d8p1 = facture({
  emetteur: { nom: 'Horticulture du Léman SA', adresse: ['Route de Collex 41', '1239 Collex-Bossy'] }, destinataire: fleurs,
  numero: 'HL-30981', date: '2026-10-02', tauxTva: 26,
  articles: [
    { designation: 'Roses coupées (botte de 20)', quantite: 30, prixUnitaire: f(36) },
    { designation: 'Plantes en pot assorties', quantite: 60, prixUnitaire: f(12) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const d8p2 = ticket({
  emetteur: fleurs, date: '2026-10-10', titre: 'RAPPORT DE CAISSE — SEMAINE DU 05 AU 10.10', numero: 'Z-041', tauxTva: 26,
  articles: [
    { designation: 'Bouquets et fleurs coupées', montant: f(2770.2) },
    { designation: 'Plantes en pot', montant: f(1333.8) },
  ],
  mentions: ['Encaissements en espèces.'],
});
const d8p3 = facture({
  emetteur: fleurs, destinataire: { nom: 'Hôtel des Bergues du Lac', adresse: ['Quai Wilson 18', '1201 Genève'] },
  numero: '2026-077', date: '2026-10-15', tauxTva: 26,
  articles: [{ designation: 'Décoration florale du hall, octobre (forfait)', prixUnitaire: f(2500) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteFleurs}`],
});
const d8p4 = ficheSalaire({
  employeur: fleurs, employe: { nom: 'M. Kevin Perrin', adresse: ['Rue Ancienne 20', '1227 Carouge'] },
  periode: 'OCTOBRE 2026', date: '2026-10-25', brut: f(4200),
  retenues: [{ libelle: 'AVS/AI/APG', taux: 530 }, { libelle: 'AC', taux: 110 }, { libelle: 'LPP', montant: f(150) }],
  mentions: ['Salaire net viré sur votre compte bancaire le 25.10.2026.'],
});
const d8p5 = facture({
  emetteur: { nom: 'Services énergétiques du Lac', adresse: ['Chemin du Château-Bloch 2', '1219 Le Lignon'] },
  destinataire: fleurs, numero: 'E-604412', date: '2026-10-31', tauxTva: 81,
  articles: [{ designation: 'Électricité, octobre 2026', prixUnitaire: f(210) }],
  mentions: ['Payable dans les 30 jours.'],
});
const d8p6 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: fleurs, compte: compteFleurs, date: '2026-11-05',
  operations: [{ designation: 'Paiements aux fournisseurs — factures de septembre', montant: f(3500) }] });
const d8p7 = noteInterne({
  emetteur: fleurs, date: '2026-11-20', titre: 'PERTE SUR CRÉANCE', numero: 'NI-11',
  texte: [
    "Le restaurant La Treille, client depuis deux ans, a cessé son activité sans laisser d'adresse. Sa facture de " +
      "1'200.00, comptabilisée l'an dernier, ne sera jamais payée. Il n'y a pas de correction de la TVA à faire sur cette perte.",
  ],
  mentions: ['Signé : J. Mermoud'],
});
const tvaDue8 = d8p2.tva + d8p3.tva;
const ipMarch8 = d8p1.tva;
const ipInv8 = d8p5.tva;
const solde8 = tvaDue8 - ipMarch8 - ipInv8;
const d8p8 = noteInterne({
  emetteur: fleurs, date: '2026-12-31', titre: 'DÉCOMPTE TVA DU 4e TRIMESTRE', numero: 'NI-12a',
  texte: [
    "Établir le décompte TVA du trimestre d'après les comptes (méthode effective) : virer l'impôt préalable sur la TVA " +
      'due et porter le solde en dette envers l’AFC.',
  ],
});
const d8p9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: fleurs, compte: compteFleurs, date: '2026-12-31',
  operations: [{ designation: 'Administration fédérale des contributions — TVA 4e trimestre 2026', montant: solde8 }] });
const d8p10 = noteInterne({
  emetteur: fleurs, date: '2026-12-31', titre: 'AMORTISSEMENT DU VÉHICULE', numero: 'NI-12b',
  texte: ['Amortir le véhicule de livraison de 20 % de sa valeur d’acquisition (30\'000.00), méthode indirecte.'],
});
const d8p11 = noteInterne({
  emetteur: fleurs, date: '2026-12-31', titre: 'LOYER DE DÉCEMBRE', numero: 'NI-12c',
  texte: ["Le loyer du magasin de décembre, 1'400.00, sera payé en janvier. Rattacher cette charge à l'exercice 2026."],
});
const creancesFin8 = f(8000) + d8p3.ttc - f(1200);
const ducroire8 = Math.round(creancesFin8 * 5 / 100);
const d8p12 = noteInterne({
  emetteur: fleurs, date: '2026-12-31', titre: 'DUCROIRE', numero: 'NI-12d',
  texte: ['Adapter le ducroire à 5 % des créances clients au 31.12 (solde du compte après les pièces de ce dossier).'],
});

export const dossierFleurs = construireDossier(
  {
    id: 'dossier-cfc4-fleurs-et-jardins-mermoud',
    titre: 'Fleurs & Jardins Mermoud — dossier de pièces, synthèse de fin d’année',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 4,
    sujets: ['TVA au taux réduit et au taux normal', 'Salaire', 'Perte sur créance et ducroire', 'Amortissement et transitoire', 'Bouclement'],
    raisonSociale: 'Fleurs & Jardins Mermoud',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise est assujettie à la TVA (méthode effective, au net). Les fleurs et les plantes sont au taux réduit de " +
      "2,6 %, l'électricité au taux normal de 8,1 %. Le dossier couvre le dernier trimestre ; terminez par les écritures de bouclement.",
    situation:
      "Julie Mermoud tient depuis six ans Fleurs & Jardins Mermoud, un magasin de fleurs sur la place du Marché de Carouge. Elle vend au comptoir, " +
      "décore les halls de quelques hôtels et emploie un fleuriste, Kevin Perrin.\n\n" +
      "La fin de l'année approche. Sa banque lui demande des comptes annuels propres pour étudier une demande de crédit : " +
      "Mme Mermoud veut un résultat juste, avec les amortissements, les charges de l'exercice et une évaluation prudente des créances.\n\n" +
      "Votre mission : comptabiliser les pièces du dernier trimestre, passer les écritures de fin d'année, puis boucler les comptes.",
    ouvertureActif: { '1000': f(1500), '1020': f(28000), '1100': f(8000), '1200': f(6000), '1530': f(30000) },
    ouverturePassif: { '1109': f(400), '1539': f(12000), '2000': f(3500), '2800': f(57600) },
    parametres: { corrigerBouclement: true },
  },
  [
    { date: '2026-10-02', piece: d8p1.piece, lignes: [D('4200', d8p1.ht), D('1170', d8p1.tva), C('2000', d8p1.ttc)] },
    { date: '2026-10-10', piece: d8p2.piece, lignes: [D('1000', d8p2.ttc), C('3200', d8p2.ht), C('2200', d8p2.tva)] },
    { date: '2026-10-15', piece: d8p3.piece, lignes: [D('1100', d8p3.ttc), C('3200', d8p3.ht), C('2200', d8p3.tva)] },
    { date: '2026-10-25', piece: d8p4.piece, lignes: ecritureFiche(d8p4) },
    { date: '2026-10-31', piece: d8p5.piece, lignes: [D('6400', d8p5.ht), D('1171', d8p5.tva), C('2010', d8p5.ttc)] },
    { date: '2026-11-05', piece: d8p6.piece, lignes: S('2000', '1020', d8p6.total) },
    { date: '2026-11-20', piece: d8p7.piece, lignes: S('3805', '1100', f(1200)) },
    { date: '2026-12-31', piece: d8p8.piece, lignes: [D('2200', tvaDue8), C('1170', ipMarch8), C('1171', ipInv8), C('2205', solde8)] },
    { date: '2026-12-31', piece: d8p9.piece, lignes: S('2205', '1020', solde8) },
    { date: '2026-12-31', piece: d8p10.piece, lignes: S('6800', '1539', f(6000)) },
    { date: '2026-12-31', piece: d8p11.piece, lignes: S('6000', '2300', f(1400)) },
    { date: '2026-12-31', piece: d8p12.piece, lignes: S('3805', '1109', ducroire8 - f(400)) },
  ],
);
