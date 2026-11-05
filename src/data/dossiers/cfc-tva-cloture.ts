// Dossiers CFC : TVA (niveau 2), amortissements et transitoires (niveau 3). Entreprises fictives.
import { avisBancaire, facture, noteInterne, ticket } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S } from './outils';

// ─────────────────────────── Dossier 3 : Outils & Cie (TVA) ───────────────────────────
const outils = { nom: 'Outils & Cie', adresse: ['Rue de Lyon 77', '1203 Genève'] };
const compteOutils = 'CH37 0000 4471 5520 0912 4';
const helvetique = { nom: 'Outillage Helvétique SA', adresse: ['Industriestrasse 14', '2502 Bienne'] };

const d3p1 = facture({
  emetteur: helvetique, destinataire: outils, numero: 'OH-118842', date: '2026-01-06', tauxTva: 81,
  articles: [
    { designation: 'Perceuse-visseuse sans fil', quantite: 10, prixUnitaire: f(129) },
    { designation: 'Jeu de tournevis 12 pièces', quantite: 40, prixUnitaire: f(18.5) },
    { designation: 'Boîte de vis assorties', quantite: 100, prixUnitaire: f(2.7) },
  ],
  mentions: ['Payable à 30 jours net.'],
});
const d3p2 = ticket({
  emetteur: outils, date: '2026-01-10', titre: 'RAPPORT DE CAISSE — VENTES DU 05 AU 10.01', numero: 'Z-014', tauxTva: 81,
  articles: [
    { designation: 'Outillage à main', montant: f(1621.5) },
    { designation: 'Quincaillerie', montant: f(1080) },
    { designation: 'Peinture et accessoires', montant: f(541.5) },
  ],
  mentions: ['Encaissements en espèces.'],
});
const d3p3 = facture({
  emetteur: outils, destinataire: { nom: 'Menuiserie Duvoisin', adresse: ['Chemin du Pont-de-Ville 6', '1224 Chêne-Bougeries'] },
  numero: '2026-021', date: '2026-01-14', tauxTva: 81,
  articles: [
    { designation: 'Scie circulaire 1400 W', quantite: 4, prixUnitaire: f(245) },
    { designation: 'Lames de scie Ø 190 mm', quantite: 10, prixUnitaire: f(22) },
  ],
  mentions: ['Payable à 30 jours.', `IBAN ${compteOutils}`],
});
const d3p4 = facture({
  emetteur: { nom: 'Agencements Pro Sàrl', adresse: ['Route des Jeunes 33', '1227 Les Acacias'] }, destinataire: outils,
  numero: 'AP-0904', date: '2026-01-20', tauxTva: 81,
  articles: [{ designation: 'Étagères métalliques pour la surface de vente, montage compris', prixUnitaire: f(2500) }],
  mentions: ['Payable à 30 jours.'],
});
const d3p5 = facture({
  emetteur: { nom: 'Services énergétiques du Lac', adresse: ['Chemin du Château-Bloch 2', '1219 Le Lignon'] },
  destinataire: outils, numero: 'E-571903', date: '2026-01-31', tauxTva: 81,
  articles: [{ designation: 'Électricité, janvier 2026', prixUnitaire: f(230) }],
  mentions: ['Payable dans les 30 jours.'],
});
const d3p6 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: outils, compte: compteOutils, date: '2026-02-05',
  operations: [{ designation: 'Virement de Menuiserie Duvoisin — facture 2026-021', montant: d3p3.ttc }] });
const d3p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: outils, compte: compteOutils, date: '2026-02-12',
  operations: [{ designation: 'Paiement à Outillage Helvétique SA — facture OH-118842', montant: d3p1.ttc }] });
const d3p8 = facture({
  emetteur: outils, destinataire: { nom: 'Entreprise Jardins Verts', adresse: ['Route de Chancy 120', '1213 Onex'] },
  numero: '2026-034', date: '2026-02-20', tauxTva: 81,
  articles: [{ designation: 'Tondeuse à gazon thermique professionnelle', prixUnitaire: f(1850) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteOutils}`],
});
const d3p9 = ticket({
  emetteur: { nom: 'Bureau Express', adresse: ['Rue du Stand 40', '1204 Genève'] }, date: '2026-02-28', numero: '6017',
  tauxTva: 81, articles: [{ designation: "Papier pour imprimante et toner", montant: f(64.85) }], mentions: ['Payé en espèces.'],
});
const tvaDue3 = d3p2.tva + d3p3.tva + d3p8.tva;
const ipMarch3 = d3p1.tva;
const ipInv3 = d3p4.tva + d3p5.tva + d3p9.tva;
const solde3 = tvaDue3 - ipMarch3 - ipInv3;
const d3p10 = noteInterne({
  emetteur: outils, date: '2026-03-31', titre: 'NOTE INTERNE — DÉCOMPTE TVA', numero: 'NI-03',
  texte: [
    "Le décompte TVA du premier trimestre (méthode effective) est à établir au 31.03 d'après les comptes : virer l'impôt " +
      'préalable en diminution de la TVA due, puis virer le solde dû dans le compte de dette envers l’AFC.',
  ],
  mentions: ['Signé : L. Favre'],
});
const d3p11 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: outils, compte: compteOutils, date: '2026-04-30',
  operations: [{ designation: 'Administration fédérale des contributions — TVA 1er trimestre 2026', montant: solde3 }] });

export const dossierOutils = construireDossier(
  {
    id: 'dossier-cfc2-outils-et-cie-tva',
    titre: 'Outils & Cie — dossier de pièces, TVA du premier trimestre',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 2,
    sujets: ['TVA (méthode effective, au net)', 'Impôt préalable sur marchandises et sur investissements', 'Décompte et paiement de la TVA'],
    raisonSociale: 'Outils & Cie',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net, taux normal 8,1 %). L'impôt " +
      'préalable sur les marchandises et sur les investissements et autres charges est comptabilisé dans deux comptes distincts.',
    situation:
      "Outils & Cie est une quincaillerie de quartier de la rue de Lyon, reprise l'an dernier par Lucien Favre. Elle vend de " +
      "l'outillage, de la quincaillerie et de la peinture aux particuliers comme aux artisans de la région.\n\n" +
      "Le chiffre d'affaires dépasse largement 100'000 francs : l'entreprise est assujettie à la TVA. M. Favre a oublié le " +
      "dernier décompte et a reçu un rappel de l'Administration fédérale des contributions ; il veut que, cette fois, tout " +
      "soit en ordre.\n\n" +
      "Votre mission : comptabiliser les pièces du premier trimestre en séparant la TVA, établir le décompte TVA au 31 mars " +
      "et enregistrer son paiement.",
    ouvertureActif: { '1000': f(2500), '1020': f(30000), '1100': f(6000), '1200': f(24000), '1510': f(18000) },
    ouverturePassif: { '2000': f(8500), '2800': f(72000) },
  },
  [
    { date: '2026-01-06', piece: d3p1.piece, lignes: [D('4200', d3p1.ht), D('1170', d3p1.tva), C('2000', d3p1.ttc)] },
    { date: '2026-01-10', piece: d3p2.piece, lignes: [D('1000', d3p2.ttc), C('3200', d3p2.ht), C('2200', d3p2.tva)] },
    { date: '2026-01-14', piece: d3p3.piece, lignes: [D('1100', d3p3.ttc), C('3200', d3p3.ht), C('2200', d3p3.tva)] },
    { date: '2026-01-20', piece: d3p4.piece, lignes: [D('1510', d3p4.ht), D('1171', d3p4.tva), C('2000', d3p4.ttc)] },
    { date: '2026-01-31', piece: d3p5.piece, lignes: [D('6400', d3p5.ht), D('1171', d3p5.tva), C('2010', d3p5.ttc)] },
    { date: '2026-02-05', piece: d3p6.piece, lignes: S('1020', '1100', d3p6.total) },
    { date: '2026-02-12', piece: d3p7.piece, lignes: S('2000', '1020', d3p7.total) },
    { date: '2026-02-20', piece: d3p8.piece, lignes: [D('1100', d3p8.ttc), C('3200', d3p8.ht), C('2200', d3p8.tva)] },
    { date: '2026-02-28', piece: d3p9.piece, lignes: [D('6500', d3p9.ht), D('1171', d3p9.tva), C('1000', d3p9.ttc)] },
    { date: '2026-03-31', piece: d3p10.piece, lignes: [D('2200', tvaDue3), C('1170', ipMarch3), C('1171', ipInv3), C('2205', solde3)] },
    { date: '2026-04-30', piece: d3p11.piece, lignes: S('2205', '1020', solde3) },
  ],
);

// ─────────────────────────── Dossier 4 : Menuiserie Grandjean (amortissements) ───────────────────────────
const menuiserie = { nom: 'Menuiserie Grandjean', adresse: ['Chemin de la Scie 5', '1228 Plan-les-Ouates'] };
const compteMenuiserie = 'CH64 0000 4471 6618 3305 9';

const d4p1 = facture({
  emetteur: { nom: 'Machines Bois Suisse SA', adresse: ['Rue de l’Industrie 22', '1700 Fribourg'] }, destinataire: menuiserie,
  numero: 'MBS-26-031', date: '2026-01-15',
  articles: [{ designation: 'Raboteuse-dégauchisseuse, livraison et mise en service comprises', prixUnitaire: f(12000) }],
  mentions: ['Payable à 90 jours.'],
});
const d4p2 = facture({
  emetteur: menuiserie, destinataire: { nom: 'M. et Mme Lachat', adresse: ['Chemin des Vignes 8', '1255 Veyrier'] },
  numero: '2026-008', date: '2026-02-20',
  articles: [{ designation: 'Agencement de cuisine en chêne massif, fourniture et pose', prixUnitaire: f(18500) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteMenuiserie}`],
});
const d4p3 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: menuiserie, compte: compteMenuiserie, date: '2026-03-15',
  operations: [{ designation: 'Virement de Régie du Salève — facture 2025-091 du 10.12.2025', montant: f(12000) }] });
const d4p4 = facture({
  emetteur: { nom: 'Garage du Rhône Utilitaires', adresse: ['Route de Saint-Julien 150', '1228 Plan-les-Ouates'] },
  destinataire: menuiserie, numero: 'GU-4471', date: '2026-04-01',
  articles: [{ designation: 'Fourgon de livraison neuf, immatriculé GE 482 115', prixUnitaire: f(36000) }],
  mentions: ['Payable à 60 jours.'],
});
const d4p5 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: menuiserie, compte: compteMenuiserie, date: '2026-04-10',
  operations: [{ designation: 'Paiement à Machines Bois Suisse SA — facture MBS-26-031', montant: d4p1.ttc }] });
const d4p6 = facture({
  emetteur: { nom: 'Scierie du Jura', adresse: ['Grand-Rue 3', '2610 Saint-Imier'] }, destinataire: menuiserie,
  numero: 'SJ-2614', date: '2026-04-30',
  articles: [
    { designation: 'Planches de chêne (m³)', quantite: 4, prixUnitaire: f(1150) },
    { designation: 'Panneaux contreplaqués', quantite: 40, prixUnitaire: f(40) },
  ],
  mentions: ['Payable à 30 jours.'],
});
const d4p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: menuiserie, compte: compteMenuiserie, date: '2026-05-31',
  operations: [{ designation: "Loyer de l'atelier, mai", montant: f(2400) }] });
const d4p8 = noteInterne({
  emetteur: menuiserie, date: '2026-06-30', titre: "VENTE D'UN VÉHICULE", numero: 'NI-06',
  texte: [
    "Le fourgon GE 211 870, acheté 25'000.00 en 2022, a été vendu ce jour au Garage des Trois-Chênes. Les amortissements " +
      "cumulés sur ce véhicule s'élèvent à 18'000.00 (méthode indirecte). Le prix de vente a été crédité sur le compte bancaire.",
  ],
  lignes: [{ designation: 'Prix de vente encaissé par la banque', montant: f(8500) }],
  mentions: ['Signé : P. Grandjean'],
});
const amortMachines = f(9200); // 10 % de 92'000.00
const amortVehicules = f(14000); // 25 % de 56'000.00
const amortMobilier = f(2000); // 20 % de 10'000.00
const d4p9 = noteInterne({
  emetteur: menuiserie, date: '2026-12-31', titre: 'AMORTISSEMENT DES MACHINES', numero: 'NI-12a',
  texte: ['Amortir les machines de 10 % de leur valeur d’acquisition, pour l’année entière, y compris la raboteuse achetée en janvier. Méthode indirecte.'],
});
const d4p10 = noteInterne({
  emetteur: menuiserie, date: '2026-12-31', titre: 'AMORTISSEMENT DES VÉHICULES', numero: 'NI-12b',
  texte: [
    'Amortir les véhicules de 25 % de leur valeur comptable au 31.12 (valeur d’acquisition moins amortissements cumulés), ' +
      'sans prorata. Méthode indirecte.',
  ],
});
const d4p11 = noteInterne({
  emetteur: menuiserie, date: '2026-12-31', titre: 'AMORTISSEMENT DU MOBILIER', numero: 'NI-12c',
  texte: ['Amortir le mobilier de 20 % de sa valeur comptable. Méthode directe.'],
});

export const dossierMenuiserie = construireDossier(
  {
    id: 'dossier-cfc3-menuiserie-grandjean',
    titre: 'Menuiserie Grandjean — dossier de pièces, immobilisations et amortissements',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Achat et vente d’immobilisations', 'Amortissements (direct et indirect)', 'Linéaire et dégressif'],
    raisonSociale: 'Menuiserie Grandjean',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      'Pour ce dossier, la TVA est laissée de côté : les montants des pièces sont sans TVA. Les machines et les véhicules ' +
      "sont amortis selon la méthode indirecte, le mobilier selon la méthode directe. Le bénéfice sur la vente d'une " +
      'immobilisation est un produit exceptionnel.',
    situation:
      "La Menuiserie Grandjean fabrique des cuisines, des escaliers et des meubles sur mesure dans son atelier de " +
      "Plan-les-Ouates. Paul Grandjean y travaille avec deux menuisiers et un apprenti.\n\n" +
      "Cette année, l'entreprise renouvelle une partie de son parc : une nouvelle raboteuse et un fourgon neuf ; l'ancien " +
      "fourgon est revendu. M. Grandjean veut connaître la valeur réelle de ses machines et de ses véhicules dans le bilan.\n\n" +
      "Votre mission : comptabiliser les achats, la vente du fourgon et les opérations courantes, puis calculer et " +
      "comptabiliser les amortissements de fin d'année.",
    ouvertureActif: { '1020': f(40000), '1100': f(12000), '1500': f(80000), '1510': f(10000), '1530': f(45000) },
    ouverturePassif: { '1509': f(32000), '1539': f(18000), '2000': f(9000), '2400': f(30000), '2800': f(98000) },
    parametres: { comptesAjoutes: ['3410'] },
  },
  [
    { date: '2026-01-15', piece: d4p1.piece, lignes: S('1500', '2000', d4p1.ttc) },
    { date: '2026-02-20', piece: d4p2.piece, lignes: S('1100', '3410', d4p2.ttc) },
    { date: '2026-03-15', piece: d4p3.piece, lignes: S('1020', '1100', d4p3.total) },
    { date: '2026-04-01', piece: d4p4.piece, lignes: S('1530', '2000', d4p4.ttc) },
    { date: '2026-04-10', piece: d4p5.piece, lignes: S('2000', '1020', d4p5.total) },
    { date: '2026-04-30', piece: d4p6.piece, lignes: S('4200', '2000', d4p6.ttc) },
    { date: '2026-05-31', piece: d4p7.piece, lignes: S('6000', '1020', d4p7.total) },
    { date: '2026-06-30', piece: d4p8.piece, lignes: [D('1020', f(8500)), D('1539', f(18000)), C('1530', f(25000)), C('8510', f(1500))] },
    { date: '2026-12-31', piece: d4p9.piece, lignes: S('6800', '1509', amortMachines) },
    { date: '2026-12-31', piece: d4p10.piece, lignes: S('6800', '1539', amortVehicules) },
    { date: '2026-12-31', piece: d4p11.piece, lignes: S('6800', '1510', amortMobilier) },
  ],
);

// ─────────────────────────── Dossier 5 : École de langues Babel (transitoires) ───────────────────────────
const babel = { nom: 'École de langues Babel', adresse: ['Rue de la Servette 25', '1201 Genève'] };
const compteBabel = 'CH12 0000 4471 7706 4421 3';
const note = (date: string, numero: string, titre: string, texte: string) =>
  noteInterne({ emetteur: babel, date, numero, titre, texte: [texte], mentions: ['Signé : L. Rey'] });

const d5p1 = note('2026-01-01', 'NI-01', 'EXTOURNE — ACTIFS TRANSITOIRES',
  "Au 31.12.2025, une part de 600.00 de la prime d'assurance avait été portée en actifs transitoires (prime payée d'avance). Extourner cette écriture.");
const d5p2 = note('2026-01-01', 'NI-02', 'EXTOURNE — PASSIFS TRANSITOIRES',
  "Au 31.12.2025, l'électricité du 4e trimestre 2025, non encore facturée, avait été estimée à 1'200.00 et portée en passifs transitoires. Extourner cette écriture.");
const d5p3 = facture({
  emetteur: { nom: 'Services énergétiques du Lac', adresse: ['Chemin du Château-Bloch 2', '1219 Le Lignon'] },
  destinataire: babel, numero: 'E-560077', date: '2026-01-15',
  articles: [{ designation: 'Électricité, 4e trimestre 2025', prixUnitaire: f(1230) }],
  mentions: ["L'école n'est pas assujettie à la TVA : montant à comptabiliser tel quel.", 'Payable dans les 30 jours.'],
});
const d5p4 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: babel, compte: compteBabel, date: '2026-01-31',
  operations: [{ designation: 'Écolages de la session d’hiver (janvier–février), versements des élèves', montant: f(9600) }] });
const d5p5 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: babel, compte: compteBabel, date: '2026-03-01',
  operations: [{ designation: 'Régie Servette — loyer des nouveaux locaux, mars à août 2026', montant: f(4800) }] });
const d5p6 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: babel, compte: compteBabel, date: '2026-06-30',
  operations: [{ designation: 'Mutuelle Romande Assurances — prime choses et RC, du 01.07.2026 au 30.06.2027', montant: f(1200) }] });
const d5p7 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: babel, compte: compteBabel, date: '2026-09-01',
  operations: [{ designation: 'Régie Servette — loyer, septembre 2026 à février 2027', montant: f(4800) }] });
const d5p8 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: babel, compte: compteBabel, date: '2026-10-01',
  operations: [{ designation: 'Écolages des cours d’automne et d’hiver (octobre 2026 à mars 2027)', montant: f(12000) }] });
const d5p9 = note('2026-12-31', 'NI-12a', 'BOUCLEMENT — LOYER',
  'Le loyer versé le 01.09.2026 couvre la période de septembre 2026 à février 2027. Régulariser au 31.12.2026.');
const d5p10 = note('2026-12-31', 'NI-12b', 'BOUCLEMENT — ASSURANCE',
  'La prime versée le 30.06.2026 couvre la période du 01.07.2026 au 30.06.2027. Régulariser au 31.12.2026.');
const d5p11 = note('2026-12-31', 'NI-12c', 'BOUCLEMENT — ÉCOLAGES',
  'Les écolages encaissés le 01.10.2026 couvrent les cours d’octobre 2026 à mars 2027. Régulariser au 31.12.2026.');
const d5p12 = note('2026-12-31', 'NI-12d', 'BOUCLEMENT — ÉLECTRICITÉ',
  "La facture d'électricité du 4e trimestre 2026 arrivera en janvier ; son montant est estimé à 1'250.00. Régulariser au 31.12.2026.");

export const dossierBabel = construireDossier(
  {
    id: 'dossier-cfc3-ecole-babel-transitoires',
    titre: 'École de langues Babel — dossier de pièces, transitoires',
    niveau: 'CFC2',
    filiere: 'CFC',
    difficulte: 3,
    sujets: ['Actifs et passifs transitoires', 'Extourne au 1er janvier', "Rattachement des charges et des produits à l'exercice"],
    raisonSociale: 'École de langues Babel',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'école n'est pas assujettie à la TVA (l'enseignement est exclu du champ de l'impôt). Les écolages sont des " +
      'honoraires. Utilisez les comptes Actifs transitoires et Passifs transitoires.',
    situation:
      "L'École de langues Babel, dirigée par Laura Rey, propose des cours d'anglais, d'allemand et d'espagnol pour adultes. " +
      "Le 1er mars 2026, elle a déménagé dans des locaux plus grands à la Servette.\n\n" +
      "Une partie des charges et des produits ne coïncide pas avec l'année civile : les loyers sont payés par semestre, " +
      "l'assurance d'un 1er juillet à l'autre, et les élèves paient les cours d'automne et d'hiver dès le mois d'octobre.\n\n" +
      "Votre mission : extourner les régularisations de l'an dernier, comptabiliser les pièces de l'année, puis passer au " +
      "31 décembre les écritures qui rattachent chaque charge et chaque produit au bon exercice.",
    ouvertureActif: { '1020': f(25000), '1300': f(600), '1510': f(12000), '1521': f(6000) },
    ouverturePassif: { '2300': f(1200), '2800': f(42400) },
    parametres: { comptesAjoutes: ['3400'], comptesMasques: ['1200', '3200', '4200', '4280'] },
  },
  [
    { date: '2026-01-01', piece: d5p1.piece, lignes: S('6300', '1300', f(600)) },
    { date: '2026-01-01', piece: d5p2.piece, lignes: S('2300', '6400', f(1200)) },
    { date: '2026-01-15', piece: d5p3.piece, lignes: S('6400', '2010', d5p3.ttc) },
    { date: '2026-01-31', piece: d5p4.piece, lignes: S('1020', '3400', d5p4.total) },
    { date: '2026-03-01', piece: d5p5.piece, lignes: S('6000', '1020', d5p5.total) },
    { date: '2026-06-30', piece: d5p6.piece, lignes: S('6300', '1020', d5p6.total) },
    { date: '2026-09-01', piece: d5p7.piece, lignes: S('6000', '1020', d5p7.total) },
    { date: '2026-10-01', piece: d5p8.piece, lignes: S('1020', '3400', d5p8.total) },
    { date: '2026-12-31', piece: d5p9.piece, lignes: S('1300', '6000', f(1600)) },
    { date: '2026-12-31', piece: d5p10.piece, lignes: S('1300', '6300', f(600)) },
    { date: '2026-12-31', piece: d5p11.piece, lignes: S('3400', '2300', f(6000)) },
    { date: '2026-12-31', piece: d5p12.piece, lignes: S('6400', '2300', f(1250)) },
  ],
);
