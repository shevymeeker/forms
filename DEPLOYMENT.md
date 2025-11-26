# Deployment Guide

## 🚀 Quick Deploy

This is a **100% static web app** with no backend requirements. You can deploy it anywhere that serves static files!

### Deployment Options

#### 1. **GitHub Pages** (Recommended for free hosting)

```bash
# Already configured! Just push to main branch
git add .
git commit -m "Ready for deployment"
git push origin main
```

Then enable GitHub Pages in your repository settings:
- Go to Settings → Pages
- Source: Deploy from branch
- Branch: `main` / `root`
- Your app will be live at: `https://yourusername.github.io/repository-name/`

#### 2. **Netlify** (Drag & Drop)

1. Go to [netlify.com](https://netlify.com)
2. Drag the entire project folder to "Sites"
3. Done! Your site is live instantly

The `_headers` file is included for automatic security headers.

#### 3. **Vercel**

```bash
npm install -g vercel
vercel
```

Follow the prompts. Done in 30 seconds!

#### 4. **Cloudflare Pages**

1. Push to GitHub
2. Connect your repo in Cloudflare Pages dashboard
3. Build settings: None needed (it's static!)
4. Deploy

#### 5. **Your Own Server** (Apache/Nginx)

Simply copy all files to your web server:

```bash
# Upload via FTP/SFTP or rsync
rsync -avz ./ user@yourserver:/var/www/html/formbuilder/
```

**Apache (.htaccess):**
```apache
# Add to .htaccess for security headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
```

**Nginx:**
```nginx
# Add to nginx config
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

---

## 📋 Pre-Deployment Checklist

- ✅ **Icons Generated**: All PWA icons (72px-512px) created
- ✅ **Service Worker**: Configured for offline support
- ✅ **Manifest**: PWA manifest.json with relative paths
- ✅ **Security Headers**: _headers file for Netlify/Cloudflare
- ✅ **No Build Required**: Pure vanilla JavaScript
- ✅ **HTTPS**: Required for PWA features (auto on all hosting platforms)

---

## 🔧 Configuration

### Custom Domain

After deploying, configure your custom domain in your hosting platform:

- **GitHub Pages**: Settings → Pages → Custom domain
- **Netlify**: Site settings → Domain management
- **Vercel**: Project settings → Domains
- **Cloudflare**: Automatic with your zone

### Environment Considerations

**No environment variables needed!** Everything runs client-side.

However, users can configure:
- Company branding (in-app setup)
- OAuth for cloud backup (users use their own apps)
- All data stays on user's device

---

## 🌐 Browser Requirements

### Fully Supported

- **Chrome/Edge**: 67+
- **Firefox**: 44+
- **Safari**: 11.1+
- **Samsung Internet**: 8.2+

### Required Features

- ✅ IndexedDB
- ✅ Service Workers
- ✅ Canvas (for signatures)
- ✅ ES6+ JavaScript

All modern browsers support these!

---

## 📱 PWA Installation

Once deployed with HTTPS, users can install as a PWA:

### Desktop (Chrome/Edge)
- Click the install icon in the address bar
- Or: Menu → Install app

### Mobile (iOS Safari)
- Tap Share → Add to Home Screen

### Mobile (Android Chrome)
- Tap Menu → Install app
- Or use the automatic prompt

---

## 🔒 Security Features

### Headers Configured

The `_headers` file includes:
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **CSP**: Content Security Policy for XSS protection
- **Referrer-Policy**: Privacy protection

### Privacy-First Design

- ✅ **No backend**: No data leaves the device
- ✅ **No analytics**: No tracking whatsoever
- ✅ **No accounts**: No authentication required
- ✅ **Local storage**: IndexedDB only
- ✅ **Optional cloud**: User controls backup

---

## 🐛 Troubleshooting

### PWA Won't Install

- ✅ **Check HTTPS**: PWAs require secure connections
- ✅ **Check manifest**: Validate at `https://your-domain/manifest.json`
- ✅ **Check service worker**: Look for errors in DevTools → Application → Service Workers
- ✅ **Clear cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Service Worker Not Updating

```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
location.reload();
```

### Icons Not Showing

- Check that all icon files exist in `/icons/` folder
- Verify paths in `manifest.json` are correct
- Clear browser cache and reinstall PWA

### Forms Not Saving

- Check IndexedDB is enabled in browser
- Check available storage: Chrome DevTools → Application → Storage
- Check for quota errors in console

---

## 📊 Performance

### Initial Load

- **First Load**: ~500KB (including libraries from CDN)
- **Cached**: ~50KB (service worker cached assets)
- **Offline**: Fully functional

### Lighthouse Scores (Target)

- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: 100

Run audit: Chrome DevTools → Lighthouse

---

## 🔄 Updates & Maintenance

### Deploying Updates

1. Make changes to files
2. Update version in `sw.js` (CACHE_NAME)
3. Push to hosting platform
4. Users will auto-update on next visit

### Service Worker Versioning

```javascript
// In sw.js - increment version after changes
const CACHE_NAME = 'form-builder-v6'; // increment this!
```

### Force Update

If users have issues after update:
```javascript
// Add to index.html temporarily
navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));
```

---

## 📦 What's Included

```
/
├── index.html              # Main app entry
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── _headers                # Security headers (Netlify/Cloudflare)
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application
│   ├── db.js               # IndexedDB manager
│   ├── router.js           # Client-side routing
│   ├── formBuilder.js      # Form builder logic
│   ├── pdfGenerator.js     # PDF export
│   ├── signaturePad.js     # Signature capture
│   ├── cloudBackup.js      # Cloud backup (optional)
│   └── sampleTemplates.js  # Starter templates
└── icons/
    ├── icon.svg            # Vector icon
    └── icon-*.png          # PWA icons (72-512px)
```

---

## 🎯 Post-Deployment

### Test Everything

1. **Visit your live URL**
2. **Test offline**: DevTools → Network → Offline
3. **Create a form**: Test form builder
4. **Fill a form**: Test client form filling
5. **Generate PDF**: Test PDF export
6. **Install PWA**: Test installation on desktop & mobile

### Share with Users

Your app is now live! Share the URL with your users. They can:

- Use it immediately in browser
- Install as PWA for offline access
- No signup or login required
- Data stays on their device

---

## 💡 Tips

### SEO Optimization

Add to `index.html` if you want better SEO:
```html
<meta property="og:title" content="Client Onboarding Form Builder">
<meta property="og:description" content="Free, offline-first form builder">
<meta property="og:image" content="./icons/icon-512x512.png">
```

### Analytics (Optional)

If you want usage analytics, add Google Analytics:
```html
<!-- Add before </head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR-ID"></script>
```

**But remember**: This app is privacy-first. Consider if you really need analytics!

### Custom Branding

Edit these files for your branding:
- `manifest.json` → name, colors
- `css/styles.css` → :root color variables
- `icons/icon.svg` → replace with your logo

Then regenerate icons:
```bash
node generate-icons.js
```

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Test in incognito/private mode
4. Check that HTTPS is enabled
5. Clear cache and hard refresh

---

## ✅ You're Done!

Your Client Onboarding Form Builder is now live and ready for users! 🎉

No servers to maintain, no databases to manage, no monthly fees. Just a fast, offline-capable web app that respects user privacy.

**Enjoy!** 🚀
