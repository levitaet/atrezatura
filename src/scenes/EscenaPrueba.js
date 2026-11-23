import Phaser from 'phaser';
import Jugador from '../objetos/Jugador.js';
import { CAMARA } from '../ajustes.js';

const TILE = 32;
const ANCHO = 100 * TILE; // 3200 px
const ALTO = 34 * TILE; // 1088 px
const SUELO = ALTO - 2 * TILE; // borde superior del suelo

/**
 * Sala de prueba para T05/T06: probar caminar, saltar, bajar por escritorios y la cámara.
 * Geometría temporal hecha con rectángulos; se reemplaza por el cargador de mapas (T08) y por
 * los diseños de Benja (T10). Abre el juego con ?debug para ver los cuerpos de física.
 */
export default class EscenaPrueba extends Phaser.Scene {
  constructor() {
    super('EscenaPrueba');
  }

  create() {
    this.physics.world.setBounds(0, 0, ANCHO, ALTO);
    this.add.grid(ANCHO / 2, ALTO / 2, ANCHO, ALTO, TILE, TILE, 0x172638, 1, 0x1f3048, 1);

    this.solidos = [];
    this.atravesables = [];

    // Suelo con un hueco (salto con carrera)
    this.bloque(0, SUELO, 44, 2);
    this.bloque(49, SUELO, 51, 2);
    this.etiqueta(46.5, SUELO - 2.5, 'hueco: salta corriendo');

    // Escalones: saltos de 1, 2 y 3 tiles
    this.bloque(10, SUELO - TILE, 4, 1);
    this.bloque(14, SUELO - 2 * TILE, 4, 2);
    this.bloque(18, SUELO - 3 * TILE, 4, 3);
    this.etiqueta(16, SUELO - 4.5 * TILE, 'escalones 1 · 2 · 3 tiles');

    // Escritorios atravesables: sube saltando, baja con S
    this.escritorio(26, SUELO - 3 * TILE, 5);
    this.escritorio(30, SUELO - 6 * TILE, 5);
    this.escritorio(26, SUELO - 9 * TILE, 5);
    this.etiqueta(29.5, SUELO - 11 * TILE, 'escritorios: sube con W, baja con S');

    // Muro de 4 tiles: se pasa saltando
    this.bloque(38, SUELO - 4 * TILE, 2, 4);
    this.etiqueta(39, SUELO - 5.5 * TILE, 'muro de 4: salto máximo');

    // Muro de 7 tiles: imposible sin el extintor (T06)
    this.bloque(62, SUELO - 7 * TILE, 2, 7);
    this.etiqueta(63, SUELO - 8.5 * TILE, 'muro de 7: necesita el extintor (T06)');

    // Zona alta para probar la cámara vertical
    this.escritorio(70, SUELO - 3 * TILE, 4);
    this.escritorio(75, SUELO - 6 * TILE, 4);
    this.escritorio(80, SUELO - 9 * TILE, 4);
    this.escritorio(85, SUELO - 12 * TILE, 4);
    this.bloque(90, SUELO - 15 * TILE, 10, 1);
    this.etiqueta(95, SUELO - 16.5 * TILE, 'arriba: la cámara sigue en vertical');

    // Jugador
    this.jugador = new Jugador(this, 3 * TILE, SUELO - TILE);
    this.physics.add.collider(this.jugador, this.solidos);
    this.physics.add.collider(this.jugador, this.atravesables, null, () => !this.jugador.estaBajando());

    // Cámara
    const camara = this.cameras.main;
    camara.setBounds(0, 0, ANCHO, ALTO);
    camara.startFollow(this.jugador, true, CAMARA.suavizado, CAMARA.suavizado);
    camara.setDeadzone(CAMARA.zonaMuertaAncho, CAMARA.zonaMuertaAlto);

    // Ayuda fija en pantalla
    this.add
      .text(16, 16, 'A / D caminar · W saltar (mantén para más alto) · S bajar de un escritorio · R reiniciar', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#e8eef5',
        backgroundColor: '#101820cc',
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.input.keyboard.on('keydown-R', () => this.scene.restart());
  }

  // Bloque sólido. x, ancho y alto en tiles; y en píxeles (borde superior).
  bloque(xTiles, y, anchoTiles, altoTiles) {
    const w = anchoTiles * TILE;
    const h = altoTiles * TILE;
    const r = this.add.rectangle(xTiles * TILE + w / 2, y + h / 2, w, h, 0x4a5d78).setStrokeStyle(2, 0x6c84a6);
    this.physics.add.existing(r, true);
    this.solidos.push(r);
    return r;
  }

  // Plataforma que solo choca por arriba (se atraviesa desde abajo y con S).
  escritorio(xTiles, y, anchoTiles) {
    const w = anchoTiles * TILE;
    const h = TILE / 2;
    const r = this.add.rectangle(xTiles * TILE + w / 2, y + h / 2, w, h, 0x9a6b3f).setStrokeStyle(2, 0xc48a55);
    this.physics.add.existing(r, true);
    const c = r.body.checkCollision;
    c.down = false;
    c.left = false;
    c.right = false;
    this.atravesables.push(r);
    return r;
  }

  etiqueta(xTiles, y, texto) {
    this.add
      .text(xTiles * TILE, y, texto, { fontFamily: 'monospace', fontSize: '12px', color: '#8fa6c4' })
      .setOrigin(0.5);
  }
}
