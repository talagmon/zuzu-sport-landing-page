# 🏃‍♀️ Zuzu Sport - Landing Page

> Transform screen time into healthy movement for kids aged 6-14

[![Live Demo](https://img.shields.io/badge/Live%20Demo-English-brightgreen)](https://zuzu-sport-landing.surge.sh)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Hebrew-blue)](https://zuzu-sport-hebrew.surge.sh)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🎯 Overview

Zuzu Sport is a comprehensive fitness app designed to help parents transform their children's screen time into healthy, engaging physical activities. Our landing page showcases interactive features, expert-designed workouts, and family testimonials in both English and Hebrew.

### ✨ Key Features

- 🌍 **Bilingual Support**: Complete English and Hebrew (RTL) versions
- 📱 **Mobile Responsive**: Optimized for all devices
- 🎮 **Interactive Elements**: Savings calculator, progress tracking, testimonials
- 🎨 **Modern Design**: Animated backgrounds, smooth transitions
- 🔒 **COPPA Compliant**: Child safety and privacy protection
- ⚡ **Fast Loading**: Optimized for performance

## 🚀 Live Versions

- **English**: https://zuzu-sport-landing.surge.sh
- **Hebrew**: https://zuzu-sport-hebrew.surge.sh

## ⚡ Quick Start

### Prerequisites

- Git installed on your system
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code recommended)
- Node.js (for deployment tools)

### 1. Clone the Repository

```bash
git clone https://github.com/talagmon/zuzu-sport-landing-page.git
cd zuzu-sport-landing-page
```

### 2. Local Development

#### Option A: Live Server (VS Code)
1. Install VS Code: https://code.visualstudio.com/
2. Install "Live Server" extension
3. Right-click `index.html` → "Open with Live Server"

#### Option B: Simple HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx serve .
```

#### Option C: Direct File Opening
Simply open `index.html` or `index-he.html` in your browser

### 3. View Different Versions

- **English Landing**: Open `index.html`
- **Hebrew Landing**: Open `index-he.html`
- **Hebrew Presentation**: Open `presentation-he.html`

## 🌍 Language Support

### English Version
- **File**: `index.html`
- **Features**: Complete landing page with all sections
- **Target**: Global English-speaking market

### Hebrew Version (עברית)
- **File**: `index-he.html`, `presentation-he.html`
- **Features**: Full RTL support, Hebrew typography, Israeli pricing
- **Target**: Israeli market
- **Special**: Right-to-left layout, Hebrew fonts, cultural adaptation

## 🎨 Interactive Features

### Savings Calculator
- Real-time cost comparison
- Activity cost database
- Israeli shekel (₪) and USD ($) support

### Progress Tracking
- Animated progress bars
- Achievement system
- Parent dashboard mockup

### Testimonials
- Real parent reviews
- Star rating system
- Location-based testimonials

### Animations
- Particle background effects
- Scroll-triggered reveals
- Typewriter effects
- Hover animations

## 🛠️ Tech Stack

- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Flexbox, Grid, animations, responsive design
- **JavaScript (ES6+)**: Interactive features, animations
- **Libraries**:
  - Tailwind CSS: Utility-first styling
  - Anime.js: Smooth animations
  - Typed.js: Typewriter effects
  - P5.js: Particle animations
- **Deployment**: Surge.sh, CDN optimization
- **Version Control**: Git, GitHub

## 📁 Project Structure

```
zuzu-sport-landing-page/
├── 🏠 Landing Pages
│   ├── index.html              # English main landing page
│   ├── index-he.html          # Hebrew main landing page
│   └── presentation-he.html   # Hebrew presentation version
├── 📄 Legal & Compliance
│   ├── privacy-policy.html    # English privacy policy
│   ├── privacy-policy-he.html # Hebrew privacy policy
│   ├── terms.html             # English terms of service
│   ├── terms-he.html          # Hebrew terms of service
│   ├── cookie-policy.html     # English cookie policy
│   ├── cookie-policy-he.html  # Hebrew cookie policy
│   ├── coppa-compliance.html  # English COPPA compliance
│   └── coppa-compliance-he.html # Hebrew COPPA compliance
├── 🛡️ Safety & Guidelines
│   ├── safety.html            # English safety guidelines
│   ├── safety-he.html         # Hebrew safety guidelines
│   └── progress-he.html       # Hebrew progress tracking
├── 🎨 Assets & Resources
│   ├── resources/             # Images, screenshots, testimonials
│   ├── main.js               # Interactive features & animations
│   └── hebrew-deploy/        # Production deployment files
└── 📚 Documentation
    ├── README.md             # This file
    ├── QUICK_START.md        # Quick setup guide
    ├── DEPLOYMENT.md         # Deployment instructions
    └── IMPLEMENTATION_SUMMARY.md # Technical implementation details
```

## 📱 Mobile Responsiveness

- **Breakpoints**: 
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
- **Features**:
  - Touch-friendly buttons
  - Optimized images
  - Readable typography
  - Intuitive navigation

## 🔐 Privacy & Compliance

### COPPA Compliance
- Child data protection
- Parental consent mechanisms
- Age-appropriate content
- Safe interaction guidelines

### Privacy Features
- Clear privacy policies (English & Hebrew)
- Cookie consent management
- Data collection transparency
- Third-party service disclosure

## 🚀 Deployment

### Surge.sh (Current)
```bash
# Deploy English version
surge . zuzu-sport-landing.surge.sh

# Deploy Hebrew version
cd hebrew-deploy
surge . zuzu-sport-hebrew.surge.sh
```

### Other Deployment Options
- **Netlify**: Drag and drop or Git integration
- **Vercel**: Zero-config deployment
- **GitHub Pages**: Free hosting for static sites
- **AWS S3**: Scalable cloud hosting

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### For Developers
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### For Translators
- Hebrew translations: Review and improve existing Hebrew content
- Additional languages: Create new language versions
- Cultural adaptation: Ensure content is culturally appropriate

### For Designers
- UI/UX improvements
- Mobile responsiveness enhancements
- Accessibility improvements
- Visual design refinements

## 🆘 Troubleshooting

### Common Issues

**Images not loading:**
- Check file paths in resources/ directory
- Verify image formats (JPG, PNG, WebP)

**Hebrew text not displaying correctly:**
- Ensure browser supports Hebrew fonts
- Check RTL CSS properties
- Verify UTF-8 encoding

**Interactive features not working:**
- Check JavaScript console for errors
- Verify all script libraries are loaded
- Test in different browsers

### Getting Help
- 📧 Email: [Contact Information]
- 🐛 Issues: [GitHub Issues](https://github.com/talagmon/zuzu-sport-landing-page/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/talagmon/zuzu-sport-landing-page/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern fitness app landing pages
- **Hebrew Translation**: Native Hebrew speakers
- **Photography**: Stock photos from Unsplash, Pexels
- **Icons**: FontAwesome, Heroicons
- **Testing**: Community feedback and user testing

---

## 📞 Contact

**Project Maintainer**: Tal Agmon  
**Repository**: https://github.com/talagmon/zuzu-sport-landing-page  
**Live Sites**: 
- English: https://zuzu-sport-landing.surge.sh
- Hebrew: https://zuzu-sport-hebrew.surge.sh

---

*Made with ❤️ for healthy, active families around the world*
