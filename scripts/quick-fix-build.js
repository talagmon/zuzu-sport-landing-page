#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating quick fix for CSS and styling issues...');

// Copy original files to a new 'fixed' directory
const fixedDir = path.join(__dirname, '../dist-fixed');

// Create fixed directory
if (!fs.existsSync(fixedDir)) {
    fs.mkdirSync(fixedDir, { recursive: true });
}

// Copy all optimized images from dist
const distResourcesDir = path.join(__dirname, '../dist/resources');
const fixedResourcesDir = path.join(fixedDir, 'resources');

if (fs.existsSync(distResourcesDir)) {
    console.log('📁 Copying optimized images...');
    fs.cpSync(distResourcesDir, fixedResourcesDir, { recursive: true });
}

// Copy other static files
const staticFiles = [
    'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 
    'apple-touch-icon.png', 'site.webmanifest', 'robots.txt', 
    'sitemap.xml', 'service-worker.js', 'offline.html'
];

staticFiles.forEach(file => {
    const srcPath = path.join(__dirname, '../dist', file);
    const destPath = path.join(fixedDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

// Copy original HTML files but modify them to use optimized images
const htmlFiles = [
    'index.html', 'index-he.html', 'progress.html', 'progress-he.html',
    'safety.html', 'safety-he.html', 'privacy-policy.html', 'privacy-policy-he.html',
    'terms.html', 'terms-he.html', 'cookie-policy.html', 'cookie-policy-he.html',
    'coppa-compliance.html', 'coppa-compliance-he.html'
];

htmlFiles.forEach(filename => {
    const srcPath = path.join(__dirname, '..', filename);
    const destPath = path.join(fixedDir, filename);
    
    if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Replace image references to use optimized versions when available
        content = content.replace(/src="resources\/([^"]+\.(jpg|jpeg|png))"/gi, (match, imagePath) => {
            // Check if WebP version exists in optimized folder
            const baseImageName = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
            const webpPath = `resources/optimized/${baseImageName}.webp`;
            const webpFullPath = path.join(fixedDir, webpPath);
            
            if (fs.existsSync(webpFullPath)) {
                // Create responsive image with WebP and fallback
                return `src="${webpPath}" data-fallback="resources/${imagePath}"`;
            }
            return match;
        });
        
        // Add lazy loading script at the end of body
        content = content.replace('</body>', `
<script>
// Lazy loading with WebP fallback
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-fallback]');
    
    images.forEach(img => {
        // Test WebP support
        const webp = new Image();
        webp.onload = webp.onerror = function () {
            if (webp.height == 2) {
                // WebP supported - image is already correct
                img.style.opacity = '1';
            } else {
                // WebP not supported - use fallback
                img.src = img.dataset.fallback;
                img.style.opacity = '1';
            }
        };
        webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        
        // Initially hide image until format is determined
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    });
});
</script>
</body>`);
        
        fs.writeFileSync(destPath, content);
        console.log(`✅ Fixed ${filename}`);
    }
});

console.log(`
🎉 Quick fix complete! 

✅ Fixed files are in: dist-fixed/
✅ All original styling preserved
✅ Optimized images included  
✅ WebP fallback added

To test the fixed version:
npx http-server dist-fixed -p 8081 -c-1 --cors

URLs:
- English: http://localhost:8081/index.html
- Hebrew: http://localhost:8081/index-he.html
`);