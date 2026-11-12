
const CACHE_NAME = 'que-me-pongo-v1';

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const IMAGE_FILES = [
  './oro.png',
  './plata.png',
  './pecasotoño.png',
  './choco.png',
  './negro.png',
  './claros.png',
  './lightsummer.png',
  './otonocalido.png',
  './otonooscuro.png',
  './otonosuave.png',
  './primaveracalida.png',
  './primaveraclara.png',
  './primaverabrillante.png',
  './veranoclaro.png',
  './veranofrio.png',
  './veranosuave.png',
  './inviernooscuro.png',
  './inviernofrio.png',
  './inviernobrillante.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(CORE_FILES);

      await Promise.allSettled(
        IMAGE_FILES.map(file => cache.add(file))
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (!url.pathname.startsWith(
    new URL(self.registration.scope).pathname
  )) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put('./index.html', response.clone());
          }

          return response;
        } catch (error) {
          return (
            await caches.match('./index.html')
          ) || Response.error();
        }
      })()
    );

    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);

      if (cached) return cached;

      try {
        const response = await fetch(request);

        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        return Response.error();
      }
    })()
  );
});
