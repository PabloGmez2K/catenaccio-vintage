# docs/orchestrator — Guía del Orchestrator Pack

Este directorio explica qué es el **Orchestrator Pack** que `lafabrica new` genera dentro de cada proyecto, qué contiene, cómo se usa y en qué se diferencia de los documentos operativos clásicos (`ORCHESTRATOR.md`, `AGENTS.md`).

**Aplica a:** proyectos generados con lafabrica v0.3 o superior.
**Última actualización:** 2026-05-20.

---

## Qué es el Orchestrator Pack

El Orchestrator Pack es un conjunto de **prompts ejecutables** que viven en `orchestrator/` del proyecto generado. Su propósito es eliminar la fricción de generar manualmente los prompts de continuación, cierre y handoff entre sesiones de trabajo con agentes.

No es documentación narrativa. No describe el proyecto. **Es texto operativo listo para pegar** en ChatGPT, en un agente implementador o en una sesión nueva.

---

## Diferencia entre `ORCHESTRATOR.md` y `orchestrator/`

Esta es la separación crítica:

| `ORCHESTRATOR.md` (raíz del proyecto) | `orchestrator/` (Pack del proyecto) |
|---|---|
| **Manual operativo del orquestador.** Documento narrativo. | **Prompts ejecutables.** Texto que se pega tal cual en chats y agentes. |
| Describe reglas, roles, gate pre-agente, modos de cierre, guardrails del proyecto. | Instancia esas reglas en prompts concretos para cada momento del ciclo. |
| Se lee al onboarding o cuando algo no se recuerda. | Se ejecuta en cada sesión. |
| No se pega en ningún chat. Se consulta. | Cada archivo está pensado para ser pegado en un chat concreto. |
| Mantenido por el orquestador como manual del proyecto. | Mantenido por `lafabrica create-orchestrator <slug>`, regenerable. |

Reglas mnemotécnicas:

- Si el documento empieza con "# Sistema operativo…" y describe roles → es manual (`ORCHESTRATOR.md`).
- Si el documento empieza con "Eres el orquestador…" o "Sesión [N]…" → es prompt (`orchestrator/`).

---

## Contenido del Pack

```
<proyecto>/
├── orchestrator/
│   ├── PROJECT_START_PROMPT.md
│   ├── SESSION_CONTINUE_PROMPT.md
│   ├── SESSION_CLOSE_PROMPT.md
│   ├── HANDOFF_PROMPT.md
│   └── agent_prompts/
│       ├── prompt_plan.md
│       ├── prompt_implement.md
│       ├── prompt_review_output.md
│       └── prompt_close_session.md
└── docs/
    └── orchestrator/
        ├── README.md     ← este archivo
        └── lifecycle.md  ← diagrama del ciclo
```

### Cuándo usar cada archivo

| Archivo | Cuándo | Dónde se pega | Quién lo lee |
|---|---|---|---|
| `PROJECT_START_PROMPT.md` | Una sola vez por proyecto: al crear el ChatGPT Project que coordinará el proyecto | Mensaje inicial del Project | ChatGPT como orquestador |
| `SESSION_CONTINUE_PROMPT.md` | Cada sesión nueva | Mensaje de entrada de la sesión en el Project ya creado | ChatGPT como orquestador |
| `SESSION_CLOSE_PROMPT.md` | Al cerrar cada sesión | El propio orquestador lo aplica | ChatGPT como orquestador |
| `HANDOFF_PROMPT.md` | Cuando una tarea cambia de agente (Sonnet → Antigravity, ChatGPT → Opus Max) | Mensaje inicial del agente receptor | Agente receptor |
| `agent_prompts/prompt_plan.md` | Antes de implementar algo no trivial: se pide un plan al agente implementador | Mensaje inicial de la sesión del agente | Agente implementador |
| `agent_prompts/prompt_implement.md` | Sesión de implementación | Mensaje inicial de la sesión del agente | Agente implementador |
| `agent_prompts/prompt_review_output.md` | Tras recibir el output del agente, para revisarlo desde ChatGPT | Mensaje en el Project | ChatGPT u operador |
| `agent_prompts/prompt_close_session.md` | Al cerrar una sesión desde el agente, no desde ChatGPT | Mensaje al agente al final de la sesión | Agente implementador |

---

## Cómo se rellenan los placeholders

Los prompts del Pack tienen placeholders en mayúsculas y corchetes:

- `[PROJECT_NAME]`, `[AGENT_SURFACE]`, `[STACK]`, `[DEST_PATH]`, etc. son sustituidos por `lafabrica new` al generar el proyecto. Se quedan resueltos en el archivo.
- `[CONTEXTO_TAIL_30_LINES]`, `[BACKLOG_NOW_ITEMS]`, `[LAST_HISTORIAL_ENTRY]`, etc. son sustituidos en runtime por `lafabrica continue <slug>`, que lee el estado actual del repo y renderiza el prompt. La copia renderizada va al portapapeles (o a stdout con `--no-clipboard`).

`lafabrica continue` no edita los archivos del Pack: los lee como plantillas y produce el resultado renderizado en memoria.

---

## Flujo de uso típico

1. **Generar el proyecto** con `lafabrica new <slug>`. El Pack queda dentro del proyecto.
2. **Crear el ChatGPT Project** en `chatgpt.com` y pegar `PROJECT_START_PROMPT.md` como mensaje inicial. ChatGPT confirma con una línea y queda listo como orquestador.
3. **Guardar la URL del Project** en `config/lafabrica.toml` del template (sección `[chatgpt_project_urls]`).
4. **Cada sesión nueva**: `lafabrica continue <slug> --task "lo que se quiere hacer"`. El prompt renderizado queda en el portapapeles. Se pega en el ChatGPT Project. El orquestador clasifica, prepara el prompt para el agente con los siete campos, etc.
5. **Cuando hace falta un prompt específico** (plan, implement, review, close): `lafabrica prompt <slug> <tipo>` lo deja en el portapapeles.
6. **Al cerrar la sesión**, aplicar el checklist de `SESSION_CLOSE_PROMPT.md`.

> En v0.3.0 los comandos `continue` y `prompt` aún no están disponibles. Mientras tanto, los archivos del Pack se pueden abrir y pegar manualmente.

---

## Regenerar el Pack en un proyecto existente

Si las plantillas del template se actualizan y un proyecto ya generado quiere recibirlas:

```
lafabrica create-orchestrator <slug>
```

Por defecto falla si `orchestrator/` ya existe. Con `--force` sobreescribe los archivos del Pack. Los placeholders se resuelven con los datos del SEED del proyecto.

---

## Qué **no** hace el Pack

- No reemplaza `ORCHESTRATOR.md` ni `AGENTS.md`. Esos siguen siendo manuales.
- No reemplaza `CONTEXTO.md`, `HISTORIAL_SESIONES.md` ni `BACKLOG.md`. Esos son estado vivo del proyecto.
- No se integra con Engram ni con ningún sistema de memoria persistente. El repo sigue siendo la única fuente de verdad.
- No envía nada a la nube. Es texto local en el repo.

---

## Mantenimiento

- Las plantillas viven en `templates/orchestrator/` del template lafabrica.
- Cuando se modifican, los proyectos existentes pueden regenerar su Pack con `lafabrica create-orchestrator <slug>`.
- Las sustituciones de placeholders se centralizan en `scripts/orchestrator_pack.py`.

---

## Más información

- [lifecycle.md](lifecycle.md) — Diagrama del ciclo completo: ideación → SEED → repo → sesión → cierre.
- [docs/design/LAFABRICA_v0_3_DESIGN.md](../design/LAFABRICA_v0_3_DESIGN.md) — Diseño normalizado de v0.3.
