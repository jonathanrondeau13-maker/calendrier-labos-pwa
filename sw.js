// Version FIXE (ne change que quand tu déploies vraiment)
const CACHE_VERSION = 'v5';
const CACHE_NAME = 'labos-calendar-' + CACHE_VERSION;

// Install - ne rien pré-cacher, juste activer
self.addEventListener("install", event => {
  console.log("SW install — " + CACHE_NAME);
  self.skipWaiting();
});

// Activate - nettoyer seulement les ANCIENS caches (pas le courant)
self.addEventListener("activate", event => {
  console.log("SW activate — cleaning old caches");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('labos-calendar-') && key !== CACHE_NAME)
          .map(key => {
            console.log("Deleting old cache:", key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch - Network first, pas de cache (comme avant)
self.addEventListener("fetch", event => {
  if (!event.request.url.startsWith("http")) return;
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response("Hors ligne", { status: 503 });
    })
  );
});
