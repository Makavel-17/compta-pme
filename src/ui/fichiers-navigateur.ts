// Échanges de fichiers avec l'ordinateur de l'utilisateur (aucun envoi en ligne).

/** Propose l'enregistrement d'un fichier texte. */
export function telecharger(nom: string, contenu: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([contenu], { type: `${type};charset=utf-8` }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Ouvre le sélecteur de fichiers et renvoie le contenu texte des fichiers choisis. */
export function choisirFichiers(accept: string, multiple = false): Promise<{ nom: string; texte: string }[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = async () => {
      const fichiers = [...(input.files ?? [])];
      resolve(await Promise.all(fichiers.map(async (f) => ({ nom: f.name, texte: await f.text() }))));
    };
    input.click();
  });
}
