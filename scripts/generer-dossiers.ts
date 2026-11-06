// Génère dans dossiers/ les fichiers à distribuer, un sous-dossier par dossier de pièces : PDF élève, corrigé PDF,
// exercices entraînement et évaluation, version enseignant. Lancer avec : npm run dossiers
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPLEMENTS_CORRIGE, DOSSIERS } from '../src/data/dossiers';
import { plan } from '../src/data/plan';
import { nomFichier } from '../src/io/fichiers';
import { paquetEnseignant } from '../src/pdf/paquet';

const racine = join(process.cwd(), 'dossiers');

for (const ex of DOSSIERS) {
  const dossier = join(racine, nomFichier([`${ex.filiere ?? 'CFC'}${ex.difficulte ?? 1}`, ex.raisonSociale], ''));
  mkdirSync(dossier, { recursive: true });
  const fichiers = await paquetEnseignant(ex, plan, COMPLEMENTS_CORRIGE[ex.id]);
  for (const f of fichiers) writeFileSync(join(dossier, f.nom), f.donnees);
  console.log(`${dossier} : ${fichiers.length} fichiers`);
}
