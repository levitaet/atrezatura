import { EXTINTOR, JUGADOR } from '../config.js';

export function mostrarHud(escena) {
  const hud = document.createElement('section');
  hud.className = 'hud';
  hud.setAttribute('aria-label', 'Estado de la partida');
  hud.innerHTML = `
    <div>Salud <strong class="hud-salud"></strong></div>
    <label>Extintor <span><progress max="100" aria-label="Carga del extintor"></progress> <b></b></span></label>
    <div>Computadores restantes <strong class="hud-cuenta"></strong></div>`;
  const salud = hud.querySelector('.hud-salud');
  const cuenta = hud.querySelector('.hud-cuenta');
  const carga = hud.querySelector('progress');
  const porcentaje = hud.querySelector('b');
  const dibujarSalud = () => {
    const n = escena.estado.corazones;
    salud.textContent = '♥'.repeat(n) + '♡'.repeat(JUGADOR.corazones - n);
    salud.setAttribute('aria-label', `${n} de ${JUGADOR.corazones} corazones`);
  };
  const dibujarCuenta = () => { cuenta.textContent = escena.estado.computadoresRestantes; };
  const dibujarCarga = () => {
    const valor = Math.round(100 * escena.jugador.extintor.carga / EXTINTOR.carga);
    if (carga.hasAttribute('value') && valor === carga.value) return;
    carga.value = valor;
    porcentaje.textContent = `${valor}%`;
  };
  dibujarSalud();
  dibujarCuenta();
  dibujarCarga();
  escena.game.canvas.parentElement.append(hud);
  escena.events.on('corazones', dibujarSalud);
  escena.events.on('computadores', dibujarCuenta);
  escena.events.on('postupdate', dibujarCarga);
  escena.events.once('shutdown', () => {
    escena.events.off('corazones', dibujarSalud);
    escena.events.off('computadores', dibujarCuenta);
    escena.events.off('postupdate', dibujarCarga);
    hud.remove();
  });
}
