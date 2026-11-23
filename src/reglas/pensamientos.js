import pensamientos from '../data/pensamientos.json';
import { PENSAMIENTOS, TAMANO_CELDA } from '../config.js';
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

  // Caja estilo novela visual: retrato, nombre en pestaña y texto que se escribe letra a letra.
  // ('pensamiento' ya lo usa el cómic de Ciro: por eso la clase es 'pensamiento-juego'.)
  const caja = document.createElement('aside');
  caja.className = 'pensamiento-juego';
  caja.setAttribute('role', 'status');
  caja.setAttribute('aria-label', 'Felipito piensa');
  caja.hidden = true;
  caja.innerHTML = `
    <div class="vn-retrato"></div>
    <div class="vn-cuerpo">
      <span class="vn-nombre">Felipito</span>
      <p class="vn-texto"></p>
    </div>`;
  // Retrato: la cabeza de Felipito del cuadro 0 de su sprite (cabeza ≈ x 37–85, y 6–54), ×2.
  const retrato = caja.querySelector('.vn-retrato');
  retrato.style.backgroundImage = 'url("assets/sprites/felipito.png")';
  retrato.style.backgroundSize = `${128 * 11 * 2}px ${128 * 2}px`;
  retrato.style.backgroundPosition = `${-37 * 2}px ${-6 * 2}px`;
  const parrafo = caja.querySelector('.vn-texto');
  escena.game.canvas.parentElement.append(caja);

  let escribir = null;
  let ocultar = null;
  const mostrar = (texto) => {
    if (!texto) return;
    escribir?.remove();
    ocultar?.remove();
    const completo = `(${texto})`; // entre paréntesis: es un pensamiento, como en el cómic
    let letras = 0;
    parrafo.textContent = '';
    caja.hidden = false;
    escribir = escena.time.addEvent({
      delay: 1000 / PENSAMIENTOS.letrasPorSegundo,
      repeat: completo.length - 1,
      callback: () => {
        letras += 1;
        parrafo.textContent = completo.slice(0, letras);
      }
    });
    const visible = completo.length * (1000 / PENSAMIENTOS.letrasPorSegundo) + PENSAMIENTOS.permanencia;
    ocultar = escena.time.delayedCall(visible, () => { caja.hidden = true; });
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
