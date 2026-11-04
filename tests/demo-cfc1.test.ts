import { describe, expect, it } from 'vitest';
import { demoCfc1 } from '../src/data/demo-cfc1';
import { boucler, reouvrir } from '../src/engine/closing';
import { controlerOuverture, type Dossier } from '../src/engine/dossier';
import { comptesDisponibles } from '../src/engine/dossier';
import { creerDossier, fonctionsDuNiveau, operationsSaisies } from '../src/engine/exercice';
import { ajouterEcriture, extourner } from '../src/engine/journal';
import { balance, soldeDe } from '../src/engine/ledger';
import { bilan, compteDeResultat } from '../src/engine/statements';
import { chf, plan } from './fixtures';

function dossierCorrige(): Dossier {
  let d = creerDossier(demoCfc1, plan);
  demoCfc1.corrige!.forEach((c, i) => {
    const op = demoCfc1.operations.find((o) => o.numero === c.piece)!;
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte, lignes: c.lignes });
    if (!r.ok) throw new Error(`Pièce ${c.piece} : ${r.erreurs.join(' / ')}`);
    d = r.valeur;
  });
  return d;
}

describe('exercice de démonstration CFC 1', () => {
  it("a un bilan d'ouverture équilibré et quinze opérations", () => {
    const d = creerDossier(demoCfc1, plan);
    expect(controlerOuverture(d)).toEqual([]);
    expect(demoCfc1.operations).toHaveLength(15);
    expect(demoCfc1.corrige).toHaveLength(15);
  });

  it("n'utilise que des comptes du niveau CFC 1, plus 9000 pour le bouclement", () => {
    const d = creerDossier(demoCfc1, plan);
    const dispo = new Set(comptesDisponibles(d).map((c) => c.numero));
    expect(dispo.has('9000')).toBe(true);
    expect(dispo.has('1170')).toBe(false);
    for (const n of Object.keys(d.ouverture)) expect(dispo.has(n)).toBe(true);
  });

  it('le corrigé passe sans erreur et donne un bénéfice de 3\'530.00', () => {
    const d = dossierCorrige();
    expect(balance(d).equilibree).toBe(true);
    expect(compteDeResultat(d).resultat).toBe(chf(3530));
    expect(bilan(d).equilibre).toBe(true);
    expect(soldeDe(d, '1000')).toBe(chf(5050));
    expect(soldeDe(d, '1020')).toBe(chf(25950));
    expect(soldeDe(d, '1010')).toBe(chf(3480));
  });

  it('se boucle et se rouvre avec un capital de 58\'130.00', () => {
    const b = boucler(dossierCorrige());
    if (!b.ok) throw new Error(b.erreurs.join());
    const r = reouvrir(b.valeur, 'compteDeResultat');
    if (!r.ok) throw new Error(r.erreurs.join());
    expect(r.valeur.ouverture['2800']).toBe(chf(-58130));
  });

  it("repère les opérations saisies, sans compter une écriture extournée", () => {
    const d = dossierCorrige();
    expect(operationsSaisies(d).size).toBe(15);
    const r = extourner(d, 'E1', '2026-01-05');
    if (!r.ok) throw new Error();
    expect(operationsSaisies(r.valeur).has('1')).toBe(false);
  });

  it('active la TVA à partir du CFC 2 seulement', () => {
    expect(fonctionsDuNiveau('CFC1').has('tva')).toBe(false);
    expect(fonctionsDuNiveau('CFC2').has('tva')).toBe(true);
  });
});
