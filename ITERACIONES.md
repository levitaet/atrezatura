# Iteraciones

Registro de lo que probamos, cómo se sintió y qué cambiamos. Una línea por cambio; cualquier integrante puede agregar entradas.

Formato: `HH:MM · qué probamos · cómo se sintió · qué cambiamos`

- 11:40 · Movimiento del jugador (T05) en una sala de prueba · Fijar la velocidad con A/D borraría el empuje del extintor (lo advierte `docs/FISICAS.md`) · El jugador acelera hacia la velocidad deseada en vez de fijarla; agregamos salto variable, tiempo coyote y buffer de salto.
- 11:49 · Jugar con el teclado · La barra espaciadora desplazaba la página porque el canvas centrado la hacía más alta que la ventana · `index.html` bloquea el desplazamiento de la página.
- 11:57 · Primera versión del extintor (T06/T07), medida en `?nivel=movimiento` · Según el cálculo, sin tope de velocidad salto + chorro llegaría a unos 750 px (demasiado) · Tope de 420 px/s en la dirección del empuje y carga de 0,5 s: salto 131 px, chorro solo 180 px, salto + chorro 320 px. La carga dura lo mismo a 30, 60 y 144 FPS porque se calcula por paso de física.
- 12:21 · Playtest de un compañero con el extintor · "Está increíble", pero es contraintuitivo que la flecha hacia un lado no mueva hacia ese lado · Mantenemos las flechas apuntando el chorro, porque así se apunta a los computadores, y agregamos el modo alternativo `?flechas=mover` para comparar ambos en el próximo playtest.
- 12:30 · Decisión sobre las flechas tras el playtest · El equipo prefiere que la flecha apunte el chorro, para poder apuntar a los computadores · Se mantiene `modoFlechas: 'apuntar'`; el tutorial (T10) debe enseñar que ↓ impulsa hacia arriba. `?flechas=mover` queda solo para comparar.
- 12:45 · Corazones y checkpoints (T16) · Al saltar el pincho con carrera el jugador pasaba por encima del checkpoint sin activarlo, y la pausa gastaba la invulnerabilidad · El checkpoint cubre toda su columna y el jugador usa un reloj propio que se detiene en la pausa.
