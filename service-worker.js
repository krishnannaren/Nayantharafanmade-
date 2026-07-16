/* =========================================================
   Nayantharafanmade — service-worker.js
   Offline-first cache for the app shell + background sync stub
   for the contact form (queues submissions made while offline).
   ========================================================= */

const CACHE_NAME = "nayantharafanmade-v4";
const APP_SHELL = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/404.html",
  "/offline.html",
  "/privacy.html",
  "/terms.html",
  "/contact.html",
  "/about.html",
  "/gallery.html",
  "/movies.html",
  "/videos.html",
  "/news.html",
  "/fanzone.html",
  "/search.html",
  "/favicon.svg",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for navigation requests, cache-first for static assets.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match("/offline.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

/* =========================================================
   BACKGROUND SYNC (stub)
   The contact form currently posts nowhere (no backend is wired
   up yet — see contact.html). Once a real form endpoint exists,
   the page can store a pending submission in IndexedDB and call
   `registration.sync.register('contact-form-sync')`; this handler
   is the receiving end that would flush the queue when connectivity
   returns. Left as a documented no-op until a backend is connected.
   ========================================================= */
self.addEventListener("sync", (event) => {
  if (event.tag === "contact-form-sync") {
    event.waitUntil(Promise.resolve());
  }
});
