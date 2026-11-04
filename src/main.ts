import { mount } from 'svelte';
import App from './ui/App.svelte';
import './ui/theme.css';

const target = document.getElementById('app');
if (!target) throw new Error('Élément #app introuvable');

export default mount(App, { target });

// Fonctionnement hors ligne, uniquement sur le site publié.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    /* le site reste utilisable en ligne */
  });
}
