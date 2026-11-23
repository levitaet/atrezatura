import Phaser from 'phaser';
import EscenaPrueba from './scenes/EscenaPrueba.js';
import EscenaInicial from './scenes/EscenaInicial.js';
import { MUNDO } from './ajustes.js';

// Abre el juego con ?debug en la URL para ver los cuerpos de física.
const depurar = new URLSearchParams(window.location.search).has('debug');

export const config = {
  type: Phaser.AUTO,
  parent: 'juego',
  width: 960,
  height: 540,
  backgroundColor: '#172638',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: MUNDO.gravedad },
      fixedStep: true,
      fps: 60,
      debug: depurar
    }
  },
  // La primera escena es la que arranca. EscenaPrueba es temporal hasta el flujo de escenas (T09).
  scene: [EscenaPrueba, EscenaInicial]
};
