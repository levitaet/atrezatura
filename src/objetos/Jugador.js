import Phaser from 'phaser';
import { EXTINTOR, JUGADOR } from '../config.js';
import Extintor from './Extintor.js';

const TEXTURA_TEMPORAL = 'jugador-temp';
const SPRITE = 'felipito'; // public/assets/sprites/felipito.png (lo carga Juego.preload)

// Mueve un valor hacia un objetivo sin pasarse.
function acercar(valor, objetivo, paso) {
  if (valor < objetivo) return Math.min(valor + paso, objetivo);
  return Math.max(valor - paso, objetivo);
}

/**
 * El oficinista. Camina con A/D, salta con W, baja de plataformas finas (=) con S
 * y se propulsa con el extintor usando las flechas (ver Extintor.js).
 * Mantener Espacio en el suelo lo planta: queda quieto aunque dispare (para apuntar a computadores).
 * La escena Juego lo crea en el inicio del mapa y registra sus colisiones (ver Juego.crearJugador).
 *
 * El movimiento horizontal acelera hacia la velocidad deseada en vez de fijarla, para que los
 * impulsos externos (el extintor, T06) se conserven en el aire.
 */
export default class Jugador extends Phaser.Physics.Arcade.Sprite {
  constructor(escena, x, y) {
    const conSprite = escena.textures.exists(SPRITE);
    if (!conSprite) Jugador.crearTexturaTemporal(escena);
    super(escena, x, y, conSprite ? SPRITE : TEXTURA_TEMPORAL);

    escena.add.existing(this);
    escena.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    if (conSprite) {
      // El dibujo de Rocío mide 128 × 128; el cuerpo de física se ajusta a Felipito, no al lienzo.
      const { escala, cuerpo } = JUGADOR.sprite;
      this.setScale(escala);
      this.body.setSize(cuerpo.ancho, cuerpo.alto);
      this.body.setOffset(cuerpo.x, cuerpo.y);
      Jugador.crearAnimaciones(escena);
      this.play('felipito-quieto');
    }
    this.conSprite = conSprite;

    this.teclas = escena.input.keyboard.addKeys({
      izquierda: Phaser.Input.Keyboard.KeyCodes.A,
      derecha: Phaser.Input.Keyboard.KeyCodes.D,
      saltar: Phaser.Input.Keyboard.KeyCodes.W,
      bajar: Phaser.Input.Keyboard.KeyCodes.S
    });
    // Sin captura (false): así Espacio sigue activando los botones de los menús.
    this.teclaAnclar = escena.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE, false);

    this.mirando = 1; // 1 = derecha, -1 = izquierda
    this.ultimoEnSuelo = -Infinity;
    this.ultimoSaltoPedido = -Infinity;
    this.bajandoHasta = -Infinity;
    this.saltando = false; // true mientras sube por un salto (no por el extintor)
    this.invulnerableHasta = -Infinity;
    // Reloj propio en ms: solo avanza mientras la escena corre, así la pausa no gasta
    // invulnerabilidad ni ventanas de salto (el reloj de escena sigue avanzando en pausa).
    this.reloj = 0;

    this.extintor = new Extintor(escena, this);
  }

  // Dibujo temporal hasta tener el sprite de Rocío (T11/T25).
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

  static crearAnimaciones(escena) {
    const anims = escena.anims;
    if (anims.exists('felipito-quieto')) return;
    const { animaciones } = JUGADOR.sprite;
    anims.create({ key: 'felipito-quieto', frames: anims.generateFrameNumbers(SPRITE, { frames: animaciones.quieto }) });
    anims.create({
      key: 'felipito-caminar',
      frames: anims.generateFrameNumbers(SPRITE, { frames: animaciones.caminar }),
      frameRate: animaciones.fpsCaminar,
      repeat: -1
    });
    anims.create({ key: 'felipito-aire', frames: anims.generateFrameNumbers(SPRITE, { frames: animaciones.aire }) });
    // El cuadro 0 del original está vacío; el 1 contiene la pose con las manos levantadas.
    anims.create({ key: 'felipito-disparar', frames: [{ key: 'felipito-con-extintor', frame: 1 }] });
  }

  // Distancia desde el centro del sprite hasta los pies (borde inferior del cuerpo de física).
  piesDesdeCentro() {
    const b = this.body;
    return (b.offset.y + b.sourceHeight) * this.scaleY - this.displayHeight * this.originY;
  }

  // Ubica al jugador con los pies en yPies (por ejemplo, el suelo de una celda).
  colocar(x, yPies) {
    this.body.reset(x, yPies - this.piesDesdeCentro());
  }

  get enSuelo() {
    return this.body.blocked.down || this.body.touching.down;
  }

  // Plantado con Espacio: solo en el suelo. En el aire no hace nada (no sirve para flotar).
  get anclado() {
    return this.teclaAnclar.isDown && this.enSuelo;
  }

  esInvulnerable() {
    return this.reloj < this.invulnerableHasta;
  }

  // Vuelve a un punto (pies en yPies) sin velocidad, con la carga llena e invulnerable un rato (T16).
  reaparecer(x, yPies) {
    this.colocar(x, yPies);
    this.extintor.recargar();
    this.saltando = false;
    this.ultimoSaltoPedido = -Infinity;
    this.invulnerableHasta = this.reloj + JUGADOR.tiempoInvulnerable;
  }

  // Mientras es true, la escena debe ignorar las colisiones con plataformas atravesables.
  estaBajando() {
    return this.reloj < this.bajandoHasta;
  }

  preUpdate(tiempo, delta) {
    super.preUpdate(tiempo, delta);
    const dt = delta / 1000;
    this.reloj += delta;
    const ahora = this.reloj;
    const cuerpo = this.body;
    const { teclas } = this;

    // --- Horizontal
    const anclado = this.anclado;
    const direccion = anclado ? 0 : (teclas.derecha.isDown ? 1 : 0) - (teclas.izquierda.isDown ? 1 : 0);
    const suelo = this.enSuelo;
    const vx = cuerpo.velocity.x;
    const excedeMaximo = Math.sign(vx) === direccion && Math.abs(vx) > JUGADOR.velocidadMax;

    const disparando = this.extintor.disparando;

    let tasa;
    if (anclado) {
      tasa = JUGADOR.frenadoSuelo; // plantado: se detiene aunque esté disparando
    } else if (direccion === 0 || excedeMaximo) {
      // Mientras dispara no frena solo: el empuje del extintor manda.
      tasa = disparando ? 0 : suelo ? JUGADOR.frenadoSuelo : JUGADOR.frenadoAire;
    } else {
      tasa = suelo ? JUGADOR.aceleracionSuelo : JUGADOR.aceleracionAire;
    }
    cuerpo.setVelocityX(acercar(vx, direccion * JUGADOR.velocidadMax, tasa * dt));

    // Mira hacia donde camina. Si dispara de lado: en modo 'apuntar' mira hacia la boquilla;
    // en modo 'mover', hacia donde lo lleva el empuje.
    const sentidoMirada = EXTINTOR.modoFlechas === 'mover' ? -1 : 1;
    const haciaBoquilla = disparando ? sentidoMirada * Math.sign(this.extintor.direccion.x) : 0;
    const mirar = haciaBoquilla || direccion;
    if (mirar !== 0) {
      this.mirando = mirar;
      this.setFlipX(mirar < 0);
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
    if (disparando) this.saltando = false;
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

    // --- Parpadeo mientras es invulnerable
    this.setAlpha(this.esInvulnerable() && Math.floor(ahora / 90) % 2 === 0 ? 0.3 : 1);

    // --- Animación
    if (this.conSprite) {
      let animacion = 'felipito-quieto';
      if (disparando) animacion = 'felipito-disparar';
      else if (!suelo) animacion = 'felipito-aire';
      else if (Math.abs(cuerpo.velocity.x) > 20) animacion = 'felipito-caminar';
      this.play(animacion, true);
    }

    this.extintor.actualizarDibujo(delta);
  }
}
