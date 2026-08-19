#!/usr/bin/env python3
"""Validación estática del HTML del sitio.

Comprueba estructura (anidamiento, IDs, anclas, accesibilidad) y que el
contenido real de FDEZ Logistics esté presente y no queden restos de la
plantilla anterior. Sale con código 1 si algo falla.
"""
import collections
import html.parser
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr'}

fallos = []
comprobaciones = 0


def check(condicion, mensaje):
    global comprobaciones
    comprobaciones += 1
    if not condicion:
        fallos.append(mensaje)


class Anidamiento(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pila = []
        self.errores = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.pila.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.pila:
            self.errores.append(f'cierre sobrante </{tag}> en {self.getpos()}')
        elif self.pila[-1][0] != tag:
            abierto, donde = self.pila.pop()
            self.errores.append(
                f'</{tag}> en {self.getpos()} pero estaba abierto <{abierto}> de {donde}')
        else:
            self.pila.pop()


def estructura(nombre, src):
    p = Anidamiento()
    p.feed(src)
    for tag, pos in p.pila:
        p.errores.append(f'<{tag}> abierto en {pos} nunca se cierra')
    check(not p.errores, f'{nombre}: anidamiento inválido -> {p.errores}')

    ids = re.findall(r'\bid="([^"]+)"', src)
    dup = [i for i, c in collections.Counter(ids).items() if c > 1]
    check(not dup, f'{nombre}: IDs duplicados -> {dup}')

    anclas = {a for a in re.findall(r'href="#([^"]+)"', src)}
    check(not anclas - set(ids), f'{nombre}: anclas rotas -> {sorted(anclas - set(ids))}')

    fors = set(re.findall(r'\bfor="([^"]+)"', src))
    check(not fors - set(ids), f'{nombre}: <label for> sin campo -> {sorted(fors - set(ids))}')

    cuerpo = src.split('</head>', 1)[-1]
    sin_alt = [i for i in re.findall(r'<img[^>]*>', cuerpo) if 'alt=' not in i]
    check(not sin_alt, f'{nombre}: {len(sin_alt)} <img> sin alt -> {sin_alt[:2]}')


# ---------------------------------------------------------------- index.html
index = (ROOT / 'index.html').read_text(encoding='utf-8')
estructura('index.html', index)

check('<title>FDEZ Logistics</title>' in index, 'index.html: falta el <title> FDEZ Logistics')
check(re.search(r'<meta name="description" content="[^"]{50,}"', index) is not None,
      'index.html: falta la meta descripción (mínimo 50 caracteres)')
check('lang="es"' in index, 'index.html: el <html> debe declarar lang="es"')
check('name="viewport"' in index, 'index.html: falta la meta viewport')

# Secciones ancladas del menú
for seccion in ('inicio', 'servicios', 'cotizacion', 'nosotros', 'contacto'):
    check(f'id="{seccion}"' in index, f'index.html: falta la sección #{seccion}')

# Marca
for color in ('#FF6B00', '#FFB366', '#FFC999'):
    check(color in index, f'index.html: falta el color de marca {color}')
check("family=Inter" in index, 'index.html: falta la tipografía Inter')
check('logo.webp' in index, 'index.html: no se usa logo.webp')

# Open Graph, para que el link genere previsualización al compartirlo
for prop in ('og:title', 'og:description', 'og:image', 'og:url', 'twitter:card'):
    check(f'"{prop}"' in index, f'index.html: falta la metaetiqueta {prop}')

# Contenido verificado con el cliente
contenido = {
    'teléfono': 'tel:+50766253189',
    'email': 'fdezlogistics1@gmail.com',
    'instagram': 'instagram.com/fdez_logistics',
    'whatsapp': 'wa.me/50766253189',
    'oficina Panamá': 'PH Kitaen Vía España local 4',
    'oficina Colombia': 'CALLE 25 F N. 80C94',
    'maps Panamá': 'https://maps.app.goo.gl/AMsN9Qqc6BQx2imn7',
    'maps Colombia': 'https://maps.app.goo.gl/oFK2wtU1dFjLnK8Q6',
    'horario semana': '8:30 AM – 6:00 PM',
    'horario sábado': '9:30 AM – 1:00 PM',
    'domingo cerrado': 'Cerrado',
}
for etiqueta, aguja in contenido.items():
    check(aguja in index, f'index.html: falta el dato de contacto ({etiqueta}): {aguja}')

# Los 9 servicios, con su título exacto
servicios = [
    'Trámite de Aduana Incorporado', 'Logística Internacional',
    'Almacenaje y Distribución', 'Mudanza', 'Agente de Compra',
    'Entrega a Domicilio', 'Carga Pesada', 'Carga Comercial',
    'Importamos Repuestos',
]
for titulo in servicios:
    check(f'>{titulo}<' in index, f'index.html: falta el servicio "{titulo}"')
n_tarjetas = index.count('class="service-card')
check(n_tarjetas == 9, f'index.html: se esperaban 9 tarjetas de servicio, hay {n_tarjetas}')

# Sobre nosotros
for bloque in ('Nuestra Misión', 'Nuestra Visión', 'Rastreo en Tiempo Real', 'Precios Competitivos'):
    check(f'>{bloque}<' in index, f'index.html: falta el bloque "{bloque}"')

# Opciones del selector de asunto
for valor in ('cotizacion', 'seguimiento', 'reclamo', 'informacion', 'otros'):
    check(f'value="{valor}"' in index, f'index.html: falta la opción de asunto "{valor}"')

# El carrusel debe tener las 3 imágenes de banner
for banner in ('dbanner1.jpg', 'dbanner2.jpg', 'dbanner3.jpg'):
    check(banner in index, f'index.html: falta el banner {banner}')

# Restos de la plantilla anterior y funciones descartadas por decisión del cliente
for resto in ('Cargoxpress', 'login.php', 'cart-count', 'newsletter-form',
              'FDZ123456789', 'Crear Casillero'):
    check(resto not in index, f'index.html: quedó un resto que no debía ir -> {resto}')

# Toda imagen local referenciada debe resolver a una ruta conocida
for src in re.findall(r'<img[^>]+src="([^"]+)"', index):
    if src.startswith(('http://', 'https://', 'data:')):
        continue
    check(src == 'logo.webp' or src.startswith('assets/img/'),
          f'index.html: ruta de imagen inesperada -> {src}')

# Enlaces externos en pestaña nueva deben llevar rel="noopener"
for etiqueta in re.findall(r'<a[^>]*target="_blank"[^>]*>', index):
    check('rel="noopener"' in etiqueta,
          f'index.html: target="_blank" sin rel="noopener" -> {etiqueta[:80]}')

# ------------------------------------------------------------------ 404.html
err404 = (ROOT / '404.html').read_text(encoding='utf-8')
estructura('404.html', err404)
check('logo.webp' in err404, '404.html: no usa el logo')
check('href="./"' in err404, '404.html: falta el enlace de vuelta al inicio')

# ------------------------------------------------------------------ archivos
check((ROOT / 'logo.webp').exists(), 'falta logo.webp en la raíz del repositorio')
check((ROOT / '.nojekyll').exists(), 'falta .nojekyll (GitHub Pages procesaría el sitio con Jekyll)')

# ------------------------------------------------------------------ resultado
if fallos:
    print(f'FALLO — {len(fallos)} de {comprobaciones} comprobaciones no pasaron:\n')
    for f in fallos:
        print(f'  ✗ {f}')
    sys.exit(1)

print(f'OK — {comprobaciones} comprobaciones estáticas pasaron.')
