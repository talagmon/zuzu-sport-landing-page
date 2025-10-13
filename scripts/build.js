#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting ZuzuSport production build...');

const BUILD_CONFIG = {
  outputDir: 'dist',
  sourceDir: '.',
  
  // Files to copy to production
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
  
  // Files to process/minify
  processFiles: {
    'main.js': 'main.min.js'
  },
  
  // Critical CSS files to inline
  criticalCSS: {
    'index.html': 'critical-en.css',
    'index-he.html': 'critical-he.css'
  }
};

// Utility functions
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  console.log(`✅ Copied: ${src} → ${dest}`);
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
    
    // Simple minification - remove comments and unnecessary whitespace
    let content = fs.readFileSync(inputFile, 'utf8');
    
    // Remove single-line comments
    content = content.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove extra whitespace
    content = content.replace(/\s+/g, ' ').trim();
    
    fs.writeFileSync(outputFile, content);
    console.log(`✅ Minified: ${outputFile}`);
  } catch (error) {
    console.warn(`⚠️  Could not minify ${inputFile}:`, error.message);
    // Copy original file if minification fails
    copyFile(inputFile, outputFile);
  }
}

function optimizeHTML(filePath) {
  console.log(`🔧 Optimizing HTML: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update script references to minified versions
  content = content.replace(/main\.js/g, 'main.min.js');
  
  // Remove existing Tailwind CSS CDN to defer it
  content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '');
  
  // Add preconnect and preload hints for critical resources
  const preloadHints = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">
    <link rel="preload" href="main.min.js" as="script">
    <link rel="preload" href="resources/hero-kids.webp" as="image">`;
  
  content = content.replace('</head>', `${preloadHints}\n</head>`);
  
  // Add deferred CSS loading script
  const deferredCSS = `
    <script>
      // Load non-critical CSS asynchronously
      function loadCSS(href) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = function() { this.media = 'all'; };
        document.head.appendChild(link);
      }
      
      // Load Tailwind CSS after page load
      window.addEventListener('load', function() {
        loadCSS('https://cdn.tailwindcss.com');
      });
      
      // Preload key resources when idle
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(function() {
          var heroImg = new Image();
          heroImg.src = 'resources/hero-kids.webp';
          
          var screenshots = [
            'resources/app-screenshot-1.webp',
            'resources/app-screenshot-2.webp',
            'resources/app-screenshot-3.webp'
          ];
          
          screenshots.forEach(function(src) {
            var img = new Image();
            img.src = src;
          });
        });
      }
    </script>`;
  
  content = content.replace('</body>', `${deferredCSS}\n</body>`);
  
  // Optimize images to use WebP first
  content = content.replace(/src="resources\/([^"]+)\.(jpg|png)"/g, (match, filename, ext) => {
    return `src="resources/${filename}.webp" onerror="this.src='resources/${filename}.${ext}'"`;  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Optimized: ${filePath}`);
}

function generateCriticalCSS() {
  console.log('🎨 Generating enhanced critical CSS...');
  
  // Use enhanced critical CSS extraction
  const { generateEnhancedCriticalCSS } = require('./extract-critical-css.js');
  const criticalCSS = generateEnhancedCriticalCSS();
  
  // Font loading CSS
  const fontCSS = `
/* Font loading optimization */
@font-face {
  font-family: 'Suisse International';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Canela';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

/* Hebrew fonts */
@font-face {
  font-family: 'Assistant';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
`;
  
  const fullCriticalCSS = criticalCSS + fontCSS;
  
  fs.writeFileSync(path.join(BUILD_CONFIG.outputDir, 'critical-en.css'), fullCriticalCSS);
  fs.writeFileSync(path.join(BUILD_CONFIG.outputDir, 'critical-he.css'), fullCriticalCSS);
  console.log('✅ Enhanced critical CSS generated');
}

function inlineCriticalCSS(htmlFile, cssFile) {
  console.log(`🎨 Inlining critical CSS: ${htmlFile}`);
  
  let html = fs.readFileSync(htmlFile, 'utf8');
  const css = fs.readFileSync(cssFile, 'utf8');
  
  const inlineCSS = `<style>${css}</style>`;
  html = html.replace('</head>', `${inlineCSS}\n</head>`);
  
  fs.writeFileSync(htmlFile, html);
  console.log(`✅ Critical CSS inlined: ${htmlFile}`);
}

function generateDeploymentManifest() {
  const manifest = {
    buildTime: new Date().toISOString(),
    version: '1.0.0',
    files: [],
    checksums: {}
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
        
        // Generate simple checksum (file size for now)
        const stats = fs.statSync(fullPath);
        manifest.checksums[relativePath] = stats.size;
      }
    });
  }
  
  collectFiles(BUILD_CONFIG.outputDir);
  
  fs.writeFileSync(
    path.join(BUILD_CONFIG.outputDir, 'manifest.json'), 
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('📋 Deployment manifest generated');
}

// Main build process
async function build() {
  try {
    console.log('🏗️  Preparing build environment...');
    
    // Clean and create output directory
    if (fs.existsSync(BUILD_CONFIG.outputDir)) {
      execSync(`rm -rf ${BUILD_CONFIG.outputDir}`);
    }
    ensureDir(BUILD_CONFIG.outputDir);
    
    // Copy static files
    console.log('📁 Copying static files...');
    BUILD_CONFIG.staticFiles.forEach(file => {
      if (fs.existsSync(file)) {
        copyFile(file, path.join(BUILD_CONFIG.outputDir, file));
      } else {
        console.warn(`⚠️  File not found: ${file}`);
      }
    });
    
    // Copy static directories
    console.log('📁 Copying static directories...');
    BUILD_CONFIG.staticDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        copyDirectory(dir, path.join(BUILD_CONFIG.outputDir, dir));
      } else {
        console.warn(`⚠️  Directory not found: ${dir}`);
      }
    });
    
    // Process and minify files
    console.log('🔧 Processing JavaScript files...');
    Object.entries(BUILD_CONFIG.processFiles).forEach(([input, output]) => {
      if (fs.existsSync(input)) {
        minifyJS(input, path.join(BUILD_CONFIG.outputDir, output));
      } else {
        console.warn(`⚠️  File not found: ${input}`);
      }
    });
    
    // Generate critical CSS
    generateCriticalCSS();
    
    // Optimize HTML files
    console.log('🔧 Optimizing HTML files...');
    ['index.html', 'index-he.html'].forEach(file => {
      const filePath = path.join(BUILD_CONFIG.outputDir, file);
      if (fs.existsSync(filePath)) {
        optimizeHTML(filePath);
        
        // Inline critical CSS
        const cssFile = file === 'index.html' ? 'critical-en.css' : 'critical-he.css';
        inlineCriticalCSS(filePath, path.join(BUILD_CONFIG.outputDir, cssFile));
      }
    });
    
    // Generate deployment manifest
    generateDeploymentManifest();
    
    // Build summary
    const stats = fs.statSync(BUILD_CONFIG.outputDir);
    console.log('\n🎉 Build completed successfully!');
    console.log(`📊 Build output: ${BUILD_CONFIG.outputDir}/`);
    console.log(`📁 Files processed: ${BUILD_CONFIG.staticFiles.length + Object.keys(BUILD_CONFIG.processFiles).length}`);
    console.log(`⏰ Build time: ${new Date().toISOString()}`);
    
    // File size analysis
    const files = execSync(`find ${BUILD_CONFIG.outputDir} -type f | wc -l`).toString().trim();
    const size = execSync(`du -sh ${BUILD_CONFIG.outputDir}`).toString().split('\t')[0];
    console.log(`📈 Total files: ${files}`);
    console.log(`💾 Total size: ${size}`);
    
    console.log('\n✅ Production build ready for deployment!');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run build
build();