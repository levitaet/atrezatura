import './barraJefe.css';

/**
 * Barra de vida grande del jefe, arriba de la pantalla (estilo jefe de videojuego).
 * Mientras tiene escudo muestra los computadores que lo protegen; sin escudo, su vida.
 */
export function crearBarraJefe(escena, { nombre, titulo }) {
  const barra = document.createElement('section');
  barra.className = 'barra-jefe';
  barra.hidden = true;
  barra.setAttribute('aria-label', `Vida de ${nombre}`);
  barra.innerHTML = `
    <header><strong></strong><span></span></header>
    <div class="barra-jefe-marco"><i class="barra-jefe-relleno"></i><i class="barra-jefe-eco"></i></div>
    <small></small>`;
  barra.querySelector('strong').textContent = nombre;
  barra.querySelector('span').textContent = titulo;
  const relleno = barra.querySelector('.barra-jefe-relleno');
  const eco = barra.querySelector('.barra-jefe-eco'); // la vida perdida baja más lento, como en los juegos
  const estado = barra.querySelector('small');
  escena.game.canvas.parentElement.append(barra);
  let ecoFraccion = 1;

  escena.events.once('shutdown', () => barra.remove());

  return {
    mostrar() {
      barra.hidden = false;
    },
    // fraccion 0–1; conEscudo cambia el color y el texto de estado
    actualizar(fraccion, conEscudo, texto) {
      barra.classList.toggle('barra-jefe-escudo', conEscudo);
      relleno.style.width = `${Math.max(0, fraccion) * 100}%`;
      ecoFraccion = Math.max(fraccion, ecoFraccion - 0.006);
      eco.style.width = `${Math.max(0, ecoFraccion) * 100}%`;
      estado.textContent = texto;
    },
    derrotada() {
      relleno.style.width = '0%';
      eco.style.width = '0%';
      estado.textContent = 'SISTEMA APAGADO';
      barra.classList.add('barra-jefe-fin');
      escena.time.delayedCall(2500, () => { barra.hidden = true; });
    }
  };
}
