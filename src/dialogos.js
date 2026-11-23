import frasesPorEvento from './data/dialogos.json';

// Los emisores ya pueden aportar el contexto de la partida; el catálogo local
// selecciona por evento. T30 podrá usar el mismo contrato.
export function obtenerDialogo(evento, contexto = {}) {
  const frases = frasesPorEvento[evento];
  if (!Array.isArray(frases) || !frases.length) return '';
  return frases[Math.floor(Math.random() * frases.length)];
}

export function conectarMonitor(escena) {
  const monitor = document.createElement('aside');
  monitor.className = 'monitor-dialogo';
  monitor.setAttribute('role', 'status');
  monitor.setAttribute('aria-label', 'Mastermind');
  escena.game.canvas.parentElement.append(monitor);

  let vencimiento;
  const mostrar = (evento, contexto) => {
    if (!escena.scene.isActive()) return;
    const frase = obtenerDialogo(evento, contexto);
    if (!frase) return;
    vencimiento?.remove();
    monitor.textContent = frase;
    vencimiento = escena.time.delayedCall(4500, () => { monitor.textContent = ''; });
  };
  escena.events.on('dialogo', mostrar);
  escena.events.once('shutdown', () => {
    escena.events.off('dialogo', mostrar);
    monitor.remove();
  });
}
