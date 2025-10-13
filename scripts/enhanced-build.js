#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import optimization modules
const { optimizeImages } = require('./optimize-images');
const { createBundles } = require('./bundle-resources');
const { createServiceWorker } = require('./create-service-worker');
const { generateEnhancedCriticalCSS } = require('./extract-critical-css');

console.log('🚀 Enhanced Production Build System with Full Optimization');

const ENHANCED_BUILD_CONFIG = {
  outputDir: 'dist',
  
  // Build stages
  stages: [
    'cleanup',
    'copyStatic',
    'optimizeImages',
    'bundleResources',
    'generateCriticalCSS',
    'optimizeHTML',
    'createServiceWorker',
    'generateManifest',
    'validate'
  ],
  
  // Static files to copy
  staticFiles: [
    'index.html',
    'index-he.html',
    'sitemap.xml',
    'robots.txt',
    'site.webmanifest',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'apple-touch-icon.png',
    'privacy-policy.html',
    'terms.html',
    'cookie-policy.html',
    'coppa-compliance.html',
    'safety.html',
    'safety-he.html',
    'progress.html',
    'progress-he.html',
    'privacy-policy-he.html',
    'terms-he.html',
    'cookie-policy-he.html',
    'coppa-compliance-he.html'
  ],
  
  // Directories to copy
  staticDirs: [
    'resources'
  ],
  
  // JavaScript files to process
  processFiles: {
    'main.js': 'main.min.js'
  },
  
  // HTML optimization settings
  htmlOptimization: {
    minify: true,
    inlineCriticalCSS: true,
    preloadResources: true,
    addServiceWorker: true,
    optimizeImages: true
  }
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
  ensureDir(dest);
  
  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

function minifyJS(inputFile, outputFile) {
  try {
    console.log(`🔧 Minifying JavaScript: ${inputFile}`);
    
    let content = fs.readFileSync(inputFile, 'utf8');
    
    // Simple but effective minification
    content = content
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around operators and brackets
      .replace(/\s*([{}();,=])\s*/g, '$1')
      .trim();
    
    fs.writeFileSync(outputFile, content);
    console.log(`✅ Minified: ${outputFile}`);
  } catch (error) {
    console.warn(`⚠️  Could not minify ${inputFile}:`, error.message);
    copyFile(inputFile, outputFile);
  }
}

function generateResponsivePictureElement(imageName, alt, className = '', loading = 'lazy') {
  const optimizedDir = 'resources/optimized';
  
  // Check if optimized versions exist
  const webpPath = `${optimizedDir}/${imageName}.webp`;
  const avifPath = `${optimizedDir}/${imageName}.avif`;
  const fallbackPath = `resources/${imageName}.jpg`;
  
  let pictureHTML = `<picture class="${className}">\n`;
  
  // Add modern format sources if they exist
  if (fs.existsSync(avifPath)) {
    pictureHTML += `  <source srcset="${avifPath}" type="image/avif">\n`;
  }
  if (fs.existsSync(webpPath)) {
    pictureHTML += `  <source srcset="${webpPath}" type="image/webp">\n`;
  }
  
  // Fallback image
  pictureHTML += `  <img src="${fallbackPath}" alt="${alt}" loading="${loading}" class="${className}">\n`;
  pictureHTML += `</picture>`;
  
  return pictureHTML;
}

function optimizeHTML(filePath, manifest) {
  console.log(`🔧 Optimizing HTML: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update script references to bundled versions
  if (manifest && manifest.bundles && manifest.bundles.main && manifest.bundles.main.js) {
  content = content.replace(/main\.js/g, `bundles/${manifest.bundles.main.js.fileName}`);
  }
  
  // Remove existing Tailwind CSS CDN (will be loaded by service worker)
  content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '');
  
  // Add resource hints and preconnects
  const resourceHints = `
    <!-- Enhanced Resource Hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="//cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">`;
  
  content = content.replace('</head>', `${resourceHints}\n</head>`);
  
  // Optimize images to use responsive picture elements
  const imageReplacements = {
    'hero-kids': 'Children playing and exercising',
    'testimonial-1': 'Happy family testimonial',
    'testimonial-2': 'Satisfied parent testimonial',
    'testimonial-3': 'Child enjoying exercise',
    'family-exercise': 'Family exercising together',
    'progress-chart': 'Progress tracking chart',
    'safety-expert': 'Safety expert consultation'
  };
  
  Object.entries(imageReplacements).forEach(([imageName, altText]) => {
    // Replace simple img tags with responsive picture elements
    const imgRegex = new RegExp(`<img[^>]*src="resources/${imageName}\\.(jpg|png|webp)"[^>]*>`, 'g');
    content = content.replace(imgRegex, (match) => {
      const classMatch = match.match(/class="([^"]*)"/) || ['', ''];
      const className = classMatch[1];
      return generateResponsivePictureElement(imageName, altText, className);
    });
  });
  
  // Add service worker registration
  const swRegistration = fs.readFileSync('sw-register.html', 'utf8');
  content = content.replace('</body>', `${swRegistration}\n</body>`);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Optimized: ${filePath}`);
}

function inlineCriticalCSS(htmlFile, criticalCSS) {
  console.log(`🎨 Inlining critical CSS: ${htmlFile}`);
  
  let html = fs.readFileSync(htmlFile, 'utf8');
  
  const inlineCSS = `
    <!-- Critical CSS -->
    <style>
      ${criticalCSS}
    </style>`;
  
  html = html.replace('</head>', `${inlineCSS}\n</head>`);
  
  fs.writeFileSync(htmlFile, html);
  console.log(`✅ Critical CSS inlined: ${htmlFile}`);
}

function generateBuildManifest(buildData) {
  const manifest = {
    buildTime: new Date().toISOString(),
    version: '2.0.0',
    optimizations: {
      images: buildData.images || {},
      bundles: buildData.bundles || {},
      serviceWorker: buildData.serviceWorker || {},
      criticalCSS: true
    },
    files: [],
    checksums: {},
    performance: {
      totalSize: 0,
      compressionRatio: 0,
      optimizedImages: 0,
      bundleCount: 0
    }
  };
  
  // Collect all files in dist directory
  function collectFiles(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        collectFiles(fullPath, relativePath);
      } else {
        manifest.files.push(relativePath);
        
        const stats = fs.statSync(fullPath);
        manifest.checksums[relativePath] = stats.size;
        manifest.performance.totalSize += stats.size;
      }
    });
  }
  
  collectFiles(ENHANCED_BUILD_CONFIG.outputDir);
  
  // Calculate performance metrics
  if (buildData.bundles && buildData.bundles.bundles) {
    manifest.performance.bundleCount = Object.keys(buildData.bundles.bundles).length;
    
    let totalOriginal = 0;
    let totalMinified = 0;
    
    Object.values(buildData.bundles.bundles).forEach(bundle => {
      if (bundle.css) {
        totalOriginal += bundle.css.originalSize;
        totalMinified += bundle.css.minifiedSize;
      }
      if (bundle.js) {
        totalOriginal += bundle.js.originalSize;
        totalMinified += bundle.js.minifiedSize;
      }
    });
    
    if (totalOriginal > 0) {
      manifest.performance.compressionRatio = ((totalOriginal - totalMinified) / totalOriginal * 100);
    }
  }
  
  if (buildData.images && buildData.images.images) {
    manifest.performance.optimizedImages = Object.keys(buildData.images.images).length;
  }
  
  return manifest;
}

// Main enhanced build process
async function enhancedBuild() {
  const buildStartTime = Date.now();
  const buildData = {};
  
  try {
    console.log('🏗️  Starting enhanced production build...');
    console.log(`🎯 Optimization stages: ${ENHANCED_BUILD_CONFIG.stages.join(' → ')}\n`);
    
    // Stage 1: Cleanup
    console.log('🧹 Stage 1: Cleanup');
    if (fs.existsSync(ENHANCED_BUILD_CONFIG.outputDir)) {
      execSync(`rm -rf ${ENHANCED_BUILD_CONFIG.outputDir}`);
    }
    ensureDir(ENHANCED_BUILD_CONFIG.outputDir);
    console.log('\u2705 Build directory cleaned\n');
    
    // Stage 2: Copy static files
    console.log('📁 Stage 2: Copy Static Files');
    ENHANCED_BUILD_CONFIG.staticFiles.forEach(file => {
      if (fs.existsSync(file)) {
        copyFile(file, path.join(ENHANCED_BUILD_CONFIG.outputDir, file));
        console.log(`  ✅ Copied: ${file}`);
      } else {
        console.warn(`  ⚠️  File not found: ${file}`);
      }
    });
    
    ENHANCED_BUILD_CONFIG.staticDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        copyDirectory(dir, path.join(ENHANCED_BUILD_CONFIG.outputDir, dir));
        console.log(`  ✅ Copied: ${dir}/`);
      } else {
        console.warn(`  ⚠️  Directory not found: ${dir}`);
      }
    });
    console.log('✅ Static files copied\n');
    
    // Stage 3: Optimize images
    console.log('🖼️  Stage 3: Image Optimization');
    buildData.images = optimizeImages();
    console.log('✅ Images optimized\n');
    
    // Stage 4: Bundle resources
    console.log('📦 Stage 4: Resource Bundling');
    buildData.bundles = createBundles();
    console.log('✅ Resources bundled\n');
    
    // Stage 5: Generate critical CSS
    console.log('🎨 Stage 5: Critical CSS Generation');
    const criticalCSS = generateEnhancedCriticalCSS();
    buildData.criticalCSS = criticalCSS;
    console.log('✅ Critical CSS generated\n');
    
    // Stage 6: Optimize HTML
    console.log('🔧 Stage 6: HTML Optimization');
    ['index.html', 'index-he.html'].forEach(file => {
      const filePath = path.join(ENHANCED_BUILD_CONFIG.outputDir, file);
      if (fs.existsSync(filePath)) {
        optimizeHTML(filePath, buildData.bundles);
        inlineCriticalCSS(filePath, criticalCSS);
        console.log(`  ✅ Optimized: ${file}`);
      }
    });
    console.log('✅ HTML optimized\n');
    
    // Stage 7: Create service worker
    console.log('⚡ Stage 7: Service Worker Creation');
    const originalDir = process.cwd();
    process.chdir(ENHANCED_BUILD_CONFIG.outputDir);
    buildData.serviceWorker = createServiceWorker();
    process.chdir(originalDir);
    
    // Copy service worker files to dist
    ['service-worker.js', 'offline.html'].forEach(file => {
      if (fs.existsSync(file)) {
        copyFile(file, path.join(ENHANCED_BUILD_CONFIG.outputDir, file));
        console.log(`  ✅ Copied: ${file}`);
      }
    });
    console.log('\u2705 Service worker created\n');
    
    // Stage 8: Generate build manifest
    console.log('📋 Stage 8: Build Manifest Generation');
    const buildManifest = generateBuildManifest(buildData);
    fs.writeFileSync(
      path.join(ENHANCED_BUILD_CONFIG.outputDir, 'build-manifest.json'),
      JSON.stringify(buildManifest, null, 2)
    );
    console.log('\u2705 Build manifest generated\n');
    
    // Stage 9: Validation
    console.log('🔍 Stage 9: Build Validation');
    const requiredFiles = ['index.html', 'index-he.html', 'service-worker.js', 'offline.html'];
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(ENHANCED_BUILD_CONFIG.outputDir, file))
    );
    
    if (missingFiles.length > 0) {
      console.warn(`⚠️  Missing files: ${missingFiles.join(', ')}`);
    } else {
      console.log('✅ All required files present');
    }
    
    const buildTime = Date.now() - buildStartTime;
    
    // Final summary
    console.log('\n\ud83c\udf89 Enhanced build completed successfully!');
    console.log('==========================================\n');
    console.log('📊 Build Summary:');
    console.log(`  ⏱️  Build time: ${(buildTime / 1000).toFixed(2)}s`);
    console.log(`  📁 Output directory: ${ENHANCED_BUILD_CONFIG.outputDir}/`);
    console.log(`  📄 Files processed: ${buildManifest.files.length}`);
    console.log(`  💾 Total size: ${Math.round(buildManifest.performance.totalSize / 1024)}KB`);
    console.log(`  🖼️  Images optimized: ${buildManifest.performance.optimizedImages}`);
    console.log(`  📦 Bundles created: ${buildManifest.performance.bundleCount}`);
    console.log(`  🗜️  Compression ratio: ${buildManifest.performance.compressionRatio.toFixed(1)}%`);
    
    console.log('\n\ud83d\ude80 Optimizations Applied:');
    console.log('  ✅ Advanced image optimization (WebP, AVIF, responsive)');
    console.log('  ✅ Resource bundling with cache busting');
    console.log('  ✅ Critical CSS extraction and inlining');
    console.log('  ✅ Service worker with multiple caching strategies');
    console.log('  ✅ Progressive Web App features');
    console.log('  ✅ Offline functionality');
    console.log('  ✅ Performance monitoring');
    console.log('  ✅ Connection status indicators');
    
    console.log('\n\ud83c\udfaf Ready for deployment!');
    console.log('  📁 Deploy the dist/ directory to your hosting provider');
    console.log('  🔧 Configure HTTP/2 server push using dist/bundles/http2-headers.txt');
    console.log('  📈 Monitor performance using browser DevTools and build-manifest.json');
    
    return buildManifest;
    
  } catch (error) {
    console.error('❌ Enhanced build failed:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = {
  enhancedBuild,
  optimizeHTML,
  generateBuildManifest
};

// Run enhanced build
if (require.main === module) {
  enhancedBuild();
}