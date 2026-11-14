// Money Book service worker: lets the app open offline.
// It only caches the app's own files. Your entries live in localStorage and are never touched here.
const VERSION = "v1";
const APP_CACHE = "money-book-app-" + VERSION;
const FONT_CACHE = "money-book-fonts";
const APP_FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(APP_CACHE).then(c => c.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("money-book-app-") && k !== APP_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first for the page itself so updates show up, falling back to the cached copy when offline or slow.
async function pageFirst(request){
  const cache = await caches.open(APP_CACHE);
  try {
    const res = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000))
    ]);
    if (res && res.ok) cache.put("./", res.clone());
    return res;
  } catch (e) {
    return (await cache.match("./")) || (await cache.match("index.html")) || Response.error();
  }
}

// Cached copy straight away, refreshed in the background.
async function staleWhileRevalidate(request, cacheName){
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(res => {
    if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
    return res;
  }).catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === self.location.origin){
    event.respondWith(pageFirst(req));
  } else if (url.origin === self.location.origin){
    event.respondWith(staleWhileRevalidate(req, APP_CACHE));
  } else if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com"){
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
  }
});
