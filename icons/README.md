# PWA Icons

This directory contains the app icon in SVG format. For full PWA functionality across all devices, you should also generate PNG icons in various sizes.

## Current Status

✅ **icon.svg** - Vector icon (works in modern browsers)
⚠️ **PNG icons** - Not yet generated (optional but recommended)

## The App Will Work Without PNG Icons

Modern browsers support the SVG icon, so the PWA will function correctly. PNG icons are just nice to have for:
- Older devices
- Better compatibility
- App launcher icons on some platforms

## How to Generate PNG Icons

You need these sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Option 1: Online Tool (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload `icon.svg`
3. Generate all sizes
4. Download and extract to this directory

### Option 2: ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd icons
for size in 72 96 128 144 152 192 384 512; do
  convert -background none -resize ${size}x${size} icon.svg icon-${size}x${size}.png
done
```

### Option 3: Use Any Image Editor

Open `icon.svg` in:
- Inkscape (free)
- Adobe Illustrator
- Figma
- Affinity Designer

Export as PNG at each required size.

## Required File Names

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Customizing the Icon

Feel free to replace `icon.svg` with your own design! Just make sure to:
1. Keep the same file name
2. Use SVG format
3. Regenerate the PNG files
4. Recommended size: 512x512px artboard

## Testing

After adding PNG icons:
1. Clear your browser cache
2. Uninstall the PWA (if already installed)
3. Reinstall the PWA
4. Check the app icon on your device

---

**Note:** The current SVG icon is a placeholder. You can replace it with your company logo or custom design.
