"""Genera la placa y su figura de cartón en píxeles enteros con Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw

DESTINO = Path(__file__).resolve().parents[1] / "src/arte/tutorial"
TINTA, ORO, LUZ = "#172b32", "#c88d48", "#ffe19a"
PAPEL, PIEL, COBRE = "#efe2b8", "#e0a67d", "#975d4a"
LETRAS = {
    "E": ["1111","1000","1000","1110","1000","1000","1111"],
    "M": ["10001","11011","10101","10101","10001","10001","10001"],
    "P": ["1110","1001","1001","1110","1000","1000","1000"],
    "L": ["1000","1000","1000","1000","1000","1000","1111"],
    "A": ["0110","1001","1001","1111","1001","1001","1001"],
    "D": ["1110","1001","1001","1001","1001","1001","1110"],
    "O": ["0110","1001","1001","1001","1001","1001","0110"],
    "S": ["0111","1000","1000","0110","0001","0001","1110"],
    " ": ["00"] * 7,
}


def rotular(dibujo, x, y, texto, color):
    for letra in texto:
        filas = LETRAS[letra]
        for dy, fila in enumerate(filas):
            for dx, pixel in enumerate(fila):
                if pixel == "1":
                    dibujo.point((x + dx, y + dy), fill=color)
        x += len(filas[0]) + 1


def retrato():
    cara = Image.new("RGBA", (26, 30))
    d = ImageDraw.Draw(cara)
    d.polygon([(1,29),(2,23),(9,20),(16,20),(23,23),(25,29)], fill="#477777")
    d.rectangle((10,17,15,22), fill=COBRE)
    d.polygon([(8,21),(13,24),(17,21),(15,27),(10,27)], fill=PAPEL)
    d.rectangle((12,24,14,29), fill="#993e43")
    d.rectangle((6,5,19,15), fill=PIEL)
    d.rectangle((8,15,17,18), fill=PIEL)
    d.rectangle((7,2,18,5), fill="#493635")
    d.rectangle((5,5,8,8), fill="#493635")
    d.rectangle((15,4,20,7), fill="#493635")
    for x in (6,14):
        d.rectangle((x,9,x+5,13), fill=TINTA)
        d.rectangle((x+1,10,x+4,12), fill="#87b6ae")
        d.point((x+2,11), fill=TINTA)
    d.rectangle((12,10,13,10), fill=TINTA)
    d.rectangle((10,15,15,15), fill="#664038")
    d.rectangle((12,17,14,17), fill=COBRE)
    return cara


def generar():
    DESTINO.mkdir(parents=True, exist_ok=True)
    cara = retrato()
    placa = Image.new("RGBA", (94, 43))
    d = ImageDraw.Draw(placa)
    d.rectangle((1,2,93,42), fill="#152029")
    d.rectangle((0,0,91,39), fill=ORO, outline=TINTA)
    d.rectangle((2,2,89,37), fill=LUZ)
    d.rectangle((3,3,88,36), fill="#24464a")
    d.rectangle((6,5,34,34), fill=PAPEL)
    d.rectangle((7,6,33,33), fill="#84a59a")
    placa.alpha_composite(cara, (7,4))
    rotular(d,40,8,"EMPLEADO",PAPEL)
    rotular(d,43,19,"DEL MES",LUZ)
    d.line((40,31,82,31), fill="#66817b")
    for x in (3,87):
        for y in (3,35):
            d.point((x,y), fill=ORO)
    placa.save(DESTINO / "empleado-del-mes.png", optimize=True)

    figura = Image.new("RGBA", (32,64))
    d = ImageDraw.Draw(figura)
    d.rectangle((14,43,18,61), fill="#947453")
    d.rectangle((5,60,26,63), fill="#634b3d")
    d.rectangle((3,4,29,49), fill="#916b4d", outline=TINTA)
    d.rectangle((2,2,28,47), fill=PAPEL, outline=ORO)
    figura.alpha_composite(cara, (2,5))
    # Escarapela de premio con dos cintas.
    d.polygon([(17,33),(24,33),(25,43),(21,40),(18,43)], fill="#b34743")
    d.ellipse((16,28,25,37), fill=ORO, outline="#8c6038")
    d.rectangle((19,31,22,34), fill=LUZ)
    d.rectangle((6,39,14,40), fill=COBRE)
    figura.save(DESTINO / "figura-premiada.png", optimize=True)


if __name__ == "__main__":
    generar()
