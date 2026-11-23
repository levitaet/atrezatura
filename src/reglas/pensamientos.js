import pensamientos from '../data/pensamientos.json';
import { TAMANO_CELDA } from '../config.js';
import './pensamientos.css';

/**
 * Pensamientos de Felipito, estilo novela visual (otro color que la Mastermind).
 *
 * - En el mapa, '*' marca dónde se dispara un pensamiento: al cruzar su columna, una sola vez.
 *   Los textos están en src/data/pensamientos.json → { "<nivel>": { "mapa": [...], ... } },
 *   asignados de izquierda a derecha a los '*'.
 * - Desde el código: escena.pensar('clave') muestra pensamientos.json[nivel][clave]
 *   (por ejemplo, "extintor" al recogerlo).
 */
export function conectarPensamientos(escena) {
  const { jugador, nivel } = escena;
  const lado = TAMANO_CELDA;
  const textos = pensamientos[escena.nombreNivel] ?? {};

  const caja = document.createElement('aside');
  caja.className = 'pensamiento-juego'; // 'pensamiento' ya lo usa el cómic de Ciro
  caja.setAttribute('role', 'status');
  caja.setAttribute('aria-label', 'Felipito piensa');
  escena.game.canvas.parentElement.append(caja);

  let ocultar = null;
  const mostrar = (texto) => {
    if (!texto) return;
    caja.textContent = texto;
    ocultar?.remove();
    ocultar = escena.time.delayedCall(4200, () => { caja.textContent = ''; });
  };
  // Si la clave tiene una lista de frases, elige una al azar.
  escena.pensar = (clave) => {
    const valor = textos[clave];
    mostrar(Array.isArray(valor) ? valor[Math.floor(Math.random() * valor.length)] : valor);
  };

  const marcadores = [...(nivel.entidades.get('*') ?? [])].sort((a, b) => a.x - b.x || a.y - b.y);
  const delMapa = textos.mapa ?? [];
  marcadores.forEach((marcador, i) => {
    marcador.setVisible(false);
    const alto = marcador.y + lado / 2;
    const zona = escena.add.zone(marcador.x, alto / 2, lado, alto);
    escena.physics.add.existing(zona, true);
    const contacto = escena.physics.add.overlap(jugador, zona, () => {
      contacto.destroy();
      mostrar(delMapa[i]);
    });
  });

  escena.events.once('shutdown', () => caja.remove());
}
