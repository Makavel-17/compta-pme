// Dates : stockées au format ISO « AAAA-MM-JJ », affichées « JJ.MM.AAAA ».
// Aucun objet Date (évite les décalages de fuseau horaire).

export type DateISO = string;

function bissextile(a: number): boolean {
  return (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
}

function joursDuMois(a: number, m: number): number {
  return [31, bissextile(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
}

function iso(a: number, m: number, j: number): DateISO {
  return `${String(a).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`;
}

function decomposer(d: DateISO): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) throw new Error(`Date ISO invalide : ${d}`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

export function estDateValide(d: DateISO): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const [a, mo, j] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return mo >= 1 && mo <= 12 && j >= 1 && j <= joursDuMois(a, mo);
}

/**
 * Lit une date saisie : 31.12.2026, 1.2.2026, 31.12.26, ou 31.12. (année par défaut).
 * Retourne null si la date n'existe pas.
 */
export function lireDate(saisie: string, anneeParDefaut?: number): DateISO | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})?$/.exec(saisie.trim());
  if (!m) return null;
  let annee: number;
  if (m[3] === undefined) {
    if (anneeParDefaut === undefined) return null;
    annee = anneeParDefaut;
  } else {
    annee = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  }
  const d = iso(annee, Number(m[2]), Number(m[1]));
  return estDateValide(d) ? d : null;
}

export function formatDate(d: DateISO): string {
  const [a, m, j] = decomposer(d);
  return `${String(j).padStart(2, '0')}.${String(m).padStart(2, '0')}.${a}`;
}

export function jourSuivant(d: DateISO): DateISO {
  const [a, m, j] = decomposer(d);
  if (j < joursDuMois(a, m)) return iso(a, m, j + 1);
  if (m < 12) return iso(a, m + 1, 1);
  return iso(a + 1, 1, 1);
}

/** Même jour l'année suivante (29.02 devient 28.02). */
export function anneeSuivante(d: DateISO): DateISO {
  const [a, m, j] = decomposer(d);
  return iso(a + 1, m, Math.min(j, joursDuMois(a + 1, m)));
}

export function annee(d: DateISO): number {
  return decomposer(d)[0];
}
