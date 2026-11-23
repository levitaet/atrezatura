# Fuentes de arte

Archivos editables de Resprite. **El juego no los lee directamente**: se convierten a PNG con

```sh
python tools/exportar_resprite.py
```

(requiere Pillow: `pip install pillow`). El script deja:

- `public/assets/sprites/<nombre>.png`: tira horizontal con todos los cuadros, del mismo tamaño que el lienzo de Resprite. Es lo que carga Phaser.
- `public/assets/sprites/sprites.json`: tamaño de cuadro, cantidad de cuadros y fps de cada dibujo.
- `docs/arte/vista-previa.png`: todos los dibujos con sus cuadros numerados, para verlos sin Resprite.

Para actualizar un dibujo: reemplaza su `.resprite` aquí, con el mismo nombre, y vuelve a correr el script.

| Archivo | Qué es | Lienzo | Cuadros |
|---|---|---|---|
| `felipito.resprite` | Felipito, protagonista (animación) | 128 × 128 | 11, a 5 fps |
| `felipito-con-extintor.resprite` | Prueba de Felipito con extintor (el cuadro 0 está vacío) | 128 × 128 | 2 |
| `extintor.resprite` | Extintor | 128 × 128 | 1 |
| `mastermind.resprite` | La Mastermind | 128 × 128 | 1 |
| `fondo-noche.resprite` | Fondo nocturno de ciudad | 256 × 256 | 1 |
| `completo-italiano.resprite` | Completo italiano | 128 × 128 | 1 |
| `juan-carlos-bodoque.resprite` | Juan Carlos Bodoque, presentador de la Nota Verde en la terminal final (ver abajo) | 32 × 32 | 1 |

**Licencias.** El arte original del equipo se publica con la licencia que el equipo elija. Juan Carlos Bodoque es un personaje de *31 Minutos* (derechos de sus autores); el dibujo es una reinterpretación pixel art hecha por el equipo como homenaje, porque el evento pide un guiño a 31 Minutos.
