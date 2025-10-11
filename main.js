// Main JavaScript for Zuzu Sport Landing Page
// Handles all interactive components and animations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initTypewriter();
    initScrollAnimations();
    initMobileMenu();
    initTestimonialCarousel();
    initBenefitCalculator();
    initParticleBackground();
    initProgressAnimations();
});

// Typewriter effect for hero headline
function initTypewriter() {
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
            // Remove cursor when done
            setTimeout(() => {
                document.querySelector('.typed-cursor').style.display = 'none';
            }, 1000);
        }
    });
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

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
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

// Console easter egg
console.log(`
🏃‍♀️ Welcome to Zuzu Sport! 🏃‍♂️

We're building something amazing for families.
Transform screen time into healthy movement!

Interested in joining our mission?
Contact us: hello@zuzusport.co.il

Built with ❤️ for healthy, happy families.
`);