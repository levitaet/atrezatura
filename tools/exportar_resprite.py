"""Convierte los archivos de Resprite (docs/arte/fuentes/*.resprite) en PNG para el juego.

Un .resprite es un ZIP con un PNG por celda (capa × cuadro) y un document.json que dice
dónde va cada celda en el lienzo. Este script:

  1. Arma cada cuadro sobre el lienzo completo (así los pies quedan alineados entre cuadros).
  2. Guarda una tira horizontal por dibujo en public/assets/sprites/<nombre>.png
     (todos los cuadros del mismo tamaño, de izquierda a derecha).
  3. Escribe public/assets/sprites/sprites.json con tamaño de cuadro, cantidad y fps.
  4. Genera docs/arte/vista-previa.png para ver todo sin Resprite.

Uso (desde la raíz del repo, requiere Pillow: pip install pillow):
  python tools/exportar_resprite.py

Volver a correrlo después de cada cambio de Rocío en Resprite.
"""
import json
import os
import sys
import zipfile
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FUENTES = os.path.join(RAIZ, 'docs', 'arte', 'fuentes')
SALIDA = os.path.join(RAIZ, 'public', 'assets', 'sprites')
VISTA_PREVIA = os.path.join(RAIZ, 'docs', 'arte', 'vista-previa.png')

# Dibujos que se muestran en la vista previa pero NO se publican en public/ (por licencia).
NO_PUBLICAR = {'juan-carlos-bodoque'}


def leer_resprite(ruta):
    """Devuelve (documento, {id_celda: Image}) de un .resprite."""
    zf = zipfile.ZipFile(ruta)
    documento = None
    celdas = {}
    for info in zf.infolist():
        if info.is_dir():
            continue
        partes = info.filename.split('/', 1)
        nombre = partes[1] if len(partes) == 2 else partes[0]
        if nombre == 'document.json':
            documento = json.loads(zf.read(info).decode('utf-8'))
        elif nombre.startswith('CellData/') and nombre.endswith('.png'):
            celdas[nombre[len('CellData/'):-4]] = Image.open(BytesIO(zf.read(info))).convert('RGBA')
    if documento is None:
        raise ValueError(f'{ruta}: no tiene document.json')
    return documento, celdas


def armar_cuadros(documento, celdas):
    """Compone cada cuadro: capas visibles de abajo hacia arriba, origen arriba a la izquierda."""
    ancho = documento['canvasSize']['width']
    alto = documento['canvasSize']['height']
    total = documento['frameCount']
    cuadros = [Image.new('RGBA', (ancho, alto), (0, 0, 0, 0)) for _ in range(total)]
    for capa in reversed(documento['layerDatas']):  # la primera capa de la lista es la de arriba
        if capa.get('isGroup') or not capa.get('contentVisible', True):
            continue
        for i, celda in enumerate(capa['cells'][:total]):
            if not celda:
                continue
            b = celda['bounds']
            w, h = b['size']['width'], b['size']['height']
            imagen = celdas.get(celda['id'])
            if w == 0 or h == 0 or imagen is None:
                continue
            opacidad = capa.get('opacity', 1) * celda.get('opacity', 1)
            if opacidad < 1:
                alfa = imagen.getchannel('A').point(lambda a: int(a * opacidad))
                imagen = imagen.copy()
                imagen.putalpha(alfa)
            capa_cuadro = Image.new('RGBA', (ancho, alto), (0, 0, 0, 0))
            capa_cuadro.paste(imagen, (b['origin']['x'], b['origin']['y']))
            cuadros[i] = Image.alpha_composite(cuadros[i], capa_cuadro)
    return cuadros


def tira(cuadros):
    ancho, alto = cuadros[0].size
    hoja = Image.new('RGBA', (ancho * len(cuadros), alto), (0, 0, 0, 0))
    for i, c in enumerate(cuadros):
        hoja.paste(c, (i * ancho, 0))
    return hoja


def vista_previa(dibujos):
    """Una fila por dibujo, con nombre y cuadros numerados sobre fondo gris, ampliados ×2."""
    fuente = ImageFont.load_default(size=16)
    fuente_chica = ImageFont.load_default(size=12)
    escala = 2
    margen = 16
    filas = []
    for nombre, info, cuadros in dibujos:
        ancho, alto = cuadros[0].size
        factor = max(1, (128 * escala) // alto)  # los dibujos chicos se amplían más
        cw, ch = ancho * factor, alto * factor
        texto = f"{nombre}  ·  {ancho}x{alto} px  ·  {len(cuadros)} cuadro(s)  ·  {info['fps']} fps  ·  vista x{factor}"
        if nombre in NO_PUBLICAR:
            texto += '  ·  NO se publica (licencia)'
        ancho_texto = int(fuente.getlength(texto))
        fila = Image.new('RGBA', (margen * 2 + max(ancho_texto, len(cuadros) * (cw + 8)), ch + 56), (30, 38, 52, 255))
        d = ImageDraw.Draw(fila)
        d.text((margen, 8), texto, fill=(232, 238, 245, 255), font=fuente)
        for i, c in enumerate(cuadros):
            x = margen + i * (cw + 8)
            d.rectangle([x, 32, x + cw - 1, 32 + ch - 1], fill=(52, 62, 80, 255))
            fila.alpha_composite(c.resize((cw, ch), Image.NEAREST), (x, 32))
            d.text((x + 3, 34), str(i), fill=(143, 166, 196, 255), font=fuente_chica)
        filas.append(fila)
    ancho_total = max(f.width for f in filas)
    hoja = Image.new('RGBA', (ancho_total, sum(f.height for f in filas)), (30, 38, 52, 255))
    y = 0
    for f in filas:
        hoja.paste(f, (0, y))
        y += f.height
    return hoja


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')  # la consola de Windows no imprime → ni ×
    if not os.path.isdir(FUENTES):
        sys.exit(f'No existe {FUENTES}')
    os.makedirs(SALIDA, exist_ok=True)
    manifiesto = {}
    dibujos = []
    for archivo in sorted(os.listdir(FUENTES)):
        if not archivo.endswith('.resprite'):
            continue
        nombre = archivo[:-len('.resprite')]
        documento, celdas = leer_resprite(os.path.join(FUENTES, archivo))
        cuadros = armar_cuadros(documento, celdas)
        ancho, alto = cuadros[0].size
        info = {
            'archivo': f'{nombre}.png',
            'anchoCuadro': ancho,
            'altoCuadro': alto,
            'cuadros': len(cuadros),
            'fps': documento.get('frameRate', 10)
        }
        dibujos.append((nombre, info, cuadros))
        if nombre in NO_PUBLICAR:
            print(f'  {archivo}: solo vista previa (no se publica)')
            continue
        tira(cuadros).save(os.path.join(SALIDA, info['archivo']))
        manifiesto[nombre] = info
        print(f'  {archivo} → public/assets/sprites/{info["archivo"]} ({len(cuadros)} × {ancho}×{alto})')
    with open(os.path.join(SALIDA, 'sprites.json'), 'w', encoding='utf-8') as f:
        json.dump(manifiesto, f, ensure_ascii=False, indent=2)
        f.write('\n')
    vista_previa(dibujos).save(VISTA_PREVIA)
    print(f'  vista previa → docs/arte/vista-previa.png')


if __name__ == '__main__':
    main()
