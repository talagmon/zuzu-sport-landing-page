#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('⚡ Service Worker and Caching Strategy Generator');

const SW_CONFIG = {
  version: '1.0.0',
  cacheName: 'zuzusport-v1',
  
  // Cache strategies
  cacheStrategies: {
    // Critical resources - cache first, update in background
    critical: {
      strategy: 'CacheFirst',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      maxEntries: 50
    },
    
    // Static assets - cache first with background update
    static: {
      strategy: 'StaleWhileRevalidate',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      maxEntries: 100
    },
    
    // Images - cache first, long term
    images: {
      strategy: 'CacheFirst',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      maxEntries: 200
    },
    
    // API/Dynamic content - network first with cache fallback
    dynamic: {
      strategy: 'NetworkFirst',
      maxAge: 5 * 60, // 5 minutes
      maxEntries: 50
    }
  },
  
  // Resources to cache
  precacheResources: [
    // Core HTML pages
    '/',
    '/index-he.html',
    
    // Critical CSS and JS
    '/bundles/critical.css',
    '/bundles/main.js',
    
    // Key images
    '/resources/optimized/hero-kids.webp',
    '/resources/optimized/hero-kids.jpg',
    
    // PWA essentials
    '/site.webmanifest',
    '/favicon.ico'
  ],
  
  // Runtime caching patterns
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|avif|gif|svg)$/,
      strategy: 'images',
      cacheName: 'images'
    },
    {
      urlPattern: /\.(?:js|css)$/,
      strategy: 'static',
      cacheName: 'static-resources'
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      strategy: 'static',
      cacheName: 'google-fonts-stylesheets'
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      strategy: 'critical',
      cacheName: 'google-fonts-webfonts'
    },
    {
      urlPattern: /^https:\/\/cdn\.tailwindcss\.com/,
      strategy: 'static',
      cacheName: 'tailwind-css'
    }
  ],
  
  // Offline fallbacks
  offlineFallbacks: {
    document: '/offline.html',
    image: '/resources/icon-192x192.png',
    audio: null,
    video: null
  }
};

function generateServiceWorker() {
  return `
// ZuzuSport Service Worker v${SW_CONFIG.version}
// Generated: ${new Date().toISOString()}

const CACHE_NAME = '${SW_CONFIG.cacheName}';
const VERSION = '${SW_CONFIG.version}';

// Resources to precache
const PRECACHE_RESOURCES = ${JSON.stringify(SW_CONFIG.precacheResources, null, 2)};

// Runtime caching configuration
const RUNTIME_CACHING = ${JSON.stringify(SW_CONFIG.runtimeCaching, null, 2)};

// Cache strategies configuration
const CACHE_STRATEGIES = ${JSON.stringify(SW_CONFIG.cacheStrategies, null, 2)};

// Offline fallbacks
const OFFLINE_FALLBACKS = ${JSON.stringify(SW_CONFIG.offlineFallbacks, null, 2)};

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
      
      console.log(\`Cleaned up \${keysToDelete.length} entries from \${cacheName}\`);
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
    const cacheName = \`\${CACHE_NAME}-\${matchedRule.cacheName}\`;
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
      CacheStrategies.NetworkFirst(request, \`\${CACHE_NAME}-default\`, {
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
`;
}

function generateOfflinePage() {
  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offline - ZuzuSport</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #F8FCFF 0%, #CAF0F8 25%, #90E0EF 50%, #00B4D8 75%, #F5B7B1 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #1f2937;
        }
        
        .offline-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border-radius: 1rem;
            padding: 2rem;
            max-width: 400px;
            margin: 1rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        
        h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1f2937;
        }
        
        p {
            color: #6b7280;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .retry-button {
            background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .retry-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 180, 216, 0.4);
        }
        
        .cached-pages {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }
        
        .cached-pages h2 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #374151;
        }
        
        .cached-pages a {
            color: #00B4D8;
            text-decoration: none;
            display: block;
            margin: 0.25rem 0;
        }
        
        .cached-pages a:hover {
            text-decoration: underline;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                color: #f9fafb;
            }
            
            .offline-container {
                background: rgba(17, 24, 39, 0.95);
            }
            
            h1 {
                color: #f9fafb;
            }
            
            p {
                color: #d1d5db;
            }
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">🔌</div>
        <h1>You're Offline</h1>
        <p>It looks like you've lost your internet connection. Don't worry, some content is still available!</p>
        
        <button class="retry-button" onclick="window.location.reload()">
            Try Again
        </button>
        
        <div class="cached-pages">
            <h2>Available Offline</h2>
            <a href="/">Home</a>
            <a href="/index-he.html">דף הבית</a>
        </div>
    </div>

    <script>
        // Check connection status
        function updateOnlineStatus() {
            if (navigator.onLine) {
                window.location.reload();
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        
        // Auto-retry when connection is restored
        setInterval(() => {
            if (navigator.onLine) {
                updateOnlineStatus();
            }
        }, 5000);
    </script>
</body>
</html>
`;
}

function generateServiceWorkerRegistration() {
  return `
<!-- Service Worker Registration -->
<script>
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        console.log('Service Worker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New service worker available, show update notification
                showUpdateNotification();
              } else {
                // First time service worker installed
                console.log('Content cached for offline use.');
              }
            }
          });
        });
        
        // Performance monitoring
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          
          // Send performance data to service worker
          navigator.serviceWorker.ready.then(registration => {
            registration.active.postMessage({
              type: 'PERFORMANCE_LOG',
              data: {
                loadTime,
                timestamp: new Date().toISOString(),
                url: window.location.href
              }
            });
          });
        }
        
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    });
  }

  function showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.innerHTML = \`
      <div style="
        position: fixed; 
        top: 1rem; 
        right: 1rem; 
        background: #00B4D8; 
        color: white; 
        padding: 1rem; 
        border-radius: 0.5rem; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
        z-index: 1000; 
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      ">
        <span>🔄 New version available!</span>
        <button onclick="window.location.reload()" style="
          background: white; 
          color: #00B4D8; 
          border: none; 
          padding: 0.25rem 0.5rem; 
          border-radius: 0.25rem; 
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        ">Update</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent; 
          color: white; 
          border: none; 
          padding: 0.25rem; 
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    \`;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }
  
  // Handle offline/online status
  function updateConnectionStatus() {
    const isOnline = navigator.onLine;
    const statusIndicator = document.getElementById('connection-status');
    
    if (!statusIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'connection-status';
      indicator.style.cssText = \`
        position: fixed;
        bottom: 1rem;
        left: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 600;
        z-index: 1000;
        transition: all 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      \`;
      document.body.appendChild(indicator);
    }
    
    const indicator = document.getElementById('connection-status');
    
    if (isOnline) {
      indicator.textContent = '🟢 Online';
      indicator.style.background = '#10b981';
      indicator.style.color = 'white';
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator) indicator.style.display = 'none';
      }, 2000);
    } else {
      indicator.textContent = '🔴 Offline';
      indicator.style.background = '#ef4444';
      indicator.style.color = 'white';
      indicator.style.opacity = '1';
      indicator.style.display = 'block';
    }
  }

  window.addEventListener('online', updateConnectionStatus);
  window.addEventListener('offline', updateConnectionStatus);
  
  // Initial connection status check
  document.addEventListener('DOMContentLoaded', updateConnectionStatus);
</script>
`;
}

// Main execution
function main() {
  console.log('⚡ Generating service worker and caching strategy...\n');
  
  // Generate service worker
  const serviceWorkerContent = generateServiceWorker();
  fs.writeFileSync('service-worker.js', serviceWorkerContent);
  console.log('✅ Service worker created: service-worker.js');
  
  // Generate offline page
  const offlinePageContent = generateOfflinePage();
  fs.writeFileSync('offline.html', offlinePageContent);
  console.log('✅ Offline page created: offline.html');
  
  // Generate service worker registration script
  const registrationScript = generateServiceWorkerRegistration();
  fs.writeFileSync('sw-register.html', registrationScript);
  console.log('✅ Registration script created: sw-register.html');
  
  // Generate cache configuration
  const cacheConfig = {
    version: SW_CONFIG.version,
    generated: new Date().toISOString(),
    config: SW_CONFIG,
    usage: {
      registration: 'Include sw-register.html in your HTML pages',
      serviceWorker: 'Place service-worker.js in your site root',
      offline: 'Place offline.html in your site root',
      testing: 'Test offline functionality by disabling network in DevTools'
    }
  };
  
  fs.writeFileSync('cache-config.json', JSON.stringify(cacheConfig, null, 2));
  console.log('✅ Cache configuration created: cache-config.json');
  
  console.log('\n📊 Service Worker Features:');
  console.log('  • Precaching of critical resources');
  console.log('  • Runtime caching with multiple strategies');
  console.log('  • Offline fallback pages');
  console.log('  • Automatic cache cleanup');
  console.log('  • Background sync support');
  console.log('  • Push notification support');
  console.log('  • Performance monitoring');
  console.log('  • Connection status indicator');
  
  console.log('\n🎯 Cache Strategies:');
  Object.entries(SW_CONFIG.cacheStrategies).forEach(([name, config]) => {
    console.log(`  • ${name}: ${config.strategy} (${config.maxAge/60}min, ${config.maxEntries} entries)`);
  });
  
  console.log('\n🔧 Implementation:');
  console.log('  1. Copy service-worker.js to your site root');
  console.log('  2. Copy offline.html to your site root');
  console.log('  3. Include sw-register.html content in your HTML pages');
  console.log('  4. Test offline functionality in DevTools');
  
  return cacheConfig;
}

// Export for use in other scripts
module.exports = {
  generateServiceWorker,
  generateOfflinePage,
  generateServiceWorkerRegistration,
  createServiceWorker: main
};

// Run if called directly
if (require.main === module) {
  main();
}