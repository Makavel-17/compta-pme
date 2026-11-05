// Exercices PROPOSÉS (05.11.2026), à faire valider par l'enseignant avant usage en classe.
// Entreprises fictives, textes et montants originaux (aucune reprise des manuels E&S).
// Conventions d'écritures reprises des exercices de démonstration validés.
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];
const D = (compte: string, francs: number) => ({ debit: compte, credit: null, montant: f(francs) });
const C = (compte: string, francs: number) => ({ debit: null, credit: compte, montant: f(francs) });
const montants = (r: Record<string, number>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, f(v)]));

const parametresBase = {
  libellesT: 'SI/SF' as const,
  modificationDirecte: false,
  modeBouclement: 'compteDeResultat' as const,
  comptesAjoutes: [] as string[],
  comptesMasques: [] as string[],
};

const CONSIGNE =
  "Passez au journal les écritures des opérations ci-dessous, en indiquant le numéro de l'opération comme numéro de pièce.";

// ───────────────────────── 1. CFC 1 — commerce de détail ─────────────────────────
export const propBouquinerie: Exercice = {
  id: 'prop-cfc1-bouquinerie-du-bourg',
  titre: 'La Bouquinerie du Bourg — premier trimestre (proposé)',
  niveau: 'CFC1',
  filiere: 'CFC',
  difficulte: 1,
  chapitres: ["1 Structure du bilan et du résultat", "12 Comptabilité de l'entreprise commerciale", "35 Clôture des entreprises individuelles"],
  raisonSociale: 'La Bouquinerie du Bourg',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Julien Mottier exploite en raison individuelle la librairie La Bouquinerie du Bourg, à Nyon. Le bilan d'ouverture " +
    `au 01.01.2026 est déjà saisi. ${CONSIGNE} Il n'y a pas d'autre opération jusqu'au 31.12.2026 : bouclez ensuite ` +
    "l'exercice (vos écritures de bouclement sont corrigées).",
  situation:
    "Vous êtes apprenti·e employé·e de commerce en première année à La Bouquinerie du Bourg, une librairie indépendante " +
    "de la vieille ville de Nyon. On y trouve des romans, des bandes dessinées, des livres pour enfants et des ouvrages " +
    "sur la région ; la librairie fournit aussi des manuels à plusieurs écoles du district.\n\n" +
    "Le libraire, Julien Mottier, est le seul propriétaire de l'entreprise. Il travaille avec Mélanie, vendeuse à temps " +
    "partiel, qui accueille les clients et s'occupe des commandes spéciales. Julien préfère passer son temps à conseiller " +
    "les lecteurs plutôt qu'à faire les comptes.\n\n" +
    "Il vous remet les pièces du premier trimestre : factures du distributeur, tickets de caisse, relevés bancaires. " +
    "Il attend de vous un journal complet et juste, puis le bouclement de l'exercice, pour savoir si la librairie a " +
    "dégagé un bénéfice.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Achat de livres à crédit chez le distributeur, 7'200.00." },
    { numero: '2', date: '2026-01-09', texte: "Ventes au comptant des fêtes de fin d'année encaissées en caisse, 14'640.00." },
    { numero: '3', date: '2026-01-14', texte: "Vente à crédit de manuels à une école, 6'150.00." },
    { numero: '4', date: '2026-01-20', texte: "Versement de 6'000.00 de la caisse sur le compte bancaire." },
    { numero: '5', date: '2026-01-31', texte: "Paiement du loyer de janvier par la banque, 2'100.00." },
    { numero: '6', date: '2026-02-05', texte: "Un client paie par virement bancaire la facture qu'il devait au 01.01, 4'200.00." },
    { numero: '7', date: '2026-02-12', texte: "Paiement par la banque de toutes les dettes fournisseurs figurant au bilan d'ouverture, 9'800.00." },
    { numero: '8', date: '2026-02-18', texte: "Facture de téléphone et d'Internet payée par la banque, 185.00." },
    { numero: '9', date: '2026-02-28', texte: "Salaire de la vendeuse payé par la banque, 2'900.00." },
    { numero: '10', date: '2026-03-03', texte: "Julien Mottier paie avec la carte bancaire de l'entreprise une facture de dentiste personnelle, 640.00." },
    { numero: '11', date: '2026-03-10', texte: "Achat d'une étagère pour le magasin, 1'450.00 : 500.00 payés en espèces, le solde par la banque." },
    { numero: '12', date: '2026-03-20', texte: "Annonce publicitaire dans le journal local, payée par la banque, 380.00." },
    { numero: '13', date: '2026-03-25', texte: "Remboursement partiel de l'emprunt bancaire à long terme, par la banque, 4'000.00." },
    { numero: '14', date: '2026-03-28', texte: "Achat de livres à crédit chez le distributeur, 2'600.00." },
  ],
  ouvertureActif: montants({ '1000': 2500, '1020': 31000, '1100': 4200, '1200': 26000, '1510': 18000, '1521': 3500 }),
  ouverturePassif: montants({ '2000': 9800, '2400': 20000, '2800': 55400 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, corrigerBouclement: true },
  corrige: [
    { piece: '1', lignes: s('4200', '2000', 7200) },
    { piece: '2', lignes: s('1000', '3200', 14640) },
    { piece: '3', lignes: s('1100', '3200', 6150) },
    { piece: '4', lignes: s('1020', '1000', 6000) },
    { piece: '5', lignes: s('6000', '1020', 2100) },
    { piece: '6', lignes: s('1020', '1100', 4200) },
    { piece: '7', lignes: s('2000', '1020', 9800) },
    { piece: '8', lignes: s('6510', '1020', 185) },
    { piece: '9', lignes: s('5200', '1020', 2900) },
    { piece: '10', lignes: s('2850', '1020', 640) },
    { piece: '11', lignes: [D('1510', 1450), C('1000', 500), C('1020', 950)] },
    { piece: '12', lignes: s('6600', '1020', 380) },
    { piece: '13', lignes: s('2400', '1020', 4000) },
    { piece: '14', lignes: s('4200', '2000', 2600) },
  ],
};

// ───────────────────────── 2. CFC 1 — entreprise de services ─────────────────────────
export const propLumen: Exercice = {
  id: 'prop-cfc1-atelier-lumen',
  titre: 'Atelier Lumen — graphisme, premier trimestre (proposé)',
  niveau: 'CFC1',
  filiere: 'CFC',
  difficulte: 1,
  chapitres: ["1 Structure du bilan et du résultat", "35 Clôture des entreprises individuelles"],
  raisonSociale: 'Atelier Lumen',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Chloé Vuilleumier exploite en raison individuelle l'Atelier Lumen, un atelier de graphisme à Lancy. L'entreprise " +
    "vend des prestations de service, pas de marchandises : ses produits sont enregistrés dans le compte Honoraires. " +
    `${CONSIGNE} Il n'y a pas d'autre opération jusqu'au 31.12.2026 : bouclez ensuite l'exercice.`,
  situation:
    "Vous rejoignez l'Atelier Lumen pour votre stage de première année. L'atelier crée des logos, des affiches, des " +
    "brochures et des sites Internet pour des commerces, des associations et des communes du canton.\n\n" +
    "Chloé Vuilleumier, graphiste, a fondé l'atelier il y a cinq ans et l'exploite seule, en raison individuelle. Elle " +
    "fait parfois appel à Noah, photographe indépendant, pour les prises de vue. Elle se déplace beaucoup chez ses " +
    "clients avec sa voiture de société.\n\n" +
    "Une entreprise de services n'a ni stock ni achats de marchandises : ce qu'elle vend, c'est son travail. Chloé vous " +
    "demande de tenir la comptabilité du trimestre, de boucler l'exercice et de lui expliquer d'où vient son bénéfice.",
  operations: [
    { numero: '1', date: '2026-01-06', texte: "Facture envoyée à un client pour la création d'un logo, 3'800.00." },
    { numero: '2', date: '2026-01-10', texte: "Un client paie par la banque la facture qu'il devait au 01.01, 6'400.00." },
    { numero: '3', date: '2026-01-15', texte: "Paiement par le compte postal de l'autre dette figurant au bilan d'ouverture, 1'300.00." },
    { numero: '4', date: '2026-01-31', texte: "Loyer de l'atelier payé par la banque, 1'250.00." },
    { numero: '5', date: '2026-02-07', texte: "Honoraires pour une affiche, encaissés sur le compte postal, 950.00." },
    { numero: '6', date: '2026-02-14', texte: "Abonnement de téléphone et d'Internet payé par le compte postal, 160.00." },
    { numero: '7', date: '2026-02-20', texte: "Carburant et service de la voiture de société, payés par la banque, 420.00." },
    { numero: '8', date: '2026-03-03', texte: "Achat d'une imprimante grand format, payée par la banque, 2'200.00." },
    { numero: '9', date: '2026-03-12', texte: "Facture envoyée à une commune pour la mise en page de son journal, 5'600.00." },
    { numero: '10', date: '2026-03-18', texte: "Prime annuelle d'assurance responsabilité civile, payée par la banque, 540.00." },
    { numero: '11', date: '2026-03-25', texte: "Chloé Vuilleumier retire 1'500.00 du compte postal pour ses besoins privés." },
    { numero: '12', date: '2026-03-28', texte: "Remboursement partiel de l'emprunt bancaire à long terme, par la banque, 2'000.00." },
    { numero: '13', date: '2026-03-31', texte: "Fournitures de bureau payées par la banque, 230.00." },
  ],
  ouvertureActif: montants({ '1010': 2800, '1020': 15600, '1100': 6400, '1521': 9500, '1530': 14000 }),
  ouverturePassif: montants({ '2010': 1300, '2400': 12000, '2800': 35000 }),
  mode: 'entrainement',
  parametres: {
    ...parametresBase,
    corrigerBouclement: true,
    // Entreprise de services : Honoraires ajouté, comptes de marchandises retirés.
    comptesAjoutes: ['3400'],
    comptesMasques: ['1200', '3200', '4200', '4280'],
  },
  corrige: [
    { piece: '1', lignes: s('1100', '3400', 3800) },
    { piece: '2', lignes: s('1020', '1100', 6400) },
    { piece: '3', lignes: s('2010', '1010', 1300) },
    { piece: '4', lignes: s('6000', '1020', 1250) },
    { piece: '5', lignes: s('1010', '3400', 950) },
    { piece: '6', lignes: s('6510', '1010', 160) },
    { piece: '7', lignes: s('6200', '1020', 420) },
    { piece: '8', lignes: s('1521', '1020', 2200) },
    { piece: '9', lignes: s('1100', '3400', 5600) },
    { piece: '10', lignes: s('6300', '1020', 540) },
    { piece: '11', lignes: s('2850', '1010', 1500) },
    { piece: '12', lignes: s('2400', '1020', 2000) },
    { piece: '13', lignes: s('6500', '1020', 230) },
  ],
};

// ───────────────────────── 3. CFC 2 — TVA, un trimestre au net ─────────────────────────
export const propElectroSaleve: Exercice = {
  id: 'prop-cfc2-electro-saleve-tva',
  titre: 'Électro Salève — TVA du premier trimestre (proposé)',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 2,
  chapitres: ["14 Taxe sur la valeur ajoutée"],
  raisonSociale: 'Électro Salève',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Yves Pittet exploite en raison individuelle le magasin Électro Salève, à Thônex. L'entreprise est assujettie à la " +
    "TVA (méthode effective, comptabilisation au net, taux normal 8,1 %) et établit un décompte par trimestre. " +
    `${CONSIGNE} Les montants de TVA sont arrondis aux 5 centimes. Le loyer n'est pas soumis à la TVA.`,
  situation:
    "Vous êtes en deuxième année d'apprentissage chez Électro Salève, un magasin d'appareils électroménagers de Thônex : " +
    "lave-linge, réfrigérateurs, petits appareils de cuisine. Le magasin livre et installe les gros appareils chez ses " +
    "clients, particuliers et régies immobilières.\n\n" +
    "Le propriétaire, Yves Pittet, s'occupe des achats et des clients professionnels ; son installateur, Bastien, assure " +
    "les livraisons. Ce trimestre, l'entreprise a acheté une nouvelle camionnette de livraison.\n\n" +
    "Yves vous confie toute la TVA du premier trimestre : comptabiliser chaque opération en séparant la TVA, établir " +
    "le décompte au 31 mars et préparer le paiement à l'Administration fédérale des contributions.",
  operations: [
    { numero: '1', date: '2026-01-08', texte: "Paiement par la banque de la TVA du 4e trimestre 2025, due à l'AFC (bilan d'ouverture), 3'240.00." },
    { numero: '2', date: '2026-01-12', texte: "Achat de marchandises à crédit : 14'000.00 + TVA 8,1 %." },
    { numero: '3', date: '2026-01-19', texte: "Vente à crédit à une régie immobilière : 22'500.00 + TVA 8,1 %." },
    { numero: '4', date: '2026-01-26', texte: "Ventes au comptant de la semaine, TVA 8,1 % comprise : 7'567.00." },
    { numero: '5', date: '2026-01-31', texte: "Loyer du magasin payé par la banque, 2'800.00 (non soumis à la TVA)." },
    { numero: '6', date: '2026-02-10', texte: "Réparation de la vitrine payée par la banque : 650.00 + TVA 8,1 %." },
    { numero: '7', date: '2026-02-16', texte: "Achat d'une camionnette de livraison, payée par la banque : 32'000.00 + TVA 8,1 %." },
    { numero: '8', date: '2026-02-25', texte: "La régie immobilière de l'opération 3 paie sa facture par la banque." },
    { numero: '9', date: '2026-03-05', texte: "Paiement par la banque de la facture du fournisseur de l'opération 2." },
    { numero: '10', date: '2026-03-12', texte: "Vente à crédit : 18'000.00 + TVA 8,1 %." },
    { numero: '11', date: '2026-03-20', texte: "Facture d'électricité payée par la banque, TVA 8,1 % comprise : 540.50." },
    {
      numero: '12',
      date: '2026-03-31',
      texte:
        "Décompte de TVA du 1er trimestre : virez l'impôt préalable en diminution de la TVA due, puis virez le solde dans le compte de dette envers l'AFC.",
    },
    { numero: '13', date: '2026-04-15', texte: "Paiement par la banque du montant dû à l'AFC (opération 12)." },
  ],
  ouvertureActif: montants({ '1000': 1800, '1020': 42000, '1100': 12500, '1200': 38000, '1510': 24000, '1530': 30000 }),
  ouverturePassif: montants({ '2000': 16300, '2205': 3240, '2400': 40000, '2800': 88760 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, tvaMethode: 'net', ficheSalaire: false, calculatriceTva: false },
  corrige: [
    { piece: '1', lignes: s('2205', '1020', 3240) },
    { piece: '2', lignes: [D('4200', 14000), D('1170', 1134), C('2000', 15134)] },
    { piece: '3', lignes: [D('1100', 24322.5), C('3200', 22500), C('2200', 1822.5)] },
    { piece: '4', lignes: [D('1000', 7567), C('3200', 7000), C('2200', 567)] },
    { piece: '5', lignes: s('6000', '1020', 2800) },
    { piece: '6', lignes: [D('6100', 650), D('1171', 52.65), C('1020', 702.65)] },
    { piece: '7', lignes: [D('1530', 32000), D('1171', 2592), C('1020', 34592)] },
    { piece: '8', lignes: s('1020', '1100', 24322.5) },
    { piece: '9', lignes: s('2000', '1020', 15134) },
    { piece: '10', lignes: [D('1100', 19458), C('3200', 18000), C('2200', 1458)] },
    { piece: '11', lignes: [D('6400', 500), D('1171', 40.5), C('1020', 540.5)] },
    { piece: '12', lignes: [D('2200', 3847.5), C('1170', 1134), C('1171', 2685.15), C('2205', 28.35)] },
    { piece: '13', lignes: s('2205', '1020', 28.35) },
  ],
};

// ───────────────────── 4. CFC 2 — amortissements et transitoires ─────────────────────
export const propImprimerie: Exercice = {
  id: 'prop-cfc2-imprimerie-mandement',
  titre: 'Imprimerie du Mandement — amortissements et transitoires (proposé)',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  chapitres: ["23 Amortissements", "24 Comptes de régularisation/provision"],
  raisonSociale: 'Imprimerie du Mandement',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Pascale Dufour exploite en raison individuelle l'Imprimerie du Mandement, à Satigny. L'entreprise n'est pas " +
    "assujettie à la TVA. Les machines et les véhicules sont amortis selon la méthode indirecte, le mobilier selon la " +
    `méthode directe. ${CONSIGNE} Commencez par extourner, au 01.01, les régularisations de l'exercice précédent.`,
  situation:
    "Vous êtes en deuxième année d'apprentissage à l'Imprimerie du Mandement, une petite imprimerie de Satigny qui " +
    "imprime des cartes de visite, des faire-part, des étiquettes de vin pour les caves de la région et des flyers pour " +
    "les associations.\n\n" +
    "Pascale Dufour, imprimeuse de métier, dirige l'entreprise qu'elle exploite en raison individuelle. Elle travaille " +
    "avec Hugo, conducteur de presse. Cette année, elle a acheté une nouvelle machine d'impression numérique.\n\n" +
    "Pascale vous confie les écritures de l'année, et surtout celles de fin d'exercice : extourner les régularisations " +
    "de l'an dernier, rattacher chaque charge au bon exercice et calculer les amortissements de chaque immobilisation.",
  operations: [
    { numero: '1', date: '2026-01-01', texte: "Extourne de l'actif transitoire au 31.12.2025 : prime d'assurance payée d'avance, 1'200.00." },
    { numero: '2', date: '2026-01-01', texte: "Extourne du passif transitoire au 31.12.2025 : électricité de décembre 2025 à payer, 900.00." },
    { numero: '3', date: '2026-01-20', texte: "Paiement par la banque de la facture d'électricité d'octobre à décembre 2025, 2'700.00." },
    { numero: '4', date: '2026-04-01', texte: "Achat d'une machine d'impression numérique, payée par la banque, 24'000.00." },
    { numero: '5', date: '2026-05-15', texte: "Vente à crédit d'étiquettes et d'imprimés, 46'000.00." },
    { numero: '6', date: '2026-06-30', texte: "Encaissement par la banque des créances clients figurant au bilan d'ouverture, 9'000.00." },
    { numero: '7', date: '2026-09-10', texte: "Vente d'imprimés encaissée par la banque, 8'500.00." },
    { numero: '8', date: '2026-10-01', texte: "Paiement par la banque du loyer d'un dépôt pour six mois, du 01.10.2026 au 31.03.2027, 3'600.00." },
    { numero: '9', date: '2026-12-31', texte: "Régularisez la part du loyer du dépôt (opération 8) qui concerne l'exercice 2027." },
    { numero: '10', date: '2026-12-31', texte: "Une réparation de la presse effectuée en décembre, 750.00, n'est pas encore facturée." },
    {
      numero: '11',
      date: '2026-12-31',
      texte:
        "Amortissement des machines : 10 % linéaire de la valeur d'acquisition, prorata temporis pour la machine achetée le 01.04 (opération 4).",
    },
    { numero: '12', date: '2026-12-31', texte: 'Amortissement du mobilier : 20 % dégressif de la valeur comptable au 01.01.' },
    { numero: '13', date: '2026-12-31', texte: 'Amortissement des véhicules : 25 % dégressif de la valeur comptable au 01.01.' },
  ],
  ouvertureActif: montants({ '1020': 28000, '1100': 9000, '1300': 1200, '1500': 80000, '1510': 12000, '1530': 36000 }),
  ouverturePassif: montants({ '1509': 32000, '1539': 9000, '2000': 7500, '2300': 900, '2400': 50000, '2800': 66800 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, tvaMethode: 'net', ficheSalaire: false, calculatriceTva: false },
  corrige: [
    { piece: '1', lignes: s('6300', '1300', 1200) },
    { piece: '2', lignes: s('2300', '6400', 900) },
    { piece: '3', lignes: s('6400', '1020', 2700) },
    { piece: '4', lignes: s('1500', '1020', 24000) },
    { piece: '5', lignes: s('1100', '3200', 46000) },
    { piece: '6', lignes: s('1020', '1100', 9000) },
    { piece: '7', lignes: s('1020', '3200', 8500) },
    { piece: '8', lignes: s('6000', '1020', 3600) },
    { piece: '9', lignes: s('1300', '6000', 1800) },
    { piece: '10', lignes: s('6100', '2300', 750) },
    { piece: '11', lignes: s('6800', '1509', 9800) },
    { piece: '12', lignes: s('6800', '1510', 2400) },
    { piece: '13', lignes: s('6800', '1539', 6750) },
  ],
};

// ───────────────── 5. CFC 2 — pertes sur créances, créances douteuses, ducroire ─────────────────
export const propSportEvasion: Exercice = {
  id: 'prop-cfc2-sport-evasion-creances',
  titre: 'Sport-Évasion — créances, pertes et ducroire (proposé)',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  chapitres: ["22 Pertes sur créances", "24 Comptes de régularisation/provision"],
  raisonSociale: 'Sport-Évasion',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Nathalie Girod exploite en raison individuelle le magasin Sport-Évasion, à Meyrin. L'entreprise n'est pas " +
    `assujettie à la TVA. ${CONSIGNE} Le ducroire est ajusté chaque année à 5 % des créances clients au 31.12.`,
  situation:
    "Vous êtes en deuxième année d'apprentissage chez Sport-Évasion, un magasin d'articles de sport de Meyrin qui équipe " +
    "aussi des clubs : maillots, ballons, matériel de ski et de randonnée. Les clubs et les écoles achètent souvent à " +
    "crédit, avec un délai de paiement de 30 jours.\n\n" +
    "La propriétaire, Nathalie Girod, exploite le magasin en raison individuelle. Elle travaille avec Damien, vendeur " +
    "spécialisé en ski. Cette année, plusieurs clients ont eu des difficultés à payer, et l'un d'eux a fait faillite.\n\n" +
    "Nathalie vous demande de suivre les créances de près : enregistrer les pertes définitives, isoler les créances " +
    "douteuses, comptabiliser les montants récupérés et ajuster le ducroire au bouclement.",
  operations: [
    { numero: '1', date: '2026-02-15', texte: "Le club de volley Les Aigles est déclaré en faillite : sa créance de 1'800.00 est définitivement perdue." },
    { numero: '2', date: '2026-03-10', texte: "L'école de ski Altitude a de graves difficultés financières : sa créance de 3'200.00 devient douteuse." },
    { numero: '3', date: '2026-04-05', texte: "Encaissement par la banque de créances clients, 21'000.00." },
    { numero: '4', date: '2026-05-20', texte: "Ventes de marchandises à crédit, 38'000.00." },
    { numero: '5', date: '2026-06-12', texte: "Un ancien client verse par la banque 450.00 sur une créance amortie comme perte en 2024." },
    { numero: '6', date: '2026-06-30', texte: "Achats de marchandises à crédit, 15'000.00." },
    {
      numero: '7',
      date: '2026-09-15',
      texte:
        "L'école de ski Altitude (opération 2) verse 1'200.00 par la banque pour solde de tout compte ; le reste de sa créance est définitivement perdu.",
    },
    { numero: '8', date: '2026-10-30', texte: "Encaissement par la banque de créances clients, 26'000.00." },
    { numero: '9', date: '2026-11-20', texte: "Paiement par la banque de dettes fournisseurs, 21'000.00." },
    { numero: '10', date: '2026-12-31', texte: 'Ajustez le ducroire à 5 % des créances clients au 31.12.' },
  ],
  ouvertureActif: montants({ '1020': 22000, '1100': 34000, '1200': 20000, '1510': 15000 }),
  ouverturePassif: montants({ '1109': 1700, '2000': 6000, '2800': 83300 }),
  mode: 'entrainement',
  parametres: { ...parametresBase, tvaMethode: 'net', ficheSalaire: false, calculatriceTva: false },
  corrige: [
    { piece: '1', lignes: s('3805', '1100', 1800) },
    { piece: '2', lignes: s('1108', '1100', 3200) },
    { piece: '3', lignes: s('1020', '1100', 21000) },
    { piece: '4', lignes: s('1100', '3200', 38000) },
    { piece: '5', lignes: s('1020', '8510', 450) },
    { piece: '6', lignes: s('4200', '2000', 15000) },
    { piece: '7', lignes: [D('1020', 1200), D('3805', 2000), C('1108', 3200)] },
    { piece: '8', lignes: s('1020', '1100', 26000) },
    { piece: '9', lignes: s('2000', '1020', 21000) },
    { piece: '10', lignes: s('1109', '3805', 700) },
  ],
};

// ───────────────────────── 6. CFC 2 — salaires ─────────────────────────
export const propJardinsMorel: Exercice = {
  id: 'prop-cfc2-jardins-morel-salaires',
  titre: 'Jardins Morel — salaires du premier trimestre (proposé)',
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 3,
  chapitres: ["25 Décompte de salaire"],
  raisonSociale: 'Jardins Morel',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Thierry Morel exploite en raison individuelle l'entreprise de paysagisme Jardins Morel, à Bernex. L'entreprise " +
    "n'est pas assujettie à la TVA. Elle emploie Kevin, jardinier (salaire brut 5'400.00 par mois), et Sofia, employée " +
    "de bureau à mi-temps (salaire brut 2'600.00 par mois). Retenues sur les salaires : AVS/AI/APG/AC 6,4 % ; LPP selon " +
    "le certificat de la caisse de pension, Kevin 210.00 et Sofia 95.00 par mois. L'employeur verse les mêmes montants " +
    `que les employés (AVS/AI/APG/AC 6,4 % et LPP). ${CONSIGNE} Les montants sont arrondis aux 5 centimes.`,
  situation:
    "Vous êtes en deuxième année d'apprentissage chez Jardins Morel, une entreprise de paysagisme de Bernex qui crée et " +
    "entretient des jardins pour des particuliers, des copropriétés et des communes : tonte, taille des haies, " +
    "plantations, aménagement de terrasses.\n\n" +
    "Thierry Morel, paysagiste, exploite l'entreprise en raison individuelle. Kevin, jardinier, travaille avec lui sur " +
    "les chantiers ; Sofia, employée de bureau à mi-temps, établit les devis et les factures. C'est vous qui préparez " +
    "désormais les salaires.\n\n" +
    "Chaque fin de mois, vous calculez le salaire net de chaque employé, comptabilisez les salaires et les charges " +
    "sociales de l'employeur, puis vous réglez les assurances sociales. Thierry tient à ce que chaque franc retenu sur " +
    "les salaires soit bien reversé à la bonne assurance.",
  operations: [
    { numero: '1', date: '2026-01-10', texte: "Paiement par la banque de la dette envers la caisse AVS figurant au bilan d'ouverture, 2'100.00." },
    { numero: '2', date: '2026-01-15', texte: "Kevin reçoit une avance sur salaire de 500.00, virée par la banque ; elle sera déduite de son salaire de février." },
    { numero: '3', date: '2026-01-31', texte: 'Salaires de janvier de Kevin et de Sofia : comptabilisez les retenues et le versement des salaires nets par la banque.' },
    { numero: '4', date: '2026-01-31', texte: "Cotisations de l'employeur sur les salaires de janvier (AVS/AI/APG/AC et LPP)." },
    { numero: '5', date: '2026-02-10', texte: 'Paiement par la banque des cotisations AVS/AI/APG/AC de janvier (employés et employeur).' },
    { numero: '6', date: '2026-02-28', texte: "Salaires de février, comme en janvier ; l'avance de Kevin (opération 2) est déduite de son salaire net." },
    { numero: '7', date: '2026-02-28', texte: "Cotisations de l'employeur sur les salaires de février." },
    { numero: '8', date: '2026-03-10', texte: 'Paiement par la banque des cotisations AVS/AI/APG/AC de février (employés et employeur).' },
    { numero: '9', date: '2026-03-15', texte: "Factures d'entretien de jardins du trimestre, envoyées aux clients, 38'500.00." },
    { numero: '10', date: '2026-03-31', texte: "Salaires de mars ; Kevin reçoit en plus une prime de 600.00, soumise aux mêmes retenues AVS/AI/APG/AC." },
    { numero: '11', date: '2026-03-31', texte: "Cotisations de l'employeur sur les salaires de mars." },
    { numero: '12', date: '2026-03-31', texte: 'Paiement par la banque des cotisations LPP du trimestre à la caisse de pension (employés et employeur).' },
  ],
  ouvertureActif: montants({ '1020': 48000, '1100': 15000, '1500': 22000, '1530': 28000 }),
  ouverturePassif: montants({ '2000': 3500, '2170': 2100, '2400': 30000, '2800': 77400 }),
  mode: 'entrainement',
  parametres: {
    ...parametresBase,
    tvaMethode: 'net',
    ficheSalaire: true,
    calculatriceTva: false,
    comptesAjoutes: ['3410'],
  },
  corrige: [
    { piece: '1', lignes: s('2170', '1020', 2100) },
    { piece: '2', lignes: s('1140', '1020', 500) },
    { piece: '3', lignes: [D('5200', 8000), C('2170', 512), C('2171', 305), C('1020', 7183)] },
    { piece: '4', lignes: [D('5270', 817), C('2170', 512), C('2171', 305)] },
    { piece: '5', lignes: s('2170', '1020', 1024) },
    { piece: '6', lignes: [D('5200', 8000), C('2170', 512), C('2171', 305), C('1140', 500), C('1020', 6683)] },
    { piece: '7', lignes: [D('5270', 817), C('2170', 512), C('2171', 305)] },
    { piece: '8', lignes: s('2170', '1020', 1024) },
    { piece: '9', lignes: s('1100', '3410', 38500) },
    { piece: '10', lignes: [D('5200', 8600), C('2170', 550.4), C('2171', 305), C('1020', 7744.6)] },
    { piece: '11', lignes: [D('5270', 855.4), C('2170', 550.4), C('2171', 305)] },
    { piece: '12', lignes: s('2171', '1020', 1830) },
  ],
};

// ───────────── 7. MP — SA : répartition avec perte reportée, titres, provisions ─────────────
export const propNovaterm: Exercice = {
  id: 'prop-mp-novaterm-sa',
  titre: 'Novaterm SA — répartition, titres et provisions (proposé)',
  niveau: 'MP',
  filiere: 'MP',
  difficulte: 1,
  chapitres: ["24 Comptes de régularisation/provision", "36 Clôture des sociétés anonymes", "54 Les titres"],
  raisonSociale: 'Novaterm SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Novaterm SA, à Plan-les-Ouates, installe des systèmes de chauffage. Son capital-actions de 500'000.00 est " +
    "entièrement libéré. L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net, taux normal " +
    "8,1 %) et amortit ses machines selon la méthode indirecte. Le compte 2970 contient le bénéfice de l'exercice 2025 " +
    `(120'000.00) diminué de la perte reportée des exercices antérieurs (30'000.00). ${CONSIGNE} Remplissez aussi la ` +
    'fiche « Répartition du bénéfice ».',
  situation:
    "Vous effectuez votre stage de maturité professionnelle au service comptable de Novaterm SA, une société anonyme de " +
    "Plan-les-Ouates qui conçoit et installe des pompes à chaleur et des chauffages pour des immeubles et des villas. " +
    "Après deux années difficiles, la société a renoué avec le bénéfice en 2025.\n\n" +
    "Vous êtes rattaché·e à Karim Haddad, responsable financier, qui prépare l'assemblée générale d'avril et suit les " +
    "placements de trésorerie. Le conseil d'administration souhaite à la fois verser un dividende aux actionnaires et " +
    "renforcer les réserves.\n\n" +
    "Votre mission : comptabiliser la répartition du bénéfice décidée par l'assemblée générale, en tenant compte de la " +
    "perte reportée, le paiement des dividendes et de l'impôt anticipé, les opérations sur titres, puis les provisions " +
    "et les amortissements de fin d'exercice.",
  operations: [
    {
      numero: '1',
      date: '2026-04-20',
      texte:
        "L'assemblée générale approuve la répartition du bénéfice 2025 : attribution légale à la réserve issue du bénéfice " +
        "(art. 672 CO, après compensation de la perte reportée), dividende de 10 % du capital-actions, attribution de " +
        "20'000.00 aux réserves libres ; le solde reste reporté.",
    },
    { numero: '2', date: '2026-04-25', texte: "Paiement des dividendes aux actionnaires par la banque, déduction faite de l'impôt anticipé de 35 %." },
    { numero: '3', date: '2026-05-25', texte: "Versement par la banque de l'impôt anticipé retenu à l'Administration fédérale des contributions." },
    { numero: '4', date: '2026-05-31', texte: "Encaissement par la banque des créances clients figurant au bilan d'ouverture, 140'000.00." },
    { numero: '5', date: '2026-06-10', texte: "Achat de 500 actions cotées au cours de 64.00, plus 240.00 de courtage et de frais, payés par la banque (placement à court terme)." },
    { numero: '6', date: '2026-06-20', texte: "Ces actions rapportent un dividende brut de 2.50 par action, crédité en banque sous déduction de l'impôt anticipé de 35 %." },
    { numero: '7', date: '2026-07-15', texte: "Facturation de l'installation d'un chauffage dans un immeuble, à crédit : 180'000.00 + TVA 8,1 %." },
    { numero: '8', date: '2026-09-30', texte: "La banque débite l'intérêt annuel de 2,5 % sur l'emprunt bancaire à long terme de 100'000.00." },
    { numero: '9', date: '2026-12-31', texte: "Au 31.12, les actions de l'opération 5 cotent 60.00 : ajustez leur valeur au bilan." },
    { numero: '10', date: '2026-12-31', texte: "Constitution d'une provision de 12'000.00 pour la révision d'une machine prévue en mars 2027." },
    { numero: '11', date: '2026-12-31', texte: "Constitution d'une provision de 9'000.00 pour les impôts sur le bénéfice de l'exercice." },
    { numero: '12', date: '2026-12-31', texte: "Amortissement des machines : 10 % linéaire de la valeur d'acquisition (400'000.00)." },
  ],
  ouvertureActif: montants({ '1020': 220000, '1100': 140000, '1200': 160000, '1500': 400000 }),
  ouverturePassif: montants({ '1509': 120000, '2000': 70000, '2400': 100000, '2800': 500000, '2950': 40000, '2970': 90000 }),
  mode: 'entrainement',
  parametres: {
    ...parametresBase,
    tvaMethode: 'net',
    ficheSalaire: false,
    calculatriceTva: false,
    repartition: {
      benefice: f(120000),
      reporte: f(-30000),
      capital: f(500000),
      reserveLegaleCapital: 0,
      reserveLegaleBenefice: f(40000),
      holding: false,
      tauxDividende: 1000,
      tantiemes: 0,
      reservesLibres: f(20000),
    },
  },
  corrige: [
    { piece: '1', lignes: [D('2970', 74500), C('2950', 4500), C('2230', 50000), C('2960', 20000)] },
    { piece: '2', lignes: [D('2230', 50000), C('1020', 32500), C('2205', 17500)] },
    { piece: '3', lignes: s('2205', '1020', 17500) },
    { piece: '4', lignes: s('1020', '1100', 140000) },
    { piece: '5', lignes: [D('1060', 32000), D('6900', 240), C('1020', 32240)] },
    { piece: '6', lignes: [D('1020', 812.5), D('1176', 437.5), C('6950', 1250)] },
    { piece: '7', lignes: [D('1100', 194580), C('3200', 180000), C('2200', 14580)] },
    { piece: '8', lignes: s('6900', '1020', 2500) },
    { piece: '9', lignes: s('6900', '1060', 2000) },
    { piece: '10', lignes: s('6100', '2600', 12000) },
    { piece: '11', lignes: s('8900', '2640', 9000) },
    { piece: '12', lignes: s('6800', '1509', 40000) },
  ],
};

export const exercicesProposes: Exercice[] = [
  propBouquinerie,
  propLumen,
  propElectroSaleve,
  propImprimerie,
  propSportEvasion,
  propJardinsMorel,
  propNovaterm,
];
