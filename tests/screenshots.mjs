/**
 * Genera capturas del sitio (escritorio y móvil) para revisarlas como
 * artefacto del workflow, sin tener que desplegar para ver cómo quedó.
 *
 * Uso:  node tests/screenshots.mjs [url] [carpeta]
 */
import fs from 'node:fs';
import path from 'node:path';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = await import('playwright-core'));
}

const BASE = process.argv[2] || 'http://localhost:8000';
const SALIDA = process.argv[3] || 'capturas';

const opciones = { args: ['--no-sandbox'] };
const dir = '/opt/pw-browsers';
if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
  opciones.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
} else if (fs.existsSync(dir)) {
  const build = fs.readdirSync(dir).find((d) => /^chromium-\d+$/.test(d));
  if (build) opciones.executablePath = path.join(dir, build, 'chrome-linux', 'chrome');
}

fs.mkdirSync(SALIDA, { recursive: true });
const browser = await chromium.launch(opciones);

for (const [nombre, width, height] of [['escritorio', 1440, 900], ['movil', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  // Recorrer la página dispara las animaciones de entrada antes de capturar.
  await page.evaluate(async () => {
    const paso = window.innerHeight / 2;
    for (let y = 0; y < document.body.scrollHeight; y += paso) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 700));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
  const destino = path.join(SALIDA, `${nombre}.png`);
  await page.screenshot({ path: destino, fullPage: true });
  console.log(`Captura guardada: ${destino}`);
  await page.close();
}

await browser.close();
