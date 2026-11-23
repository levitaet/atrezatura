import Phaser from 'phaser';
import { COMPUTADOR, TAMANO_CELDA } from '../config.js';
import { numeroDanio } from './danio.js';

const TEXTURA_HUMO = 'humo-temp';
const COLOR = {
  normal: 0xffffff,
  ia: 0xffc7cb, // después de la revelación (T18)
  averiado: 0x3a4150,
  puerta: 0xe7ac65,
  cable: 0xdf925e,
  apagado: 0x4b5563
};

/**
 * T14: computadores pequeños (c) que se averían con el chorro del extintor.
 * T15: puertas (D) y cables (~) controlados por computadores.
 *
 * Reglas:
 * - Un computador se avería tras COMPUTADOR.resistencia segundos acumulados de chorro.
 * - Cada puerta y cada cable lo controla el computador más cercano del mapa. Al averiarlo,
 *   la puerta se abre y el cable deja de hacer daño.
 * - La puerta bloquea su columna completa hacia arriba, hasta el primer bloque sólido (#)
 *   o el techo del mapa: no se puede saltar por encima.
 * - Los computadores averiados siguen averiados al reaparecer; reiniciar el nivel los repara.
 *
 * Contrato con otras tareas:
 * - `escena.computadores`: lista de { objeto, x, y, averiado, controla, limites }.
 * - Eventos de escena: 'computador-averiado' (computador) y 'computadores' (restantes).
 * - `escena.estado.computadoresRestantes` para el HUD (T26).
 * Requiere que conectarCorazones (T16) ya haya creado `escena.peligros`.
 */
export function conectarComputadores(escena) {
  const { jugador, nivel, estado } = escena;
  const lado = TAMANO_CELDA;
  crearTexturaHumo(escena);

  const computadores = (nivel.entidades.get('c') ?? []).map((objeto) => ({
    objeto,
    x: objeto.x,
    y: objeto.y,
    vida: COMPUTADOR.resistencia,
    averiado: false,
    golpeadoHasta: -Infinity,
    controla: [],
    limites: objeto.getBounds()
  }));
  escena.computadores = computadores;
  estado.computadoresRestantes = computadores.length;

  // --- T15: puertas y cables
  const puertas = escena.physics.add.staticGroup();
  for (const marcador of nivel.entidades.get('D') ?? []) {
    const puerta = crearPuerta(escena, marcador, nivel.solidos);
    puertas.add(puerta.cuerpo);
    asignarAlMasCercano(computadores, puerta);
  }
  escena.physics.add.collider(jugador, puertas);

  for (const marcador of nivel.entidades.get('~') ?? []) {
    const zona = escena.add.zone(marcador.x, marcador.y + lado / 4, lado - 4, lado / 2).setData('tipo', 'cable');
    escena.peligros.add(zona);
    // Parpadeo eléctrico mientras está activo.
    const parpadeo = escena.tweens.add({
      targets: marcador.list[0],
      alpha: { from: 1, to: 0.45 },
      duration: 90,
      yoyo: true,
      repeat: -1,
      repeatDelay: 140
    });
    const cable = {
      tipo: 'cable',
      x: marcador.x,
      y: marcador.y,
      desactivar() {
        parpadeo.stop();
        zona.body.enable = false;
        marcador.list[0].setFillStyle(COLOR.apagado).setAlpha(1);
      }
    };
    asignarAlMasCercano(computadores, cable);
  }

  // --- T14: daño por chorro, en cada paso de física (igual que el extintor)
  const paso = (delta) => {
    const extintor = jugador.extintor;
    if (!extintor.disparando) return;
    for (const c of computadores) {
      if (c.averiado || !extintor.alcanza(c.limites)) continue;
      c.vida -= delta;
      numeroDanio(escena, c, c.x, c.y - lado / 2);
      c.golpeadoHasta = jugador.reloj + 90;
      if (c.vida <= 0) averiar(c);
    }
  };
  // Guardar el mundo: al cerrar la escena, escena.physics.world ya es null cuando corre la limpieza.
  const mundo = escena.physics.world;
  mundo.on('worldstep', paso);

  // --- Dibujo: el computador tiembla y se aclara mientras lo rocían
  let colorBase = COLOR.normal;
  const dibujar = () => {
    for (const c of computadores) {
      if (c.averiado) continue;
      const golpeado = jugador.reloj < c.golpeadoHasta;
      c.objeto.x = golpeado ? c.x + Phaser.Math.Between(-2, 2) : c.x;
      if (golpeado && Math.floor(jugador.reloj / 60) % 2 === 0) c.objeto.setTintFill(0xe0efff);
      else c.objeto.setTint(colorBase);
    }
  };
  escena.events.on('update', dibujar);

  // T18: después de la revelación los monitores muestran a la IA.
  const alRevelar = () => { colorBase = COLOR.ia; };
  escena.events.on('revelacion', alRevelar);

  escena.events.once('shutdown', () => {
    mundo.off('worldstep', paso);
    escena.events.off('update', dibujar);
    escena.events.off('revelacion', alRevelar);
  });

  function averiar(c) {
    c.averiado = true;
    numeroDanio(escena, c, c.x, c.y - lado, true);
    c.vida = 0;
    c.objeto.x = c.x;
    c.objeto.setTint(COLOR.averiado).setAlpha(0.7);

    // Chispas y humo temporales hasta el arte de Rocío (T22).
    const chispas = escena.add.particles(c.x, c.limites.centerY, 'chorro-temp', {
      emitting: false,
      speed: { min: 80, max: 220 },
      lifespan: 320,
      scale: { start: 0.7, end: 0 },
      tint: 0xffd34d
    }).setDepth(5);
    chispas.explode(16);
    escena.time.delayedCall(600, () => chispas.destroy());
    escena.add.particles(c.x, c.limites.top, TEXTURA_HUMO, {
      frequency: 160,
      speedY: { min: -45, max: -20 },
      speedX: { min: -12, max: 12 },
      lifespan: 1100,
      scale: { start: 0.5, end: 1.8 },
      alpha: { start: 0.55, end: 0 }
    }).setDepth(4);
    escena.cameras.main.shake(120, 0.004);

    for (const peligro of c.controla) peligro.desactivar();

    estado.computadoresRestantes -= 1;
    // El diálogo va primero: así una reacción más importante (p. ej. 'escudo_roto') lo reemplaza.
    escena.events.emit('dialogo', 'computador_averiado', { restantes: estado.computadoresRestantes });
    escena.events.emit('computador-averiado', c);
    escena.events.emit('computadores', estado.computadoresRestantes);
  }
}

// La puerta ocupa su celda y sube hasta el primer bloque sólido o el techo del mapa.
function crearPuerta(escena, marcador, solidos) {
  const lado = TAMANO_CELDA;
  const abajo = marcador.y + lado / 2;
  let arriba = 0;
  for (const bloque of solidos.getChildren()) {
    // Muros (#): rectángulos que cubren la columna de la puerta (las plataformas finas no cuentan).
    const cubreColumna = Math.abs(bloque.x - marcador.x) <= bloque.width / 2;
    const esMuro = bloque.body.checkCollision.down && cubreColumna;
    const bordeInferior = bloque.y + bloque.height / 2;
    if (esMuro && bordeInferior <= marcador.y && bordeInferior > arriba) arriba = bordeInferior;
  }
  const alto = abajo - arriba;
  const cuerpo = escena.add.rectangle(marcador.x, arriba + alto / 2, lado - 4, alto, COLOR.puerta, 0.85);
  cuerpo.setDepth(marcador.depth - 1);
  return {
    tipo: 'puerta',
    x: marcador.x,
    y: marcador.y,
    cuerpo,
    desactivar() {
      cuerpo.body.enable = false;
      escena.tweens.add({ targets: cuerpo, alpha: 0, duration: 350, onComplete: () => cuerpo.setVisible(false) });
      marcador.list[0].setFillStyle(COLOR.apagado);
    }
  };
}

function asignarAlMasCercano(computadores, peligro) {
  let mejor = null;
  let distancia = Infinity;
  for (const c of computadores) {
    const d = Phaser.Math.Distance.Between(c.x, c.y, peligro.x, peligro.y);
    if (d < distancia) { mejor = c; distancia = d; }
  }
  if (mejor) mejor.controla.push(peligro);
  else console.warn(`[nivel] ${peligro.tipo} sin computador que lo controle: nunca se desactiva.`);
}

function crearTexturaHumo(escena) {
  if (escena.textures.exists(TEXTURA_HUMO)) return;
  const g = escena.make.graphics({ add: false });
  g.fillStyle(0x9aa3ad).fillCircle(6, 6, 6);
  g.generateTexture(TEXTURA_HUMO, 12, 12);
  g.destroy();
}
