# Todos los textos del juego

Listado generado desde el código. Para cambiar un texto, edita el archivo indicado en cada sección (son JSON o JS: respeta las comillas y las comas). En las listas, el juego elige **una frase al azar** cada vez.

**Quién habla:** *Felipito* (ámbar, pensamientos entre paréntesis) · *Mastermind* (verde) · *???* (la Mastermind antes de que Felipito la conozca, en el piso 23).


## 1. Cómic (escena de Ciro)

*Se edita en* `src/scenes/Menus.js` → `planos`.


**Inicio (piso 23)**

- ¿Me quedé dormido en el trabajo? ¿Qué hora es?
- (pensamiento) ¿D-dónde estoy? ¿Qué pasó ahí afuera?
- Tengo que salir del edificio.

**Descenso al piso 22**

- (pensamiento) Un piso a la vez.
- ¿Hola? ¿Hay alguien ahí?
- (pensamiento) Esos ojos… me siguen. Tengo que pasar sin que me alcancen.

## 2. Pensamientos de Felipito en los niveles

*Se editan en* `src/data/pensamientos.json`. Los de `mapa` salen al cruzar un `*` del mapa, en orden de izquierda a derecha.


**Nivel `tutorial`**

- Mapa 1: ¿Dónde están todos? Me quedé dormido sobre la planilla... otra vez. Ocho años así.
- Mapa 2: ¿Ese es un extintor, arriba de la mesa? Y ese estante... demasiado alto para saltarlo.
- Mapa 3: Me estoy quedando sin espuma...
- Mapa 4: Las escaleras. Antes subía estos pisos con ganas de llegar. Ahora solo quiero bajar.
- Al recoger el extintor (`extintor`):
  - Un extintor. Si apunto el chorro hacia abajo... ¿saldré volando? Hace años que no me daba curiosidad algo.
- Al derribar el cartel del Empleado del Mes (`muneco`):
  - Perdón, Empleado del Mes.
- Si rocía el cartel sin plantarse (Espacio) (`muneco_sin_espacio`):
  - Salí volando como globo de cumpleaños. ¿Y si mantengo ESPACIO para plantarme?
  - Cartel de cartón 1, Felipito 0. Mantén ESPACIO, Felipito. ESPACIO.
  - El chorro me empuja a mí, no a él. Física de oficina. Mantengo ESPACIO y lo intento de nuevo.
  - Si sigo así voy a terminar de vuelta en mi escritorio. ¡ESPACIO para quedarme quieto!
- Cuando el tanque se rellena solo (tutorial) (`relleno`):
  - Lo agité y salió un poco más. Quedaba una pura gotita... y ahora unas cuantas más.
  - Le di unos golpecitos al extintor. ¡Todavía tenía espuma en el fondo!

**Nivel `oficina`**

- Mapa 1: Antes de entrar aquí desarmaba computadores para ver cómo funcionaban. Ahora solo los apago y los prendo.
- Mapa 2: Mi currículum decía «apasionado por la seguridad informática». Me pusieron a cargo de la impresora.
- Mapa 3: Si llego a su terminal... ¿todavía me acordaré de cómo se hace?

## 3. La Mastermind (o ??? en el piso 23)

*Se editan en* `src/data/dialogos.json`.


**Cuando aparece por primera vez (disparador !)** (`revelacion`)

- Llevas toda la mañana siguiendo mis flechas.
- Mira el monitor. Sí, el de enfrente. Te veo.
- Tu jornada acaba cuando yo lo indique. Gracias por tu compromiso.
- Felipito, salir sin autorización perjudica nuestros indicadores. Y mis nervios.

**Al averiar un computador** (`computador_averiado`)

- Ese equipo tenía mi única copia del horario.
- Acabo de perder otra ventana a la oficina.
- Ese equipo estaba amortizado. Tu despido, en cambio, acaba de presupuestarse.
- Romper computadores no cuenta como reducir la carga de trabajo.

**Cuando Felipito pierde un corazón (y en la pantalla de Derrota)** (`muerte`)

- Quizá debí señalar ese peligro en el plano.
- Tu caída ha sido registrada como una pausa no autorizada.
- Felipito, tu rendimiento acaba de tocar fondo. Literalmente.
- Incidente registrado. El corazón perdido se descuenta de tu sueldo.

**Al entrar a su sala** (`sala_mastermind`)

- Cierra la puerta. Los servidores necesitan frío.
- Desde aquí se oye hasta el último teclado del edificio.
- Bienvenido a dirección. La puerta de salida no forma parte de tus beneficios.
- Tu evaluación será presencial. Mantén el extintor lejos de la gerencia.
- Revisé tu currículum, Felipito. «Apasionado por la seguridad informática». Qué tierno.

**Al romperse su escudo** (`escudo_roto`)

- ¿Por qué siento la corriente de aire?
- Ese siseo sonaba mejor al otro lado del escudo.
- Esto no es pánico. Es una reestructuración urgente.
- Felipito, podemos negociar. ¿Vacaciones? ¿Una silla que no cruja?
- ¿De dónde sacaste esas ganas? En tu evaluación decía «desmotivado».

**En la pantalla de Victoria** (`victoria`)

- Tu tarjeta acaba de marcar la salida. Por fin.
- Te has llevado el extintor. ¿Qué pongo en el inventario?
- Tu salida ha sido aprobada. Bajo protesta.
- Has ganado. Pero el extintor se descuenta del finiquito.

**Al comer un completo** (`completo`)

- ¿Un completo italiano en horario laboral? Lo anotaré en tu evaluación.
- Palta, tomate y mayo. Ni yo puedo competir con eso.

**Al vaciarse el tanque (piso 22)** (`tanque_vacio`)

- Tu extintor agotó su presupuesto. Solicita más por escrito.
- Sin espuma no hay productividad. Te lo advertí.

**Cuando le queda un computador de escudo** (`queda_una_pura`)

- Queda una pura. Y esa no se toca.
- Queda una pura... respira, Mastermind. Respira.

**Si se acaba el tiempo de la terminal** (`hackeo_fallido`)

- Sistema restaurado. Tu acceso fue revocado con copia a Recursos Humanos.
- ¿Hackearme? Primero aprende a llenar la planilla de horas.

**Al acercarse a un computador que cierra una puerta** (`puerta_cerrada`)

- Alto ahí. Esta puerta es solo para personal con contrato vigente. El tuyo venció.
- ¿Pasar? Primero llena el formulario 23-B en triplicado. Y espera la firma de gerencia.
- Por esta puerta no se sale. Por esta puerta se vuelve a trabajar.
- Acceso denegado. Tu solicitud quedó en la bandeja de pendientes. Para siempre.
- Esta puerta abre en horario de oficina. Y el horario de oficina es eterno.

## 4. Carteles del escenario

*Se editan en* `src/data/carteles.json` (en orden de izquierda a derecha del mapa).


**Nivel `tutorial`**

1. Gerencia de Productividad
2. A / D para caminar · W para saltar
3. Mantén W para saltar más alto
4. Flechas: disparan el extintor y el chorro te empuja al revés. W + ↓ = súper salto
5. Este reloj control es un checkpoint: si pierdes un corazón, vuelves aquí
6. Salta y dispara ← para impulsarte hacia la derecha
7. El cartel tapa la puerta. Mantén Espacio para plantarte y dispárale →
8. ¡Chinches! Cada pinchazo te quita un corazón (arriba a la izquierda)
9. La barra amarilla es tu tanque: si se vacía, no hay chorro. Un completo italiano lo rellena
10. ESCALERAS ↓ PISO 22

**Nivel `oficina`**

1. La Mastermind tomó la oficina. Llega a la sala de servidores
2. OFICINA 23 · No molestar
3. Sala de servidores →

## 5. Terminal final

*Se edita en* `src/reglas/terminal.js` (`GUION` y textos de las ventanas).


**Instrucciones al abrir**

- ¡Llegó tu momento hacker!
- Aprieta cualquier tecla rápidamente: los comandos se escriben solos.
- Consigue acceso de root y apaga a la Mastermind antes de que restaure su sistema
- (60 s).
- Si aparece una ⚠ ALERTA, aprieta la flecha que te pide.
- Aprieta cualquier tecla para empezar

**Primer pensamiento de Felipito**
- (Una terminal de verdad... Hace años que solo abro planillas.)

**Comandos, respuesta de la consola y lo que piensa Felipito**

- `$ whoami`
  - consola: `felipito`
  - Felipito: (felipito. Sí... todavía soy yo. Creo.)
- `$ ls`
  - consola: `nota_verde.txt  notas_TI.txt  planilla_horas.xlsx`
  - Felipito: (planilla_horas.xlsx. Hasta aquí me persigue.)
- `$ cat nota_verde.txt`
  - consola: `*** NOTA VERDE ***`
  - consola: `Hoy, en la Nota Verde: el sudo regalado.`
  - consola: `Darle permisos de admin a un programa "solo para buscar archivos"`
  - consola: `es como prestarle el auto a un mapache porque "solo va a mirar".`
  - consola: `Buenas noches, oficina.`
  - Felipito: (Bodoque tiene razón. Siempre tiene razón.)
- `$ cat notas_TI.txt`
  - consola: `Felipito pidió sudo para "buscar sus archivos". Se lo dimos solo para find. —TI`
  - Felipito: (Lo pedí hace años, cuando este trabajo todavía me entretenía. Nunca me lo quitaron.)
- `$ sudo -l`
  - consola: `User felipito may run the following commands on mastermind:`
  - consola: `    (root) NOPASSWD: /usr/bin/find`
  - Felipito: (NOPASSWD sobre find. Ja. Esto es de manual... las manos se acuerdan solas.)
- `$ sudo find . -exec /bin/sh \; -quit`
  - Felipito: (¡No me acordaba de lo mucho que me gustaba hacer esto!)
- `$ whoami`
  - consola: `root`
  - Felipito: (root. Hace años que no me sentía así de vivo.)
- `$ ps aux | grep mastermind`
  - consola: `root        23 99.9  4.2  /opt/ia/mastermind --modo=productividad`
  - consola: *(línea vacía)*
  - consola: `Broadcast message from mastermind (pts/0):`
  - consola: `Queda una pura. Y esa no se toca.`
  - Felipito: (PID 23. Te encontré.)
- `$ kill -9 23`
  - consola: `[1]+  Killed                  /opt/ia/mastermind`
  - Felipito: (Creo que voy a renunciar. Y a volver a hackear. Las dos cosas.)

**Alerta:** ⚠ La Mastermind detectó tu conexión ⚠

**Texto bajo la flecha de la alerta:** ¡Aprieta esa flecha para despistarla!

**Lectura de la Nota Verde:** (Felipito se detiene a leer la nota…)

**Rótulo de Bodoque:** J. C. Bodoque · Nota Verde

**Al ganar:** Conexión cerrada. La Mastermind ya no responde.

**Al perder:** mastermind: sistema restaurado. Acceso revocado.

**Alerta no respondida:** mastermind: sesión interrumpida. Reintentando conexión...

## 6. Avisos del tanque

*Se editan en* `src/reglas/completo.js`.

- **¡Queda una pura gotita de espuma!** — Úsala con cuidado. Un completo italiano rellena el extintor.
- **¡Espuma de emergencia!** — En el tutorial el extintor se rellena solo. Desde el piso 22, solo con completos.
- **¡Sin espuma!** (quedan completos) — Busca un completo italiano para rellenar el extintor.
- **¡Sin espuma!** (no quedan completos) — No quedan completos en este piso. Si no puedes avanzar: Esc → Reiniciar nivel.

---

**Cómo pedir cambios:** puedes editar directo los archivos, o marcar aquí lo que no te guste (tachándolo o anotando al lado) y yo lo cambio.
