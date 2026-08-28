const CACHE = 'colegio-antonia-v13';
const CORE_ASSETS = [
  './',
  './index.html',
  './english.html',
  './language.html',
  './styles.css',
  './curriculum.css',
  './english.css',
  './app.js',
  './english.js',
  './language.js',
  './progress-controls.js',
  './manifest.webmanifest',
  './logo-antonia.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response || !response.ok) return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return cacheResponse(request, response);
  } catch {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw new Error('offline-and-not-cached');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  return cacheResponse(request, response);
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const pathname = url.pathname;
  const freshAsset = event.request.mode === 'navigate' ||
    pathname.endsWith('.html') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.webmanifest');

  event.respondWith(freshAsset ? networkFirst(event.request) : cacheFirst(event.request));
});
