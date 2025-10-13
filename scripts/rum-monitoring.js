/**
 * Real User Monitoring (RUM) Script for ZuzuSport
 * Tracks Core Web Vitals and custom performance metrics
 */

(function() {
  'use strict';
  
  // Configuration
  const RUM_CONFIG = {
    // Set this to your analytics endpoint
    endpoint: '/api/metrics',
    
    // Custom metrics to track
    trackCustomMetrics: true,
    
    // Debug mode
    debug: false
  };
  
  // Core Web Vitals tracking
  let vitals = {};
  
  // Custom metrics
  let customMetrics = {
    timeToInteractive: null,
    resourceLoadTime: {},
    userInteractions: 0,
    pageLoadTime: performance.now()
  };
  
  // Utility functions
  function log(...args) {
    if (RUM_CONFIG.debug) {
      console.log('[RUM]', ...args);
    }
  }
  
  function sendMetric(name, value, labels = {}) {
    const metric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: getConnectionInfo(),
      viewport: getViewportInfo()
    };
    
    log('Sending metric:', metric);
    
    // Send to analytics endpoint
    if (navigator.sendBeacon) {
      navigator.sendBeacon(RUM_CONFIG.endpoint, JSON.stringify(metric));
    } else {
      // Fallback for older browsers
      fetch(RUM_CONFIG.endpoint, {
        method: 'POST',
        body: JSON.stringify(metric),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => log('Failed to send metric:', err));
    }
  }
  
  function getConnectionInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      };
    }
    return null;
  }
  
  function getViewportInfo() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
  }
  
  // Core Web Vitals implementation
  function getCLS(metric) {
    vitals.cls = metric.value;
    sendMetric('cumulative-layout-shift', metric.value, {
      rating: metric.rating,
      entries: metric.entries.length
    });
    log('CLS:', metric.value);
  }
  
  function getFID(metric) {
    vitals.fid = metric.value;
    sendMetric('first-input-delay', metric.value, {
      rating: metric.rating,
      eventType: metric.entries[0]?.name
    });
    log('FID:', metric.value);
  }
  
  function getFCP(metric) {
    vitals.fcp = metric.value;
    sendMetric('first-contentful-paint', metric.value, {
      rating: metric.rating
    });
    log('FCP:', metric.value);
  }
  
  function getLCP(metric) {
    vitals.lcp = metric.value;
    sendMetric('largest-contentful-paint', metric.value, {
      rating: metric.rating,
      element: metric.entries[metric.entries.length - 1]?.element?.tagName
    });
    log('LCP:', metric.value);
  }
  
  function getTTFB(metric) {
    vitals.ttfb = metric.value;
    sendMetric('time-to-first-byte', metric.value, {
      rating: metric.rating
    });
    log('TTFB:', metric.value);
  }
  
  function getINP(metric) {
    vitals.inp = metric.value;
    sendMetric('interaction-to-next-paint', metric.value, {
      rating: metric.rating
    });
    log('INP:', metric.value);
  }
  
  // Load Web Vitals library
  function loadWebVitals() {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    script.onload = function() {
      if (window.webVitals) {
        window.webVitals.getCLS(getCLS);
        window.webVitals.getFID(getFID);  
        window.webVitals.getFCP(getFCP);
        window.webVitals.getLCP(getLCP);
        window.webVitals.getTTFB(getTTFB);
        
        // INP is newer, may not be available in all versions
        if (window.webVitals.getINP) {
          window.webVitals.getINP(getINP);
        }
        
        log('Web Vitals tracking initialized');
      }
    };
    document.head.appendChild(script);
  }
  
  // Custom performance metrics
  function trackResourceLoadTimes() {
    if (!RUM_CONFIG.trackCustomMetrics) return;
    
    window.addEventListener('load', function() {
      const resources = performance.getEntriesByType('resource');
      
      resources.forEach(resource => {
        const loadTime = resource.responseEnd - resource.startTime;
        const resourceType = resource.initiatorType;
        const resourceName = resource.name.split('/').pop() || 'unknown';
        
        if (loadTime > 100) { // Only track resources that take more than 100ms
          customMetrics.resourceLoadTime[resourceName] = loadTime;
          
          sendMetric('resource-load-time', loadTime, {
            type: resourceType,
            name: resourceName,
            size: resource.transferSize || 0
          });
        }
      });
      
      log('Resource load times tracked:', customMetrics.resourceLoadTime);
    });
  }
  
  function trackUserInteractions() {
    if (!RUM_CONFIG.trackCustomMetrics) return;
    
    ['click', 'scroll', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, function() {
        customMetrics.userInteractions++;
      }, { passive: true });
    });
    
    // Send interaction count periodically
    setInterval(function() {
      if (customMetrics.userInteractions > 0) {
        sendMetric('user-interactions', customMetrics.userInteractions);
        customMetrics.userInteractions = 0;
      }
    }, 30000); // Every 30 seconds
  }
  
  function trackPageVisibility() {
    if (!RUM_CONFIG.trackCustomMetrics) return;
    
    let visibilityStart = Date.now();
    
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        const visibleTime = Date.now() - visibilityStart;
        sendMetric('page-visible-time', visibleTime);
        log('Page was visible for:', visibleTime, 'ms');
      } else {
        visibilityStart = Date.now();
      }
    });
  }
  
  function trackErrors() {
    window.addEventListener('error', function(event) {
      sendMetric('javascript-error', 1, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
      log('JavaScript error tracked:', event.message);
    });
    
    window.addEventListener('unhandledrejection', function(event) {
      sendMetric('promise-rejection', 1, {
        reason: event.reason?.toString() || 'Unknown'
      });
      log('Promise rejection tracked:', event.reason);
    });
  }
  
  function trackNavigationTiming() {
    window.addEventListener('load', function() {
      const navigation = performance.getEntriesByType('navigation')[0];
      
      if (navigation) {
        const timings = {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalPageLoad: navigation.loadEventEnd - navigation.fetchStart
        };
        
        Object.entries(timings).forEach(([name, value]) => {
          sendMetric(`navigation-${name}`, value);
        });
        
        log('Navigation timings:', timings);
      }
    });
  }
  
  // Initialize RUM monitoring
  function init() {
    log('Initializing RUM monitoring...');
    
    // Load and initialize Web Vitals
    loadWebVitals();
    
    // Track custom metrics
    trackResourceLoadTimes();
    trackUserInteractions();
    trackPageVisibility();
    trackErrors();
    trackNavigationTiming();
    
    // Send initial page load metric
    sendMetric('page-load', performance.now(), {
      referrer: document.referrer,
      timestamp: Date.now()
    });
    
    log('RUM monitoring initialized');
  }
  
  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose RUM interface
  window.RUM = {
    sendCustomMetric: sendMetric,
    getVitals: () => vitals,
    getCustomMetrics: () => customMetrics,
    config: RUM_CONFIG
  };
  
})();