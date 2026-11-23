import { PENSAMIENTOS } from '../config.js';
import './cajaDialogo.css';

/**
 * Caja de diálogo única, estilo novela visual (retrato, pestaña con el nombre y texto que se
 * escribe letra a letra). Se usa en TODO el juego para que los diálogos se vean iguales:
 *
 * - En el juego: decir(escena, 'felipito' | 'mastermind', texto). Abajo de la pantalla, se oculta
 *   sola. La Mastermind aparece como "???" mientras el nivel no está revelado.
 * - Fuera del juego (cómic, pantallas de victoria/derrota): crearCajaEnLinea() devuelve una caja
 *   que se inserta en el HTML y se llena con .mostrar(hablante, texto).
 *
 * Hablantes: 'felipito' (ámbar), 'mastermind' (verde), 'misterio' (??? con silueta).
 */
const RETRATOS = {
  // Cabeza de Felipito: cuadro 0 de su sprite (x 37–85, y 6–54), ampliado ×2.
  felipito: { imagen: 'assets/sprites/felipito.png', tamano: [128 * 11 * 2, 128 * 2], posicion: [-37 * 2, -6 * 2] },
  // Monitor central de la Mastermind (x 44–92, y 12–60), ampliado ×2.
  mastermind: { imagen: 'assets/sprites/mastermind.png', tamano: [128 * 2, 128 * 2], posicion: [-44 * 2, -12 * 2] }
};
const NOMBRES = { felipito: 'Felipito', mastermind: 'Mastermind', misterio: '???' };
const MS_POR_LETRA = 1000 / PENSAMIENTOS.letrasPorSegundo;

function construir(claseExtra = '') {
  const caja = document.createElement('aside');
  caja.className = `caja-dialogo ${claseExtra}`.trim();
  caja.setAttribute('role', 'status');
  caja.innerHTML = `
    <div class="vn-retrato"></div>
    <div class="vn-cuerpo">
      <span class="vn-nombre"></span>
      <p class="vn-texto"></p>
    </div>`;
  return {
    caja,
    retrato: caja.querySelector('.vn-retrato'),
    nombre: caja.querySelector('.vn-nombre'),
    parrafo: caja.querySelector('.vn-texto')
  };
}

function aplicarHablante(partes, estilo, claseExtra = '') {
  const { caja, retrato, nombre } = partes;
  caja.className = `caja-dialogo vn-${estilo} ${claseExtra}`.trim();
  nombre.textContent = NOMBRES[estilo];
  caja.setAttribute('aria-label', NOMBRES[estilo]);
  const r = RETRATOS[estilo];
  retrato.textContent = estilo === 'misterio' ? '?' : '';
  // '' deja el fondo del CSS (la silueta del "???").
  retrato.style.backgroundImage = r ? `url("${r.imagen}")` : '';
  retrato.style.backgroundSize = r ? `${r.tamano[0]}px ${r.tamano[1]}px` : '';
  retrato.style.backgroundPosition = r ? `${r.posicion[0]}px ${r.posicion[1]}px` : '';
}

// --- En el juego (usa el reloj de la escena: se detiene con la pausa) ---
function crearCajaJuego(escena) {
  const partes = construir();
  partes.caja.hidden = true;
  escena.game.canvas.parentElement.append(partes.caja);
  let escribir = null;
  let ocultar = null;

  function decirEnJuego(hablante, texto) {
    if (!texto) return;
    escribir?.remove();
    ocultar?.remove();
    const misterio = hablante === 'mastermind' && !escena.estado?.revelado;
    aplicarHablante(partes, misterio ? 'misterio' : hablante);
    let letras = 0;
    partes.parrafo.textContent = '';
    partes.caja.hidden = false;
    escribir = escena.time.addEvent({
      delay: MS_POR_LETRA,
      repeat: texto.length - 1,
      callback: () => {
        letras += 1;
        partes.parrafo.textContent = texto.slice(0, letras);
      }
    });
    ocultar = escena.time.delayedCall(texto.length * MS_POR_LETRA + PENSAMIENTOS.permanencia, () => {
      partes.caja.hidden = true;
    });
  }

  escena.events.once('shutdown', () => {
    partes.caja.remove();
    delete escena.cajaDialogo;
  });
  return { decir: decirEnJuego };
}

export function decir(escena, hablante, texto) {
  escena.cajaDialogo ??= crearCajaJuego(escena);
  escena.cajaDialogo.decir(hablante, texto);
}

// --- Fuera del juego: cómic y pantallas de resultado (reloj del navegador) ---
export function crearCajaEnLinea() {
  const partes = construir('caja-dialogo--en-linea');
  let intervalo = null;
  return {
    elemento: partes.caja,
    mostrar(hablante, texto) {
      window.clearInterval(intervalo);
      partes.caja.hidden = !texto;
      if (!texto) return;
      aplicarHablante(partes, hablante, 'caja-dialogo--en-linea');
      let letras = 0;
      partes.parrafo.textContent = '';
      intervalo = window.setInterval(() => {
        letras += 1;
        partes.parrafo.textContent = texto.slice(0, letras);
        if (letras >= texto.length) window.clearInterval(intervalo);
      }, MS_POR_LETRA);
    },
    detener() {
      window.clearInterval(intervalo);
    }
  };
}
