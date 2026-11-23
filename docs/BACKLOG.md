# Backlog de MasterIA

Generado desde el plan de sprints. El tablero vivo está en GitHub Projects; este archivo es la vista de referencia.

## Roles

- **Sofía · Jugador**
- **Ciro · Mundo**
- **Rocío · Arte y audio**
- **Benja · Nivel y datos**
- **Todo el equipo**

## S0 · Arranque · 11:10 – 11:40

*Objetivo:* Proyecto corriendo en todos los computadores, estilo visual y tono acordados.

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T01 | Crear proyecto Phaser 3.90 + Vite | Sofía · Jugador | código, imprescindible | — |
| T02 | Decidir tono de la Mastermind y aspecto del protagonista | Todo el equipo | diseño, imprescindible | — |
| T03 | Guía de estilo: resolución, tiles y paletas | Rocío · Arte y audio | arte, imprescindible | — |
| T04 | Entorno listo + crear ITERACIONES.md | Benja · Nivel y datos | docs, imprescindible | T01 |

## S1 · Moverse y disparar · 11:40 – 12:45

*Objetivo:* El oficinista camina, salta y se propulsa con el extintor en una sala de prueba. Se decide si es divertido.

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T05 | Jugador: caminar, saltar y cámara | Sofía · Jugador | código, imprescindible | T01 |
| T06 | Extintor: apuntar en 8 direcciones y retroceso | Sofía · Jugador | código, imprescindible | T05 |
| T07 | Carga limitada del extintor | Sofía · Jugador | código, imprescindible | T06 |
| T08 | Cargar niveles desde un mapa de texto | Ciro · Mundo | código, imprescindible | T01 |
| T09 | Esqueleto de escenas y pausa | Ciro · Mundo | código, imprescindible | T01 |
| T10 | Diseñar sala de prueba y tutorial en el mapa de texto | Benja · Nivel y datos | diseño, imprescindible | T08 |
| T11 | Sprite del oficinista | Rocío · Arte y audio | arte, imprescindible | T03 |
| T12 | Tileset de oficina (versión feliz) | Rocío · Arte y audio | arte, imprescindible | T03 |
| T13 | Playtest 1: ¿propulsarse es divertido? | Todo el equipo | prueba, imprescindible | T07, T10 |

## S2 · Mundo y enemigos · 12:45 – 14:00

*Objetivo:* HITO 14:00: recorrido completo jugable con gráficos temporales (tutorial, revelación, nivel, Mastermind, salida).

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T14 | Computadores pequeños que se averían con el chorro | Ciro · Mundo | código, imprescindible | T06, T08 |
| T15 | Peligros controlados por computadores: puerta y cable | Ciro · Mundo | código, imprescindible | T14 |
| T16 | Corazones, daño, checkpoints y reaparición | Sofía · Jugador | código, imprescindible | T05, T08, T09 |
| T17 | Mastermind: escudo, ataque y derrota | Sofía · Jugador | código, imprescindible | T14, T16 |
| T18 | Revelación de la IA al final del tutorial | Ciro · Mundo | código, imprescindible | T08, T19 |
| T19 | Sistema de diálogos con frases fijas | Ciro · Mundo | código, imprescindible | T09 |
| T20 | Escribir los diálogos fijos de la Mastermind | Benja · Nivel y datos | diseño, imprescindible | T02 |
| T21 | Diseñar el nivel completo en el mapa de texto | Benja · Nivel y datos | diseño, imprescindible | T10, T15 |
| T22 | Sprites de computadores y Mastermind | Rocío · Arte y audio | arte, imprescindible | T03 |
| T23 | Peligros, checkpoint, salida y chorro | Rocío · Arte y audio | arte, imprescindible | T03 |
| T24 | Variante "IA" de la oficina | Rocío · Arte y audio | arte | T12 |

## S3 · Juego completo · 14:00 – 15:00

*Objetivo:* Pantallas, HUD, arte y audio integrados. Diálogos dinámicos solo si todo lo anterior funciona.

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T25 | Integrar sprites y animaciones | Sofía · Jugador | código, arte, imprescindible | T11, T12, T22, T23 |
| T26 | HUD y pantallas de inicio, victoria y derrota | Ciro · Mundo | código, arte, imprescindible | T09, T16 |
| T27 | Música: oficina feliz y tema IA | Rocío · Arte y audio | audio, imprescindible | T02 |
| T28 | Efectos de sonido | Rocío · Arte y audio | audio, imprescindible | — |
| T29 | Integrar música y efectos | Ciro · Mundo | código, audio, imprescindible | T27, T28 |
| T30 | Diálogos dinámicos con la API de OpenAI | Sofía · Jugador | código, extra | T19, T31 |
| T31 | Prompt de personalidad de la Mastermind | Benja · Nivel y datos | diseño, extra | T02 |
| T32 | Playtest 2: partida completa con checklist | Benja · Nivel y datos | prueba, imprescindible | T21, T26 |

## S4 · Pulido · 15:00 – 16:00

*Objetivo:* Congelar funciones a las 15:00. Solo bugs, ajustes y efectos. 16:00 corte interno.

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T33 | Corregir bugs del playtest | Todo el equipo | código, imprescindible | T32 |
| T34 | Efectos de "juice" | Sofía · Jugador | código, extra | T25 |
| T35 | Ajustar dificultad | Benja · Nivel y datos | diseño, prueba | T32 |
| T36 | Build de producción y prueba en entorno limpio | Ciro · Mundo | código, imprescindible | T33 |

## S5 · Entrega · 16:00 – cierre

*Objetivo:* README, licencias, revisión de claves y demo preparada.

| ID | Tarea | Responsable | Etiquetas | Depende de |
|---|---|---|---|---|
| T37 | README final | Benja · Nivel y datos | docs, imprescindible | T36 |
| T38 | Créditos y licencias de recursos | Rocío · Arte y audio | docs, imprescindible | — |
| T39 | Revisar que no haya claves ni secretos en el repo | Ciro · Mundo | docs, imprescindible | — |
| T40 | Preparar la demo | Todo el equipo | docs, imprescindible | T37 |
| T41 | Segundo nivel corto | Todo el equipo | diseño, extra | T36 |
