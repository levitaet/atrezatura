import Phaser from 'phaser';
import { obtenerDialogo } from '../dialogos.js';
import despierto from '../arte/prologo/despierto.png';
import ventana from '../arte/prologo/ventana.png';
import escalera from '../arte/prologo/escalera.png';
import monitores from '../arte/prologo/monitores.png';
import './menus.css';

// Los botones nativos comparten la misma acción con ratón, Tab, Enter y Espacio.
function mostrarMenu(escena, titulo, opciones, contenido) {
  const panel = document.createElement('section');
  panel.className = 'menu';
  const encabezado = document.createElement('h1');
  encabezado.append(titulo);
  panel.append(encabezado);
  if (contenido) panel.append(contenido);
  let elegida = false;
  for (const [texto, accion] of opciones) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.onclick = () => {
      if (elegida) return;
      elegida = true;
      accion();
    };
    panel.append(boton);
  }
  escena.game.canvas.parentElement.append(panel);
  const primero = panel.querySelector('button');
  primero.focus({ preventScroll: true });
  escena.events.once('shutdown', () => panel.remove());
  return primero;
}

export class Inicio extends Phaser.Scene {
  constructor() { super('Inicio'); }

  create() {
    const logo = new Image();
    logo.src = `${import.meta.env.BASE_URL}assets/menu/masteria.png`;
    logo.alt = 'MasterIA';
    logo.className = 'logo-inicio';
    mostrarMenu(this, logo, [
      ['Empezar', () => {
        this.registry.remove('nivelActual'); // empezar siempre desde el primer nivel (o ?nivel=)
        this.scene.start('Introduccion', { descenso: false });
      }]
    ]);
  }
}

export class Introduccion extends Phaser.Scene {
  constructor() { super('Introduccion'); }

  create(datos = {}) {
    const pagina = document.createElement('section');
    pagina.className = 'menu prologo';
    pagina.setAttribute('aria-label', 'Prólogo de MasterIA');
    const imagen = new Image();
    const planos = datos.descenso ? [
      { src: escalera, piso: 'Piso 23', alt: 'Felipito baja con el extintor por la escalera de emergencia.', texto: 'Veintitrés pisos. Uno a la vez.', pensamiento: true },
      { src: monitores, piso: 'Piso 22', alt: 'Los monitores encendidos giran sus ojos rojos hacia Felipito.', texto: '¿Hola? ¿Hay alguien ahí?' },
      { src: monitores, piso: 'Piso 22', alt: 'Todos los ojos de las pantallas miran hacia la puerta.', texto: 'Esos ojos… me siguen. Tengo que pasar sin que me alcancen.', pensamiento: true }
    ] : [
      { src: despierto, piso: 'Piso 23', alt: 'Felipito levanta la cabeza del escritorio.', texto: '¿Me quedé dormido en el trabajo? ¿Qué hora es?' },
      { src: ventana, piso: 'Piso 23', alt: 'Por la ventana se ven incendios y edificios derrumbados.', texto: '¿D-dónde estoy? ¿Qué pasó ahí afuera?', pensamiento: true },
      { src: ventana, piso: 'Piso 23', alt: 'Felipito observa la ciudad en llamas.', texto: 'Tengo que salir del edificio.' }
    ];
    const marco = document.createElement('div');
    marco.className = 'prologo-marco';
    const pie = document.createElement('div');
    pie.className = 'prologo-pie';
    const dialogo = document.createElement('p');
    const piso = document.createElement('strong');
    piso.className = 'prologo-piso';
    dialogo.setAttribute('aria-live', 'polite');
    const continuar = document.createElement('button');
    continuar.type = 'button';
    let indice = 0;
    const mostrarPlano = () => {
      const plano = planos[indice];
      imagen.src = plano.src;
      imagen.alt = plano.alt;
      piso.textContent = plano.piso;
      dialogo.classList.toggle('pensamiento', Boolean(plano.pensamiento));
      dialogo.textContent = plano.pensamiento ? `(${plano.texto})` : plano.texto;
      continuar.textContent = indice === planos.length - 1 ? (datos.descenso ? 'Entrar al nivel 1' : 'Buscar la salida') : 'Continuar';
    };
    continuar.addEventListener('click', () => {
      if (indice === planos.length - 1) {
        continuar.disabled = true;
        this.scene.start('Juego', datos.descenso ? { nivel: datos.nivel } : {});
        return;
      }
      indice++;
      mostrarPlano();
    });
    mostrarPlano();
    pie.append(dialogo, continuar);
    marco.append(imagen, piso, pie);
    pagina.append(marco);
    this.game.canvas.parentElement.append(pagina);
    continuar.focus({ preventScroll: true });
    this.events.once('shutdown', () => pagina.remove());
  }
}

export class Pausa extends Phaser.Scene {
  constructor() { super('Pausa'); }

  create() {
    const continuar = mostrarMenu(this, 'Pausa', [
      ['Continuar', () => {
        this.scene.stop();
        this.scene.resume('Juego');
      }],
      ['Reiniciar nivel', () => this.scene.start('Juego')],
      ['Volver al inicio', () => {
        this.scene.stop('Juego');
        this.scene.start('Inicio');
      }]
    ]);
    const reanudar = (evento) => {
      if (!evento.repeat) continuar.click();
    };
    this.input.keyboard.on('keydown-ESC', reanudar);
    this.input.keyboard.on('keydown-P', reanudar);
  }
}

export class Resultado extends Phaser.Scene {
  constructor(titulo) {
    super(titulo);
    this.titulo = titulo;
  }

  create() {
    const mensaje = document.createElement('p');
    mensaje.className = 'dialogo-resultado';
    mensaje.textContent = obtenerDialogo(this.titulo === 'Victoria' ? 'victoria' : 'muerte');
    mostrarMenu(this, this.titulo, [
      ['Reintentar', () => this.scene.start('Juego')],
      ['Inicio', () => this.scene.start('Inicio')]
    ], mensaje);
  }
}
