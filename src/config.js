import Phaser from 'phaser';
import EscenaInicial from './scenes/EscenaInicial.js';

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
      gravity: { x: 0, y: 1000 },
      fixedStep: true,
      fps: 60
    }
  },
  scene: [EscenaInicial]
};
