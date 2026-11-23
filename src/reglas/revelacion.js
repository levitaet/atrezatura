import { REVELACION, TAMANO_CELDA } from '../config.js';

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

    const camara = escena.cameras.main;
    const duracion = instantaneo ? 0 : 1200;
    if (!instantaneo) {
      camara.flash(300, 255, 70, 90);
      camara.shake(350, 0.006);
    }
    camara.setBackgroundColor(REVELACION.fondo);
    const noche = escena.add.image(camara.width / 2, 0, 'fondo-noche')
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(-10).setAlpha(instantaneo ? 0.8 : 0);
    noche.setScale(Math.max(camara.width / noche.width, camara.height / noche.height));
    if (!instantaneo) escena.tweens.add({ targets: noche, alpha: 0.8, duration: duracion });
    if (instantaneo) tinte.setFillStyle(REVELACION.color, REVELACION.opacidad);
    else escena.tweens.add({ targets: tinte, fillAlpha: REVELACION.opacidad, duration: duracion, ease: 'Sine.easeOut' });
    for (const disparador of disparadores) disparador.setVisible(false);

    escena.events.emit('revelacion');
    if (!instantaneo) escena.events.emit('dialogo', 'revelacion', {});
  }
  escena.revelar = () => revelar(false);
  if (escena.configNivel?.revelado) revelar(true);
}
