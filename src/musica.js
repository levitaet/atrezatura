import tranquila from '../Música Tranquila.mp3?url';
import persecucion from '../persecucion_futurista.wav?url';

// jefe: si el equipo agrega una pista para la Mastermind, importarla aquí (por ejemplo
// `import jefe from '../musica_jefe.mp3?url';`) y poner `jefe` en el objeto. Mientras tanto,
// la sala del jefe usa la persecución un poco más rápida.
export const musica = { tranquila, persecucion, jefe: null };

// Un mismo reproductor conserva el compás entre el cómic y el nivel.
const reproductor = new Audio();
reproductor.loop = true;
reproductor.volume = 0.35;
let pista = null;
let enPausa = true;

function actualizar() {
  if (enPausa || document.hidden) {
    reproductor.pause();
  } else if (reproductor.paused) {
    reproductor.play().catch(error => {
      if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') console.warn('Error de música', error);
    });
  }
}

export function ponerMusica(url) {
  if (pista !== url) {
    reproductor.src = url;
    pista = url;
  }
  enPausa = false;
  actualizar();
}

// Velocidad de reproducción (mantiene el tono en los navegadores actuales).
export function velocidadMusica(valor) {
  reproductor.playbackRate = valor;
}

export function pausarMusica() {
  enPausa = true;
  actualizar();
}

export function detenerMusica() {
  pausarMusica();
  pista = null;
}

document.addEventListener('visibilitychange', actualizar);
if (import.meta.hot) import.meta.hot.dispose(() => {
  document.removeEventListener('visibilitychange', actualizar);
  detenerMusica();
});
