"""Dibuja los dos estados del reloj de fichar en su cuadrícula nativa."""
from pathlib import Path

from PIL import Image, ImageDraw


ANCHO, ALTO = 32, 56
TINTA, SOMBRA, METAL = "#182a35", "#3b535c", "#749296"
ESMALTE, BRILLO = "#528c92", "#a5cdba"
MARFIL, PAPEL = "#ffedbd", "#dcc99d"


def reloj(fichado):
    imagen = Image.new("RGBA", (ANCHO, ALTO))
    d = ImageDraw.Draw(imagen)
    # Pedestal de hierro y carcasa de esmalte con bisel.
    d.rectangle((12, 39, 20, 52), fill=SOMBRA, outline=TINTA)
    d.rectangle((13, 41, 15, 51), fill=METAL)
    d.polygon([(8, 51), (23, 51), (26, 54), (26, 55), (5, 55), (5, 54)], fill=TINTA)
    d.line((8, 52, 23, 52), fill=METAL)
    d.polygon([(6, 7), (23, 7), (28, 12), (28, 38), (25, 42),
               (5, 42), (2, 39), (2, 12)], fill=TINTA)
    d.polygon([(7, 8), (22, 8), (25, 11), (25, 38), (23, 40),
               (6, 40), (4, 38), (4, 12)], fill=ESMALTE)
    d.line([(4, 27), (4, 12), (8, 8), (22, 8)], fill=BRILLO)
    d.rectangle((26, 13, 27, 36), fill=SOMBRA)
    # Piloto de cristal sobre la caja. Encendido, también se ve a distancia.
    d.rectangle((11, 5, 20, 7), fill=TINTA)
    d.rounded_rectangle((12, 1, 19, 5), radius=2, fill="#6cf6af" if fichado else SOMBRA, outline=TINTA)
    d.line((14, 2, 17, 2), fill="#dcffcb" if fichado else METAL)
    # Reloj analógico con aro de latón y agujas a las diez y diez.
    d.ellipse((5, 9, 24, 28), fill=TINTA)
    d.ellipse((6, 10, 23, 27), fill="#b98851")
    d.ellipse((7, 11, 22, 26), fill=MARFIL)
    for x, y in [(14, 12), (21, 18), (15, 25), (8, 19)]:
        d.point((x, y), fill=SOMBRA)
    d.line([(11, 16), (15, 19), (19, 14)], fill=TINTA, width=2)
    d.point((15, 19), fill="#b65f49")
    # Boca de la impresora y tarjeta de asistencia.
    d.rectangle((6, 29, 23, 32), fill=SOMBRA)
    d.line((7, 30, 22, 30), fill=TINTA)
    d.line((7, 33, 22, 33), fill=BRILLO)
    if fichado:
        d.rectangle((9, 31, 21, 43), fill=TINTA)
        d.rectangle((9, 31, 20, 41), fill=PAPEL)
        d.rectangle((9, 33, 20, 40), fill=MARFIL)
        d.line([(11, 36), (14, 39), (18, 34)], fill="#226951", width=2)
        for x in (10, 13, 16, 19):
            d.point((x, 42), fill=PAPEL)
    else:
        d.line((10, 31, 20, 31), fill=PAPEL)
        for x in (11, 14, 17):
            d.line((x, 36, x + 1, 36), fill=SOMBRA)
    return imagen


if __name__ == "__main__":
    hoja = Image.new("RGBA", (2 * ANCHO, ALTO))
    hoja.paste(reloj(False), (0, 0))
    hoja.paste(reloj(True), (ANCHO, 0))
    destino = Path(__file__).resolve().parents[1] / "public/assets/sprites/checkpoint.png"
    hoja.save(destino, optimize=True)
