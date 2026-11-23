import frasesPorEvento from './data/dialogos.json';
import { decir } from './reglas/cajaDialogo.js';

// Los emisores ya pueden aportar el contexto de la partida; el catálogo local
// selecciona por evento. T30 podrá usar el mismo contrato.
export function obtenerDialogo(evento, contexto = {}) {
  const frases = frasesPorEvento[evento];
  if (!Array.isArray(frases) || !frases.length) return '';
  return frases[Math.floor(Math.random() * frases.length)];
}

// La Mastermind habla en la caja de diálogo de abajo (la misma de los pensamientos de Felipito).
// Antes de la revelación aparece como "???" (ver cajaDialogo.js).
export function conectarMonitor(escena) {
  const mostrar = (evento, contexto) => {
    if (!escena.scene.isActive()) return;
    decir(escena, 'mastermind', obtenerDialogo(evento, contexto));
  };
  escena.events.on('dialogo', mostrar);
  escena.events.once('shutdown', () => escena.events.off('dialogo', mostrar));
}
