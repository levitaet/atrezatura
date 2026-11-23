import Phaser from 'phaser';
import { JUGADOR } from '../ajustes.js';

const TEXTURA_TEMPORAL = 'jugador-temp';

// Mueve un valor hacia un objetivo sin pasarse.
function acercar(valor, objetivo, paso) {
  if (valor < objetivo) return Math.min(valor + paso, objetivo);
  return Math.max(valor - paso, objetivo);
}

/**
 * El oficinista. Camina con A/D, salta con W y baja de plataformas atravesables con S.
 *
 * Uso en una escena:
 *   this.jugador = new Jugador(this, x, y);
 *   this.physics.add.collider(this.jugador, solidos);
 *   this.physics.add.collider(this.jugador, atravesables, null, () => !this.jugador.estaBajando());
 *
 * El movimiento horizontal acelera hacia la velocidad deseada en vez de fijarla, para que los
 * impulsos externos (el extintor, T06) se conserven en el aire.
 */
export default class Jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(escena, x, y) {
    Jugador.crearTexturaTemporal(escena);
    super(escena, x, y, TEXTURA_TEMPORAL);

    escena.add.existing(this);
    escena.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    this.teclas = escena.input.keyboard.addKeys({
      izquierda: Phaser.Input.Keyboard.KeyCodes.A,
      derecha: Phaser.Input.Keyboard.KeyCodes.D,
      saltar: Phaser.Input.Keyboard.KeyCodes.W,
      bajar: Phaser.Input.Keyboard.KeyCodes.S
    });

    this.mirando = 1; // 1 = derecha, -1 = izquierda
    this.ultimoEnSuelo = -Infinity;
    this.ultimoSaltoPedido = -Infinity;
    this.bajandoHasta = -Infinity;
    this.saltando = false; // true mientras sube por un salto (no por el extintor)
  }

  // Rectángulo temporal hasta tener el sprite de Rocío (T11/T25).
  static crearTexturaTemporal(escena) {
    if (escena.textures.exists(TEXTURA_TEMPORAL)) return;
    const g = escena.make.graphics({ add: false });
    g.fillStyle(0xf2c14e).fillRect(0, 0, 28, 44); // camisa
    g.fillStyle(0x2b3a55).fillRect(0, 28, 28, 16); // pantalón
    g.fillStyle(0xc0392b).fillRect(12, 12, 4, 14); // corbata
    g.fillStyle(0x101820).fillRect(19, 6, 4, 4); // ojo: muestra hacia dónde mira
    g.generateTexture(TEXTURA_TEMPORAL, 28, 44);
    g.destroy();
  }

  get enSuelo() {
    return this.body.blocked.down || this.body.touching.down;
  }

  // Mientras es true, la escena debe ignorar las colisiones con plataformas atravesables.
  estaBajando() {
    return this.scene.time.now < this.bajandoHasta;
  }

  preUpdate(tiempo, delta) {
    super.preUpdate(tiempo, delta);
    const dt = delta / 1000;
    const ahora = this.scene.time.now;
    const cuerpo = this.body;
    const { teclas } = this;

    // --- Horizontal
    const direccion = (teclas.derecha.isDown ? 1 : 0) - (teclas.izquierda.isDown ? 1 : 0);
    const suelo = this.enSuelo;
    const vx = cuerpo.velocity.x;
    const excedeMaximo = Math.sign(vx) === direccion && Math.abs(vx) > JUGADOR.velocidadMax;

    let tasa;
    if (direccion === 0 || excedeMaximo) {
      tasa = suelo ? JUGADOR.frenadoSuelo : JUGADOR.frenadoAire;
    } else {
      tasa = suelo ? JUGADOR.aceleracionSuelo : JUGADOR.aceleracionAire;
    }
    cuerpo.setVelocityX(acercar(vx, direccion * JUGADOR.velocidadMax, tasa * dt));

    if (direccion !== 0) {
      this.mirando = direccion;
      this.setFlipX(direccion < 0);
    }

    // --- Salto (con tiempo coyote y buffer)
    if (suelo) this.ultimoEnSuelo = ahora;
    if (Phaser.Input.Keyboard.JustDown(teclas.saltar)) this.ultimoSaltoPedido = ahora;

    const puedeSaltar = ahora - this.ultimoEnSuelo <= JUGADOR.tiempoCoyote;
    const pidioSalto = ahora - this.ultimoSaltoPedido <= JUGADOR.bufferSalto;
    if (puedeSaltar && pidioSalto) {
      cuerpo.setVelocityY(-JUGADOR.fuerzaSalto);
      this.ultimoEnSuelo = -Infinity;
      this.ultimoSaltoPedido = -Infinity;
      this.saltando = true;
    }

    // Salto variable: soltar W corta la subida. Solo afecta al salto, no al empuje del extintor.
    if (this.saltando && !teclas.saltar.isDown && cuerpo.velocity.y < 0) {
      cuerpo.setVelocityY(cuerpo.velocity.y * JUGADOR.cortaSalto);
      this.saltando = false;
    }
    if (cuerpo.velocity.y >= 0) this.saltando = false;

    // --- Bajar por plataformas atravesables
    if (suelo && Phaser.Input.Keyboard.JustDown(teclas.bajar)) {
      this.bajandoHasta = ahora + JUGADOR.tiempoBajando;
    }

    // --- Caída máxima
    if (cuerpo.velocity.y > JUGADOR.caidaMax) cuerpo.setVelocityY(JUGADOR.caidaMax);
  }
}
