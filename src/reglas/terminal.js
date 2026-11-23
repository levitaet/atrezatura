import { TERMINAL } from '../config.js';
import { crearCajaEnLinea } from './cajaDialogo.js';
import './terminal.css';

/**
 * Minijuego final: hackear a la Mastermind desde su terminal.
 *
 * Pensado para cualquier jugador: no hay que saber comandos. Cualquier tecla escribe sola el
 * siguiente pedazo del comando (estilo "hacker typer") y, al terminarlo, lo ejecuta.
 * El desafío: terminar antes de que la Mastermind restaure su sistema (TERMINAL.segundos) y
 * responder a sus alertas apretando la flecha que piden.
 *
 * Para quien sí sabe, lo que se escribe es una escalada de privilegios real y reconocible:
 * sudo mal configurado sobre find (GTFOBins) → shell de root → matar el proceso de la IA (PID 23).
 *
 * mostrarTerminal(escena, { alGanar, alPerder }) abre la terminal sobre el juego.
 */
// pensamiento: lo que Felipito piensa después de cada comando. Hace años que el trabajo le apagó
// las ganas; en esta terminal redescubre que le encanta hackear.
const GUION = [
  { comando: 'whoami', salida: ['felipito'], pensamiento: 'felipito. Sí... todavía soy yo. Creo.' },
  { comando: 'ls', salida: ['nota_verde.txt  notas_TI.txt  planilla_horas.xlsx'], pensamiento: 'planilla_horas.xlsx. Hasta aquí me persigue.' },
  {
    comando: 'cat nota_verde.txt',
    salida: [
      '*** NOTA VERDE ***',
      'Hoy, en la Nota Verde: el sudo regalado.',
      'Darle permisos de admin a un programa "solo para buscar archivos"',
      'es como prestarle el auto a un mapache porque "solo va a mirar".',
      'Buenas noches, oficina.'
    ],
    lectura: true, // pausa: Felipito se detiene a leer la nota (el reloj no corre)
    pensamiento: 'Bodoque tiene razón. Siempre tiene razón.'
  },
  {
    comando: 'cat notas_TI.txt',
    salida: ['Felipito pidió sudo para "buscar sus archivos". Se lo dimos solo para find. —TI'],
    pensamiento: 'Lo pedí hace años, cuando este trabajo todavía me entretenía. Nunca me lo quitaron.'
  },
  {
    comando: 'sudo -l',
    salida: [
      'User felipito may run the following commands on mastermind:',
      '    (root) NOPASSWD: /usr/bin/find'
    ],
    alerta: true,
    pensamiento: 'NOPASSWD sobre find. Ja. Esto es de manual... las manos se acuerdan solas.'
  },
  {
    comando: 'sudo find . -exec /bin/sh \\; -quit',
    salida: [],
    root: true,
    pensamiento: '¡No me acordaba de lo mucho que me gustaba hacer esto!'
  },
  { comando: 'whoami', salida: ['root'], pensamiento: 'root. Hace años que no me sentía así de vivo.' },
  {
    comando: 'ps aux | grep mastermind',
    salida: [
      'root        23 99.9  4.2  /opt/ia/mastermind --modo=productividad',
      '',
      'Broadcast message from mastermind (pts/0):',
      'Queda una pura. Y esa no se toca.'
    ],
    alerta: true,
    pensamiento: 'PID 23. Te encontré.'
  },
  {
    comando: 'kill -9 23',
    salida: ['[1]+  Killed                  /opt/ia/mastermind'],
    pensamiento: 'Creo que voy a renunciar. Y a volver a hackear. Las dos cosas.'
  }
];

const FLECHAS = [
  { tecla: 'ArrowUp', simbolo: '↑' },
  { tecla: 'ArrowDown', simbolo: '↓' },
  { tecla: 'ArrowLeft', simbolo: '←' },
  { tecla: 'ArrowRight', simbolo: '→' }
];

export function mostrarTerminal(escena, { alGanar, alPerder }) {
  const panel = document.createElement('section');
  panel.className = 'terminal';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Terminal de la Mastermind');
  panel.innerHTML = `
    <header><span>ssh felipito@mastermind</span><span class="terminal-tiempo"></span></header>
    <pre class="terminal-texto"></pre>
    <div class="terminal-alerta" hidden></div>
    <div class="terminal-felipito"></div>
    <footer>Aprieta cualquier tecla para hackear · responde rápido a las alertas</footer>
    <div class="terminal-intro" role="note">
      <strong>¡Llegó tu momento hacker!</strong>
      <p>Aprieta <b>cualquier tecla</b> rápidamente: los comandos se escriben solos.</p>
      <p>Consigue acceso de <b>root</b> y apaga a la Mastermind antes de que restaure su sistema
        (${TERMINAL.segundos} s).</p>
      <p>Si aparece una <b>⚠ ALERTA</b>, aprieta la flecha que te pide.</p>
      <span class="terminal-intro-empezar">Aprieta cualquier tecla para empezar</span>
    </div>`;
  escena.game.canvas.parentElement.append(panel);
  const texto = panel.querySelector('.terminal-texto');
  const tiempo = panel.querySelector('.terminal-tiempo');
  const alerta = panel.querySelector('.terminal-alerta');
  const intro = panel.querySelector('.terminal-intro');
  // Felipito comenta cada paso en la caja de novela visual, al pie de la consola.
  const felipito = crearCajaEnLinea();
  felipito.mostrar('felipito', '');
  panel.querySelector('.terminal-felipito').append(felipito.elemento);
  const pensar = (texto) => felipito.mostrar('felipito', texto ? `(${texto})` : '');
  let iniciado = false; // el reloj corre recién después de cerrar las instrucciones
  let lectura = null; // { lista: ms desde los que una tecla la cierra, panel }

  let paso = 0;
  let escritos = 0; // caracteres escritos del comando actual
  let root = false;
  let restante = TERMINAL.segundos * 1000;
  let alertaActiva = null; // { tecla, hasta }
  let terminado = false;
  let ultimo = performance.now();

  const prompt = () => (root ? '# ' : 'felipito@mastermind:~$ ');
  const lineas = ['Last login: lun 23 nov 09:00:23 from 10.0.0.23', ''];
  const dibujar = () => {
    const actual = GUION[paso];
    const enCurso = actual ? prompt() + actual.comando.slice(0, escritos) + '█' : '';
    texto.textContent = [...lineas, enCurso].join('\n');
    texto.scrollTop = texto.scrollHeight;
    tiempo.textContent = `Restauración del sistema en ${Math.max(0, restante / 1000).toFixed(1)} s`;
    tiempo.classList.toggle('terminal-urgente', restante < 5000);
  };

  // La alerta tapa toda la consola y solo se despeja con la flecha pedida. Otras teclas no hacen
  // nada (solo un sacudón). Si se acaba su tiempo, se pierden TERMINAL.castigoAlerta segundos.
  function lanzarAlerta() {
    const flecha = FLECHAS[Math.floor(Math.random() * FLECHAS.length)];
    alertaActiva = { tecla: flecha.tecla, hasta: TERMINAL.tiempoAlerta };
    alerta.innerHTML = `
      <strong>⚠ La Mastermind detectó tu conexión ⚠</strong>
      <span class="terminal-alerta-flecha">${flecha.simbolo}</span>
      <p>¡Aprieta esa flecha para despistarla!</p>
      <div class="terminal-alerta-barra"><i></i></div>`;
    alerta.hidden = false;
  }

  function sacudirAlerta() {
    alerta.classList.remove('terminal-alerta-error');
    void alerta.offsetWidth; // reinicia la animación
    alerta.classList.add('terminal-alerta-error');
  }

  function resolverAlerta(bien) {
    alertaActiva = null;
    alerta.hidden = true;
    if (!bien) {
      restante -= TERMINAL.castigoAlerta * 1000;
      lineas.push('mastermind: sesión interrumpida. Reintentando conexión...');
    }
  }

  // Pausa de lectura: el reloj se detiene y la nota se muestra grande. Las teclas se ignoran un
  // momento (el jugador viene apretando rápido) y luego cualquier tecla sigue.
  function leer(lineasNota) {
    const caja = document.createElement('div');
    caja.className = 'terminal-lectura';
    // Juan Carlos Bodoque (guiño a 31 Minutos) presenta la Nota Verde.
    caja.innerHTML = `
      <em>(Felipito se detiene a leer la nota…)</em>
      <div class="terminal-lectura-cuerpo">
        <figure>
          <img src="assets/sprites/juan-carlos-bodoque.png" alt="Juan Carlos Bodoque, presentador de la Nota Verde" width="160" height="160">
          <figcaption>J. C. Bodoque<br>Nota Verde</figcaption>
        </figure>
        <pre></pre>
      </div>
      <span class="terminal-intro-empezar" hidden>Aprieta cualquier tecla para seguir hackeando</span>`;
    caja.querySelector('pre').textContent = lineasNota.join('\n');
    panel.append(caja);
    lectura = { lista: performance.now() + TERMINAL.pausaLectura, caja };
  }

  function avanzar() {
    const actual = GUION[paso];
    if (escritos < actual.comando.length) {
      escritos = Math.min(actual.comando.length, escritos + TERMINAL.letrasPorTecla);
      return;
    }
    // Comando completo: "Enter".
    lineas.push(prompt() + actual.comando, ...actual.salida);
    if (actual.root) root = true;
    paso += 1;
    escritos = 0;
    if (actual.lectura) leer(actual.salida);
    else if (actual.pensamiento) pensar(actual.pensamiento);
    if (actual.alerta) lanzarAlerta();
    if (paso >= GUION.length) terminar(true);
  }

  const alTeclear = (evento) => {
    if (terminado || evento.repeat) return;
    evento.preventDefault();
    evento.stopPropagation();
    if (lectura) {
      if (performance.now() < lectura.lista) return;
      lectura.caja.remove();
      lectura = null;
      pensar(GUION[paso - 1]?.pensamiento);
      ultimo = performance.now();
      dibujar();
      return;
    }
    if (!iniciado) {
      // Primera tecla: cierra las instrucciones y arranca el reloj (no escribe nada).
      iniciado = true;
      intro.remove();
      pensar('Una terminal de verdad... Hace años que solo abro planillas.');
      ultimo = performance.now();
      dibujar();
      return;
    }
    if (alertaActiva) {
      if (evento.key === alertaActiva.tecla) resolverAlerta(true);
      else sacudirAlerta();
    } else {
      avanzar();
    }
    dibujar();
  };
  window.addEventListener('keydown', alTeclear, true);

  // Reloj en tiempo real: la escena de juego está en pausa mientras la terminal está abierta.
  const reloj = window.setInterval(() => {
    const ahora = performance.now();
    const delta = ahora - ultimo;
    ultimo = ahora;
    if (!iniciado) return;
    if (lectura) {
      if (ahora >= lectura.lista) lectura.caja.querySelector('span').hidden = false;
      return;
    }
    restante -= delta;
    if (alertaActiva) {
      alertaActiva.hasta -= delta;
      const barra = alerta.querySelector('.terminal-alerta-barra i');
      if (barra) barra.style.width = `${Math.max(0, 100 * alertaActiva.hasta / TERMINAL.tiempoAlerta)}%`;
      if (alertaActiva.hasta <= 0) resolverAlerta(false);
    }
    if (restante <= 0) terminar(false);
    dibujar();
  }, 100);

  function terminar(gano) {
    if (terminado) return;
    terminado = true;
    window.clearInterval(reloj);
    window.removeEventListener('keydown', alTeclear, true);
    felipito.detener();
    lineas.push('', gano ? 'Conexión cerrada. La Mastermind ya no responde.' : 'mastermind: sistema restaurado. Acceso revocado.');
    alerta.hidden = true;
    dibujar();
    window.setTimeout(() => {
      panel.remove();
      (gano ? alGanar : alPerder)();
    }, 1400);
  }

  // Si la escena se cierra (reinicio, volver al inicio), la terminal desaparece sin efectos.
  escena.events.once('shutdown', () => {
    terminado = true;
    window.clearInterval(reloj);
    window.removeEventListener('keydown', alTeclear, true);
    panel.remove();
  });

  dibujar();
}
