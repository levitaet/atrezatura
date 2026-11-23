import { JUGADOR, TAMANO_CELDA } from '../config.js';

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
  // En la oficina los "pinchos" son chinches regadas por el suelo.
  crearTexturaChinches(escena);
  const texturaChinches = escena.textures.exists('chinches') ? 'chinches' : 'chinches-temp';
  for (const pincho of nivel.entidades.get('^') ?? []) {
    pincho.setVisible(false);
    escena.add.image(pincho.x, pincho.y + lado / 2, texturaChinches).setOrigin(0.5, 1);
    const zona = escena.add.zone(pincho.x, pincho.y + lado / 4, lado - 6, lado / 2).setData('tipo', 'chinches');
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
    estado.checkpoint?.setFrame(0);
    checkpoint.setFrame(1);
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

// Chinches provisorias (3 por celda) hasta que exista public/assets/sprites/chinches.png.
function crearTexturaChinches(escena) {
  if (escena.textures.exists('chinches-temp')) return;
  const g = escena.make.graphics({ add: false });
  const colores = [0xfe6960, 0x6e9eed, 0xffd34d];
  // Chinches con la cabeza en el suelo y la punta hacia arriba.
  [6, 16, 26].forEach((x, i) => {
    g.fillStyle(0xd7dde5).fillRect(x - 1, 3, 2, 9); // punta
    g.fillStyle(colores[i]).fillEllipse(x, 13, 10, 5); // cabeza
    g.fillStyle(0xffffff, 0.5).fillRect(x - 3, 12, 2, 1); // brillo
  });
  g.generateTexture('chinches-temp', 32, 16);
  g.destroy();
}
