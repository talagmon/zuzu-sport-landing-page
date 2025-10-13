#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Advanced Image Optimization System');

const IMAGE_CONFIG = {
  // Source directories
  sourceDir: 'resources',
  outputDir: 'resources/optimized',
  
  // Supported formats
  inputFormats: ['jpg', 'jpeg', 'png'],
  outputFormats: ['webp', 'avif'],
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 375,
    tablet: 768,
    desktop: 1200,
    large: 1920
  },
  
  // Quality settings
  quality: {
    webp: 85,
    avif: 75,
    jpeg: 80,
    png: 90
  },
  
  // Lazy loading configuration
  lazyConfig: {
    rootMargin: '50px',
    threshold: 0.1
  }
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

function getImageDimensions(imagePath) {
  try {
    const output = execSync(`identify -format "%wx%h" "${imagePath}"`, { encoding: 'utf8' });
    const [width, height] = output.trim().split('x').map(Number);
    return { width, height };
  } catch (error) {
    console.warn(`⚠️  Could not get dimensions for ${imagePath}:`, error.message);
    return { width: 1200, height: 800 }; // fallback
  }
}

function optimizeToWebP(inputPath, outputPath, width = null) {
  const qualityFlag = `-quality ${IMAGE_CONFIG.quality.webp}`;
  const resizeFlag = width ? `-resize ${width}x` : '';
  
  try {
    execSync(`convert "${inputPath}" ${resizeFlag} ${qualityFlag} "${outputPath}"`);
    console.log(`✅ WebP: ${outputPath}`);
  } catch (error) {
    console.warn(`⚠️  WebP conversion failed for ${inputPath}:`, error.message);
  }
}

function optimizeToAVIF(inputPath, outputPath, width = null) {
  const qualityFlag = `-quality ${IMAGE_CONFIG.quality.avif}`;
  const resizeFlag = width ? `-resize ${width}x` : '';
  
  try {
    // Check if ImageMagick supports AVIF
    execSync('convert -list format | grep -i avif', { stdio: 'ignore' });
    execSync(`convert "${inputPath}" ${resizeFlag} ${qualityFlag} "${outputPath}"`);
    console.log(`✅ AVIF: ${outputPath}`);
  } catch (error) {
    console.warn(`⚠️  AVIF not supported or conversion failed for ${inputPath}`);
  }
}

function generateResponsiveImages(imagePath) {
  console.log(`🔧 Processing: ${path.basename(imagePath)}`);
  
  const { name, ext } = path.parse(imagePath);
  const dimensions = getImageDimensions(imagePath);
  const outputDir = path.join(IMAGE_CONFIG.outputDir, path.dirname(path.relative(IMAGE_CONFIG.sourceDir, imagePath)));
  
  ensureDir(outputDir);
  
  const variants = [];
  
  // Generate responsive variants for each breakpoint
  Object.entries(IMAGE_CONFIG.breakpoints).forEach(([breakpoint, width]) => {
    // Only generate if the original is larger than the breakpoint
    if (dimensions.width >= width) {
      const variantName = `${name}-${width}w`;
      
      // Generate WebP variants
      const webpPath = path.join(outputDir, `${variantName}.webp`);
      optimizeToWebP(imagePath, webpPath, width);
      
      // Generate AVIF variants
      const avifPath = path.join(outputDir, `${variantName}.avif`);
      optimizeToAVIF(imagePath, avifPath, width);
      
      // Generate optimized original format
      const optimizedOriginal = path.join(outputDir, `${variantName}${ext}`);
      const quality = ext.toLowerCase().includes('png') ? IMAGE_CONFIG.quality.png : IMAGE_CONFIG.quality.jpeg;
      
      try {
        execSync(`convert "${imagePath}" -resize ${width}x -quality ${quality} "${optimizedOriginal}"`);
        console.log(`✅ Optimized: ${optimizedOriginal}`);
      } catch (error) {
        console.warn(`⚠️  Original format optimization failed:`, error.message);
      }
      
      variants.push({
        breakpoint,
        width,
        webp: path.relative('resources', webpPath),
        avif: fs.existsSync(avifPath) ? path.relative('resources', avifPath) : null,
        fallback: path.relative('resources', optimizedOriginal)
      });
    }
  });
  
  // Generate full-size optimized versions
  const fullSizeWebP = path.join(outputDir, `${name}.webp`);
  const fullSizeAVIF = path.join(outputDir, `${name}.avif`);
  const fullSizeOptimized = path.join(outputDir, `${name}${ext}`);
  
  optimizeToWebP(imagePath, fullSizeWebP);
  optimizeToAVIF(imagePath, fullSizeAVIF);
  
  const quality = ext.toLowerCase().includes('png') ? IMAGE_CONFIG.quality.png : IMAGE_CONFIG.quality.jpeg;
  try {
    execSync(`convert "${imagePath}" -quality ${quality} "${fullSizeOptimized}"`);
    console.log(`✅ Full-size optimized: ${fullSizeOptimized}`);
  } catch (error) {
    console.warn(`⚠️  Full-size optimization failed:`, error.message);
  }
  
  return {
    original: path.relative('resources', imagePath),
    optimized: {
      webp: path.relative('resources', fullSizeWebP),
      avif: fs.existsSync(fullSizeAVIF) ? path.relative('resources', fullSizeAVIF) : null,
      fallback: path.relative('resources', fullSizeOptimized)
    },
    responsive: variants
  };
}

function generatePictureElement(imageData, alt, className = '', loading = 'lazy') {
  const { optimized, responsive } = imageData;
  
  let pictureHTML = `<picture class="${className}">\n`;
  
  // Add responsive sources with modern formats
  responsive.reverse().forEach(variant => {
    if (variant.avif) {
      pictureHTML += `  <source media="(min-width: ${variant.width}px)" srcset="${variant.avif}" type="image/avif">\n`;
    }
    pictureHTML += `  <source media="(min-width: ${variant.width}px)" srcset="${variant.webp}" type="image/webp">\n`;
    pictureHTML += `  <source media="(min-width: ${variant.width}px)" srcset="${variant.fallback}">\n`;
  });
  
  // Add full-size sources
  if (optimized.avif) {
    pictureHTML += `  <source srcset="${optimized.avif}" type="image/avif">\n`;
  }
  pictureHTML += `  <source srcset="${optimized.webp}" type="image/webp">\n`;
  
  // Fallback img tag
  pictureHTML += `  <img src="${optimized.fallback}" alt="${alt}" loading="${loading}" class="${className}">\n`;
  pictureHTML += `</picture>`;
  
  return pictureHTML;
}

function generateLazyLoadingScript() {
  return `
<!-- Lazy Loading Script -->
<script>
  // Intersection Observer for lazy loading
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const picture = entry.target;
        const sources = picture.querySelectorAll('source');
        const img = picture.querySelector('img');
        
        // Load all sources
        sources.forEach(source => {
          if (source.dataset.srcset) {
            source.srcset = source.dataset.srcset;
            source.removeAttribute('data-srcset');
          }
        });
        
        // Load main image
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Add loaded class for CSS transitions
        picture.classList.add('loaded');
        
        observer.unobserve(picture);
      }
    });
  }, {
    rootMargin: '${IMAGE_CONFIG.lazyConfig.rootMargin}',
    threshold: ${IMAGE_CONFIG.lazyConfig.threshold}
  });
  
  // Observe all lazy images
  document.addEventListener('DOMContentLoaded', () => {
    const lazyPictures = document.querySelectorAll('picture[data-lazy]');
    lazyPictures.forEach(picture => {
      imageObserver.observe(picture);
    });
  });
  
  // Fallback for browsers without Intersection Observer
  if (!window.IntersectionObserver) {
    document.addEventListener('DOMContentLoaded', () => {
      const lazyPictures = document.querySelectorAll('picture[data-lazy]');
      lazyPictures.forEach(picture => {
        const sources = picture.querySelectorAll('source');
        const img = picture.querySelector('img');
        
        sources.forEach(source => {
          if (source.dataset.srcset) {
            source.srcset = source.dataset.srcset;
          }
        });
        
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        picture.classList.add('loaded');
      });
    });
  }
</script>`;
}

function generateImageCSS() {
  return `
/* Image Optimization CSS */
picture {
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

picture.loaded {
  opacity: 1;
}

picture img {
  width: 100%;
  height: auto;
  display: block;
}

/* Prevent layout shift */
.hero-image {
  aspect-ratio: 16/9;
  object-fit: cover;
}

.testimonial-image {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 50%;
}

.app-screenshot {
  aspect-ratio: 9/16;
  object-fit: cover;
  border-radius: 1rem;
}

/* Loading placeholder */
picture:not(.loaded) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Print styles */
@media print {
  picture source[type="image/webp"],
  picture source[type="image/avif"] {
    display: none;
  }
}
`;
}

// Main execution
function main() {
  console.log('🖼️  Starting advanced image optimization...\n');
  
  // Ensure output directory exists
  ensureDir(IMAGE_CONFIG.outputDir);
  
  // Find all images
  const imageFiles = [];
  
  function findImages(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && item !== 'optimized' && item !== 'originals') {
        findImages(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase().slice(1);
        if (IMAGE_CONFIG.inputFormats.includes(ext)) {
          imageFiles.push(fullPath);
        }
      }
    });
  }
  
  findImages(IMAGE_CONFIG.sourceDir);
  
  console.log(`📊 Found ${imageFiles.length} images to optimize\n`);
  
  // Process each image
  const optimizedImages = {};
  
  imageFiles.forEach(imagePath => {
    const relativePath = path.relative(IMAGE_CONFIG.sourceDir, imagePath);
    const imageData = generateResponsiveImages(imagePath);
    optimizedImages[relativePath] = imageData;
  });
  
  // Save optimization manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    config: IMAGE_CONFIG,
    images: optimizedImages
  };
  
  fs.writeFileSync(
    path.join(IMAGE_CONFIG.outputDir, 'optimization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('\n✅ Image optimization completed!');
  console.log(`📊 Optimization summary:`);
  console.log(`  • Images processed: ${imageFiles.length}`);
  console.log(`  • WebP variants generated`);
  console.log(`  • AVIF variants generated (if supported)`);
  console.log(`  • Responsive variants for ${Object.keys(IMAGE_CONFIG.breakpoints).length} breakpoints`);
  console.log(`  • Lazy loading script generated`);
  console.log(`  • Optimization CSS generated`);
  
  // Generate helper files
  fs.writeFileSync(
    path.join(IMAGE_CONFIG.outputDir, 'lazy-loading.js'),
    generateLazyLoadingScript()
  );
  
  fs.writeFileSync(
    path.join(IMAGE_CONFIG.outputDir, 'image-optimization.css'),
    generateImageCSS()
  );
  
  console.log(`\n📁 Helper files created in ${IMAGE_CONFIG.outputDir}/`);
  console.log(`  • optimization-manifest.json - Complete optimization data`);
  console.log(`  • lazy-loading.js - Intersection Observer implementation`);
  console.log(`  • image-optimization.css - Optimized image styles`);
  
  return optimizedImages;
}

// Export for use in other scripts
module.exports = {
  generatePictureElement,
  generateLazyLoadingScript,
  generateImageCSS,
  optimizeImages: main
};

// Run if called directly
if (require.main === module) {
  main();
}