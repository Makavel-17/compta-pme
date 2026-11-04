// Stockage dans le navigateur (localStorage). Aucune donnée n'est envoyée en ligne.
// Toutes les lectures et écritures sont protégées : navigation privée ou stockage bloqué
// ne doivent jamais empêcher l'application de fonctionner.

const CLE = 'compta-pme:v1';

export function lire<T>(): T | null {
  try {
    const brut = localStorage.getItem(CLE);
    return brut ? (JSON.parse(brut) as T) : null;
  } catch {
    return null;
  }
}

export function ecrire(valeur: unknown): boolean {
  try {
    localStorage.setItem(CLE, JSON.stringify(valeur));
    return true;
  } catch {
    return false;
  }
}

export function effacer(): void {
  try {
    localStorage.removeItem(CLE);
  } catch {
    /* rien */
  }
}
