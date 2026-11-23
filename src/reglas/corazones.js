import { JUGADOR, TAMANO_CELDA } from '../config.js';

const COLOR_CHECKPOINT = 0x62c4ed; // igual que en crearNivel.js
const COLOR_CHECKPOINT_ACTIVO = 0xb4f3df;

/**
 * T16: corazones, daño, checkpoints y reaparición.
 *
 * - Tocar un peligro quita 1 corazón y devuelve al último checkpoint (K) con invulnerabilidad breve.
 * - Caer por debajo del mapa también cuenta como daño (el borde inferior del mundo está abierto).
 * - Con 0 corazones se pasa a la escena Derrota. Reiniciar el nivel vuelve todo a su estado inicial.
 * - Lo que no se reinicia al reaparecer (computadores averiados, puertas abiertas) sigue igual,
 *   porque reaparecer no recarga la escena.
 *
 * Contrato con otras tareas:
 * - `escena.estado.corazones` y el evento de escena 'corazones' (n) → HUD (T26).
 * - `escena.peligros` es un grupo estático: cualquier objeto agregado ahí hace daño al tocarlo.
 *   Para desactivar un peligro (T15: cable de un computador averiado): `peligro.body.enable = false`.
 *   Opcional: `peligro.setData('tipo', 'cable')` para que el diálogo sepa con qué murió.
 * - `escena.danarJugador(tipo)` hace daño desde cualquier otro lado (por ejemplo, la Mastermind, T17).
 */
export function conectarCorazones(escena) {
  const { jugador, nivel } = escena;
  const lado = TAMANO_CELDA;
  const piesEn = (celda) => ({ x: celda.x, y: celda.y + lado / 2 }); // reaparicion guarda los pies

  const estado = {
    corazones: JUGADOR.corazones,
    muertes: 0,
    reaparicion: { x: jugador.x, y: jugador.y + jugador.piesDesdeCentro() },
    checkpoint: null
  };
  escena.estado = estado;

  // --- Peligros: los pinchos (^) dañan en la mitad inferior de su celda.
  escena.peligros = escena.physics.add.staticGroup();
  for (const pincho of nivel.entidades.get('^') ?? []) {
    const zona = escena.add.zone(pincho.x, pincho.y + lado / 4, lado - 6, lado / 2).setData('tipo', 'pinchos');
    escena.peligros.add(zona);
  }
  escena.physics.add.overlap(jugador, escena.peligros, (_j, peligro) => danar(peligro.getData('tipo') ?? 'peligro'));

  // --- Checkpoints (K): tocarlos los activa como punto de reaparición.
  // La zona cubre toda la columna hasta el techo del mapa: basta con pasarlo, aunque sea saltando.
  for (const checkpoint of nivel.entidades.get('K') ?? []) {
    const alto = checkpoint.y + lado / 2;
    const zona = escena.add.zone(checkpoint.x, alto / 2, lado, alto);
    escena.physics.add.existing(zona, true);
    escena.physics.add.overlap(jugador, zona, () => activarCheckpoint(checkpoint));
  }

  function activarCheckpoint(checkpoint) {
    if (estado.checkpoint === checkpoint) return;
    estado.checkpoint?.list[0]?.setFillStyle(COLOR_CHECKPOINT);
    checkpoint.list[0]?.setFillStyle(COLOR_CHECKPOINT_ACTIVO);
    estado.checkpoint = checkpoint;
    estado.reaparicion = piesEn(checkpoint);
    escena.events.emit('checkpoint', checkpoint);
  }

  // --- Caer fuera del mapa
  escena.physics.world.checkCollision.down = false;
  const revisarCaida = () => {
    if (jugador.body.top > escena.physics.world.bounds.bottom + lado) danar('caida');
  };
  escena.events.on('update', revisarCaida);
  escena.events.once('shutdown', () => escena.events.off('update', revisarCaida));

  function danar(tipo) {
    if (escena.enTransicion || jugador.esInvulnerable()) return;
    estado.corazones = Math.max(0, estado.corazones - 1);
    estado.muertes += 1;
    escena.events.emit('corazones', estado.corazones);
    escena.events.emit('dialogo', 'muerte', { peligro: tipo, muertes: estado.muertes, corazones: estado.corazones });
    if (estado.corazones === 0) {
      escena.perder();
      return;
    }
    const { x, y } = estado.reaparicion;
    jugador.reaparecer(x, y);
    escena.cameras.main.centerOn(x, y);
  }
  escena.danarJugador = danar;
}
