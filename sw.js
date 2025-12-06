// Version auto-bump pour FORCER un reset total du cache
const CACHE_NAME = 'labos-calendar-v4-' + Date.now();

// Aucun pré-cache → tout sera chargé directement depuis le réseau
self.addEventListener("install", event => {
  console.log("SW install — skipWaiting");
  self.skipWaiting();
});

// ACTIVATE — efface TOUS les anciens caches
self.addEventListener("activate", event => {
  console.log("SW activate — clearing old caches");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// FETCH — passe TOUT au réseau (0% cache)
// bute complètement le cache pour éviter affichage/clic décalé
self.addEventListener("fetch", event => {
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(fetch(event.request).catch(() => {
    // fallback uniquement si nécessaire, mais normalement jamais utilisé
    return new Response("Offline", { status: 503 });
  }));
});
