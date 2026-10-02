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
    await page.goto('http://localhost:3000/catalogo', { waitUntil: 'networkidle2' });
    await delay(1000);

    // Dismiss cookie banner first if present
    const cookieAcceptBtn = await page.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.find(b => b.textContent.includes('Aceptar'));
    });
    if (cookieAcceptBtn && cookieAcceptBtn.asElement()) {
      await cookieAcceptBtn.asElement().click();
      await delay(300);
      console.log('Dismissed cookie banner.');
    }

    // Locate second or third card so it is clearly visible
    const addBtns = await page.$$('button[aria-label*="Agregar"]');
    console.log(`Found ${addBtns.length} AddToCart buttons.`);

    if (addBtns.length > 1) {
      // Scroll into view
      await addBtns[1].evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
      await delay(400);

      // Click to capture mid-animation
      await addBtns[1].click();
      await delay(180); // mid-animation of checkmark
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '01_catalogo_add_mid_anim.png'),
        fullPage: false,
      });
      console.log('Saved 01_catalogo_add_mid_anim.png');

      // Settled animation
      await delay(700);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '02_catalogo_add_settled.png'),
        fullPage: false,
      });
      console.log('Saved 02_catalogo_add_settled.png');

      // Click again to capture repeat add text "Ahora tienes 2 unidades en tu carro."
      await addBtns[1].click();
      await delay(700);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03_catalogo_repeat_add_updated_quantity.png'),
        fullPage: false,
      });
      console.log('Saved 03_catalogo_repeat_add_updated_quantity.png');

      // Test 5 rapid clicks on the add button
      console.log('Testing 5 rapid clicks...');
      for (let i = 0; i < 5; i++) {
        await addBtns[1].click();
        await delay(80);
      }
      await delay(600);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, '03b_catalogo_after_5_rapid_clicks.png'),
        fullPage: false,
      });

      const modalCount = await page.evaluate(() => {
        return document.querySelectorAll('.swal2-popup.swal2-show').length;
      });
      console.log(`Active visible Swal modals after 5 clicks: ${modalCount} (Expected: 1)`);
    }

    console.log('Finished capturing desktop catalog modals.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
}

run();
