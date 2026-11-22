// Simple service worker so the app also works offline.
const CACHE = 'cfy-v1';
// js/config.js is not listed because it only exists in the published version.
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/model.js', 'js/store.js', 'js/i18n.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (fresh version); fall back to the cached copy when offline.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // database (Supabase) responses are never cached — only the app's own files
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && url.hostname !== 'cdn.jsdelivr.net') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
