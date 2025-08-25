// Service Worker for Todo App
const CACHE_NAME = 'todo-app-v2'; // Updated version to force cache refresh
const urlsToCache = [
  '/',
  '/style.css',
  '/script.js',
  '/fallback-icons.css'
  // Removed '/api/todos' - API should never be cached for real-time data
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Only cache local resources to avoid CSP issues
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Block Font Awesome CDN requests in Service Worker to avoid CSP violations
  // Let the main document handle Font Awesome loading with proper CSP
  if (requestUrl.hostname === 'cdnjs.cloudflare.com' && requestUrl.pathname.includes('font-awesome')) {
    event.respondWith(
      // Don't try to fetch, just return a fallback CSS response
      new Response('/* Font Awesome handled by main document */', {
        headers: { 'Content-Type': 'text/css' },
        status: 200
      })
    );
    return;
  }

  // NEVER cache API calls - always fetch fresh data
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response('API not available offline', { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Handle static resources with caching
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        // For non-cached requests, fetch from network
        return fetch(event.request).catch(() => {
          // If fetch fails, provide appropriate fallbacks
          if (event.request.destination === 'style') {
            return new Response('/* Fallback CSS */', {
              headers: { 'Content-Type': 'text/css' }
            });
          }
          return new Response('Resource not available offline', { status: 404 });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
