import Phaser from 'phaser';
import { crearNivel } from '../niveles/crearNivel.js';
import { conectarMonitor } from '../dialogos.js';

export default class Juego extends Phaser.Scene {
  constructor() {
    super('Juego');
  }

  create() {
    conectarMonitor(this);
    this.nivel = null;
    this.enTransicion = false;
    const alContinuar = () => { this.enTransicion = false; };
    this.events.on('resume', alContinuar);
    this.events.once('shutdown', () => this.events.off('resume', alContinuar));
    const pausar = (evento) => {
      if (evento.repeat || this.enTransicion) return;
      this.enTransicion = true;
      this.scene.pause();
      this.scene.launch('Pausa');
    };
    this.input.keyboard.on('keydown-ESC', pausar);
    this.input.keyboard.on('keydown-P', pausar);
    const nombre = new URLSearchParams(window.location.search).get('nivel') ?? 'base';
    try {
      this.nivel = crearNivel(this, nombre);
    } catch (error) {
      this.add.text(24, 24, `Error al cargar el mapa\n${error.message}`, {
        fontSize: '20px', wordWrap: { width: this.scale.width - 48 }
      });
    }
  }

  ganar() {
    this.terminar('Victoria');
  }

  perder() {
    this.terminar('Derrota');
  }

  terminar(destino) {
    if (this.enTransicion || !this.scene.isActive()) return;
    this.enTransicion = true;
    this.scene.start(destino);
  }
}
