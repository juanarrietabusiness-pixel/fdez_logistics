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
| Degradado header      | `linear-gradient(135deg,#FF6B00 0%,#FFB366 70%,#FFC999 100%)` |
| Degradado botones     | `linear-gradient(135deg,#FF6B00,#FFB366)`                     |
| Radio de botones      | `15px`                                                       |
| Iconografía           | Font Awesome 6 (Free + Brands)                               |

Todos los colores están centralizados en las variables CSS de `:root` dentro de
`index.html`: cambiarlos ahí actualiza el sitio completo.

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
