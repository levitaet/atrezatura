import Phaser from 'phaser';

export const TAMANO_CELDA = 32;

// ---------------------------------------------------------------------------
// Valores ajustables. Cambia un número, guarda y el navegador se recarga solo.
// Unidades: píxeles, px/s (velocidad), px/s² (aceleración) y milisegundos (ms).
// ---------------------------------------------------------------------------

export const MUNDO = {
  gravedad: 1000 // px/s². Más alto = cae más rápido y los saltos se sienten más pesados.
};

export const JUGADOR = {
  // Movimiento horizontal
  velocidadMax: 260, // px/s caminando
  aceleracionSuelo: 2400, // qué tan rápido alcanza la velocidad máxima en el suelo
  frenadoSuelo: 3000, // qué tan rápido se detiene al soltar A/D en el suelo
  aceleracionAire: 1400, // control en el aire (más bajo = menos control)
  frenadoAire: 350, // qué tan rápido pierde el impulso en el aire (bajo = conserva el empuje del extintor)

  // Salto
  fuerzaSalto: 520, // px/s hacia arriba. Altura ≈ fuerza² / (2 × gravedad) ≈ 135 px ≈ 4 celdas
  cortaSalto: 0.45, // al soltar W antes de tiempo, la velocidad de subida se multiplica por esto
  tiempoCoyote: 100, // ms en que aún puede saltar después de salir de un borde
  bufferSalto: 120, // ms en que se recuerda un W apretado justo antes de aterrizar
  caidaMax: 900, // px/s velocidad máxima de caída

  // Plataformas finas (=)
  tiempoBajando: 220 // ms en que ignora las plataformas finas al apretar S
};

export const CAMARA = {
  suavizado: 0.12, // 0–1. Más bajo = la cámara sigue con más retraso
  zonaMuertaAncho: 160, // px en que el jugador se mueve sin que la cámara lo siga
  zonaMuertaAlto: 100
};

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
  }
};
