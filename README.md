# Client Onboarding Form Builder PWA

A fully **offline-first** Progressive Web App for creating and managing client onboarding forms for small businesses and self-employed professionals.

## Features

### ✨ Core Capabilities
- **100% Offline Functionality** - Works completely offline after initial installation
- **Custom Form Builder** - Create unlimited custom forms with drag-and-drop simplicity
- **Digital Signatures** - Clients can sign forms digitally on your device
- **PDF Export** - Generate blank PDFs for printing or filled PDFs with responses
- **Company Branding** - Automatically brand all forms with your business information
- **Local Data Storage** - All data stored securely on your device using IndexedDB
- **Background Sync** - Optional cloud backup when internet is available
- **Analytics Dashboard** - Track form usage and submissions

### 📝 Form Features
- Multiple question types: Short text, Long text, Multiple choice, Checkboxes, Dropdowns, Signatures
- Section organization with descriptions
- Required field validation
- Professional, modern, non-editable layout
- Fully responsive design

### 💾 Data Management
- Export all data as JSON for backup
- Import data from backups
- Export individual responses as PDF
- View submission history
- Search and filter responses

## Installation

### Option 1: Install as PWA (Recommended)

1. Open the app in a modern browser (Chrome, Edge, Safari, Firefox)
2. Look for the "Install" or "Add to Home Screen" prompt
3. Follow the prompts to install
4. Launch from your home screen or app menu

### Option 2: Use in Browser

Simply open `index.html` in any modern web browser. The app will work in the browser, but installing as a PWA provides the best experience.

## Requirements

- Modern web browser with:
  - IndexedDB support
  - Service Worker support (for offline functionality)
  - Canvas support (for signatures)
- No internet required after initial load
- No server or backend required

## How to Use

### First-Time Setup

1. Launch the app
2. Enter your company information (name, email, phone, etc.)
3. Click "Complete Setup & Get Started"

### Creating a Form Template

1. Click "Create New Form" on the dashboard
2. Enter a form name
3. Add sections and questions
4. Choose question types and configure options
5. Mark required fields
6. Save the template

### Filling Out Forms (Client Mode)

1. Select a template from "My Templates"
2. Click "Fill Form"
3. Optionally enter client name
4. Hand device to client or display on screen
5. Client fills out the form
6. Submit and optionally export as PDF

### Exporting PDFs

**Blank Forms (for printing):**
- Go to "My Templates"
- Click "Export PDF" on any template
- Print or save the PDF

**Filled Forms (with client responses):**
- Go to "View Responses"
- Click "Export PDF" on any response
- PDF includes all answers and signatures

## File Structure

```
/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline functionality
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── app.js             # Main application logic
│   ├── db.js              # IndexedDB database manager
│   ├── router.js          # Client-side router
│   ├── formBuilder.js     # Form builder logic
│   ├── pdfGenerator.js    # PDF generation
│   └── signaturePad.js    # Signature pad wrapper
└── icons/
    ├── icon.svg           # Vector icon
    └── icon-*.png         # PNG icons (see below)
```

## Icons

The app includes all required PWA icons:
- Vector icon: `/icons/icon.svg`
- PNG icons: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Regenerating Icons

If you update the SVG icon and need to regenerate PNGs:

```bash
node generate-icons.js
```

This requires Node.js and will automatically install the `sharp` library for high-quality image conversion.

## Offline Functionality

This app is designed to be **100% functional offline**:

1. **First Load**: Requires internet to load external libraries (jsPDF, SignaturePad)
2. **After Installation**: Service Worker caches everything locally
3. **Offline Usage**: All features work without internet
4. **Data Storage**: Everything stored locally in IndexedDB
5. **Background Sync**: When online, can sync to cloud (optional feature for future)

### What's Cached Offline:
- All HTML, CSS, JavaScript
- External libraries (jsPDF, Signature Pad)
- Icons and images
- All your templates and responses (in IndexedDB)

## Browser Support

### Fully Supported:
- Chrome/Edge 67+
- Safari 11.1+
- Firefox 44+
- Samsung Internet 8.2+

### Features by Browser:
| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| PWA Install | ✅ | ✅ | ✅ | ✅ |
| Offline Mode | ✅ | ✅ | ✅ | ✅ |
| IndexedDB | ✅ | ✅ | ✅ | ✅ |
| Signatures | ✅ | ✅ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ | ✅ |

## Data Privacy & Security

- **100% Local**: All data stored on your device
- **No Cloud**: No data sent to external servers
- **No Tracking**: No analytics or tracking scripts
- **No Accounts**: No login required
- **Full Control**: You own all your data

### Backing Up Your Data

1. Go to "View Responses"
2. Click "Export All Data"
3. Save the JSON file somewhere safe
4. To restore: Import the JSON file

## Development

### Local Development

1. Clone or download this repository
2. Serve the files using any static file server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (with http-server)
   npx http-server

   # PHP
   php -S localhost:8000
   ```
3. Open http://localhost:8000 in your browser

### Customization

**Colors:**
Edit CSS variables in `/css/styles.css`:
```css
:root {
  --primary-color: #3f51b5;
  --accent-color: #4caf50;
  /* etc. */
}
```

**Branding:**
Users set their own branding on first launch.

**Form Templates:**
Each user creates their own templates via the form builder.

## Troubleshooting

### PWA Won't Install
- Make sure you're using HTTPS (or localhost)
- Check that service worker is registered (Dev Tools > Application > Service Workers)
- Try a different browser

### Data Not Persisting
- Check browser storage settings
- Ensure cookies/storage aren't being cleared automatically
- Check available storage space

### Signatures Not Working
- Ensure JavaScript is enabled
- Try a different touch/mouse input
- Check console for errors

### PDF Export Issues
- Check if jsPDF library loaded (check console)
- Try refreshing the page
- Export data and reimport if needed

## Future Enhancements

Planned features (not yet implemented):
- [ ] Cloud backup integration (Google Drive, Dropbox)
- [ ] Photo upload in forms
- [ ] Conditional questions (show/hide based on answers)
- [ ] Form templates marketplace
- [ ] Fillable PDF forms (editable in PDF readers)
- [ ] Multi-language support
- [ ] Email responses directly from app
- [ ] QR code generation for forms

## Credits

Built with:
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Signature Pad](https://github.com/szimek/signature_pad) - Digital signatures
- Vanilla JavaScript - No frameworks required!

## License

Free to use for personal and commercial projects.

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review browser console for errors
- Ensure you're using a modern, supported browser

---

**Made for small businesses and self-employed professionals who need simple, offline-first client onboarding forms.**
