import Phaser from 'phaser';
import '@fontsource/press-start-2p/latin.css';
import '@fontsource/vt323/index.css';
import './estilos.css';
import { config } from './config.js';

import Juego from './scenes/Juego.js';
import { Inicio, Introduccion, Pausa, Resultado } from './scenes/Menus.js';

// Phaser dibuja los textos del canvas (carteles) con la fuente disponible al crearlos:
// se espera a que las fuentes pixel estén cargadas antes de arrancar.
const fuentes = ['16px "Press Start 2P"', '16px "VT323"'].map((f) => document.fonts.load(f));
Promise.allSettled(fuentes).then(() => {
  const juego = new Phaser.Game({
    ...config,
    scene: [Inicio, Introduccion, Juego, Pausa, new Resultado('Victoria'), new Resultado('Derrota')]
  });
  // Solo en desarrollo: permite inspeccionar el juego desde la consola del navegador (window.juego).
  if (import.meta.env.DEV) window.juego = juego;
});
