// Lien direct vers un exercice du logiciel : l'enseignant le copie et le donne à sa classe ; l'élève arrive sur
// l'accueil avec cet exercice déjà choisi. Seuls les exercices et dossiers fournis avec le logiciel ont un lien
// (les exercices propres à l'enseignant ne sont pas sur le site : ils se donnent par fichier).

const PARAMETRE = 'exercice';

/** Identifiant d'exercice indiqué dans l'adresse, ou null. */
export function exerciceDuLien(): string | null {
  return new URLSearchParams(location.search).get(PARAMETRE);
}

/** Adresse à donner aux élèves pour ouvrir directement un exercice. */
export function lienEleves(exerciceId: string): string {
  const base = `${location.origin}${location.pathname.replace(/index\.html$/, '')}`;
  return `${base}?${PARAMETRE}=${encodeURIComponent(exerciceId)}`;
}

/** Retire le lien de l'adresse une fois l'exercice commencé (un rechargement ne le rouvre pas). */
export function oublierLien() {
  if (!location.search) return;
  history.replaceState(null, '', `${location.pathname}${location.hash}`);
}
