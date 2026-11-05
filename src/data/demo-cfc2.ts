// Exercice de démonstration CFC 2 — entreprise fictive. À faire valider par l'enseignant.
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];
const D = (compte: string, francs: number) => ({ debit: compte, credit: null, montant: f(francs) });
const C = (compte: string, francs: number) => ({ debit: null, credit: compte, montant: f(francs) });

export const demoCfc2: Exercice = {
  id: 'demo-cfc2-papeterie-arve',
  titre: "Papeterie de l'Arve — exercice complet",
  niveau: 'CFC2',
  filiere: 'CFC',
  difficulte: 4,
  sujets: ["TVA", "Salaires", "Pertes sur créances", "Transitoires", "Amortissements", "Ducroire"],
  raisonSociale: "Papeterie de l'Arve",
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Marc Favre exploite en raison individuelle la Papeterie de l'Arve, à Carouge. L'entreprise est assujettie à la TVA " +
    '(méthode effective, comptabilisation au net, taux normal 8,1 %). Les amortissements sont comptabilisés selon la méthode ' +
    "indirecte. Passez au journal les écritures des opérations ci-dessous, en indiquant le numéro de l'opération comme " +
    'numéro de pièce. Arrondissez les montants de TVA et de salaire aux 5 centimes.',
  situation:
    "Vous êtes en deuxième année d'apprentissage d'employé·e de commerce à la Papeterie de l'Arve, à Carouge. Le magasin vend des fournitures scolaires et de bureau, du papier, des articles de dessin et quelques petits meubles de bureau, aussi bien à des particuliers qu'à des écoles et à des entreprises de la région.\n\n" +
    "Marc Favre, le propriétaire, exploite le commerce en raison individuelle. Il travaille avec une vendeuse, Inès, qui tient la caisse et passe les commandes auprès des fournisseurs. L'entreprise est assujettie à la TVA et possède du mobilier de magasin ainsi qu'une camionnette de livraison.\n\n" +
    "Marc vous a confié la comptabilité de l'année. Il attend de vous que vous comptabilisiez les achats, les ventes et les salaires avec la TVA, que vous établissiez le décompte de TVA et que vous passiez les écritures de fin d'année (amortissements, régularisations, ducroire) avant le bouclement.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Achat de marchandises à crédit : 10'000.00 + TVA 8,1 %." },
    { numero: '2', date: '2026-01-12', texte: "Vente de marchandises à crédit : 36'000.00 + TVA 8,1 %." },
    { numero: '3', date: '2026-01-20', texte: "Ventes au comptant de la semaine, TVA 8,1 % comprise : 5'405.00." },
    { numero: '4', date: '2026-01-31', texte: "Facture d'électricité payée par la banque, TVA 8,1 % comprise : 324.30." },
    { numero: '5', date: '2026-02-15', texte: "Paiement par la banque de la facture du fournisseur de l'opération 1." },
    {
      numero: '6',
      date: '2026-02-28',
      texte:
        "Salaire de février de l'employée, viré par la banque. Salaire brut 5'000.00 ; retenues : AVS/AI/APG/AC 6,4 %, LPP 4 %.",
    },
    {
      numero: '7',
      date: '2026-02-28',
      texte: "Cotisations de l'employeur sur le salaire de février : AVS/AI/APG/AC 6,4 %, LPP 4 %.",
    },
    { numero: '8', date: '2026-03-10', texte: 'Paiement par la banque de la totalité de la dette envers la caisse AVS.' },
    {
      numero: '9',
      date: '2026-03-31',
      texte:
        "Décompte de TVA du 1er trimestre : virez l'impôt préalable en diminution de la TVA due, puis virez le solde dans le compte de dette envers l'AFC.",
    },
    { numero: '10', date: '2026-04-15', texte: "Paiement par la banque du montant dû à l'AFC (opération 9)." },
    {
      numero: '11',
      date: '2026-05-20',
      texte: "Un client est déclaré en faillite ; sa créance de 2'160.00 est définitivement perdue (acte de défaut de biens).",
    },
    { numero: '12', date: '2026-06-30', texte: "Paiement par la banque de la prime annuelle d'assurance choses, 1'200.00, pour la période du 01.07.2026 au 30.06.2027." },
    { numero: '13', date: '2026-12-31', texte: "Bouclement : régularisez la part de la prime d'assurance (opération 12) qui concerne l'exercice suivant." },
    { numero: '14', date: '2026-12-31', texte: "Bouclement : le loyer de décembre, 2'000.00, n'a pas encore été payé." },
    {
      numero: '15',
      date: '2026-12-31',
      texte:
        "Amortissements : mobilier, 10 % linéaire de la valeur d'acquisition (30'000.00) ; véhicule, 25 % dégressif de la valeur comptable au 01.01.",
    },
    { numero: '16', date: '2026-12-31', texte: 'Ajustez le ducroire à 5 % des créances clients au 31.12.' },
  ],
  ouvertureActif: {
    '1000': f(2000),
    '1020': f(35000),
    '1100': f(18000),
    '1200': f(25000),
    '1510': f(30000),
    '1530': f(40000),
  },
  ouverturePassif: {
    '1109': f(900),
    '1519': f(12000),
    '1539': f(16000),
    '2000': f(14000),
    '2400': f(30000),
    '2800': f(77100),
  },
  mode: 'entrainement',
  parametres: {
    libellesT: 'SI/SF',
    modificationDirecte: false,
    modeBouclement: 'compteDeResultat',
    comptesAjoutes: [],
    comptesMasques: [],
    tvaMethode: 'net',
    ficheSalaire: true,
    calculatriceTva: false,
  },
  corrige: [
    { piece: '1', lignes: [D('4200', 10000), D('1170', 810), C('2000', 10810)] },
    { piece: '2', lignes: [D('1100', 38916), C('3200', 36000), C('2200', 2916)] },
    { piece: '3', lignes: [D('1000', 5405), C('3200', 5000), C('2200', 405)] },
    { piece: '4', lignes: [D('6400', 300), D('1171', 24.3), C('1020', 324.3)] },
    { piece: '5', lignes: s('2000', '1020', 10810) },
    { piece: '6', lignes: [D('5200', 5000), C('2170', 320), C('2171', 200), C('1020', 4480)] },
    { piece: '7', lignes: [D('5270', 520), C('2170', 320), C('2171', 200)] },
    { piece: '8', lignes: s('2170', '1020', 640) },
    { piece: '9', lignes: [D('2200', 3321), C('1170', 810), C('1171', 24.3), C('2205', 2486.7)] },
    { piece: '10', lignes: s('2205', '1020', 2486.7) },
    { piece: '11', lignes: s('3805', '1100', 2160) },
    { piece: '12', lignes: s('6300', '1020', 1200) },
    { piece: '13', lignes: s('1300', '6300', 600) },
    { piece: '14', lignes: s('6000', '2300', 2000) },
    { piece: '15', lignes: [D('6800', 9000), C('1519', 3000), C('1539', 6000)] },
    { piece: '16', lignes: s('3805', '1109', 1837.8) },
  ],
};
