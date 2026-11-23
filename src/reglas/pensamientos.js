import pensamientos from '../data/pensamientos.json';
import { TAMANO_CELDA } from '../config.js';
import { decir } from './cajaDialogo.js';

/**
 * Pensamientos de Felipito, en la caja de diálogo compartida con la Mastermind (cajaDialogo.js).
 *
 * - En el mapa, '*' marca dónde se dispara un pensamiento: al cruzar su columna, una sola vez.
 *   Los textos están en src/data/pensamientos.json → { "<nivel>": { "mapa": [...], ... } },
 *   asignados de izquierda a derecha a los '*'.
 * - Desde el código: escena.pensar('clave') muestra pensamientos.json[nivel][clave]
 *   (por ejemplo, "extintor" al recogerlo).
 */
export function conectarPensamientos(escena) {
  const { jugador, nivel } = escena;
  const lado = TAMANO_CELDA;
  const textos = pensamientos[escena.nombreNivel] ?? {};

  // Entre paréntesis: es un pensamiento, como en el cómic.
  const mostrar = (texto) => { if (texto) decir(escena, 'felipito', `(${texto})`); };

  // Si la clave tiene una lista de frases, elige una al azar.
  escena.pensar = (clave) => {
    const valor = textos[clave];
    mostrar(Array.isArray(valor) ? valor[Math.floor(Math.random() * valor.length)] : valor);
  };

  const marcadores = [...(nivel.entidades.get('*') ?? [])].sort((a, b) => a.x - b.x || a.y - b.y);
  const delMapa = textos.mapa ?? [];
  marcadores.forEach((marcador, i) => {
    marcador.setVisible(false);
    const alto = marcador.y + lado / 2;
    const zona = escena.add.zone(marcador.x, alto / 2, lado, alto);
    escena.physics.add.existing(zona, true);
    const contacto = escena.physics.add.overlap(jugador, zona, () => {
      contacto.destroy();
      mostrar(delMapa[i]);
    });
  });
}
