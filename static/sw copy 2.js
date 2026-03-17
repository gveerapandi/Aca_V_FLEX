const CACHE_NAME = "trackit-cache-v2";
const ASSETS_TO_CACHE = [
  "/", // index.html
  "/favicon.ico",
  "/manifest.json",
  "/logo.png",

  // Next.js chunks
  "/_next/static/chunks/139.7a5a8e93a21948c1.js",
  "/_next/static/chunks/176-dbfe7d379a5d476e.js",
  "/_next/static/chunks/493-b4f225428850c5f5.js",
  "/_next/static/chunks/4bd1b696-c023c6e3521b1417.js",
  "/_next/static/chunks/646.f342b7cffc01feb0.js",
  "/_next/static/chunks/740-eb4fcbbec08fd0f9.js",
  "/_next/static/chunks/870fdd6f-81b50010a8cd8835.js",
  "/_next/static/chunks/framework-292291387d6b2e39.js",
  "/_next/static/chunks/main-1e4b9f954557e26e.js",
  "/_next/static/chunks/main-app-1d748387e71fb1f0.js",
  "/_next/static/chunks/polyfills-42372ed130431b0a.js",
  "/_next/static/chunks/webpack-67c48df9b6bd84bc.js",

  // App-specific chunks
  "/_next/static/chunks/app/layout-1e90e262b0d8b12c.js",
  "/_next/static/chunks/app/page-1a5e87ce94ae466f.js",

  // API routes
  "/_next/static/chunks/app/api/login/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/api/logout/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/api/updateAttendance/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/api/updateCalendar/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/api/updateMarks/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/api/updateTimetable/route-a43aef4d9a0ea970.js",

  // Pages
  "/_next/static/chunks/app/attendance/page-dc25b18850d3e484.js",
  "/_next/static/chunks/app/calendar/page-e114c02ff960e0e5.js",
  "/_next/static/chunks/app/courses/page-f4f52b300d7c21b1.js",
  "/_next/static/chunks/app/dashboard/page-698b289bbbdcbf0e.js",
  "/_next/static/chunks/app/links/page-51556e7610734099.js",
  "/_next/static/chunks/app/marks/page-aa8fcb24e3929c61.js",
  "/_next/static/chunks/app/profile/page-01ecf8112a86e3f1.js",
  "/_next/static/chunks/app/sitemap.xml/route-a43aef4d9a0ea970.js",
  "/_next/static/chunks/app/timetable/page-21ec777b4349742d.js",
  "/_next/static/chunks/app/_not-found/page-4b572ad1d6175cd4.js",

  // Pages folder
  "/_next/static/chunks/pages/_app-335f4b33686a587c.js",
  "/_next/static/chunks/pages/_error-244b1c5184f30742.js",

  // CSS
  "/_next/static/css/12af5e97ec75a2c2.css",
  "/_next/static/css/14ede2c78b3ee2e1.css",
  "/_next/static/css/560ca84b9fb23066.css",
  "/_next/static/css/cf7d4ad2e81b1923.css",
  "/_next/static/css/cffcfbd4456afd59.css",
  "/_next/static/css/fe900db6ff3fbb30.css",

  // Media
  "/_next/static/media/4cf2300e9c8272f7-s.p.woff2",
  "/_next/static/media/747892c23ea88013-s.woff2",
  "/_next/static/media/8d697b304b401681-s.woff2",
  "/_next/static/media/93f479601ee12b01-s.p.woff2",
  "/_next/static/media/9610d9e46709d722-s.woff2",
  "/_next/static/media/ba015fad6dcf6784-s.woff2",

  // Build manifests
  "/_next/static/nhIWAIxGd8UhTJnC45C4H/_buildManifest.js",
  "/_next/static/nhIWAIxGd8UhTJnC45C4H/_ssgManifest.js",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching app shell");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve cached assets or fetch from network
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // return cached asset
      }
      return fetch(request)
        .then((response) => {
          // Cache the new response
          return caches.open(CACHE_NAME).then((cache) => {
            // Only cache same-origin requests
            if (request.url.startsWith(self.location.origin)) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // fallback (optional)
          if (request.destination === "document") {
            return caches.match("/");
          }
        });
    })
  );
});
