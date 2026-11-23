import { EXTINTOR, TAMANO_CELDA } from '../config.js';
import './avisos.css';

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
  estado.completosRestantes = (nivel.entidades.get('o') ?? []).length;

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
      estado.completosRestantes -= 1;
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

  conectarAvisosTanque(escena);
}

/**
 * Avisos grandes en pantalla sobre el tanque del extintor:
 * - "¡Queda poca espuma!" al bajar de EXTINTOR.avisoPoco segundos.
 * - "¡Sin espuma!" al vaciarse, con qué hacer: buscar un completo o, si no quedan, reiniciar.
 * Vuelven a avisar después de rellenar el tanque.
 */
function conectarAvisosTanque(escena) {
  const { jugador, estado } = escena;
  const aviso = document.createElement('aside');
  aviso.className = 'aviso-tanque';
  aviso.setAttribute('role', 'alert');
  aviso.hidden = true;
  escena.game.canvas.parentElement.append(aviso);

  let fase = 'normal'; // normal → poco → vacio
  let ocultar = null;
  const mostrar = (clase, titulo, detalle, ms) => {
    aviso.className = `aviso-tanque ${clase}`;
    aviso.innerHTML = '<strong></strong><span></span>';
    aviso.querySelector('strong').textContent = titulo;
    aviso.querySelector('span').textContent = detalle;
    aviso.hidden = false;
    ocultar?.remove();
    ocultar = escena.time.delayedCall(ms, () => { aviso.hidden = true; });
  };

  const revisar = () => {
    const extintor = jugador.extintor;
    if (!extintor.habilitado) return;
    const tanque = extintor.tanque;
    if (tanque > EXTINTOR.avisoPoco) {
      fase = 'normal';
      return;
    }
    if (tanque > 0 && fase === 'normal') {
      fase = 'poco';
      mostrar('aviso-poco', '¡Queda poca espuma!', 'Úsala con cuidado. Un completo italiano rellena el extintor.', 3200);
    } else if (tanque <= 0 && fase !== 'vacio') {
      fase = 'vacio';
      const detalle = estado.completosRestantes > 0
        ? 'Busca un completo italiano para rellenar el extintor.'
        : 'No quedan completos en este piso. Si no puedes avanzar: Esc → Reiniciar nivel.';
      mostrar('aviso-vacio', '¡Sin espuma!', detalle, 6000);
    }
  };
  escena.events.on('postupdate', revisar);
  const alRellenar = () => {
    fase = 'normal';
    ocultar?.remove();
    aviso.hidden = true;
  };
  escena.events.on('tanque-lleno', alRellenar);
  escena.events.once('shutdown', () => {
    escena.events.off('postupdate', revisar);
    escena.events.off('tanque-lleno', alRellenar);
    aviso.remove();
  });
}
