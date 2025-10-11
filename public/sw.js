
// Spectr SW v2 — network-first strategy for critical assets
const CACHE_VERSION = 'v2';
const STATIC_CACHE = `spectr-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `spectr-runtime-${CACHE_VERSION}`;
const API_CACHE = `spectr-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const API_ALLOW = [/\/signals/, /\/news/, /\/arbitrage/, /\/predictions/];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL]))
  );
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k) && caches.delete(k)));
    if ('navigationPreload' in self.registration) await self.registration.navigationPreload.enable();
    self.clients.claim();
  })());


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

}

  const url = new URL(request.url);

  if (API_ALLOW.some((rx) => rx.test(url.pathname))) {
    event.respondWith(apiStaleWhileRevalidate(request));
    return;
  }

  
  if (request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(assetNetworkFirst(request));
  }
});

async function navigationNetworkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    const offline = await cache.match(OFFLINE_URL);
    return offline ?? Response.error();
  }
}

async function assetNetworkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    return cached ?? Response.error();
  }
}

async function apiStaleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  return cached || (await networkFetch) || Response.error();
}