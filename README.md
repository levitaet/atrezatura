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
| Imagen, música, sonido, fuente o biblioteca | | | | |

## Licencia
Indicar la licencia del código y añadir el archivo LICENSE correspondiente.
Los recursos de terceros conservan sus propias licencias.
