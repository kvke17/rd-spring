const puppeteer = require('d:/Proyectos/rd-spring/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/cart_alerts';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.toString());
  });

  try {
    console.log('--- Step 1: Add a product from Catalog ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await delay(1000);

    // Locate first "AGREGAR" button
    const addBtns = await page.$$('button[aria-label*="Agregar"]');
    console.log(`Found ${addBtns.length} AddToCart buttons in /catalogo`);

    if (addBtns.length > 0) {
      // 1. Click Add to Cart
      await addBtns[0].click();
      // Mid-animation of check (~200ms)
      await delay(200);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '01_catalogo_add_mid_anim.png'),
        fullPage: false,
      });
      console.log('Saved 01_catalogo_add_mid_anim.png');

      // Fully settled animation (~800ms)
      await delay(800);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02_catalogo_add_settled.png'),
        fullPage: false,
      });
      console.log('Saved 02_catalogo_add_settled.png');

      // Add same product again to verify "Ahora tienes X unidades"
      console.log('--- Testing repeated add to cart ---');
      await addBtns[0].click();
      await delay(700);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03_catalogo_repeat_add_updated_quantity.png'),
        fullPage: false,
      });
      console.log('Saved 03_catalogo_repeat_add_updated_quantity.png');

      // Test rapid 5 clicks
      console.log('--- Testing 5 rapid clicks on "Agregar al carro" ---');
      const startErrors = consoleErrors.length;
      for (let i = 0; i < 5; i++) {
        await addBtns[0].click();
        await delay(90);
      }
      await delay(500);

      // Verify only 1 Swal modal visible
      const modalCount = await page.evaluate(() => {
        return document.querySelectorAll('.swal2-popup.swal2-show').length;
      });
      console.log(`Active visible Swal modals count: ${modalCount} (Expected: 1)`);
      console.log(`Console errors during rapid clicks: ${consoleErrors.length - startErrors} (Expected: 0)`);
    }

    // Step 2: Mobile 375px view of Add to Cart alert
    console.log('--- Step 2: Mobile 375px Add to Cart Alert ---');
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await delay(1000);
    const mobileAddBtns = await page.$$('button[aria-label*="Agregar"]');
    if (mobileAddBtns.length > 0) {
      await mobileAddBtns[0].click();
      await delay(700);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '04_mobile_add_alert_375px.png'),
        fullPage: false,
      });
      console.log('Saved 04_mobile_add_alert_375px.png');
    }

    // Step 3: Cart page tests
    console.log('--- Step 3: Cart Page Tests ---');
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto('http://localhost:3000/carro', { waitUntil: 'networkidle2' });
    await delay(1200);

    // Capture cart initial state
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05_cart_initial_items.png'),
      fullPage: false,
    });
    console.log('Saved 05_cart_initial_items.png');

    // Click trash button on first item
    const trashBtn = await page.$('button[title="Eliminar producto"]');
    if (trashBtn) {
      console.log('Clicking trash icon...');
      await trashBtn.click();
      await delay(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '06_cart_delete_modal.png'),
        fullPage: false,
      });
      console.log('Saved 06_cart_delete_modal.png');

      // Click CANCELAR
      console.log('Clicking CANCELAR...');
      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) {
        await cancelBtn.click();
        await delay(500);
      }

      // Verify product is intact after cancel
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '07_cart_item_intact_after_cancel.png'),
        fullPage: false,
      });
      console.log('Saved 07_cart_item_intact_after_cancel.png');

      // Click trash again and confirm delete
      console.log('Clicking trash icon again to confirm delete...');
      const trashBtn2 = await page.$('button[title="Eliminar producto"]');
      if (trashBtn2) {
        await trashBtn2.click();
        await delay(500);

        const confirmBtn = await page.$('.swal2-confirm');
        if (confirmBtn) {
          await confirmBtn.click();
          await delay(300);
          // Capture discrete toast "Producto eliminado"
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, '08_cart_item_deleted_toast.png'),
            fullPage: false,
          });
          console.log('Saved 08_cart_item_deleted_toast.png');
          await delay(1600); // wait for toast to finish
        }
      }
    }

    // Step 4: Clear Cart modal
    console.log('--- Step 4: Vaciar carro modal ---');
    // If cart is empty, add one item back
    const isCartEmpty = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return !buttons.some(b => b.textContent.includes('Vaciar carro'));
    });

    if (isCartEmpty) {
      await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
      await delay(1000);
      const addBtnsRe = await page.$$('button[aria-label*="Agregar"]');
      if (addBtnsRe.length > 0) {
        await addBtnsRe[0].click();
        await delay(600);
      }
      await page.goto('http://localhost:3000/carro', { waitUntil: 'networkidle2' });
      await delay(1000);
    }

    // Click "Vaciar carro"
    const clearCartBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Vaciar carro'));
    });

    if (clearCartBtn && clearCartBtn.asElement()) {
      await clearCartBtn.asElement().click();
      await delay(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '09_cart_clear_modal.png'),
        fullPage: false,
      });
      console.log('Saved 09_cart_clear_modal.png');

      // Click CANCELAR
      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) {
        await cancelBtn.click();
        await delay(500);
      }
    }

    // Step 5: Test Minus button when quantity = 1
    console.log('--- Step 5: Minus button at qty 1 ---');
    const minusBtn = await page.$('button[aria-label="Disminuir cantidad"]');
    if (minusBtn) {
      // Find quantity text
      const currentQty = await page.evaluate(() => {
        const qtyEl = document.querySelector('button[aria-label="Disminuir cantidad"] + span');
        return qtyEl ? parseInt(qtyEl.textContent.trim(), 10) : 1;
      });

      console.log(`Current product quantity: ${currentQty}`);
      for (let q = currentQty; q > 1; q--) {
        await minusBtn.click();
        await delay(350);
      }

      // Now quantity is 1, click minus button -> must trigger delete modal
      await minusBtn.click();
      await delay(500);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '10_cart_minus_triggers_delete_modal.png'),
        fullPage: false,
      });
      console.log('Saved 10_cart_minus_triggers_delete_modal.png');

      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) {
        await cancelBtn.click();
        await delay(500);
      }
    }

    // Check scroll restoration
    const overflowStyle = await page.evaluate(() => {
      return {
        bodyOverflow: document.body.style.overflow,
        htmlOverflow: document.documentElement.style.overflow,
        bodyClasses: document.body.className,
      };
    });
    console.log('Scroll restoration state:', overflowStyle);

    console.log('=== All tests finished successfully ===');
    console.log('Total console errors recorded:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }
}

run();
