// Paquets de fichiers d'un dossier de pièces : pour les élèves (sans corrigé lisible) ou pour l'enseignant (complet).
import type { Exercice } from '../engine/exercice';
import type { Compte } from '../engine/plan';
import { EXT_EXERCICE, exporterExercice, exporterExerciceEnseignant, nomFichier } from '../io/fichiers';
import type { FichierZip } from '../io/zip';
import { versionEvaluation } from '../data/dossiers';
import { genererPdfCorrige, genererPdfDossier, type TableauComplement } from './dossier';

const octets = async (b: Blob) => new Uint8Array(await b.arrayBuffer());
const texte = (t: string) => new TextEncoder().encode(t);


/** Pour les élèves : dossier PDF et fichier d'entraînement (corrigé encodé, pour le retour immédiat). */
export async function paquetEleves(ex: Exercice, plan: Compte[]): Promise<FichierZip[]> {
  const nomPdf = nomFichier([ex.raisonSociale, 'dossier'], '.pdf');
  return [
    { nom: nomPdf, donnees: await octets(await genererPdfDossier(ex, plan, nomPdf)) },
    { nom: nomFichier([ex.raisonSociale, 'entrainement'], EXT_EXERCICE), donnees: texte(exporterExercice(ex)) },
  ];
}

/** Pour l'enseignant : tout le paquet élèves, plus le corrigé PDF, le fichier d'évaluation et sa version enseignant. */
export async function paquetEnseignant(ex: Exercice, plan: Compte[], complements: TableauComplement[] = []): Promise<FichierZip[]> {
  const nomCorrige = nomFichier([ex.raisonSociale, 'corrige'], '.pdf');
  const ev = versionEvaluation(ex);
  return [
    ...(await paquetEleves(ex, plan)),
    { nom: nomCorrige, donnees: await octets(await genererPdfCorrige(ex, plan, nomCorrige, complements)) },
    { nom: nomFichier([ex.raisonSociale, 'evaluation'], EXT_EXERCICE), donnees: texte(exporterExercice(ev)) },
    { nom: nomFichier([ex.raisonSociale, 'evaluation', 'enseignant'], EXT_EXERCICE), donnees: texte(exporterExerciceEnseignant(ev)) },
  ];
}
