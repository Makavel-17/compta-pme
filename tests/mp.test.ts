import { describe, expect, it } from 'vitest';
import { attributionReserveLegale, repartir, type DonneesRepartition } from '../src/engine/repartition';
import { ratios, ratioJuste } from '../src/engine/analyse';
import { creerDossier, planSelonForme } from '../src/engine/exercice';
import { demoCfc1 } from '../src/data/demo-cfc1';
import type { Dossier } from '../src/engine/dossier';
import { ouvertureDepuisBilan } from '../src/engine/dossier';
import { ajouterEcriture } from '../src/engine/journal';
import { chf, plan } from './fixtures';

const base: DonneesRepartition = {
  benefice: chf(100000),
  reporte: chf(8000),
  capital: chf(500000),
  reserveLegaleCapital: 0,
  reserveLegaleBenefice: chf(240000),
  holding: false,
  tauxDividende: 800,
  tantiemes: chf(5000),
  reservesLibres: chf(10000),
};

describe('répartition du bénéfice (art. 672 CO révisé)', () => {
  it('5 % du bénéfice à la réserve légale, puis dividendes, tantièmes, réserves libres', () => {
    const r = repartir(base);
    if (!r.ok) throw new Error(r.erreur);
    expect(r.tableau).toEqual({
      disponible: chf(108000),
      reserveLegale: chf(5000),
      dividendes: chf(40000),
      tantiemes: chf(5000),
      reservesLibres: chf(10000),
      nouveauReporte: chf(48000),
      impotAnticipe: chf(14000),
      dividendeNet: chf(26000),
    });
  });

  it('plafond : réserves légales (capital + bénéfice) jusqu\'à 50 % du capital inscrit', () => {
    expect(attributionReserveLegale({ ...base, reserveLegaleBenefice: chf(248000) })).toBe(chf(2000));
    expect(attributionReserveLegale({ ...base, reserveLegaleBenefice: chf(150000), reserveLegaleCapital: chf(100000) })).toBe(0);
  });

  it('société holding : plafond à 20 %', () => {
    expect(attributionReserveLegale({ ...base, holding: true, reserveLegaleBenefice: chf(99000) })).toBe(chf(1000));
  });

  it('une perte reportée est compensée avant l\'attribution', () => {
    expect(attributionReserveLegale({ ...base, reporte: chf(-30000), reserveLegaleBenefice: 0 })).toBe(chf(3500));
    expect(attributionReserveLegale({ ...base, benefice: chf(20000), reporte: chf(-30000), reserveLegaleBenefice: 0 })).toBe(0);
  });

  it('refuse des attributions supérieures au bénéfice disponible', () => {
    expect(repartir({ ...base, tauxDividende: 2500 }).ok).toBe(false);
  });
});

describe('intitulé du capital selon la forme juridique', () => {
  it('Capital, Capital-actions, Capital social', () => {
    const t = (f: 'raison individuelle' | 'SA' | 'Sàrl') => planSelonForme(plan, f).find((c) => c.numero === '2800')!.intitule;
    expect([t('raison individuelle'), t('SA'), t('Sàrl')]).toEqual(['Capital', 'Capital-actions', 'Capital social']);
    expect(creerDossier({ ...demoCfc1, formeJuridique: 'SA' }, plan).plan.find((c) => c.numero === '2800')!.intitule).toBe('Capital-actions');
  });
});

describe('ratios d\'analyse', () => {
  let d: Dossier = {
    ...creerDossier(demoCfc1, plan),
    niveau: 'MP',
    ouverture: ouvertureDepuisBilan(
      { '1000': chf(20000), '1100': chf(10000), '1500': chf(70000) },
      { '2000': chf(30000), '2400': chf(20000), '2800': chf(50000) },
    ),
  };
  [
    ['1000', '3200', 40000],
    ['4200', '1000', 25000],
    ['5200', '1000', 5000],
    ['6800', '1500', 2000],
  ].forEach(([debit, credit, f], i) => {
    const r = ajouterEcriture(d, { id: `E${i}`, date: '2026-06-30', piece: String(i + 1), libelle: 'x', lignes: [{ debit: String(debit), credit: String(credit), montant: chf(Number(f)) }] });
    if (!r.ok) throw new Error(r.erreurs.join());
    d = r.valeur;
  });

  it('calcule les ratios du cours', () => {
    const r = ratios(d);
    const arr = (x: number | null) => (x === null ? null : Math.round(x * 100) / 100);
    expect(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, arr(v)]))).toEqual({
      liquidite1: 100,
      liquidite2: 133.33,
      endettement: 46.3,
      financementPropre: 53.7,
      autofinancement: 0, // raison individuelle : le bénéfice va au capital
      couverture2: 114.71,
      margeBrute: 37.5,
      margeEconomique: 20,
      margeNette: 20,
      roi: 7.69,
      rfp: 14.81,
    });
  });

  it("degré d'autofinancement : une société compte le bénéfice de l'exercice (il rejoint 2970)", () => {
    const sa: Dossier = { ...d, formeJuridique: 'SA' };
    expect(Math.round(ratios(sa).autofinancement! * 100) / 100).toBe(13.79);
  });

  it('accepte un écart d\'arrondi de 0.1 point', () => {
    expect(ratioJuste(133.333, 133.3)).toBe(true);
    expect(ratioJuste(133.333, 133.2)).toBe(false);
    expect(ratioJuste(null, 0)).toBe(false);
  });
});
