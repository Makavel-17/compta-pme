// Relecture du contenu par l'enseignant : avis par élément (exercice, dossier, chapitre de théorie) et export texte
// des remarques, à transmettre pour mettre à jour le contenu officiel. Données gardées dans le navigateur de l'enseignant.

export interface AvisRelecture {
  valide: boolean;
  remarque: string;
  /** Date ISO de la dernière modification. */
  le?: string | null;
}

export type Relecture = Record<string, AvisRelecture>;

export interface ElementRelecture {
  /** Clé stable : « ex:<id d'exercice> » ou « th:<id de chapitre> ». */
  cle: string;
  groupe: string;
  titre: string;
}

/** Nombre d'éléments validés parmi ceux de la liste. */
export function compterValides(elements: readonly ElementRelecture[], r: Relecture): number {
  return elements.filter((e) => r[e.cle]?.valide).length;
}

/** Texte des remarques, groupé : validés, à corriger (remarque sans validation), pas encore relus. */
export function texteRelecture(elements: readonly ElementRelecture[], r: Relecture, maintenant = new Date()): string {
  const jour = `${String(maintenant.getDate()).padStart(2, '0')}.${String(maintenant.getMonth() + 1).padStart(2, '0')}.${maintenant.getFullYear()}`;
  const ligne = (e: ElementRelecture) => {
    const a = r[e.cle];
    const rem = a?.remarque.trim();
    return `- [${e.groupe}] ${e.titre}${rem ? `\r\n    Remarque : ${rem.replace(/\r?\n+/g, '\r\n    ')}` : ''}`;
  };
  const valides = elements.filter((e) => r[e.cle]?.valide);
  const aCorriger = elements.filter((e) => !r[e.cle]?.valide && r[e.cle]?.remarque.trim());
  const restants = elements.filter((e) => !r[e.cle]?.valide && !r[e.cle]?.remarque.trim());
  return [
    `Relecture de Compta PME — ${jour}`,
    `${valides.length} élément(s) validé(s) sur ${elements.length}.`,
    '',
    `À CORRIGER (${aCorriger.length})`,
    ...(aCorriger.length ? aCorriger.map(ligne) : ['(aucun)']),
    '',
    `VALIDÉS (${valides.length})`,
    ...(valides.length ? valides.map(ligne) : ['(aucun)']),
    '',
    `PAS ENCORE RELUS (${restants.length})`,
    ...(restants.length ? restants.map((e) => `- [${e.groupe}] ${e.titre}`) : ['(aucun)']),
    '',
  ].join('\r\n');
}
