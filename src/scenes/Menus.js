import Phaser from 'phaser';
import { obtenerDialogo } from '../dialogos.js';
import { EXTINTOR } from '../config.js';
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
    const controles = document.createElement('div');
    controles.className = 'controles';
    const mover = EXTINTOR.modoFlechas === 'mover';
    controles.innerHTML = `
      <dl>
        <dt><kbd>A</kbd> <kbd>D</kbd></dt><dd>Caminar</dd>
        <dt><kbd>W</kbd></dt><dd>Saltar · mantén para subir más</dd>
        <dt><kbd>S</kbd></dt><dd>Bajar de una plataforma fina</dd>
        <dt><kbd>← ↑ ↓ →</kbd></dt><dd>${mover ? 'Impulsarte en la dirección de la flecha' : 'Apuntar y disparar el extintor'}</dd>
        <dt><kbd>Espacio</kbd></dt><dd>Mantener en el suelo para disparar sin retroceder</dd>
        <dt><kbd>Esc</kbd> / <kbd>P</kbd></dt><dd>Pausar o continuar</dd>
      </dl>
      <p>${mover ? 'Pulsa ↑ para subir con el chorro hacia abajo.' : 'Dispara hacia abajo (↓) para subir.'} Combina dos flechas para una diagonal. Suéltalas en el suelo para recargar.</p>`;
    mostrarMenu(this, 'MasterIA', [
      ['Empezar', () => this.scene.start('Juego')]
    ], controles);
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
