import Phaser from 'phaser';
import { crearNivel } from '../niveles/crearNivel.js';
import Jugador from '../objetos/Jugador.js';
import { CAMARA, TAMANO_CELDA } from '../config.js';
import { conectarMonitor } from '../dialogos.js';
import { conectarCorazones } from '../reglas/corazones.js';
import { conectarComputadores } from '../reglas/computadores.js';
import { conectarRevelacion } from '../reglas/revelacion.js';
import { conectarMastermind } from '../reglas/mastermind.js';
import { conectarCompletos } from '../reglas/completo.js';
import { mostrarHud } from './Hud.js';

export default class Juego extends Phaser.Scene {
  constructor() {
    super('Juego');
  }

  // Sprites exportados con tools/exportar_resprite.py (Vite sirve public/ en la raíz).
  preload() {
    this.load.spritesheet('felipito', 'assets/sprites/felipito.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image('completo', 'assets/sprites/completo-italiano.png');
    this.load.spritesheet('felipito-con-extintor', 'assets/sprites/felipito-con-extintor.png', { frameWidth: 128, frameHeight: 128 });
    for (const nombre of ['extintor', 'mastermind', 'fondo-noche']) {
      this.load.image(nombre, `assets/sprites/${nombre}.png`);
    }
  }

  create() {
    conectarMonitor(this);
    this.nivel = null;
    this.enTransicion = false;
    const alContinuar = () => { this.enTransicion = false; };
    this.events.on('resume', alContinuar);
    this.events.once('shutdown', () => this.events.off('resume', alContinuar));
    const pausar = (evento) => {
      if (evento.repeat || this.enTransicion) return;
      this.enTransicion = true;
      this.scene.pause();
      this.scene.launch('Pausa');
    };
    this.input.keyboard.on('keydown-ESC', pausar);
    this.input.keyboard.on('keydown-P', pausar);
    const nombre = new URLSearchParams(window.location.search).get('nivel') ?? 'base';
    try {
      this.nivel = crearNivel(this, nombre);
    } catch (error) {
      this.add.text(24, 24, `Error al cargar el mapa\n${error.message}`, {
        fontSize: '20px', wordWrap: { width: this.scale.width - 48 }
      });
      return;
    }
    this.crearJugador();
    conectarCorazones(this);
    conectarComputadores(this);
    conectarMastermind(this);
    conectarCompletos(this);
    conectarRevelacion(this);
    mostrarHud(this);
  }

  crearJugador() {
    const { inicio, solidos } = this.nivel;
    const jugador = new Jugador(this, inicio.x, inicio.y);
    // Apoya los pies en el borde inferior de la celda P.
    jugador.colocar(inicio.x, inicio.y + TAMANO_CELDA / 2);
    this.jugador = jugador;
    for (const marca of this.nivel.entidades.get('P') ?? []) marca.setVisible(false);

    // Las plataformas finas (=) solo chocan por arriba; con S el jugador las atraviesa.
    const esFina = (bloque) => !bloque.body.checkCollision.down;
    this.physics.add.collider(jugador, solidos, null, (_j, bloque) => !(jugador.estaBajando() && esFina(bloque)));

    const camara = this.cameras.main;
    camara.startFollow(jugador, true, CAMARA.suavizado, CAMARA.suavizado);
    camara.setDeadzone(CAMARA.zonaMuertaAncho, CAMARA.zonaMuertaAlto);

    // Una tecla soltada durante la pausa no debe quedar "pegada" al continuar.
    const soltarTeclas = () => this.input.keyboard.resetKeys();
    this.events.on('resume', soltarTeclas);
    this.events.once('shutdown', () => this.events.off('resume', soltarTeclas));
  }

  ganar() {
    this.terminar('Victoria');
  }

  perder() {
    this.terminar('Derrota');
  }

  terminar(destino) {
    if (this.enTransicion || !this.scene.isActive()) return;
    this.enTransicion = true;
    this.scene.start(destino);
  }
}
