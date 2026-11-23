import Phaser from 'phaser';
import { obtenerDialogo } from '../dialogos.js';
import despertar from '../arte/despertar.png';
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
    pagina.className = 'menu comic';
    pagina.setAttribute('aria-label', 'Prólogo de MasterIA');
    const imagen = new Image();
    imagen.alt = 'Felipito duerme sobre su escritorio. Al despertar, levanta la cabeza y mira alrededor. Todas las sillas de la oficina están vacías.';
    imagen.src = despertar;
    const continuar = document.createElement('button');
    continuar.type = 'button';
    continuar.textContent = 'Continuar';
    continuar.addEventListener('click', () => this.scene.start('Juego'), { once: true });
    pagina.append(imagen, continuar);
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
