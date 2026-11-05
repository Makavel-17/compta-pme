// Dossiers MP niveau 3 : fondation d'une SA et augmentation du capital. Entreprises fictives.
// Règles (F&C ch. 36) : souscription 1850/2800, libération en espèces ou en nature au crédit de 1850, créances apportées
// avec ducroire, frais de fondation et d'augmentation en charge 6550 FAO, agio aux réserves légales issues du capital (2900),
// bons de participation 1860/2810.
import { avisBancaire, facture, noteInterne } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S } from './outils';

// ─────────────────────────── Fondation : Brasserie du Mont-Blanc SA ───────────────────────────
const brasserie = { nom: 'Brasserie du Mont-Blanc SA (en formation)', adresse: ['Chemin du Pré-Bouvier 22', '1242 Satigny'] };
const brasserieSA = { nom: 'Brasserie du Mont-Blanc SA', adresse: ['Chemin du Pré-Bouvier 22', '1242 Satigny'] };
const compteBrasserie = 'CH17 0000 4471 4410 2287 5';
const notaire = { nom: 'Étude de Me Isabelle Ferrier, notaire', adresse: ['Rue du Général-Dufour 11', '1204 Genève'] };

const capitalFondation = f(300000);
const especes = f(140000);
const machines = f(60000);
const vehicule = f(25000);
const creances = f(20000);
const ducroireApport = Math.round(creances * 10 / 100);
const stock = f(12000);
const libere = especes + machines + vehicule + (creances - ducroireApport) + stock;
const solde = capitalFondation - libere;

const b1 = noteInterne({
  emetteur: notaire, destinataire: brasserie, date: '2026-02-02', titre: "EXTRAIT DE L'ACTE CONSTITUTIF", numero: 'Minute 2026/118',
  texte: [
    "Les fondateurs constituent la société anonyme Brasserie du Mont-Blanc SA, dont le capital-actions est fixé à 300'000.00, " +
      "divisé en 300 actions nominatives de 1'000.00. Toutes les actions sont souscrites ce jour.",
  ],
  lignes: [
    { designation: 'M. Julien Favre — 150 actions', montant: f(150000) },
    { designation: 'Mme Léa Berthod — 100 actions', montant: f(100000) },
    { designation: 'M. Karim Haddad — 50 actions', montant: f(50000) },
  ],
  totaux: [{ libelle: 'Capital-actions souscrit', montant: capitalFondation, fort: true }],
});
const b2 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: brasserie, compte: compteBrasserie, date: '2026-02-05',
  operations: [{ designation: 'Versements des fondateurs sur le compte de consignation du capital (libération en espèces)', montant: especes }],
  mentions: ['Les fonds seront à la libre disposition de la société dès son inscription au registre du commerce.'] });
const b3 = noteInterne({
  emetteur: brasserie, date: '2026-02-02', titre: "CONTRAT D'APPORT EN NATURE", numero: 'Annexe 1',
  texte: [
    "M. Julien Favre, qui exploitait jusqu'ici une micro-brasserie en raison individuelle, apporte à la société les biens " +
      'suivants, à la valeur confirmée par le rapport de fondation. Ces apports libèrent une partie de ses actions.',
  ],
  lignes: [
    { designation: 'Installation de brassage (cuves, refroidisseur, embouteilleuse)', montant: machines },
    { designation: 'Fourgon de livraison', montant: vehicule },
  ],
  totaux: [{ libelle: 'Total des apports', montant: machines + vehicule, fort: true }],
});
const b4 = noteInterne({
  emetteur: brasserie, date: '2026-02-02', titre: "CONTRAT D'APPORT EN NATURE", numero: 'Annexe 2',
  texte: [
    "M. Julien Favre cède à la société les créances envers ses clients restaurateurs. Le rapport de fondation estime que " +
      '10 % de ces créances risquent de ne pas être encaissées ; seul le montant net libère ses actions.',
  ],
  lignes: [{ designation: 'Créances clients cédées (valeur nominale)', montant: creances }],
});
const b5 = noteInterne({
  emetteur: brasserie, date: '2026-02-02', titre: "CONTRAT D'APPORT EN NATURE", numero: 'Annexe 3',
  texte: ['Mme Léa Berthod apporte le stock de bières et de matières premières de son commerce de boissons, à la valeur d’inventaire.'],
  lignes: [{ designation: 'Stock de marchandises', montant: stock }],
});
const b6 = facture({
  emetteur: notaire, destinataire: brasserieSA, numero: 'N-2026-0412', date: '2026-02-20',
  articles: [
    { designation: "Acte constitutif et statuts, acte authentique", prixUnitaire: f(3200) },
    { designation: 'Débours et légalisations', prixUnitaire: f(600) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const b7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: brasserieSA, compte: compteBrasserie, date: '2026-02-24',
  operations: [{ designation: 'Registre du commerce de Genève — émolument d’inscription de la société et des administrateurs', montant: f(900) }] });
const b8 = facture({
  emetteur: { nom: 'Fiduciaire Rhône Conseils SA', adresse: ['Rue de Hesse 8', '1204 Genève'] }, destinataire: brasserieSA,
  numero: 'FRC-26-077', date: '2026-02-26',
  articles: [{ designation: "Rédaction des statuts, rapport de fondation sur les apports en nature, conseils", prixUnitaire: f(4500) }],
  mentions: ['Payable à 30 jours.'],
});
const commission = Math.round(especes * 25 / 10000);
const b9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: brasserieSA, compte: compteBrasserie, date: '2026-02-26',
  operations: [{ designation: 'Commission de consignation du capital, 0,25 % des versements', montant: commission }] });
const b10 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: brasserieSA, compte: compteBrasserie, date: '2026-03-20',
  operations: [{ designation: 'Paiement à l’Étude de Me Ferrier — facture N-2026-0412', montant: b6.ttc }] });
const b11 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: brasserieSA, compte: compteBrasserie, date: '2026-09-30',
  operations: [{ designation: 'Versements des actionnaires — libération du solde des actions, appelée par le conseil d’administration', montant: solde }] });

export const dossierBrasserie = construireDossier(
  {
    id: 'dossier-mp3-brasserie-du-mont-blanc-fondation',
    titre: "Brasserie du Mont-Blanc SA — dossier de pièces, fondation d'une SA",
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 3,
    sujets: ['Souscription et libération du capital-actions', 'Apports en nature (dont créances)', 'Frais de fondation (FAO)', 'Bilan de fondation'],
    raisonSociale: 'Brasserie du Mont-Blanc SA',
    formeJuridique: 'SA',
    debut: '2026-02-02',
    fin: '2026-12-31',
    introduction:
      "La société est créée le 02.02.2026 : il n'y a pas de bilan d'ouverture. La TVA est laissée de côté. Les actions " +
      "souscrites sont une créance envers les actionnaires tant qu'elles ne sont pas libérées ; les frais de fondation sont " +
      "une charge. Après la pièce 5 (souscription, apports et versements), établissez le bilan de fondation.",
    situation:
      "Julien Favre brassait de la bière artisanale dans une petite raison individuelle à Satigny. Avec Léa Berthod, qui " +
      "tient un commerce de boissons, et Karim Haddad, un ami ingénieur, il fonde la Brasserie du Mont-Blanc SA pour " +
      "produire à plus grande échelle.\n\n" +
      "Chacun apporte ce qu'il peut : de l'argent, mais aussi l'installation de brassage, un fourgon, des créances et du " +
      "stock. Une partie du capital ne sera versée que plus tard, quand le conseil d'administration l'appellera.\n\n" +
      "Votre mission : comptabiliser la fondation de la société, ses apports et ses frais, établir le bilan de fondation, " +
      'puis enregistrer la libération du solde du capital.',
    ouvertureActif: {},
    ouverturePassif: {},
  },
  [
    { date: '2026-02-02', piece: b1.piece, lignes: S('1850', '2800', capitalFondation) },
    { date: '2026-02-02', piece: b3.piece, lignes: [D('1500', machines), D('1530', vehicule), C('1850', machines + vehicule)] },
    { date: '2026-02-02', piece: b4.piece, lignes: [D('1100', creances), C('1109', ducroireApport), C('1850', creances - ducroireApport)] },
    { date: '2026-02-02', piece: b5.piece, lignes: S('1200', '1850', stock) },
    { date: '2026-02-05', piece: b2.piece, lignes: S('1020', '1850', especes) },
    { date: '2026-02-20', piece: b6.piece, lignes: S('6550', '2000', b6.ttc) },
    { date: '2026-02-24', piece: b7.piece, lignes: S('6550', '1020', b7.total) },
    { date: '2026-02-26', piece: b8.piece, lignes: S('6550', '2000', b8.ttc) },
    { date: '2026-02-26', piece: b9.piece, lignes: S('6550', '1020', b9.total) },
    { date: '2026-03-20', piece: b10.piece, lignes: S('2000', '1020', b10.total) },
    { date: '2026-09-30', piece: b11.piece, lignes: S('1020', '1850', b11.total) },
  ],
);

// ─────────────────────────── Augmentation : Lémanbio SA ───────────────────────────
const lemanbio = { nom: 'Lémanbio SA', adresse: ['Route du Nant-d’Avril 150', '1217 Meyrin'] };
const compteLemanbio = 'CH84 0000 4471 9930 1145 0';
const nouvellesActions = 200;
const nominal = f(1000);
const prixEmission = f(1250);
const nominalAugmente = nouvellesActions * nominal;
const agio = nouvellesActions * (prixEmission - nominal);
const liberationPartielle = Math.round(nominalAugmente * 50 / 100) + agio;
const bons = 1000;
const nominalBon = f(100);
const prixBon = f(110);
const capitalBons = bons * nominalBon;
const agioBons = bons * (prixBon - nominalBon);

const l1 = noteInterne({
  emetteur: lemanbio, date: '2026-04-28', titre: "EXTRAIT DU PROCÈS-VERBAL DE L'ASSEMBLÉE GÉNÉRALE", numero: 'AG-2026',
  texte: [
    "L'assemblée générale décide d'augmenter le capital-actions de 500'000.00 à 700'000.00 par l'émission de 200 actions " +
      "nominatives de 1'000.00, au prix de 1'250.00 par action. Les actions doivent être libérées à 50 % au moins ; la " +
      'prime d’émission est payable immédiatement. Toutes les nouvelles actions ont été souscrites.',
  ],
  mentions: ['Pour extrait conforme : le président du conseil d’administration'],
});
const l2 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-05-15',
  operations: [
    { designation: 'Libération de 50 % du nominal des 200 nouvelles actions', montant: Math.round(nominalAugmente * 50 / 100) },
    { designation: 'Prime d’émission des 200 nouvelles actions', montant: agio },
  ] });
const l3 = facture({
  emetteur: notaire, destinataire: lemanbio, numero: 'N-2026-0611', date: '2026-05-20',
  articles: [{ designation: "Acte authentique de l'augmentation de capital, modification des statuts", prixUnitaire: f(2600) }],
  mentions: ['Payable à 30 jours.'],
});
const l4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-05-27',
  operations: [{ designation: 'Registre du commerce de Genève — émolument pour la modification du capital', montant: f(750) }] });
const l5 = facture({
  emetteur: { nom: 'Imprimerie des Délices', adresse: ['Rue des Délices 5', '1203 Genève'] }, destinataire: lemanbio,
  numero: 'ID-4471', date: '2026-05-29',
  articles: [{ designation: 'Impression des certificats d’actions et des bulletins de souscription', prixUnitaire: f(1200) }],
  mentions: ['Payable à 30 jours.'],
});
const l6 = noteInterne({
  emetteur: lemanbio, date: '2026-06-15', titre: "EXTRAIT DU PROCÈS-VERBAL DU CONSEIL D'ADMINISTRATION", numero: 'CA-2026-07',
  texte: [
    "Conformément à l'autorisation de l'assemblée générale, la société émet 1'000 bons de participation de 100.00 de " +
      'valeur nominale au prix de 110.00. Tous les bons ont été souscrits ce jour par des collaborateurs et des clients.',
  ],
});
const l7 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-06-30',
  operations: [{ designation: 'Libération intégrale des 1’000 bons de participation, prime comprise', montant: capitalBons + agioBons }] });
const l8 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-06-30',
  operations: [{ designation: 'Commission bancaire sur les opérations de capital', montant: f(560) }] });
const l9 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-06-19',
  operations: [
    { designation: 'Paiement à l’Étude de Me Ferrier — facture N-2026-0611', montant: l3.ttc },
    { designation: 'Paiement à l’Imprimerie des Délices — facture ID-4471', montant: l5.ttc },
  ] });
const l10 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: lemanbio, compte: compteLemanbio, date: '2026-11-30',
  operations: [{ designation: 'Libération du solde des 200 actions émises en mai, appelée par le conseil d’administration', montant: nominalAugmente - Math.round(nominalAugmente * 50 / 100) }] });

export const dossierLemanbio = construireDossier(
  {
    id: 'dossier-mp3-lemanbio-augmentation-capital',
    titre: 'Lémanbio SA — dossier de pièces, augmentation du capital',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 3,
    sujets: ['Augmentation du capital-actions avec prime d’émission', 'Libération partielle', 'Bons de participation', 'Frais d’augmentation (FAO)'],
    raisonSociale: 'Lémanbio SA',
    formeJuridique: 'SA',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "La TVA est laissée de côté. La prime d'émission (agio) va aux réserves légales issues du capital et doit être versée " +
      "entièrement dès la libération. Les frais d'augmentation de capital sont une charge. Les bons de participation ont " +
      'leurs propres comptes.',
    situation:
      "Lémanbio SA fabrique des produits d'entretien écologiques à Meyrin. Ses ventes ont doublé en trois ans et l'usine " +
      "est devenue trop petite : la société veut construire une nouvelle ligne de production.\n\n" +
      "Pour la financer sans trop s'endetter, l'assemblée générale décide d'émettre de nouvelles actions au-dessus de leur " +
      "valeur nominale. Le conseil d'administration propose aussi des bons de participation aux collaborateurs et aux " +
      'clients fidèles, qui recevront un dividende sans droit de vote.\n\n' +
      "Votre mission : comptabiliser l'augmentation du capital, sa libération, l'émission des bons de participation et " +
      'tous les frais liés, puis présenter les capitaux propres après ces opérations.',
    ouvertureActif: { '1020': f(180000), '1100': f(140000), '1200': f(95000), '1500': f(420000) },
    ouverturePassif: { '1509': f(150000), '2000': f(60000), '2400': f(50000), '2800': f(500000), '2950': f(40000), '2970': f(35000) },
  },
  [
    { date: '2026-04-28', piece: l1.piece, lignes: [D('1850', nominalAugmente + agio), C('2800', nominalAugmente), C('2900', agio)] },
    { date: '2026-05-15', piece: l2.piece, lignes: S('1020', '1850', liberationPartielle) },
    { date: '2026-05-20', piece: l3.piece, lignes: S('6550', '2000', l3.ttc) },
    { date: '2026-05-27', piece: l4.piece, lignes: S('6550', '1020', l4.total) },
    { date: '2026-05-29', piece: l5.piece, lignes: S('6550', '2000', l5.ttc) },
    { date: '2026-06-15', piece: l6.piece, lignes: [D('1860', capitalBons + agioBons), C('2810', capitalBons), C('2900', agioBons)] },
    { date: '2026-06-19', piece: l9.piece, lignes: S('2000', '1020', l9.total) },
    { date: '2026-06-30', piece: l7.piece, lignes: S('1020', '1860', l7.total) },
    { date: '2026-06-30', piece: l8.piece, lignes: S('6550', '1020', l8.total) },
    { date: '2026-11-30', piece: l10.piece, lignes: S('1020', '1850', l10.total) },
  ],
);
