// Main JavaScript for Zuzu Sport Landing Page
// Handles all interactive components and animations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initAccessibilityFeatures();
    initTypewriter();
    initScrollAnimations();
    initMobileMenu();
    initTestimonialCarousel();
    initBenefitCalculator();
    initParticleBackground();
    initProgressAnimations();
    initKeyboardNavigation();
    initFocusManagement();
});

// Typewriter effect for hero headline with accessibility support
function initTypewriter() {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const typedElement = document.getElementById('typed-text');
    
    if (!typedElement) return;
    
    if (!prefersReducedMotion) {
        const typed = new Typed('#typed-text', {
            strings: [
                'Transform Screen Time',
                'Into Healthy Movement',
                'For Your Kids'
            ],
            typeSpeed: 60,
            backSpeed: 40,
            backDelay: 2000,
            startDelay: 500,
            loop: false,
            showCursor: true,
            cursorChar: '|',
            onComplete: function() {
                // Remove cursor when done and announce completion
                setTimeout(() => {
                    const cursor = document.querySelector('.typed-cursor');
                    if (cursor) cursor.style.display = 'none';
                    announceToScreenReader('Main headline animation completed');
                }, 1000);
            }
        });
    } else {
        // For users who prefer reduced motion, show static text immediately
        typedElement.textContent = 'Transform Screen Time Into Healthy Movement For Your Kids';
        announceToScreenReader('Welcome to Zuzu Sport - Transform Screen Time Into Healthy Movement For Your Kids');
    }
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animate progress bars when they come into view
                if (entry.target.querySelector('.progress-bar')) {
                    const progressBar = entry.target.querySelector('.progress-bar');
                    setTimeout(() => {
                        progressBar.style.width = progressBar.style.width || '80%';
                    }, 500);
                }
            }
        });
    }, observerOptions);

    // Observe all reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Mobile menu functionality with accessibility support
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            
            mobileMenu.classList.toggle('hidden');
            
            // Update ARIA attributes
            mobileMenuBtn.setAttribute('aria-expanded', isHidden);
            
            // Focus management
            if (isHidden) {
                // Menu is being opened
                const firstMenuItem = mobileMenu.querySelector('a, button');
                if (firstMenuItem) {
                    setTimeout(() => firstMenuItem.focus(), 100);
                }
                announceToScreenReader('Menu opened');
            } else {
                // Menu is being closed
                announceToScreenReader('Menu closed');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                if (!mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    announceToScreenReader('Menu closed');
                }
            }
        });

        // Keyboard navigation for mobile menu
        mobileMenu.addEventListener('keydown', (e) => {
            const menuItems = Array.from(mobileMenu.querySelectorAll('a, button'));
            const currentIndex = menuItems.indexOf(document.activeElement);

            switch(e.key) {
                case 'Escape':
                    e.preventDefault();
                    mobileMenu.classList.add('hidden');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                    mobileMenuBtn.focus();
                    announceToScreenReader('Menu closed');
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % menuItems.length;
                    menuItems[nextIndex].focus();
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
                    menuItems[prevIndex].focus();
                    break;
            }
        });
    }
}

// Testimonial carousel
function initTestimonialCarousel() {
    const carousel = document.getElementById('testimonial-carousel');
    if (carousel) {
        new Splide('#testimonial-carousel', {
            type: 'loop',
            perPage: 1,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            arrows: false,
            pagination: true,
            breakpoints: {
                768: {
                    perPage: 1,
                    gap: '1rem'
                }
            }
        }).mount();
    }
}

// Benefit calculator functionality
function initBenefitCalculator() {
    const activity1Select = document.getElementById('activity1');
    const activity2Select = document.getElementById('activity2');
    const currentCostEl = document.getElementById('current-cost');
    const savingsEl = document.getElementById('savings');
    const annualSavingsEl = document.getElementById('annual-savings');

    function calculateSavings() {
        const activity1Cost = parseInt(activity1Select.value) || 0;
        const activity2Cost = parseInt(activity2Select.value) || 0;
        const currentTotal = activity1Cost + activity2Cost;
        const zuzuCost = 19.90;
        const monthlySavings = currentTotal - zuzuCost;
        const annualSavings = monthlySavings * 12;

        // Animate the numbers
        animateNumber(currentCostEl, currentTotal);
        animateNumber(savingsEl, Math.max(0, monthlySavings));
        animateNumber(annualSavingsEl, Math.max(0, annualSavings));
    }

    if (activity1Select && activity2Select) {
        activity1Select.addEventListener('change', calculateSavings);
        activity2Select.addEventListener('change', calculateSavings);
        
        // Initial calculation
        calculateSavings();
    }
}

// Animate number changes
function animateNumber(element, targetValue) {
    if (!element) return;
    
    const startValue = parseInt(element.textContent.replace(/[^\d]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutQuart);
        
        element.textContent = `₪${currentValue}`;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Particle background animation
function initParticleBackground() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    let particles = [];
    let animationId;

    function setup() {
        const canvas = createCanvas(windowWidth, windowHeight);
        canvas.parent('particles-canvas');
        
        // Create particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: random(width),
                y: random(height),
                size: random(2, 6),
                speedX: random(-0.5, 0.5),
                speedY: random(-0.5, 0.5),
                opacity: random(0.1, 0.3)
            });
        }
    }

    function draw() {
        clear();
        
        // Update and draw particles
        particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
            
            // Draw particle
            fill(255, 255, 255, particle.opacity * 255);
            noStroke();
            ellipse(particle.x, particle.y, particle.size);
        });
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
    }

    // Make functions global for p5.js
    window.setup = setup;
    window.draw = draw;
    window.windowResized = windowResized;
}

// Progress bar animations
function initProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const targetWidth = progressBar.style.width;
                
                // Reset width and animate
                progressBar.style.width = '0%';
                setTimeout(() => {
                    progressBar.style.width = targetWidth;
                }, 200);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Add loading states for buttons
document.querySelectorAll('a[href="#"], button').forEach(element => {
    element.addEventListener('click', function(e) {
        if (this.getAttribute('href') === '#' || this.getAttribute('href').includes('trial')) {
            e.preventDefault();
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.opacity = '0.7';
            
            // Simulate loading and show success message
            setTimeout(() => {
                this.textContent = originalText;
                this.style.opacity = '1';
                
                // Show success message
                showNotification('Trial signup coming soon! We\'ll notify you when it\'s available.', 'success');
            }, 1500);
        }
    });
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-sage text-white' : 
        type === 'error' ? 'bg-coral text-white' : 
        'bg-teal text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="mr-4">${message}</span>
            <button class="text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Performance optimization: Lazy load images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if needed
if (document.querySelectorAll('img[data-src]').length > 0) {
    initLazyLoading();
}

// Add parallax effect to hero section
function initParallax() {
    const hero = document.querySelector('.hero-bg');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// Initialize parallax
initParallax();

// Add hover effects to cards
document.querySelectorAll('.card-hover').forEach(card => {
    card.addEventListener('mouseenter', function() {
        anime({
            targets: this,
            scale: 1.02,
            translateY: -8,
            duration: 300,
            easing: 'easeOutCubic'
        });
    });
    
    card.addEventListener('mouseleave', function() {
        anime({
            targets: this,
            scale: 1,
            translateY: 0,
            duration: 300,
            easing: 'easeOutCubic'
        });
    });
});

// Add click effects to buttons
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn-primary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Accessibility utility functions
function initAccessibilityFeatures() {
    // Add skip link functionality
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    
    if (skipLink && mainContent) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.tabIndex = -1;
            mainContent.focus();
            mainContent.addEventListener('blur', () => {
                mainContent.removeAttribute('tabindex');
            }, { once: true });
        });
    }
    
    // Add proper alt text to images that don't have it
    document.querySelectorAll('img:not([alt])').forEach(img => {
        img.setAttribute('alt', 'Decorative image');
    });
    
    // Announce page load to screen readers
    announceToScreenReader(`Page loaded: ${document.title}`);
    
    // Add focus indicators for custom interactive elements
    addFocusIndicators();
    
    // Initialize high contrast mode support
    initHighContrastMode();
    
    // Initialize reduced motion preferences
    initReducedMotionSupport();
}

function initKeyboardNavigation() {
    // Add keyboard support for card interactions
    document.querySelectorAll('.card-hover').forEach(card => {
        // Make cards focusable
        if (!card.hasAttribute('tabindex')) {
            card.setAttribute('tabindex', '0');
        }
        
        // Add keyboard event listeners
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = card.querySelector('a');
                if (link) {
                    link.click();
                }
            }
        });
    });
    
    // Add keyboard navigation for main menu
    const mainMenuItems = document.querySelectorAll('nav [role="menubar"] a');
    mainMenuItems.forEach((item, index) => {
        item.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    const nextItem = mainMenuItems[index + 1] || mainMenuItems[0];
                    nextItem.focus();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    const prevItem = mainMenuItems[index - 1] || mainMenuItems[mainMenuItems.length - 1];
                    prevItem.focus();
                    break;
            }
        });
    });
}

function initFocusManagement() {
    // Track focus for better keyboard navigation
    let lastFocusedElement;
    
    document.addEventListener('focusin', (e) => {
        lastFocusedElement = e.target;
    });
    
    // Return focus when modals or overlays close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            // Trap focus within modal or overlay if present
            const modal = document.querySelector('.modal:not(.hidden)');
            if (modal) {
                trapFocusInModal(modal, e);
            }
        }
    });
}

function trapFocusInModal(modal, e) {
    const focusableElements = modal.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
        }
    } else {
        if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
        }
    }
}

function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

function addFocusIndicators() {
    // Add visible focus indicators for better accessibility
    const style = document.createElement('style');
    style.textContent = `
        .focus-visible,
        *:focus-visible {
            outline: 3px solid #FF7F7F !important;
            outline-offset: 2px !important;
        }
        
        /* Screen reader only content */
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
    `;
    document.head.appendChild(style);
}

function initHighContrastMode() {
    // Detect high contrast mode and adjust accordingly
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    function handleHighContrast(e) {
        if (e.matches) {
            document.body.classList.add('high-contrast-mode');
            announceToScreenReader('High contrast mode enabled');
        } else {
            document.body.classList.remove('high-contrast-mode');
        }
    }
    
    mediaQuery.addListener(handleHighContrast);
    handleHighContrast(mediaQuery);
}

function initReducedMotionSupport() {
    // Detect reduced motion preference and adjust animations
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function handleReducedMotion(e) {
        if (e.matches) {
            document.body.classList.add('reduced-motion');
            // Disable auto-playing carousels
            const carousels = document.querySelectorAll('[data-autoplay]');
            carousels.forEach(carousel => {
                carousel.removeAttribute('data-autoplay');
            });
            announceToScreenReader('Reduced motion mode enabled');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    }
    
    mediaQuery.addListener(handleReducedMotion);
    handleReducedMotion(mediaQuery);
}

// Enhanced notification system with accessibility
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-sage text-white' : 
        type === 'error' ? 'bg-coral text-white' : 
        'bg-teal text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="mr-4">${message}</span>
            <button class="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Close notification" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Focus the notification for screen readers
    notification.focus();
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Console easter egg
console.log(`
🏃‍♀️ Welcome to Zuzu Sport! 🏃‍♂️

We're building something amazing for families.
Transform screen time into healthy movement!

Interested in joining our mission?
Contact us: hello@zuzusport.co.il

Built with ❤️ for healthy, happy families.
Accessibility-first design for everyone!
`);
