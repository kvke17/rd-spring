import fs from 'fs';
import sharp from 'sharp';

const masterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141417"/>
      <stop offset="100%" stop-color="#050506"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3f3f46"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="coilRed" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3344"/>
      <stop offset="35%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#71717a"/>
      <stop offset="50%" stop-color="#e4e4e7"/>
      <stop offset="100%" stop-color="#52525b"/>
    </linearGradient>
  </defs>

  <!-- Dark Metallic Background with subtle border -->
  <rect width="64" height="64" rx="14" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="2"/>

  <!-- Subtle ambient red glow behind coil -->
  <circle cx="48" cy="32" r="14" fill="#b3131b" opacity="0.22"/>

  <!-- RD Bold Lettering -->
  <text x="23.5" y="42.5" fill="#ffffff" font-size="29" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-1.5">RD</text>

  <!-- Coilover Suspension Strut Assembly -->
  <g id="coilover">
    <!-- Top Strut Mount / Spring Perch -->
    <rect x="42.5" y="13" width="13" height="3" rx="1.5" fill="#71717a"/>
    <!-- Central Piston Shaft -->
    <line x1="49" y1="14" x2="49" y2="50" stroke="url(#metalChrome)" stroke-width="2.6" stroke-linecap="round"/>
    <!-- Racing Crimson Suspension Spring Coils -->
    <path d="M 43 18 L 55 23 L 43 28 L 55 33 L 43 38 L 55 43 L 44 47" 
          fill="none" stroke="url(#coilRed)" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Lower Lock Ring / Height Adjuster Perch -->
    <rect x="43.5" y="48" width="11" height="2.5" rx="1" fill="#71717a"/>
  </g>
</svg>`;

async function main() {
  const svgBuffer = Buffer.from(masterSvg);

  // 1. Write SVG favicon
  fs.writeFileSync('public/favicon.svg', masterSvg);
  console.log('✓ Created public/favicon.svg');

  // 2. High-res PWA icon 512x512
  await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png');
  console.log('✓ Created public/icon-512.png');

  // 3. PWA icon 192x192
  await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png');
  console.log('✓ Created public/icon-192.png');

  // 4. Apple Touch Icon 180x180
  await sharp(svgBuffer).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  console.log('✓ Created public/apple-touch-icon.png');

  // 5. Standard 32x32 PNG icon
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync('public/favicon-32x32.png', png32);
  console.log('✓ Created public/favicon-32x32.png');

  // 6. Standard 16x16 PNG icon
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync('public/favicon-16x16.png', png16);
  console.log('✓ Created public/favicon-16x16.png');

  // 7. Generate true ICO file with 16x16, 32x32 and 48x48 directories
  // Simple valid ICO header and BMP/PNG structure for 32x32:
  // Many modern browsers accept a 32x32 PNG wrapped or renamed to favicon.ico,
  // or a proper ICO container. Let's create a standard ICO header containing the 32x32 PNG!
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // ICO image type (1 = icon)
  icoHeader.writeUInt16LE(1, 4); // Number of images (1)

  const icoDirEntry = Buffer.alloc(16);
  icoDirEntry.writeUInt8(32, 0); // width
  icoDirEntry.writeUInt8(32, 1); // height
  icoDirEntry.writeUInt8(0, 2);  // palette colors
  icoDirEntry.writeUInt8(0, 3);  // reserved
  icoDirEntry.writeUInt16LE(1, 4); // color planes
  icoDirEntry.writeUInt16LE(32, 6); // bits per pixel
  icoDirEntry.writeUInt32LE(png32.length, 8); // image size in bytes
  icoDirEntry.writeUInt32LE(22, 12); // offset of image data (6 + 16 = 22)

  const icoBuffer = Buffer.concat([icoHeader, icoDirEntry, png32]);
  fs.writeFileSync('app/favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log('✓ Created app/favicon.ico and public/favicon.ico');
}

main().catch(console.error);
