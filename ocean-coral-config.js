// Ocean-Coral Color Palette Configuration
// Use this configuration across all pages for consistency

const oceanCoralConfig = {
    // Tailwind color configuration
    tailwindColors: {
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
    },

    // CSS styles for consistency
    bodyBackground: '#F8FCFF', // ocean-cream
    
    heroGradient: `linear-gradient(135deg, 
        #F8FCFF 0%,     /* ocean-cream */
        #CAF0F8 25%,    /* ocean-pale */
        #90E0EF 50%,    /* ocean-light */
        #00B4D8 75%,    /* ocean-bright */
        #F5B7B1 100%    /* coral-soft accent */
    )`,

    buttonGradient: `linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)`, // ocean-bright to ocean-deep
    buttonHoverGradient: `linear-gradient(135deg, #48B2D8 0%, #90E0EF 100%)`, // lighter ocean gradient
    
    progressBarGradient: `linear-gradient(90deg, #90E0EF 0%, #00B4D8 50%, #F5B7B1 100%)`, // ocean-light to ocean-bright to coral-soft
    
    typewriterCursor: '#374151', // gray-700 cursor to match dark text
    
    ctaBackground: '#CAF0F8', // ocean-pale
    footerBackground: '#CAF0F8', // ocean-pale
    
    // Color replacements map
    colorReplacements: {
        // Replace sage with ocean-light
        'bg-sage': 'bg-ocean-light',
        'text-sage': 'text-ocean-light',
        'border-sage': 'border-ocean-light',
        'bg-sage/10': 'bg-ocean-light/10',
        'bg-sage/20': 'bg-ocean-light/20',
        'text-gray-600': 'text-gray-600', // keep as is for readability
        'focus:ring-sage': 'focus:ring-ocean-light',
        
        // CTA and footer backgrounds
        'bg-teal': 'style="background-color: #CAF0F8;"',
        'text-white': 'text-gray-800' // when on light backgrounds
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = oceanCoralConfig;
}