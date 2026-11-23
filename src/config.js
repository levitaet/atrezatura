import Phaser from 'phaser';

export const TAMANO_CELDA = 32;

// ---------------------------------------------------------------------------
// Valores ajustables. Cambia un número, guarda y el navegador se recarga solo.
// Unidades: píxeles, px/s (velocidad), px/s² (aceleración) y milisegundos (ms).
// ---------------------------------------------------------------------------

// Orden de los niveles. Al cruzar la salida de uno se pasa al siguiente; la del último gana el juego.
// revelado: el nivel empieza con la oficina ya tomada por la IA (sin pasar por el disparador !).
// tanqueInicial: segundos de tanque al empezar (si no, EXTINTOR.tanque).
// rellenoAutomatico: si el tanque se vacía, se rellena solo con estos segundos (para no atascarse).
// comicAntes: cómic que se muestra antes de este nivel ('piso22' = descenso, escena Introduccion de Ciro).
export const NIVELES = [
  { nombre: 'tutorial', tanqueInicial: 3, rellenoAutomatico: 3 }, // piso 23; si se vacía, repone 3 s
  { nombre: 'oficina', revelado: true, comicAntes: 'piso22' } // piso 22
];

export const PENSAMIENTOS = {
  letrasPorSegundo: 45, // velocidad con que se escriben los pensamientos de Felipito
  permanencia: 2800 // ms que el pensamiento queda en pantalla después de terminar de escribirse
};

export const TUTORIAL = {
  resistenciaMuneco: 0.4 // segundos de chorro para derribar el cartel de práctica (T); una ráfaga dura 0,5
};

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
  tiempoBajando: 220, // ms en que ignora las plataformas finas al apretar S

  // Sprite de Felipito (public/assets/sprites/felipito.png, cuadros de 128 × 128)
  sprite: {
    escala: 0.5, // Felipito queda de ~62 px de alto (unas 2 celdas)
    cuerpo: { ancho: 52, alto: 112, x: 36, y: 11 }, // en px del dibujo original (antes de escalar)
    animaciones: { quieto: [0], caminar: [1, 2, 3, 4, 5, 6, 7, 8, 9], fpsCaminar: 10, aire: [2] }
  },

  // Vida
  corazones: 3, // corazones al empezar el nivel
  tiempoInvulnerable: 1200 // ms en que no recibe daño después de reaparecer (parpadea)
};

export const EXTINTOR = {
  empuje: 1800, // px/s² en sentido contrario al chorro (la gravedad es 1000, así que hacia abajo sube)
  velocidadMax: 420, // px/s: el chorro deja de acelerar al llegar a esta velocidad en su dirección
  carga: 0.5, // segundos de chorro continuo con la carga llena
  tiempoRecarga: 0.25, // segundos para llenar la carga desde cero, en el suelo y sin disparar
  alcance: 110, // px que llega el chorro desde la boquilla (para averiar computadores, T14)
  tanque: 8, // segundos de chorro en TODO el nivel. No se recarga en el suelo: solo con un completo
  avisoPoco: 2, // segundos de tanque desde los que se avisa "¡Queda poca espuma!"

  // Qué significan las flechas:
  //   'apuntar' → hacia dónde sale el chorro (↓ te hace subir). Sirve para apuntar a los computadores.
  //   'mover'   → hacia dónde quieres ir (↑ te hace subir; el chorro sale al lado contrario).
  // Para comparar sin editar este archivo, agrega ?flechas=mover a la dirección del juego.
  modoFlechas: new URLSearchParams(window.location.search).get('flechas') === 'mover' ? 'mover' : 'apuntar'
};

export const COMPUTADOR = {
  escala: 2,
  resistencia: 0.3, // segundos de chorro acumulado para averiar un computador pequeño (la carga llena dura 0,5)
  distanciaAvisoPuerta: 7 // celdas: al acercarse a un computador que cierra una puerta, la Mastermind habla
};

export const MASTERMIND = {
  radioSala: 10, // celdas a cada lado de la M: los computadores dentro forman su escudo y ahí ataca
  resistencia: 3, // segundos de chorro acumulado para destruirla (con el escudo abajo)
  calma: 1800, // ms entre descargas mientras tiene escudo
  calmaDesesperada: 1000, // ms entre descargas cuando ya perdió el escudo
  aviso: 800, // ms en que el suelo parpadea antes de electrificarse
  descarga: 900, // ms en que el suelo de la sala hace daño
  vidaTrasRestaurar: 0.5 // si el jugador falla la terminal, recupera esta fracción de su vida
};

export const TERMINAL = {
  segundos: 60, // tiempo para hackear a la Mastermind antes de que restaure su sistema (la Nota Verde pausa el reloj)
  letrasPorTecla: 3, // cuántas letras escribe cada tecla apretada
  tiempoAlerta: 1800, // ms para responder una alerta con la flecha pedida
  castigoAlerta: 4, // segundos que se pierden si la alerta no se responde bien
  pausaLectura: 2500 // ms que Felipito lee la Nota Verde antes de poder seguir (el reloj se detiene)
};

export const REVELACION = {
  color: 0x8a0f2a, // tinte de la oficina después de que aparece la IA
  opacidad: 0.2, // 0 = sin tinte, 1 = pantalla completamente de ese color
  fondo: 0x1c1020 // color de fondo después de la revelación (antes: 0x172638)
};

export const CAMARA = {
  zoom: 1.6, // acercamiento: 1 = se ve todo el ancho de 960 px; más alto = personaje más grande, se ve menos nivel
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
