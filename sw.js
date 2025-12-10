// sw.js - Version optimisée pour Calendrier Labos
const CACHE_VERSION = 'v5';
const STATIC_CACHE = `labos-static-${CACHE_VERSION}`;

// Assets statiques qui changent rarement
const STATIC_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', event => {
  console.log('SW install');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('SW activate');
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== STATIC_CACHE)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Google Apps Script = TOUJOURS réseau (données fraîches obligatoires)
  if (url.hostname.includes('script.google.com') || 
      url.hostname.includes('googleapis.com')) {
    return; // Laisse le navigateur gérer normalement
  }
  
  // Google Fonts = Cache-first (change jamais)
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached => 
        cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }
  
  // Tout le reste = Network-first (pas de cache pour garder données fraîches)
  event.respondWith(
    fetch(event.request).catch(() => 
      new Response('Hors ligne', { status: 503, statusText: 'Offline' })
    )
  );
});
