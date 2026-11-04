// Exercice de démonstration CFC 1 — entreprise fictive.
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];

export const demoCfc1: Exercice = {
  id: 'demo-cfc1-cycles-du-leman',
  titre: 'Cycles du Léman — premier trimestre',
  niveau: 'CFC1',
  raisonSociale: 'Cycles du Léman',
  formeJuridique: 'raison individuelle',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Sandra Rochat exploite en raison individuelle le magasin de vélos Cycles du Léman, à Carouge. " +
    "Le bilan d'ouverture au 01.01.2026 est déjà saisi. Passez au journal les écritures des opérations ci-dessous, " +
    "en indiquant le numéro de l'opération comme numéro de pièce. Il n'y a pas d'autre opération jusqu'au 31.12.2026 : " +
    "bouclez ensuite l'exercice.",
  operations: [
    { numero: '1', date: '2026-01-05', texte: "Achat de marchandises à crédit chez un fournisseur, 4'800.00." },
    { numero: '2', date: '2026-01-08', texte: "Ventes au comptant de la période, 12'350.00." },
    { numero: '3', date: '2026-01-12', texte: "Vente de vélos à crédit à un club de cyclisme, 6'400.00." },
    { numero: '4', date: '2026-01-15', texte: "Versement de 9'000.00 de la caisse sur le compte bancaire." },
    { numero: '5', date: '2026-01-31', texte: "Paiement du loyer de janvier par la banque, 1'850.00." },
    { numero: '6', date: '2026-02-02', texte: "Paiement par la banque de la facture du fournisseur de l'opération 1, 4'800.00." },
    { numero: '7', date: '2026-02-10', texte: "Le club de cyclisme règle sa facture par virement bancaire, 6'400.00." },
    { numero: '8', date: '2026-02-14', texte: "Achat d'un ordinateur pour le bureau, payé par la banque, 1'600.00." },
    { numero: '9', date: '2026-02-20', texte: "Facture d'électricité payée par le compte postal, 240.00." },
    { numero: '10', date: '2026-02-28', texte: "Salaire de l'employé payé par la banque, 4'200.00." },
    { numero: '11', date: '2026-03-03', texte: "Sandra Rochat prélève 800.00 en espèces dans la caisse pour ses besoins privés." },
    { numero: '12', date: '2026-03-10', texte: "Facture reçue d'une agence pour une annonce dans le journal local, 650.00, payable à 30 jours." },
    { numero: '13', date: '2026-03-15', texte: "Remboursement partiel de la dette bancaire à long terme, par la banque, 5'000.00." },
    { numero: '14', date: '2026-03-20', texte: "Achat de marchandises pour 3'000.00 : 1'000.00 payés en espèces, le solde à crédit." },
    { numero: '15', date: '2026-03-25', texte: "Prime d'assurance contre le vol et l'incendie payée par le compte postal, 480.00." },
  ],
  ouvertureActif: {
    '1000': f(3500),
    '1010': f(4200),
    '1020': f(28000),
    '1100': f(2300),
    '1200': f(18000),
    '1510': f(15000),
    '1530': f(22000),
  },
  ouverturePassif: {
    '2000': f(7600),
    '2400': f(30000),
    '2800': f(55400),
  },
  parametres: {
    libellesT: 'SI/SF',
    modeBouclement: 'compteDeResultat',
    comptesAjoutes: [],
    comptesMasques: [],
  },
  corrige: [
    { piece: '1', lignes: s('4200', '2000', 4800) },
    { piece: '2', lignes: s('1000', '3210', 12350) },
    { piece: '3', lignes: s('1100', '3211', 6400) },
    { piece: '4', lignes: s('1020', '1000', 9000) },
    { piece: '5', lignes: s('6000', '1020', 1850) },
    { piece: '6', lignes: s('2000', '1020', 4800) },
    { piece: '7', lignes: s('1020', '1100', 6400) },
    { piece: '8', lignes: s('1521', '1020', 1600) },
    { piece: '9', lignes: s('6400', '1010', 240) },
    { piece: '10', lignes: s('5200', '1020', 4200) },
    { piece: '11', lignes: s('2850', '1000', 800) },
    { piece: '12', lignes: s('6600', '2001', 650) },
    { piece: '13', lignes: s('2400', '1020', 5000) },
    {
      piece: '14',
      lignes: [
        { debit: '4200', credit: null, montant: f(3000) },
        { debit: null, credit: '1000', montant: f(1000) },
        { debit: null, credit: '2000', montant: f(2000) },
      ],
    },
    { piece: '15', lignes: s('6300', '1010', 480) },
  ],
};

export const exercicesDemo: Exercice[] = [demoCfc1];
