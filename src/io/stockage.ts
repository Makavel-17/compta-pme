// Stockage dans le navigateur (localStorage). Aucune donnée n'est envoyée en ligne.
// Toutes les lectures et écritures sont protégées : navigation privée ou stockage bloqué
// ne doivent jamais empêcher l'application de fonctionner.

export const CLE_ELEVE = 'compta-pme:v1';
export const CLE_ENSEIGNANT = 'compta-pme:enseignant:v1';

export function lire<T>(cle = CLE_ELEVE): T | null {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? (JSON.parse(brut) as T) : null;
  } catch {
    return null;
  }
}

export function ecrire(valeur: unknown, cle = CLE_ELEVE): boolean {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
    return true;
  } catch {
    return false;
  }
}

export function effacer(cle = CLE_ELEVE): void {
  try {
    localStorage.removeItem(cle);
  } catch {
    /* rien */
  }
}
