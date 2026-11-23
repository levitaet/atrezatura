import carteles from '../data/carteles.json';

/**
 * Carteles de texto (?) en el mapa: instrucciones del tutorial y detalles del escenario.
 * Los textos están en src/data/carteles.json, en una lista por nivel. Se asignan en orden de
 * lectura del mapa: de izquierda a derecha (y de arriba abajo si están en la misma columna).
 * Benja puede cambiar los textos sin tocar código.
 */
export function conectarCarteles(escena) {
  const marcadores = [...(escena.nivel.entidades.get('?') ?? [])].sort((a, b) => a.x - b.x || a.y - b.y);
  const textos = carteles[escena.nombreNivel] ?? [];
  marcadores.forEach((marcador, i) => {
    marcador.setVisible(false);
    const texto = textos[i];
    if (!texto) {
      console.warn(`[carteles] "${escena.nombreNivel}" tiene más ? que textos en carteles.json`);
      return;
    }
    escena.add
      .text(marcador.x, marcador.y + 16, texto, {
        fontFamily: '"VT323", monospace',
        fontSize: '16px', // VT323 es pequeña; con el zoom de la cámara se ve más grande
        color: '#e8eef5',
        align: 'center',
        backgroundColor: '#101820cc',
        padding: { x: 6, y: 3 },
        wordWrap: { width: 200 }
      })
      .setOrigin(0.5, 1)
      .setDepth(2);
  });
}
