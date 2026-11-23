import { PENSAMIENTOS } from '../config.js';
import './cajaDialogo.css';

/**
 * Caja de diálogo única, estilo novela visual, abajo de la pantalla. La usan:
 * - Felipito (sus pensamientos, en ámbar y entre paréntesis): pensamientos.js
 * - La Mastermind (en verde): dialogos.js. Mientras Felipito no la conoce (el nivel no está
 *   revelado), aparece como "???" con una silueta y un signo de pregunta.
 *
 * decir(escena, 'felipito' | 'mastermind', texto): escribe el texto letra a letra y lo oculta
 * después de PENSAMIENTOS.permanencia. Un texto nuevo reemplaza al anterior.
 */
const RETRATOS = {
  // Cabeza de Felipito: cuadro 0 de su sprite (x 37–85, y 6–54), ampliado ×2.
  felipito: { imagen: 'assets/sprites/felipito.png', tamano: [128 * 11 * 2, 128 * 2], posicion: [-37 * 2, -6 * 2] },
  // Monitor central de la Mastermind (x 44–92, y 12–60), ampliado ×2.
  mastermind: { imagen: 'assets/sprites/mastermind.png', tamano: [128 * 2, 128 * 2], posicion: [-44 * 2, -12 * 2] }
};

function crearCaja(escena) {
  const caja = document.createElement('aside');
  caja.className = 'caja-dialogo';
  caja.setAttribute('role', 'status');
  caja.hidden = true;
  caja.innerHTML = `
    <div class="vn-retrato"></div>
    <div class="vn-cuerpo">
      <span class="vn-nombre"></span>
      <p class="vn-texto"></p>
    </div>`;
  escena.game.canvas.parentElement.append(caja);

  const retrato = caja.querySelector('.vn-retrato');
  const nombre = caja.querySelector('.vn-nombre');
  const parrafo = caja.querySelector('.vn-texto');
  let escribir = null;
  let ocultar = null;

  function decir(hablante, texto) {
    if (!texto) return;
    escribir?.remove();
    ocultar?.remove();

    const misterio = hablante === 'mastermind' && !escena.estado?.revelado;
    const estilo = misterio ? 'misterio' : hablante;
    caja.className = `caja-dialogo vn-${estilo}`;
    nombre.textContent = { felipito: 'Felipito', mastermind: 'Mastermind', misterio: '???' }[estilo];
    caja.setAttribute('aria-label', nombre.textContent);
    const r = RETRATOS[estilo];
    retrato.textContent = misterio ? '?' : '';
    retrato.style.backgroundImage = r ? `url("${r.imagen}")` : ''; // '' deja el fondo del CSS (silueta)
    retrato.style.backgroundSize = r ? `${r.tamano[0]}px ${r.tamano[1]}px` : '';
    retrato.style.backgroundPosition = r ? `${r.posicion[0]}px ${r.posicion[1]}px` : '';

    let letras = 0;
    parrafo.textContent = '';
    caja.hidden = false;
    const msPorLetra = 1000 / PENSAMIENTOS.letrasPorSegundo;
    escribir = escena.time.addEvent({
      delay: msPorLetra,
      repeat: texto.length - 1,
      callback: () => {
        letras += 1;
        parrafo.textContent = texto.slice(0, letras);
      }
    });
    ocultar = escena.time.delayedCall(texto.length * msPorLetra + PENSAMIENTOS.permanencia, () => {
      caja.hidden = true;
    });
  }

  escena.events.once('shutdown', () => {
    caja.remove();
    delete escena.cajaDialogo;
  });
  return { decir };
}

export function decir(escena, hablante, texto) {
  escena.cajaDialogo ??= crearCaja(escena);
  escena.cajaDialogo.decir(hablante, texto);
}
