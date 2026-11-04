// Export PDF de la copie de l'élève : journal, balance, bilan, compte de résultat.
// Pied de page : nom du document et numéro de page. Police Helvetica (Arial n'est pas intégrable).
// Les bibliothèques sont chargées uniquement au moment de l'export.

import type { Dossier } from '../engine/dossier';
import type { Exercice } from '../engine/exercice';
import { LIBELLES_MODE, LIBELLES_NIVEAU } from '../engine/exercice';
import { balance } from '../engine/ledger';
import { bilan, compteDeResultat, type Groupe } from '../engine/statements';
import { estExtournee } from '../engine/journal';
import { formatMontant as m } from '../engine/money';
import { formatDate as dt } from '../engine/dates';

interface Eleve {
  prenom: string;
  nom: string;
  classe: string;
}

const BLEU: [number, number, number] = [31, 78, 120];
const ZEBRE: [number, number, number] = [241, 246, 251];

/** Lignes d'un état en forme de compte : [intitulé, montant, sous-total]. */
function lignesEtat(groupes: Groupe[], numeros: Map<string, string>): string[][] {
  const r: string[][] = [];
  for (const g of groupes) {
    if (g.titre) r.push([g.titre, '', '']);
    for (const p of g.postes) {
      const lib = p.numero ? `${p.numero} ${numeros.get(p.numero) ?? p.intitule}` : p.intitule;
      r.push(g.titre ? [`   ${lib}`, m(p.montant), ''] : [lib, '', m(p.montant)]);
    }
    if (g.titre) r.push(['', '', m(g.total)]);
  }
  return r;
}

function cote(a: string[][], b: string[][]): string[][] {
  const n = Math.max(a.length, b.length);
  return Array.from({ length: n }, (_, i) => [...(a[i] ?? ['', '', '']), ...(b[i] ?? ['', '', ''])]);
}

export async function genererPdfCopie(eleve: Eleve, ex: Exercice, d: Dossier, nomDocument: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const marge = 15;
  const intitules = new Map(d.plan.map((c) => [c.numero, c.intitule]));
  const styles = { font: 'helvetica', fontSize: 8.5, cellPadding: 1.4, textColor: 20 };
  const entete = { fillColor: BLEU, textColor: 255, fontStyle: 'bold' as const };
  let y = marge;

  const titre = (t: string) => {
    if (y > 250) {
      doc.addPage();
      y = marge;
    }
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...BLEU).text(t, marge, y + 5);
    y += 9;
  };
  const suite = () => {
    y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY ?? y) + 8;
  };

  // En-tête
  doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(...BLEU).text(ex.titre, marge, y + 6);
  y += 12;
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(20);
  const infos = [
    `Élève : ${eleve.prenom} ${eleve.nom}, classe ${eleve.classe}`,
    `Entreprise : ${d.raisonSociale} (${d.formeJuridique})`,
    `Exercice du ${dt(d.debut)} au ${dt(d.fin)} · niveau ${LIBELLES_NIVEAU[ex.niveau]} · ${LIBELLES_MODE[ex.mode]}`,
    `Document établi le ${new Date().toLocaleDateString('fr-CH')}`,
  ];
  infos.forEach((t) => {
    doc.text(t, marge, y + 4);
    y += 5.5;
  });
  y += 4;

  // Journal
  titre('Journal');
  const lignesJournal: string[][] = [];
  for (const e of d.ecritures) {
    const mention = e.extourneDe ? '' : estExtournee(d, e.id) ? ' (extournée)' : '';
    e.lignes.forEach((l, j) =>
      lignesJournal.push([
        j === 0 ? dt(e.date) : '',
        j === 0 ? e.piece : '',
        j === 0 ? e.libelle + mention : '',
        l.debit ?? '',
        l.credit ?? '',
        m(l.montant),
      ]),
    );
  }
  autoTable(doc, {
    startY: y,
    margin: { left: marge, right: marge, bottom: 18 },
    head: [['Date', 'Pièce', 'Libellé', 'Débit', 'Crédit', 'Montant']],
    body: lignesJournal.length ? lignesJournal : [['', '', 'Aucune écriture', '', '', '']],
    styles,
    headStyles: entete,
    alternateRowStyles: { fillColor: ZEBRE },
    columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 13 }, 3: { cellWidth: 15 }, 4: { cellWidth: 15 }, 5: { halign: 'right', cellWidth: 26 } },
  });
  suite();

  // Balance
  const b = balance(d);
  titre('Balance de vérification');
  autoTable(doc, {
    startY: y,
    margin: { left: marge, right: marge, bottom: 18 },
    head: [['Compte', 'Intitulé', 'Total débit', 'Total crédit', 'Solde débiteur', 'Solde créditeur']],
    body: [
      ...b.lignes.map((l) => [l.numero, l.intitule, m(l.debit), m(l.credit), l.soldeDebiteur ? m(l.soldeDebiteur) : '', l.soldeCrediteur ? m(l.soldeCrediteur) : '']),
    ],
    foot: [['', 'Totaux', m(b.totalDebit), m(b.totalCredit), m(b.totalSoldesDebiteurs), m(b.totalSoldesCrediteurs)]],
    styles,
    headStyles: entete,
    footStyles: { fillColor: [214, 228, 240], textColor: 20, fontStyle: 'bold', halign: 'right' },
    alternateRowStyles: { fillColor: ZEBRE },
    columnStyles: { 0: { cellWidth: 15 }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
  });
  suite();

  // États en forme de compte
  const etat = (t: string, gTitre: string, dTitre: string, gauche: string[][], droite: string[][], totalG: string, totalD: string) => {
    titre(t);
    autoTable(doc, {
      startY: y,
      margin: { left: marge, right: marge, bottom: 18 },
      head: [[gTitre, '', '', dTitre, '', '']],
      body: cote(gauche, droite),
      foot: [['Total', '', totalG, 'Total', '', totalD]],
      styles: { ...styles, fontSize: 8 },
      headStyles: entete,
      footStyles: { fillColor: [214, 228, 240], textColor: 20, fontStyle: 'bold' },
      columnStyles: {
        1: { halign: 'right', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 22 },
        4: { halign: 'right', cellWidth: 20 },
        5: { halign: 'right', cellWidth: 22 },
      },
      didParseCell: (h) => {
        const v = String(h.cell.raw ?? '');
        if (h.section === 'body' && (h.column.index === 0 || h.column.index === 3) && v && !v.startsWith(' ') && !/^\d/.test(v)) {
          h.cell.styles.fontStyle = 'bold';
          h.cell.styles.textColor = BLEU;
        }
        if (h.section === 'foot' && (h.column.index === 2 || h.column.index === 5)) h.cell.styles.halign = 'right';
      },
    });
    suite();
  };

  const bi = bilan(d);
  etat('Bilan', 'Actif', 'Passif', lignesEtat(bi.actif, intitules), lignesEtat(bi.passif, intitules), m(bi.totalActif), m(bi.totalPassif));
  const cr = compteDeResultat(d);
  const charges = lignesEtat(cr.charges, intitules);
  const produits = lignesEtat(cr.produits, intitules);
  if (cr.resultat > 0) charges.push(["Bénéfice de l'exercice", '', m(cr.resultat)]);
  if (cr.resultat < 0) produits.push(["Perte de l'exercice", '', m(-cr.resultat)]);
  etat('Compte de résultat', 'Charges', 'Produits', charges, produits, m(cr.totalEquilibre), m(cr.totalEquilibre));

  // Pied de page : nom du document et numéro de page
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(90);
    doc.setDrawColor(200).line(marge, 284, 210 - marge, 284);
    doc.text(nomDocument, marge, 289);
    doc.text(`Page ${i} / ${total}`, 210 - marge, 289, { align: 'right' });
  }
  return doc.output('blob');
}
