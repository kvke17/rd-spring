require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/vessa_compact';
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

    console.log('Navigating to http://localhost:3000/admin ...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Bienvenido'), { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture 1: Vista General con Sidebar Compacta Vessa
    console.log('Capturing 1: Vessa Compact Dashboard Overview ...');
    await page.screenshot({ path: path.join(outDir, '01_vessa_compact_dashboard.png'), fullPage: true });

    // Capture 2: Pestaña Alertas de Stock
    console.log('Capturing 2: Alertas de Stock tab ...');
    const stockTab = await page.$('button ::-p-text(Alertas de Stock)');
    if (stockTab) {
      await stockTab.click();
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, '02_vessa_compact_stock_alerts_tab.png'), fullPage: true });
    }

    // Capture 3: Hover en Icono de Productos de la Sidebar
    console.log('Capturing 3: Sidebar hover tooltip ...');
    const productIcon = await page.$('a[href="/admin/productos"]');
    if (productIcon) {
      await productIcon.hover();
      await new Promise((r) => setTimeout(r, 500));
      await page.screenshot({ path: path.join(outDir, '03_vessa_compact_sidebar_hover.png') });
    }

    console.log('All Vessa compact screenshots captured successfully in', outDir);
  } catch (err) {
    console.error('Error in test script:', err);
  } finally {
    await browser.close();
  }
}

run();
