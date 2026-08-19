/**
 * Pruebas de humo del sitio renderizado en Chromium.
 *
 * Levanta el sitio con un servidor estático y comprueba que funcione lo que
 * el HTML por sí solo no garantiza: carrusel, menú móvil, animaciones de
 * entrada, validación de formularios y ausencia de errores de JavaScript.
 *
 * Uso:  node tests/browser_check.mjs [http://localhost:8000]
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = await import('playwright-core'));
}

const BASE = process.argv[2] || 'http://localhost:8000';
const RAIZ = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const fallos = [];
let total = 0;

function check(condicion, mensaje) {
  total++;
  if (!condicion) fallos.push(mensaje);
}

function lanzarOpciones() {
  const opciones = { args: ['--no-sandbox'] };
  // En este contenedor Chromium ya viene instalado; en CI lo instala Playwright.
  const dir = '/opt/pw-browsers';
  if (!process.env.PLAYWRIGHT_EXECUTABLE_PATH && fs.existsSync(dir)) {
    const build = fs.readdirSync(dir).find((d) => /^chromium-\d+$/.test(d));
    if (build) opciones.executablePath = path.join(dir, build, 'chrome-linux', 'chrome');
  } else if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) {
    opciones.executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  }
  return opciones;
}

async function recorrer(page) {
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
}

const browser = await chromium.launch(lanzarOpciones());

for (const [perfil, width, height] of [['escritorio', 1440, 900], ['móvil', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const erroresJs = [];
  page.on('pageerror', (e) => erroresJs.push(String(e.message)));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) {
      erroresJs.push(m.text());
    }
  });

  const resp = await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  check(resp && resp.ok(), `${perfil}: index.html no respondió correctamente`);

  // --- Carrusel: avanza al pulsar "siguiente" y vuelve con "anterior"
  const activo = () => page.evaluate(
    () => [...document.querySelectorAll('.hero .slide')].findIndex((s) => s.classList.contains('active')));
  check(await activo() === 0, `${perfil}: el carrusel no arranca en el primer banner`);
  await page.click('#heroNext');
  await page.waitForTimeout(300);
  check(await activo() === 1, `${perfil}: "siguiente" no avanza el carrusel`);
  await page.click('#heroPrev');
  await page.waitForTimeout(300);
  check(await activo() === 0, `${perfil}: "anterior" no retrocede el carrusel`);
  check(await page.locator('.hero-dots button').count() === 3,
    `${perfil}: el carrusel debe tener 3 indicadores`);

  // --- Sin desbordamiento horizontal
  const desborda = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!desborda, `${perfil}: la página se desplaza horizontalmente`);

  // --- Menú: hamburguesa en móvil, barra de enlaces en escritorio
  if (perfil === 'móvil') {
    check(!(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open'))),
      'móvil: el menú arranca abierto');
    await page.click('#burgerBtn');
    await page.waitForTimeout(200);
    check(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open')),
      'móvil: la hamburguesa no abre el menú');
    await page.click('#mobileNav a[href="#servicios"]');
    await page.waitForTimeout(400);
    check(!(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open'))),
      'móvil: el menú no se cierra al elegir una sección');

    // El dedo suele caer sobre el icono, no sobre el <button>. Si al abrir se
    // reemplaza ese icono, el destino del clic queda fuera del DOM y el cierre
    // por "clic fuera" mata el menú recién abierto.
    await page.evaluate(() => document.querySelector('#burgerBtn i').click());
    await page.waitForTimeout(250);
    check(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open')),
      'móvil: tocar el icono de la hamburguesa no deja el menú abierto');
    check(await page.locator('#mobileNav a[href="#servicios"]').isVisible(),
      'móvil: los enlaces del menú no quedan visibles al tocar el icono');
    await page.evaluate(() => document.querySelector('#burgerBtn i').click());
    await page.waitForTimeout(250);
    check(!(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open'))),
      'móvil: el icono de la hamburguesa no vuelve a cerrar el menú');

    // Escape y foco de vuelta en el botón, para quien navega con teclado.
    await page.click('#burgerBtn');
    await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    check(!(await page.locator('#mobileNav').evaluate((n) => n.classList.contains('open'))),
      'móvil: Escape no cierra el menú');
    check(await page.evaluate(() => document.activeElement.id === 'burgerBtn'),
      'móvil: el foco no vuelve a la hamburguesa al cerrar con Escape');
  } else {
    check(await page.locator('.main-nav a').count() === 5,
      'escritorio: el menú debe tener 5 enlaces');
    check(await page.locator('.burger').isVisible() === false,
      'escritorio: la hamburguesa no debería verse');
  }

  // --- Animaciones de entrada: nada queda invisible tras recorrer la página
  await recorrer(page);
  const ocultos = await page.evaluate(
    () => [...document.querySelectorAll('.reveal')].filter((e) => !e.classList.contains('visible')).length);
  check(ocultos === 0, `${perfil}: ${ocultos} bloques quedaron invisibles tras recorrer la página`);

  // --- Marcadores de imagen: ninguna imagen rota a la vista
  const rotas = await page.evaluate(() => [...document.images]
    .filter((i) => i.isConnected && i.naturalWidth === 0).map((i) => i.getAttribute('src')));
  check(rotas.length === 0, `${perfil}: hay imágenes rotas visibles -> ${rotas.join(', ')}`);

  // --- Formularios: el navegador bloquea el envío incompleto
  await page.evaluate(() => document.getElementById('cotizacion').scrollIntoView());
  await page.click('#quoteForm button[type="submit"]');
  await page.waitForTimeout(250);
  check(page.url().startsWith(BASE), `${perfil}: el formulario vacío no debería navegar`);
  check(await page.locator('#q-nombre').evaluate((el) => !el.checkValidity()),
    `${perfil}: el campo de nombre debería ser obligatorio`);

  // --- Honeypot: fuera de la pantalla (que el bot lo vea y el usuario no)
  //     y fuera del orden de tabulación.
  const trampa = await page.locator('#q-website').evaluate((el) => ({
    x: el.getBoundingClientRect().right,
    tabindex: el.getAttribute('tabindex'),
    oculto: el.closest('[aria-hidden="true"]') !== null,
  }));
  check(trampa.x <= 0, `${perfil}: el honeypot debería quedar fuera de la pantalla (right=${trampa.x})`);
  check(trampa.tabindex === '-1', `${perfil}: el honeypot debe llevar tabindex="-1"`);
  check(trampa.oculto, `${perfil}: el honeypot debe ir dentro de un contenedor aria-hidden`);

  // --- WhatsApp con el número acordado
  const wa = await page.locator('.wa-float').getAttribute('href');
  check(wa.includes('wa.me/50766253189'),
    `${perfil}: el botón de WhatsApp apunta a otro número -> ${wa}`);

  check(erroresJs.length === 0, `${perfil}: errores de JavaScript -> ${erroresJs.join(' | ')}`);
  await page.close();
}

// --- 404 personalizado
const page404 = await browser.newPage();
const r404 = await page404.goto(`${BASE}/404.html`, { waitUntil: 'domcontentloaded' });
check(r404 && r404.ok(), '404.html no respondió correctamente');
check((await page404.title()).includes('FDEZ Logistics'), '404.html: título sin la marca');
await page404.close();

await browser.close();

if (fallos.length) {
  console.error(`FALLO — ${fallos.length} de ${total} comprobaciones de navegador no pasaron:\n`);
  fallos.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}
console.log(`OK — ${total} comprobaciones de navegador pasaron.`);
