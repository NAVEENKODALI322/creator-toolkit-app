/* Creator Toolkit service worker.
   Keeps the app shell on the phone so it opens offline. AI requests (/api/) are never cached. */
var CACHE = 'ctk-app-v1';
var SHELL = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/privacy.html',
  '/manifest.webmanifest',
  '/fonts/inter-400.woff',
  '/fonts/inter-500.woff',
  '/fonts/inter-600.woff',
  '/fonts/inter-700.woff',
  '/icons/icon-48.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // Add one by one so a single missing file does not stop the whole install.
      return Promise.all(SHELL.map(function (url) {
        return cache.add(url).catch(function () { /* skip */ });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf('/api/') === 0) return;
  if (url.pathname.indexOf('/.well-known/') === 0 || url.pathname === '/assetlinks.json') return;

  // Pages: try the network first so updates show up, fall back to the saved copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () {
        return caches.match(request).then(function (hit) {
          return hit || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // Files (css, js, fonts, icons): show the saved copy at once and refresh it in the background.
  event.respondWith(
    caches.match(request).then(function (hit) {
      var refresh = fetch(request).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
        }
        return response;
      }).catch(function () { return hit; });
      return hit || refresh;
    })
  );
});
