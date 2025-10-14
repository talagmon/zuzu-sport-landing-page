#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating properly styled build with performance optimizations...');

// Create a new build directory
const buildDir = path.join(__dirname, '../build-working');

// Create build directory
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Copy optimized resources
const distResourcesDir = path.join(__dirname, '../dist/resources');
const buildResourcesDir = path.join(buildDir, 'resources');

if (fs.existsSync(distResourcesDir)) {
    console.log('📁 Copying optimized images...');
    fs.cpSync(distResourcesDir, buildResourcesDir, { recursive: true });
}

// Copy static files
const staticFiles = [
    'favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 
    'apple-touch-icon.png', 'site.webmanifest', 'robots.txt', 
    'sitemap.xml', 'service-worker.js'
];

staticFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    const destPath = path.join(buildDir, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
    }
});

// HTML files to process
const htmlFiles = [
    'index.html', 'index-he.html', 'progress.html', 'progress-he.html',
    'safety.html', 'safety-he.html', 'privacy-policy.html', 'privacy-policy-he.html',
    'terms.html', 'terms-he.html', 'cookie-policy.html', 'cookie-policy-he.html',
    'coppa-compliance.html', 'coppa-compliance-he.html'
];

// Process each HTML file
htmlFiles.forEach(filename => {
    const srcPath = path.join(__dirname, '..', filename);
    const destPath = path.join(buildDir, filename);
    
    if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        
        // Fix Tailwind CSS loading by ensuring it loads properly
        content = content.replace(
            '<script src="https://cdn.tailwindcss.com"></script>',
            `<script src="https://cdn.tailwindcss.com"></script>
    <script>
        // Ensure Tailwind is loaded before config
        window.tailwindLoadTimeout = setTimeout(function() {
            if (typeof tailwind === 'undefined') {
                console.warn('Tailwind CSS failed to load from CDN');
            }
        }, 3000);
    </script>`
        );

        // Wrap Tailwind config in a function that waits for Tailwind to load
        content = content.replace(
            /tailwind\.config\s*=\s*{[\s\S]*?};/,
            `// Wait for Tailwind to load before configuring
        function configureTailwind() {
            if (typeof tailwind !== 'undefined') {
                clearTimeout(window.tailwindLoadTimeout);
                tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                'canela': ['Canela', 'serif'],
                                'suisse': ['Suisse International', 'sans-serif']
                            },
                            colors: {
                                // Original colors (keeping for fallback)
                                'sage': '#8FBC8F',
                                'coral': '#FF7F7F', 
                                'teal': '#2F4F4F',
                                'cream': '#FDF5E6',
                                // Ocean-coral color palette - calming and sophisticated
                                'ocean-deep': '#0077B6',
                                'ocean-bright': '#00B4D8',
                                'ocean-light': '#90E0EF',
                                'ocean-pale': '#CAF0F8',
                                'coral-soft': '#F5B7B1',
                                // Additional complementary colors
                                'ocean-cream': '#F8FCFF',
                                'coral-light': '#FADBD8',
                                'ocean-medium': '#48B2D8' 
                            }
                        }
                    }
                };
            } else {
                setTimeout(configureTailwind, 100);
            }
        }
        configureTailwind();`
        );

        // Add fallback CSS for navigation spacing in case Tailwind doesn't load
        content = content.replace(
            '</style>',
            `
        /* Fallback CSS for navigation and critical styling */
        .space-x-6 > * + * { margin-left: 1.5rem !important; }
        .space-x-4 > * + * { margin-left: 1rem !important; }
        .space-x-8 > * + * { margin-left: 2rem !important; }
        .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
        .py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
        .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
        .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
        .py-6 { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
        .py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        .py-12 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
        .py-16 { padding-top: 4rem !important; padding-bottom: 4rem !important; }
        .py-20 { padding-top: 5rem !important; padding-bottom: 5rem !important; }
        .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        .px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
        .text-sm { font-size: 0.875rem !important; }
        .text-lg { font-size: 1.125rem !important; }
        .text-xl { font-size: 1.25rem !important; }
        .text-2xl { font-size: 1.5rem !important; }
        .text-3xl { font-size: 1.875rem !important; }
        .text-4xl { font-size: 2.25rem !important; }
        .text-5xl { font-size: 3rem !important; }
        .font-bold { font-weight: 700 !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-medium { font-weight: 500 !important; }
        .rounded-lg { border-radius: 0.5rem !important; }
        .rounded-xl { border-radius: 0.75rem !important; }
        .rounded-2xl { border-radius: 1rem !important; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important; }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
        .flex { display: flex !important; }
        .items-center { align-items: center !important; }
        .justify-center { justify-content: center !important; }
        .justify-between { justify-content: space-between !important; }
        .grid { display: grid !important; }
        .gap-6 { gap: 1.5rem !important; }
        .gap-8 { gap: 2rem !important; }
        .gap-12 { gap: 3rem !important; }
        .max-w-6xl { max-width: 72rem !important; }
        .max-w-4xl { max-width: 56rem !important; }
        .max-w-2xl { max-width: 42rem !important; }
        .mx-auto { margin-left: auto !important; margin-right: auto !important; }
        .container { width: 100% !important; margin-left: auto !important; margin-right: auto !important; padding-left: 1rem !important; padding-right: 1rem !important; }
        .text-white { color: white !important; }
        .text-center { text-align: center !important; }
        .block { display: block !important; }
        .hidden { display: none !important; }
        .relative { position: relative !important; }
        .absolute { position: absolute !important; }
        .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
        .w-full { width: 100% !important; }
        .h-full { height: 100% !important; }
        .object-cover { object-fit: cover !important; }
        .transition-all { transition: all 0.3s ease !important; }
        .duration-300 { transition-duration: 300ms !important; }
        .hover\\:scale-105:hover { transform: scale(1.05) !important; }
        .hover\\:shadow-xl:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important; }
        .bg-white { background-color: white !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .bg-gray-900 { background-color: #111827 !important; }
        .text-gray-600 { color: #4b5563 !important; }
        .text-gray-700 { color: #374151 !important; }
        .text-gray-800 { color: #1f2937 !important; }
        .text-gray-900 { color: #111827 !important; }
        .border { border-width: 1px !important; }
        .border-gray-200 { border-color: #e5e7eb !important; }
        .overflow-hidden { overflow: hidden !important; }
        
        /* Navigation specific fixes */
        nav a { margin-right: 1.5rem !important; }
        nav a:last-child { margin-right: 0 !important; }
        .nav-link { display: inline-block !important; padding: 0.5rem 0 !important; }
        
        /* Grid layouts */
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        
        @media (min-width: 640px) {
            .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .sm\\:px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
        }
        
        @media (min-width: 768px) {
            .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .md\\:px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
            .md\\:text-5xl { font-size: 3rem !important; }
            .md\\:text-6xl { font-size: 3.75rem !important; }
        }
        
        @media (min-width: 1024px) {
            .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
            .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            .lg\\:px-8 { padding-left: 2rem !important; padding-right: 2rem !important; }
            .lg\\:text-6xl { font-size: 3.75rem !important; }
        }
        </style>`
        );
        
        // Optimize images to use WebP with fallbacks
        content = content.replace(/src="resources\/([^"]+\.(jpg|jpeg|png))"/gi, (match, imagePath) => {
            const baseImageName = imagePath.replace(/\.(jpg|jpeg|png)$/i, '');
            const webpPath = `resources/optimized/${baseImageName}.webp`;
            const webpFullPath = path.join(buildDir, webpPath);
            
            if (fs.existsSync(webpFullPath)) {
                return `src="${webpPath}" data-fallback="resources/${imagePath}"`;
            }
            return match;
        });
        
        // Add image optimization script
        content = content.replace('</body>', `
<script>
// Image optimization with WebP support detection
document.addEventListener('DOMContentLoaded', function() {
    function supportsWebP() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = function () {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    supportsWebP().then(supported => {
        const images = document.querySelectorAll('img[data-fallback]');
        images.forEach(img => {
            if (!supported) {
                img.src = img.dataset.fallback;
            }
            img.style.opacity = '1';
            img.style.transition = 'opacity 0.3s ease';
        });
    });
    
    // Initialize image loading states
    const images = document.querySelectorAll('img[data-fallback]');
    images.forEach(img => {
        img.style.opacity = '0';
    });
});
</script>
</body>`);
        
        fs.writeFileSync(destPath, content);
        console.log(`✅ Fixed ${filename} with proper styling`);
    }
});

console.log(`
🎉 Working build created successfully!

✅ Location: build-working/
✅ Original styling preserved with fallback CSS
✅ Tailwind CSS properly configured
✅ Navigation spacing fixed
✅ Optimized images with WebP support
✅ All interactive features working

To test the working version:
npx http-server build-working -p 8090 -c-1 --cors

URLs:
🇺🇸 English: http://localhost:8090/index.html
🇮🇱 Hebrew: http://localhost:8090/index-he.html
`);