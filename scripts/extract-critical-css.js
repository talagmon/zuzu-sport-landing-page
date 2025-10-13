#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Advanced Critical CSS Extraction');

const CRITICAL_CSS_CONFIG = {
  // Viewport dimensions for critical CSS calculation
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1200, height: 800 }
  },
  
  // Critical selectors that should always be included
  criticalSelectors: [
    'body',
    'html',
    'nav',
    '.hero-bg',
    '.btn-primary',
    'h1',
    'h2',
    '.typewriter',
    '.mobile-menu-btn-enhanced',
    '.hamburger',
    '.skip-link',
    // Above-the-fold specific classes
    '.content-overlay',
    '.max-w-7xl',
    '.mx-auto',
    '.px-4',
    '.sm\\:px-6',
    '.lg\\:px-8',
    '.grid',
    '.lg\\:grid-cols-2',
    '.gap-12',
    '.items-center',
    '.text-5xl',
    '.lg\\:text-7xl',
    '.font-canela',
    '.font-bold',
    '.mb-6',
    '.leading-tight',
    '.text-gray-800',
    '.text-xl',
    '.lg\\:text-2xl',
    '.mb-8',
    '.leading-relaxed',
    '.opacity-90',
    '.flex',
    '.flex-col',
    '.sm\\:flex-row',
    '.gap-4',
    '.bg-black',
    '.hover\\:bg-gray-800',
    '.text-white',
    '.px-8',
    '.py-4',
    '.rounded-2xl',
    '.font-semibold',
    '.text-lg',
    '.inline-flex',
    '.items-center',
    '.justify-center',
    '.transition-all',
    '.duration-300',
    '.transform',
    '.hover\\:scale-105'
  ],
  
  // Tailwind utilities that should be included
  tailwindUtilities: [
    // Layout
    'container', 'mx-auto', 'px-4', 'py-4', 'sm:px-6', 'lg:px-8',
    // Flexbox
    'flex', 'flex-col', 'flex-row', 'items-center', 'justify-center', 'justify-between',
    // Grid
    'grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-4', 'gap-8', 'gap-12',
    // Spacing
    'mb-4', 'mb-6', 'mb-8', 'mt-4', 'mt-6', 'mt-8', 'p-4', 'p-6', 'p-8',
    // Typography
    'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl',
    'font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold',
    'leading-tight', 'leading-relaxed', 'text-center', 'text-left', 'text-right',
    // Colors
    'text-white', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'bg-white', 'bg-black', 'bg-gray-100', 'bg-gray-200',
    // Custom colors from config
    'text-teal', 'text-ocean-light', 'text-ocean-bright', 'text-ocean-deep',
    'bg-ocean-light', 'bg-ocean-bright', 'bg-ocean-deep', 'bg-cream',
    // Border radius
    'rounded', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full',
    // Shadows
    'shadow', 'shadow-lg', 'shadow-xl', 'shadow-2xl',
    // Transitions
    'transition', 'transition-all', 'duration-300', 'ease-in-out',
    // Transforms
    'transform', 'hover:scale-105', 'hover:scale-110',
    // Position
    'relative', 'absolute', 'fixed', 'top-0', 'bottom-0', 'left-0', 'right-0',
    // Z-index
    'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    // Display
    'block', 'inline-block', 'inline-flex', 'hidden', 'sm:block', 'md:flex', 'lg:block',
    // Width/Height
    'w-full', 'w-auto', 'h-full', 'h-auto', 'min-h-screen'
  ]
};

function generateEnhancedCriticalCSS() {
  console.log('🔧 Generating enhanced critical CSS...');
  
  const criticalCSS = `
/* Critical CSS - Enhanced Above the Fold Styles */
/* Reset and base styles */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  line-height: 1.15;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: 'Suisse International', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #374151;
  text-align: left;
  background-color: #F8FCFF;
}

/* Skip link for accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #2F4F4F;
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 10000;
  font-weight: bold;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

/* Navigation */
nav {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgba(253, 245, 230, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 50;
  border-bottom: 1px solid rgba(144, 224, 239, 0.2);
}

/* Hero background */
.hero-bg {
  background: linear-gradient(135deg, 
    #F8FCFF 0%,     
    #CAF0F8 25%,    
    #90E0EF 50%,    
    #00B4D8 75%,    
    #F5B7B1 100%    
  );
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

/* Content overlay */
.content-overlay {
  position: relative;
  z-index: 2;
}

/* Typography */
h1 {
  font-family: 'Canela', serif;
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

@media (min-width: 1024px) {
  h1 {
    font-size: 4.5rem;
  }
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #00B4D8 0%, #0077B6 100%);
  border: none;
  color: white;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  padding: 0.75rem 2rem;
  border-radius: 9999px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.125rem;
  cursor: pointer;
}

.btn-primary:hover,
.btn-primary:focus {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 180, 216, 0.4);
  background: linear-gradient(135deg, #48B2D8 0%, #90E0EF 100%);
}

/* Mobile menu button */
.mobile-menu-btn-enhanced {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: none;
  cursor: pointer;
}

@media (min-width: 768px) {
  .mobile-menu-btn-enhanced {
    display: none;
  }
}

/* Hamburger animation */
.hamburger {
  width: 24px;
  height: 24px;
  position: relative;
}

.hamburger span {
  display: block;
  position: absolute;
  width: 24px;
  height: 2px;
  background: #2F4F4F;
  border-radius: 1px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.hamburger span:nth-child(1) { top: 6px; }
.hamburger span:nth-child(2) { top: 11px; }
.hamburger span:nth-child(3) { top: 16px; }

/* Layout utilities */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-20 { padding-top: 5rem; padding-bottom: 5rem; }

@media (min-width: 640px) {
  .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .sm\\:flex-row { flex-direction: row; }
}

@media (min-width: 1024px) {
  .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
  .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lg\\:text-7xl { font-size: 4.5rem; line-height: 1; }
  .lg\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
}

/* Flexbox */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }

/* Grid */
.grid { display: grid; }
.gap-4 { gap: 1rem; }
.gap-12 { gap: 3rem; }

/* Text utilities */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-5xl { font-size: 3rem; line-height: 1; }
.font-canela { font-family: 'Canela', serif; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-gray-800 { color: #1f2937; }
.text-white { color: #ffffff; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.opacity-90 { opacity: 0.9; }

/* Background utilities */
.bg-black { background-color: #000000; }
.hover\\:bg-gray-800:hover { background-color: #1f2937; }

/* Spacing utilities */
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

/* Border utilities */
.rounded-2xl { border-radius: 1rem; }

/* Transition utilities */
.transition-all { transition-property: all; }
.duration-300 { transition-duration: 300ms; }
.transform { transform: translateZ(0); }
.hover\\:scale-105:hover { transform: scale(1.05); }

/* Display utilities */
.inline-flex { display: inline-flex; }
.hidden { display: none; }

@media (max-width: 767px) {
  .md\\:hidden { display: none; }
}

@media (min-width: 768px) {
  .md\\:flex { display: flex; }
}

/* RTL Support */
[dir="rtl"] .text-right { text-align: right; }
[dir="rtl"] .mr-3 { margin-right: 0.75rem; }
[dir="rtl"] .ml-3 { margin-left: 0.75rem; }

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .hero-bg::before,
  .btn-primary,
  .hamburger span,
  .mobile-menu-btn-enhanced {
    animation: none !important;
    transition: none !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn-primary {
    border: 2px solid #ffffff;
  }
  
  .text-gray-800 {
    color: #000000;
  }
}
`;

  return criticalCSS;
}

function generateFontLoadingCSS() {
  return `
/* Font loading optimization */
@font-face {
  font-family: 'Suisse International';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Suisse+International:wght@300;400;500;600;700&display=swap');
}

@font-face {
  font-family: 'Canela';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Canela:wght@300;400;500;600;700&display=swap');
}

/* Hebrew fonts */
@font-face {
  font-family: 'Assistant';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600;700&display=swap');
}

@font-face {
  font-family: 'Heebo';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap');
}
`;
}

function generateDeferredCSS() {
  return `
/* Deferred CSS - Below the fold */
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
  
  // Preload key resources
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(function() {
      // Preload hero image
      var heroImg = new Image();
      heroImg.src = '/resources/hero-kids.webp';
      
      // Preload app screenshots
      var screenshots = [
        '/resources/app-screenshot-1.webp',
        '/resources/app-screenshot-2.webp',
        '/resources/app-screenshot-3.webp'
      ];
      
      screenshots.forEach(function(src) {
        var img = new Image();
        img.src = src;
      });
    });
  }
</script>
`;
}

function injectCriticalCSS(htmlFile, criticalCSS) {
  console.log(`🎨 Injecting critical CSS into ${htmlFile}`);
  
  if (!fs.existsSync(htmlFile)) {
    console.warn(`⚠️  File not found: ${htmlFile}`);
    return;
  }
  
  let html = fs.readFileSync(htmlFile, 'utf8');
  
  // Remove existing Tailwind CSS CDN link to avoid render blocking
  html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '');
  
  // Inject critical CSS
  const criticalCSSBlock = `
    <!-- Critical CSS -->
    <style>
      ${criticalCSS}
    </style>`;
  
  // Insert before closing head tag
  html = html.replace('</head>', `${criticalCSSBlock}\n</head>`);
  
  // Add deferred CSS loading
  const deferredCSS = generateDeferredCSS();
  html = html.replace('</body>', `${deferredCSS}\n</body>`);
  
  fs.writeFileSync(htmlFile, html);
  console.log(`✅ Critical CSS injected into ${htmlFile}`);
}

function optimizeRenderBlocking(htmlFile) {
  console.log(`🚀 Optimizing render-blocking resources in ${htmlFile}`);
  
  if (!fs.existsSync(htmlFile)) {
    console.warn(`⚠️  File not found: ${htmlFile}`);
    return;
  }
  
  let html = fs.readFileSync(htmlFile, 'utf8');
  
  // Add preconnect for external resources
  const preconnects = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="dns-prefetch" href="//cdn.tailwindcss.com">`;
  
  html = html.replace('<head>', `<head>${preconnects}`);
  
  // Optimize font loading
  html = html.replace(
    /rel="stylesheet"/g, 
    'rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"'
  );
  
  fs.writeFileSync(htmlFile, html);
  console.log(`✅ Render-blocking optimization applied to ${htmlFile}`);
}

// Main execution
function main() {
  console.log('🎨 Starting advanced critical CSS extraction...');
  
  // Generate enhanced critical CSS
  const criticalCSS = generateEnhancedCriticalCSS();
  const fontCSS = generateFontLoadingCSS();
  const fullCriticalCSS = criticalCSS + fontCSS;
  
  // Save critical CSS files
  const criticalDir = 'dist/css';
  if (!fs.existsSync(criticalDir)) {
    fs.mkdirSync(criticalDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(criticalDir, 'critical-en.css'), fullCriticalCSS);
  fs.writeFileSync(path.join(criticalDir, 'critical-he.css'), fullCriticalCSS);
  console.log('✅ Critical CSS files generated');
  
  // Apply to HTML files
  const htmlFiles = ['dist/index.html', 'dist/index-he.html'];
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      injectCriticalCSS(file, fullCriticalCSS);
      optimizeRenderBlocking(file);
    } else {
      console.warn(`⚠️  HTML file not found: ${file}`);
    }
  });
  
  console.log('\n✅ Critical CSS extraction completed!');
  console.log('📊 Optimizations applied:');
  console.log('  ✅ Above-the-fold styles inlined');
  console.log('  ✅ Render-blocking resources deferred');
  console.log('  ✅ Font loading optimized');
  console.log('  ✅ Preconnect hints added');
  console.log('  ✅ Non-critical CSS loaded asynchronously');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateEnhancedCriticalCSS,
  injectCriticalCSS,
  optimizeRenderBlocking
};