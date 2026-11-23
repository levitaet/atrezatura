import Phaser from 'phaser';
import { config } from './config.js';

const juego = new Phaser.Game(config);

// Solo en desarrollo: permite inspeccionar el juego desde la consola del navegador (window.juego).
if (import.meta.env.DEV) window.juego = juego;
