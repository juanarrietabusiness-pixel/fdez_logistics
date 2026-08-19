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
3. Listo. Cada `push` a `main` (o a la rama de trabajo
   `claude/fdez-logistics-refactor-0d4gha`) vuelve a publicar el sitio solo.

El workflow está en [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
y también puede lanzarse a mano desde la pestaña **Actions → Deploy a GitHub Pages
→ Run workflow**. Al terminar, el resumen del job muestra el link publicado.

## 📁 Estructura

```
.
├── index.html                 # Sitio completo (HTML + CSS + JS en un archivo)
├── 404.html                   # Página de error con la marca
├── logo.webp                  # Logo (también se usa como favicon e imagen de preview)
├── .nojekyll                  # Evita que GitHub Pages procese el sitio con Jekyll
├── assets/img/                # Fotos del sitio (ver README de esa carpeta)
└── .github/workflows/deploy.yml
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
