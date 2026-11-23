import Phaser from 'phaser';
import { config } from './config.js';

import Juego from './scenes/Juego.js';
import { Inicio, Pausa, Resultado } from './scenes/Menus.js';

const juego = new Phaser.Game({
  ...config,
  scene: [Inicio, Juego, Pausa, new Resultado('Victoria'), new Resultado('Derrota')]
});

// Solo en desarrollo: permite inspeccionar el juego desde la consola del navegador (window.juego).
if (import.meta.env.DEV) window.juego = juego;
