const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/ver_repuestos_button';
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

    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Take screenshot of hero buttons
    await page.screenshot({ path: path.join(outDir, '01_hero_ver_repuestos_button.png') });

    const btnText = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const repuestoLink = links.find((l) => l.href.includes('/repuestos') && l.innerText.toUpperCase().includes('REPUESTOS'));
      return repuestoLink ? { text: repuestoLink.innerText.trim(), href: repuestoLink.href } : null;
    });

    console.log('Found button:', btnText);

    if (btnText) {
      console.log('Clicking "VER REPUESTOS" button...');
      await page.click('a[href="/repuestos"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`Landed on URL: ${page.url()}`);
      await page.screenshot({ path: path.join(outDir, '02_repuestos_catalog_landing.png') });
    }

    console.log('Test completed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
