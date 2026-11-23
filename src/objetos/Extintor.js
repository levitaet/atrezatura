import Phaser from 'phaser';
import { EXTINTOR } from '../config.js';

const TEXTURA_CHORRO = 'chorro-temp';
const { KeyCodes } = Phaser.Input.Keyboard;

/**
 * El extintor del jugador (T06 + T07).
 *
 * - Flechas (y combinaciones para diagonales) disparan el chorro en 8 direcciones.
 *   EXTINTOR.modoFlechas decide si la flecha indica hacia dónde sale el chorro o hacia dónde moverse.
 * - Mientras dispara, empuja al jugador en sentido contrario al chorro.
 * - Tiene carga limitada: se gasta disparando y se recarga en el suelo sin disparar.
 *
 * El empuje y la carga se calculan en cada paso de física ('worldstep'), así la carga dura
 * lo mismo a 30, 60 o 144 FPS (ver docs/FISICAS.md).
 *
 * Para T14 (computadores): `jugador.extintor.alcanza(rectangulo)` dice si el chorro toca un
 * Phaser.Geom.Rectangle (por ejemplo `computador.getBounds()`) en este momento.
 */
export default class Extintor {
  constructor(escena, jugador) {
    this.escena = escena;
    this.jugador = jugador;
    this.carga = EXTINTOR.carga; // segundos de chorro disponibles
    this.disparando = false;
    this.direccion = { x: 0, y: 1 }; // hacia dónde sale el chorro (vector unitario)

    this.teclas = escena.input.keyboard.addKeys({
      arriba: KeyCodes.UP,
      abajo: KeyCodes.DOWN,
      izquierda: KeyCodes.LEFT,
      derecha: KeyCodes.RIGHT
    });

    Extintor.crearTexturaTemporal(escena);
    this.particulas = escena.add.particles(0, 0, TEXTURA_CHORRO, {
      emitting: false,
      speed: { min: 260, max: 420 },
      angle: { onEmit: () => this.angulo() + Phaser.Math.FloatBetween(-12, 12) },
      lifespan: { min: 220, max: 380 },
      scale: { start: 0.5, end: 2.2 },
      alpha: { start: 0.9, end: 0 }
    });
    this.particulas.setDepth(jugador.depth + 1);

    this.barra = escena.add.graphics().setDepth(jugador.depth + 2);

    this.mundo = escena.physics.world;
    this.mundo.on('worldstep', this.paso, this);
    jugador.once(Phaser.GameObjects.Events.DESTROY, () => this.destruir());
  }

  // Partícula temporal hasta tener el arte del chorro (T23).
  static crearTexturaTemporal(escena) {
    if (escena.textures.exists(TEXTURA_CHORRO)) return;
    const g = escena.make.graphics({ add: false });
    g.fillStyle(0xffffff).fillCircle(4, 4, 4);
    g.generateTexture(TEXTURA_CHORRO, 8, 8);
    g.destroy();
  }

  // Dirección en que sale el chorro según las flechas apretadas, normalizada. null si no hay ninguna.
  // En modo 'mover' las flechas indican hacia dónde ir, así que el chorro sale al lado contrario.
  direccionApuntada() {
    const t = this.teclas;
    const x = (t.derecha.isDown ? 1 : 0) - (t.izquierda.isDown ? 1 : 0);
    const y = (t.abajo.isDown ? 1 : 0) - (t.arriba.isDown ? 1 : 0);
    if (x === 0 && y === 0) return null;
    const signo = EXTINTOR.modoFlechas === 'mover' ? -1 : 1;
    const largo = Math.hypot(x, y);
    return { x: (signo * x) / largo, y: (signo * y) / largo };
  }

  angulo() {
    return Phaser.Math.RadToDeg(Math.atan2(this.direccion.y, this.direccion.x));
  }

  // Se ejecuta después de cada paso de física y decide el empuje del paso siguiente.
  paso(delta) {
    const cuerpo = this.jugador.body;
    const apuntada = this.direccionApuntada();

    if (apuntada && this.carga > 0) {
      this.direccion = apuntada;
      this.carga = Math.max(0, this.carga - delta);
      this.disparando = true;

      // Empuja en sentido contrario al chorro, pero no acelera más allá de EXTINTOR.velocidadMax
      // en esa dirección (así el chorro no se suma sin límite a un salto o a una caída).
      const ux = -apuntada.x;
      const uy = -apuntada.y;
      const velocidadEnEmpuje = cuerpo.velocity.x * ux + cuerpo.velocity.y * uy;
      if (velocidadEnEmpuje < EXTINTOR.velocidadMax) {
        cuerpo.setAcceleration(ux * EXTINTOR.empuje, uy * EXTINTOR.empuje);
      } else {
        cuerpo.setAcceleration(0, 0);
      }
      if (this.carga === 0) cuerpo.setAcceleration(0, 0);
      return;
    }

    this.disparando = false;
    cuerpo.setAcceleration(0, 0);
    // Recarga solo en el suelo y con las flechas sueltas: rozar una pared no recarga.
    if (!apuntada && this.jugador.enSuelo) {
      const porSegundo = EXTINTOR.carga / EXTINTOR.tiempoRecarga;
      this.carga = Math.min(EXTINTOR.carga, this.carga + porSegundo * delta);
    }
  }

  // Llenar la carga (por ejemplo al reaparecer en un checkpoint, T16).
  recargar() {
    this.carga = EXTINTOR.carga;
    this.disparando = false;
    this.jugador.body.setAcceleration(0, 0);
  }

  // Punto de donde sale el chorro.
  boquilla() {
    return {
      x: this.jugador.x + this.direccion.x * 16,
      y: this.jugador.y + this.direccion.y * 16
    };
  }

  // Segmento que cubre el chorro, desde la boquilla hasta EXTINTOR.alcance.
  lineaChorro() {
    const b = this.boquilla();
    return new Phaser.Geom.Line(
      b.x, b.y,
      b.x + this.direccion.x * EXTINTOR.alcance,
      b.y + this.direccion.y * EXTINTOR.alcance
    );
  }

  // true si el chorro está activo y toca el rectángulo.
  alcanza(rectangulo) {
    return this.disparando && Phaser.Geom.Intersects.LineToRectangle(this.lineaChorro(), rectangulo);
  }

  // Dibujo: partículas y barra de carga. Lo llama el jugador una vez por cuadro.
  actualizarDibujo(delta) {
    if (this.disparando) {
      const b = this.boquilla();
      this.particulas.emitParticleAt(b.x, b.y, Math.max(1, Math.round(delta / 6)));
    }

    const g = this.barra.clear();
    const llena = this.carga >= EXTINTOR.carga;
    if (llena && !this.disparando) return;
    const ancho = 32;
    const x = this.jugador.x - ancho / 2;
    const y = this.jugador.y - this.jugador.height / 2 - 10;
    const fraccion = this.carga / EXTINTOR.carga;
    g.fillStyle(0x101820, 0.8).fillRect(x - 1, y - 1, ancho + 2, 6);
    g.fillStyle(fraccion > 0 ? 0xe8f4ff : 0xfe6960).fillRect(x, y, ancho * fraccion, 4);
  }

  destruir() {
    this.mundo.off('worldstep', this.paso, this);
    this.particulas.destroy();
    this.barra.destroy();
  }
}
