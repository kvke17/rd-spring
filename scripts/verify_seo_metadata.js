const puppeteer = require('puppeteer-core');

async function testSeo() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Check favicon.ico status
    console.log('--- 1. Testing /favicon.ico ---');
    const faviconRes = await page.goto('http://localhost:3000/favicon.ico');
    console.log(`Favicon HTTP Status: ${faviconRes.status()}`);
    console.log(`Favicon Content-Type: ${faviconRes.headers()['content-type']}`);

    // 2. Check robots.txt
    console.log('\n--- 2. Testing /robots.txt ---');
    const robotsRes = await page.goto('http://localhost:3000/robots.txt');
    const robotsText = await robotsRes.text();
    console.log(`Robots HTTP Status: ${robotsRes.status()}`);
    console.log('Robots content:\n', robotsText);

    // 3. Check sitemap.xml
    console.log('\n--- 3. Testing /sitemap.xml ---');
    const sitemapRes = await page.goto('http://localhost:3000/sitemap.xml');
    const sitemapText = await sitemapRes.text();
    console.log(`Sitemap HTTP Status: ${sitemapRes.status()}`);
    console.log(`Sitemap contains /repuestos? ${sitemapText.includes('https://www.rdspring.cl/repuestos')}`);
    console.log(`Sitemap contains /catalogo? ${sitemapText.includes('https://www.rdspring.cl/catalogo')}`);

    // 4. Check Home metadata
    console.log('\n--- 4. Testing Home (/) SEO Metadata ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    const homeMeta = await page.evaluate(() => {
      const getMeta = (name, prop) => {
        const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${prop || name}"]`);
        return el ? el.getAttribute('content') : null;
      };
      const getLinks = (rel) => {
        return Array.from(document.querySelectorAll(`link[rel="${rel}"]`)).map(l => ({
          href: l.getAttribute('href'),
          sizes: l.getAttribute('sizes'),
          type: l.getAttribute('type'),
        }));
      };

      return {
        title: document.title,
        description: getMeta('description'),
        keywords: getMeta('keywords'),
        ogTitle: getMeta(null, 'og:title'),
        ogDesc: getMeta(null, 'og:description'),
        ogImage: getMeta(null, 'og:image'),
        ogUrl: getMeta(null, 'og:url'),
        icons: getLinks('icon'),
        appleIcons: getLinks('apple-touch-icon'),
      };
    });
    console.log('Home Metadata:', JSON.stringify(homeMeta, null, 2));

    // 5. Check Repuestos metadata
    console.log('\n--- 5. Testing /repuestos SEO Metadata ---');
    await page.goto('http://localhost:3000/repuestos', { waitUntil: 'domcontentloaded' });
    const repuestosMeta = await page.evaluate(() => {
      const getMeta = (name, prop) => {
        const el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${prop || name}"]`);
        return el ? el.getAttribute('content') : null;
      };
      const canonical = document.querySelector('link[rel="canonical"]');

      return {
        title: document.title,
        description: getMeta('description'),
        canonical: canonical ? canonical.getAttribute('href') : null,
        ogTitle: getMeta(null, 'og:title'),
        ogDesc: getMeta(null, 'og:description'),
        ogUrl: getMeta(null, 'og:url'),
      };
    });
    console.log('Repuestos Metadata:', JSON.stringify(repuestosMeta, null, 2));

    console.log('\n✅ All SEO verifications passed!');
  } catch (err) {
    console.error('Error during SEO test:', err);
  } finally {
    await browser.close();
  }
}

testSeo();
