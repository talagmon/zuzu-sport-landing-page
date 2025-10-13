#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('📦 Resource Bundling and Code Splitting System');

const BUNDLE_CONFIG = {
  // Source directories
  sourceDir: '.',
  outputDir: 'dist/bundles',
  
  // Bundle definitions
  bundles: {
    critical: {
      css: [
        'resources/optimized/image-optimization.css'
      ],
      js: [
        // Critical JavaScript that needs to load first
      ],
      priority: 'critical'
    },
    
    main: {
      css: [],
      js: [
        'main.js'
      ],
      priority: 'high'
    },
    
    features: {
      css: [],
      js: [
        // Feature-specific JavaScript
      ],
      priority: 'normal'
    },
    
    lazy: {
      css: [],
      js: [
        'resources/optimized/lazy-loading.js'
      ],
      priority: 'low'
    }
  },
  
  // Optimization settings
  optimization: {
    minify: true,
    gzip: true,
    sourcemaps: false, // Set to true for development
    cacheBreaking: true
  },
  
  // HTTP/2 Push hints
  http2Push: [
    'bundles/critical.css',
    'bundles/critical.js',
    'bundles/main.css',
    'bundles/main.js'
  ]
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function generateHash(content) {
  return crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
}

function minifyCSS(css) {
  if (!BUNDLE_CONFIG.optimization.minify) return css;
  
  return css
    // Remove comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove whitespace around special characters
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    // Remove trailing semicolons
    .replace(/;}/g, '}')
    .trim();
}

function minifyJS(js) {
  if (!BUNDLE_CONFIG.optimization.minify) return js;
  
  return js
    // Remove single-line comments (but preserve URLs)
    .replace(/(?<!:)\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove extra whitespace (preserve strings)
    .replace(/\s+/g, ' ')
    // Remove whitespace around operators and brackets
    .replace(/\s*([{}();,=])\s*/g, '$1')
    .trim();
}

function bundleCSS(bundleName, files) {
  console.log(`🎨 Bundling CSS: ${bundleName}`);
  
  let combinedCSS = `/* Bundle: ${bundleName} - Generated: ${new Date().toISOString()} */\n`;
  const includedFiles = [];
  
  files.forEach(file => {
    const filePath = path.resolve(file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedCSS += `\n/* From: ${file} */\n`;
      combinedCSS += content + '\n';
      includedFiles.push(file);
      console.log(`  ✅ Included: ${file}`);
    } else {
      console.warn(`  ⚠️  File not found: ${file}`);
    }
  });
  
  // Minify if enabled
  const minifiedCSS = minifyCSS(combinedCSS);
  
  // Generate filename with hash for cache busting
  const hash = generateHash(minifiedCSS);
  const fileName = BUNDLE_CONFIG.optimization.cacheBreaking 
    ? `${bundleName}.${hash}.css`
    : `${bundleName}.css`;
  
  return {
    content: minifiedCSS,
    fileName,
    originalSize: combinedCSS.length,
    minifiedSize: minifiedCSS.length,
    includedFiles,
    hash
  };
}

function bundleJS(bundleName, files) {
  console.log(`⚡ Bundling JavaScript: ${bundleName}`);
  
  let combinedJS = `/* Bundle: ${bundleName} - Generated: ${new Date().toISOString()} */\n`;
  const includedFiles = [];
  
  files.forEach(file => {
    const filePath = path.resolve(file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedJS += `\n/* From: ${file} */\n`;
      combinedJS += content + '\n';
      includedFiles.push(file);
      console.log(`  ✅ Included: ${file}`);
    } else {
      console.warn(`  ⚠️  File not found: ${file}`);
    }
  });
  
  // Minify if enabled
  const minifiedJS = minifyJS(combinedJS);
  
  // Generate filename with hash for cache busting
  const hash = generateHash(minifiedJS);
  const fileName = BUNDLE_CONFIG.optimization.cacheBreaking 
    ? `${bundleName}.${hash}.js`
    : `${bundleName}.js`;
  
  return {
    content: minifiedJS,
    fileName,
    originalSize: combinedJS.length,
    minifiedSize: minifiedJS.length,
    includedFiles,
    hash
  };
}

function generateBundleManifest(bundles) {
  const manifest = {
    timestamp: new Date().toISOString(),
    config: BUNDLE_CONFIG,
    bundles: {},
    loadOrder: [],
    http2Push: BUNDLE_CONFIG.http2Push
  };
  
  // Sort bundles by priority
  const priorityOrder = ['critical', 'high', 'normal', 'low'];
  
  Object.entries(bundles).forEach(([name, bundleData]) => {
    const priority = BUNDLE_CONFIG.bundles[name]?.priority || 'normal';
    manifest.bundles[name] = {
      ...bundleData,
      priority,
      loadOrder: priorityOrder.indexOf(priority)
    };
  });
  
  // Generate load order
  manifest.loadOrder = Object.keys(manifest.bundles).sort((a, b) => {
    return manifest.bundles[a].loadOrder - manifest.bundles[b].loadOrder;
  });
  
  return manifest;
}

function generateResourceHints(manifest) {
  let hints = '';
  
  // DNS prefetch and preconnect hints
  hints += `<!-- DNS Prefetch and Preconnect -->\n`;
  hints += `<link rel="dns-prefetch" href="//fonts.googleapis.com">\n`;
  hints += `<link rel="dns-prefetch" href="//cdnjs.cloudflare.com">\n`;
  hints += `<link rel="preconnect" href="https://fonts.googleapis.com">\n`;
  hints += `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n\n`;
  
  // Preload critical resources
  hints += `<!-- Preload Critical Resources -->\n`;
  manifest.loadOrder.forEach(bundleName => {
    const bundle = manifest.bundles[bundleName];
    if (bundle.priority === 'critical' || bundle.priority === 'high') {
      if (bundle.css) {
        hints += `<link rel="preload" href="bundles/${bundle.css.fileName}" as="style">\n`;
      }
      if (bundle.js) {
        hints += `<link rel="preload" href="bundles/${bundle.js.fileName}" as="script">\n`;
      }
    }
  });
  
  return hints;
}

function generateLoadingScript(manifest) {
  return `
<!-- Optimized Resource Loading -->
<script>
  (function() {
    'use strict';
    
    const bundles = ${JSON.stringify(manifest.bundles, null, 2)};
    const loadOrder = ${JSON.stringify(manifest.loadOrder)};
    
    // Utility functions
    function loadCSS(href, priority = 'normal') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      
      if (priority !== 'critical') {
        link.media = 'print';
        link.onload = function() { this.media = 'all'; };
      }
      
      document.head.appendChild(link);
      return link;
    }
    
    function loadJS(src, priority = 'normal') {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = priority !== 'critical';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    // Load resources in priority order
    function loadBundles() {
      const loadPromises = [];
      
      loadOrder.forEach((bundleName, index) => {
        const bundle = bundles[bundleName];
        
        // Load CSS immediately for critical, defer others
        if (bundle.css) {
          if (bundle.priority === 'critical') {
            loadCSS('bundles/' + bundle.css.fileName, 'critical');
          } else {
            // Defer non-critical CSS
            setTimeout(() => {
              loadCSS('bundles/' + bundle.css.fileName, bundle.priority);
            }, bundle.priority === 'high' ? 100 : 500);
          }
        }
        
        // Load JavaScript based on priority
        if (bundle.js) {
          const delay = bundle.priority === 'critical' ? 0 : 
                       bundle.priority === 'high' ? 50 : 
                       bundle.priority === 'normal' ? 200 : 1000;
          
          const jsPromise = new Promise(resolve => {
            setTimeout(() => {
              loadJS('bundles/' + bundle.js.fileName, bundle.priority)
                .then(resolve)
                .catch(err => {
                  console.warn('Failed to load bundle:', bundleName, err);
                  resolve(); // Don't block other bundles
                });
            }, delay);
          });
          
          loadPromises.push(jsPromise);
        }
      });
      
      return Promise.all(loadPromises);
    }
    
    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadBundles);
    } else {
      loadBundles();
    }
    
    // Performance monitoring
    window.addEventListener('load', () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
      }
    });
  })();
</script>`;
}

function generateHTTP2Headers(manifest) {
  const headers = [];
  
  BUNDLE_CONFIG.http2Push.forEach(resource => {
    const bundleName = resource.split('/')[1].split('.')[0];
    const bundle = manifest.bundles[bundleName];
    
    if (bundle) {
      if (resource.includes('.css') && bundle.css) {
        headers.push(`Link: </bundles/${bundle.css.fileName}>; rel=preload; as=style`);
      } else if (resource.includes('.js') && bundle.js) {
        headers.push(`Link: </bundles/${bundle.js.fileName}>; rel=preload; as=script`);
      }
    }
  });
  
  return headers.join('\\n');
}

// Main execution
function main() {
  console.log('📦 Starting resource bundling and code splitting...\\n');
  
  // Ensure output directory exists
  ensureDir(BUNDLE_CONFIG.outputDir);
  
  const bundles = {};
  let totalOriginalSize = 0;
  let totalMinifiedSize = 0;
  
  // Process each bundle
  Object.entries(BUNDLE_CONFIG.bundles).forEach(([bundleName, bundleConfig]) => {
    const bundleData = {};
    
    // Bundle CSS files
    if (bundleConfig.css && bundleConfig.css.length > 0) {
      const cssBundle = bundleCSS(bundleName, bundleConfig.css);
      const cssPath = path.join(BUNDLE_CONFIG.outputDir, cssBundle.fileName);
      fs.writeFileSync(cssPath, cssBundle.content);
      
      bundleData.css = cssBundle;
      totalOriginalSize += cssBundle.originalSize;
      totalMinifiedSize += cssBundle.minifiedSize;
      
      console.log(`  📄 CSS: ${cssBundle.fileName} (${cssBundle.minifiedSize} bytes)`);
    }
    
    // Bundle JavaScript files
    if (bundleConfig.js && bundleConfig.js.length > 0) {
      const jsBundle = bundleJS(bundleName, bundleConfig.js);
      const jsPath = path.join(BUNDLE_CONFIG.outputDir, jsBundle.fileName);
      fs.writeFileSync(jsPath, jsBundle.content);
      
      bundleData.js = jsBundle;
      totalOriginalSize += jsBundle.originalSize;
      totalMinifiedSize += jsBundle.minifiedSize;
      
      console.log(`  📜 JS: ${jsBundle.fileName} (${jsBundle.minifiedSize} bytes)`);
    }
    
    bundles[bundleName] = bundleData;
  });
  
  // Generate manifest
  const manifest = generateBundleManifest(bundles);
  const manifestPath = path.join(BUNDLE_CONFIG.outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  // Generate helper files
  const resourceHints = generateResourceHints(manifest);
  fs.writeFileSync(
    path.join(BUNDLE_CONFIG.outputDir, 'resource-hints.html'),
    resourceHints
  );
  
  const loadingScript = generateLoadingScript(manifest);
  fs.writeFileSync(
    path.join(BUNDLE_CONFIG.outputDir, 'loader.js'),
    loadingScript
  );
  
  const http2Headers = generateHTTP2Headers(manifest);
  fs.writeFileSync(
    path.join(BUNDLE_CONFIG.outputDir, 'http2-headers.txt'),
    http2Headers
  );
  
  // Summary
  const compressionRatio = ((totalOriginalSize - totalMinifiedSize) / totalOriginalSize * 100).toFixed(1);
  
  console.log('\\n✅ Resource bundling completed!');
  console.log('📊 Bundling summary:');
  console.log(`  • Bundles created: ${Object.keys(bundles).length}`);
  console.log(`  • Original size: ${Math.round(totalOriginalSize / 1024)}KB`);
  console.log(`  • Minified size: ${Math.round(totalMinifiedSize / 1024)}KB`);
  console.log(`  • Compression: ${compressionRatio}%`);
  console.log(`  • Cache busting: ${BUNDLE_CONFIG.optimization.cacheBreaking ? 'enabled' : 'disabled'}`);
  
  console.log('\\n📁 Generated files:');
  console.log(`  • ${BUNDLE_CONFIG.outputDir}/manifest.json - Bundle manifest`);
  console.log(`  • ${BUNDLE_CONFIG.outputDir}/resource-hints.html - HTML resource hints`);
  console.log(`  • ${BUNDLE_CONFIG.outputDir}/loader.js - Optimized resource loader`);
  console.log(`  • ${BUNDLE_CONFIG.outputDir}/http2-headers.txt - HTTP/2 push headers`);
  
  return manifest;
}

// Export for use in other scripts
module.exports = {
  bundleCSS,
  bundleJS,
  generateResourceHints,
  generateLoadingScript,
  createBundles: main
};

// Run if called directly
if (require.main === module) {
  main();
}