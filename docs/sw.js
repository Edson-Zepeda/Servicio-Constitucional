// docs/sw.js
const CACHE = 'app-v4';
const ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.webmanifest',
  './img/icon-192.png',
  './img/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Ignora terceros (mixpanel, cdns, etc.) para evitar errores y CORS
  if (url.origin !== self.location.origin) return;

  // Navegación/HTML: network-first con fallback a cache y offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || caches.match('./offline.html'))
    );
    return;
  }

  // Assets: cache-first
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match('./offline.html'));
    })
  );
});
