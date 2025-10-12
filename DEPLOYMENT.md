# 🚀 Deployment Guide - Zuzu Sport

> Complete guide for deploying the Zuzu Sport landing pages to production

## 🌐 Current Live Sites

- **English Version**: https://zuzu-sport-landing.surge.sh
- **Hebrew Version**: https://zuzu-sport-hebrew.surge.sh

## 📋 Deployment Options

### 1. Surge.sh (Current Method)

#### Prerequisites
```bash
# Install Node.js first: https://nodejs.org
# Then install Surge globally
npm install -g surge
```

#### Deploy English Version
```bash
# Navigate to project root
cd zuzu-sport-landing-page

# Deploy to Surge
surge . zuzu-sport-landing.surge.sh

# Follow prompts:
# - Email: your-email@example.com
# - Password: (create account if needed)
# - Confirm domain: zuzu-sport-landing.surge.sh
```

#### Deploy Hebrew Version
```bash
# Use the pre-built Hebrew deployment directory
cd hebrew-deploy

# Deploy Hebrew version
surge . zuzu-sport-hebrew.surge.sh
```

#### Update Existing Deployment
```bash
# For English updates
surge . zuzu-sport-landing.surge.sh

# For Hebrew updates
cd hebrew-deploy
surge . zuzu-sport-hebrew.surge.sh
```

### 2. Netlify (Alternative)

#### Via Drag & Drop
1. Go to https://app.netlify.com/drop
2. Drag the project folder (or `hebrew-deploy` for Hebrew)
3. Get instant URL
4. Optional: Set custom domain

#### Via GitHub Integration
1. Connect GitHub account to Netlify
2. Select repository: `talagmon/zuzu-sport-landing-page`
3. Configure build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (or `hebrew-deploy` for Hebrew)
4. Deploy automatically on Git commits

### 3. Vercel (Alternative)

#### Via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
vercel

# Follow prompts for setup
```

#### Via GitHub Integration
1. Connect GitHub to Vercel
2. Import repository
3. Configure project settings
4. Auto-deploy on commits

### 4. GitHub Pages (Free Option)

#### Enable GitHub Pages
1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: `main`
5. Folder: `/ (root)`

#### Access URLs
- **Repository Pages**: https://talagmon.github.io/zuzu-sport-landing-page/
- **Hebrew Version**: https://talagmon.github.io/zuzu-sport-landing-page/index-he.html

### 5. AWS S3 + CloudFront (Scalable)

#### Setup S3 Bucket
```bash
# Create S3 bucket (replace with unique name)
aws s3 mb s3://zuzu-sport-landing-unique-name

# Configure for static website
aws s3 website s3://zuzu-sport-landing-unique-name \
  --index-document index.html \
  --error-document error.html

# Upload files
aws s3 sync . s3://zuzu-sport-landing-unique-name \
  --exclude ".git/*" --exclude "node_modules/*"

# Set public read permissions
aws s3api put-bucket-policy \
  --bucket zuzu-sport-landing-unique-name \
  --policy file://bucket-policy.json
```

## 🔄 Continuous Deployment

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Surge

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install Surge
      run: npm install -g surge
      
    - name: Deploy English Version
      run: surge . zuzu-sport-landing.surge.sh
      env:
        SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }}
        SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
        
    - name: Deploy Hebrew Version
      run: |
        cd hebrew-deploy
        surge . zuzu-sport-hebrew.surge.sh
      env:
        SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }}
        SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

#### Setup Secrets
1. Go to repository Settings → Secrets and Variables → Actions
2. Add secrets:
   - `SURGE_LOGIN`: Your Surge email
   - `SURGE_TOKEN`: Get from `surge token` command

### Netlify Auto-Deploy

Netlify automatically deploys when:
- Commits pushed to connected branch
- Pull requests merged
- Manual trigger from dashboard

Configuration in `netlify.toml`:
```toml
[build]
  publish = "."
  command = ""

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/he/*"
  to = "/index-he.html"
  status = 200

[[redirects]]
  from = "/hebrew/*"
  to = "/index-he.html"
  status = 200

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
    
[[headers]]
  for = "/resources/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

## 🔧 Pre-Deployment Checklist

### Before Every Deployment

#### ✅ Content Validation
- [ ] All links work correctly
- [ ] Images load properly
- [ ] Text content is accurate
- [ ] App store links are correct
- [ ] Contact information is up-to-date

#### ✅ Technical Testing
- [ ] HTML validates (use W3C validator)
- [ ] JavaScript console is error-free
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility confirmed
- [ ] Page load speed is acceptable (<3 seconds)

#### ✅ Language-Specific Testing
- [ ] Hebrew text displays correctly (RTL)
- [ ] Hebrew fonts load properly
- [ ] Currency symbols correct (₪ for Hebrew, $ for English)
- [ ] Cultural adaptation appropriate

#### ✅ Legal & Compliance
- [ ] Privacy policy links work
- [ ] Terms of service accessible
- [ ] COPPA compliance pages functional
- [ ] Cookie policy implemented

### Testing Commands

```bash
# HTML Validation (requires html-validator)
npm install -g html-validator-cli
html-validator index.html
html-validator index-he.html

# Link Checking (requires linkinator)
npm install -g linkinator
linkinator .

# Lighthouse Performance Test
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage
```

## 📊 Post-Deployment Verification

### Automated Tests
```bash
# Test English site
curl -I https://zuzu-sport-landing.surge.sh
curl -s https://zuzu-sport-landing.surge.sh | grep -i "zuzu sport"

# Test Hebrew site
curl -I https://zuzu-sport-hebrew.surge.sh
curl -s https://zuzu-sport-hebrew.surge.sh | grep -i "זוזו ספורט"
```

### Manual Verification Checklist
- [ ] Main landing page loads
- [ ] Hebrew version loads with RTL layout
- [ ] Navigation works between sections
- [ ] Interactive features function (calculator, animations)
- [ ] App store buttons work
- [ ] Images display correctly
- [ ] Mobile layout is responsive
- [ ] Legal pages are accessible

### Performance Monitoring
- **PageSpeed Insights**: Test both URLs
- **GTmetrix**: Performance analysis
- **WebPageTest**: Multi-location testing
- **Pingdom**: Uptime monitoring

## 🛠️ Troubleshooting Deployment Issues

### Common Surge.sh Issues

**"You do not have permission to deploy to this domain"**
```bash
# Login to Surge
surge login

# Or use token authentication
export SURGE_TOKEN=your-token-here
surge --token $SURGE_TOKEN
```

**Files not updating**
```bash
# Clear Surge cache
surge teardown zuzu-sport-landing.surge.sh
surge . zuzu-sport-landing.surge.sh
```

**Hebrew characters not displaying**
```bash
# Ensure UTF-8 encoding
file -I index-he.html  # Should show charset=utf-8
```

### Common Netlify Issues

**Build failing**
- Check build logs in Netlify dashboard
- Verify netlify.toml configuration
- Ensure all files are committed to Git

**Redirects not working**
- Check `_redirects` file format
- Verify netlify.toml redirect syntax
- Test with Netlify's redirect playground

### DNS and Custom Domain Issues

**Setting up custom domain on Surge**
```bash
# Add CNAME record pointing to na-west1.surge.sh
# Then deploy with custom domain
surge . your-custom-domain.com
```

**SSL Certificate Issues**
- Surge provides automatic HTTPS
- For custom domains, may need DNS verification
- Check certificate status in domain dashboard

## 🔄 Rollback Procedures

### Surge.sh Rollback
```bash
# Keep previous version in separate directory
cp -r current-version backup-$(date +%Y%m%d)

# Deploy previous version
surge backup-20231012/ zuzu-sport-landing.surge.sh
```

### Git-based Rollback
```bash
# Find commit to rollback to
git log --oneline -10

# Create rollback branch
git checkout -b rollback-to-working-state
git reset --hard <commit-hash>

# Deploy rollback
surge . zuzu-sport-landing.surge.sh
```

## 📈 Performance Optimization

### Before Deployment
```bash
# Optimize images (requires imagemin-cli)
npm install -g imagemin-cli
imagemin resources/*.jpg --out-dir=optimized/
imagemin resources/*.png --out-dir=optimized/

# Minify HTML/CSS (requires html-minifier)
npm install -g html-minifier
html-minifier --collapse-whitespace --remove-comments index.html > index.min.html
```

### CDN and Caching
- Enable compression (gzip/brotli)
- Set proper cache headers
- Use CDN for static assets
- Optimize images for web

## 📞 Support and Maintenance

### Regular Maintenance Tasks
- [ ] Monthly link checking
- [ ] Quarterly performance audits
- [ ] Semi-annual content updates
- [ ] Annual security reviews

### Getting Help
- **Surge Support**: support@surge.sh
- **Netlify Support**: support@netlify.com
- **GitHub Issues**: Repository issues tab
- **Community**: Stack Overflow, Discord channels

### Monitoring and Alerts
Set up monitoring for:
- Site uptime (99.9% target)
- Page load times (<3 seconds)
- Error rates (<0.1%)
- SSL certificate expiration

---

**Happy Deploying! 🚀**

*This deployment guide ensures the Zuzu Sport landing pages are always accessible, performant, and up-to-date for families around the world.*