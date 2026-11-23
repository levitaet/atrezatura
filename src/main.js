import Phaser from 'phaser';
import { config } from './config.js';

import Juego from './scenes/Juego.js';
import { Inicio, Pausa, Resultado } from './scenes/Menus.js';

new Phaser.Game({
  ...config,
  scene: [Inicio, Juego, Pausa, new Resultado('Victoria'), new Resultado('Derrota')]
});
