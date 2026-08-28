const CACHE = 'aprende-3-basico-v21';
const CORE_ASSETS = [
  './',
  './index.html',
  './math.html',
  './english.html',
  './language.html',
  './science.html',
  './history.html',
  './games.html',
  './styles.css',
  './curriculum.css',
  './english.css',
  './platform.css',
  './adventure.css',
  './dashboard.css',
  './games.css',
  './voice.css',
  './app.js',
  './english.js',
  './language.js',
  './science.js',
  './history.js',
  './feedback-enhancer.js',
  './game-progress.js',
  './games.js',
  './voice.js',
  './progress-controls.js',
  './manifest.webmanifest',
  './logo-3basico.svg'
];

const OFFLINE_PAGES = new Set([
  'index.html',
  'math.html',
  'english.html',
  'language.html',
  'science.html',
  'history.html',
  'games.html'
]);

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

function normalizedCacheKey(request) {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function cachedResponse(request) {
  return caches.match(normalizedCacheKey(request));
}

async function cacheResponse(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return response;
  const cache = await caches.open(CACHE);
  await cache.put(normalizedCacheKey(request), response.clone());
  return response;
}

async function offlineNavigationFallback(request) {
  const cached = await cachedResponse(request);
  if (cached) return cached;

  const pathname = new URL(request.url).pathname;
  const filename = pathname.split('/').pop() || 'index.html';
  if (OFFLINE_PAGES.has(filename)) {
    const samePage = await caches.match(`./${filename}`);
    if (samePage) return samePage;
  }

  return caches.match('./index.html');
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    return cacheResponse(request, response);
  } catch {
    if (request.mode === 'navigate') return offlineNavigationFallback(request);
    const cached = await cachedResponse(request);
    if (cached) return cached;
    throw new Error('offline-and-not-cached');
  }
}

async function cacheFirst(request) {
  const cached = await cachedResponse(request);
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
