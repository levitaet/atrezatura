# Diseñar un nivel

Abre `base.txt`, mueve un símbolo, guarda y recarga la página del juego con `npm run dev` en marcha. Cada carácter ocupa una celda de 32 × 32 px. La esquina superior izquierda corresponde a la primera fila y la primera columna. El mapa puede ser más grande que la pantalla.

Para crear otra sala, copia `base.txt` en esta carpeta con otro nombre, por ejemplo `prueba.txt`. Añade `/?nivel=prueba` a la dirección local de Vite. La página principal abre `base.txt`. En producción, ejecuta de nuevo `npm run build` para incluir los cambios.

| Símbolo | Elemento |
|---|---|
| `.` o espacio | Aire. Usa puntos para ver las celdas vacías del final de cada fila. |
| `#` | Suelo o pared sólida. Ocupa toda la celda. |
| `=` | Plataforma fina en el borde superior de la celda, con colisión por arriba. |
| `^` | Pinchos. |
| `P` | Punto de inicio del jugador. Coloca exactamente uno. |
| `K` | Checkpoint. Se admiten varios. |
| `c` | Computador pequeño. Se escribe en minúscula. |
| `M` | Mastermind. |
| `S` | Salida. |
| `D` | Puerta. |
| `~` | Cable. |
| `!` | Disparador de la revelación. |

Todas las filas deben tener el mismo ancho. Guarda en UTF-8. Usa saltos de línea normales de Windows o Unix y evita tabuladores, comentarios y líneas vacías entre filas. Si hay un error, el juego muestra el motivo en pantalla.

```text
........
....==..
.P....S.
########
```

En esta etapa el juego dibuja los elementos interactivos con su símbolo y color. Los comportamientos de daño, recarga, puertas y victoria se incorporan en sus tareas. Para integrar al jugador, la escena expone `this.nivel.inicio` en píxeles (centro de la celda) y `this.nivel.solidos`, el grupo estático que se pasa a `physics.add.collider`. Los marcadores se consultan por símbolo, por ejemplo `this.nivel.entidades.get('c') ?? []`.
