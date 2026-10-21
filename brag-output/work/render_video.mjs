import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { once } from 'events';
import sharp from 'sharp';

const FFMPEG_PATH = 'C:\\Users\\sze\\AppData\\Local\\CapCut\\Apps\\9.5.0.4050\\ffmpeg.exe';
const SOUNDTRACK_PATH = 'brag-output/work/soundtrack.wav';
const OUTPUT_VIDEO = 'brag-output/brag.mp4';
const POSTER_IMAGE = 'brag-output/brag.jpg';

// Base64 helper for vector / branding assets
function getBase64DataUri(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${data}`;
}

const icon512Uri = getBase64DataUri('public/icon-512.png');
const logoPorscheUri = getBase64DataUri('public/images/marcas/porsche.png');
const logoBmwUri = getBase64DataUri('public/images/marcas/bmw.png');
const logoAudiUri = getBase64DataUri('public/images/marcas/audi.png');
const logoLandRoverUri = getBase64DataUri('public/images/marcas/landrover.png');

let porscheThumbBuffer;
let bmwThumbBuffer;

async function prepareThumbnails() {
  const mask = Buffer.from(
    `<svg width="332" height="280"><rect x="0" y="0" width="332" height="280" rx="16" ry="16" fill="#fff"/></svg>`
  );

  porscheThumbBuffer = await sharp('brag-output/work/asset-porsche.png')
    .resize(332, 280, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  bmwThumbBuffer = await sharp('brag-output/work/asset-bmw.png')
    .resize(332, 280, { fit: 'cover', position: 'top' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

function renderSceneSvg(time) {
  const width = 1920;
  const height = 1080;

  const bg = `
    <defs>
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#121318"/>
        <stop offset="60%" stop-color="#08080a"/>
        <stop offset="100%" stop-color="#020203"/>
      </radialGradient>
      <linearGradient id="metalText" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="60%" stop-color="#f1f5f9"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#16171d"/>
        <stop offset="100%" stop-color="#0c0d11"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#vignette)"/>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffffff" stroke-width="0.75" opacity="0.03"/>
    </pattern>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="960" cy="540" r="500" fill="#b3131b" opacity="0.10" filter="blur(70px)"/>
  `;

  if (time < 4.5) {
    // SCENE 1: The Hook & Brand Engineering (0.0s - 4.5s)
    const progress = Math.min(1.0, time / 3.0);
    const opacity = Math.min(1.0, time / 0.8);
    const scale = 0.94 + 0.06 * progress;
    const fadeOut = time > 3.8 ? Math.max(0.0, (4.5 - time) / 0.7) : 1.0;
    const netOpacity = opacity * fadeOut;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${bg}
        <g opacity="${netOpacity}" transform="translate(${width/2}, ${height/2}) scale(${scale}) translate(${-width/2}, ${-height/2})">
          <g transform="translate(960, 230)">
            <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="-150" cy="0" r="5" fill="#dc2626"/>
            <text x="-130" y="6" fill="#f8fafc" font-size="13" font-family="system-ui, sans-serif" font-weight="800" letter-spacing="2">INGENIERÍA EN SUSPENSIÓN &amp; LUBRICACIÓN</text>
          </g>

          <image href="${icon512Uri}" x="845" y="310" width="230" height="230"/>

          <text x="960" y="615" fill="url(#metalText)" font-size="68" font-family="system-ui, -apple-system, sans-serif" font-weight="950" text-anchor="middle" letter-spacing="1">
            RD SPRING
          </text>

          <text x="960" y="670" fill="#e2e8f0" font-size="22" font-family="system-ui, sans-serif" font-weight="700" text-anchor="middle" letter-spacing="3">
            AMORTIGUACIÓN NEUMÁTICA · COILOVERS · ROWE MOTOR OIL
          </text>

          <g transform="translate(680, 760)" opacity="0.85">
            <image href="${logoPorscheUri}" x="0" y="0" width="100" height="60" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoBmwUri}" x="150" y="0" width="100" height="60" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoAudiUri}" x="300" y="0" width="100" height="60" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoLandRoverUri}" x="450" y="10" width="110" height="45" preserveAspectRatio="xMidYMid meet"/>
          </g>
        </g>
      </svg>
    `;
  } else if (time < 9.5) {
    // SCENE 2: The Precision Components (4.5s - 9.5s)
    const tScene = time - 4.5;
    const opacity = Math.min(1.0, tScene / 0.8);
    const fadeOut = tScene > 4.2 ? Math.max(0.0, (5.0 - tScene) / 0.8) : 1.0;
    const netOpacity = opacity * fadeOut;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${bg}
        <g opacity="${netOpacity}">
          <g transform="translate(140, 130)">
            <rect x="0" y="0" width="280" height="38" rx="19" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="24" cy="19" r="5" fill="#dc2626"/>
            <text x="42" y="24" fill="#f8fafc" font-size="13" font-family="system-ui, sans-serif" font-weight="800" letter-spacing="2">OEM HIGH-PERFORMANCE</text>
          </g>
          <text x="140" y="230" fill="#ffffff" font-size="52" font-family="system-ui, sans-serif" font-weight="900" letter-spacing="-1">
            Amortiguación Neumática &amp; Coilovers
          </text>
          <text x="140" y="275" fill="#94a3b8" font-size="22" font-family="system-ui, sans-serif" font-weight="500">
            Ajuste milimétrico para Porsche Cayenne, BMW Serie M, Audi RS y Range Rover.
          </text>

          <!-- Left Card: Porsche -->
          <g transform="translate(140, 330)">
            <rect x="0" y="0" width="380" height="560" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
            <rect x="24" y="324" width="332" height="190" rx="16" fill="#0f1015" stroke="#27272a" stroke-width="1"/>
            <text x="44" y="365" fill="#ffffff" font-size="20" font-family="system-ui, sans-serif" font-weight="800">Porsche Cayenne Active</text>
            <text x="44" y="392" fill="#dc2626" font-size="15" font-family="system-ui, sans-serif" font-weight="700">Amortiguador Neumático OEM</text>
            <line x1="44" y1="412" x2="336" y2="412" stroke="#22232a" stroke-width="1"/>
            <text x="44" y="440" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" font-weight="500">· Válvula electrónica adaptativa</text>
            <text x="44" y="466" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" font-weight="500">· Fuelle tricapa de alta presión</text>
            <text x="44" y="492" fill="#22c55e" font-size="13" font-family="system-ui, sans-serif" font-weight="700">DISPONIBLE CON ENTREGA INMEDIATA</text>
          </g>

          <!-- Middle Card: BMW -->
          <g transform="translate(560, 330)">
            <rect x="0" y="0" width="380" height="560" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
            <rect x="24" y="324" width="332" height="190" rx="16" fill="#0f1015" stroke="#27272a" stroke-width="1"/>
            <text x="44" y="365" fill="#ffffff" font-size="20" font-family="system-ui, sans-serif" font-weight="800">BMW Serie M Performance</text>
            <text x="44" y="392" fill="#dc2626" font-size="15" font-family="system-ui, sans-serif" font-weight="700">Damper &amp; Resorte Progresivo</text>
            <line x1="44" y1="412" x2="336" y2="412" stroke="#22232a" stroke-width="1"/>
            <text x="44" y="440" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" font-weight="500">· Regulación de rebote dinámico</text>
            <text x="44" y="466" fill="#94a3b8" font-size="14" font-family="system-ui, sans-serif" font-weight="500">· Aceite ROWE HLS sintético</text>
            <text x="44" y="492" fill="#22c55e" font-size="13" font-family="system-ui, sans-serif" font-weight="700">DISPONIBLE CON ENTREGA INMEDIATA</text>
          </g>

          <!-- Right Card: Engineering Specs -->
          <g transform="translate(980, 330)">
            <rect x="0" y="0" width="800" height="560" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
            
            <text x="50" y="70" fill="#ffffff" font-size="30" font-family="system-ui, sans-serif" font-weight="900">Ingeniería Certificada de Chasis</text>
            <line x1="50" y1="95" x2="750" y2="95" stroke="#27272a" stroke-width="1.5"/>

            <g transform="translate(50, 140)">
              <rect x="0" y="0" width="56" height="56" rx="14" fill="#1e1f26" stroke="#27272a"/>
              <text x="28" y="36" fill="#dc2626" font-size="24" font-weight="900" text-anchor="middle">01</text>
              <text x="80" y="24" fill="#ffffff" font-size="20" font-family="system-ui, sans-serif" font-weight="800">Ajuste Milimétrico Plug &amp; Play</text>
              <text x="80" y="50" fill="#94a3b8" font-size="16" font-family="system-ui, sans-serif" font-weight="500">Compatibilidad directa con anclajes y sensores OEM de chasis.</text>
            </g>

            <g transform="translate(50, 240)">
              <rect x="0" y="0" width="56" height="56" rx="14" fill="#1e1f26" stroke="#27272a"/>
              <text x="28" y="36" fill="#dc2626" font-size="24" font-weight="900" text-anchor="middle">02</text>
              <text x="80" y="24" fill="#ffffff" font-size="20" font-family="system-ui, sans-serif" font-weight="800">Pruebas Dinámicas de Alta Presión</text>
              <text x="80" y="50" fill="#94a3b8" font-size="16" font-family="system-ui, sans-serif" font-weight="500">Presurización a 20+ BAR y sellos tricapa vulcanizados.</text>
            </g>

            <g transform="translate(50, 340)">
              <rect x="0" y="0" width="56" height="56" rx="14" fill="#1e1f26" stroke="#27272a"/>
              <text x="28" y="36" fill="#dc2626" font-size="24" font-weight="900" text-anchor="middle">03</text>
              <text x="80" y="24" fill="#ffffff" font-size="20" font-family="system-ui, sans-serif" font-weight="800">Garantía Directa RD Spring</text>
              <text x="80" y="50" fill="#94a3b8" font-size="16" font-family="system-ui, sans-serif" font-weight="500">Asesoría de instalación y soporte técnico posventa inmediato.</text>
            </g>

            <rect x="50" y="440" width="700" height="74" rx="16" fill="#111217" stroke="#22232a"/>
            <text x="75" y="484" fill="#38bdf8" font-size="16" font-family="system-ui, sans-serif" font-weight="700">TELEMETRÍA:</text>
            <text x="200" y="484" fill="#e2e8f0" font-size="16" font-family="system-ui, sans-serif" font-weight="600">CALIBRACIÓN ELECTRÓNICA ACTIVA · TIEMPO DE RESPUESTA &lt; 15ms</text>
          </g>
        </g>
      </svg>
    `;
  } else if (time < 15.0) {
    // SCENE 3: The Platform & Trust (9.5s - 15.0s)
    const tScene = time - 9.5;
    const opacity = Math.min(1.0, tScene / 0.8);
    const fadeOut = tScene > 4.7 ? Math.max(0.0, (5.5 - tScene) / 0.8) : 1.0;
    const netOpacity = opacity * fadeOut;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${bg}
        <g opacity="${netOpacity}">
          <g transform="translate(960, 130)">
            <rect x="-170" y="-19" width="340" height="38" rx="19" fill="#18181b" stroke="#27272a" stroke-width="1.5"/>
            <circle cx="-135" cy="0" r="5" fill="#dc2626"/>
            <text x="-115" y="6" fill="#f8fafc" font-size="13" font-family="system-ui, sans-serif" font-weight="800" letter-spacing="2">ECOSISTEMA DIGITAL RD SPRING</text>
          </g>
          <text x="960" y="225" fill="#ffffff" font-size="52" font-family="system-ui, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-1">
            Comodidad, Seguridad y Despacho en Chile
          </text>
          <text x="960" y="270" fill="#94a3b8" font-size="22" font-family="system-ui, sans-serif" font-weight="500" text-anchor="middle">
            Tecnología desarrollada para resolver la búsqueda exacta de repuestos de chasis.
          </text>

          <g transform="translate(140, 330)">
            <!-- Card 1: Logistics -->
            <g transform="translate(0, 0)">
              <rect x="0" y="0" width="510" height="440" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
              <circle cx="70" cy="70" r="30" fill="#181920" stroke="#27272a"/>
              <text x="70" y="80" fill="#dc2626" font-size="28" text-anchor="middle">🚚</text>
              <text x="50" y="150" fill="#ffffff" font-size="26" font-family="system-ui, sans-serif" font-weight="900">Despacho Inmediato</text>
              <text x="50" y="200" fill="#94a3b8" font-size="17" font-family="system-ui, sans-serif" font-weight="500">
                <tspan x="50" dy="0">Integración con Envia.com, Starken y</tspan>
                <tspan x="50" dy="28">Chilexpress para cotización en tiempo real</tspan>
                <tspan x="50" dy="28">y seguimiento continuo de tu orden.</tspan>
              </text>
              <rect x="50" y="320" width="410" height="70" rx="14" fill="#0f1015" stroke="#222328"/>
              <text x="70" y="362" fill="#22c55e" font-size="15" font-family="system-ui, sans-serif" font-weight="800">COBERTURA TOTAL CHILE · 24-48 HRS</text>
            </g>

            <!-- Card 2: Webpay & Security -->
            <g transform="translate(565, 0)">
              <rect x="0" y="0" width="510" height="440" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
              <circle cx="70" cy="70" r="30" fill="#181920" stroke="#27272a"/>
              <text x="70" y="80" fill="#dc2626" font-size="28" text-anchor="middle">🔒</text>
              <text x="50" y="150" fill="#ffffff" font-size="26" font-family="system-ui, sans-serif" font-weight="900">Pago Cifrado SSL 256-Bit</text>
              <text x="50" y="200" fill="#94a3b8" font-size="17" font-family="system-ui, sans-serif" font-weight="500">
                <tspan x="50" dy="0">Checkout oficial certificado Transbank Webpay</tspan>
                <tspan x="50" dy="28">Plus, boleta o factura electrónica</tspan>
                <tspan x="50" dy="28">automática y protección 2FA de cuenta.</tspan>
              </text>
              <rect x="50" y="320" width="410" height="70" rx="14" fill="#0f1015" stroke="#222328"/>
              <text x="70" y="362" fill="#38bdf8" font-size="15" font-family="system-ui, sans-serif" font-weight="800">WEBPAY PLUS · TRANSBANK CERTIFICADO</text>
            </g>

            <!-- Card 3: AI Assistant -->
            <g transform="translate(1130, 0)">
              <rect x="0" y="0" width="510" height="440" rx="24" fill="url(#cardGrad)" stroke="#27272a" stroke-width="1.8"/>
              <circle cx="70" cy="70" r="30" fill="#181920" stroke="#27272a"/>
              <text x="70" y="80" fill="#dc2626" font-size="28" text-anchor="middle">⚡</text>
              <text x="50" y="150" fill="#ffffff" font-size="26" font-family="system-ui, sans-serif" font-weight="900">Asistente Experto IA</text>
              <text x="50" y="200" fill="#94a3b8" font-size="17" font-family="system-ui, sans-serif" font-weight="500">
                <tspan x="50" dy="0">Consulta instantánea de códigos OEM,</tspan>
                <tspan x="50" dy="28">equivalencias de resortes y diagnóstico</tspan>
                <tspan x="50" dy="28">de amortiguación las 24 horas.</tspan>
              </text>
              <rect x="50" y="320" width="410" height="70" rx="14" fill="#0f1015" stroke="#222328"/>
              <text x="70" y="362" fill="#e11d48" font-size="15" font-family="system-ui, sans-serif" font-weight="800">CONSULTORÍA DE CHASIS EN VIVO</text>
            </g>
          </g>

          <g transform="translate(960, 880)">
            <rect x="-260" y="-24" width="520" height="48" rx="24" fill="#111216" stroke="#27272a" stroke-width="1.5"/>
            <text x="0" y="6" fill="#cbd5e1" font-size="15" font-family="system-ui, sans-serif" font-weight="700" text-anchor="middle" letter-spacing="1">
              MENÚ FLUIDO · CATÁLOGO ONLINE COMPLETO
            </text>
          </g>
        </g>
      </svg>
    `;
  } else {
    // SCENE 4: The Punchline & Outro (15.0s - 20.0s) [Settled Poster Frame at 16.5s]
    const tScene = time - 15.0;
    const opacity = Math.min(1.0, tScene / 0.8);
    const fadeOut = tScene > 4.2 ? Math.max(0.0, (5.0 - tScene) / 0.8) : 1.0;
    const netOpacity = opacity * fadeOut;

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${bg}
        <g opacity="${netOpacity}">
          <circle cx="960" cy="380" r="340" fill="#b3131b" opacity="0.18"/>

          <image href="${icon512Uri}" x="885" y="160" width="150" height="150"/>

          <text x="960" y="375" fill="url(#metalText)" font-size="64" font-family="system-ui, -apple-system, sans-serif" font-weight="950" text-anchor="middle" letter-spacing="1">
            RD SPRING
          </text>

          <text x="960" y="440" fill="#ffffff" font-size="44" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="-0.5">
            DOMINA EL ASFALTO CON PRESTIGIO
          </text>

          <text x="960" y="500" fill="#94a3b8" font-size="22" font-family="system-ui, sans-serif" font-weight="600" text-anchor="middle" letter-spacing="1">
            Especialistas en Suspensión Neumática &amp; Resortes de Competición
          </text>

          <g transform="translate(960, 620)">
            <rect x="-240" y="-36" width="480" height="72" rx="36" fill="#18181b" stroke="#dc2626" stroke-width="2.5"/>
            <circle cx="-185" cy="0" r="6" fill="#dc2626"/>
            <text x="-155" y="9" fill="#ffffff" font-size="26" font-family="system-ui, sans-serif" font-weight="900" letter-spacing="0.5">
              https://www.rdspring.cl/
            </text>
          </g>

          <g transform="translate(680, 770)" opacity="0.85">
            <image href="${logoPorscheUri}" x="0" y="0" width="100" height="50" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoBmwUri}" x="150" y="0" width="100" height="50" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoAudiUri}" x="300" y="0" width="100" height="50" preserveAspectRatio="xMidYMid meet"/>
            <image href="${logoLandRoverUri}" x="450" y="5" width="110" height="40" preserveAspectRatio="xMidYMid meet"/>
          </g>

          <text x="960" y="880" fill="#64748b" font-size="16" font-family="system-ui, sans-serif" font-weight="700" text-anchor="middle" letter-spacing="2">
            DISTRIBUCIÓN OFICIAL · SANTIAGO DE CHILE · DESPACHO A TODO EL PAÍS
          </text>
        </g>
      </svg>
    `;
  }
}

async function renderFrame(time) {
  const svg = renderSceneSvg(time);
  let sharpInstance = sharp(Buffer.from(svg));

  if (time >= 4.5 && time < 9.5) {
    const tScene = time - 4.5;
    const opacity = Math.min(1.0, tScene / 0.8) * (tScene > 4.2 ? Math.max(0.0, (5.0 - tScene) / 0.8) : 1.0);

    if (opacity > 0.05) {
      sharpInstance = sharpInstance.composite([
        { input: porscheThumbBuffer, left: 164, top: 354 },
        { input: bmwThumbBuffer, left: 584, top: 354 }
      ]);
    }
  }

  return await sharpInstance.png().toBuffer();
}

async function main() {
  console.log('[1/4] Preparing luxury asset thumbnails...');
  await prepareThumbnails();

  console.log('[2/4] Generating settled poster frame brag.jpg (at t=16.5s)...');
  const posterSvg = renderSceneSvg(16.5);
  const posterBuffer = await sharp(Buffer.from(posterSvg)).jpeg({ quality: 95 }).toBuffer();
  fs.writeFileSync(POSTER_IMAGE, posterBuffer);
  console.log(`[OK] Saved poster image to ${POSTER_IMAGE}`);

  console.log('[3/4] Spawning FFmpeg encoder process...');
  const ffmpegArgs = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', '30',
    '-i', '-',
    '-i', SOUNDTRACK_PATH,
    '-c:v', 'h264_mf',
    '-b:v', '8M',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    OUTPUT_VIDEO
  ];

  const ffmpeg = spawn(FFMPEG_PATH, ffmpegArgs);

  ffmpeg.stderr.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('frame=') || msg.includes('Error')) {
      process.stdout.write(`FFmpeg: ${msg.trim()}\r`);
    }
  });

  const totalFrames = 600; // 20 seconds @ 30fps
  console.log(`[4/4] Rendering & streaming ${totalFrames} frames into FFmpeg...`);

  const startTime = Date.now();

  for (let i = 0; i < totalFrames; i++) {
    // Frame 0 is baked with the settled poster frame (t = 16.5s) for instant platform thumbnail match!
    const time = i === 0 ? 16.5 : i / 30.0;
    const pngBuffer = await renderFrame(time);

    const canContinue = ffmpeg.stdin.write(pngBuffer);
    if (!canContinue) {
      await once(ffmpeg.stdin, 'drain');
    }

    if (i % 30 === 0 || i === totalFrames - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const fps = (i / Math.max(0.1, (Date.now() - startTime) / 1000)).toFixed(1);
      process.stdout.write(`Rendering frame ${i}/${totalFrames} (${(i / 30).toFixed(1)}s) [${fps} fps, ${elapsed}s elapsed]\r`);
    }
  }

  console.log('\nFinalizing pipe stream...');
  ffmpeg.stdin.end();

  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with error code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Success! Rendered 20.0s launch video to ${OUTPUT_VIDEO} in ${totalTime}s!`);
}

main().catch((err) => {
  console.error('\n❌ Render failed:', err);
  process.exit(1);
});
