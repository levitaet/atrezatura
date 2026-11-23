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
  D: 0xe7ac65, '~': 0xdf925e, '!': 0xe6cc65
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

  for (const { simbolo, columna, fila } of mapa.celdas) {
    const x = (columna + 0.5) * lado;
    const y = (fila + 0.5) * lado;
    if (simbolo === '#' || simbolo === '=') {
      const altura = simbolo === '=' ? lado / 4 : lado;
      const bloque = escena.add.rectangle(x, fila * lado + altura / 2, lado, altura, colores[simbolo]);
      solidos.add(bloque);
      if (simbolo === '=') {
        Object.assign(bloque.body.checkCollision, { left: false, right: false, down: false });
      }
      continue;
    }
    const fondo = escena.add.rectangle(0, 0, lado, lado, colores[simbolo]);
    const etiqueta = escena.add.text(0, 0, simbolo, { fontFamily: 'monospace', fontSize: '20px', color: '#101820' })
      .setOrigin(0.5);
    const objeto = escena.add.container(x, y, [fondo, etiqueta]).setSize(lado, lado);
    if (!entidades.has(simbolo)) entidades.set(simbolo, []);
    entidades.get(simbolo).push(objeto);
  }
  return { solidos, entidades, inicio, ancho, alto };
}
