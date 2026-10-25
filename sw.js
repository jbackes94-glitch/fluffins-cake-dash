/* Offline support: keep a copy of the game on the phone and refresh it in the background. */
const CACHE = 'cake-dash-v1';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'i18n.js', 'art.js', 'scenery.js', 'staden.js', 'audio.js', 'game.js', 'ui.js',
  'fonts/fredoka-latin-400-normal.woff2', 'fonts/fredoka-latin-500-normal.woff2', 'fonts/fredoka-latin-600-normal.woff2',
  'fonts/fredoka-latin-700-normal.woff2', 'fonts/lilita-one-latin-400-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-64.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // stale-while-revalidate: answer from the phone instantly, fetch the newest version for next time
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, {ignoreSearch: true});
    const net = fetch(req).then(res => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
