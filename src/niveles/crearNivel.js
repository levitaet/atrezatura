import { TAMANO_CELDA } from '../config.js';
import { leerMapa } from './mapa.js';

const archivos = import.meta.glob('../data/niveles/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true
});

const colores = {
  '#': 0x52677a, '=': 0xa8c2d1, '^': 0xfe6960, P: 0x46bfa6,
  K: 0x62c4ed, c: 0x6e9eed, M: 0xb885ed, S: 0x87c96d,
  D: 0xe7ac65, '~': 0xdf925e, '!': 0xe6cc65, o: 0xf2c14e, '?': 0x8fa6c4, '*': 0xffd34d, e: 0xd33b2c, T: 0xd9b98a
};

export function crearNivel(escena, nombre) {
  const texto = archivos[`../data/niveles/${nombre}.txt`];
  if (typeof texto !== 'string') throw new Error(`No se encontró el nivel «${nombre}».`);
  const mapa = leerMapa(texto);
  const lado = TAMANO_CELDA;
  const ancho = mapa.columnas * lado;
  const alto = mapa.filas * lado;
  const solidos = escena.physics.add.staticGroup();
  const entidades = new Map();
  const inicio = { x: (mapa.inicio.columna + 0.5) * lado, y: (mapa.inicio.fila + 0.5) * lado };

  escena.physics.world.setBounds(0, 0, ancho, alto);
  escena.cameras.main.setBounds(0, 0, ancho, alto);
  escena.cameras.main.centerOn(inicio.x, inicio.y);

  const muros = [];
  const finas = [];
  for (const { simbolo, columna, fila } of mapa.celdas) {
    const x = (columna + 0.5) * lado;
    const y = (fila + 0.5) * lado;
    if (simbolo === '#') { muros.push({ fila, columna }); continue; }
    if (simbolo === '=') { finas.push({ fila, columna }); continue; }
    const fondo = escena.add.rectangle(0, 0, lado, lado, colores[simbolo]);
    const etiqueta = escena.add.text(0, 0, simbolo, { fontFamily: '"VT323", monospace', fontSize: '24px', color: '#101820', resolution: 4 })
      .setOrigin(0.5);
    const objeto = escena.add.container(x, y, [fondo, etiqueta]).setSize(lado, lado);
    if (!entidades.has(simbolo)) entidades.set(simbolo, []);
    entidades.get(simbolo).push(objeto);
  }
  // Las celdas sólidas contiguas se unen en rectángulos grandes: con un cuerpo por celda, el jugador
  // se "engancha" en las uniones al subir rozando una pared (problema clásico de Arcade Physics).
  // El cuerpo de física es un rectángulo invisible; el dibujo es mobiliario de oficina provisorio.
  const muebles = escena.add.graphics().setDepth(-1);
  for (const r of unirEnRectangulos(muros, true)) {
    const w = (r.c1 - r.c0 + 1) * lado;
    const h = (r.f1 - r.f0 + 1) * lado;
    const x0 = r.c0 * lado;
    const y0 = r.f0 * lado;
    solidos.add(escena.add.rectangle(x0 + w / 2, y0 + h / 2, w, h));
    if (r.f1 === mapa.filas - 1) dibujarSuelo(muebles, x0, y0, w, h);
    else if (h >= lado * 3 && w <= lado * 2) dibujarEstanteria(muebles, x0, y0, w, h, lado);
    else dibujarPila(muebles, x0, y0, w, h, lado);
  }
  for (const r of unirEnRectangulos(finas, false)) {
    const w = (r.c1 - r.c0 + 1) * lado;
    const altura = lado / 4;
    const x0 = r.c0 * lado;
    const y0 = r.f0 * lado;
    const bloque = escena.add.rectangle(x0 + w / 2, y0 + altura / 2, w, altura);
    solidos.add(bloque);
    Object.assign(bloque.body.checkCollision, { left: false, right: false, down: false });
    dibujarMesa(muebles, x0, y0, w, altura, lado);
  }
  return { solidos, entidades, inicio, ancho, alto };
}

// --- Mobiliario provisorio (se reemplaza cuando haya tiles de Rocío) ---

// Generador pseudoaleatorio fijo por posición: el mismo mapa siempre se dibuja igual.
function azar(semilla) {
  let s = (semilla * 9301 + 49297) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

function dibujarSuelo(g, x, y, w, h) {
  g.fillStyle(0x34404f).fillRect(x, y, w, h); // alfombra
  g.fillStyle(0x56677c).fillRect(x, y, w, 4); // borde
  g.fillStyle(0x2b3542);
  for (let i = x + 8; i < x + w; i += 24) g.fillRect(i, y + 10, 10, 2);
}

function dibujarEstanteria(g, x, y, w, h, lado) {
  const r = azar(x * 7 + y);
  const libros = [0xc0392b, 0x2e86c1, 0xf1c40f, 0x27ae60, 0x8e44ad, 0xe67e22, 0xecf0f1];
  g.fillStyle(0x6b4a2b).fillRect(x, y, w, h); // marco
  g.fillStyle(0x3d2a18).fillRect(x + 3, y + 3, w - 6, h - 6); // fondo
  for (let fila = y; fila < y + h; fila += lado) {
    g.fillStyle(0x6b4a2b).fillRect(x, fila + lado - 4, w, 4); // repisa
    let bx = x + 4;
    while (bx < x + w - 6) {
      const ancho = 3 + Math.floor(r() * 4);
      const alto = 14 + Math.floor(r() * 12);
      if (r() > 0.12) g.fillStyle(libros[Math.floor(r() * libros.length)]).fillRect(bx, fila + lado - 4 - alto, ancho, alto);
      bx += ancho + 1;
    }
  }
}

function dibujarPila(g, x, y, w, h, lado) {
  const r = azar(x * 13 + y * 3);
  for (let fila = y; fila < y + h; fila += lado) {
    if (r() < 0.5) {
      // escritorio volcado/apilado
      g.fillStyle(0x8a5a32).fillRect(x, fila, w, lado);
      g.fillStyle(0xb07a46).fillRect(x, fila, w, 6);
      for (let c = x; c < x + w; c += lado) {
        g.lineStyle(1, 0x5c3a1e).strokeRect(c + 4, fila + 10, lado - 8, lado - 14);
        g.fillStyle(0xd7c29e).fillRect(c + lado / 2 - 3, fila + 16, 6, 2);
      }
    } else {
      // cajas de cartón
      for (let c = x; c < x + w; c += lado) {
        g.fillStyle(0xc49a5c).fillRect(c + 1, fila + 1, lado - 2, lado - 2);
        g.fillStyle(0xa77d43).fillRect(c + 1, fila + lado - 6, lado - 2, 5);
        g.fillStyle(0xe8d9b0).fillRect(c + lado / 2 - 3, fila + 1, 6, lado - 2); // cinta
      }
    }
  }
}

function dibujarMesa(g, x, y, w, altura, lado) {
  g.fillStyle(0x5c3a1e).fillRect(x + 4, y + altura, 4, lado); // patas (decoración, no chocan)
  g.fillStyle(0x5c3a1e).fillRect(x + w - 8, y + altura, 4, lado);
  g.fillStyle(0xb07a46).fillRect(x, y, w, altura); // cubierta
  g.fillStyle(0xd09a62).fillRect(x, y, w, 2);
}

// Agrupa celdas en tramos horizontales y, si vertical es true, apila tramos iguales de filas seguidas.
function unirEnRectangulos(celdas, vertical) {
  const porFila = new Map();
  for (const { fila, columna } of celdas) {
    if (!porFila.has(fila)) porFila.set(fila, []);
    porFila.get(fila).push(columna);
  }
  const listos = [];
  let abiertos = new Map(); // "c0-c1" → rectángulo que llega hasta la fila anterior
  for (const fila of [...porFila.keys()].sort((a, b) => a - b)) {
    const columnas = porFila.get(fila).sort((a, b) => a - b);
    const tramos = [];
    for (const c of columnas) {
      const ultimo = tramos.at(-1);
      if (ultimo && c === ultimo.c1 + 1) ultimo.c1 = c;
      else tramos.push({ c0: c, c1: c });
    }
    const siguientes = new Map();
    for (const { c0, c1 } of tramos) {
      const clave = `${c0}-${c1}`;
      const previo = abiertos.get(clave);
      if (vertical && previo && previo.f1 === fila - 1) {
        previo.f1 = fila;
        siguientes.set(clave, previo);
      } else {
        const nuevo = { c0, c1, f0: fila, f1: fila };
        listos.push(nuevo);
        siguientes.set(clave, nuevo);
      }
    }
    abiertos = siguientes;
  }
  return listos;
}
