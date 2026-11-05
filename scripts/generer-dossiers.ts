// Génère dans dossiers/ les fichiers à distribuer : PDF élève, corrigé PDF, exercices entraînement et évaluation,
// version enseignant. Lancer avec : npm run dossiers
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPLEMENTS_CORRIGE, DOSSIERS, versionEvaluation } from '../src/data/dossiers';
import { plan } from '../src/data/plan';
import { EXT_EXERCICE, exporterExercice, exporterExerciceEnseignant, nomFichier } from '../src/io/fichiers';
import { genererPdfCorrige, genererPdfDossier } from '../src/pdf/dossier';

const racine = join(process.cwd(), 'dossiers');

for (const ex of DOSSIERS) {
  const dossier = join(racine, nomFichier([`${ex.filiere ?? 'CFC'}${ex.difficulte ?? 1}`, ex.raisonSociale], ''));
  mkdirSync(dossier, { recursive: true });
  const ecrire = (nom: string, contenu: string | Uint8Array) => writeFileSync(join(dossier, nom), contenu);
  const nomPdf = nomFichier([ex.raisonSociale, 'dossier'], '.pdf');
  const nomCorrige = nomFichier([ex.raisonSociale, 'corrige'], '.pdf');
  ecrire(nomPdf, new Uint8Array(await (await genererPdfDossier(ex, plan, nomPdf)).arrayBuffer()));
  ecrire(nomCorrige, new Uint8Array(await (await genererPdfCorrige(ex, plan, nomCorrige, COMPLEMENTS_CORRIGE[ex.id])).arrayBuffer()));
  ecrire(nomFichier([ex.raisonSociale, 'entrainement'], EXT_EXERCICE), exporterExercice(ex));
  const evaluation = versionEvaluation(ex);
  ecrire(nomFichier([ex.raisonSociale, 'evaluation'], EXT_EXERCICE), exporterExercice(evaluation));
  ecrire(nomFichier([ex.raisonSociale, 'evaluation', 'enseignant'], EXT_EXERCICE), exporterExerciceEnseignant(evaluation));
  console.log(`${dossier} : 5 fichiers`);
}
