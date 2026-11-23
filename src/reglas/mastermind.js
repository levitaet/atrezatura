import Phaser from 'phaser';
import { MASTERMIND, TAMANO_CELDA } from '../config.js';
import { mostrarTerminal } from './terminal.js';
import { numeroDanio } from './danio.js';
import { crearBarraJefe } from './barraJefe.js';
import { musica, ponerMusica, velocidadMusica } from '../musica.js';

const COLOR = {
  pantalla: 0x1d2433,
  borde: 0xb885ed, // igual que la M en crearNivel.js
  golpe: 0xfe6960,
  apagada: 0x0b0f16,
  escudo: 0x8fdfc7,
  aviso: 0xffd34d,
  descarga: 0xe8f4ff
};

/**
 * T17: la Mastermind (M) y la salida (S).
 *
 * - Es un monitor gigante y fijo (3 × 3 celdas) apoyado sobre la celda M. Es sólida.
 * - Escudo: lo forman los computadores a menos de MASTERMIND.radioSala celdas (en horizontal).
 *   Se debilita con cada uno que se avería; mientras quede uno, el chorro no la daña.
 * - Ataque: cuando el jugador entra a la sala, electrifica el suelo de la sala por turnos
 *   (aviso amarillo → descarga → calma). Sin escudo se desespera y ataca más seguido.
 * - Sin escudo, MASTERMIND.resistencia segundos de chorro la dejan sin vida y se abre su terminal
 *   (minijuego de terminal.js). Hackearla la destruye; si se acaba el tiempo, recupera vida.
 * - Al destruirla se abre la salida. Cruzar la salida abierta gana el nivel.
 * - Si el mapa no tiene M, la salida está abierta desde el principio.
 *
 * Eventos de escena: 'escudo' (computadores que quedan), 'mastermind-derrotada'.
 * Estado: escena.estado.mastermindDerrotada.
 * Requiere conectarCorazones (peligros) y conectarComputadores (escena.computadores).
 */
export function conectarMastermind(escena) {
  const { jugador, nivel, estado } = escena;
  const lado = TAMANO_CELDA;
  const marcador = (nivel.entidades.get('M') ?? [])[0];
  const salidas = nivel.entidades.get('S') ?? [];

  estado.mastermindDerrotada = !marcador;
  const salida = conectarSalidas(escena, salidas, estado);
  if (!marcador) {
    salida.abrir();
    return;
  }

  // --- Cuerpo
  const ancho = lado * 3;
  const alto = lado * 3;
  const piso = marcador.y + lado / 2;
  const cx = marcador.x;
  const cy = piso - alto / 2;
  marcador.setVisible(false);

  const pantalla = escena.add.rectangle(cx, cy, ancho, alto, COLOR.pantalla).setStrokeStyle(4, COLOR.borde);
  escena.physics.add.existing(pantalla, true);
  escena.physics.add.collider(jugador, pantalla);
  // El dibujo ocupa la parte superior del lienzo de 128 px. El cuerpo sólido conserva sus dimensiones.
  const textura = escena.textures.get('mastermind');
  if (!textura.has('monitor')) textura.add('monitor', 0, 2, 1, 119, 93);
  const cara = escena.add.image(cx, cy, 'mastermind', 'monitor').setScale((ancho - 6) / 119);
  const escudo = escena.add
    .ellipse(cx, cy, ancho + 40, alto + 40, COLOR.escudo, 0.12)
    .setStrokeStyle(3, COLOR.escudo, 0.9);
  const barraJefe = crearBarraJefe(escena, { nombre: 'MASTERMIND', titulo: 'IA que tomó el control de la oficina' });
  const limites = new Phaser.Geom.Rectangle(cx - ancho / 2, cy - alto / 2, ancho, alto);

  // --- Escudo
  const radio = MASTERMIND.radioSala * lado;
  const delEscudo = escena.computadores.filter((c) => Math.abs(c.x - cx) <= radio);
  const restantesEscudo = () => delEscudo.filter((c) => !c.averiado).length;
  let escudoActivo = restantesEscudo() > 0;
  estado.escudo = restantesEscudo();
  if (!escudoActivo) escudo.setVisible(false);

  const alAveriar = (c) => {
    if (!delEscudo.includes(c) || !escudoActivo) return;
    estado.escudo = restantesEscudo();
    escena.events.emit('escudo', estado.escudo);
    escudo.setAlpha(0.35 + 0.65 * (estado.escudo / delEscudo.length));
    if (estado.escudo === 1) escena.events.emit('dialogo', 'queda_una_pura', {});
    if (estado.escudo === 0) romperEscudo();
  };
  escena.events.on('computador-averiado', alAveriar);

  function romperEscudo() {
    escudoActivo = false;
    escena.tweens.add({ targets: escudo, scale: 1.4, alpha: 0, duration: 400, onComplete: () => escudo.setVisible(false) });
    escena.cameras.main.shake(200, 0.006);
    escena.events.emit('dialogo', 'escudo_roto', {});
  }

  // --- Ataque: suelo electrificado de la sala
  const xMin = cx - radio;
  const xMax = cx + radio;
  const descarga = escena.add.zone((xMin + xMax) / 2, piso - 6, xMax - xMin, 12).setData('tipo', 'descarga');
  escena.peligros.add(descarga);
  descarga.body.enable = false;
  const suelo = escena.add.graphics().setDepth(3);
  let fase = 'calma';
  let enSala = false;
  let derrotada = false;

  function calma() {
    if (derrotada) return;
    fase = 'calma';
    descarga.body.enable = false;
    escena.time.delayedCall(escudoActivo ? MASTERMIND.calma : MASTERMIND.calmaDesesperada, avisar);
  }
  function avisar() {
    if (derrotada) return;
    fase = 'aviso';
    escena.time.delayedCall(MASTERMIND.aviso, electrificar);
  }
  function electrificar() {
    if (derrotada) return;
    fase = 'descarga';
    descarga.body.enable = true;
    escena.time.delayedCall(MASTERMIND.descarga, calma);
  }

  // --- Daño por chorro (por paso de física, como los computadores)
  let vida = MASTERMIND.resistencia;
  const objetivoDanio = {}; // para espaciar los números de daño
  let golpeadaHasta = -Infinity;
  const paso = (delta) => {
    if (derrotada || escudoActivo || !jugador.extintor.alcanza(limites)) return;
    vida -= delta;
    numeroDanio(escena, objetivoDanio, cx, cy - alto / 2);
    golpeadaHasta = jugador.reloj + 90;
    if (vida <= 0) hackear();
  };

  // Sin vida: se abre su terminal. El juego queda en pausa mientras se hackea.
  let hackeando = false;
  function hackear() {
    if (hackeando || derrotada) return;
    hackeando = true;
    vida = 0;
    escena.scene.pause();
    mostrarTerminal(escena, {
      alGanar: () => {
        hackeando = false;
        escena.scene.resume();
        derrotar();
      },
      alPerder: () => {
        hackeando = false;
        vida = MASTERMIND.resistencia * MASTERMIND.vidaTrasRestaurar;
        // El monitor ignora diálogos mientras la escena no está activa: esperar a que se reanude.
        escena.events.once('resume', () => escena.events.emit('dialogo', 'hackeo_fallido', {}));
        escena.scene.resume();
      }
    });
  }
  const mundo = escena.physics.world;
  mundo.on('worldstep', paso);

  // --- Por cuadro: entrada a la sala y dibujo
  const actualizar = () => {
    if (!enSala && !derrotada && Math.abs(jugador.x - cx) <= radio) {
      enSala = true;
      estado.enSalaJefe = true;
      escena.events.emit('dialogo', 'sala_mastermind', {});
      barraJefe.mostrar();
      escena.cameras.main.shake(400, 0.008);
      // Música de jefe: si el equipo agrega musica.jefe se usa; si no, la persecución más rápida.
      ponerMusica(musica.jefe ?? musica.persecucion);
      velocidadMusica(musica.jefe ? 1 : MASTERMIND.velocidadMusica);
      calma();
    }
    if (derrotada) return;

    const golpeada = jugador.reloj < golpeadaHasta;
    pantalla.setFillStyle(golpeada && Math.floor(jugador.reloj / 60) % 2 === 0 ? COLOR.golpe : COLOR.pantalla);
    cara.x = golpeada ? cx + Phaser.Math.Between(-3, 3) : cx;
    if (!escudoActivo) cara.setTint(golpeada ? 0xffaaaa : 0xffffff);

    suelo.clear();
    if (fase === 'aviso' && Math.floor(jugador.reloj / 120) % 2 === 0) {
      suelo.fillStyle(COLOR.aviso, 0.55).fillRect(xMin, piso - 4, xMax - xMin, 4);
    } else if (fase === 'descarga') {
      suelo.fillStyle(COLOR.descarga, 0.5 + Math.random() * 0.4).fillRect(xMin, piso - 8, xMax - xMin, 8);
    }

    if (enSala) {
      if (escudoActivo) {
        const n = restantesEscudo();
        barraJefe.actualizar(n / delEscudo.length, true, `ESCUDO · ${n} computador${n === 1 ? '' : 'es'} la protege${n === 1 ? '' : 'n'}`);
      } else {
        barraJefe.actualizar(vida / MASTERMIND.resistencia, false, 'SIN ESCUDO · ¡rocíala!');
      }
    }
  };
  escena.events.on('update', actualizar);

  function derrotar() {
    numeroDanio(escena, objetivoDanio, cx, cy - alto / 2, true);
    derrotada = true;
    estado.mastermindDerrotada = true;
    descarga.body.enable = false;
    suelo.clear();
    barraJefe.derrotada();
    estado.enSalaJefe = false;
    velocidadMusica(1);
    pantalla.body.enable = false;
    pantalla.setFillStyle(COLOR.apagada).setStrokeStyle(4, 0x4b5563);
    cara.setTint(0x647083).setAlpha(0.55).setX(cx);

    // Humo y chispas temporales hasta el arte de Rocío (T22).
    const chispas = escena.add.particles(cx, cy, 'chorro-temp', {
      emitting: false, speed: { min: 120, max: 360 }, lifespan: 500, scale: { start: 1, end: 0 }, tint: 0xffd34d
    }).setDepth(6);
    chispas.explode(40);
    escena.add.particles(cx, cy - alto / 2, 'humo-temp', {
      frequency: 90, speedY: { min: -70, max: -30 }, speedX: { min: -30, max: 30 },
      lifespan: 1400, scale: { start: 1, end: 3 }, alpha: { start: 0.6, end: 0 }
    }).setDepth(5);
    escena.cameras.main.flash(250, 255, 255, 255);
    escena.cameras.main.shake(500, 0.012);

    escena.events.emit('mastermind-derrotada');
    salida.abrir();
  }

  escena.events.once('shutdown', () => {
    velocidadMusica(1);
    mundo.off('worldstep', paso);
    escena.events.off('update', actualizar);
    escena.events.off('computador-averiado', alAveriar);
  });
}

// La salida (S) se cruza para ganar, pero solo cuando está abierta.
function conectarSalidas(escena, salidas, estado) {
  const lado = TAMANO_CELDA;
  const persianas = escena.add.graphics().setDepth(-0.25);
  for (const salida of salidas) {
    if (!estado.mastermindDerrotada) {
      // Cubre el vano del dibujo dejando el rótulo SALIDA a la vista.
      const borde = salida.getTopLeft();
      const x = borde.x + 14;
      const y = borde.y + 10;
      persianas.fillStyle(0x394451).fillRect(x, y, 35, 54);
      for (let fila = y; fila < y + 54; fila += 6) {
        persianas.fillStyle(0x637381).fillRect(x, fila, 35, 1);
        persianas.fillStyle(0x202936).fillRect(x, fila + 4, 35, 2);
      }
    }
    const zona = escena.add.zone(salida.x, salida.y, lado, lado);
    escena.physics.add.existing(zona, true);
    escena.physics.add.overlap(escena.jugador, zona, () => {
      if (estado.mastermindDerrotada) escena.ganar();
    });
  }
  return {
    abrir() {
      persianas.clear();
    }
  };
}
