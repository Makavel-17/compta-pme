// Produit une page HTML autonome du guide d'utilisation (à partager avec des collègues), à partir de src/data/guide.ts.
// Lancer avec : npm run guide (écrit public/guide.html, publié avec le site).
import { writeFileSync } from 'node:fs';
import { GUIDE, type BlocGuide, type PartieGuide } from '../src/data/guide';

const SITE = 'https://klaidi-b.github.io/compta-pme/';
const args = process.argv.slice(2).filter((a) => a !== '--');
const autonome = args.includes('--autonome'); // document HTML complet (site public), sinon fragment pour une page Claude
const sortie = args.find((a) => !a.startsWith('--')) ?? 'guide-compta-pme.html';

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function bloc(b: BlocGuide): string {
  switch (b.type) {
    case 'p':
      return `<p>${esc(b.texte)}</p>`;
    case 'etapes':
      return `<ol class="etapes">${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'liste':
      return `<ul>${b.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'retenir':
      return `<div class="retenir"><span class="etiquette">À retenir</span><p>${esc(b.texte)}</p></div>`;
  }
}

function partie(p: PartieGuide): string {
  return `<section class="partie" id="${p.id}">
  <h2>${esc(p.titre)}</h2>
  <p class="intro">${esc(p.intro)}</p>
  ${p.sections
    .map((s) => `<article class="section" id="${p.id}-${s.id}"><h3>${esc(s.titre)}</h3>${s.blocs.map(bloc).join('\n')}</article>`)
    .join('\n')}
</section>`;
}

function sommaire(p: PartieGuide): string {
  return `<div class="som"><h2 class="som-titre"><a href="#${p.id}">${esc(p.titre)}</a></h2><ol>${p.sections
    .map((s) => `<li><a href="#${p.id}-${s.id}">${esc(s.titre)}</a></li>`)
    .join('')}</ol></div>`;
}

// Enseignants d'abord : la page s'adresse aux collègues.
const parties = [...GUIDE].sort((a, b) => (a.id === 'enseignant' ? -1 : b.id === 'enseignant' ? 1 : 0));

const html = `<title>Guide Compta PME</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Mise en page : colonne de lecture unique, sommaire en tête, charte de l'application (bleu structure, orange d'action). */
:root {
  --fond: #ffffff; --texte: #1d2733; --discret: #5a6675; --structure: #1F4E78; --accent: #C4501A;
  --pale: #F1F6FB; --selection: #D6E4F0; --bordure: #d5dde6;
  --police: Arial, "Helvetica Neue", Helvetica, sans-serif;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --fond: #121a22; --texte: #e3e9ef; --discret: #9fb0c1; --structure: #8fbbe3; --accent: #f08a55;
  --pale: #1a2632; --selection: #22384d; --bordure: #2c3b4a; color-scheme: dark } }
:root[data-theme="dark"] {
  --fond: #121a22; --texte: #e3e9ef; --discret: #9fb0c1; --structure: #8fbbe3; --accent: #f08a55;
  --pale: #1a2632; --selection: #22384d; --bordure: #2c3b4a; color-scheme: dark }
html, body { margin: 0; }
body { background: var(--fond); color: var(--texte); font-family: var(--police); font-size: 16px; line-height: 1.55; }
.page { max-width: 760px; margin: 0 auto; padding-block: 32px 64px;
  padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header { border-bottom: 3px solid var(--structure); padding-bottom: 18px; margin-bottom: 24px; }
.sur-titre { text-transform: uppercase; letter-spacing: 0.08em; font-size: 12px; color: var(--discret); margin: 0 0 6px; }
h1 { font-size: 30px; margin: 0 0 8px; color: var(--structure); text-wrap: balance; }
.chapeau { margin: 0; max-width: 62ch; }
.acces { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; margin-top: 14px; }
.lien-site { display: inline-block; background: var(--accent); color: #fff; text-decoration: none; font-weight: bold;
  padding: 8px 14px; border-radius: 3px; }
.lien-site:focus-visible, a:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.acces code { font-size: 14px; color: var(--discret); word-break: break-all; }
.demarrage { background: var(--pale); border: 1px solid var(--bordure); border-radius: 4px; padding: 16px 20px; margin-bottom: 28px; }
.demarrage h2 { font-size: 18px; margin: 0 0 8px; color: var(--structure); }
.demarrage ol { margin: 0; padding-left: 22px; }
nav.sommaire { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px 32px; margin-bottom: 36px; }
.som-titre { font-size: 15px; margin: 0 0 6px; }
.som ol { margin: 0; padding-left: 20px; font-size: 14px; }
a { color: var(--structure); }
.partie { margin-top: 40px; }
.partie > h2 { font-size: 24px; color: var(--structure); border-bottom: 1px solid var(--bordure); padding-bottom: 6px; margin: 0 0 8px; }
.intro { color: var(--discret); max-width: 65ch; }
.section { margin-top: 26px; scroll-margin-top: 16px; }
.section h3 { font-size: 18px; margin: 0 0 8px; text-wrap: balance; }
.section p, .section li { max-width: 68ch; }
ul, ol { padding-left: 22px; }
li { margin: 4px 0; }
ol.etapes { counter-reset: e; list-style: none; padding-left: 0; }
ol.etapes li { counter-increment: e; position: relative; padding-left: 34px; margin: 8px 0; }
ol.etapes li::before { content: counter(e); position: absolute; left: 0; top: 1px; width: 22px; height: 22px; border-radius: 50%;
  background: var(--selection); color: var(--structure); font-weight: bold; font-size: 13px; text-align: center; line-height: 22px;
  font-variant-numeric: tabular-nums; }
.retenir { border-left: 4px solid var(--accent); background: var(--pale); padding: 10px 14px; margin: 12px 0; }
.retenir p { margin: 2px 0 0; }
.etiquette { text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; font-weight: bold; color: var(--accent); }
footer { margin-top: 48px; border-top: 1px solid var(--bordure); padding-top: 12px; font-size: 13px; color: var(--discret); }
</style>
<div class="page">
<header>
  <p class="sur-titre">École de commerce Aimée-Stitelmann · Comptabilité</p>
  <h1>Guide d'utilisation de Compta PME</h1>
  <p class="chapeau">Logiciel de comptabilité en partie double pour les classes CFC et de maturité professionnelle. Il
  fonctionne dans le navigateur, sans compte ni installation ; aucune donnée d'élève n'est envoyée en ligne.</p>
  <div class="acces"><a class="lien-site" href="${SITE}">Ouvrir Compta PME</a><code>${SITE}</code></div>
</header>

<section class="demarrage" aria-labelledby="demarrer">
  <h2 id="demarrer">Démarrer en cinq minutes</h2>
  <ol>
    <li>Ouvrez le site, puis cliquez sur « Espace enseignant » et choisissez votre propre code d'accès.</li>
    <li>Onglet « Exercices » : « Partir d'un exemple… », puis « Copier cet exemple » pour obtenir un exercice à adapter.</li>
    <li>Modifiez l'entreprise, le bilan d'ouverture et les opérations, puis saisissez le corrigé dans le journal.</li>
    <li>« Exporter pour les élèves » : déposez le fichier obtenu sur la plateforme de la classe.</li>
    <li>Récupérez les copies des élèves et importez-les dans l'onglet « Copies » pour obtenir les notes.</li>
  </ol>
</section>

<nav class="sommaire" aria-label="Sommaire">${parties.map(sommaire).join('')}</nav>

${parties.map(partie).join('\n')}

<footer>Ce guide reprend celui qui est intégré au logiciel (bouton « Guide » de la page d'accueil et de la barre latérale).</footer>
</div>
`;

const document = autonome
  ? `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${html.replace('<div class="page">', '</head>\n<body>\n<div class="page">')}</body>
</html>
`
  : html;
writeFileSync(sortie, document, 'utf-8');
console.log(`Guide écrit : ${sortie}`);
