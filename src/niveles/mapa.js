const simbolos = new Set('#=^PKcMSD~!o');

export function leerMapa(texto) {
  const filas = texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  if (filas.at(-1) === '') filas.pop();
  const columnas = filas[0]?.length;
  if (!columnas) throw new Error('El mapa necesita una primera fila con celdas.');

  const celdas = [];
  let inicio;
  for (const [fila, linea] of filas.entries()) {
    if (linea.length !== columnas) {
      throw new Error(`Fila ${fila + 1}: se esperaban ${columnas} columnas y hay ${linea.length}.`);
    }
    for (let columna = 0; columna < columnas; columna++) {
      const simbolo = linea[columna];
      if (simbolo === '.' || simbolo === ' ') continue;
      const lugar = `fila ${fila + 1}, columna ${columna + 1}`;
      if (!simbolos.has(simbolo)) throw new Error(`Símbolo ${JSON.stringify(simbolo)} en ${lugar}.`);
      const celda = { simbolo, fila, columna };
      if (simbolo === 'P') {
        if (inicio) throw new Error(`Segundo inicio P en ${lugar}.`);
        inicio = celda;
      }
      celdas.push(celda);
    }
  }
  if (!inicio) throw new Error('Falta el inicio P.');
  return { filas: filas.length, columnas, celdas, inicio };
}
