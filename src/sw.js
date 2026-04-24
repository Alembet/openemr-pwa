// Service Worker — Workbox injectManifest strategy
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute }           from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin }  from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Injected by Workbox at build time
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── Navigation (HTML pages) — Network First ─────────────────────────────────
// Turbo Drive requests pages; we serve fresh HTML but fall back to cache.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 5,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }),
      ],
    })
  )
);

// ── API responses — Stale While Revalidate ───────────────────────────────────
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 5 }),
    ],
  })
);

// ── Static assets — Cache First ──────────────────────────────────────────────
registerRoute(
  ({ request }) => ['style', 'script', 'image', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }),
    ],
  })
);

// ── Background sync for offline form submissions ─────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncOfflineForms());
  }
});

async function syncOfflineForms() {
  const db    = await openDB();
  const forms = await db.getAll('offline-forms');
  for (const form of forms) {
    try {
      await fetch(form.url, { method: form.method, body: form.body, headers: form.headers });
      await db.delete('offline-forms', form.id);
    } catch {
      // Will retry on next sync
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('openemr-pwa', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('offline-forms', { keyPath: 'id', autoIncrement: true });
    req.onsuccess = e => resolve({
      getAll: store => new Promise(r => { const t = e.target.result.transaction(store,'readonly'); t.objectStore(store).getAll().onsuccess = ev => r(ev.target.result); }),
      delete: (store, id) => new Promise(r => { const t = e.target.result.transaction(store,'readwrite'); t.objectStore(store).delete(id).onsuccess = r; }),
    });
    req.onerror = reject;
  });
}
