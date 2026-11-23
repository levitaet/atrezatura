"""Crea el backlog de MasterIA en GitHub (issues + milestones + Project) o lo exporta a Markdown.

Uso:
  python crear_backlog.py --md RUTA/BACKLOG.md     # solo genera el Markdown
  python crear_backlog.py --github                 # crea labels, milestones, issues y el Project
  python crear_backlog.py --github --sin-project   # solo labels, milestones e issues
Requiere GitHub CLI autenticado con scope 'project' para --github.
"""
import json
import subprocess
import sys

OWNER = "levitaet"
REPO = "levitaet/atrezatura"
PROJECT_TITLE = "MasterIA · Backlog"
DOC = "docs/MasterIA_Definicion_del_juego.md"

SPRINTS = [
    ("S0 · Arranque", "11:10 – 11:40", "Proyecto corriendo en todos los computadores, estilo visual y tono acordados."),
    ("S1 · Moverse y disparar", "11:40 – 12:45", "El oficinista camina, salta y se propulsa con el extintor en una sala de prueba. Se decide si es divertido."),
    ("S2 · Mundo y enemigos", "12:45 – 14:00", "HITO 14:00: recorrido completo jugable con gráficos temporales (tutorial, revelación, nivel, Mastermind, salida)."),
    ("S3 · Juego completo", "14:00 – 15:00", "Pantallas, HUD, arte y audio integrados. Diálogos dinámicos solo si todo lo anterior funciona."),
    ("S4 · Pulido", "15:00 – 16:00", "Congelar funciones a las 15:00. Solo bugs, ajustes y efectos. 16:00 corte interno."),
    ("S5 · Entrega", "16:00 – cierre", "README, licencias, revisión de claves y demo preparada."),
]

ROLES = {
    "P1": "Sofía · Jugador",
    "P2": "Ciro · Mundo",
    "ART": "Rocío · Arte y audio",
    "APO": "Benja · Nivel y datos",
    "EQ": "Todo el equipo",
}

# Usuarios de GitHub conocidos (agregar los demás cuando se sepan)
ASSIGNEES = {"P1": "levitaet"}

LABELS = {
    "código": ("1f6feb", "Programación"),
    "arte": ("d946ef", "Sprites, tiles, UI"),
    "audio": ("f97316", "Música y efectos"),
    "diseño": ("16a34a", "Diseño de nivel, datos, balance"),
    "docs": ("64748b", "README, licencias, registro"),
    "prueba": ("eab308", "Playtest y QA"),
    "imprescindible": ("b91c1c", "Sin esto no hay juego"),
    "extra": ("94a3b8", "Solo si sobra tiempo"),
}

# (id, sprint_idx, rol, labels, título, qué, listo_cuando, depende_de)
TASKS = [
    # ---------------- S0
    ("T01", 0, "P1", ["código", "imprescindible"], "Crear proyecto Phaser 3.90 + Vite",
     "Proyecto con `npm run dev`, escena vacía y estructura: `src/scenes/`, `src/config.js` (todas las constantes de juego), `src/data/` (mapas y diálogos), `public/assets/`.",
     ["`npm install && npm run dev` abre un canvas en el navegador", "Hay un `.gitignore` con `node_modules/`, `dist/` y `.env`", "Pusheado a `main`"], []),
    ("T02", 0, "EQ", ["diseño", "imprescindible"], "Decidir tono de la Mastermind y aspecto del protagonista",
     "Elegir tono (cómico, inquietante o mezcla), nombre y look del oficinista y de la Mastermind. Anotarlo en el documento de definición.",
     ["Tono y personalidad en 2–3 frases escritas en el doc", "Boceto rápido del protagonista y la Mastermind"], []),
    ("T03", 0, "ART", ["arte", "imprescindible"], "Guía de estilo: resolución, tiles y paletas",
     "Acordar con Sofía: resolución del juego (propuesta 960×540), tamaño de tile (propuesta 32×32), tamaño del personaje, formato de spritesheets (PNG horizontal, frames del mismo tamaño) y paletas antes/después de la revelación.",
     ["`docs/ESTILO.md` con tamaños, paletas y nombres de archivo", "Sofía confirmó los tamaños"], []),
    ("T04", 0, "APO", ["docs", "imprescindible"], "Entorno listo + crear ITERACIONES.md",
     "Instalar Node LTS, clonar el repo y correr el juego (cuando T01 esté listo). Crear `ITERACIONES.md` con formato: `HH:MM · qué probamos · cómo se sintió · qué cambiamos`. Cada integrante agrega líneas durante el día.",
     ["El juego corre en tu computador", "`ITERACIONES.md` existe con la primera entrada"], ["T01"]),

    # ---------------- S1
    ("T05", 1, "P1", ["código", "imprescindible"], "Jugador: caminar, saltar y cámara",
     "Rectángulo temporal con físicas arcade. A/D caminar, W saltar, S bajar de plataforma (opcional). Cámara que sigue al jugador. Velocidades y gravedad en `config.js`.",
     ["Se puede recorrer una sala con plataformas", "Todos los valores ajustables están en `config.js`"], ["T01"]),
    ("T06", 1, "P1", ["código", "imprescindible"], "Extintor: apuntar en 8 direcciones y retroceso",
     "Flechas (y combinaciones para diagonales) disparan el chorro. Mientras dispara, impulso en dirección contraria. Partículas blancas temporales. Disparar hacia abajo = súper salto.",
     ["Las 8 direcciones funcionan", "El retroceso permite subir a plataformas inalcanzables saltando"], ["T05"]),
    ("T07", 1, "P1", ["código", "imprescindible"], "Carga limitada del extintor",
     "Barra de carga: se gasta al disparar, se recarga rápido al tocar el suelo. Punto de partida ~1 s de chorro por salto. Valores en `config.js`.",
     ["Sin carga no hay chorro", "Barra visible en pantalla", "Se recarga al aterrizar"], ["T06"]),
    ("T08", 1, "P2", ["código", "imprescindible"], "Cargar niveles desde un mapa de texto",
     "Leer un mapa ASCII desde `src/data/niveles/*.txt` y crear el nivel. Leyenda propuesta: `#` suelo/pared, `=` plataforma, `^` pinchos, `P` inicio, `K` checkpoint, `c` computador pequeño, `M` Mastermind, `S` salida, `D` puerta, `~` cable, `!` disparador de la revelación. Documentar la leyenda en `src/data/niveles/LEEME.md`.",
     ["Cambiar el `.txt` y recargar cambia el nivel", "Leyenda documentada para que Benja pueda diseñar sin tocar código"], ["T01"]),
    ("T09", 1, "P2", ["código", "imprescindible"], "Esqueleto de escenas y pausa",
     "Escenas Inicio → Juego → Victoria / Derrota con texto temporal y transiciones. Pausa con Esc/P: Continuar, Reiniciar nivel, Volver al inicio. El juego se congela en pausa.",
     ["Se puede ir de inicio a juego y volver", "La pausa congela todo y sus 3 opciones funcionan"], ["T01"]),
    ("T10", 1, "APO", ["diseño", "imprescindible"], "Diseñar sala de prueba y tutorial en el mapa de texto",
     "Usando la leyenda de T08, crear `prueba.txt` (sala para probar movimiento) y la parte del tutorial: enseñar caminar → saltar → propulsarse → averiar el computador de práctica → disparador de revelación. Mientras T08 no esté listo, bocetear en papel o cuadrícula.",
     ["`prueba.txt` y tramo de tutorial cargan en el juego", "Cada habilidad se enseña antes de exigirla"], ["T08"]),
    ("T11", 1, "ART", ["arte", "imprescindible"], "Sprite del oficinista",
     "Animaciones: quieto, caminar, saltar/caer, disparando el extintor (al menos de lado). Según `docs/ESTILO.md`.",
     ["Spritesheets en `public/assets/sprites/`", "Frames del mismo tamaño y fondo transparente"], ["T03"]),
    ("T12", 1, "ART", ["arte", "imprescindible"], "Tileset de oficina (versión feliz)",
     "Suelo, paredes, plataformas (escritorios, estantes), fondo de oficina luminoso.",
     ["Tileset en `public/assets/tiles/` con el tamaño de tile acordado"], ["T03"]),
    ("T13", 1, "EQ", ["prueba", "imprescindible"], "Playtest 1: ¿propulsarse es divertido?",
     "Todos juegan la sala de prueba 5 minutos. Benja dirige: ajustar en `config.js` gravedad, fuerza del retroceso y carga hasta que se sienta bien. Registrar en `ITERACIONES.md`.",
     ["Valores finales anotados en `config.js`", "Al menos 2 entradas en `ITERACIONES.md`"], ["T07", "T10"]),

    # ---------------- S2
    ("T14", 2, "P2", ["código", "imprescindible"], "Computadores pequeños que se averían con el chorro",
     "Los computadores (`c`) reciben daño del chorro (~0,5 s acumulados). Estados: normal → dañado → averiado (humo/glitch temporal). Contador en pantalla de los que faltan.",
     ["El chorro los avería", "El contador baja", "Se nota claramente cuando quedan averiados"], ["T06", "T08"]),
    ("T15", 2, "P2", ["código", "imprescindible"], "Peligros controlados por computadores: puerta y cable",
     "Cada computador controla un peligro cercano. Puerta (`D`) bloquea el paso; cable (`~`) daña al tocarlo. Al averiar el computador, el peligro se desactiva. Definir en el mapa o en un `.json` qué computador controla qué.",
     ["Averiar el computador abre la puerta / apaga el cable", "Benja puede conectar computador ↔ peligro sin programar"], ["T14"]),
    ("T16", 2, "P1", ["código", "imprescindible"], "Corazones, daño, checkpoints y reaparición",
     "3 corazones. Peligro = −1 corazón y vuelta al último checkpoint (`K`), con invulnerabilidad breve. Computadores averiados siguen averiados. 0 corazones → escena Derrota.",
     ["Morir te devuelve al checkpoint", "0 corazones lleva a Derrota y Reintentar reinicia el nivel"], ["T05", "T08", "T09"]),
    ("T17", 2, "P1", ["código", "imprescindible"], "Mastermind: escudo, ataque y derrota",
     "Jefe estático (`M`). Escudo ligado a 3 computadores de la sala; cada uno averiado lo debilita. Ataque por turnos simple (cable electrificado o ráfaga de papel). Sin escudo: ~3 s de chorro acumulado, parpadea en rojo. Al morir: explosión, se abre la salida (`S`) → Victoria.",
     ["Se puede ganar el juego destruyendo la Mastermind", "El patrón de ataque es predecible y esquivable"], ["T14", "T16"]),
    ("T18", 2, "P2", ["código", "imprescindible"], "Revelación de la IA al final del tutorial",
     "Al tocar el disparador (`!`): cambian luces/tinte (paleta IA), cambia la música, los monitores se encienden y la Mastermind habla por primera vez.",
     ["La revelación ocurre una sola vez y se entiende que algo cambió"], ["T08", "T19"]),
    ("T19", 2, "P2", ["código", "imprescindible"], "Sistema de diálogos con frases fijas",
     "Función `obtenerDialogo(evento, contexto)` que elige una frase al azar de `src/data/dialogos.json`. Mostrar en globo o monitor sin pausar la acción. Eventos: `revelacion`, `computador_averiado`, `muerte`, `sala_mastermind`, `escudo_roto`, `victoria`.",
     ["Cada evento muestra una frase de `dialogos.json`", "La acción nunca se detiene esperando un diálogo"], ["T09"]),
    ("T20", 2, "APO", ["diseño", "imprescindible"], "Escribir los diálogos fijos de la Mastermind",
     "En `src/data/dialogos.json`, al menos 3 frases por evento (ver T19), máximo ~15 palabras, con el tono elegido en T02.",
     ["`dialogos.json` válido con todos los eventos"], ["T02"]),
    ("T21", 2, "APO", ["diseño", "imprescindible"], "Diseñar el nivel completo en el mapa de texto",
     "`nivel1.txt`: tutorial → revelación → nivel con computadores y peligros → sala de la Mastermind → salida. Al menos 2 checkpoints. Probarlo jugando y ajustar.",
     ["Se puede jugar de principio a fin", "Ningún salto exige más carga de la que hay"], ["T10", "T15"]),
    ("T22", 2, "ART", ["arte", "imprescindible"], "Sprites de computadores y Mastermind",
     "Computador pequeño: normal, dañado, averiado (2–3 frames de humo/glitch). Mastermind: normal, con escudo, vulnerable, destruida.",
     ["PNGs en `public/assets/sprites/` con nombres según `ESTILO.md`"], ["T03"]),
    ("T23", 2, "ART", ["arte", "imprescindible"], "Peligros, checkpoint, salida y chorro",
     "Pinchos (o equivalente de oficina), cable, puerta, checkpoint (activo/inactivo), puerta de salida, partícula del chorro del extintor.",
     ["Todos los objetos del mapa tienen sprite"], ["T03"]),
    ("T24", 2, "ART", ["arte"], "Variante \"IA\" de la oficina",
     "Versión fría/roja del fondo y tiles, o definir el tinte exacto que se aplicará tras la revelación.",
     ["Ciro puede aplicar el cambio en T18"], ["T12"]),

    # ---------------- S3
    ("T25", 3, "P1", ["código", "arte", "imprescindible"], "Integrar sprites y animaciones",
     "Reemplazar rectángulos por los sprites del jugador, tiles, computadores, Mastermind y objetos.",
     ["No quedan rectángulos temporales visibles"], ["T11", "T12", "T22", "T23"]),
    ("T26", 3, "P2", ["código", "arte", "imprescindible"], "HUD y pantallas de inicio, victoria y derrota",
     "HUD: corazones, carga del extintor, computadores restantes. Inicio con título y controles. Victoria y derrota con Reintentar / Inicio.",
     ["Un jugador nuevo entiende los controles desde la pantalla de inicio"], ["T09", "T16"]),
    ("T27", 3, "ART", ["audio", "imprescindible"], "Música: oficina feliz y tema IA",
     "Dos loops cortos: antes y después de la revelación. Opcional: tema de la Mastermind.",
     ["Archivos `.ogg` o `.mp3` en `public/assets/audio/`", "Loops sin corte audible"], ["T02"]),
    ("T28", 3, "ART", ["audio", "imprescindible"], "Efectos de sonido",
     "Chorro del extintor, daño, checkpoint, computador averiado, voz/sonido de la IA al hablar, golpe a la Mastermind, victoria, derrota.",
     ["Todos en `public/assets/audio/sfx/`"], []),
    ("T29", 3, "P2", ["código", "audio", "imprescindible"], "Integrar música y efectos",
     "Música según la fase (cambio en la revelación), SFX en cada evento, volumen razonable.",
     ["Todos los eventos importantes suenan"], ["T27", "T28"]),
    ("T30", 3, "P1", ["código", "extra"], "Diálogos dinámicos con la API de OpenAI",
     "Servidor Node mínimo con un endpoint que recibe `evento` + `contexto` y devuelve una frase. Clave en `.env` (nunca en el navegador ni en git) y `.env.example` en el repo. `obtenerDialogo` lo llama en segundo plano; si tarda >2 s o falla, usa `dialogos.json`. Modelo pequeño y rápido.",
     ["Sin servidor el juego funciona igual", "Con servidor, la IA comenta lo que pasó", "`git grep` no encuentra la clave"], ["T19", "T31"]),
    ("T31", 3, "APO", ["diseño", "extra"], "Prompt de personalidad de la Mastermind",
     "Escribir el prompt de sistema (tono, reglas: español, máx. ~15 palabras, sin groserías) y probarlo en el Playground de OpenAI con los eventos de T19. Guardarlo en `server/prompt.txt`.",
     ["10 respuestas de prueba que suenan a la Mastermind"], ["T02"]),
    ("T32", 3, "APO", ["prueba", "imprescindible"], "Playtest 2: partida completa con checklist",
     "Jugar de principio a fin y revisar: controles, cada computador, cada checkpoint, muerte, pausa, victoria, derrota. Cada bug = un issue nuevo con label `prueba`. Pedir a alguien de otro equipo que juegue 3 minutos sin explicarle nada.",
     ["Bugs registrados como issues", "Entrada en `ITERACIONES.md`"], ["T21", "T26"]),

    # ---------------- S4
    ("T33", 4, "EQ", ["código", "imprescindible"], "Corregir bugs del playtest",
     "Repartir los issues del playtest 2 entre Sofía y Ciro. Desde las 15:00 no se agregan funciones nuevas.",
     ["No hay bugs que impidan terminar el juego"], ["T32"]),
    ("T34", 4, "P1", ["código", "extra"], "Efectos de \"juice\"",
     "Sacudida de cámara al impulsarse y al golpear a la Mastermind, parpadeo al recibir daño, partículas al averiar computadores.",
     ["El juego se siente más reactivo sin bajar el rendimiento"], ["T25"]),
    ("T35", 4, "APO", ["diseño", "prueba"], "Ajustar dificultad",
     "Tocar `config.js` y el mapa para que alguien nuevo pueda ganar en ~3–5 minutos sin frustrarse.",
     ["Alguien externo terminó el juego"], ["T32"]),
    ("T36", 4, "P2", ["código", "imprescindible"], "Build de producción y prueba en entorno limpio",
     "`npm run build` y probar el resultado en otro computador o navegador. Opcional: publicar en GitHub Pages para tener enlace jugable.",
     ["El juego corre desde el build", "Instrucciones probadas por alguien que no lo programó"], ["T33"]),

    # ---------------- S5
    ("T37", 5, "APO", ["docs", "imprescindible"], "README final",
     "Completar el README del repo: descripción, cómo ejecutar (con y sin clave de API), controles, integrantes y aporte, sección Trabajo con Codex (resumen de `ITERACIONES.md`).",
     ["Alguien externo puede correr el juego leyendo solo el README"], ["T36"]),
    ("T38", 5, "ART", ["docs", "imprescindible"], "Créditos y licencias de recursos",
     "Llenar la tabla de materiales del README con cada recurso externo (fuentes, sonidos, librerías) y su licencia. Lo creado hoy, marcarlo como propio.",
     ["Ningún recurso sin licencia identificada"], []),
    ("T39", 5, "P2", ["docs", "imprescindible"], "Revisar que no haya claves ni secretos en el repo",
     "Revisar historial y archivos: `.env` ignorado, sin claves en commits. Si se filtró una clave, revocarla en OpenAI de inmediato.",
     ["Revisión hecha y anotada"], []),
    ("T40", 5, "EQ", ["docs", "imprescindible"], "Preparar la demo",
     "Guion de 2–3 minutos: idea, gancho (un juego contra una IA hecho con IA), qué iteramos con Codex (usar `ITERACIONES.md`). Decidir quién juega y en qué computador.",
     ["Demo ensayada una vez de principio a fin"], ["T37"]),
    ("T41", 5, "EQ", ["diseño", "extra"], "Segundo nivel corto",
     "Solo si todo lo imprescindible está terminado y probado.",
     ["Nivel 2 jugable y enlazado tras la victoria del nivel 1"], ["T36"]),
]


def body(t, numeros=None):
    tid, s, rol, labels, titulo, que, listo, dep = t
    lines = [f"**Sprint:** {SPRINTS[s][0]} ({SPRINTS[s][1]})  ", f"**Responsable:** {ROLES[rol]}", "", "### Qué", que, "", "### Listo cuando"]
    lines += [f"- [ ] {x}" for x in listo]
    if dep:
        refs = [f"#{numeros[d]}" if numeros and d in numeros else d for d in dep]
        lines += ["", "### Depende de", ", ".join(refs)]
    lines += ["", f"Referencia: [`{DOC}`](https://github.com/{REPO}/blob/main/{DOC})", "", f"<sub>{tid}</sub>"]
    return "\n".join(lines)


def to_md(path):
    out = ["# Backlog de MasterIA", "",
           "Generado desde el plan de sprints. El tablero vivo está en GitHub Projects; este archivo es la vista de referencia.", "",
           "## Roles", ""]
    out += [f"- **{v}**" for k, v in ROLES.items()]
    for i, (name, hours, goal) in enumerate(SPRINTS):
        out += ["", f"## {name} · {hours}", "", f"*Objetivo:* {goal}", "", "| ID | Tarea | Responsable | Etiquetas | Depende de |", "|---|---|---|---|---|"]
        for t in TASKS:
            if t[1] == i:
                out.append(f"| {t[0]} | {t[4]} | {ROLES[t[2]]} | {', '.join(t[3])} | {', '.join(t[7]) or '—'} |")
    open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")
    print("Escrito", path)


def gh(*args, json_out=False):
    r = subprocess.run(["gh", *args], capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        raise SystemExit(f"gh {' '.join(args)}\n{r.stderr}")
    return json.loads(r.stdout) if json_out else r.stdout.strip()


def to_github(con_project=True):
    # Labels
    for name, (color, desc) in LABELS.items():
        gh("label", "create", name, "--repo", REPO, "--color", color, "--description", desc, "--force")
    # Milestones = sprints
    existing = {m["title"]: m["number"] for m in gh("api", f"repos/{REPO}/milestones?state=all&per_page=100", json_out=True)}
    for name, hours, goal in SPRINTS:
        if name not in existing:
            gh("api", f"repos/{REPO}/milestones", "-f", f"title={name}", "-f", f"description={hours} · {goal}")
    # Issues (idempotente por título)
    have = {i["title"]: i for i in gh("issue", "list", "--repo", REPO, "--state", "all", "--limit", "300", "--json", "title,number,url", json_out=True)}
    numeros = {}
    urls = {}
    for t in TASKS:
        tid, s, rol, labels, titulo = t[:5]
        full = f"[{tid}] {titulo}"
        if full in have:
            numeros[tid], urls[tid] = have[full]["number"], have[full]["url"]
            continue
        url = gh("issue", "create", "--repo", REPO, "--title", full, "--body", body(t), "--label", ",".join(labels), "--milestone", SPRINTS[s][0])
        urls[tid] = url
        numeros[tid] = int(url.rstrip("/").split("/")[-1])
        print("Creado", full, url)
    # Reescribir cuerpos con dependencias como #n
    for t in TASKS:
        extra = ["--add-assignee", ASSIGNEES[t[2]]] if t[2] in ASSIGNEES else []
        gh("issue", "edit", str(numeros[t[0]]), "--repo", REPO, "--body", body(t, numeros), *extra)
    if not con_project:
        print('Issues listos (sin Project).')
        return
    # Project
    projects = gh("project", "list", "--owner", OWNER, "--format", "json", json_out=True)["projects"]
    proj = next((p for p in projects if p["title"] == PROJECT_TITLE), None)
    if not proj:
        proj = gh("project", "create", "--owner", OWNER, "--title", PROJECT_TITLE, "--format", "json", json_out=True)
        gh("project", "link", str(proj["number"]), "--owner", OWNER, "--repo", REPO)
    num, pid = str(proj["number"]), proj["id"]
    fields = gh("project", "field-list", num, "--owner", OWNER, "--format", "json", json_out=True)["fields"]
    names = {f["name"] for f in fields}
    if "Sprint" not in names:
        gh("project", "field-create", num, "--owner", OWNER, "--name", "Sprint", "--data-type", "SINGLE_SELECT",
           "--single-select-options", ",".join(s[0] for s in SPRINTS))
    if "Responsable" not in names:
        gh("project", "field-create", num, "--owner", OWNER, "--name", "Responsable", "--data-type", "SINGLE_SELECT",
           "--single-select-options", ",".join(ROLES.values()))
    fields = gh("project", "field-list", num, "--owner", OWNER, "--format", "json", json_out=True)["fields"]
    fmap = {f["name"]: f for f in fields}

    def opt(field, value):
        f = fmap[field]
        return f["id"], next(o["id"] for o in f["options"] if o["name"] == value)

    # Agregar al Project y fijar campos
    for t in TASKS:
        tid, s, rol = t[:3]
        item = gh("project", "item-add", num, "--owner", OWNER, "--url", urls[tid], "--format", "json", json_out=True)
        for field, value in (("Sprint", SPRINTS[s][0]), ("Responsable", ROLES[rol])):
            fid, oid = opt(field, value)
            gh("project", "item-edit", "--id", item["id"], "--project-id", pid, "--field-id", fid, "--single-select-option-id", oid)
    print("Project:", proj.get("url", f"https://github.com/users/{OWNER}/projects/{num}"))


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "--md":
        to_md(sys.argv[2])
    elif len(sys.argv) >= 2 and sys.argv[1] == "--github":
        to_github(con_project="--sin-project" not in sys.argv)
    else:
        print(__doc__)
