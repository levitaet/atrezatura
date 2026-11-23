"""Dibuja el título del menú en su cuadrícula nativa, sin fuentes externas."""
from pathlib import Path

from PIL import Image, ImageDraw


LETRAS = {
    "M": ["1100011", "1110111", "1111111", "1101011", "1100011", "1100011", "1100011", "1100011"],
    "A": ["011110", "111111", "110011", "110011", "111111", "110011", "110011", "110011"],
    "S": ["011111", "111111", "110000", "111110", "011111", "000011", "111111", "111110"],
    "T": ["111111", "111111", "001100", "001100", "001100", "001100", "001100", "001100"],
    "E": ["111111", "111111", "110000", "111110", "111110", "110000", "111111", "111111"],
    "R": ["111110", "111111", "110011", "111111", "111110", "110110", "110011", "110011"],
    "I": ["1111", "1111", "0110", "0110", "0110", "0110", "1111", "1111"],
}


def monitor(d):
    # Carcasa escalonada y cristal empotrado de un monitor de tubo.
    d.polygon([(3,6),(6,3),(40,3),(48,9),(48,34),(43,39),(7,39),(3,35)], fill="#375864")
    d.polygon([(6,3),(40,3),(44,6),(5,6),(3,8),(3,6)], fill="#dae7cd")
    d.polygon([(5,6),(42,6),(44,8),(44,33),(41,36),(6,36),(3,33),(3,9)], fill="#98b7aa")
    d.line([(5,33),(7,35),(40,35)], fill="#c1cfb9")
    d.rounded_rectangle((7,8,40,31), radius=3, fill="#52716e")
    d.rounded_rectangle((8,9,39,30), radius=3, fill="#101f2b")
    for y in range(12, 29, 4):
        d.line((11,y,36,y), fill="#1d3540")
    # Ojo de fósforo rojo, con pupila vertical y un reflejo de un píxel.
    d.polygon([(10,20),(15,18),(20,14),(27,14),(32,17),(37,18),
               (33,21),(28,24),(20,25),(15,23)], fill="#e4544c")
    d.polygon([(13,20),(21,16),(27,16),(33,19),(26,22),(20,23)], fill="#ffbb79")
    d.rectangle((22,16,25,22), fill="#512c3b")
    d.point((23,16), fill="#fff1bd")
    for x in (10, 13, 16):
        d.line((x,33,x+1,33), fill="#52716e")
    d.rectangle((36,32,39,33), fill="#f9af68")
    d.rectangle((18,39,32,41), fill="#567574")
    d.polygon([(15,42),(34,42),(38,44),(38,45),(12,45),(12,44)], fill="#86a499")


def titulo():
    image = Image.new("RGBA", (220, 49))
    d = ImageDraw.Draw(image)
    monitor(d)
    x = 55
    for i, letra in enumerate("MASTERIA"):
        filas = LETRAS[letra]
        clara, media, baja, relieve = (
            ("#f1ffeb", "#b8e1d6", "#8bc4c3", "#396877") if i < 6 else
            ("#ffe2a3", "#ffaa69", "#ff8363", "#9c4651")
        )
        for sombra in (True, False):
            for y in range(24):
                avance = x + (23 - y) // 6
                for col, bit in enumerate(filas[y // 3]):
                    if bit == "1":
                        px = avance + col * 3
                        if sombra:
                            d.rectangle((px+1,12+y,px+3,15+y), fill=relieve)
                        else:
                            color = clara if y < 10 else media if y < 18 else baja
                            d.line((px,11+y,px+2,11+y), fill=color)
        x += len(filas[0]) * 3 + 2
    # Pistas de circuito que conectan la firma con el piloto del monitor.
    d.line([(48,35),(54,41),(145,41),(148,38),(166,38)], fill="#43747a")
    d.line([(55,44),(103,44),(105,42)], fill="#304c59")
    d.rectangle((166,37,168,39), outline="#70a5a1")
    return image.crop(image.getbbox())


if __name__ == "__main__":
    destino = Path(__file__).resolve().parents[1] / "public/assets/menu/masteria.png"
    destino.parent.mkdir(parents=True, exist_ok=True)
    titulo().save(destino)
