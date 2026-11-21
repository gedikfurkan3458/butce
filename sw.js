// Basit önbellek: sayfa ve kütüphaneler internet yokken de açılsın.
// Veri (Firestore) kendi çevrimdışı önbelleğini kullanır, burada tutulmaz.
const CACHE = 'butce-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ok =
    url.origin === self.location.origin ||
    url.hostname === 'cdn.jsdelivr.net' ||
    (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  if (!ok) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req);
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
