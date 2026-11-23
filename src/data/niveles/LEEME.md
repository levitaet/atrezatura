# Diseñar un nivel

Los niveles del juego son `tutorial.txt` y `oficina.txt` (el orden está en `NIVELES`, en `src/config.js`). Abre uno, mueve un símbolo, guarda, recarga la página con `npm run dev` en marcha y pulsa **Empezar**. Cada carácter ocupa una celda de 32 × 32 px. La esquina superior izquierda corresponde a la primera fila y la primera columna. El mapa puede ser más grande que la pantalla.

Para crear otra sala, copia `base.txt` en esta carpeta con otro nombre, por ejemplo `prueba.txt`. Añade `/?nivel=prueba` a la dirección local de Vite. La página principal abre `base.txt`. En producción, ejecuta de nuevo `npm run build` para incluir los cambios.

| Símbolo | Elemento |
|---|---|
| `.` o espacio | Aire. Usa puntos para ver las celdas vacías del final de cada fila. |
| `#` | Suelo o pared sólida. Ocupa toda la celda. |
| `=` | Plataforma fina en el borde superior de la celda, con colisión por arriba. El jugador la atraviesa saltando desde abajo y baja con **S**. |
| `^` | Pinchos. Quitan un corazón y devuelven al último checkpoint. |
| `P` | Punto de inicio del jugador. Coloca exactamente uno. |
| `K` | Checkpoint. Se admiten varios. Se activa al cruzar su columna, aunque sea saltando por encima. |
| `c` | Computador pequeño. Se escribe en minúscula. Se avería con 0,3 s de chorro. |
| `M` | Mastermind (una sola). Se dibuja como un monitor de 3 × 3 celdas apoyado sobre la M. Los computadores a menos de 10 celdas en horizontal forman su escudo; al entrar en esa zona electrifica el suelo por turnos. |
| `S` | Salida. Se abre al destruir la Mastermind; cruzarla abierta gana el nivel. Sin M en el mapa, está abierta desde el principio. |
| `D` | Puerta. Bloquea toda su columna hacia arriba, hasta el primer `#` o el techo del mapa. Se abre al averiar su computador. |
| `~` | Cable. Hace daño hasta que se avería su computador. |
| `!` | Disparador de la revelación. Ocurre una vez, al cruzar su columna. |
| `o` | Completo italiano. Al recogerlo llena el tanque del extintor. |
| `?` | Cartel de texto. Los textos están en `src/data/carteles.json`, una lista por nivel, en orden de izquierda a derecha. |
| `*` | Pensamiento de Felipito: se muestra una vez al cruzar su columna. Textos en `src/data/pensamientos.json` (lista `mapa` del nivel, de izquierda a derecha). |
| `e` | Extintor para recoger. Si el mapa tiene una `e`, Felipito empieza sin extintor. |
| `T` | Cartel de práctica (Empleado del mes). Bloquea el paso hasta que lo rocías; enseña a plantarse con Espacio. |

**Qué computador controla qué:** cada puerta `D` y cada cable `~` lo controla el computador `c` más cercano. Pon cada computador cerca de lo que debe abrir o apagar. Un peligro sin computadores en el mapa no se desactiva nunca.

**Pozos:** el borde inferior del mapa está abierto. Si dejas un hueco en el suelo de la última fila, caer por él quita un corazón.

Todas las filas deben tener el mismo ancho. Guarda en UTF-8. Usa saltos de línea normales de Windows o Unix y evita tabuladores, comentarios y líneas vacías entre filas. Si hay un error, el juego muestra el motivo en pantalla.

```text
........
....==..
.P....S.
########
```

En esta etapa el juego dibuja los elementos interactivos con su símbolo y color. Los comportamientos de daño, recarga, puertas y victoria se incorporan en sus tareas. Para integrar al jugador, la escena expone `this.nivel.inicio` en píxeles (centro de la celda) y `this.nivel.solidos`, el grupo estático que se pasa a `physics.add.collider`. Los marcadores se consultan por símbolo, por ejemplo `this.nivel.entidades.get('c') ?? []`.

## Medidas útiles para diseñar

Felipito mide 1 × 2 celdas. Salto normal: ~4 celdas de alto y ~8 de largo corriendo. Súper salto (W + ↓): ~10 celdas de alto. Salto + chorro lateral: ~10 celdas de largo. Las paredes de 3 celdas piden mantener W; las de 8 o 9, súper salto.

**Cómo se dibujan los sólidos (`#`):** las filas del fondo son alfombra; las pilas de 3 o más celdas de alto y hasta 2 de ancho son estanterías; lo demás son escritorios y cajas amontonados. Las `=` son mesas.
