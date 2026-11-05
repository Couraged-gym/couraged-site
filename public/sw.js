// Offline shell for the installed app. Only same-origin GETs are touched;
// Supabase (auth, data) always goes straight to the network.
const CACHE = 'couraged-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  // Pages: network first so a new deploy shows up right away; cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('/index.html', copy))
          return res
        })
        .catch(() => caches.match('/index.html')),
    )
    return
  }

  // JS, CSS, fonts, images: serve cached copy instantly, refresh it in the background.
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((hit) => {
        const fresh = fetch(req).then((res) => {
          if (res.ok) c.put(req, res.clone())
          return res
        }).catch(() => hit)
        return hit || fresh
      }),
    ),
  )
})
