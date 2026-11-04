// Montants : toujours en centimes entiers. Aucun calcul en virgule flottante.

export type Centimes = number;

export function estCentimes(v: unknown): v is Centimes {
  return typeof v === 'number' && Number.isSafeInteger(v);
}

/**
 * Lit un montant saisi par l'élève et le convertit en centimes.
 * Accepte : 1234.5, 1'234.50, 1 234,50, .50, -12.30. Refuse plus de deux décimales.
 * Retourne null si la saisie n'est pas un montant valide.
 */
export function lireMontant(saisie: string): Centimes | null {
  let t = saisie.trim().replace(/[\s'’  ]/g, '');
  if (t.includes(',') && t.includes('.')) return null;
  t = t.replace(',', '.');
  const m = /^(-?)(\d*)(?:\.(\d{0,2}))?$/.exec(t);
  if (!m) return null;
  const [, signe, entier = '', decimales = ''] = m;
  if (entier === '' && decimales === '') return null;
  const valeur = Number(entier || '0') * 100 + Number(decimales.padEnd(2, '0'));
  if (!Number.isSafeInteger(valeur)) return null;
  return signe === '-' ? -valeur : valeur;
}

/** Format suisse : 1'234.50 (négatifs : -1'234.50). */
export function formatMontant(c: Centimes): string {
  if (!estCentimes(c)) throw new Error(`Montant invalide : ${c}`);
  const abs = Math.abs(c);
  const francs = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const cts = (abs % 100).toString().padStart(2, '0');
  return `${c < 0 ? '-' : ''}${francs}.${cts}`;
}

/** Arrondi aux 5 centimes les plus proches (usage suisse). */
export function arrondi5(c: Centimes): Centimes {
  if (c < 0) return -arrondi5(-c);
  return Math.floor((c + 2) / 5) * 5;
}

/** Somme sûre de montants en centimes. */
export function somme(montants: Iterable<Centimes>): Centimes {
  let s = 0;
  for (const m of montants) s += m;
  return s;
}
