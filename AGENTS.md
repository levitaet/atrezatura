# AGENTS.md

## Antes de cambiar el juego

- Lee la sección pertinente de `docs/MasterIA_Definicion_del_juego.md`.
  Si trabajas en una tarea Txx, revisa sus dependencias en `docs/BACKLOG.md`
  y su criterio «listo cuando» en el issue o en `tools/crear_backlog.py`.
- Identifica qué podrá hacer el jugador después del cambio y en qué sala
  o pantalla lo vas a comprobar.
- Prioriza el recorrido jugable del sprint. Usa gráficos temporales cuando
  permitan probar una mecánica antes de integrar el arte definitivo.
- Revisa `git status` antes de editar y conserva el trabajo local del equipo.

## Reglas que deben sobrevivir a cada cambio

- El extintor dispara en ocho direcciones y empuja en sentido contrario.
  Comprueba el disparo hacia abajo, una diagonal mientras caminas y qué
  ocurre al agotar la carga en el aire. Tocar suelo permite recargar.
- Averiar un computador desactiva su peligro y descuenta una sola unidad
  del contador correspondiente, aunque el chorro siga tocándolo.
- Al recibir daño, el jugador pierde un corazón. Si le quedan corazones,
  vuelve al último checkpoint con invulnerabilidad breve. Los computadores
  averiados siguen averiados y sus peligros siguen desactivados.
- Al perder el último corazón aparece la derrota. Reiniciar el nivel
  restaura su estado inicial. Comprueba por separado reaparición y reinicio.
- La Mastermind conserva el escudo mientras quede un computador obligatorio
  de su sala. Al caer el último, el chorro puede dañarla. Derrotarla abre la
  puerta. La victoria se activa cuando el jugador cruza la salida.
- La pausa congela movimiento, daño, consumo de carga y temporizadores de
  juego. Al continuar, una pulsación debe producir una sola acción.
- La partida completa debe funcionar sin clave de API. Si se integran
  diálogos remotos, prueba con el servidor desconectado y con una respuesta
  tardía. La frase local cubre el fallo y el jugador conserva el control.
  La clave se lee únicamente en el servidor.

## Dónde hacer los cambios

- Centraliza los valores ajustables de física y balance en `src/config.js`.
  Mantén mapas y diálogos en `src/data/` y recursos en `public/assets/`.
- Haz que el HUD lea el mismo estado que gobierna corazones, carga,
  computadores pendientes y escudo. Así una puerta y su contador siempre
  reflejan la misma decisión del juego.
- Al salir o reiniciar una escena, limpia los eventos y temporizadores que
  registraste y que puedan sobrevivirla. Descarta respuestas de diálogo
  que lleguen después de abandonar esa escena.
- Trata las duraciones propuestas en la definición como valores de ajuste.
  Cuando cambies la propulsión o la carga, juega el mismo salto antes y
  después y registra el resultado en `ITERACIONES.md`.

## Cómo verificar y entregar

- Para el arranque de Phaser/Vite, usa los scripts presentes en
  `package.json`. Con `package-lock.json` versionado, instala con `npm ci`.
  Ejecuta `npm run build` y abre `npm run preview` para comprobar que la
  versión compilada carga el canvas y los recursos sin errores de consola.
- Prueba el comportamiento afectado en el navegador. Para un cambio de
  checkpoint, avería un computador, recibe daño y vuelve a su puerta.
  Comprueba juntos el corazón perdido, la puerta y el contador. Después
  reinicia el nivel y comprueba que los tres recuperan su estado inicial.
- Cuando corrijas un fallo reproducible de lógica, añade una prueba de
  regresión pequeña si la infraestructura lo permite. Para controles,
  colisiones y sensación de salto, conserva también la prueba jugada.
- Cuando el recorrido completo esté implementado, juega la versión compilada
  desde el tutorial hasta la revelación, la sala final y la salida antes de
  una entrega. Haz al menos una pasada sin servicio de diálogos.
- Al entregar, indica qué cambió para el jugador, qué comando ejecutaste,
  qué situación jugaste y qué quedó sin verificar. Distingue una build
  correcta de una partida comprobada.
