"""Ensancha un mapa de texto agregando espacio libre entre obstáculos, sin cambiarlos.

Una columna es "libre" si arriba del suelo solo hay aire (.) y el suelo está completo.
Cada tramo de columnas libres se alarga (por defecto, al doble, con un mínimo y un máximo
de columnas agregadas). Los pozos, muros, plataformas y objetos no cambian de tamaño.

Uso (desde la raíz del repo):
  python tools/estirar_mapa.py src/data/niveles/tutorial.txt
  python tools/estirar_mapa.py src/data/niveles/oficina.txt --proteger 34-47,108-999

--proteger a-b,c-d   rangos de columnas (del mapa original) donde no se agrega espacio,
                     por ejemplo saltos medidos o la sala de la Mastermind.
--factor 1.0         columnas agregadas por cada columna libre del tramo.
--minimo 2 --maximo 6
--filas-suelo 2      cuántas filas de abajo son suelo.
"""
import argparse


def main():
    p = argparse.ArgumentParser()
    p.add_argument('mapa')
    p.add_argument('--proteger', default='')
    p.add_argument('--factor', type=float, default=1.0)
    p.add_argument('--minimo', type=int, default=2)
    p.add_argument('--maximo', type=int, default=6)
    p.add_argument('--filas-suelo', type=int, default=2)
    a = p.parse_args()

    filas = open(a.mapa, encoding='utf-8').read().splitlines()
    alto, ancho = len(filas), len(filas[0])
    suelo = a.filas_suelo
    protegidas = set()
    for rango in filter(None, a.proteger.split(',')):
        x0, x1 = (int(v) for v in rango.split('-'))
        protegidas.update(range(x0, x1 + 1))

    def libre(c):
        return (c not in protegidas
                and all(filas[r][c] == '.' for r in range(alto - suelo))
                and all(filas[r][c] == '#' for r in range(alto - suelo, alto)))

    columna_libre = ['.'] * (alto - suelo) + ['#'] * suelo
    columnas = [[filas[r][c] for r in range(alto)] for c in range(ancho)]
    salida = []
    c = 0
    agregadas = 0
    while c < ancho:
        if not libre(c):
            salida.append(columnas[c])
            c += 1
            continue
        fin = c
        while fin < ancho and libre(fin):
            fin += 1
        tramo = columnas[c:fin]
        extra = max(a.minimo, min(a.maximo, round(len(tramo) * a.factor)))
        mitad = len(tramo) // 2
        salida.extend(tramo[:mitad] + [list(columna_libre) for _ in range(extra)] + tramo[mitad:])
        agregadas += extra
        c = fin

    texto = '\n'.join(''.join(col[r] for col in salida) for r in range(alto)) + '\n'
    open(a.mapa, 'w', encoding='utf-8', newline='\n').write(texto)
    print(f'{a.mapa}: {ancho} -> {len(salida)} columnas (+{agregadas})')


if __name__ == '__main__':
    main()
