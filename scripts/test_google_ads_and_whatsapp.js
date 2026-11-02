const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/whatsapp_google_ads';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('1. Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify Google Ads in window.dataLayer
    const dataLayer = await page.evaluate(() => window.dataLayer || []);
    console.log('DataLayer entries:', JSON.stringify(dataLayer, null, 2));

    const hasGoogleAds = dataLayer.some((entry) => {
      if (Array.isArray(entry)) {
        return entry.includes('AW-18395317504') || entry.includes('config');
      }
      return typeof entry === 'object' && JSON.stringify(entry).includes('AW-18395317504');
    });
    console.log(`[Google Ads Verification] Contains AW-18395317504 in dataLayer? ${hasGoogleAds} (Expected: true)`);

    // Verify WhatsApp button presence and styles
    const whatsappInfo = await page.evaluate(() => {
      const btn = document.querySelector('aside[aria-label="Contacto directo por WhatsApp"]');
      const link = btn ? btn.querySelector('a') : null;
      if (!btn || !link) return null;

      const btnComputed = window.getComputedStyle(btn);
      return {
        position: btnComputed.position,
        zIndex: btnComputed.zIndex,
        bottom: btnComputed.bottom,
        right: btnComputed.right,
        href: link.getAttribute('href'),
        target: link.getAttribute('target'),
        rel: link.getAttribute('rel'),
        ariaLabel: link.getAttribute('aria-label'),
      };
    });

    console.log('WhatsApp button info:', whatsappInfo);
    console.log(`[WhatsApp Verification] Position is fixed? ${whatsappInfo?.position === 'fixed'}`);
    console.log(`[WhatsApp Verification] Z-Index is 9999? ${whatsappInfo?.zIndex === '9999'}`);
    console.log(`[WhatsApp Verification] Href contains wa.me? ${whatsappInfo?.href?.includes('https://wa.me/')}`);

    // Take screenshot of landing page with WhatsApp button
    await page.screenshot({ path: path.join(outDir, '01_landing_whatsapp_button.png') });

    // Test hover on WhatsApp button to trigger tooltip
    const waLink = await page.$('aside[aria-label="Contacto directo por WhatsApp"] a');
    if (waLink) {
      await waLink.hover();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outDir, '02_whatsapp_tooltip_hover.png') });
    }

    // Scroll down on landing page to confirm it remains fixed
    await page.evaluate(() => window.scrollTo(0, 1200));
    await new Promise((r) => setTimeout(r, 500));
    await page.screenshot({ path: path.join(outDir, '03_landing_scrolled_whatsapp_fixed.png') });

    // Test on /catalogo
    console.log('\n2. Testing on http://localhost:3000/catalogo ...');
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '04_catalogo_whatsapp_button.png') });

    // Test on /repuestos
    console.log('\n3. Testing on http://localhost:3000/repuestos ...');
    await page.goto('http://localhost:3000/repuestos', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '05_repuestos_whatsapp_button.png') });

    console.log('\nAll tests completed successfully!');
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
}

run();
