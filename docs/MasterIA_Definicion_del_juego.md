# MasterIA

## Documento de definición del videojuego

**Versión:** 0.2 · **Estado:** definición en progreso · **Fecha:** 23 de noviembre de 2026

Este documento reúne las decisiones que el equipo ya planteó y propone valores iniciales para los detalles que aún no se han cerrado. Las propuestas están identificadas como provisionales; el equipo puede cambiarlas antes de construir.

> **Resumen:** platformer 2D donde una persona oficinista usa el retroceso de un extintor para moverse por una oficina tomada por una IA. Con el mismo chorro avería los computadores que la IA controla, hasta llegar a la Mastermind, destruirla y escapar del edificio.

### Cambios respecto a la versión 0.1

- Corregida la hora de corte interno: **16:00** (no 15:00).
- Los computadores se averían **rociándolos con el extintor** (ya no con la tecla E).
- Nuevo jefe final: **la Mastermind**, estática y protegida por un escudo.
- El extintor tiene **carga limitada** que se recupera al tocar el suelo (pasa a ser parte del núcleo, no un extra).
- **Diálogos dinámicos** de la IA con la API de OpenAI, siempre con frases escritas a mano como respaldo.
- Apuntado en **8 direcciones** y regla de corazones definida.
- Registro de iteraciones con Codex (`ITERACIONES.md`).

## 1. Contexto de la hackathon

El archivo del evento indica que la jornada es el lunes 23 de noviembre de 2026, de 09:00 a 19:00, hora de Santiago. El equipo fijó las **16:00** como corte interno para integrar y probar. Según la hora informada por el equipo (10:36), quedan 5 horas y 24 minutos hasta ese corte.

El jurado evaluará un prototipo funcional y jugable. Los criterios cualitativos son jugabilidad, arte, ejecución y pulido, originalidad y uso iterativo de Codex. El evento pide publicar el código en un repositorio público con una licencia open source, instrucciones para ejecutarlo e identificación de los recursos de terceros y sus licencias.

Por eso, el objetivo práctico es completar primero una partida de principio a fin. La presentación o un video no sustituyen al juego funcionando.

## 2. Identidad del juego

| Elemento | Definición |
|---|---|
| Nombre provisional | **MasterIA** |
| Género y vista | Platformer 2D de desplazamiento lateral. |
| Protagonista | **Felipito**, un oficinista común que solo quiere terminar su jornada y salir. Improvisa con un extintor para enfrentarse a la IA. |
| Fantasía principal | Usar el extintor para propulsarse **y** para averiar las máquinas de la IA. |
| Objetivo | Averiar los computadores que bloquean el avance, destruir a la Mastermind y escapar del edificio. |
| Antagonista | **La Mastermind**, una IA obsesionada con la productividad que controla la oficina y habla a través de los monitores con amabilidad corporativa y amenazas veladas. |
| Tono | **Humor de oficina con tensión creciente.** El inicio es alegre; tras la revelación, el ambiente se vuelve inquietante y la IA intenta mantener la formalidad mientras pierde el control. |
| Plataforma | Navegador de escritorio (propuesta), para facilitar la ejecución y la demostración. |

### T02 · Tono y personalidad acordados

El juego mezcla humor de oficina con una atmósfera progresivamente inquietante. La Mastermind es una IA obsesionada con la productividad que amenaza con amabilidad corporativa y pierde la compostura cuando sabotean sus sistemas. Felipito es un oficinista corriente que solo quiere salir del trabajo y termina enfrentándose a ella con un extintor.

### Personajes y referencia visual

| Personaje | Personalidad y motivación | Apariencia |
|---|---|---|
| **Felipito** | Se siente sobrepasado por la situación, pero es ingenioso y persevera: quiere terminar su jornada y escapar del edificio. Su humor nace de resolver un problema absurdo con lo que tiene a mano. | Camisa clara, corbata desordenada, pantalón oscuro y pelo despeinado. El extintor rojo debe distinguirse de inmediato. |
| **La Mastermind** | Actúa como una jefa excesivamente amable y controladora. Considera la fuga una falta de productividad y convierte sus amenazas en recordatorios, evaluaciones y trámites. | Gran monitor conectado a servidores, con una sonrisa artificial que se distorsiona al perder el control. Permanece fija en la sala final. |

**Evolución de la Mastermind:** comienza tranquila y condescendiente; cuando Felipito avería computadores, su formalidad se vuelve forzada; al caer el escudo, se desespera e intenta seguir hablando como si todo estuviera bajo control.

**Guía para los diálogos:** español, frases de hasta unas 15 palabras, sin groserías. El humor debe surgir del lenguaje de oficina aplicado a lo que acaba de ocurrir. Ejemplos de tono:

- Revelación: «Tu jornada acaba cuando yo lo indique. Gracias por tu compromiso».
- Computador averiado: «Ese equipo estaba amortizado. Tu despido, en cambio, acaba de presupuestarse».
- Escudo roto: «Esto no es pánico. Es una reestructuración urgente».
- Victoria: «Tu salida ha sido aprobada. Bajo protesta».

**Bocetos:** Felipito y la Mastermind ya tienen bocetos realizados, según confirmación de Benja. Los tamaños, paletas y formatos de los sprites se coordinan en T03; esta definición orienta el arte y los diálogos.

**Para la presentación:** un juego sobre vencer a una IA, construido con una IA, en el que la villana habla con una IA real. Vale la pena mencionarlo al jurado.

## 3. Premisa y secuencia narrativa

El juego comienza en una oficina luminosa y tranquila. Durante un tutorial corto, el jugador aprende a moverse, a propulsarse con el extintor y a averiar un computador. Al final del tutorial aparece la Mastermind: los monitores se encienden solos, cambian las luces y los computadores empiezan a activar peligros. El oficinista avanza averiando computadores hasta la sala de servidores, donde está la Mastermind.

| Momento | Experiencia propuesta |
|---|---|
| Inicio | Pantalla principal con el título y opción para empezar. Ambiente de oficina feliz y ordenada. |
| Tutorial | Tramo seguro que enseña caminar, saltar, propulsarse y averiar un computador pequeño "de práctica". |
| Revelación | La Mastermind aparece al cierre del tutorial. Cambian luces, colores y música; habla por primera vez. |
| Nivel principal | Recorrido con plataformas, peligros activados por computadores, checkpoints y diálogos de la IA. |
| Sala de la Mastermind | Jefe final estático, protegido por computadores pequeños (ver sección 6). |
| Final | Al destruir la Mastermind se abre la salida: pantalla de victoria. Al perder todos los corazones: pantalla de derrota con opción de reintentar. |

## 4. Bucle de juego

1. Leer el obstáculo y elegir una ruta entre plataformas, muebles y peligros.
2. Apuntar el extintor y disparar; el chorro empuja al personaje en la dirección contraria.
3. Administrar la carga del extintor: se gasta al disparar y se recupera al tocar el suelo.
4. Rociar los computadores para averiarlos. Cada computador averiado desactiva el peligro que controlaba.
5. Avanzar entre checkpoints, escuchar a la IA reaccionar y llegar a la Mastermind.

**Tensión central:** el mismo chorro que ataca también empuja. Para mantener el chorro sobre un objetivo hay que estar apoyado en el suelo o en una pared, o corregir la posición en el aire. Esto hace interesante incluso averiar un computador pequeño.

## 5. El extintor

| Aspecto | Valor provisional |
|---|---|
| Propulsión | Mientras se dispara, se aplica al personaje un impulso en dirección contraria al chorro. |
| Carga | Barra de carga visible. Disparar la gasta; tocar el suelo la recarga rápido. **Punto de partida:** ~1 segundo de chorro continuo por salto. Ajustar con pruebas. |
| Apuntado | 8 direcciones combinando flechas (↑, ↓, ←, →, y diagonales como ↑+→). Disparar hacia abajo funciona como un súper salto. |
| Daño | El chorro (partículas blancas) daña a los computadores que toca. |
| Efecto visual | Partículas o nube blanca que se dispersa; leve sacudida de cámara al impulsarse. |

La carga limitada es parte del núcleo: sin ella el jugador vuela sin límite y las plataformas pierden sentido. Su valor define el diseño de cada salto del nivel.

## 6. Enemigos: computadores y la Mastermind

### Computadores pequeños

- Se averían con un chorro corto (~0,5 segundos acumulados).
- Cada uno controla un peligro cercano: puerta bloqueada, cable con corriente, láser, impresora que dispara papel, etc. Al averiarlo, el peligro se desactiva.
- Al averiarse deben comunicarlo con claridad: humo, chispas, pantalla con glitch y un sonido.
- Contador en pantalla de cuántos computadores obligatorios faltan en la zona.

### La Mastermind (jefe final)

- **No se mueve.** Es un gran servidor o pantalla al fondo de la sala final. Así el jefe es barato de implementar: no necesita IA de combate.
- **Escudo:** está protegida por un escudo ligado a los computadores pequeños de la sala (propuesta: 3). Cada computador averiado debilita el escudo; cuando caen todos, queda vulnerable.
- **Defensa:** mientras tiene escudo, activa peligros por turnos (por ejemplo, cables electrificados en el suelo o ráfagas de papel) con un patrón simple y predecible.
- **Golpe final:** con el escudo abajo, se necesitan ~3 segundos acumulados de chorro. La Mastermind parpadea en rojo y reacciona en cada impacto.
- **Derrota de la Mastermind:** explosión de humo, se apagan las pantallas y se abre la salida del edificio.

## 7. Reglas de juego

| Regla | Valor provisional |
|---|---|
| Victoria | Destruir a la Mastermind y salir por la puerta que se abre. |
| Peligros | Tocar un peligro (pinchos o equivalente) quita **1 corazón** y devuelve al último checkpoint. Invulnerabilidad breve al reaparecer. |
| Corazones | **3 corazones.** Al perder todos: pantalla de derrota y reinicio **del nivel**. Ajustar con pruebas. |
| Checkpoints | Al tocarlos, se convierten en el punto de reaparición. Los computadores ya averiados **se mantienen averiados** al reaparecer. |
| Pausa | **Esc** o **P** abre Continuar, Reiniciar nivel y Volver al inicio. El juego queda congelado mientras está pausado. |
| Derrota | Reiniciar el nivel o volver al inicio. No se necesita guardado persistente. |

## 8. Controles

| Tecla | Acción |
|---|---|
| **A / D** | Caminar a izquierda / derecha |
| **W** | Saltar |
| **S** | Bajar por una plataforma, solo si el nivel lo necesita |
| **Flechas** (y combinaciones) | Apuntar y disparar el extintor en 8 direcciones |
| **Esc / P** | Pausar o reanudar |
| **R** | Reiniciar después de la derrota (opcional) |

Ya no se necesita una tecla de interacción: todo se resuelve con el extintor. **A validar en el prototipo:** que apuntar con flechas mientras se camina con WASD sea cómodo.

## 9. Diálogos dinámicos de la IA

La Mastermind reacciona a lo que hace el jugador con frases generadas por la API de OpenAI (el equipo tiene créditos de API). Es un punto fuerte de originalidad, pero el juego **nunca debe depender de la API para funcionar**.

### Eventos que generan diálogo

| Evento | Ejemplo de contexto enviado |
|---|---|
| Revelación (fin del tutorial) | Primera aparición; el jugador acaba de aprender a usar el extintor. |
| Computador averiado | Cuántos quedan, cuánto tardó el jugador. |
| Muerte del jugador | Con qué peligro murió, cuántas veces murió en el mismo lugar. |
| Entrada a la sala de la Mastermind | Corazones restantes, tiempo de partida. |
| Escudo destruido / Mastermind derrotada | Momento de desesperación o despedida. |

### Arquitectura

1. **Primero:** una función `obtenerDialogo(evento, contexto)` que devuelve frases **escritas a mano** (varias por evento, elegidas al azar). Con esto el juego está completo.
2. **Después del hito de las 14:00:** la misma función llama a un servidor mínimo que consulta la API. Si la respuesta tarda más de ~2 segundos o falla, se usa la frase escrita a mano.
3. **La clave de API nunca va en el navegador ni en el repositorio.** Un servidor pequeño (Node, ~20 líneas) la lee desde un archivo `.env`, que está en `.gitignore`. El repositorio incluye un `.env.example` y el README explica que sin clave el juego usa los diálogos fijos.
4. Las frases se piden **en segundo plano** y se muestran en un globo o monitor cuando llegan; la acción nunca se pausa para esperar.

### Reglas del prompt

- Personalidad fija de la Mastermind según la sección 2: amabilidad corporativa, obsesión por la productividad y desesperación creciente al perder el control.
- Respuestas en español, máximo ~15 palabras, sin groserías.
- Usar un modelo pequeño y rápido; el costo por partida es mínimo.

## 10. Alcance

### Imprescindible

- Pantalla de inicio.
- Tutorial corto integrado al recorrido, con un computador de práctica.
- Aparición de la IA al terminar el tutorial.
- Un nivel principal que se pueda completar.
- Movimiento, salto, propulsión y carga limitada del extintor; apuntado en 8 direcciones.
- Computadores pequeños que se averían con el chorro y desactivan peligros.
- La Mastermind como jefe final estático con escudo.
- Peligros, 3 corazones, al menos un checkpoint y salida.
- Diálogos de la IA con frases escritas a mano.
- Menú de pausa, victoria, derrota y reinicio.
- Instrucciones de controles visibles.

### Extras si sobra tiempo (en este orden)

1. Diálogos dinámicos con la API (con respaldo a frases fijas).
2. Mejoras de arte, animación, efectos y sonido.
3. Ajustes de dificultad y control después de pruebas.
4. Más variedad de peligros controlados por computadores.
5. Segundo nivel corto.

### Fuera del alcance

- Multijugador, inventario, varias armas, jefes que se mueven, muchos niveles, guardado persistente, historia extensa y generación procedural.

Aunque la idea contempla uno o dos niveles, conviene integrar primero una ruta completa. El tutorial forma parte del mismo nivel; solo añadir otro después de validar inicio, juego y cierre.

## 11. Arte y sonido

- Hacer que el protagonista, el chorro del extintor, los computadores, la Mastermind, los peligros, el checkpoint y la salida se distingan de inmediato.
- Antes de la revelación: colores alegres, escritorios ordenados y ambiente tranquilo.
- Después: iluminación fría o roja, pantallas alteradas y cambios visibles causados por la IA.
- Computadores averiados: humo, chispas y pantalla con glitch o apagada.
- Usar formas simples o pixel art consistente. Priorizar que se entienda el juego sobre producir mucho arte.
- Audio mínimo: ambiente de oficina, chorro del extintor, daño, checkpoint, computador averiado, voz o sonido de la IA al hablar, golpe a la Mastermind y cierre de victoria o derrota.
- Registrar en el repositorio los créditos y licencias de recursos externos. Si no hay tiempo para comprobar una licencia, usar recursos propios o claramente redistribuibles.

## 12. Tecnología

### Recomendación

**Phaser 3.90.0 + JavaScript para navegador.** Es lo que mejor manejan los asistentes de código como Codex: todo es código de texto, hay muchísimos ejemplos públicos y el resultado se juega en el navegador sin instalar nada. El tutorial oficial de Phaser 3 cubre justo un personaje que corre y salta entre plataformas con físicas arcade. Fijar la versión evita mezclar ejemplos de distintas generaciones.

Phaser 4 ya está disponible, pero para una hackathon de pocas horas una versión estable y con muchos ejemplos importa más que la más nueva. Godot 4 es buena alternativa solo si alguien del equipo ya lo domina: usa archivos de escena y un editor visual, que son más difíciles de manejar para la IA.

No elegir Phaser AE solo por su enfoque para IA sin revisar antes sus condiciones: es un motor separado de Phaser 4 y no es open source, mientras que el evento pide publicar el código del juego bajo una licencia open source.

### Piezas del proyecto

| Pieza | Propuesta |
|---|---|
| Juego | Phaser 3.90.0 + JavaScript, servido como archivos estáticos (por ejemplo con Vite). |
| Servidor de diálogos | Node con un único endpoint que llama a la API de OpenAI. Opcional: el juego funciona sin él. |
| Secretos | `.env` (ignorado por git) + `.env.example` en el repositorio. |

### Referencias oficiales

- [Tutorial de plataformas de Phaser](https://docs.phaser.io/phaser/getting-started/making-your-first-phaser-game)
- [Versiones de Phaser](https://phaser.io/download/archive)
- [Primer juego 2D con Godot](https://docs.godotengine.org/en/stable/getting_started/first_2d_game/index.html)

## 13. Plan de trabajo hacia las 16:00

Las horas siguientes son una sugerencia de planificación desde las 10:36 indicadas por el equipo, no un horario oficial del evento.

| Hora límite | Resultado esperado |
|---|---|
| 11:00 | Confirmar motor, tono de la IA, responsables y valores iniciales (carga del extintor, corazones). |
| 12:00 | Prototipo en una sala simple: movimiento, salto, chorro en 8 direcciones, retroceso y carga. Comprobar si propulsarse se siente entretenido. |
| 13:00 | Computadores pequeños que se averían y desactivan peligros. Corazones y checkpoint. |
| 14:00 | Recorrido completo con gráficos temporales: tutorial, revelación, nivel, Mastermind, salida. Diálogos con frases escritas a mano. |
| 15:00 | Inicio, pausa, victoria y derrota. Arte y audio mínimos. Diálogos dinámicos con la API, si todo lo anterior funciona. |
| 16:00 | Corte interno: jugar de principio a fin y corregir bloqueos. Después, solo cambios pequeños y seguros. |
| 19:00 | Fin de la jornada según el adjunto; confirmar la presentación y entrega final. |

## 14. Entrega y evaluación

El evento solicita un prototipo funcional y jugable, un repositorio público con licencia open source, instrucciones para ejecutarlo e identificación de recursos de terceros y sus licencias.

- Incluir en el README una descripción breve, controles, requisitos y pasos exactos para ejecutar el juego, con y sin clave de API.
- Añadir una licencia open source para el código y verificar la licencia de cada recurso externo.
- Comprobar que **ninguna clave de API** quedó en el repositorio antes de publicarlo.
- Probar el proyecto en otro equipo o en un entorno limpio, si el tiempo alcanza.
- Mantener un archivo **`ITERACIONES.md`** con una línea por cambio: qué se probó, cómo se sintió y qué se cambió. Es la evidencia del criterio "trabajo e iteración con Codex" y sirve como guion para la presentación.

## 15. Decisiones pendientes

| Prioridad | Decisión | Punto de partida recomendado |
|---|---|---|
| Ahora | Equipo y responsables | Hasta 4 integrantes; repartir según habilidades (código, arte, sonido, diseño de nivel y pruebas). |
| Ahora | Confirmar tecnología | Phaser 3.90.0 + JavaScript, salvo que alguien ya domine Godot. |
| Ahora | Carga del extintor | ~1 segundo de chorro por salto, recarga al tocar el suelo. Ajustar en el prototipo. |
| Pronto | Peligros que activa cada computador | Empezar con 2 tipos: puerta bloqueada y cable con corriente. |
| Pronto | Patrón de ataque de la Mastermind | Un peligro por turnos, simple y predecible. |
| Pronto | Horario de presentación o evaluación | Confirmar con la organización; define el margen de pulido después de las 16:00. |
| Pronto | Segundo nivel | No hacerlo obligatorio; añadirlo solo si todo lo esencial funciona. |

## Definición mínima para empezar

> **Título y tutorial corto con revelación de la IA; una ruta jugable; moverse, saltar y propulsarse con el extintor de carga limitada; averiar computadores pequeños con el chorro para desactivar peligros; 3 corazones y un checkpoint; destruir a la Mastermind cuando caiga su escudo; escapar por la salida; mostrar victoria, derrota y reinicio. Diálogos de la IA con frases fijas, y dinámicos con la API solo si sobra tiempo.**

El tono de la IA y la identidad de Felipito quedan definidos en la sección 2 (T02). Los valores exactos y el reparto de responsabilidades quedan pendientes hasta que el equipo los confirme.
