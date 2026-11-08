// Service worker mínimo: deixa o app instalável e abre o "casco" sem rede.
// Nada de dados é cacheado aqui: respostas e progresso sempre vão ao servidor.
const CACHE = 'shell-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/icon.svg', '/manifest.webmanifest'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.startsWith('/_app/immutable/')) {
    e.respondWith(caches.open(CACHE).then(async (c) => (await c.match(e.request)) ?? fetch(e.request).then((r) => (c.put(e.request, r.clone()), r))));
  }
});
