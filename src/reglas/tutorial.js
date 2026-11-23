import Phaser from 'phaser';
import { TAMANO_CELDA, TUTORIAL } from '../config.js';

/**
 * Objetos del tutorial.
 *
 * e · Extintor para recoger. Si el mapa tiene una 'e', Felipito empieza SIN extintor y lo
 *     obtiene al tocarla. En los demás niveles ya lo tiene desde el inicio.
 * T · Muñeco de práctica: un cartel de cartón del "Empleado del mes" que bloquea el paso.
 *     Se derriba con TUTORIAL.resistenciaMuneco segundos de chorro. Sirve para aprender a
 *     plantarse con Espacio: sin plantarse, el chorro aleja a Felipito del cartel, y él lo
 *     comenta (pensamiento 'muneco_sin_espacio').
 */
export function conectarTutorial(escena) {
  const { jugador, nivel } = escena;
  const lado = TAMANO_CELDA;

  // --- Extintor para recoger
  const extintores = nivel.entidades.get('e') ?? [];
  if (extintores.length > 0) jugador.extintor.habilitado = false;
  for (const marcador of extintores) {
    marcador.setVisible(false);
    // El dibujo ocupa ~60 × 84 px del lienzo de 128 y su base está en y ≈ 103.
    const dibujo = escena.textures.exists('extintor')
      ? escena.add.image(marcador.x, marcador.y + lado / 2, 'extintor').setOrigin(0.5, 103 / 128).setScale(0.45)
      : escena.add.rectangle(marcador.x, marcador.y + lado / 2, 14, 28, 0xd33b2c).setOrigin(0.5, 1);
    const brillo = escena.tweens.add({ targets: dibujo, alpha: 0.55, duration: 450, yoyo: true, repeat: -1 });
    const zona = escena.add.zone(marcador.x, marcador.y, lado, lado * 2);
    escena.physics.add.existing(zona, true);
    const contacto = escena.physics.add.overlap(jugador, zona, () => {
      contacto.destroy();
      brillo.stop();
      dibujo.destroy();
      jugador.extintor.habilitado = true;
      jugador.extintor.recargar();
      escena.events.emit('extintor-recogido');
      escena.pensar?.('extintor');
    });
  }

  // --- Muñeco de práctica
  const muros = escena.physics.add.staticGroup();
  const munecos = (nivel.entidades.get('T') ?? []).map((marcador) => {
    marcador.setVisible(false);
    crearTexturaMuneco(escena);
    const piso = marcador.y + lado / 2;
    const dibujo = escena.add.image(marcador.x, piso, 'muneco-temp').setOrigin(0.5, 1);
    const cuerpo = escena.add.rectangle(marcador.x, piso - lado, lado - 6, lado * 2);
    cuerpo.setVisible(false);
    muros.add(cuerpo);
    return {
      dibujo,
      cuerpo,
      vida: TUTORIAL.resistenciaMuneco,
      caido: false,
      golpeadoHasta: -Infinity,
      limites: new Phaser.Geom.Rectangle(marcador.x - lado / 2, piso - lado * 2, lado, lado * 2)
    };
  });
  escena.physics.add.collider(jugador, muros);

  // Rociar el cartel sin plantarse empuja a Felipito hacia atrás: él se da cuenta (con pausa
  // entre comentarios para no repetirlo en cada ráfaga).
  let proximoComentario = 0;
  const paso = (delta) => {
    const extintor = jugador.extintor;
    if (!extintor.disparando) return;
    for (const m of munecos) {
      if (m.caido || !extintor.alcanza(m.limites)) continue;
      if (!jugador.anclado && jugador.reloj >= proximoComentario && Math.abs(jugador.body.velocity.x) > 150) {
        proximoComentario = jugador.reloj + 5000;
        escena.pensar?.('muneco_sin_espacio');
      }
      m.vida -= delta;
      m.golpeadoHasta = jugador.reloj + 90;
      if (m.vida <= 0) derribar(m);
    }
  };
  const mundo = escena.physics.world;
  mundo.on('worldstep', paso);

  const temblar = () => {
    for (const m of munecos) {
      if (m.caido) continue;
      const golpeado = jugador.reloj < m.golpeadoHasta;
      m.dibujo.angle = golpeado ? Phaser.Math.Between(-6, 6) : 0;
    }
  };
  escena.events.on('update', temblar);

  function derribar(m) {
    m.caido = true;
    m.cuerpo.body.enable = false;
    const sentido = jugador.x < m.dibujo.x ? 1 : -1;
    escena.tweens.add({ targets: m.dibujo, angle: 90 * sentido, y: m.dibujo.y + 4, duration: 380, ease: 'Bounce.easeOut' });
    escena.tweens.add({ targets: m.dibujo, alpha: 0.5, delay: 600, duration: 400 });
    escena.events.emit('muneco-derribado');
    escena.pensar?.('muneco');
  }

  escena.events.once('shutdown', () => {
    mundo.off('worldstep', paso);
    escena.events.off('update', temblar);
  });
}

// Cartel de cartón "EMPLEADO DEL MES" con diana, provisorio hasta tener arte (32 × 64).
function crearTexturaMuneco(escena) {
  if (escena.textures.exists('muneco-temp')) return;
  const g = escena.make.graphics({ add: false });
  g.fillStyle(0x8a6a44).fillRect(14, 50, 4, 14); // pata
  g.fillStyle(0x5c4630).fillRect(6, 61, 20, 3); // base
  g.fillStyle(0xd9b98a).fillRect(2, 2, 28, 50); // cartón
  g.lineStyle(2, 0x8a6a44).strokeRect(2, 2, 28, 50);
  g.fillStyle(0xf2c14e).fillCircle(16, 16, 7); // cabeza
  g.fillStyle(0xffffff).fillRect(9, 24, 14, 16); // camisa
  g.fillStyle(0xc0392b).fillRect(15, 25, 2, 10); // corbata
  g.lineStyle(2, 0xfe6960).strokeCircle(16, 32, 11); // diana
  g.fillStyle(0xfe6960).fillCircle(16, 32, 3);
  g.fillStyle(0x3a2a1a).fillRect(6, 44, 20, 5); // placa
  g.generateTexture('muneco-temp', 32, 64);
  g.destroy();
}
