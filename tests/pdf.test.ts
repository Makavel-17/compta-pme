import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { demoCfc2 } from '../src/data/demo-cfc2';
import { creerDossier } from '../src/engine/exercice';
import { ajouterEcriture } from '../src/engine/journal';
import { genererPdfCopie } from '../src/pdf/copie';
import { plan } from './fixtures';

describe('export PDF de la copie', () => {
  it('contient journal, balance, états et un pied de page numéroté', async () => {
    let d = creerDossier(demoCfc2, plan);
    demoCfc2.corrige!.forEach((c, i) => {
      const op = demoCfc2.operations.find((o) => o.numero === c.piece)!;
      const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op.date, piece: c.piece, libelle: op.texte.slice(0, 50), lignes: c.lignes });
      if (r.ok) d = r.valeur;
    });
    const nom = 'Martin_Lea_2CFC1_Papeterie.pdf';
    const blob = await genererPdfCopie({ prenom: 'Léa', nom: 'Martin', classe: '2CFC1' }, demoCfc2, d, nom);
    const texte = await blob.text();
    expect(texte.startsWith('%PDF')).toBe(true);
    for (const t of ['Journal', 'Balance de v', 'Bilan', 'Compte de r', nom, 'Page 1 /']) expect(texte).toContain(t);
    if (process.env.PDF_SORTIE) writeFileSync(process.env.PDF_SORTIE, Buffer.from(await blob.arrayBuffer()));
  });
});
