<!-- Pictogrammes au trait de la barre latérale (dessinés pour l'application, sans bibliothèque). -->
<script lang="ts">
  let { nom }: { nom: string } = $props();
  const TRACES: Record<string, string> = {
    tableau: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5',
    journal: 'M6 3.5h9l3.5 3.5v13.5H6zM9 9h7M9 13h7M9 17h4',
    salaire: 'M4 6h16v12H4zM4 10h16M8 15h3',
    comptes: 'M4 5h16M12 5v14M4 19h16',
    grandlivre: 'M4 4h16v16H4zM4 9h16M9 9v11',
    balance: 'M12 4v16M6 7h12M4 14l2-6 2 6a2 2 0 0 1-4 0zM16 14l2-6 2 6a2 2 0 0 1-4 0z',
    bilan: 'M4 20V10M10 20V4M16 20v-7M2 20h20',
    resultat: 'M3 17l6-6 4 4 8-8M15 7h6v6',
    degres: 'M4 6h16M6 10h12M8 14h8M10 18h4',
    flux: 'M4 8h13l-3-3M20 16H7l3 3',
    analyse: 'M12 3a9 9 0 1 0 9 9h-9z',
    seuil: 'M3 20h18M4 17 20 6M4 12h16',
    tva: 'M6 4h12v16H6zM9 8h6M9 12h6M9 16h3',
    bouclement: 'M5 12.5l4.5 4.5L19 7',
    repartition: 'M12 3v9l7 4M12 12l-7 4',
    theorie: 'M4 5.5c3-1.5 5.5-1.5 8 0 2.5-1.5 5-1.5 8 0V19c-3-1.5-5.5-1.5-8 0-2.5-1.5-5-1.5-8 0zM12 5.5V19',
  };
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" class="icone"><path d={TRACES[nom] ?? TRACES.journal} /></svg>

<style>
  .icone { width: 17px; height: 17px; flex: none; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; opacity: 0.9; }
</style>
