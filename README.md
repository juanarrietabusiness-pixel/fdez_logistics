# FDEZ Logistics — Sitio web

Landing page estática de una sola página para **FDEZ Logistics**, lista para
publicarse automáticamente en **GitHub Pages** mediante GitHub Actions.

## 🔗 Link de previsualización

Una vez habilitado Pages (ver abajo), el sitio queda disponible en:

```
https://juanarrietabusiness-pixel.github.io/fdez_logistics/
```

Ese es el link que puedes enviar a cualquier persona para que vea el sitio.
Al compartirlo por WhatsApp, Instagram o correo se genera automáticamente una
tarjeta de previsualización con el logo, el título y la descripción
(metaetiquetas Open Graph ya incluidas).

## ⚙️ Activar el despliegue (una sola vez)

1. En GitHub, entra a **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **GitHub Actions**.
3. En **Settings → Environments → `github-pages` → Deployment branches**,
   permite la rama desde la que quieras publicar (por ejemplo `claude/*` para
   poder previsualizar ramas de trabajo antes de mergear a `main`).
4. Listo. Cada `push` a `main` (o a la rama de trabajo
   `claude/fdez-logistics-refactor-0d4gha`) corre los tests y, si pasan,
   vuelve a publicar el sitio solo.

El workflow está en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
y también puede lanzarse a mano desde la pestaña **Actions → Deploy a GitHub Pages
→ Run workflow**. Al terminar, el resumen del job muestra el link publicado.

## ✅ Tests automáticos

Cada `push` y cada pull request ejecuta la suite de pruebas en GitHub Actions
([`.github/workflows/tests.yml`](.github/workflows/tests.yml)). **El sitio no se
publica si algún test falla**: el job de despliegue depende del de tests.

| Suite | Qué comprueba |
| ----- | ------------- |
| `tests/validate_html.py` | Estructura (anidamiento, IDs duplicados, anclas rotas, `label`/`for`, `alt` en imágenes), metaetiquetas y Open Graph, colores de marca, los 9 servicios, los datos de contacto verificados, y que no reaparezcan restos de la plantilla anterior. |
| `tests/browser_check.mjs` | El sitio renderizado en Chromium a 1440px y 390px: carrusel, menú móvil, animaciones de entrada, imágenes rotas, validación de formularios, honeypot, número de WhatsApp y ausencia de errores de JavaScript. |
| `tests/screenshots.mjs` | Genera capturas de escritorio y móvil, que quedan como artefacto descargable del workflow. |

Correrlos en local:

```bash
npm install
npx playwright install chromium
npm run serve &        # sirve el sitio en :8000
npm test               # validación estática + navegador
```

## 📁 Estructura

```
.
├── index.html                 # Sitio completo (HTML + CSS + JS en un archivo)
├── 404.html                   # Página de error con la marca
├── logo.webp                  # Logo (también se usa como favicon e imagen de preview)
├── .nojekyll                  # Evita que GitHub Pages procese el sitio con Jekyll
├── assets/img/                # Fotos del sitio (ver README de esa carpeta)
├── tests/                     # Suite de pruebas
├── package.json
└── .github/workflows/
    ├── tests.yml              # Validación del sitio
    └── deploy.yml             # Publicación en Pages (depende de tests.yml)
```

## 🖼️ Imágenes

Las fotos aún no están en el repositorio. Colócalas en `assets/img/` con los
nombres indicados en [`assets/img/README.md`](assets/img/README.md).

Mientras un archivo no exista, el sitio muestra un marcador degradado con el
color de marca y un icono — **nunca aparece una imagen rota**. Al subir las
fotos reales aparecen solas, sin tocar el HTML.

## 🎨 Marca

| Elemento              | Valor                                                        |
| --------------------- | ------------------------------------------------------------ |
| Tipografía            | Inter                                                        |
| Naranja principal     | `#FF6B00`                                                    |
| Naranja claro 1       | `#FFB366`                                                    |
| Naranja claro 2       | `#FFC999`                                                    |
| Naranja profundo      | `#C24E00` (para texto y enlaces sobre blanco)                |
| Tinta sobre naranja   | `#2B1400`                                                    |
| Degradado header      | `linear-gradient(135deg,#FF6B00 0%,#FFB366 70%,#FFC999 100%)` |
| Degradado botones     | `linear-gradient(135deg,#FF6B00,#FFB366)`                     |
| Radio de botones      | `15px`                                                       |
| Iconografía           | Font Awesome 6 (Free + Brands)                               |

Todos los colores están centralizados en las variables CSS de `:root` dentro de
`index.html`: cambiarlos ahí actualiza el sitio completo.

### Regla de contraste

La paleta naranja original se mantiene intacta, pero **el texto blanco sobre
naranja no llega al mínimo legal de contraste** (WCAG AA pide 4.5:1 y el blanco
sobre `#FFC999` se queda en 1.5:1). Por eso el sitio aplica dos reglas fijas:

| Fondo                               | Color del texto                |
| ----------------------------------- | ------------------------------ |
| Naranja de marca (header, barra de valores, cotización, botones primarios) | Tinta `#2B1400` — **6:1 o más** |
| Blanco / gris claro                 | Naranja profundo `#C24E00` — **4.8:1** |

Si algún día se cambia un color de marca, hay que revisar que se sigan
cumpliendo esas dos relaciones.

## 🧭 Secciones

`#inicio` (carrusel) · barra de valores · `#servicios` (9 tarjetas) ·
`#cotizacion` · `#nosotros` · `#contacto` (oficinas, datos, horarios y
formulario) · botón flotante de WhatsApp · footer.

## 📬 Formularios

GitHub Pages sirve archivos estáticos, sin backend. Los dos formularios
(cotización y contacto) validan los datos, filtran bots con un campo *honeypot*
y abren el cliente de correo del visitante con el mensaje ya redactado hacia
`fdezlogistics1@gmail.com`.

Para recibirlos automáticamente en una bandeja, basta con reemplazar el envío
por un `POST` a un servicio de formularios. En `index.html`, dentro de
`handleSubmit`, cambiar la línea del `mailto:` por:

```js
fetch('https://formspree.io/f/TU_ID', {
  method: 'POST',
  headers: { 'Accept': 'application/json' },
  body: new FormData(form)
});
```

(Sirve igual FormSubmit, Netlify Forms o un endpoint propio del hosting.)

## 📱 Responsive, accesibilidad y UX

El sitio está pensado para funcionar desde **280 px de ancho** hasta monitores
panorámicos, y se verificó en 13 tamaños distintos (móvil pequeño, móvil,
phablet, tablet vertical y horizontal, portátil, escritorio y móvil apaisado)
sin desbordes horizontales ni texto recortado.

**Diseño adaptable**

- Rejillas fluidas (`auto-fit` + `minmax`) en servicios, oficinas, "nosotros",
  barra de valores y campos de formulario: reorganizan solas sin depender de un
  punto de ruptura exacto.
- Tipografía y espaciados con `clamp()`, y márgenes laterales fluidos.
- El hero apila sus diapositivas en una misma celda de rejilla, así que su
  altura la marca el contenido: nunca se recorta el titular, ni en pantallas
  muy pequeñas ni en móvil apaisado (que además tiene su propia regla).
- Soporte de `safe-area-inset` para móviles con muesca o barra de gestos.
- Los campos del formulario usan 16 px para que iOS no haga zoom al enfocarlos.

**Accesibilidad (WCAG 2.1 AA)**

- Contraste AA verificado en 24 combinaciones de texto/fondo (ver la regla de
  contraste más arriba).
- Enlace "Saltar al contenido principal" y anillo de foco visible en todos los
  elementos enfocables.
- Carrusel accesible: botón de pausa (criterio 2.2.2), se detiene con el
  puntero, el foco o la pestaña en segundo plano, respeta
  `prefers-reduced-motion`, anuncia el cambio por `aria-live` y marca las
  diapositivas ocultas como `inert` para que el tabulador no caiga en ellas.
- Las flechas ← → solo mueven el carrusel cuando el foco está dentro de él:
  antes se activaban incluso escribiendo en un formulario.
- Menú móvil con `aria-expanded`, cierre con `Escape` o tocando fuera, bloqueo
  del scroll de fondo y devolución del foco al botón hamburguesa.
- Iconos decorativos marcados `aria-hidden`, textos alternativos descriptivos y
  aviso de "se abre en una pestaña nueva" en los enlaces externos.
- Objetivos táctiles de 44 px en la navegación, enlaces de contacto y botones.
- Soporte de `prefers-contrast: more` y hoja de estilos para impresión.

**Experiencia de uso**

- Validación de formularios en español, con el mensaje bajo cada campo, foco
  automático en el primer error y limpieza en cuanto se corrige.
- El carrusel se puede deslizar con el dedo.
- Barra de progreso de lectura y botón "volver arriba".
- Las acciones flotantes se apartan solas cuando taparían las flechas del
  carrusel en pantallas bajas, y vuelven al desplazarse.
- Sin las fotos reales, el hero muestra solo un icono tenue en vez de una
  etiqueta de texto que se confundía con el contenido de la diapositiva.

## ℹ️ Notas de esta versión

- Se eliminaron por completo el **rastreo de guías**, la **búsqueda de casillero**
  y el **inicio de sesión** (`login.php`): requieren backend y base de datos, que
  no existen en un sitio estático.
- El botón flotante de WhatsApp usa **+507 6625-3189**, el mismo número de
  contacto del sitio, para mantener consistencia.
- El año del footer se actualiza solo cada 1 de enero.

## 💻 Ver en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```
