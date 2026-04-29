// Spectr SW v6 — Force update and aggressive cache cleanup
const CACHE_VERSION = 'v6';
const STATIC_CACHE = `spectr-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `spectr-runtime-${CACHE_VERSION}`;
const API_CACHE = `spectr-api-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Critical API routes to cache
const API_ALLOW = [/\/signals/, /\/news/, /\/arbitrage/, /\/predictions/, /\/intelligence/];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([
      OFFLINE_URL,
      '/',
      '/index.html',
      '/logo.png',
      '/icon-192.png',
      '/icon-512.png'
    ]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k)) {
        return caches.delete(k);
      }
    }));
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // 1. API Strategy: Stale-While-Revalidate
  if (API_ALLOW.some(rx => rx.test(url.pathname))) {
    event.respondWith(apiStaleWhileRevalidate(request));
    return;
  }

  // 2. Navigation Strategy: Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationNetworkFirst(request));
    return;
  }

  // 3. Static Assets Strategy: Cache-First for speed
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    event.respondWith(assetCacheFirst(request));
  }
});

async function assetCacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeout);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    clearTimeout(timeout);
    return Response.error();
  }
}

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
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    return offline || Response.error();
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
    return cached || Response.error();
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