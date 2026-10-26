require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { encode } = require('next-auth/jwt');

const outDir = 'C:/Users/sze/.gemini/antigravity/brain/4c01a18a-5a11-424c-9e10-cd9d7d143f13/screenshots/vessa_dashboard';
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

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

    // Inject Admin NextAuth session token
    const secret = process.env.NEXTAUTH_SECRET || 'secret';
    const token = {
      name: 'Admin RD Spring',
      email: 'admin@rdspring.cl',
      role: 'ADMIN',
      id: 'admin-test-id',
      sub: 'admin-test-id',
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
    await page.waitForSelector('h1', { timeout: 15000 });
    await page.waitForSelector('path.recharts-rectangle', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture 1: Overview Desktop (Full Page)
    console.log('Capturing 1: Overview Desktop Full Page ...');
    await page.screenshot({ path: path.join(outDir, '01_vessa_dashboard_overview_full.png'), fullPage: true });

    // Capture 2: Weekly Chart toggle
    console.log('Capturing 2: Weekly toggle ...');
    const weeklyBtn = await page.$('button ::-p-text(Semanal)');
    if (weeklyBtn) {
      await weeklyBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outDir, '02_vessa_dashboard_weekly_chart.png') });
    }

    // Capture 3: Activity Tab (Full Page)
    console.log('Capturing 3: Activity Tab ...');
    const activityTabBtn = await page.$('button ::-p-text(Actividad)');
    if (activityTabBtn) {
      await activityTabBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outDir, '03_vessa_dashboard_activity_tab.png'), fullPage: true });
    }

    // Capture 4: Stock Alerts Tab (Full Page)
    console.log('Capturing 4: Stock Alerts Tab ...');
    const stockAlertsTabBtn = await page.$('button ::-p-text(Alertas de Stock)');
    if (stockAlertsTabBtn) {
      await stockAlertsTabBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outDir, '04_vessa_dashboard_stock_alerts_tab.png'), fullPage: true });
    }

    // Capture 5: Mobile Viewport
    console.log('Capturing 5: Mobile Viewport ...');
    await page.setViewport({ width: 390, height: 844 });
    const overviewTabBtn = await page.$('button ::-p-text(Vista General)');
    if (overviewTabBtn) {
      await overviewTabBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }
    await page.screenshot({ path: path.join(outDir, '05_vessa_dashboard_mobile.png'), fullPage: true });

    console.log('All Vessa Dashboard tests completed successfully!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await browser.close();
  }
}

run();
