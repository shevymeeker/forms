#!/usr/bin/env node

/**
 * Generate PNG icons from SVG for PWA
 * Uses sharp library for high-quality image conversion
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not found. Installing...');
  require('child_process').execSync('npm install sharp --no-save', { stdio: 'inherit' });
  sharp = require('sharp');
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, 'icons', 'icon.svg');
const outputDir = path.join(__dirname, 'icons');

async function generateIcons() {
  console.log('Generating PNG icons from SVG...\n');

  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
