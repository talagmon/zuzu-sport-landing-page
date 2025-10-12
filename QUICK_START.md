# ⚡ Quick Start Guide - Zuzu Sport

> Get up and running with the Zuzu Sport landing page project in 5 minutes!

## 🎯 For Complete Beginners

### Windows Users
1. **Download Git for Windows**: https://git-scm.com/download/win
2. **Run the installer** (use all default settings)
3. **Open Git Bash** (search "Git Bash" in Start menu)
4. **Clone the repository**:
   ```bash
   git clone https://github.com/talagmon/zuzu-sport-landing-page.git
   cd zuzu-sport-landing-page
   ```
5. **Open the project**: Double-click `index.html` to view in browser

### Mac/Linux Users
1. **Open Terminal** (Applications → Utilities → Terminal)
2. **Clone the repository**:
   ```bash
   git clone https://github.com/talagmon/zuzu-sport-landing-page.git
   cd zuzu-sport-landing-page
   ```
3. **Open the project**: Double-click `index.html` to view in browser

## 🚀 For Developers

### Prerequisites Check
```bash
# Check if you have these installed
git --version
node --version  # Optional but recommended
python --version  # Alternative for local server
```

### Setup Development Environment
```bash
# 1. Clone and enter project
git clone https://github.com/talagmon/zuzu-sport-landing-page.git
cd zuzu-sport-landing-page

# 2. View project structure
ls -la

# 3. Start local development server (choose one):

# Option A: Python 3
python -m http.server 8000

# Option B: Python 2
python -m SimpleHTTPServer 8000

# Option C: Node.js (if installed)
npx serve . -p 8000

# Option D: PHP (if installed)
php -S localhost:8000
```

### View the Sites
- **Local English**: http://localhost:8000/index.html
- **Local Hebrew**: http://localhost:8000/index-he.html
- **Local Hebrew Presentation**: http://localhost:8000/presentation-he.html

## 📝 File Overview

### 🏠 Main Landing Pages
- `index.html` - English version (primary)
- `index-he.html` - Hebrew version with RTL support
- `presentation-he.html` - Hebrew presentation format

### 📄 Legal Pages (English & Hebrew versions)
- `privacy-policy*.html` - Privacy policies
- `terms*.html` - Terms of service
- `cookie-policy*.html` - Cookie policies
- `coppa-compliance*.html` - Child protection compliance

### 🎨 Assets & Code
- `main.js` - All interactive JavaScript
- `resources/` - Images, screenshots, testimonials
- `hebrew-deploy/` - Production deployment files

## 🛠️ Development Tasks

### Making Changes
1. **Edit HTML files** with any text editor (VS Code recommended)
2. **Refresh browser** to see changes
3. **Test in multiple browsers** (Chrome, Firefox, Safari, Edge)
4. **Test mobile view** (browser dev tools or real device)

### Testing Different Languages
```bash
# View English version
open index.html  # Mac
start index.html  # Windows

# View Hebrew version
open index-he.html  # Mac
start index-he.html  # Windows
```

### Common Development Commands
```bash
# Check git status
git status

# See recent changes
git log --oneline -10

# Create a new feature branch
git checkout -b feature/my-new-feature

# Stage and commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push origin feature/my-new-feature
```

## 🎨 VS Code Setup (Recommended)

### 1. Install VS Code
Download from: https://code.visualstudio.com/

### 2. Recommended Extensions
- **Live Server** - Instant preview with auto-refresh
- **HTML CSS Support** - Better HTML/CSS editing
- **Prettier** - Code formatting
- **GitLens** - Enhanced Git features
- **Hebrew Language Pack** - Hebrew text support

### 3. Open Project in VS Code
```bash
# From terminal
code .

# Or drag the project folder into VS Code
```

### 4. Use Live Server
1. Right-click on `index.html`
2. Select "Open with Live Server"
3. Browser opens automatically with live reload

## 📱 Mobile Testing

### Browser Dev Tools
1. Open browser developer tools (F12)
2. Click device/mobile icon
3. Test different screen sizes:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)

### Real Device Testing
1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start local server on port 8000
3. On mobile device, visit: `http://YOUR_IP:8000/index.html`

## 🌍 Working with Hebrew Content

### Important Notes
- Hebrew files use RTL (right-to-left) layout
- Text direction is handled automatically
- Test Hebrew fonts in different browsers
- Ensure proper UTF-8 encoding

### Files to Edit for Hebrew
- `index-he.html` - Main Hebrew landing page
- `presentation-he.html` - Hebrew presentation
- `*-he.html` - All Hebrew legal/policy pages

## 🐛 Troubleshooting

### Common Issues

**Nothing loads when opening HTML file:**
- Try using a local server instead of file:// protocol
- Check browser console for errors (F12)

**Images not showing:**
- Verify files exist in `resources/` folder
- Check file paths are correct (case-sensitive)

**Hebrew text looks wrong:**
- Check browser supports Hebrew fonts
- Verify file is saved as UTF-8
- Test in different browsers

**JavaScript not working:**
- Check browser console for errors
- Ensure all script files are loaded
- Try in different browsers

### Getting Help
1. **Check the console**: Press F12 in browser, look for errors
2. **Try different browsers**: Chrome, Firefox, Safari, Edge
3. **Ask for help**: Create an issue on GitHub
4. **Look at working examples**: Compare with live sites

## ✅ Quick Checklist

### Before Starting Development
- [ ] Git installed and working
- [ ] Project cloned successfully
- [ ] Can view both English and Hebrew versions
- [ ] Text editor/IDE set up (VS Code recommended)
- [ ] Local server running (if needed)

### Before Submitting Changes
- [ ] Tested in multiple browsers
- [ ] Checked mobile responsiveness
- [ ] Hebrew text displays correctly (if applicable)
- [ ] No JavaScript console errors
- [ ] Images and links work correctly
- [ ] Code is properly formatted

## 🎉 You're Ready!

Now you can:
- View and edit the landing pages
- Test changes locally
- Submit improvements via GitHub
- Help with translations
- Report bugs or suggest features

**Next Steps:**
- Read the full [README.md](README.md) for complete documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for publishing changes
- Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for technical details

Happy coding! 🚀