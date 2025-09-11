// Spectr SW v1 — runtime cache + offline fallback
const STATIC_CACHE = "spectr-static-v1";
const RUNTIME_CACHE = "spectr-runtime-v1";
const OFFLINE_URL = "/offline.html";
const API_CACHE = "spectr-api-v1";
const API_ALLOW = [/\/signals/, /\/news/, /\/arbitrage/, /\/predictions/];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll([OFFLINE_URL])));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k) && caches.delete(k)));
    if ('navigationPreload' in self.registration) await self.registration.navigationPreload.enable();
    self.clients.claim();
  })());
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET") return;

  // API — stale-while-revalidate
  if (API_ALLOW.some(rx => rx.test(url.pathname))) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || network;
    })());
    return;
  }

  // Navigations — network-first
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      try { return await fetch(req); }
      catch { const c = await caches.open(STATIC_CACHE); return c.match(OFFLINE_URL); }
    })());
    return;
  }

  // Assets — cache-first
  if (["style","script","image","font"].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;
      try { const res = await fetch(req); if (res.ok) cache.put(req, res.clone()); return res; }
      catch { return cached || Response.error(); }
    })());
  }
});
