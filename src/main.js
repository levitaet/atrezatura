import Phaser from 'phaser';
import { config } from './config.js';

import EscenaInicial from './scenes/EscenaInicial.js';

new Phaser.Game({ ...config, scene: [EscenaInicial] });
