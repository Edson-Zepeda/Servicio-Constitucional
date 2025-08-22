// Service Worker básico con precache + offline fallback
const CACHE = 'app-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/maskable-512.png'
  // agrega aquí /styles.css, /app.js si los tienes como estáticos
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Nunca cachear el API
  if (url.pathname.startsWith('/api/')) return;

  // Navegación (HTML): network-first con fallback offline
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      }).catch(async () => (await caches.match(req)) || caches.match('/offline.html'))
    );
    return;
  }

  // Assets: cache-first
  e.respondWith(
    caches.match(req).then(hit =>
      hit || fetch(req).then(res => {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
        return res;
      })
    )
  );
});
