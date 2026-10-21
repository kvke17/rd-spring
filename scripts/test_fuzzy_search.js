const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/fuzzy_search';
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

    // Test 1: "acete 5 30" en catalogo
    console.log('Testing Test 1: /catalogo?q=acete 5 30');
    await page.goto('http://localhost:3000/catalogo?q=acete%205%2030', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    const banner1 = await page.evaluate(() => {
      const banner = document.querySelector('.bg-amber-50\\/90');
      return banner ? banner.innerText.replace(/\s+/g, ' ').trim() : null;
    });
    console.log('Banner 1 text:', banner1);
    await page.screenshot({ path: path.join(outDir, '01_fuzzy_acete_5_30.png') });

    // Test 2: "0 20" en catalogo
    console.log('Testing Test 2: /catalogo?q=0 20');
    await page.goto('http://localhost:3000/catalogo?q=0%2020', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    const banner2 = await page.evaluate(() => {
      const banner = document.querySelector('.bg-amber-50\\/90');
      return banner ? banner.innerText.replace(/\s+/g, ' ').trim() : null;
    });
    console.log('Banner 2 text:', banner2);
    await page.screenshot({ path: path.join(outDir, '02_fuzzy_0_20.png') });

    // Test 3: "row 5w40" en catalogo
    console.log('Testing Test 3: /catalogo?q=row 5w40');
    await page.goto('http://localhost:3000/catalogo?q=row%205w40', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1200));
    const banner3 = await page.evaluate(() => {
      const banner = document.querySelector('.bg-amber-50\\/90');
      return banner ? banner.innerText.replace(/\s+/g, ' ').trim() : null;
    });
    console.log('Banner 3 text:', banner3);
    await page.screenshot({ path: path.join(outDir, '03_fuzzy_row_5w40.png') });

    // Test 4: "porshe amortiguador" en repuestos
    console.log('Testing Test 4: /repuestos?q=porshe amortiguador');
    await page.goto('http://localhost:3000/repuestos?q=porshe%20amortiguador', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));
    const banner4 = await page.evaluate(() => {
      const banner = document.querySelector('.bg-amber-50\\/90');
      return banner ? banner.innerText.replace(/\s+/g, ' ').trim() : null;
    });
    console.log('Banner 4 text:', banner4);
    await page.screenshot({ path: path.join(outDir, '04_repuestos_porshe_amortiguador.png') });

    // Test 5: Navbar search redirection
    console.log('Testing Test 5: Navbar search redirection from homepage');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));
    
    // Click on expandable search icon to expand
    const searchTrigger = await page.$('button[aria-label="Abrir búsqueda"]');
    if (searchTrigger) {
      await searchTrigger.click();
      await new Promise((r) => setTimeout(r, 600));
    }
    
    const navInput = await page.$('input[placeholder*="Buscar"]');
    if (navInput) {
      console.log('Found navbar search input, typing amortiguador porshe...');
      await navInput.type('amortiguador porshe');
      await page.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 2000));
      console.log('Redirected URL after navbar search:', page.url());
      await page.screenshot({ path: path.join(outDir, '05_navbar_redirect_result.png') });
    } else {
      console.log('Navbar search input not found');
    }

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
