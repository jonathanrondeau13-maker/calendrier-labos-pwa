// Augmente la version pour forcer le refresh
const CACHE_NAME = "labos-calendar-v5";

// Tout ce qui est stocké statiquement
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "images/icon-192x192.png",
  "images/icon-512x512.png"
];

// INSTALL — met en cache les fichiers nécessaires
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // active immédiatement la nouvelle version
});

// ACTIVATE — supprime les vieux caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// FETCH — stratégie "network first, fallback cache"
self.addEventListener("fetch", event => {

  // On ignore les requêtes chrome-extension etc.
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si la ressource peut être mise en cache → on la met à jour
        if (networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse.clone();
      })
      .catch(() => {
        // Offline → fallback cache
        return caches.match(event.request);
      })
  );
});
