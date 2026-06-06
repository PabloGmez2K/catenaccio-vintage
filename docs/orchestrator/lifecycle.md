# Ciclo de vida de un proyecto con lafabrica

Este documento describe el ciclo completo de un proyecto desde la idea hasta el cierre de una sesión, indicando dónde encaja cada pieza del Orchestrator Pack.

**Última actualización:** 2026-05-20.

---

## Diagrama general

```
                                ┌──────────────────────────┐
                                │ Idea en cualquier chat   │
                                │ LLM (ChatGPT / Claude /  │
                                │  Gemini / otro)          │
                                └────────────┬─────────────┘
                                             │
                                             │ pegar prompt de generación
                                             ▼
                              ┌──────────────────────────────┐
                              │ prompts/                     │
                              │ generate_project_seed_       │
                              │ from_chat.md                 │
                              └──────────────┬───────────────┘
                                             │
                                             │ genera
                                             ▼
                                ┌──────────────────────────┐
                                │ PROJECT_SEED.md          │
                                │ guardado en              │
                                │ C:\Projects\seeds\       │
                                │ <slug>_SEED.md           │
                                └────────────┬─────────────┘
                                             │
                                             │ ejecutar
                                             ▼
                              ┌──────────────────────────────┐
                              │ lafabrica new <slug>         │
                              │  · resuelve seed por nombre  │
                              │  · git init -b main          │
                              │  · copia legacy assets       │
                              │  · genera Orchestrator Pack  │
                              │  · primer commit             │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────┐
                              │ C:\Projects\<slug>           │
                              │ Repo operable                │
                              │ (fuente de verdad)           │
                              └──────────────┬───────────────┘
                                             │
                                             │ una sola vez por proyecto
                                             ▼
                              ┌──────────────────────────────┐
                              │ Crear ChatGPT Project        │
                              │ Pegar:                       │
                              │ orchestrator/                │
                              │   PROJECT_START_PROMPT.md    │
                              └──────────────┬───────────────┘
                                             │
                                             ▼
                            ┌──────────────────────────────────┐
                            │ Orquestador ChatGPT activo       │
                            └──────────────┬───────────────────┘
                                           │
                                           │ cada sesión nueva
                                           ▼
                            ┌──────────────────────────────────┐
                            │ lafabrica continue <slug>        │
                            │  · lee CONTEXTO / HISTORIAL /    │
                            │    BACKLOG                       │
                            │  · renderiza SESSION_CONTINUE    │
                            │  · al portapapeles               │
                            └──────────────┬───────────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────────┐
                            │ Pegar en el Project              │
                            │ ChatGPT clasifica con gate       │
                            │ (AGENT_REQUIRED / CHAT_CLOSE /   │
                            │  DEFER_STOP / STRATEGIC_REQ /    │
                            │  DOCS_ONLY)                      │
                            └──────────────┬───────────────────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                 │
                          ▼                                 ▼
              ┌─────────────────────┐         ┌──────────────────────┐
              │ CHAT_CLOSE          │         │ AGENT_REQUIRED       │
              │ Resolver en chat    │         │ Preparar prompt con  │
              │ Sin abrir agente    │         │ los 7 campos para    │
              │                     │         │ el agente            │
              └──────────┬──────────┘         └──────────┬───────────┘
                         │                               │
                         │                               │ lafabrica prompt
                         │                               │ <slug> implement
                         │                               ▼
                         │                  ┌───────────────────────────┐
                         │                  │ Sesión con agente         │
                         │                  │ implementador             │
                         │                  │ (Opus Max / Antigravity)  │
                         │                  └──────────┬────────────────┘
                         │                             │
                         │                             ▼
                         │                  ┌───────────────────────────┐
                         │                  │ Output del agente         │
                         │                  └──────────┬────────────────┘
                         │                             │
                         │                             │ vuelta a ChatGPT
                         │                             ▼
                         │                  ┌───────────────────────────┐
                         │                  │ orchestrator/             │
                         │                  │  agent_prompts/           │
                         │                  │  prompt_review_output.md  │
                         │                  └──────────┬────────────────┘
                         │                             │
                         └──────────────┬──────────────┘
                                        ▼
                            ┌──────────────────────────────────┐
                            │ Cierre de sesión                 │
                            │ orchestrator/                    │
                            │  SESSION_CLOSE_PROMPT.md         │
                            │                                  │
                            │ Append a CONTEXTO.md             │
                            │ Append a HISTORIAL_SESIONES.md   │
                            │ Append a agent_events.jsonl      │
                            │ Mover BACKLOG.md items completed │
                            │ Commit local                     │
                            └──────────────┬───────────────────┘
                                           │
                                           ▼
                                 ┌────────────────────┐
                                 │ Siguiente sesión   │
                                 │ (volver al paso    │
                                 │ "lafabrica         │
                                 │  continue")        │
                                 └────────────────────┘
```

---

## Fases del ciclo

### 1. Ideación

La idea se trabaja en cualquier chat LLM (ChatGPT, Claude, Gemini, otro). Conversación libre. No hay estructura todavía. Esta fase puede durar diez minutos o tres días. lafabrica no interviene aquí.

### 2. Generación del SEED

Cuando la idea está suficientemente clara, se pega en ese mismo chat el prompt `prompts/generate_project_seed_from_chat.md`. El asistente lee toda la conversación y devuelve un `PROJECT_SEED.md`. Si falta información crítica, lo pregunta antes de inventar (regla del propio prompt).

El SEED se guarda localmente en `C:\Projects\seeds\<slug>_SEED.md`.

### 3. Generación del repo

Se ejecuta `lafabrica new <slug>`. El generador:

- Resuelve el SEED por convención de naming.
- Copia la estructura del template al destino.
- Sustituye placeholders con datos del SEED.
- Copia los activos legacy declarados en `LEGACY_ASSETS` a `public/legacy/` del proyecto.
- Genera el Orchestrator Pack en `orchestrator/`.
- Inicializa git con branch `main`.
- Hace el primer commit.

Tras esto, el repo es la fuente de verdad del proyecto.

### 4. Apertura del proyecto

`lafabrica open <slug>` abre el proyecto en la superficie correcta según el `--agent-surface` declarado en el SEED. VS Code para `claude-code` o `codex`. Antigravity para `antigravity`.

### 5. Creación del ChatGPT Project (una sola vez)

Se crea un Project nuevo en `chatgpt.com`. Se pega `orchestrator/PROJECT_START_PROMPT.md` como mensaje inicial. ChatGPT confirma con una línea. Se guarda la URL del Project en `config/lafabrica.toml` del template, en la sección `[chatgpt_project_urls]`.

### 6. Sesión normal

Cada sesión nueva:

1. `lafabrica continue <slug> --task "..."` renderiza el prompt de continuación con el estado del repo (CONTEXTO, HISTORIAL, BACKLOG NOW) y lo deja en el portapapeles.
2. Se pega en el Project. ChatGPT actúa como orquestador.
3. ChatGPT aplica el Token Economics Gate. Si la tarea es `CHAT_CLOSE`, se resuelve allí. Si es `AGENT_REQUIRED`, prepara prompt con los siete campos para el agente implementador.
4. El agente implementador ejecuta. Devuelve output al orquestador.
5. ChatGPT aplica `prompt_review_output.md` para revisar.
6. Se aplica `SESSION_CLOSE_PROMPT.md`: append a CONTEXTO, HISTORIAL, `agent_events.jsonl`, mover BACKLOG ítems, commit local.

### 7. Iteración

Volver al paso 6. El repo evoluciona. CONTEXTO.md e HISTORIAL_SESIONES.md son append-only, así que la historia queda íntegra.

---

## Dónde encaja cada pieza del Pack

| Pieza | Fase | Quién la usa |
|---|---|---|
| `prompts/generate_project_seed_from_chat.md` (template raíz) | 2 | Asistente LLM de ideación |
| `PROJECT_SEED.md` | 2, 3 | `lafabrica new` lo lee |
| `lafabrica new` | 3 | Operador |
| `lafabrica open` | 4 | Operador |
| `orchestrator/PROJECT_START_PROMPT.md` | 5 (una vez) | ChatGPT en el Project |
| `orchestrator/SESSION_CONTINUE_PROMPT.md` | 6 (cada sesión) | ChatGPT (renderizado por `lafabrica continue`) |
| `orchestrator/agent_prompts/prompt_*.md` | 6 (según necesidad) | Agente implementador o ChatGPT |
| `orchestrator/SESSION_CLOSE_PROMPT.md` | 6 (al cierre) | ChatGPT como orquestador |
| `orchestrator/HANDOFF_PROMPT.md` | 6 (si cambia el agente) | Agente receptor |

---

## Lo que no se hace en ningún punto del ciclo

- **No se vacían CONTEXTO.md ni HISTORIAL_SESIONES.md.** Son append-only.
- **No se edita PROJECT_SEED.md.** Es snapshot inicial. Los cambios de rumbo van a DECISIONS.md del proyecto.
- **No se sube nada a la nube como condición previa.** GitHub es opcional y posterior. El repo local funciona como fuente de verdad sin remoto.
- **No se duplica el backlog en el chat.** Si una tarea aparece en el chat, se mueve a BACKLOG.md antes de cerrar la sesión.
- **No se confía en la memoria del chat para hechos del proyecto.** Si no está en el repo, no existe.
