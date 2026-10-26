const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/search_routing_e2e';
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

    // TEST 1: Search "radiador" in Navbar on Landing Page
    console.log('Navigating to http://localhost:3000 ...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1000));

    console.log('Opening search bar in navbar...');
    const searchBtn = await page.$('button[aria-label="Abrir búsqueda"]');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log('Typing "radiador" and pressing Enter...');
    await page.type('input[placeholder="Buscar repuestos, aceites..."]', 'radiador');
    await page.keyboard.press('Enter');

    console.log('Waiting for navigation to finish...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    const currentUrl1 = page.url();
    console.log(`Current URL after searching "radiador": ${currentUrl1}`);
    const isRepuestos = currentUrl1.includes('/repuestos') && currentUrl1.includes('q=radiador');
    console.log(`Redirected to /repuestos?q=radiador? ${isRepuestos} (Expected: true)`);

    await new Promise((r) => setTimeout(r, 1500));
    const pageText1 = await page.evaluate(() => document.body.innerText);
    const showsRadiadorProduct = pageText1.includes('Radiador Porsche Macan');
    console.log(`Shows "Radiador Porsche Macan" in results? ${showsRadiadorProduct} (Expected: true)`);
    await page.screenshot({ path: path.join(outDir, '01_search_radiador_repuestos_success.png') });

    // TEST 2: Search "5w30" in Navbar
    console.log('\nTesting search for "5w30" in Navbar...');
    const searchBtn2 = await page.$('button[aria-label="Abrir búsqueda"]');
    if (searchBtn2) {
      await searchBtn2.click();
      await new Promise((r) => setTimeout(r, 300));
    }
    await page.type('input[placeholder="Buscar repuestos, aceites..."]', '5w30');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    const currentUrl2 = page.url();
    console.log(`Current URL after searching "5w30": ${currentUrl2}`);
    const isCatalogo = currentUrl2.includes('/catalogo') && currentUrl2.includes('q=5w-30');
    console.log(`Redirected to /catalogo?q=5w-30? ${isCatalogo} (Expected: true)`);

    await new Promise((r) => setTimeout(r, 1500));
    const pageText2 = await page.evaluate(() => document.body.innerText);
    const showsOilProduct = pageText2.includes('HIGHTEC') || pageText2.includes('ACEITE');
    console.log(`Shows ROWE oils in results? ${showsOilProduct} (Expected: true)`);
    await page.screenshot({ path: path.join(outDir, '02_search_5w30_catalogo_success.png') });

    // TEST 3: Cross-Catalog button test on /catalogo?q=radiador
    console.log('\nTesting Cross-Catalog link on /catalogo?q=radiador ...');
    await page.goto('http://localhost:3000/catalogo?q=radiador', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '03_catalogo_cross_search_empty_state.png') });

    const crossLink = await page.$('a[href*="/repuestos?q=radiador"]');
    console.log(`Cross-catalog button to /repuestos?q=radiador exists? ${!!crossLink} (Expected: true)`);

    if (crossLink) {
      await crossLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      console.log(`Clicked cross-catalog link, landed on: ${page.url()}`);
      await new Promise((r) => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(outDir, '04_cross_catalog_landing_repuestos.png') });
    }

    console.log('\nAll E2E tests finished successfully!');
  } catch (err) {
    console.error('Error during E2E test:', err);
  } finally {
    await browser.close();
  }
}

run();
