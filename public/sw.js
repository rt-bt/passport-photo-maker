const CACHE_NAME = 'passport-maker-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Let the browser handle fetches with fallback cache
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
