// Exercice de démonstration MP — société anonyme fictive. À faire valider par l'enseignant.
import type { Exercice } from '../engine/exercice';

const f = (francs: number) => Math.round(francs * 100);
const s = (debit: string, credit: string, francs: number) => [{ debit, credit, montant: f(francs) }];
const D = (compte: string, francs: number) => ({ debit: compte, credit: null, montant: f(francs) });
const C = (compte: string, francs: number) => ({ debit: null, credit: compte, montant: f(francs) });

export const demoMp: Exercice = {
  id: 'demo-mp-lemantec-sa',
  titre: 'Lémantec SA — exercice 2026',
  niveau: 'MP',
  raisonSociale: 'Lémantec SA',
  formeJuridique: 'SA',
  debut: '2026-01-01',
  fin: '2026-12-31',
  introduction:
    "Lémantec SA, à Genève, commercialise des composants électroniques. Son capital-actions de 300'000.00 est entièrement " +
    "libéré. L'entreprise est assujettie à la TVA (méthode effective, comptabilisation au net, taux normal 8,1 %) et " +
    "amortit ses machines selon la méthode indirecte. Le bénéfice de l'exercice 2025 (60'000.00) et le bénéfice reporté " +
    "antérieur (5'000.00) figurent dans le compte 2970. Passez au journal les écritures des opérations ci-dessous, en " +
    "indiquant le numéro de l'opération comme numéro de pièce, puis calculez les ratios dans la rubrique Analyse.",
  operations: [
    {
      numero: '1',
      date: '2026-03-15',
      texte:
        "L'assemblée générale approuve la répartition du bénéfice 2025 : attribution légale à la réserve issue du bénéfice " +
        "(art. 672 CO), dividende de 12 % du capital-actions, attribution de 10'000.00 aux réserves libres ; le solde reste reporté.",
    },
    { numero: '2', date: '2026-03-20', texte: "Paiement des dividendes aux actionnaires par la banque, déduction faite de l'impôt anticipé de 35 %." },
    { numero: '3', date: '2026-04-30', texte: "Versement par la banque de l'impôt anticipé retenu à l'Administration fédérale des contributions." },
    { numero: '4', date: '2026-05-10', texte: "Achat de 200 actions d'une société cotée, au cours de 150.00, plus 300.00 de courtage, payés par la banque (placement à court terme)." },
    { numero: '5', date: '2026-05-20', texte: "Ces actions rapportent un dividende brut de 4.00 par action, crédité en banque sous déduction de l'impôt anticipé de 35 %." },
    { numero: '6', date: '2026-06-15', texte: "Vente de marchandises à crédit : 150'000.00 + TVA 8,1 %." },
    { numero: '7', date: '2026-06-25', texte: "Le client de l'opération 6 paie par virement bancaire en déduisant un escompte de 2 %." },
    { numero: '8', date: '2026-06-30', texte: "Achat de marchandises à crédit : 20'000.00 + TVA 8,1 %." },
    { numero: '9', date: '2026-07-05', texte: "Frais de transport sur l'achat de l'opération 8, payés par la banque : 500.00 + TVA 8,1 %." },
    { numero: '10', date: '2026-09-30', texte: "La banque débite l'intérêt annuel de 3 % sur l'emprunt bancaire à long terme de 150'000.00." },
    { numero: '11', date: '2026-12-31', texte: 'La banque débite des frais de tenue de compte de 85.00.' },
    { numero: '12', date: '2026-12-31', texte: "Constitution d'une provision de 8'000.00 pour une révision de machine prévue en janvier." },
    { numero: '13', date: '2026-12-31', texte: 'Au 31.12, les actions de l\'opération 4 cotent 140.00 : ajustez leur valeur au bilan.' },
    { numero: '14', date: '2026-12-31', texte: "Amortissement des machines : 10 % linéaire de la valeur d'acquisition (300'000.00)." },
    { numero: '15', date: '2026-12-31', texte: "Constitution d'une provision de 6'000.00 pour les impôts sur le bénéfice de l'exercice." },
  ],
  ouvertureActif: {
    '1020': f(200000),
    '1100': f(90000),
    '1200': f(120000),
    '1500': f(300000),
  },
  ouverturePassif: {
    '1109': f(4500),
    '1509': f(100000),
    '2000': f(60000),
    '2400': f(150000),
    '2800': f(300000),
    '2950': f(30500),
    '2970': f(65000),
  },
  mode: 'entrainement',
  parametres: {
    libellesT: 'SI/SF',
    modificationDirecte: false,
    modeBouclement: 'compteDeResultat',
    comptesAjoutes: [],
    comptesMasques: [],
    tvaMethode: 'net',
    ficheSalaire: false,
    calculatriceTva: false,
    repartition: {
      benefice: f(60000),
      reporte: f(5000),
      capital: f(300000),
      reserveLegaleCapital: 0,
      reserveLegaleBenefice: f(30500),
      holding: false,
      tauxDividende: 1200,
      tantiemes: 0,
      reservesLibres: f(10000),
    },
  },
  corrige: [
    { piece: '1', lignes: [D('2970', 49000), C('2950', 3000), C('2230', 36000), C('2960', 10000)] },
    { piece: '2', lignes: [D('2230', 36000), C('1020', 23400), C('2205', 12600)] },
    { piece: '3', lignes: s('2205', '1020', 12600) },
    { piece: '4', lignes: [D('1060', 30000), D('6900', 300), C('1020', 30300)] },
    { piece: '5', lignes: [D('1020', 520), D('1176', 280), C('6950', 800)] },
    { piece: '6', lignes: [D('1100', 162150), C('3200', 150000), C('2200', 12150)] },
    { piece: '7', lignes: [D('1020', 158907), D('3209', 3000), D('2200', 243), C('1100', 162150)] },
    { piece: '8', lignes: [D('4200', 20000), D('1170', 1620), C('2000', 21620)] },
    { piece: '9', lignes: [D('4270', 500), D('1170', 40.5), C('1020', 540.5)] },
    { piece: '10', lignes: s('6900', '1020', 4500) },
    { piece: '11', lignes: s('6900', '1020', 85) },
    { piece: '12', lignes: s('6100', '2600', 8000) },
    { piece: '13', lignes: s('6900', '1060', 2000) },
    { piece: '14', lignes: s('6800', '1509', 30000) },
    { piece: '15', lignes: s('8900', '2640', 6000) },
  ],
};
