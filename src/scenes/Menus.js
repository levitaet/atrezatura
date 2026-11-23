import Phaser from 'phaser';
import { obtenerDialogo } from '../dialogos.js';
import dormido from '../arte/prologo/dormido.png';
import despierto from '../arte/prologo/despierto.png';
import oficina from '../arte/prologo/oficina.png';
import './menus.css';

// Los botones nativos comparten la misma acción con ratón, Tab, Enter y Espacio.
function mostrarMenu(escena, titulo, opciones, contenido) {
  const panel = document.createElement('section');
  panel.className = 'menu';
  const encabezado = document.createElement('h1');
  encabezado.textContent = titulo;
  panel.append(encabezado);
  if (contenido) panel.append(contenido);
  let elegida = false;
  for (const [texto, accion] of opciones) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.onclick = () => {
      if (elegida) return;
      elegida = true;
      accion();
    };
    panel.append(boton);
  }
  escena.game.canvas.parentElement.append(panel);
  const primero = panel.querySelector('button');
  primero.focus({ preventScroll: true });
  escena.events.once('shutdown', () => panel.remove());
  return primero;
}

export class Inicio extends Phaser.Scene {
  constructor() { super('Inicio'); }

  create() {
    mostrarMenu(this, 'MasterIA', [
      ['Empezar', () => {
        this.registry.remove('nivelActual'); // empezar siempre desde el primer nivel (o ?nivel=)
        this.scene.start('Introduccion');
      }]
    ]);
  }
}

export class Introduccion extends Phaser.Scene {
  constructor() { super('Introduccion'); }

  create() {
    const pagina = document.createElement('section');
    pagina.className = 'menu prologo';
    pagina.setAttribute('aria-label', 'Prólogo de MasterIA');
    const imagen = new Image();
    const planos = [
      { src: dormido, alt: 'Felipito duerme sobre su escritorio.', texto: 'Zzz' },
      { src: despierto, alt: 'Felipito abre los ojos y levanta la cabeza.', texto: '¿me quedé dormido en el trabajo?¿Qué hora es?' },
      { src: oficina, alt: 'Felipito mira las filas de escritorios y sillas vacías.', texto: '' }
    ];
    const marco = document.createElement('div');
    marco.className = 'prologo-marco';
    const pie = document.createElement('div');
    pie.className = 'prologo-pie';
    const dialogo = document.createElement('p');
    dialogo.setAttribute('aria-live', 'polite');
    const continuar = document.createElement('button');
    continuar.type = 'button';
    let indice = 0;
    const mostrarPlano = () => {
      const plano = planos[indice];
      imagen.src = plano.src;
      imagen.alt = plano.alt;
      dialogo.textContent = plano.texto;
      continuar.textContent = indice === planos.length - 1 ? 'Entrar al juego' : 'Continuar';
    };
    continuar.addEventListener('click', () => {
      if (indice === planos.length - 1) {
        continuar.disabled = true;
        this.scene.start('Juego');
        return;
      }
      indice++;
      mostrarPlano();
    });
    mostrarPlano();
    pie.append(dialogo, continuar);
    marco.append(imagen, pie);
    pagina.append(marco);
    this.game.canvas.parentElement.append(pagina);
    continuar.focus({ preventScroll: true });
    this.events.once('shutdown', () => pagina.remove());
  }
}

export class Pausa extends Phaser.Scene {
  constructor() { super('Pausa'); }

  create() {
    const continuar = mostrarMenu(this, 'Pausa', [
      ['Continuar', () => {
        this.scene.stop();
        this.scene.resume('Juego');
      }],
      ['Reiniciar nivel', () => this.scene.start('Juego')],
      ['Volver al inicio', () => {
        this.scene.stop('Juego');
        this.scene.start('Inicio');
      }]
    ]);
    const reanudar = (evento) => {
      if (!evento.repeat) continuar.click();
    };
    this.input.keyboard.on('keydown-ESC', reanudar);
    this.input.keyboard.on('keydown-P', reanudar);
  }
}

export class Resultado extends Phaser.Scene {
  constructor(titulo) {
    super(titulo);
    this.titulo = titulo;
  }

  create() {
    const mensaje = document.createElement('p');
    mensaje.className = 'dialogo-resultado';
    mensaje.textContent = obtenerDialogo(this.titulo === 'Victoria' ? 'victoria' : 'muerte');
    mostrarMenu(this, this.titulo, [
      ['Reintentar', () => this.scene.start('Juego')],
      ['Inicio', () => this.scene.start('Inicio')]
    ], mensaje);
  }
}
