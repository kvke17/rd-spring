const puppeteer = require('d:/Proyectos/rd-spring/node_modules/puppeteer-core');
const path = require('path');

const SCREENSHOT_DIR = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/cart_alerts';

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
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  try {
    // 1. Add 2 products to cart from catalog
    console.log('Adding products to cart...');
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await delay(1000);

    const addBtns = await page.$$('button[aria-label*="Agregar"]');
    if (addBtns.length > 0) {
      await addBtns[0].click();
      await delay(600);
      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) await cancelBtn.click();
      await delay(300);
    }
    if (addBtns.length > 1) {
      await addBtns[1].click();
      await delay(600);
      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) await cancelBtn.click();
      await delay(300);
    }

    // 2. Go to /carro
    console.log('Navigating to /carro...');
    await page.goto('http://localhost:3000/carro', { waitUntil: 'networkidle2' });
    await delay(1200);

    // 3. Click "Vaciar carro"
    console.log('Triggering Vaciar carro...');
    const clearBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('Vaciar carro'));
    });

    if (clearBtn && clearBtn.asElement()) {
      await clearBtn.asElement().click();
      await delay(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '09_cart_clear_modal.png'),
        fullPage: false,
      });
      console.log('Saved 09_cart_clear_modal.png');

      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) await cancelBtn.click();
      await delay(500);
    } else {
      console.log('Vaciar carro button not found!');
    }

    // 4. Test Minus button at quantity = 1
    console.log('Testing Minus button at qty 1...');
    const minusBtn = await page.$('button[aria-label="Disminuir cantidad"]');
    if (minusBtn) {
      await minusBtn.click();
      await delay(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '10_cart_minus_triggers_delete_modal.png'),
        fullPage: false,
      });
      console.log('Saved 10_cart_minus_triggers_delete_modal.png');

      const cancelBtn = await page.$('.swal2-cancel');
      if (cancelBtn) await cancelBtn.click();
      await delay(400);
    }

    console.log('Done capturing clear and minus!');
  } catch (err) {
    console.error('Error in capture:', err);
  } finally {
    await browser.close();
  }
}

run();
