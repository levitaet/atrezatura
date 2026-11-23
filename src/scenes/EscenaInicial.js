import Phaser from 'phaser';
import { crearNivel } from '../niveles/crearNivel.js';

export default class EscenaInicial extends Phaser.Scene {
  constructor() {
    super('EscenaInicial');
  }

  create() {
    const nombre = new URLSearchParams(window.location.search).get('nivel') ?? 'base';
    try {
      this.nivel = crearNivel(this, nombre);
    } catch (error) {
      this.add.text(24, 24, `Error al cargar el mapa\n${error.message}`, {
        fontSize: '20px', wordWrap: { width: this.scale.width - 48 }
      });
    }
  }
}
