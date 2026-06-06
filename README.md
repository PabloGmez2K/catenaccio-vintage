# lafabrica-template

**Versión:** v0.3 (núcleo v0.3.0 en implementación)
**Fecha:** 2026-05-20

---

## Qué es lafabrica

lafabrica es el **lanzador** de un proyecto nuevo. Genera la fase 0 — la estructura, los documentos base, los prompts y los guardrails — para que cuando abras VS Code (con Claude Code o Codex) o Antigravity, el proyecto ya esté listo para empezar a desarrollarse.

No es un framework de código, no es un IDE, no es un orquestador. Es la herramienta que convierte "tengo una idea" en "tengo un repo donde puedo empezar a trabajar con un agente esta misma tarde".

## Qué problema resuelve

Cuando empezás un proyecto nuevo con agentes de IA, las primeras horas son siempre las mismas: ideas sueltas en un chat, primeras sesiones donde el agente no tiene contexto, documentos que aparecen de cualquier manera, decisiones de token economics que se aprenden recién en la sesión 15. Cada proyecto repite ese ciclo desde cero.

lafabrica corta ese arranque caótico. La estructura, los prompts, los guardrails y las reglas de trabajo entran en el repo antes de la primera sesión real con un agente. El proyecto nace con la forma probada en 361 sesiones de un proyecto previo (Polymarket Bot).

---

## Cómo se usa

lafabrica tiene dos flujos de entrada según el punto de partida:

**Flujo greenfield** (idea nueva, sin sistema previo relevante):

> idea → chat de ideación → PROJECT_SEED → `lafabrica new`

**Flujo discovery-intake** (hay una realidad existente que entender primero):

> fuentes heterogéneas → intake/discovery → comprensión AS-IS validada → opciones TARGET → PROJECT_SEED → `lafabrica new`

El flujo discovery-intake aplica cuando hay un negocio en marcha, un sistema existente o datos dispersos que deben comprenderse y validarse antes de diseñar el futuro. El Discovery Intake Pack opcional está en `docs/orchestrator/discovery_intake_pack/`. Los dos flujos convergen en `lafabrica new` con el mismo resultado: un repo estructurado listo para trabajar con un agente.

---

### Flujo greenfield

Cuando se te ocurre una idea nueva, lafabrica recomienda este recorrido:

1. **Abre una sesión en tu asistente preferido** — ChatGPT, Claude, Gemini, el que uses. Empieza a darle ideas, explícale qué quieres hacer, deja que te ayude a madurar el concepto. Esto puede llevar 10 minutos o 3 días, da igual.

2. **Cuando la idea esté clara**, pega en ese mismo chat el prompt de [prompts/generate_project_seed_from_chat.md](prompts/generate_project_seed_from_chat.md). El asistente va a leer toda la conversación y generar un `PROJECT_SEED.md`. Si le falta información crítica (problema real, usuario, qué NO construir todavía, datos sensibles, etc.), te lo preguntará antes de inventar.

3. **Guarda el SEED** localmente como `C:\Projects\seeds\<slug>_SEED.md` y ejecuta el launcher:

   ```powershell
   lafabrica new <slug>
   ```

   El launcher resuelve el SEED por convención, fija branch `main`, copia los activos legacy declarados y genera el Orchestrator Pack del proyecto.

   En la primera instalación, antes del primer `new`, ejecuta `lafabrica doctor` para verificar el entorno (Python, Git, Node, ExecutionPolicy, carpetas convencionales).

   > Estado actual: los comandos `lafabrica doctor`, `lafabrica new` y `lafabrica open` se entregan en v0.3.0 (en implementación). Mientras tanto, el generador legacy `python scripts/lafabrica_new.py` sigue funcionando — ver sección final.

4. **Abre el proyecto** con `lafabrica open <slug>`. El launcher lanza VS Code o Antigravity según el `--agent-surface` declarado en el SEED. El repo ya tiene docs base rellenados, BACKLOG con NOW/NEXT/LATER, prompts adaptados al agente, Orchestrator Pack en `orchestrator/` y primer commit hecho.

5. **Coordina las sesiones desde un ChatGPT Project**. Crea un Project nuevo en `chatgpt.com` y pega `orchestrator/PROJECT_START_PROMPT.md` como mensaje inicial (una sola vez por proyecto). A partir de ahí, ChatGPT actúa como orquestador operativo: clasifica tareas, prepara prompts, revisa el output del agente.

El flujo detallado, con roles y token economics, está en [docs/design/LAFABRICA_WORKFLOW.md](docs/design/LAFABRICA_WORKFLOW.md). El diseño normalizado de v0.3 vive en [docs/design/LAFABRICA_v0_3_DESIGN.md](docs/design/LAFABRICA_v0_3_DESIGN.md).

---

## Lo que el generador deja elegir

### Superficie de ejecución (`--agent-surface`)
Dónde va a trabajar el agente. lafabrica nació pensada para VS Code; ahora también soporta Antigravity:

- `claude-code` — VS Code + Claude Code. Por defecto. Bueno para docs, refactors, código sin UI.
- `codex` — VS Code + Codex. Patches técnicos cortos, scripts de servidor.
- `antigravity` — Antigravity. UI, navegador, capturas, cuenta Google, validación visual.

Puedes tener las tres y dejar que el orquestador elija según la tarea, o trabajar solo con una.

### Perfil (`--profile`)
Ajusta los guardrails iniciales del repo:

- `generic` — por defecto. Proyectos sin restricciones particulares.
- `internal-suite` — herramientas internas con datos sensibles (clientes, credenciales, cuentas reales). Añade reglas extra de "no tocar" en `AGENTS.md` y kill switch por env var.

### Nivel de documentación inicial
El generador rellena con contenido real del SEED los documentos que se usan desde el día 1: `README`, `PROJECT_BRIEF`, `BACKLOG`, `CONTEXTO`, `DECISIONS`, `AGENTS`, `ORCHESTRATOR` y el prompt del agente elegido. Documentos como `TOKEN_ECONOMICS.md` u `OPERATIONS_PLAYBOOK.md` quedan con defaults razonables y se afinan cuando el proyecto los necesita (primer cierre FULL, primer patrón de gasto inútil, etc.).

---

## Requisitos

### Mínimos
- Un asistente LLM para madurar la idea: ChatGPT, Claude, Gemini u otro.
- Python 3.
- Git.
- Editor local.
- Una carpeta donde vivan los proyectos (ej. `C:\Projects\`).

> En una versión futura del generador queremos detectar si faltan Python o git y ofrecerse a instalarlos. Por ahora hay que tenerlos antes.

### Recomendado

Lo que uso y tengo validado en el día a día (la suscripción de 20 USD de cada uno es suficiente):

- **ChatGPT** como orquestador operativo.
- **Claude Code** dentro de VS Code.
- **Codex** dentro de VS Code.
- **Antigravity** para proyectos con UI, navegador o cuenta Google.

El sistema también funciona si solo dispones de uno de los agentes. Si solo tienes Claude Code, lafabrica genera el repo con `--agent-surface claude-code` y trabajas siempre ahí. Lo mismo con Codex o Antigravity por separado. Tener los tres simplemente le da al orquestador más opciones para elegir según la tarea.

### Estado de cada pieza

| Componente | Estado |
|------------|--------|
| ChatGPT como orquestador | validado |
| Claude Code (Sonnet / Opus) | validado |
| Codex | validado |
| Antigravity | validado |
| Git + Python locales | validado |
| Otros IDEs / agentes no listados | sin probar |
| Automation con GitHub API | pendiente |
| Dashboard / CLI avanzado | pendiente |

---

## Reglas del sistema

Estas reglas se heredan en todo proyecto generado con lafabrica y no son negociables:

1. **El repo es la fuente de verdad, no el chat.** Cualquier agente puede re-sincronizarse desde el repo sin contexto previo.
2. **1 sesión = 1 tarea.** Si aparece una segunda tarea durante la sesión, va al BACKLOG y se cierra la actual primero.
3. **El orquestador no implementa.** Decide, clasifica, prepara prompts y revisa. El código lo escribe el agente.
4. **CONTEXTO.md e HISTORIAL_SESIONES.md son append-only.** Nunca replace_all.
5. **No se abren agentes para sesiones que terminan en NO_ACTION predecible.** Si la respuesta es obvia con el contexto actual, se cierra en el chat.
6. **El cierre es proporcional a la tarea** (LITE / NORMAL / FULL). El cierre no consume más tokens que el trabajo.
7. **lafabrica no puede tener más features que proyectos reales que la usen.**

---

## Lo que lafabrica no hace

- No genera código del proyecto hijo (ni `src/`, ni la app).
- No instala dependencias del proyecto.
- No crea el repo en GitHub automáticamente (ver más abajo).
- No hace deploy.
- No tiene dashboard, login ni UI.
- No reemplaza el backlog externo.

Todo eso sale del alcance hasta que un proyecto real lo pida.

---

## Estructura del template

```
lafabrica-template/
├── README.md                        # Este archivo
├── ORCHESTRATOR.md                  # Sistema operativo del orquestador
├── AGENTS.md                        # Contrato para agentes de implementación
├── PROJECT_BRIEF.md                 # Descripción del proyecto
├── CONTEXTO.md                      # Estado vivo del proyecto
├── HISTORIAL_SESIONES.md            # Memoria append-only de sesiones
├── DECISIONS.md                     # Decisiones arquitectónicas
├── BACKLOG.md                       # NOW / NEXT / LATER / BLOCKED
├── TOKEN_ECONOMICS.md               # Gate pre-agente del proyecto
├── OPERATIONS_PLAYBOOK.md           # Protocolo de trabajo y cierres
├── agent_events.jsonl               # Log estructurado de eventos
│
├── prompts/
│   ├── generate_project_seed_from_chat.md   # Para generar el SEED desde el chat de ideación
│   ├── prompt_opus_session1.md              # Validación inicial del SEED (opcional)
│   ├── prompt_sonnet_docs.md                # Sesiones de documentación
│   ├── prompt_codex_impl.md                 # Sesiones de implementación
│   ├── prompt_antigravity_impl.md           # Sesiones con Antigravity
│   └── prompt_cierre_lite.md                # Cierre LITE
│
├── templates/
│   ├── LAFABRICA_PROJECT_SEED.md            # Plantilla vacía del SEED
│   └── QUICKSTART_INTERNAL_TOOL.md          # Brief de 1 página (perfil internal-suite)
│
├── scripts/
│   └── lafabrica_new.py                     # Generador local
│
├── docs/
│   └── design/
│       ├── LAFABRICA_v0_DESIGN.md           # Diseño del sistema
│       ├── LAFABRICA_WORKFLOW.md            # Flujo, roles, token economics
│       ├── LAFABRICA_QUICKSTART.md          # Detalle del nivel de doc inicial
│       └── README.md                        # Índice de docs de diseño
│
└── data/
    └── .gitignore
```

---

## Comandos del launcher

`lafabrica` es un entrypoint único con subcomandos. Los disponibles en v0.3:

| Comando | Estado | Para qué |
|---------|--------|----------|
| `lafabrica doctor` | v0.3.0 | Verifica el entorno: Python ≥ 3.10, Git, Node, ExecutionPolicy, carpetas convencionales |
| `lafabrica new <slug>` | v0.3.0 | Genera un proyecto desde el SEED `seeds_dir/<slug>_SEED.md`. Branch `main`. Copia activos legacy. Crea Orchestrator Pack |
| `lafabrica open <slug>` | v0.3.0 | Abre el proyecto en VS Code o Antigravity según el `--agent-surface` declarado |
| `lafabrica continue <slug>` | v0.3.1 | Renderiza el prompt de continuación con el estado del repo y lo deja en el portapapeles |
| `lafabrica prompt <slug> <tipo>` | v0.3.1 | Saca cualquier prompt del Orchestrator Pack al portapapeles |
| `lafabrica create-orchestrator <slug>` | v0.3.1 | Regenera o añade el Orchestrator Pack a un proyecto existente. Requiere `--force` si `orchestrator/` ya existe |

Detalle completo, flags y fases en [docs/design/LAFABRICA_v0_3_DESIGN.md](docs/design/LAFABRICA_v0_3_DESIGN.md).

---

## Si no quieres usar el launcher

El generador clásico sigue funcionando como camino directo:

```
python scripts/lafabrica_new.py --seed SEED --dest DEST [opciones]
```

- `--seed PATH` — path al `LAFABRICA_PROJECT_SEED.md`. Obligatorio.
- `--dest PATH` — directorio destino (debe no existir o estar vacío). Obligatorio.
- `--profile {generic, internal-suite}` — perfil de guardrails. Default: `generic`.
- `--agent-surface {claude-code, codex, antigravity}` — superficie principal. Default: `claude-code`.
- `--git-init` — inicializa git y hace el primer commit `init: lafabrica seed <project>`.

Si por alguna razón (entorno sin Python en el PATH, validación didáctica) no quieres usar ni el launcher ni el generador, también puedes copiar el template a mano:

1. Copia recursiva: `cp -r lafabrica-template/ <nombre-proyecto>/`.
2. Rellena con los datos del SEED: README, PROJECT_BRIEF, CONTEXTO, BACKLOG, DECISIONS, ORCHESTRATOR, AGENTS, TOKEN_ECONOMICS, OPERATIONS_PLAYBOOK.
3. `git init -b main && git add . && git commit -m "init: lafabrica seed <project>"`.
4. Continúa desde el paso 4 del recorrido normal.

---

## Publicar lafabrica-template en GitHub

Con `git status` limpio:

```powershell
git remote add origin git@github.com:USUARIO/lafabrica-template.git
git branch -M main
git push -u origin main
```

Notas:
- No publicar SEEDs de proyectos hijos en este repo — viven en `C:\Projects\seeds\` localmente.
- `.tmp/` está en `.gitignore`.
- Antes del primer push, revisar que `agent_events.jsonl` esté vacío.

---

## Validar que un proyecto generado funcionó

Después de correr `lafabrica_new.py`:

- [ ] El repo destino tiene `git status` limpio tras `--git-init`.
- [ ] `PROJECT_SEED.md` está en la raíz.
- [ ] `BACKLOG.md` refleja los ítems NOW/NEXT/LATER del SEED.
- [ ] `AGENTS.md` tiene los guardrails del perfil + superficie elegidos.
- [ ] La primera sesión real con el agente pudo arrancar desde el repo sin contexto extra.

Si los cinco dan sí, el flujo funcionó.
