const CACHE = "edutechsrm-v3"
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192-v2.png",
  "/icon-512-v2.png",
  "/apple-icon-v2.png",
  "/favicon-v2.svg",
  "/icon-v2.svg",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET" && request.method !== "HEAD") return

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithCache(request))
    return
  }

  if (STATIC_ASSETS.includes(url.pathname) || /\.(js|css|png|jpg|svg|ico|woff2?|webp|avif)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)))
})

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request)
    if (response.ok || response.type === "opaqueredirect") {
      const cloned = response.clone()
      caches.open(CACHE).then((cache) => {
        if (cloned.ok && request.method === "GET") cache.put(request, cloned)
      })
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response("Offline", { status: 503 })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cloned = response.clone()
      caches.open(CACHE).then((cache) => cache.put(request, cloned))
    }
    return response
  } catch {
    return new Response("Offline", { status: 503 })
  }
}
