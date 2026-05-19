// Derive base path from the SW's own URL so this file works at any sub-path.
// Dev  : SW at /sw.js             → BASE_PATH = ""
// Pages: SW at /roznaamcha/sw.js  → BASE_PATH = "/roznaamcha"
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, "");

const CACHE_NAME = "roznaamcha-v1";
const OFFLINE_URL = BASE_PATH + "/offline/";

// Firebase and Google API origins — never intercept these
const BYPASS_HOSTNAMES = [
  "firebaseio.com",
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "accounts.google.com",
  "apis.google.com",
];

function shouldBypass(url) {
  return BYPASS_HOSTNAMES.some(
    (h) => url.hostname === h || url.hostname.endsWith("." + h),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("roznaamcha-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Let Firebase and Google API calls go straight to the network
  if (shouldBypass(url)) return;

  // Cache-first: Next.js immutable static assets (content-hashed filenames)
  if (url.pathname.startsWith(BASE_PATH + "/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Cache-first: PWA icons and manifest (stable static files)
  if (
    url.pathname.startsWith(BASE_PATH + "/icons/") ||
    url.pathname === BASE_PATH + "/manifest.webmanifest"
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        });
      }),
    );
    return;
  }

  // Network-first: HTML navigation — fresh when online, cached or offline page when not
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    );
  }
});
