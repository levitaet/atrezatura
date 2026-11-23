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
  D: 0xe7ac65, '~': 0xdf925e, '!': 0xe6cc65, o: 0xf2c14e, '?': 0x8fa6c4
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
    const etiqueta = escena.add.text(0, 0, simbolo, { fontFamily: 'monospace', fontSize: '20px', color: '#101820' })
      .setOrigin(0.5);
    const objeto = escena.add.container(x, y, [fondo, etiqueta]).setSize(lado, lado);
    if (!entidades.has(simbolo)) entidades.set(simbolo, []);
    entidades.get(simbolo).push(objeto);
  }
  // Las celdas sólidas contiguas se unen en rectángulos grandes: con un cuerpo por celda, el jugador
  // se "engancha" en las uniones al subir rozando una pared (problema clásico de Arcade Physics).
  for (const r of unirEnRectangulos(muros, true)) {
    const w = (r.c1 - r.c0 + 1) * lado;
    const h = (r.f1 - r.f0 + 1) * lado;
    solidos.add(escena.add.rectangle(r.c0 * lado + w / 2, r.f0 * lado + h / 2, w, h, colores['#']));
  }
  for (const r of unirEnRectangulos(finas, false)) {
    const w = (r.c1 - r.c0 + 1) * lado;
    const altura = lado / 4;
    const bloque = escena.add.rectangle(r.c0 * lado + w / 2, r.f0 * lado + altura / 2, w, altura, colores['=']);
    solidos.add(bloque);
    Object.assign(bloque.body.checkCollision, { left: false, right: false, down: false });
  }
  return { solidos, entidades, inicio, ancho, alto };
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
