// PDF des copies corrigées d'une classe, pour l'enseignant : tableau des résultats, puis une page par élève avec le
// résultat de chaque opération et, pour les opérations fausses, les écritures de l'élève à côté du corrigé.
// Les bibliothèques sont chargées uniquement au moment de l'export.

import type { Exercice } from '../engine/exercice';
import { etiquetteNiveau } from '../engine/exercice';
import type { LigneEcriture } from '../engine/dossier';
import { LIBELLES_DIAGNOSTIC } from '../engine/correction';
import { PIECE_BOUCLEMENT } from '../engine/correction-bouclement';
import { comparaisonOperation, type CorrectionCopie } from '../engine/notation';
import { formatMontant as m } from '../engine/money';
import type { Copie } from '../io/fichiers';

const BLEU: [number, number, number] = [31, 78, 120];
const GRIS: [number, number, number] = [238, 242, 246];
const ORANGE: [number, number, number] = [179, 74, 18];

export interface CopieCorrigee {
  copie: Copie;
  correction: CorrectionCopie;
}

const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

export async function genererPdfCopiesCorrigees(ex: Exercice, copies: CopieCorrigee[], nomDocument: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marge = 15;
  const styles = { font: 'helvetica', fontSize: 8.5, cellPadding: 1.4, textColor: 20 };
  const entete = { fillColor: BLEU, textColor: 255, fontStyle: 'bold' as const };
  const texteOp = (p: string) =>
    p === PIECE_BOUCLEMENT ? 'Écritures de bouclement' : (ex.operations.find((o) => o.numero === p)?.texte ?? '');

  // Page 1 : résultats de la classe.
  doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(...BLEU).text('Copies corrigées', marge, marge + 6);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60).text(`${ex.titre} · ${etiquetteNiveau(ex)}`, marge, marge + 13);
  const moyenne = copies.length ? copies.reduce((s, c) => s + c.correction.note, 0) / copies.length : 0;
  doc.text(`${copies.length} copie${copies.length > 1 ? 's' : ''} · moyenne ${moyenne.toFixed(2)}`, marge, marge + 19);
  autoTable(doc, {
    startY: marge + 24,
    margin: { left: marge, right: marge, bottom: 18 },
    head: [['Élève', 'Classe', 'Points', 'Note']],
    body: copies.map((c) => [
      `${c.copie.eleve.nom} ${c.copie.eleve.prenom}`,
      c.copie.eleve.classe,
      `${fmt(c.correction.points)} / ${fmt(c.correction.max)}`,
      c.correction.note.toFixed(1),
    ]),
    styles,
    headStyles: entete,
    columnStyles: { 2: { halign: 'right', cellWidth: 28 }, 3: { halign: 'right', cellWidth: 18 } },
  });

  // Une page par élève.
  for (const c of copies) {
    doc.addPage();
    const nom = new Map(c.copie.dossier.plan.map((x) => [x.numero, x.intitule]));
    const cpt = (n: string) => `${nom.get(n) ?? n} (${n})`;
    const lisibles = (lignes: LigneEcriture[]) =>
      lignes.length
        ? lignes.map((l) => [l.debit ? `D ${cpt(l.debit)}` : '', l.credit ? `C ${cpt(l.credit)}` : '', m(l.montant)].filter(Boolean).join(' · ')).join('\n')
        : 'Aucune écriture';
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...BLEU);
    doc.text(`${c.copie.eleve.nom} ${c.copie.eleve.prenom} · ${c.copie.eleve.classe}`, marge, marge + 6);
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(20);
    doc.text(`Points : ${fmt(c.correction.points)} / ${fmt(c.correction.max)} · Note : ${c.correction.note.toFixed(1)}`, marge, marge + 13);
    const corps: (string | { content: string; colSpan?: number; styles?: Record<string, unknown> })[][] = [];
    for (const o of c.correction.operations) {
      const juste = o.diagnostic === 'juste';
      corps.push([
        o.piece,
        texteOp(o.piece),
        { content: LIBELLES_DIAGNOSTIC[o.diagnostic], styles: juste ? {} : { textColor: ORANGE, fontStyle: 'bold' } },
        `${fmt(o.points)} / ${fmt(o.max)}`,
      ]);
      if (!juste) {
        const cmp = comparaisonOperation(ex, c.copie.dossier, o.piece);
        corps.push([
          '',
          { content: `Élève :\n${lisibles(cmp.eleve)}`, styles: { fillColor: GRIS, fontSize: 7.5 } },
          { content: `Corrigé :\n${lisibles(cmp.corrige)}`, colSpan: 2, styles: { fillColor: GRIS, fontSize: 7.5 } },
        ]);
      }
    }
    autoTable(doc, {
      startY: marge + 18,
      margin: { left: marge, right: marge, bottom: 18 },
      head: [['N°', 'Opération', 'Résultat', 'Points']],
      body: corps,
      styles,
      headStyles: entete,
      columnStyles: { 0: { cellWidth: 12 }, 2: { cellWidth: 52 }, 3: { halign: 'right', cellWidth: 20 } },
    });
  }

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(110);
    doc.text(nomDocument, marge, 290);
    doc.text(`Page ${i} / ${n}`, 195, 290, { align: 'right' });
  }
  return doc.output('blob');
}
