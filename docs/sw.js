const CACHE_NAME = 'pwa-cache-v1';
const PRECACHE = ['./','./index.html'];
const SCOPE = new URL(self.registration.scope).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (!url.pathname.startsWith(SCOPE)) return;

  if (e.request.mode === 'navigate') {
    e.respondWith((async()=> {
      try {
        const fresh = await fetch(e.request);
        (await caches.open(CACHE_NAME)).put(e.request, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(e.request)) || caches.match('./index.html');
      }
    })());
    return;
  }

  if (e.request.method === 'GET') {
    e.respondWith((async()=> {
      const cached = await caches.match(e.request);
      if (cached) return cached;
      try {
        const fresh = await fetch(e.request);
        (await caches.open(CACHE_NAME)).put(e.request, fresh.clone());
        return fresh;
      } catch {
        return caches.match('./index.html');
      }
    })());
  }
});
