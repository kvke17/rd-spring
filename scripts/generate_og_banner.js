const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function generateOgBanner() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

    const logoBuffer = fs.readFileSync(path.resolve('public/images/logo-rd.png'));
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    const strutBuffer = fs.readFileSync(path.resolve('public/images/sistemasuspencion.jpg'));
    const strutBase64 = `data:image/jpeg;base64,${strutBuffer.toString('base64')}`;

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          width: 1200px;
          height: 630px;
          background: #09090b;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          position: relative;
          overflow: hidden;
        }

        /* Subtle grid pattern */
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Gradient accent glow */
        .glow {
          position: absolute;
          top: -150px;
          left: -150px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(179, 19, 27, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Content Left */
        .content {
          position: relative;
          z-index: 10;
          width: 720px;
          height: 100%;
          padding: 64px 72px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .header-top {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 9999px;
          background: rgba(179, 19, 27, 0.15);
          border: 1px solid rgba(179, 19, 27, 0.4);
          color: #ff4d4f;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #b3131b;
        }

        .brand-title {
          font-size: 52px;
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .brand-title span {
          color: #b3131b;
        }

        .brand-subtitle {
          font-size: 20px;
          line-height: 1.45;
          color: #94a3b8;
          font-weight: 400;
          max-width: 560px;
        }

        .tags-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .tag-pill {
          padding: 8px 18px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
        }

        .tag-pill.highlight {
          background: rgba(179, 19, 27, 0.2);
          border-color: rgba(179, 19, 27, 0.5);
          color: #ff7875;
        }

        /* Image Right */
        .image-container {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 520px;
          overflow: hidden;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 78% center;
        }

        .image-gradient-left {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 220px;
          background: linear-gradient(90deg, #09090b 20%, rgba(9, 9, 11, 0.8) 60%, transparent 100%);
          z-index: 5;
        }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="glow"></div>

      <div class="content">
        <div class="header-top">
          <img src="${logoBase64}" alt="RD Spring" style="height: 38px; width: auto; object-fit: contain; filter: brightness(0) invert(1);" />
          <div class="badge">
            <span class="badge-dot"></span>
            SUSPENSIÓN DE ALTA GAMA & ROWE
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          <h1 class="brand-title">
            RD <span>SPRING</span><br>
            CHASSIS PRESTIGE
          </h1>
          <p class="brand-subtitle">
            Especialistas en suspensión neumática y repuestos homologados para Porsche, BMW, Mercedes-Benz y Audi en Chile.
          </p>
        </div>

        <div class="tags-row">
          <div class="tag-pill highlight">Cotización con VIN</div>
          <div class="tag-pill">Porsche Macan & Cayenne</div>
          <div class="tag-pill">Envíos a todo Chile</div>
          <div class="tag-pill">Aceites ROWE</div>
        </div>
      </div>

      <div class="image-container">
        <div class="image-gradient-left"></div>
        <img src="${strutBase64}" alt="Suspensión de Precisión">
      </div>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));

    const outputPath = path.resolve('public/images/og-banner.jpg');
    await page.screenshot({ path: outputPath, type: 'jpeg', quality: 92 });
    console.log(`Generated og-banner.jpg successfully at: ${outputPath}`);
  } catch (err) {
    console.error('Error generating og banner:', err);
  } finally {
    await browser.close();
  }
}

generateOgBanner();
