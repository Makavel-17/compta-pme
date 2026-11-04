import { describe, expect, it } from 'vitest';
import { controlerOuverture } from '../src/engine/dossier';
import {
  ajouterEcriture,
  contrePasser,
  controlerEcriture,
  difference,
  modifierEcriture,
} from '../src/engine/journal';
import { soldeDe } from '../src/engine/ledger';
import { chf, dossierExemple, dossierVide, ecr, passer, simple } from './fixtures';

describe("bilan d'ouverture", () => {
  it('est équilibré', () => {
    expect(controlerOuverture(dossierVide())).toEqual([]);
  });

  it('signale un déséquilibre avec le montant', () => {
    const d = { ...dossierVide(), ouverture: { ...dossierVide().ouverture, '1000': chf(2100) } };
    expect(controlerOuverture(d)).toEqual([
      "Le bilan d'ouverture n'est pas équilibré : l'actif dépasse le passif de 100.00 CHF.",
    ]);
  });

  it('refuse un compte de charge', () => {
    const d = { ...dossierVide(), ouverture: { '4200': 100, '1000': -100 } };
    expect(controlerOuverture(d)[0]).toMatch(/4200 .* n'est pas un compte de bilan/);
  });
});

describe('contrôle des écritures', () => {
  const d = dossierVide();

  it('accepte une écriture simple', () => {
    expect(controlerEcriture(d, ecr('1', simple('1000', '3210', 100)))).toEqual([]);
  });

  it('accepte une écriture composée équilibrée', () => {
    const e = ecr('2', [
      { debit: '2000', credit: null, montant: chf(300) },
      { debit: null, credit: '1000', montant: chf(100) },
      { debit: null, credit: '1020', montant: chf(200) },
    ]);
    expect(controlerEcriture(d, e)).toEqual([]);
    expect(difference(e)).toBe(0);
  });

  it('refuse une écriture déséquilibrée et chiffre la différence', () => {
    const e = ecr('3', [
      { debit: '2000', credit: null, montant: chf(300) },
      { debit: null, credit: '1000', montant: chf(250) },
    ]);
    expect(difference(e)).toBe(chf(50));
    expect(controlerEcriture(d, e)).toEqual([
      "L'écriture n'est pas équilibrée : total débit 300.00, total crédit 250.00, différence 50.00.",
    ]);
  });

  it('refuse compte inconnu, compte hors niveau, même compte, montant nul', () => {
    const e = ecr('4', [
      { debit: '1999', credit: '1000', montant: 100 },
      { debit: '1170', credit: '1000', montant: 100 },
      { debit: '1000', credit: '1000', montant: 100 },
      { debit: '1000', credit: '1020', montant: 0 },
    ]);
    expect(controlerEcriture(d, e)).toEqual([
      "Ligne 1 : le compte 1999 n'existe pas dans le plan comptable.",
      "Ligne 2 : le compte 1170 n'est pas utilisé dans cet exercice.",
      'Ligne 3 : le même compte ne peut pas être à la fois au débit et au crédit.',
      'Ligne 4 : le montant doit être supérieur à zéro.',
    ]);
  });

  it('accepte un compte ajouté par l\'enseignant et refuse un compte masqué', () => {
    const ajuste = { ...d, comptesAjoutes: ['1170'], comptesMasques: ['1000'] };
    const erreurs = controlerEcriture(ajuste, ecr('5', simple('1170', '1000', 10)));
    expect(erreurs).toEqual(["Ligne 1 : le compte 1000 n'est pas utilisé dans cet exercice."]);
  });

  it('refuse une date hors exercice, une pièce et un libellé vides', () => {
    const e = { ...ecr('', simple('1000', '3210', 1), '2027-01-01'), libelle: ' ' };
    expect(controlerEcriture(d, e)).toEqual([
      "La date 01.01.2027 est hors de l'exercice (du 01.01.2026 au 31.12.2026).",
      "Indiquez le numéro de pièce (numéro de l'opération).",
      'Indiquez un libellé.',
    ]);
  });

  it("n'ajoute pas une écriture erronée au journal", () => {
    const r = ajouterEcriture(d, ecr('6', simple('1000', '1000', 1)));
    expect(r.ok).toBe(false);
    expect(d.ecritures).toHaveLength(0);
  });
});

describe('contre-passation', () => {
  it("annule l'effet de l'écriture en gardant l'historique", () => {
    let d = passer(dossierVide(), { ...ecr('1', simple('6000', '1020', 1200)), id: 'E1' });
    const r = contrePasser(d, 'E1', '2026-04-01');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    d = r.valeur;
    expect(d.ecritures).toHaveLength(2);
    const cp = d.ecritures[1]!;
    expect(cp.piece).toBe('1');
    expect(cp.contrePassationDe).toBe('E1');
    expect(cp.libelle).toBe('Contre-passation : Opération 1');
    expect(cp.lignes).toEqual([{ debit: '1020', credit: '6000', montant: chf(1200) }]);
    expect(soldeDe(d, '6000')).toBe(0);
    expect(soldeDe(d, '1020')).toBe(chf(15000));
  });

  it('refuse une double contre-passation', () => {
    const d = passer(dossierVide(), { ...ecr('1', simple('6000', '1020', 1)), id: 'E1' });
    const r1 = contrePasser(d, 'E1', '2026-04-01');
    if (!r1.ok) throw new Error();
    expect(contrePasser(r1.valeur, 'E1', '2026-04-01')).toEqual({
      ok: false,
      erreurs: ['La pièce 1 a déjà été contre-passée.'],
    });
    expect(contrePasser(r1.valeur, 'E2', '2026-04-01').ok).toBe(false);
  });
});

describe('modification directe', () => {
  it('remplace une écriture valide et refuse une modification erronée', () => {
    const d = passer(dossierVide(), { ...ecr('1', simple('6000', '1020', 100)), id: 'E1' });
    const r = modifierEcriture(d, 'E1', { ...ecr('1', simple('6000', '1000', 120)) });
    expect(r.ok && r.valeur.ecritures[0]!.lignes[0]!.credit).toBe('1000');
    expect(modifierEcriture(d, 'E1', ecr('1', simple('6000', '6000', 1))).ok).toBe(false);
  });
});

describe('dossier exemple', () => {
  it('se construit sans erreur', () => {
    expect(dossierExemple().ecritures).toHaveLength(7);
  });
});
