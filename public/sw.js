const CACHE_NAME = "sharma-store-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate (clean old cache)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch (offline support)
self.addEventListener("fetch", (event) => {
  // We only want to handle GET requests, and not chrome-extension:// etc.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response, or try fetching from network
      return response || fetch(event.request).catch(() => {
        // Fallback to offline.html if network fails and it's a navigation request
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});
