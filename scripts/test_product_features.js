require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/product_features';
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

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Create and inject admin session cookie
    const secret = process.env.NEXTAUTH_SECRET || 'secret';
    const token = {
      name: 'Admin RD Spring',
      email: 'admin@rdspring.cl',
      role: 'ADMIN',
      id: 'admin-test-id',
      sub: 'admin-test-id'
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

    // Test 1: Radiador Porsche Macan detail page
    console.log('Testing 1: View product page for radiador-porsche-macan-95b121251');
    await page.goto('http://localhost:3000/productos/radiador-porsche-macan-95b121251', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 20000 });
    await new Promise((r) => setTimeout(r, 1500));

    // Verify "Norma de Fabricación" is NOT present
    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasNorma = bodyText.includes('Norma de Fabricación');
    console.log('Has "Norma de Fabricación":', hasNorma, '(should be false)');

    const hasMarcaRepuesto = bodyText.includes('Marca del Repuesto') || bodyText.includes('Behr / OEM');
    console.log('Has "Marca del Repuesto":', hasMarcaRepuesto, '(should be true)');

    await page.screenshot({ path: path.join(outDir, '01_radiador_carousel_slide1.png') });

    // Test 2: Click next image in carousel
    console.log('Testing 2: Click next carousel arrow');
    const nextBtn = await page.$('button[aria-label="Siguiente imagen"]');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, '02_radiador_carousel_slide2.png') });
      console.log('Clicked next button and captured slide 2');
    } else {
      console.log('Next button not found');
    }

    // Test 3: Click thumbnail 3
    console.log('Testing 3: Click thumbnail 3');
    const thumb3 = await page.$('button[aria-label="Ver imagen 3"]');
    if (thumb3) {
      await thumb3.click();
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({ path: path.join(outDir, '03_radiador_carousel_slide3.png') });
      console.log('Clicked thumbnail 3 and captured slide 3');
    } else {
      console.log('Thumbnail 3 not found');
    }

    // Scroll to description box to capture reference and quality box without Norma de Fabricación
    console.log('Testing 4: Quality box capture');
    await page.evaluate(() => {
      window.scrollTo({ top: 750, behavior: 'instant' });
    });
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, '04_radiador_quality_box_no_norma.png') });

    // Test 5: Admin Nuevo Producto page
    console.log('Testing 5: Admin Nuevo Producto form view');
    await page.goto('http://localhost:3000/admin/productos/nuevo', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outDir, '05_admin_nuevo_producto.png') });

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, '05b_admin_nuevo_producto_images.png') });

    // Test 6: Admin Editar Producto page for radiator
    console.log('Testing 6: Admin Editar Producto for radiator');
    await page.goto('http://localhost:3000/admin/productos/editar/cmvjtzlco000081r3ijsb7k8r', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outDir, '06_admin_editar_producto.png') });

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outDir, '06b_admin_editar_producto_images.png') });

    console.log('All tests completed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
