/**
 * FindCo Production Service Worker
 * Provides offline PWA app-shell resilience and asset caching.
 * Bypasses API requests and WebSocket upgrades.
 */

const CACHE_NAME = 'findco-app-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/findco-brand-logo.jpg'
];

// Install: precache the offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache issue:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve cached shell/assets, bypass API routes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API requests, payment webhooks, external telemetry, or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('posthog.com') ||
    url.hostname.includes('razorpay.com')
  ) {
    return;
  }

  // Stale-While-Revalidate for local assets, Cache-First for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // If network fails and requesting HTML navigation, fallback to root /
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
