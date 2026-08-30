const CACHE_PREFIX = 'refugio-admin-';
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const ADMIN_DOCUMENT = './admin.html';
const APP_SHELL = [
  ADMIN_DOCUMENT,
  './admin.webmanifest',
  './assets/icons/admin-pwa-icon.svg',
  './assets/icons/admin-pwa-192.png',
  './assets/icons/admin-pwa-512.png',
  './assets/icons/admin-apple-touch-180.png',
  './css/reset.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/mobile.css',
  './css/pages/admin.css',
  './js/admin/main.js',
  './js/admin/pwa.js',
  './js/admin/admin-auth.js',
  './js/admin/admin-permissions.js',
  './js/admin/admin-store.js',
  './js/admin/admin-seed.js',
  './js/admin/admin-logic.js',
  './js/config/site-config.js',
  './js/ui/custom-selects.js',
  './js/utils/date.js',
  './js/utils/countries.js',
  './locales/messages.json'
];
const APP_SHELL_URLS = new Set(APP_SHELL.map((path) => new URL(path, self.registration.scope).href));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )),
    self.clients.claim()
  ]));
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function loadAdminDocument(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(ADMIN_DOCUMENT, response.clone());
    }
    return response;
  } catch {
    return caches.match(ADMIN_DOCUMENT);
  }
}

async function loadStaticAsset(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
      return response;
    }

    return await caches.match(request) || response;
  } catch {
    return caches.match(request);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  const adminUrl = new URL(ADMIN_DOCUMENT, self.registration.scope);
  if (request.mode === 'navigate' && url.pathname === adminUrl.pathname) {
    event.respondWith(loadAdminDocument(request));
    return;
  }

  if (APP_SHELL_URLS.has(url.href)) event.respondWith(loadStaticAsset(request));
});
