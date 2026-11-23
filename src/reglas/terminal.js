import { TERMINAL } from '../config.js';
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
const GUION = [
  { comando: 'whoami', salida: ['felipito'] },
  { comando: 'ls', salida: ['nota_verde.txt  notas_TI.txt  planilla_horas.xlsx'] },
  {
    comando: 'cat nota_verde.txt',
    salida: [
      '*** NOTA VERDE ***',
      'Hoy, en la Nota Verde: el sudo regalado.',
      'Darle permisos de admin a un programa "solo para buscar archivos"',
      'es como prestarle el auto a un mapache porque "solo va a mirar".',
      'Buenas noches, oficina.'
    ]
  },
  { comando: 'cat notas_TI.txt', salida: ['Felipito pidió sudo para "buscar sus archivos". Se lo dimos solo para find. —TI'] },
  {
    comando: 'sudo -l',
    salida: [
      'User felipito may run the following commands on mastermind:',
      '    (root) NOPASSWD: /usr/bin/find'
    ],
    alerta: true
  },
  { comando: 'sudo find . -exec /bin/sh \\; -quit', salida: [], root: true },
  { comando: 'whoami', salida: ['root'] },
  {
    comando: 'ps aux | grep mastermind',
    salida: [
      'root        23 99.9  4.2  /opt/ia/mastermind --modo=productividad',
      '',
      'Broadcast message from mastermind (pts/0):',
      'Queda una pura. Y esa no se toca.'
    ],
    alerta: true
  },
  { comando: 'kill -9 23', salida: ['[1]+  Killed                  /opt/ia/mastermind'] }
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
    <footer>Aprieta cualquier tecla para hackear · responde rápido a las alertas</footer>`;
  escena.game.canvas.parentElement.append(panel);
  const texto = panel.querySelector('.terminal-texto');
  const tiempo = panel.querySelector('.terminal-tiempo');
  const alerta = panel.querySelector('.terminal-alerta');

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

  function lanzarAlerta() {
    const flecha = FLECHAS[Math.floor(Math.random() * FLECHAS.length)];
    alertaActiva = { tecla: flecha.tecla, hasta: TERMINAL.tiempoAlerta };
    alerta.hidden = false;
    alerta.textContent = `⚠ LA MASTERMIND DETECTÓ LA INTRUSIÓN · aprieta ${flecha.simbolo}`;
  }

  function resolverAlerta(bien) {
    alertaActiva = null;
    alerta.hidden = true;
    if (!bien) {
      restante -= TERMINAL.castigoAlerta * 1000;
      lineas.push('mastermind: sesión interrumpida. Reintentando conexión...');
    }
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
    if (actual.alerta) lanzarAlerta();
    if (paso >= GUION.length) terminar(true);
  }

  const alTeclear = (evento) => {
    if (terminado || evento.repeat) return;
    evento.preventDefault();
    evento.stopPropagation();
    if (alertaActiva) {
      resolverAlerta(evento.key === alertaActiva.tecla);
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
    restante -= delta;
    if (alertaActiva) {
      alertaActiva.hasta -= delta;
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
