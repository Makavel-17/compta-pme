// Dossiers MP : opérations financières et commerciales (niveau 1), clôture de l'entreprise individuelle (niveau 2).
// Entreprises fictives. Règles : monnaies étrangères et rémunération du propriétaire selon le cours (voir CLAUDE.md).
import { avisBancaire, facture, noteInterne } from '../../engine/pieces';
import { BANQUE, construireDossier, C, D, f, S, type TableauComplement } from './outils';

const cours = (x: number) => x.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.00');
/** Conversion en CHF, arrondie au centime : montant (centimes) × cours. */
const enChf = (centimes: number, taux: number) => Math.round(centimes * taux);

// ─────────────────────────── Dossier MP 1 : Terroirs du Monde (opérations financières et commerciales) ───────────────────────────
const terroirs = { nom: 'Terroirs du Monde', adresse: ['Rue de la Croix-d’Or 15', '1204 Genève'] };
const compteTerroirs = 'CH71 0000 4471 6203 1189 2';
const coursFacture = { eurAchat: 0.92, eurVente: 0.94 };
const coursPaiement = { eurAchat: 0.94, eurVente: 0.93 };

const m1p1 = facture({
  emetteur: { nom: 'Oleificio Val di Sole S.r.l.', adresse: ['Via dei Mulini 8', 'I-38027 Malè (TN)'] }, destinataire: terroirs,
  numero: 'VS-2026/0412', date: '2026-03-10', monnaie: 'EUR', titre: 'FATTURA / FACTURE',
  articles: [
    { designation: "Huile d'olive extra vierge, carton de 6 × 0,75 l", quantite: 200, prixUnitaire: f(28) },
    { designation: 'Vinaigre balsamique, carton de 6 × 0,25 l', quantite: 80, prixUnitaire: f(30) },
  ],
  mentions: [
    'Payable à 30 jours.',
    `Note du comptable : cours des devises du 10.03.2026, EUR achat ${cours(coursFacture.eurAchat)} / vente ${cours(coursFacture.eurVente)}.`,
  ],
});
const m1achat = enChf(m1p1.ttc, coursFacture.eurVente);
const m1p2 = facture({
  emetteur: { nom: 'Transports Rhône-Alpes Sàrl', adresse: ['Route de Meyrin 300', '1217 Meyrin'] }, destinataire: terroirs,
  numero: 'TRA-8841', date: '2026-03-12',
  articles: [{ designation: 'Transport depuis Malè (I), dédouanement compris, livraison du 12.03', prixUnitaire: f(380) }],
  mentions: ['Payable à 30 jours.'],
});
const m1p3 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-04-08',
  operations: [{ designation: `Paiement à Oleificio Val di Sole, facture VS-2026/0412 : EUR 8'000.00 au cours vente de ${cours(coursPaiement.eurVente)}`, montant: enChf(m1p1.ttc, coursPaiement.eurVente) }] });
const m1p4 = facture({
  emetteur: terroirs, destinataire: { nom: 'Épicerie Le Panier Savoyard', adresse: ['12 rue Carnot', 'F-74000 Annecy'] },
  numero: '2026-051', date: '2026-04-15', monnaie: 'EUR',
  articles: [
    { designation: 'Assortiment de fromages des Alpes (kg)', quantite: 150, prixUnitaire: f(32) },
    { designation: 'Chocolat artisanal, boîte de 250 g', quantite: 240, prixUnitaire: f(5) },
  ],
  mentions: [
    'Payable à 30 jours.',
    `Note du comptable : cours des devises du 15.04.2026, EUR achat ${cours(coursFacture.eurAchat)} / vente ${cours(coursFacture.eurVente)}.`,
  ],
});
const m1vente = enChf(m1p4.ttc, coursFacture.eurAchat);
const m1p5 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-05-12',
  operations: [{ designation: `Virement du Panier Savoyard, facture 2026-051 : EUR ${(m1p4.ttc / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'")} au cours achat de ${cours(coursPaiement.eurAchat)}`, montant: enChf(m1p4.ttc, coursPaiement.eurAchat) }] });
const m1p6 = facture({
  emetteur: { nom: 'Fromagerie de la Gruyère SA', adresse: ['Route de la Laiterie 3', '1663 Pringy'] }, destinataire: terroirs,
  numero: 'FG-55120', date: '2026-05-20',
  articles: [{ designation: 'Meules de gruyère AOP (kg)', quantite: 250, prixUnitaire: f(18) }],
  mentions: ['Payable à 30 jours, 2 % d’escompte à 10 jours.'],
});
const m1rabais = f(300);
const m1p7 = noteInterne({
  emetteur: { nom: 'Fromagerie de la Gruyère SA', adresse: ['Route de la Laiterie 3', '1663 Pringy'] }, destinataire: terroirs,
  date: '2026-05-24', titre: 'NOTE DE CRÉDIT', numero: 'NC-0931',
  texte: ['Suite à votre réclamation concernant deux meules abîmées pendant le transport, nous vous accordons un rabais sur la facture FG-55120.'],
  lignes: [{ designation: 'Rabais accordé', montant: m1rabais }],
  totaux: [{ libelle: 'En votre faveur', montant: m1rabais, fort: true }],
});
const m1dette = m1p6.ttc - m1rabais;
const m1escObt = Math.round(m1dette * 2 / 100);
const m1p8 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-05-29',
  operations: [{ designation: 'Paiement à Fromagerie de la Gruyère SA, facture FG-55120 sous déduction de la note de crédit NC-0931 et de 2 % d’escompte', montant: m1dette - m1escObt }] });
const m1p9 = facture({
  emetteur: terroirs, destinataire: { nom: 'Restaurant La Clémence', adresse: ['Place du Bourg-de-Four 20', '1204 Genève'] },
  numero: '2026-064', date: '2026-06-02',
  articles: [{ designation: 'Huile d’olive et vinaigres pour la cuisine (livraison du 02.06)', prixUnitaire: f(3000) }],
  mentions: ['Payable à 30 jours, 2 % d’escompte à 10 jours.', `IBAN ${compteTerroirs}`],
});
const m1escAcc = Math.round(m1p9.ttc * 2 / 100);
const m1p10 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-06-10',
  operations: [{ designation: 'Virement du Restaurant La Clémence, facture 2026-064, escompte de 2 % déduit', montant: m1p9.ttc - m1escAcc }] });
const m1intBrut = f(600);
const m1ia = Math.round(m1intBrut * 35 / 100);
const m1p11 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-06-30',
  operations: [
    { designation: 'Intérêts créditeurs bruts, compte de placement, 1er semestre', montant: m1intBrut },
    { designation: './. Impôt anticipé 35 %', montant: -m1ia },
  ] });
const m1p12 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: terroirs, compte: compteTerroirs, date: '2026-06-30',
  operations: [
    { designation: 'Intérêts débiteurs, crédit de stock, 1er semestre', montant: f(450) },
    { designation: 'Frais de tenue de compte et de virements', montant: f(30) },
  ] });

export const dossierTerroirs = construireDossier(
  {
    id: 'dossier-mp1-terroirs-du-monde',
    titre: 'Terroirs du Monde — dossier de pièces, opérations financières et commerciales',
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 1,
    sujets: ['Monnaies étrangères (achat et vente)', 'Frais d’achat, rabais et escomptes', 'Intérêts et impôt anticipé', 'Frais bancaires'],
    raisonSociale: 'Terroirs du Monde',
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "Pour ce dossier, la TVA est laissée de côté. Les pièces en euros se comptabilisent en francs au cours indiqué : cours " +
      "vente pour un paiement à l'étranger, cours achat pour un encaissement. La différence de change est passée dans le " +
      "compte de la marchandise. Les rabais et les escomptes ont leurs comptes de déductions.",
    situation:
      "Terroirs du Monde est une épicerie fine de la Vieille-Ville de Genève, tenue par Sophie Marchand. Elle importe des " +
      "huiles et des vinaigres d'Italie, revend des produits suisses à des restaurants genevois et livre depuis peu une " +
      "épicerie d'Annecy.\n\n" +
      "Avec les achats et les ventes en euros, Mme Marchand ne sait plus si elle gagne ou perd de l'argent sur le change. " +
      "Elle veut aussi profiter des escomptes de ses fournisseurs et comprendre les intérêts que lui verse ou lui prélève sa banque.\n\n" +
      "Votre mission : comptabiliser les pièces du premier semestre en francs suisses, en traitant correctement les " +
      'différences de change, les rabais, les escomptes et les intérêts.',
    ouvertureActif: { '1000': f(2000), '1020': f(30000), '1100': f(6000), '1200': f(15000) },
    ouverturePassif: { '2000': f(8000), '2800': f(45000) },
  },
  [
    { date: '2026-03-10', piece: m1p1.piece, lignes: S('4200', '2000', m1achat) },
    { date: '2026-03-12', piece: m1p2.piece, lignes: S('4270', '2000', m1p2.ttc) },
    { date: '2026-04-08', piece: m1p3.piece, lignes: [D('2000', m1achat), C('1020', m1p3.total), C('4200', m1achat - m1p3.total)] },
    { date: '2026-04-15', piece: m1p4.piece, lignes: S('1100', '3200', m1vente) },
    { date: '2026-05-12', piece: m1p5.piece, lignes: [D('1020', m1p5.total), C('1100', m1vente), C('3200', m1p5.total - m1vente)] },
    { date: '2026-05-20', piece: m1p6.piece, lignes: S('4200', '2000', m1p6.ttc) },
    { date: '2026-05-24', piece: m1p7.piece, lignes: S('2000', '4209', m1rabais) },
    { date: '2026-05-29', piece: m1p8.piece, lignes: [D('2000', m1dette), C('1020', m1p8.total), C('4209', m1escObt)] },
    { date: '2026-06-02', piece: m1p9.piece, lignes: S('1100', '3200', m1p9.ttc) },
    { date: '2026-06-10', piece: m1p10.piece, lignes: [D('1020', m1p10.total), D('3209', m1escAcc), C('1100', m1p9.ttc)] },
    { date: '2026-06-30', piece: m1p11.piece, lignes: [D('1020', m1p11.total), D('1176', m1ia), C('6950', m1intBrut)] },
    { date: '2026-06-30', piece: m1p12.piece, lignes: S('6900', '1020', m1p12.total) },
  ],
);

// ─────────────────────────── Dossier MP 2 : Atelier d'architecture Zufferey (clôture de l'entreprise individuelle) ───────────────────────────
const atelier = { nom: "Atelier d'architecture Zufferey", adresse: ['Boulevard des Philosophes 9', '1205 Genève'] };
const compteAtelier = 'CH43 0000 4471 8120 5530 6';
const noteZ = (date: string, numero: string, titre: string, texte: string, lignes?: { designation: string; montant: number }[]) =>
  noteInterne({ emetteur: atelier, date, numero, titre, texte: [texte], lignes, mentions: ['Signé : C. Zufferey'] });
const capitalOuverture = f(73000);

const m2p1 = noteZ('2026-11-30', 'NI-11', 'RÉCAPITULATIF DES HONORAIRES FACTURÉS',
  "Honoraires facturés aux clients du 1er janvier au 30 novembre 2026 (factures n° 2026-001 à 2026-047), à comptabiliser en une seule écriture.",
  [{ designation: 'Total des factures d’honoraires, janvier à novembre', montant: f(142000) }]);
const m2p2 = facture({
  emetteur: atelier, destinataire: { nom: 'Commune de Plan-les-Ouates', adresse: ['Route des Chevaliers-de-Malte 3', '1228 Plan-les-Ouates'] },
  numero: '2026-048', date: '2026-12-15',
  articles: [{ designation: 'Avant-projet de transformation de la salle communale, honoraires selon contrat', prixUnitaire: f(18000) }],
  mentions: ['Payable à 30 jours.', `IBAN ${compteAtelier}`],
});
const m2p3 = avisBancaire({ sens: 'credit', banque: BANQUE, titulaire: atelier, compte: compteAtelier, date: '2026-12-20',
  operations: [{ designation: 'Récapitulatif des paiements de clients reçus en 2026', montant: f(150000) }] });
const m2p4 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: atelier, compte: compteAtelier, date: '2026-12-20',
  operations: [{ designation: "Régie des Bastions — loyer des bureaux, janvier à décembre 2026", montant: f(24000) }] });
const m2p5 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: atelier, compte: compteAtelier, date: '2026-12-20',
  operations: [{ designation: 'Virements mensuels sur le compte personnel de M. Clément Zufferey, janvier à décembre (12 × 4’000.00)', montant: f(48000) }] });
const m2p6 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: atelier, compte: compteAtelier, date: '2026-09-30',
  operations: [{ designation: 'Administration fiscale cantonale — impôts personnels 2025 de M. Clément Zufferey', montant: f(6500) }] });
const m2p7 = facture({
  emetteur: { nom: 'Informatique Léman Sàrl', adresse: ['Rue de Lausanne 64', '1202 Genève'] }, destinataire: atelier,
  numero: 'IL-2026-377', date: '2026-10-05',
  articles: [{ designation: 'Station de travail pour dessin assisté par ordinateur, écran compris', prixUnitaire: f(3200) }],
  mentions: ['Payable à 30 jours.'],
});
const m2p8 = avisBancaire({ sens: 'debit', banque: BANQUE, titulaire: atelier, compte: compteAtelier, date: '2026-12-31',
  operations: [{ designation: 'Frais de tenue de compte et de cartes, année 2026', montant: f(120) }] });
const machinesFin = f(8000) + m2p7.ttc;
const amortMachines = Math.round(machinesFin * 25 / 100);
const m2p9 = noteZ('2026-12-31', 'NI-12a', 'AMORTISSEMENT DES MACHINES DE BUREAU',
  'Amortir les machines de bureau de 25 % de leur valeur comptable au 31.12, achat d’octobre compris, sans prorata. Méthode directe.');
const m2p10 = noteZ('2026-12-31', 'NI-12b', 'HONORAIRES À FACTURER',
  "Les plans d'exécution de la villa Morand sont terminés depuis le 20 décembre, mais la facture ne partira qu'en janvier. Les honoraires correspondants s'élèvent à 5'000.00 et appartiennent à l'exercice 2026.");
const salaireProprietaire = f(84000);
const m2p11 = noteZ('2026-12-31', 'NI-12c', 'SALAIRE DU PROPRIÉTAIRE',
  "Comptabiliser le salaire de M. Zufferey pour son travail dans l'atelier en 2026 : 7'000.00 par mois.");
const interetCapital = Math.round(capitalOuverture * 5 / 100);
const m2p12 = noteZ('2026-12-31', 'NI-12d', 'INTÉRÊT SUR LE CAPITAL',
  "Comptabiliser un intérêt de 5 % sur le capital investi par M. Zufferey, d'après le capital au 1er janvier 2026.");

export const dossierZufferey = construireDossier(
  {
    id: 'dossier-mp2-atelier-zufferey',
    titre: "Atelier d'architecture Zufferey — dossier de pièces, clôture de l'entreprise individuelle",
    niveau: 'MP',
    filiere: 'MP',
    difficulte: 2,
    sujets: ['Compte privé', 'Salaire du propriétaire et intérêt sur le capital', 'Écritures de fin d’exercice', "Bouclement et revenu de l'entrepreneur"],
    raisonSociale: "Atelier d'architecture Zufferey",
    formeJuridique: 'raison individuelle',
    debut: '2026-01-01',
    fin: '2026-12-31',
    introduction:
      "L'atelier n'est pas assujetti à la TVA pour ce dossier. Le salaire du propriétaire et l'intérêt sur son capital sont " +
      "des écritures internes : la contrepartie est le compte Privé. Terminez par les écritures de bouclement, puis calculez " +
      "le revenu de l'entrepreneur (salaire + intérêt + bénéfice).",
    situation:
      "Clément Zufferey dirige seul l'Atelier d'architecture Zufferey, à Plainpalais, depuis huit ans. Il conçoit des villas, des " +
      "transformations et quelques bâtiments publics pour les communes genevoises.\n\n" +
      "Chaque mois, il vire 4'000 francs sur son compte personnel et l'atelier paie parfois ses impôts. Son bénéfice lui " +
      "semble confortable, mais il ne s'est jamais versé de salaire : il veut savoir ce que son atelier gagne vraiment une " +
      "fois son propre travail et son capital rémunérés.\n\n" +
      "Votre mission : comptabiliser les pièces de l'année, passer les écritures de fin d'exercice, dont le salaire du " +
      "propriétaire et l'intérêt sur le capital, boucler les comptes et calculer le revenu de l'entrepreneur.",
    ouvertureActif: { '1020': f(40000), '1100': f(15000), '1510': f(12000), '1520': f(8000) },
    ouverturePassif: { '2000': f(2000), '2800': capitalOuverture },
    parametres: { comptesAjoutes: ['3400'], comptesMasques: ['1200', '3200', '4200', '4280'], corrigerBouclement: true },
  },
  [
    { date: '2026-09-30', piece: m2p6.piece, lignes: S('2850', '1020', m2p6.total) },
    { date: '2026-10-05', piece: m2p7.piece, lignes: S('1520', '2000', m2p7.ttc) },
    { date: '2026-11-30', piece: m2p1.piece, lignes: S('1100', '3400', f(142000)) },
    { date: '2026-12-15', piece: m2p2.piece, lignes: S('1100', '3400', m2p2.ttc) },
    { date: '2026-12-20', piece: m2p3.piece, lignes: S('1020', '1100', m2p3.total) },
    { date: '2026-12-20', piece: m2p4.piece, lignes: S('6000', '1020', m2p4.total) },
    { date: '2026-12-20', piece: m2p5.piece, lignes: S('2850', '1020', m2p5.total) },
    { date: '2026-12-31', piece: m2p8.piece, lignes: S('6900', '1020', m2p8.total) },
    { date: '2026-12-31', piece: m2p9.piece, lignes: S('6800', '1520', amortMachines) },
    { date: '2026-12-31', piece: m2p10.piece, lignes: S('1300', '3400', f(5000)) },
    { date: '2026-12-31', piece: m2p11.piece, lignes: S('5200', '2850', salaireProprietaire) },
    { date: '2026-12-31', piece: m2p12.piece, lignes: S('6900', '2850', interetCapital) },
  ],
);

// Corrigé complémentaire : revenu de l'entrepreneur (Zufferey).
const honorairesZ = f(142000) + m2p2.ttc + f(5000);
const chargesZ = m2p4.total + m2p8.total + amortMachines + salaireProprietaire + interetCapital;
const beneficeZ = honorairesZ - chargesZ;
const mZ = (c: number) => (c / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
export const complementZufferey: TableauComplement[] = [
  {
    titre: "Revenu de l'entrepreneur",
    entetes: ['Élément', 'Montant CHF'],
    lignes: [
      ['Salaire du propriétaire', mZ(salaireProprietaire)],
      ['+ Intérêt sur le capital', mZ(interetCapital)],
      ["+ Bénéfice de l'exercice", mZ(beneficeZ)],
      ["= Revenu de l'entrepreneur", mZ(salaireProprietaire + interetCapital + beneficeZ)],
    ],
  },
];
