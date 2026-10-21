const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/catalogo';
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

    // 1. Desktop Initial View (1440x900)
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, '01_desktop_catalogo_initial.png') });
    console.log('[OK] Saved 01_desktop_catalogo_initial.png');

    // 2. Desktop with Filter and Search applied
    const searchInput = await page.$('input[placeholder*="Buscar"]');
    if (searchInput) {
      await searchInput.type('5W-30');
      await new Promise((r) => setTimeout(r, 600));
    }
    await page.screenshot({ path: path.join(outDir, '02_desktop_search_5w30.png') });
    console.log('[OK] Saved 02_desktop_search_5w30.png');

    // 3. Mobile View (375x812)
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await mobilePage.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    await mobilePage.screenshot({ path: path.join(outDir, '03_mobile_catalogo_initial.png') });
    console.log('[OK] Saved 03_mobile_catalogo_initial.png');

    // 4. Mobile Drawer Open
    const filterBtn = await mobilePage.$('button:has-text("Filtros y Búsqueda"), button:has-text("Filtros")');
    if (filterBtn) {
      await filterBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await mobilePage.screenshot({ path: path.join(outDir, '04_mobile_drawer_open.png') });
      console.log('[OK] Saved 04_mobile_drawer_open.png');
    }
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

run();
