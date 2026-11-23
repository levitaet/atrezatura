"""Dibuja los fondos de MasterIA a resolución nativa. Ejecutar con Python y Pillow."""
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw

SALIDA = Path(__file__).resolve().parents[1] / "src/arte/fondos"


def oficina(alarma):
    # Cuatro módulos de 256 px; los extremos comparten columna, cornisa y suelo.
    imagen = Image.new("RGB", (1024, 270), "#26343c")
    d = ImageDraw.Draw(imagen)
    sombra, tinta, acero = "#1c2831", "#14212c", "#496069"
    pared = "#374750" if not alarma else "#34333e"
    luz = "#a5a68b" if not alarma else "#cb6b5c"
    reflejo = "#616e70" if not alarma else "#70505a"

    def rect(x, y, w, h, color):
        d.rectangle((x, y, x + w - 1, y + h - 1), fill=color)

    def linea(puntos, color):
        d.line(puntos, fill=color, width=1)

    def ventana(x, semilla):
        rng = Random(semilla)
        # El cielo se construye por bandas. Los píxeles de transición mezclan dos tintas.
        bandas = ["#344251", "#495065", "#655c70", "#826a70", "#99766e"]
        if alarma:
            bandas = ["#26283e", "#3b314c", "#594056", "#794c59", "#995f5b"]
        rect(x - 4, 39, 189, 94, tinta)
        for i, color in enumerate(bandas):
            y = 42 + i * 12
            rect(x, y, 181, 12, color)
            if i:
                for dx in range(0, 181, 3):
                    rect(x + dx, y + (dx % 2), 1, 1, bandas[i - 1])
        # Incendios lejanos: el viento empuja el humo sobre la ciudad que ve Felipito.
        foco = x + (40 if semilla % 2 else 106)
        for j in range(8):
            px, py = foco + j * 3, 85 - j * 4
            rect(px, py, 5 + j, 5, "#554958")
            rect(px + 3, py - 2, 4 + j, 2, "#615161")
        rect(foco, 80, 3, 6, "#ae755f")
        rect(foco + 4, 78, 2, 7, "#c38968")
        # Edificios lejanos y cercanos, azoteas escalonadas, antenas y ventanas encendidas.
        for lejos, tono in [(True, "#4c4c60"), (False, "#303c4c")]:
            dx = 0
            while dx < 181:
                w = min(rng.randint(7, 18), 181 - dx)
                y = rng.randint(68, 91) if lejos else rng.randint(82, 104)
                rect(x + dx, y, w, 129 - y, tono)
                if w > 7:
                    rect(x + dx + 2, y - 3, w - 4, 3, tono)
                    if rng.random() < .25:
                        rect(x + dx + 3, y - 8, 1, 6, tono)
                if not lejos:
                    for wy in range(y + 4, 125, 5):
                        for wx in range(dx + 2, dx + w - 1, 4):
                            if rng.random() < .35:
                                rect(x + wx, wy, 2, 1, "#9c7868")
                dx += w
        for dx in (0, 60, 120, 178):
            rect(x + dx, 41, 3, 89, tinta)
            rect(x + dx, 42, 1, 86, acero)
        for y in (43, 47, 51):
            rect(x, y, 181, 2, "#34424b")
        rect(x - 5, 129, 191, 3, reflejo)
        rect(x - 4, 132, 189, 3, sombra)

    def mesa(x, y, ancho):
        rect(x + 3, y + 4, 4, 27, sombra)
        rect(x + ancho - 8, y + 4, 4, 27, sombra)
        rect(x + 10, y + 5, ancho - 21, 10, "#34414a")
        rect(x, y, ancho, 3, "#807065")
        rect(x, y + 3, ancho, 4, "#453f40")
        rect(x + ancho - 25, y + 7, 21, 22, "#394851")
        for dy in (10, 17, 24):
            rect(x + ancho - 24, y + dy, 18, 1, sombra)
            rect(x + ancho - 17, y + dy - 2, 5, 1, acero)

    def monitor(x, y):
        rect(x + 7, y + 15, 4, 5, sombra)
        rect(x + 3, y + 20, 13, 2, tinta)
        rect(x, y, 22, 16, tinta)
        rect(x + 1, y + 1, 20, 13, "#52616a")
        rect(x + 3, y + 2, 16, 10, "#334e57" if not alarma else "#362c3c")
        if alarma:
            d.polygon([(x+5,y+7),(x+9,y+4),(x+13,y+4),(x+17,y+7),(x+13,y+9),(x+9,y+9)], fill="#b66b65")
            rect(x + 10, y + 5, 3, 4, tinta)
        else:
            linea([(x+4,y+6),(x+7,y+3),(x+10,y+3)], "#516e72")
        rect(x + 17, y + 14, 2, 1, luz)

    def silla(x, y):
        rect(x + 6, y + 19, 3, 10, tinta)
        linea([(x-1,y+31),(x+7,y+27),(x+17,y+31)], acero)
        for dx in (-2, 7, 16):
            rect(x + dx, y + 31, 3, 2, tinta)
        rect(x, y, 15, 14, tinta)
        rect(x + 1, y + 1, 13, 10, "#41545a")
        rect(x + 3, y + 14, 2, 4, acero)
        rect(x - 2, y + 17, 21, 4, "#293840")

    rect(0, 0, 1024, 180, pared)
    rect(0, 176, 1024, 94, "#26343d")
    for y in (185, 201, 225, 255):
        rect(0, y, 1024, 1, "#39434b")
    for x in range(-96, 1100, 48):
        linea([(x,176),(x-56,269)], "#33404a")
    for i in range(4):
        x = i * 256
        rect(x, 0, 256, 17, sombra)
        for dx in (0, 80, 160, 240):
            linea([(x+dx,0),(x+dx+18,17)], "#374750")
        rect(x, 17, 256, 4, tinta)
        rect(x+55, 12, 90, 5, tinta)
        rect(x+59, 13, 82, 2, luz)
        rect(x+3, 23, 3, 152, sombra)
        ventana(x+16, i+23)
        rect(x+211, 55, 35, 41, sombra)
        rect(x+213, 57, 31, 37, "#6a5b54")
        for dx, dy, w, h, col in [(2,4,11,14,"#9a9580"),(16,9,10,8,"#98816d"),(12,23,12,10,"#82928c")]:
            rect(x+213+dx,57+dy,w,h,col)
            rect(x+216+dx,59+dy,3,1,"#655c5b")
        rect(x, 172, 256, 4, sombra)
        mesa(x+16, 154, 100)
        monitor(x+33, 132)
        rect(x+29, 152, 29, 2, acero)
        rect(x+79, 147, 6, 7, "#98675a")
        d.rectangle((x+84,148,x+87,151), outline="#98675a")
        silla(x+56, 152)
        if i % 2 == 0:
            mesa(x+127, 150, 68)
            monitor(x+155, 128)
            silla(x+142, 148)
            # Archivador con tiradores y portarrótulos.
            rect(x+210, 129, 34, 47, tinta)
            for y in (130,145,160):
                rect(x+212,y,30,13,"#45555b")
                rect(x+222,y+5,9,2,acero)
                rect(x+215,y+2,5,2,"#898778")
        else:
            # Fotocopiadora con tapa levantada y bandeja de salida.
            rect(x+142,145,40,30,"#45565c")
            rect(x+139,141,45,6,"#768080")
            linea([(x+142,140),(x+171,132),(x+178,133)], acero)
            rect(x+146,151,23,3,tinta)
            rect(x+145,156,15,1,"#aaa595")
            rect(x+174,142,5,2,luz)
            rect(x+216,162,13,13,"#705c52")
            for dx,dy in [(-11,-11),(-6,-17),(1,-22),(9,-14),(14,-8)]:
                linea([(x+222,161),(x+222+dx,161+dy)], "#587067")
                rect(x+220+dx,159+dy,5,3,"#657c70")
    return imagen


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    for alarma, nombre in [(False, "oficina"), (True, "oficina-alerta")]:
        oficina(alarma).save(SALIDA / f"{nombre}.png", optimize=True)
