// PDF des dossiers d'exercices : dossier de l'élève (situation, consignes, bilan d'ouverture, pièces)
// et corrigé de l'enseignant (écritures pièce par pièce, bouclement, bilan et compte de résultat).
// Fonctionne dans le navigateur (export à la demande) et dans Node (script de génération des fichiers).

import type { Exercice } from '../engine/exercice';
import { creerDossier, etiquetteNiveau } from '../engine/exercice';
import type { Compte } from '../engine/plan';
import type { PieceComptable } from '../engine/pieces';
import type { Dossier, LigneEcriture } from '../engine/dossier';
import { ajouterEcriture } from '../engine/journal';
import { ecrituresDeBouclement } from '../engine/closing';
import { bilan, compteDeResultat } from '../engine/statements';
import { repartir } from '../engine/repartition';
import { formatMontant as m } from '../engine/money';
import { formatDate as dt } from '../engine/dates';
import { cote, lignesEtat } from './copie';

type JsPDF = import('jspdf').jsPDF;
type AutoTable = (typeof import('jspdf-autotable'))['autoTable'];

const BLEU: [number, number, number] = [31, 78, 120];
const GRIS: [number, number, number] = [238, 242, 246];
const MARGE = 16;
const LARGEUR = 210 - 2 * MARGE;

async function outils(): Promise<{ doc: JsPDF; autoTable: AutoTable }> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  return { doc: new jsPDF({ unit: 'mm', format: 'a4' }), autoTable };
}

function finY(doc: JsPDF, defaut: number): number {
  return (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? defaut;
}

function piedDePage(doc: JsPDF, nom: string) {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(90);
    doc.setDrawColor(200).line(MARGE, 284, 210 - MARGE, 284);
    doc.text(nom, MARGE, 289);
    doc.text(`Page ${i} / ${total}`, 210 - MARGE, 289, { align: 'right' });
  }
}

/** Écrit un paragraphe avec retour à la ligne ; renvoie la nouvelle position verticale. */
function paragraphe(doc: JsPDF, texte: string, y: number, taille = 10, largeur = LARGEUR, x = MARGE): number {
  doc.setFont('helvetica', 'normal').setFontSize(taille).setTextColor(25);
  const lignes = doc.splitTextToSize(texte, largeur) as string[];
  for (const l of lignes) {
    if (y > 276) {
      doc.addPage();
      y = MARGE + 4;
    }
    doc.text(l, x, y);
    y += taille * 0.45;
  }
  return y + 1.5;
}

function titreSection(doc: JsPDF, texte: string, y: number): number {
  if (y > 255) {
    doc.addPage();
    y = MARGE + 4;
  }
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...BLEU).text(texte, MARGE, y);
  return y + 6;
}

/** Dessine une pièce comptable dans un cadre, à partir de la position y (nouvelle page conseillée). */
function dessinerPiece(doc: JsPDF, autoTable: AutoTable, p: PieceComptable, y: number): number {
  const y0 = y;
  const droite = 210 - MARGE - 4;
  // émetteur
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(20).text(p.emetteur.nom, MARGE + 4, y + 6);
  doc.setFont('helvetica', 'normal').setFontSize(9);
  let ya = y + 11;
  for (const l of p.emetteur.adresse ?? []) {
    doc.text(l, MARGE + 4, ya);
    ya += 4.2;
  }
  // titre, numéro, date
  doc.setFont('helvetica', 'bold').setFontSize(12).text(p.titre, droite, y + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal').setFontSize(9);
  let yt = y + 11;
  if (p.numero) {
    doc.text(`N° ${p.numero}`, droite, yt, { align: 'right' });
    yt += 4.2;
  }
  doc.text(dt(p.date), droite, yt, { align: 'right' });
  y = Math.max(ya, yt + 4.2) + 2;
  // destinataire
  if (p.destinataire) {
    doc.setFont('helvetica', 'bold').setFontSize(10).text(p.destinataire.nom, MARGE + LARGEUR / 2, y + 4);
    doc.setFont('helvetica', 'normal').setFontSize(9);
    let yd = y + 8.5;
    for (const l of p.destinataire.adresse ?? []) {
      doc.text(l, MARGE + LARGEUR / 2, yd);
      yd += 4.2;
    }
    y = yd + 2;
  }
  for (const t of p.texte ?? []) y = paragraphe(doc, t, y + 3, 10, LARGEUR - 8, MARGE + 4);
  if (p.lignes.length) {
    const avecQ = p.lignes.some((l) => l.quantite !== undefined);
    autoTable(doc, {
      startY: y + 2,
      margin: { left: MARGE + 4, right: MARGE + 4 },
      head: [avecQ ? ['Désignation', 'Quantité', 'Prix unitaire', 'Montant CHF'] : ['Désignation', 'Montant CHF']],
      body: p.lignes.map((l) =>
        avecQ
          ? [l.designation, l.quantite ?? '', l.prixUnitaire !== undefined ? m(l.prixUnitaire) : '', m(l.montant)]
          : [l.designation, m(l.montant)],
      ),
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.5, textColor: 20 },
      headStyles: { fillColor: GRIS, textColor: 20, fontStyle: 'bold' },
      columnStyles: avecQ
        ? { 1: { halign: 'right', cellWidth: 22 }, 2: { halign: 'right', cellWidth: 28 }, 3: { halign: 'right', cellWidth: 30 } }
        : { 1: { halign: 'right', cellWidth: 34 } },
    });
    y = finY(doc, y) + 3;
  }
  for (const t of p.totaux) {
    doc.setFont('helvetica', t.fort ? 'bold' : 'normal').setFontSize(10).setTextColor(20);
    doc.text(t.libelle, droite - 62, y + 4);
    doc.text(`CHF ${m(t.montant)}`, droite, y + 4, { align: 'right' });
    if (t.fort) doc.setDrawColor(40).line(droite - 62, y, droite, y);
    y += 5.5;
  }
  if (p.mentions?.length) {
    y += 2;
    doc.setDrawColor(190).setLineDashPattern([1, 1], 0).line(MARGE + 4, y, droite, y).setLineDashPattern([], 0);
    doc.setFont('helvetica', 'normal').setFontSize(8.5).setTextColor(80);
    for (const x of p.mentions) {
      y += 4.3;
      doc.text(x, MARGE + 4, y);
    }
  }
  y += 5;
  doc.setDrawColor(150).rect(MARGE, y0, LARGEUR, y - y0);
  return y;
}

function texteBilanOuverture(ex: Exercice, plan: Compte[]): { actif: string[][]; passif: string[][]; total: string } {
  const nom = new Map(plan.map((c) => [c.numero, c.intitule]));
  const liste = (r: Record<string, number>) => Object.entries(r).map(([n, v]) => [nom.get(n) ?? n, m(v)]);
  const total = Object.values(ex.ouvertureActif).reduce((s, v) => s + v, 0);
  return { actif: liste(ex.ouvertureActif), passif: liste(ex.ouverturePassif), total: m(total) };
}

/** Dossier de l'élève : à imprimer ou à déposer sur la plateforme de l'école. */
export async function genererPdfDossier(ex: Exercice, plan: Compte[], nomDocument: string): Promise<Blob> {
  const { doc, autoTable } = await outils();
  let y = MARGE + 4;
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...BLEU).text(ex.raisonSociale, MARGE, y + 4);
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(60);
  doc.text(`Dossier d'exercices · ${etiquetteNiveau(ex)}`, MARGE, y + 11);
  if (ex.sujets?.length) doc.text(`Sujets traités : ${ex.sujets.join(' · ')}`, MARGE, y + 17);
  y += 26;

  y = titreSection(doc, 'Votre situation', y);
  for (const par of (ex.situation ?? '').split(/\n\s*\n/).filter(Boolean)) y = paragraphe(doc, par.trim(), y + 1);

  y = titreSection(doc, 'Consignes', y + 4);
  for (const c of [
    `Ouvrez l'exercice « ${ex.titre} » dans Compta PME (fichier remis par votre enseignant ou liste des exercices).`,
    'Chaque pièce de ce dossier correspond à une opération. Lisez-la, déterminez les comptes touchés et comptabilisez-la ' +
      'dans le journal, en indiquant comme numéro de pièce le numéro de la pièce.',
    ex.introduction,
  ].filter(Boolean)) {
    y = paragraphe(doc, `• ${c}`, y + 1);
  }

  const o = texteBilanOuverture(ex, plan);
  if (o.actif.length || o.passif.length) {
    y = titreSection(doc, `Bilan d'ouverture au ${dt(ex.debut)}`, y + 4);
    const n = Math.max(o.actif.length, o.passif.length);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGE, right: MARGE },
      head: [['Actif', 'CHF', 'Passif', 'CHF']],
      body: Array.from({ length: n }, (_, i) => [...(o.actif[i] ?? ['', '']), ...(o.passif[i] ?? ['', ''])]),
      foot: [['Total', o.total, 'Total', o.total]],
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.4 },
      headStyles: { fillColor: BLEU, textColor: 255 },
      footStyles: { fillColor: GRIS, textColor: 20, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', cellWidth: 28 }, 3: { halign: 'right', cellWidth: 28 } },
    });
    y = finY(doc, y) + 6;
  }

  y = titreSection(doc, 'Liste des pièces', y + 2);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGE, right: MARGE },
    head: [['Pièce', 'Date', 'Document']],
    body: ex.operations.map((op) => [op.numero, dt(op.date), op.texte]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.4 },
    headStyles: { fillColor: BLEU, textColor: 255 },
    columnStyles: { 0: { cellWidth: 16 }, 1: { cellWidth: 24 } },
  });

  for (const op of ex.operations) {
    if (!op.piece) continue;
    doc.addPage();
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...BLEU).text(`Pièce ${op.numero}`, MARGE, MARGE + 4);
    dessinerPiece(doc, autoTable, op.piece, MARGE + 9);
  }
  piedDePage(doc, nomDocument);
  return doc.output('blob');
}

/** Applique le corrigé au dossier de l'exercice (pour calculer le bouclement et les états finaux). */
export function dossierCorrige(ex: Exercice, plan: Compte[]): Dossier {
  let d = creerDossier(ex, plan);
  (ex.corrige ?? []).forEach((c, i) => {
    const op = ex.operations.find((o) => o.numero === c.piece);
    const r = ajouterEcriture(d, { id: `E${i + 1}`, date: op?.date ?? ex.debut, piece: c.piece, libelle: 'Corrigé', lignes: c.lignes });
    if (r.ok) d = r.valeur;
  });
  return d;
}

/** Corrigé de l'enseignant. */
export async function genererPdfCorrige(ex: Exercice, plan: Compte[], nomDocument: string): Promise<Blob> {
  const { doc, autoTable } = await outils();
  const nom = new Map(plan.map((c) => [c.numero, c.intitule]));
  const compte = (n: string | null) => (n ? `${nom.get(n) ?? ''} (${n})` : '');
  const lignesCorrige = (lignes: LigneEcriture[]) => lignes.map((l) => [compte(l.debit), compte(l.credit), m(l.montant)]);

  let y = MARGE + 4;
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...BLEU).text(`Corrigé — ${ex.raisonSociale}`, MARGE, y + 4);
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(60).text(`${ex.titre} · ${etiquetteNiveau(ex)} · document pour l'enseignant`, MARGE, y + 11);
  y += 18;

  const corrige = new Map((ex.corrige ?? []).map((c) => [c.piece, c]));
  const corps: (string | { content: string; colSpan: number; styles: Record<string, unknown> })[][] = [];
  for (const op of ex.operations) {
    corps.push([{ content: `Pièce ${op.numero} · ${dt(op.date)} · ${op.texte}`, colSpan: 3, styles: { fillColor: GRIS, fontStyle: 'bold' } }]);
    const c = corrige.get(op.numero);
    if (c) corps.push(...lignesCorrige(c.lignes));
    else corps.push([{ content: 'Pas de corrigé saisi pour cette pièce.', colSpan: 3, styles: { fontStyle: 'italic' } }]);
  }
  const d = dossierCorrige(ex, plan);
  if (ex.parametres.corrigerBouclement) {
    const b = ecrituresDeBouclement(d);
    if (b.ok && b.valeur.length) {
      corps.push([{ content: 'Écritures de bouclement', colSpan: 3, styles: { fillColor: GRIS, fontStyle: 'bold' } }]);
      for (const e of b.valeur) corps.push(...lignesCorrige(e.lignes));
    }
  }
  y = titreSection(doc, 'Écritures', y);
  autoTable(doc, {
    startY: y,
    margin: { left: MARGE, right: MARGE, bottom: 18 },
    head: [['Débit', 'Crédit', 'Montant CHF']],
    body: corps,
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.4 },
    headStyles: { fillColor: BLEU, textColor: 255 },
    columnStyles: { 2: { halign: 'right', cellWidth: 30 } },
  });
  y = finY(doc, y) + 8;

  const rep = ex.parametres.repartition ? repartir(ex.parametres.repartition) : null;
  if (rep?.ok) {
    y = titreSection(doc, 'Tableau de répartition du bénéfice', y);
    const t = rep.tableau;
    autoTable(doc, {
      startY: y,
      margin: { left: MARGE, right: MARGE },
      body: [
        ['Bénéfice disponible', m(t.disponible)],
        ['Réserve légale issue du bénéfice', m(t.reserveLegale)],
        ['Dividendes (brut)', m(t.dividendes)],
        ['Tantièmes', m(t.tantiemes)],
        ['Réserves libres', m(t.reservesLibres)],
        ['Nouveau bénéfice reporté', m(t.nouveauReporte)],
        ['Impôt anticipé (35 %)', m(t.impotAnticipe)],
        ['Dividendes nets', m(t.dividendeNet)],
      ],
      styles: { font: 'helvetica', fontSize: 9, cellPadding: 1.4 },
      columnStyles: { 1: { halign: 'right', cellWidth: 34 } },
    });
    y = finY(doc, y) + 8;
  }

  const bi = bilan(d);
  const cr = compteDeResultat(d);
  for (const [titre, g, dr, tg, td] of [
    ['Bilan après les opérations (avant bouclement)', lignesEtat(bi.actif, nom), lignesEtat(bi.passif, nom), m(bi.totalActif), m(bi.totalPassif)],
    [
      'Compte de résultat',
      [...lignesEtat(cr.charges, nom), ...(cr.resultat > 0 ? [["Bénéfice de l'exercice", '', m(cr.resultat)]] : [])],
      [...lignesEtat(cr.produits, nom), ...(cr.resultat < 0 ? [["Perte de l'exercice", '', m(-cr.resultat)]] : [])],
      m(cr.totalEquilibre),
      m(cr.totalEquilibre),
    ],
  ] as const) {
    y = titreSection(doc, titre, y);
    autoTable(doc, {
      startY: y,
      margin: { left: MARGE, right: MARGE, bottom: 18 },
      body: cote(g as string[][], dr as string[][]),
      foot: [['Total', '', tg, 'Total', '', td]],
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.2 },
      footStyles: { fillColor: GRIS, textColor: 20, fontStyle: 'bold' },
      columnStyles: { 1: { halign: 'right', cellWidth: 20 }, 2: { halign: 'right', cellWidth: 22 }, 4: { halign: 'right', cellWidth: 20 }, 5: { halign: 'right', cellWidth: 22 } },
    });
    y = finY(doc, y) + 8;
  }
  piedDePage(doc, nomDocument);
  return doc.output('blob');
}
