const CACHE_NAME = 'form-builder-v3';
const OFFLINE_CACHE = 'offline-v3';

// All resources to cache for offline use
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/formBuilder.js',
  './js/pdfGenerator.js',
  './js/signaturePad.js',
  './js/router.js',
  './js/cloudBackup.js',
  './manifest.json',
  // External libraries - we'll cache these from CDN on first load
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            // Could return a custom offline page here
          });
      })
  );
});

// Background sync for cloud backup when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'backup-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // This will be called when internet is available
  // You can implement cloud backup logic here
  console.log('[Service Worker] Background sync triggered');

  // Notify the app that sync is happening
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_START'
    });
  });

  try {
    // TODO: Implement actual backup logic when you set up cloud storage
    // For now, just log success
    console.log('[Service Worker] Data sync would happen here');

    // Notify completion
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        success: true
      });
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        success: false,
        error: error.message
      });
    });
  }
}

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
