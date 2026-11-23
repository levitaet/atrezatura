import { REVELACION, TAMANO_CELDA } from '../config.js';
import Phaser from 'phaser';

/**
 * T18: revelación de la IA al final del tutorial.
 *
 * Al pasar por el disparador (!) —basta con cruzar su columna, aunque sea saltando— ocurre
 * una sola vez: destello y temblor, la oficina se tiñe, cambia el fondo, los monitores de los
 * computadores muestran a la IA y la Mastermind habla por primera vez.
 *
 * Contrato con otras tareas:
 * - Evento de escena 'revelacion' (sin argumentos): la música cambia aquí (T29) y los
 *   computadores cambian de color (T14).
 * - `escena.estado.revelado` (true/false).
 * - `escena.revelar()` la dispara a mano (útil para probar o si un nivel no tiene !).
 */
export function conectarRevelacion(escena) {
  const { jugador, nivel, estado } = escena;
  const lado = TAMANO_CELDA;
  estado.revelado = false;

  const camara = escena.cameras.main;
  // Cada píxel del dibujo ocupa dos píxeles del canvas, independientemente del zoom del jugador.
  const escala = 2 / camara.zoom;
  for (const clave of ['oficina-fondo', 'oficina-alerta']) {
    escena.textures.get(clave).setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
  const izquierda = camara.width / 2 - camara.width / (2 * camara.zoom);
  const arriba = camara.height / 2 - camara.height / (2 * camara.zoom);
  const fondos = [0, 1].map(() => escena.add.image(izquierda, arriba, 'oficina-fondo')
    .setOrigin(0).setScrollFactor(0).setScale(escala).setDepth(-20));
  const desplazarFondo = () => {
    const ancho = fondos[0].width;
    const avance = Phaser.Math.Wrap(Math.round(camara.scrollX * 0.14), 0, ancho);
    fondos[0].x = izquierda - avance * escala;
    fondos[1].x = fondos[0].x + ancho * escala;
  };
  desplazarFondo();
  escena.events.on('postupdate', desplazarFondo);
  escena.events.once('shutdown', () => escena.events.off('postupdate', desplazarFondo));

  // Tinte sobre toda la pantalla, invisible hasta la revelación.
  const tinte = escena.add
    .rectangle(0, 0, escena.scale.width, escena.scale.height, REVELACION.color, 0)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(15);

  const disparadores = nivel.entidades.get('!') ?? [];
  for (const disparador of disparadores) {
    const alto = disparador.y + lado / 2;
    const zona = escena.add.zone(disparador.x, alto / 2, lado, alto);
    escena.physics.add.existing(zona, true);
    escena.physics.add.overlap(jugador, zona, revelar);
  }

  // instantaneo: para niveles que empiezan ya revelados (sin destello ni diálogo).
  function revelar(instantaneo = false) {
    if (estado.revelado) return;
    estado.revelado = true;

    const duracion = instantaneo ? 0 : 1200;
    if (!instantaneo) {
      camara.flash(300, 255, 70, 90);
      camara.shake(350, 0.006);
    }
    camara.setBackgroundColor(REVELACION.fondo);
    for (const fondo of fondos) fondo.setTexture('oficina-alerta');
    if (instantaneo) tinte.setFillStyle(REVELACION.color, REVELACION.opacidad);
    else escena.tweens.add({ targets: tinte, fillAlpha: REVELACION.opacidad, duration: duracion, ease: 'Sine.easeOut' });
    for (const disparador of disparadores) disparador.setVisible(false);

    escena.events.emit('revelacion');
    if (!instantaneo) escena.events.emit('dialogo', 'revelacion', {});
  }
  escena.revelar = () => revelar(false);
  if (escena.configNivel?.revelado) revelar(true);
}
