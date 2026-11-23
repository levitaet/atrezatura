import Phaser from 'phaser';
import { obtenerDialogo } from '../dialogos.js';
import './menus.css';

// Los botones nativos comparten la misma acción con ratón, Tab, Enter y Espacio.
function mostrarMenu(escena, titulo, opciones, dialogo = '') {
  const panel = document.createElement('section');
  panel.className = 'menu';
  const encabezado = document.createElement('h1');
  encabezado.textContent = titulo;
  panel.append(encabezado);
  if (dialogo) {
    const mensaje = document.createElement('p');
    mensaje.className = 'dialogo-resultado';
    mensaje.textContent = dialogo;
    panel.append(mensaje);
  }
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
      ['Empezar', () => this.scene.start('Juego')]
    ]);
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
    mostrarMenu(this, this.titulo, [
      ['Volver a jugar', () => this.scene.start('Juego')],
      ['Volver al inicio', () => this.scene.start('Inicio')]
    ], obtenerDialogo(this.titulo === 'Victoria' ? 'victoria' : 'muerte'));
  }
}
