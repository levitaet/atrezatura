# MasterIA

## Descripción
Plataformas 2D en el que una persona oficinista se propulsa con un extintor para escapar de una oficina controlada por una IA.

## Cómo jugar o ejecutar
Con Node.js 24 LTS y npm, ejecuta desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

Abre la dirección local que imprime Vite y selecciona **Empezar** para cargar el mapa `base.txt`. Para editarlo o abrir otro mapa, consulta la [leyenda de niveles](src/data/niveles/LEEME.md). También puedes instalar las dependencias con `npm install`.

Para comprobar la versión de producción, ejecuta `npm run build` y después `npm run preview`. La configuración del juego está en `src/config.js`, las escenas en `src/scenes/`, los mapas y diálogos en `src/data/` y los recursos estáticos en `public/assets/`.

## Controles
- Movimiento: **A / D** caminar · **W** saltar (mantener para saltar más alto) · **S** bajar de una plataforma fina
- Extintor: **flechas** para disparar (combínalas para las diagonales). Empuja hacia el lado contrario; la barra sobre el personaje muestra la carga, que se recarga al pisar el suelo sin disparar.
- Plantarse: mantén **Espacio** en el suelo para quedarte quieto mientras disparas (útil para averiar computadores sin que el chorro te empuje). En el aire no tiene efecto.
- Pulsa **Esc** o **P** para pausar o continuar. Desde la pausa también puedes reiniciar el nivel o volver al inicio.
- En los menús, selecciona con el ratón o con **Tab** y **Enter**.

La escena `Juego` expone `ganar()` para el cruce de la salida desbloqueada y `perder()` para el último corazón. Ambas transiciones abren una pantalla desde la que puedes volver a jugar o regresar al inicio.

## Diálogos de la Mastermind

Desde la escena de juego, emite el diálogo cuando ocurra el evento, por ejemplo `this.events.emit('dialogo', 'computador_averiado', { restantes: 2 })`. El monitor muestra una frase durante 4,5 segundos de juego. Un nuevo mensaje reemplaza al anterior. Las pantallas de victoria y derrota muestran su propia frase al abrirse.

El catálogo local está en [src/data/dialogos.json](src/data/dialogos.json). Cada clave contiene una lista de frases en español: `revelacion`, `computador_averiado`, `muerte`, `sala_mastermind`, `escudo_roto` y `victoria`. Benja puede sustituir las frases provisionales o añadir variantes para T20.

## Integrantes
- Nombre y aporte de cada integrante:

## Trabajo con Codex
Breve explicación de cómo usamos Codex, qué probamos y qué mejoramos.

## Código de honor

Declaramos que el trabajo presentado se realizó durante la jornada del lunes 23 de noviembre de 2026. Los materiales desarrollados previamente, propios o de terceros, están disponibles en los enlaces públicos de la tabla.

## Materiales desarrollados previamente
| Recurso | Autor | Enlace público | Licencia | Cambios realizados |
| --- | --- | --- | --- | --- |
| Arte original de Felipito y el extintor (fuentes Resprite) | Rocío · Arte y audio | [docs/arte/fuentes](docs/arte/fuentes/) | Por definir para estos archivos | Fuentes originales conservadas sin cambios |
| Fuentes Resprite adicionales (Noche, Mastermind, Juan Carlos Bodoque y completo italiano) | Por confirmar | [docs/arte/fuentes](docs/arte/fuentes/) | Por definir para estos archivos | Fuentes originales conservadas sin cambios |
| Personaje Juan Carlos Bodoque (homenaje, dibujo pixel art propio del equipo) | Personaje de *31 Minutos* (sus autores) | [docs/arte/fuentes/juan-carlos-bodoque.resprite](docs/arte/fuentes/juan-carlos-bodoque.resprite) | Derechos del personaje de sus autores; se usa como guiño pedido por el evento | Reinterpretación como presentador de la «Nota Verde» en la terminal |
| Tipografía Press Start 2P (paquete @fontsource/press-start-2p 5.3.0) | The Press Start 2P Project Authors (2012) | [fonts.google.com/specimen/Press+Start+2P](https://fonts.google.com/specimen/Press+Start+2P) | SIL Open Font License 1.1 | Sin cambios |
| Tipografía VT323 (paquete @fontsource/vt323 5.3.0) | The VT323 Project Authors (2011) | [fonts.google.com/specimen/VT323](https://fonts.google.com/specimen/VT323) | SIL Open Font License 1.1 | Sin cambios |

## Licencia
Indicar la licencia del código y añadir el archivo LICENSE correspondiente.
Los recursos de terceros conservan sus propias licencias.
