
// ZuzuSport Service Worker v1.0.0
// Generated: 2025-10-13T19:26:36.259Z

const CACHE_NAME = 'zuzusport-v1';
const VERSION = '1.0.0';

// Resources to precache
const PRECACHE_RESOURCES = [
  "/",
  "/index-he.html",
  "/bundles/critical.css",
  "/bundles/main.js",
  "/resources/optimized/hero-kids.webp",
  "/resources/optimized/hero-kids.jpg",
  "/site.webmanifest",
  "/favicon.ico"
];

// Runtime caching configuration
const RUNTIME_CACHING = [
  {
    "urlPattern": {},
    "strategy": "images",
    "cacheName": "images"
  },
  {
    "urlPattern": {},
    "strategy": "static",
    "cacheName": "static-resources"
  },
  {
    "urlPattern": {},
    "strategy": "static",
    "cacheName": "google-fonts-stylesheets"
  },
  {
    "urlPattern": {},
    "strategy": "critical",
    "cacheName": "google-fonts-webfonts"
  },
  {
    "urlPattern": {},
    "strategy": "static",
    "cacheName": "tailwind-css"
  }
];

// Cache strategies configuration
const CACHE_STRATEGIES = {
  "critical": {
    "strategy": "CacheFirst",
    "maxAge": 2592000,
    "maxEntries": 50
  },
  "static": {
    "strategy": "StaleWhileRevalidate",
    "maxAge": 604800,
    "maxEntries": 100
  },
  "images": {
    "strategy": "CacheFirst",
    "maxAge": 2592000,
    "maxEntries": 200
  },
  "dynamic": {
    "strategy": "NetworkFirst",
    "maxAge": 300,
    "maxEntries": 50
  }
};

// Offline fallbacks
const OFFLINE_FALLBACKS = {
  "document": "/offline.html",
  "image": "/resources/icon-192x192.png",
  "audio": null,
  "video": null
};

/**
 * Cache Strategy Implementations
 */
class CacheStrategies {
  static async CacheFirst(request, cacheName, config) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Check if cache is expired
      const cachedDate = new Date(cachedResponse.headers.get('sw-cache-date') || 0);
      const now = new Date();
      const maxAge = config.maxAge * 1000; // Convert to milliseconds
      
      if (now - cachedDate < maxAge) {
        return cachedResponse;
      }
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        responseToCache.headers.set('sw-cache-date', new Date().toISOString());
        cache.put(request, responseToCache);
      }
      return networkResponse;
    } catch (error) {
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }
  
  static async NetworkFirst(request, cacheName, config) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        const responseToCache = networkResponse.clone();
        responseToCache.headers.set('sw-cache-date', new Date().toISOString());
        cache.put(request, responseToCache);
      }
      return networkResponse;
    } catch (error) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw error;
    }
  }
  
  static async StaleWhileRevalidate(request, cacheName, config) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Always try to fetch from network in background
    const networkFetch = fetch(request).then(response => {
      if (response.ok) {
        const responseToCache = response.clone();
        responseToCache.headers.set('sw-cache-date', new Date().toISOString());
        cache.put(request, responseToCache);
      }
      return response;
    }).catch(() => null);
    
    // Return cached version immediately if available
    if (cachedResponse) {
      networkFetch; // Update cache in background
      return cachedResponse;
    }
    
    // Wait for network if no cached version
    return await networkFetch;
  }
}

/**
 * Cache Management
 */
class CacheManager {
  static async cleanupCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      // Sort by cache date and remove oldest entries
      const keyDates = await Promise.all(
        keys.map(async key => {
          const response = await cache.match(key);
          const date = response.headers.get('sw-cache-date') || '0';
          return { key, date: new Date(date) };
        })
      );
      
      keyDates.sort((a, b) => a.date - b.date);
      const keysToDelete = keyDates.slice(0, keys.length - maxEntries);
      
      await Promise.all(
        keysToDelete.map(({ key }) => cache.delete(key))
      );
      
      console.log(`Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
    }
  }
  
  static async clearOldCaches() {
    const cacheNames = await caches.keys();
    const oldCacheNames = cacheNames.filter(name => 
      name.startsWith('zuzusport-') && name !== CACHE_NAME
    );
    
    await Promise.all(
      oldCacheNames.map(name => {
        console.log('Deleting old cache:', name);
        return caches.delete(name);
      })
    );
  }
}

/**
 * Service Worker Event Handlers
 */

// Install event - precache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker installing, version:', VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching resources:', PRECACHE_RESOURCES.length);
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating, version:', VERSION);
  
  event.waitUntil(
    CacheManager.clearOldCaches()
      .then(() => {
        console.log('Service Worker activation complete');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Find matching runtime caching rule
  let matchedRule = null;
  for (const rule of RUNTIME_CACHING) {
    if (rule.urlPattern.test(url.href) || rule.urlPattern.test(url.pathname)) {
      matchedRule = rule;
      break;
    }
  }
  
  if (matchedRule) {
    const strategy = matchedRule.strategy;
    const cacheName = `${CACHE_NAME}-${matchedRule.cacheName}`;
    const config = CACHE_STRATEGIES[strategy];
    
    event.respondWith(
      CacheStrategies[strategy](request, cacheName, config)
        .then(response => {
          // Cleanup cache if needed
          if (config.maxEntries) {
            CacheManager.cleanupCache(cacheName, config.maxEntries);
          }
          return response;
        })
        .catch(async error => {
          console.warn('Cache strategy failed:', strategy, error);
          
          // Try offline fallback
          if (request.destination === 'document' && OFFLINE_FALLBACKS.document) {
            const cache = await caches.open(CACHE_NAME);
            const fallback = await cache.match(OFFLINE_FALLBACKS.document);
            if (fallback) return fallback;
          }
          
          if (request.destination === 'image' && OFFLINE_FALLBACKS.image) {
            const cache = await caches.open(CACHE_NAME);
            const fallback = await cache.match(OFFLINE_FALLBACKS.image);
            if (fallback) return fallback;
          }
          
          throw error;
        })
    );
  } else {
    // Default strategy for uncached requests
    event.respondWith(
      CacheStrategies.NetworkFirst(request, `${CACHE_NAME}-default`, {
        maxAge: 5 * 60, // 5 minutes
        maxEntries: 50
      }).catch(async error => {
        // Try offline fallback for documents
        if (request.destination === 'document' && OFFLINE_FALLBACKS.document) {
          const cache = await caches.open(CACHE_NAME);
          const fallback = await cache.match(OFFLINE_FALLBACKS.document);
          if (fallback) return fallback;
        }
        
        throw error;
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      Promise.resolve()
    );
  }
});

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/resources/icon-192x192.png',
    badge: '/resources/icon-72x72.png',
    tag: 'zuzusport-notification'
  };
  
  event.waitUntil(
    self.registration.showNotification('ZuzuSport', options)
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_LOG') {
    console.log('Performance data:', event.data.data);
    // Could send to analytics here
  }
});

console.log('Service Worker script loaded, version:', VERSION);
