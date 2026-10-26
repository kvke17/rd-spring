require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/separation_test';
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

    const secret = process.env.NEXTAUTH_SECRET || 'secret';
    const token = {
      name: 'Benjamín',
      email: 'admin@rdspring.cl',
      role: 'ADMIN',
      id: 'admin-benjamin-id',
      sub: 'admin-benjamin-id',
    };
    const sessionToken = await encode({ token, secret });
    await page.setCookie({
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    });

    // 1. Check Admin Dashboard
    console.log('Navigating to http://localhost:3000/admin ...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Bienvenido'), { timeout: 15000 });
    // Wait until numbers appear (loading finished)
    await page.waitForFunction(() => !document.querySelector('.animate-pulse'), { timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, '01_admin_dashboard_repuestos_stock.png'), fullPage: false });

    // 2. Check Admin Products - Repuestos tab
    console.log('Navigating to http://localhost:3000/admin/productos?tab=repuestos ...');
    await page.goto('http://localhost:3000/admin/productos?tab=repuestos', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '02_admin_repuestos_gallery.png'), fullPage: false });

    // 3. Check Admin Products - Aceites tab
    console.log('Navigating to http://localhost:3000/admin/productos?tab=aceites ...');
    await page.goto('http://localhost:3000/admin/productos?tab=aceites', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(outDir, '03_admin_aceites_gallery.png'), fullPage: false });

    // 4. Check Public Catalogo (Aceites) - verify NO Radiador, NO Focos
    console.log('Navigating to http://localhost:3000/catalogo ...');
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const catalogoText = await page.evaluate(() => document.body.innerText);
    const hasRadiadorInAceites = catalogoText.toLowerCase().includes('radiador');
    const hasFocosInAceites = catalogoText.toLowerCase().includes('focos');
    console.log(`[Catalogo Check] Contains Radiador? ${hasRadiadorInAceites} (Expected: false)`);
    console.log(`[Catalogo Check] Contains Focos? ${hasFocosInAceites} (Expected: false)`);
    await page.screenshot({ path: path.join(outDir, '04_public_catalogo_aceites_clean.png'), fullPage: false });

    // 5. Check Public Repuestos
    console.log('Navigating to http://localhost:3000/repuestos ...');
    await page.goto('http://localhost:3000/repuestos', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    const repuestosText = await page.evaluate(() => document.body.innerText);
    const hasRadiadorInRepuestos = repuestosText.toLowerCase().includes('radiador');
    console.log(`[Repuestos Check] Contains Radiador? ${hasRadiadorInRepuestos} (Expected: true)`);
    await page.screenshot({ path: path.join(outDir, '05_public_repuestos_clean.png'), fullPage: false });

    console.log('All tests completed successfully!');
  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
  }
}

run();
