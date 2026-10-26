require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/refactored_admin';
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
      name: 'Administrador RD',
      email: 'admin@rdspring.cl',
      role: 'ADMIN',
      id: 'admin-id-123',
      sub: 'admin-id-123',
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

    // 1. Dashboard Overview
    console.log('Navigating to http://localhost:3000/admin ...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    console.log('Capturing 1: Refactored Admin Dashboard ...');
    await page.screenshot({ path: path.join(outDir, '01_refactored_admin_dashboard.png'), fullPage: true });

    // 2. Almacén Central Las Condes
    console.log('Navigating to http://localhost:3000/admin/almacen ...');
    await page.goto('http://localhost:3000/admin/almacen', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    console.log('Capturing 2: Bodega Central Las Condes ...');
    await page.screenshot({ path: path.join(outDir, '02_refactored_admin_almacen.png'), fullPage: true });

    // 3. Public Product Detail Compatibility WhatsApp Button
    console.log('Navigating to public product page ...');
    await page.goto('http://localhost:3000/productos/radiador-porsche-macan-95b121251', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Capturing 3: Public Product Detail Compatibility Button ...');
    await page.screenshot({ path: path.join(outDir, '03_public_product_compat_button.png'), fullPage: true });

    // 4. Public Footer Cleaned
    console.log('Navigating to home page to inspect footer ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Capturing 4: Public Footer ...');
    await page.screenshot({ path: path.join(outDir, '04_public_footer_cleaned.png') });

    console.log('All screenshots captured successfully in', outDir);
  } catch (err) {
    console.error('Error in test script:', err);
  } finally {
    await browser.close();
  }
}

run();
