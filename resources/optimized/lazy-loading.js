
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
    rootMargin: '50px',
    threshold: 0.1
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
</script>