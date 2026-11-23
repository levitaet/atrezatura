import Phaser from 'phaser';

/**
 * Números de daño estilo Fortnite: mientras el chorro golpea algo, saltan números que suben y se
 * desvanecen. Siempre dicen 23 (el número escondido del juego).
 *
 * numeroDanio(escena, objetivo, x, y)        → número normal (amarillo), como mucho cada 140 ms
 *                                              por objetivo.
 * numeroDanio(escena, objetivo, x, y, true)  → golpe final (rojo y más grande).
 */
const INTERVALO = 140;
const RESOLUCION = 6; // el texto se agranda con el zoom de la cámara: renderizar nítido

export function numeroDanio(escena, objetivo, x, y, final = false) {
  const ahora = escena.jugador?.reloj ?? 0;
  if (!final && ahora < (objetivo.proximoNumeroDanio ?? 0)) return;
  objetivo.proximoNumeroDanio = ahora + INTERVALO;

  const texto = escena.add
    .text(x + Phaser.Math.Between(-12, 12), y + Phaser.Math.Between(-6, 6), '23', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: final ? '16px' : '10px',
      color: final ? '#fe6960' : '#ffd34d',
      stroke: '#1a1206',
      strokeThickness: final ? 4 : 3,
      resolution: RESOLUCION
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setScale(0.6);

  // Aparece de golpe (crece) y luego sube desvaneciéndose.
  escena.tweens.add({ targets: texto, scale: 1, duration: 90, ease: 'Back.easeOut' });
  escena.tweens.add({
    targets: texto,
    y: texto.y - (final ? 40 : 28),
    alpha: 0,
    delay: final ? 350 : 180,
    duration: final ? 700 : 520,
    ease: 'Cubic.easeIn',
    onComplete: () => texto.destroy()
  });
}
