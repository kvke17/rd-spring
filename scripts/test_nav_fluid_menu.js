require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/nav_fluid_menu';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const secret = process.env.NEXTAUTH_SECRET || 'secret';

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ==========================================
    // TEST 1: VISITANTE (SIN SESIÓN)
    // ==========================================
    console.log('\n--- TEST 1: Visitante (Sin Sesión) ---');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    // Verificar 5 enlaces centrales
    const centerLinks = await page.evaluate(() => {
      const nav = document.querySelector('nav[aria-label="Navegación principal"]');
      if (!nav) return [];
      return Array.from(nav.querySelectorAll('a')).map((a) => ({
        label: a.innerText.trim(),
        href: a.getAttribute('href'),
      }));
    });
    console.log('Central links found:', centerLinks);
    console.log(`Has 5 central links? ${centerLinks.length === 5}`);

    // Abrir NavFluidMenu
    const triggerBtn = await page.$('nav[aria-label="Menú de usuario fluido"] button[aria-label="Abrir menú"]');
    if (triggerBtn) {
      await triggerBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    const visitorItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav[aria-label="Menú de usuario fluido"] [role="tooltip"]'));
      return items.map((el) => el.innerText.trim());
    });
    console.log('Visitor items:', visitorItems);
    console.log(`Has exactly [Inicio, Iniciar sesión]? ${JSON.stringify(visitorItems) === JSON.stringify(['Inicio', 'Iniciar sesión'])}`);

    // Hover sobre Iniciar sesión
    const loginLink = await page.$('nav[aria-label="Menú de usuario fluido"] a[href="/login"]');
    if (loginLink) {
      await loginLink.hover();
      await new Promise((r) => setTimeout(r, 300));
    }
    await page.screenshot({ path: path.join(outDir, '01_visitor_fluid_menu.png') });

    // ==========================================
    // TEST 2: USUARIO NORMAL (NO ADMIN)
    // ==========================================
    console.log('\n--- TEST 2: Usuario Normal (No Admin) ---');
    const userToken = {
      name: 'Cliente VIP',
      email: 'cliente@gmail.com',
      role: 'USER',
      id: 'user-normal-id',
      sub: 'user-normal-id',
    };
    const userSessionToken = await encode({ token: userToken, secret });
    await page.setCookie({
      name: 'next-auth.session-token',
      value: userSessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    const triggerBtn2 = await page.$('nav[aria-label="Menú de usuario fluido"] button');
    if (triggerBtn2) {
      await triggerBtn2.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    const userItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav[aria-label="Menú de usuario fluido"] [role="tooltip"]'));
      return items.map((el) => el.innerText.trim());
    });
    console.log('User items:', userItems);
    console.log(`Has [Inicio, Perfil, Cerrar sesión]? ${JSON.stringify(userItems) === JSON.stringify(['Inicio', 'Perfil', 'Cerrar sesión'])}`);
    console.log(`Does NOT have Panel Admin? ${!userItems.includes('Panel Admin')}`);

    const perfilLink = await page.$('nav[aria-label="Menú de usuario fluido"] a[href="/perfil"]');
    if (perfilLink) {
      await perfilLink.hover();
      await new Promise((r) => setTimeout(r, 300));
    }
    await page.screenshot({ path: path.join(outDir, '02_user_normal_fluid_menu.png') });

    // ==========================================
    // TEST 3: ADMINISTRADOR (role === 'ADMIN')
    // ==========================================
    console.log('\n--- TEST 3: Administrador (role === ADMIN) ---');
    const adminToken = {
      name: 'Benjamín',
      email: 'admin@rdspring.cl',
      role: 'ADMIN',
      id: 'admin-benjamin-id',
      sub: 'admin-benjamin-id',
    };
    const adminSessionToken = await encode({ token: adminToken, secret });
    await page.setCookie({
      name: 'next-auth.session-token',
      value: adminSessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1500));

    const triggerBtn3 = await page.$('nav[aria-label="Menú de usuario fluido"] button');
    if (triggerBtn3) {
      await triggerBtn3.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    const adminItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav[aria-label="Menú de usuario fluido"] [role="tooltip"]'));
      return items.map((el) => el.innerText.trim());
    });
    console.log('Admin items:', adminItems);
    const expectedAdmin = ['Inicio', 'Perfil', 'Panel Admin', 'Cerrar sesión'];
    console.log(`Has exact order [Inicio, Perfil, Panel Admin, Cerrar sesión]? ${JSON.stringify(adminItems) === JSON.stringify(expectedAdmin)}`);

    const adminLink = await page.$('nav[aria-label="Menú de usuario fluido"] a[href="/admin"]');
    if (adminLink) {
      await adminLink.hover();
      await new Promise((r) => setTimeout(r, 300));
    }
    await page.screenshot({ path: path.join(outDir, '03_admin_fluid_menu.png') });

    console.log('\n🎉 ALL FLUID MENU TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
}

run();
