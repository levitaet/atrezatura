# Físicas de movimiento de MasterIA

Para este plataformas de precisión en Phaser 3.90.0, usar **Arcade Physics a 60 pasos por segundo**, un cuerpo rectangular para el personaje y un único controlador que combine carrera, salto y propulsión. Arcade resuelve los contactos con pisos, techos y paredes. El controlador decide cómo responde el personaje. Esta elección encaja con la geometría rectangular del prototipo y permite ajustar cuánto tarda el jugador en frenar, qué altura alcanza y qué huecos puede cruzar.

La propuesta supone un **extintor de chorro sostenido y orientable**. Mientras se mantiene pulsado, acelera al personaje en sentido opuesto a la boquilla. Al soltarlo, cesa el empuje y se conserva la velocidad adquirida. La duración, la recarga y la fuerza son decisiones de diseño que deben validarse en una habitación de prueba.

## Punto de partida en el prototipo

El prototipo local original (`juego.js`) usaba una escena de 800 × 450 px, una ficha de 32 × 40 px, un piso estático y un collider. Usa gravedad de 1000 px/s², carrera de 240 px/s y salto de −460 px/s. Conviene conservar estos valores como referencia para comparar el control antes y después de añadir el extintor.

En el proyecto Phaser/Vite, los valores ajustables se centralizan en [src/config.js](../src/config.js). Los ejemplos siguientes son una propuesta para las tareas de jugador y extintor.

El cambio principal respecto al prototipo está en `cuerpo.setVelocityX(direccion * 240)`. En ese prototipo, soltar A/D pone la velocidad horizontal a cero y mantener una tecla la fija en ±240 en cada fotograma. Ambas acciones borrarían el impulso lateral del extintor. Sustituir esa asignación por una aceleración de carrera y reservar `setVelocityY(-460)` para el instante en que se acepta un salto.

## Reloj físico y entradas

Hacer explícita la configuración del mundo en `new Phaser.Game`:

```js
physics: {
  default: 'arcade',
  arcade: {
    gravity: { x: 0, y: 1000 },
    fixedStep: true,
    fps: 60
  }
}
```

Arcade avanza en pasos de 1/60 s. Un fotograma puede contener cero, uno o varios pasos. Usar px/s para velocidad y px/s² para aceleración. Arcade ya multiplica la aceleración por el tiempo del paso. El controlador solo necesita el tiempo para sus propios cálculos, como determinar la aceleración que permite llegar a una velocidad objetivo sin sobrepasarla. [Implementación del reloj y de la integración en Phaser 3.90.0](https://github.com/phaserjs/phaser/blob/v3.90.0/src/physics/arcade/World.js)

1. Registrar las pulsaciones de salto y guardar el estado de movimiento, disparo y apuntado. Conservar una pulsación breve hasta que el controlador pueda consumirla. Para salto, ignorar las repeticiones automáticas de una tecla mantenida.
2. Inicializar el cuerpo sin empuje en `create()`. Con el ciclo automático de Arcade, usar `worldstep` como punto de decisión para preparar el **siguiente** paso. El evento llega después de resolver las colisiones y entrega la duración del paso en segundos. Leer allí el resultado del paso terminado, actualizar carga y permisos de salto y escribir una sola aceleración para el siguiente. Desconectar el listener al cerrar la escena. [Secuencia de actualización del mundo](https://github.com/phaserjs/phaser/blob/v3.90.0/src/physics/arcade/World.js)
3. Mantener temporizadores de jugabilidad en pasos físicos. Si hay 18 pasos de combustible, habilitar empuje solo cuando quede al menos uno y descontar exactamente un paso después de cada paso con chorro activo. Limpiar entradas pendientes y empuje al reaparecer o perder el foco.

## Carrera y propulsión

En Phaser, X crece hacia la derecha e Y hacia abajo. La dirección de la boquilla apunta **hacia donde sale el chorro**. Normalizarla antes de multiplicar por la fuerza para que la diagonal mantenga la misma magnitud. Con dirección cero, conservar la última orientación válida. Como orientación inicial de prueba, apuntar hacia abajo permite descubrir el ascenso con una sola pulsación.

| Parámetro | Valor inicial | Qué regula |
|---|---:|---|
| Gravedad | 1000 px/s² | Caída y curvatura del salto |
| Carrera objetivo | 240 px/s | Velocidad que puede producir el control lateral por sí solo |
| Aceleración de carrera | 2400 en suelo, 900 en aire (px/s²) | Tiempo necesario para arrancar o invertir la dirección |
| Frenado al soltar en suelo | 3000 px/s² | Distancia hasta detenerse |
| Empuje del extintor | 1800 px/s² | Capacidad de ascenso y rescate |
| Velocidad máxima por eje | 450 horizontal, 650 vertical (px/s) | Alcance máximo y desplazamiento por paso |
| Carga de prueba | 30 pasos (0,50 s) | Duración disponible para propulsarse |

**Regla de carrera.** Con entrada lateral, acelerar hacia ±240. Si el personaje ya supera 240 en el sentido pulsado, el aporte de carrera es cero y el impulso extra se conserva. Pulsar en sentido contrario sí permite frenar. Sin entrada, frenar en suelo y dejar la velocidad horizontal libre en el aire. Durante el disparo, suspender el frenado pasivo del suelo para permitir el arranque lateral desde reposo.

Este fragmento calcula la aceleración horizontal de carrera. `eje` vale −1, 0 o 1. `dt` es la duración en segundos del paso que se prepara, 1/60 con esta configuración.

```js
function aceleracionDeCarrera(vx, eje, enSuelo, conChorro, dt) {
  if (eje === 0) {
    if (!enSuelo || conChorro) return 0;
    return Phaser.Math.Clamp(-vx / dt, -3000, 3000);
  }
  if (vx * eje >= 240) return 0;

  const limite = enSuelo ? 2400 : 900;
  return Phaser.Math.Clamp((240 * eje - vx) / dt, -limite, limite);
}
```

Configurar `cuerpo.setMaxVelocity(450, 650)` al crear la ficha. En cada decisión del controlador, combinar ambos aportes. Aquí `boquilla` es el vector unitario y `conChorro` significa que el botón está pulsado y queda carga.

```js
const carrera = aceleracionDeCarrera(cuerpo.velocity.x, eje, enSuelo, conChorro, dt);
const fuerza = conChorro ? 1800 : 0;
cuerpo.setAcceleration(carrera - boquilla.x * fuerza, -boquilla.y * fuerza);
```

La gravedad del mundo sigue activa. El chorro hacia abajo produce 800 px/s² netos de aceleración ascendente. Desde una caída a 400 px/s se necesitan aproximadamente **0,50 s y 100 px** para frenarla por completo. Los 30 pasos de carga propuestos apenas cubren esa maniobra con el depósito lleno. Si el diseño exige además recuperar altura, aumentar la carga o el empuje, o reducir la velocidad de caída prevista. A 650 px/s, esa misma carga solo reduce la caída a unos 250 px/s. Estas estimaciones suponen un chorro vertical, sin obstáculos.

## Salto, aterrizaje y recarga

- **Salto.** Conceder un salto al aterrizar y consumir el permiso en cuanto se aplica `setVelocityY(-460)`. Con la gravedad actual, el salto libre alcanza aproximadamente 106 px sobre el despegue en 0,46 s según el modelo continuo. La medición en Arcade puede variar unos píxeles por el paso discreto.
- **Tolerancia al borde.** Conservar el permiso durante los primeros 5 pasos tras abandonar una plataforma caminando (unos 83 ms). Un salto voluntario consume ese permiso inmediatamente. Un despegue con el extintor también debería consumirlo si se quiere reservar la tolerancia para salidas accidentales.
- **Salto anticipado.** Recordar una pulsación durante 6 pasos (100 ms). Si el jugador aterriza dentro de esa ventana, consumir la pulsación y el permiso juntos. Mantener W pulsada debe producir un solo salto.
- **Recarga propuesta.** Empezar cada intento con el depósito lleno. Recargar en suelo firme con el botón de disparo suelto. Exigir que el personaje haya vuelto a apoyarse después de despegar y distinguir piso de pared o techo. Evita que rozar una pared o mantener el chorro contra el piso permita recargas ilimitadas en vuelo.

Para el piso estático actual, `blocked.down` informa del contacto inferior. Hay un detalle importante a baja tasa de renderizado: Arcade reinicia las banderas en `Body.preUpdate`, y un fotograma puede contener varios pasos. Para decisiones que exijan un **aterrizaje nuevo**, registrar el contacto superior con el piso desde el callback del collider durante el paso, consumir ese registro en `worldstep` y limpiarlo para el siguiente. Rearmar el salto al pasar de aire a suelo. [Body.preUpdate y banderas de contacto](https://github.com/phaserjs/phaser/blob/v3.90.0/src/physics/arcade/Body.js) · [Orden de colliders y worldstep](https://github.com/phaserjs/phaser/blob/v3.90.0/src/physics/arcade/World.js)

## Colisiones y diseño de niveles

Mantener el cuerpo del personaje independiente del dibujo y de la animación de la boquilla. Registrar los colliders con sólidos una sola vez al crear la escena. Usar solapamientos para metas y peligros que deban activar una acción sin empujar al personaje. Para que caer a un pozo provoque una muerte, desactivar el borde inferior sólido del mundo en ese nivel y colocar el umbral de reaparición bajo la cámara. El prototipo actual cierra los cuatro bordes.

Con los límites propuestos, el personaje puede moverse hasta **7,5 px en X y 10,8 px en Y por paso**. Usar estas cifras para elegir y probar el grosor de plataformas, paredes y zonas de peligro, especialmente en diagonales. Arcade detecta contactos tras mover los cuerpos. Si un sensor muy fino debe detectar todos los cruces, comprobar el trayecto del cuerpo entre posiciones consecutivas o ampliar el sensor en la dirección de cruce. [Movimiento y resolución de colisiones](https://github.com/phaserjs/phaser/blob/v3.90.0/src/physics/arcade/World.js)

## Pruebas de aceptación

Construir una habitación con piso plano, borde, pared, techo bajo y pozo con marcas de altura. Repetir las pruebas a 30, 60 y 120 FPS de renderizado, siempre con física a 60 Hz. Para comparar trayectorias, reproducir entradas en los mismos números de paso y registrar posición del cuerpo, velocidad y carga. Probar también con teclado real para evaluar la respuesta a pulsaciones breves.

| Prueba | Resultado esperado |
|---|---|
| Correr, saltar y soltar las teclas en el aire | El salto conserva el movimiento horizontal. Al aterrizar sin entrada, el frenado lleva la velocidad a cero. |
| Disparar en horizontal y soltar en el aire | La velocidad puede superar 240 px/s. Soltar el botón corta el empuje y mantiene la inercia. |
| Disparar hacia el suelo durante una caída a 400 px/s | Con carga completa, la velocidad vertical llega aproximadamente a cero en 30 pasos, tras caer unos 100 px. |
| Saltar tras un borde y justo antes de aterrizar | La tolerancia acepta el último paso válido y rechaza el siguiente. Una pulsación se consume una sola vez. |
| Agotar la carga rozando una pared | El empuje cesa después de 30 pasos efectivos. La pared no recarga. Aterrizar y soltar el botón sí recarga. |
| Chocar en diagonal con techo y esquinas a velocidad máxima | La ficha queda fuera de los sólidos, sigue respondiendo y no obtiene un salto por tocar lateralmente. |
| Reproducir la misma secuencia a distintas tasas de renderizado | Coinciden el paso de agotamiento y el número de saltos. Investigar diferencias de aterrizaje superiores a un paso físico. |

Ajustar primero el salto y la distancia de frenado en suelo. Después ajustar el rescate vertical con el extintor y, por último, diseñar los huecos según el alcance medido. Así las distancias de los niveles responden al controlador que realmente juega la persona.
