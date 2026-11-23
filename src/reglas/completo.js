import { TAMANO_CELDA } from '../config.js';

/**
 * Completo italiano (o): elemento obligatorio del evento.
 * Al recogerlo llena el tanque del extintor (y la carga). Cada completo se recoge una vez;
 * reaparecer en un checkpoint no lo repone, reiniciar el nivel sí.
 * Usa public/assets/sprites/completo-italiano.png si está cargado.
 */
export function conectarCompletos(escena) {
  const { jugador, nivel, estado } = escena;
  const lado = TAMANO_CELDA;
  estado.completos = 0;

  for (const marcador of nivel.entidades.get('o') ?? []) {
    let dibujo = marcador;
    if (escena.textures.exists('completo')) {
      marcador.setVisible(false);
      // El dibujo ocupa ~38 px de un lienzo de 128: a escala 0,75 queda de ~28 px (casi una celda).
      dibujo = escena.add.image(marcador.x, marcador.y, 'completo').setScale(0.75);
    }
    const flotar = escena.tweens.add({
      targets: dibujo, y: dibujo.y - 5, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    const zona = escena.add.zone(marcador.x, marcador.y, lado, lado);
    escena.physics.add.existing(zona, true);
    const contacto = escena.physics.add.overlap(jugador, zona, () => {
      contacto.destroy();
      flotar.stop();
      jugador.extintor.rellenarTanque();
      estado.completos += 1;
      escena.events.emit('completo', estado.completos);
      escena.events.emit('dialogo', 'completo', {});
      escena.tweens.add({
        targets: dibujo, y: dibujo.y - 24, alpha: 0, scale: dibujo.scale * 1.4, duration: 350,
        onComplete: () => dibujo.destroy()
      });
    });
  }

  // La Mastermind comenta cuando el jugador se queda sin tanque.
  const alVaciar = () => escena.events.emit('dialogo', 'tanque_vacio', {});
  escena.events.on('tanque-vacio', alVaciar);
  escena.events.once('shutdown', () => escena.events.off('tanque-vacio', alVaciar));
}
