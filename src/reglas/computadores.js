import Phaser from 'phaser';
import { COMPUTADOR, TAMANO_CELDA } from '../config.js';
import { numeroDanio } from './danio.js';

const TEXTURA_HUMO = 'humo-temp';
const COLOR = {
  normal: 0xffffff,
  ia: 0xffc7cb, // después de la revelación (T18)
  averiado: 0x3a4150,
  puerta: 0xe7ac65,
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
    if (puerta.muro) puertas.add(puerta.muro);
    asignarAlMasCercano(computadores, puerta);
  }
  escena.physics.add.collider(jugador, puertas);

  for (const marcador of nivel.entidades.get('~') ?? []) {
    const ancho = marcador.getData('anchoAgua') - 4;
    const zona = escena.add.zone(marcador.x, marcador.y + lado / 4, ancho, lado / 2).setData('tipo', 'cable');
    escena.peligros.add(zona);
    const cable = {
      tipo: 'cable',
      x: marcador.x,
      y: marcador.y,
      desactivar() {
        zona.body.enable = false;
        // El cuadro 1 contiene solo agua, sin arcos eléctricos.
        marcador.stop().setFrame(1).setTint(0x889aab).setAlpha(0.75);
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
  // Al acercarse a un computador que cierra una puerta, la Mastermind le corta el paso (una vez).
  const custodios = computadores.filter((c) => c.controla.some((p) => p.tipo === 'puerta'));
  const distanciaAviso = COMPUTADOR.distanciaAvisoPuerta * lado;
  const dibujar = () => {
    for (const c of custodios) {
      if (c.averiado || c.avisoPuerta || Math.abs(jugador.x - c.x) > distanciaAviso) continue;
      c.avisoPuerta = true;
      escena.events.emit('dialogo', 'puerta_cerrada', {});
    }
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
  // Puerta de seguridad de 2 celdas de alto y, encima, un muro hasta el primer bloque o el techo:
  // el muro es sólido siempre (no se puede saltar por encima); la puerta se abre al averiar
  // su computador. Dibujo provisorio con bloques.
  const altoPuerta = Math.min(lado * 2, abajo - arriba);
  const ancho = lado - 4;
  marcador.setVisible(false);
  const cuerpo = escena.add.rectangle(marcador.x, abajo - altoPuerta / 2, ancho, altoPuerta);
  const altoMuro = abajo - altoPuerta - arriba;
  const muro = altoMuro > 0 ? escena.add.rectangle(marcador.x, arriba + altoMuro / 2, ancho, altoMuro) : null;

  const x0 = marcador.x - ancho / 2;
  const fondo = escena.add.graphics().setDepth(marcador.depth - 1);
  if (muro) {
    fondo.fillStyle(0x4a5566).fillRect(x0, arriba, ancho, altoMuro); // muro de concreto
    fondo.fillStyle(0x3b4452);
    for (let y = arriba + 8; y < arriba + altoMuro; y += 16) fondo.fillRect(x0, y, ancho, 2);
  }
  const yPuerta = abajo - altoPuerta;
  fondo.fillStyle(0x2b3038).fillRect(x0 - 2, yPuerta - 4, ancho + 4, altoPuerta + 4); // marco
  const hoja = escena.add.graphics().setDepth(marcador.depth - 1);
  hoja.fillStyle(0x7a8699).fillRect(x0 + 2, yPuerta, ancho - 4, altoPuerta); // hoja metálica
  hoja.fillStyle(0x5d6878).fillRect(x0 + 5, yPuerta + 6, ancho - 10, altoPuerta / 2 - 10); // panel
  hoja.fillStyle(0x5d6878).fillRect(x0 + 5, yPuerta + altoPuerta / 2 + 2, ancho - 10, altoPuerta / 2 - 8);
  hoja.fillStyle(0xd7dde5).fillRect(x0 + ancho - 9, yPuerta + altoPuerta / 2 - 2, 4, 6); // manilla
  const luz = escena.add.rectangle(marcador.x, yPuerta - 8, 10, 5, 0xfe6960).setDepth(marcador.depth); // acceso denegado
  const parpadeo = escena.tweens.add({ targets: luz, alpha: 0.35, duration: 300, yoyo: true, repeat: -1 });
  return {
    tipo: 'puerta',
    x: marcador.x,
    y: marcador.y,
    cuerpo,
    muro,
    desactivar() {
      cuerpo.body.enable = false;
      parpadeo.stop();
      luz.setAlpha(1).setFillStyle(0x7dffa8); // acceso permitido
      // la hoja sube y se esconde en el muro
      escena.tweens.add({ targets: hoja, y: -altoPuerta, alpha: 0, duration: 450, ease: 'Quad.easeIn' });
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
