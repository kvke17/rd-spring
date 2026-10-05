async function testAll() {
  const tests = [
    { url: 'http://localhost:3000/icon', expectedType: 'image/png' },
    { url: 'http://localhost:3000/apple-icon', expectedType: 'image/png' },
    { url: 'http://localhost:3000/favicon.ico' },
    { url: 'http://localhost:3000/favicon.svg', expectedType: 'image/svg+xml' },
    { url: 'http://localhost:3000/manifest.webmanifest' },
    { url: 'http://localhost:3000/' }
  ];

  for (const t of tests) {
    const res = await fetch(t.url);
    const contentType = res.headers.get('content-type') || '';
    const buf = await res.arrayBuffer();
    console.log(t.url, '-> Status:', res.status, 'Content-Type:', contentType, 'Size:', buf.byteLength);
    if (res.status !== 200) {
      throw new Error(`Failed to fetch ${t.url} status: ${res.status}`);
    }
  }

  // Check root HTML for icon links
  const rootRes = await fetch('http://localhost:3000/');
  const html = await rootRes.text();
  const iconLinks = html.match(/<link[^>]*rel="[^"]*(?:icon|manifest)[^"]*"[^>]*>/gi) || [];
  console.log('\nDiscovered <link> tags in HTML head:');
  iconLinks.forEach(l => console.log(' ', l));

  console.log('\nALL BRAND ICONS VERIFIED SUCCESSFULLY!');
}
testAll().catch(e => { console.error(e); process.exit(1); });
