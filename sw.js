// sw.js - Version simplifiée pour Calendrier Labos
const CACHE_VERSION = 'v6';
const CACHE_NAME = `labos-cache-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  console.log('SW install -', CACHE_NAME);
  // Skip le pré-cache, activer immédiatement
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW activate');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key.startsWith('labos-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Tout passe par le réseau, pas de cache
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    fetch(event.request).catch(() => 
      new Response('Hors ligne', { status: 503 })
    )
  );
});
