import { EXTINTOR, JUGADOR } from '../config.js';

export function mostrarHud(escena) {
  const hud = document.createElement('section');
  hud.className = 'hud';
  hud.setAttribute('aria-label', 'Estado de la partida');
  hud.innerHTML = `
    <div>Salud <strong class="hud-salud"></strong></div>
    <label class="hud-extintor">Extintor <span><progress max="100" aria-label="Carga del extintor"></progress> <b></b></span></label>
    <label class="hud-extintor">Tanque <span><progress class="hud-tanque" max="100" aria-label="Tanque del extintor en el nivel"></progress> <b class="hud-tanque-txt"></b></span></label>
    <div>Computadores restantes <strong class="hud-cuenta"></strong></div>`;
  const salud = hud.querySelector('.hud-salud');
  const cuenta = hud.querySelector('.hud-cuenta');
  const carga = hud.querySelector('progress');
  const tanque = hud.querySelector('.hud-tanque');
  const tanqueTexto = hud.querySelector('.hud-tanque-txt');
  let ultimoTanque = -1;
  const porcentaje = hud.querySelector('b');
  const dibujarSalud = () => {
    const n = escena.estado.corazones;
    salud.textContent = '♥'.repeat(n) + '♡'.repeat(JUGADOR.corazones - n);
    salud.setAttribute('aria-label', `${n} de ${JUGADOR.corazones} corazones`);
  };
  const dibujarCuenta = () => { cuenta.textContent = escena.estado.computadoresRestantes; };
  const filasExtintor = hud.querySelectorAll('.hud-extintor');
  const dibujarCarga = () => {
    // Las barras del extintor aparecen recién cuando el jugador lo tiene (tutorial).
    const tiene = escena.jugador.extintor.habilitado;
    for (const fila of filasExtintor) fila.hidden = !tiene;
    const segundos = escena.jugador.extintor.tanque;
    const decimas = Math.ceil(segundos * 10);
    if (decimas !== ultimoTanque) {
      ultimoTanque = decimas;
      tanque.value = Math.round(100 * segundos / EXTINTOR.tanque);
      tanqueTexto.textContent = `${(decimas / 10).toFixed(1)} s`;
      tanque.classList.toggle('hud-vacio', segundos <= 0);
      tanque.closest('label').classList.toggle('hud-bajo', segundos > 0 && segundos <= EXTINTOR.avisoPoco);
    }
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
