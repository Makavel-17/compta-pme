// Fonctionnement hors ligne : réseau d'abord, copie locale si le réseau est indisponible.
// Seuls les fichiers du site lui-même sont mis en cache ; aucune donnée d'élève ne transite ici.
const CACHE = 'compta-pme-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(req, copie));
        }
        return rep;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
});
