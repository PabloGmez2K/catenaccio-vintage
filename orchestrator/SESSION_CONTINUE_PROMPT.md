# Sesión [N] — Catenaccio Vintage

**Fecha:** [TODAY]
**Branch:** [GIT_BRANCH] · **Último commit:** [LAST_COMMIT_SHORT] · [LAST_COMMIT_MSG]

> **Paso 0 obligatorio — verificar GitHub antes de procesar esta sesión.**
> Accede al repo del proyecto: https://github.com/PabloGmez2K/catenaccio-vintage
> Comprueba los últimos commits y confirma que el estado remoto es consistente con lo que este prompt indica. Lee como mínimo: `README`, `CONTEXTO.md`, `BACKLOG.md`, `HISTORIAL_SESIONES.md`, `DECISIONS.md` y los documentos del módulo activo. No asumas el estado del proyecto a partir de memoria ni de sesiones anteriores de este chat.
>
> **Si no puedes acceder a GitHub:** pide al operador `git status`, `git log --oneline -10`, la URL del remoto y el contenido de los archivos relevantes. No clasifiques ni generes prompts hasta recibir ese contexto mínimo.

## Estado actual (CONTEXTO.md, últimas líneas)

[CONTEXTO_TAIL_30_LINES]

## NOW (BACKLOG.md)

[BACKLOG_NOW_ITEMS]

## Última sesión (HISTORIAL_SESIONES.md, última entrada)

[LAST_HISTORIAL_ENTRY]

## Tarea propuesta para esta sesión

[USER_PROVIDES_OR_FIRST_NOW_ITEM]

## Restricciones recordadas

- Guardrails de dominio (AGENTS.md):
[GUARDRAILS_DOMAIN]
- Qué no construir todavía:
[QUE_NO_CONSTRUIR_TODAVIA]

## Lo que no se debe tocar en esta sesión

- BLOCKED items del BACKLOG.
- Archivos fuera del scope del ítem NOW elegido.
- DECISIONS.md (solo se edita tras veredicto Opus).
- PROJECT_SEED.md (snapshot, no se edita).

---

**Acción esperada del orquestador:**

0. **Verificar GitHub.** Comprobar últimos commits y estado documental del repo (README, CONTEXTO.md, BACKLOG.md, HISTORIAL_SESIONES.md, DECISIONS.md y documentos del módulo activo). Si no hay acceso a GitHub, solicitar el contexto mínimo al operador antes de continuar. No asumir estado del proyecto a partir de memoria.
1. Aplicar Token Economics Gate.
2. Decidir clasificación, superficie y modo.
3. Si `AGENT_REQUIRED`: preparar prompt con los siete campos (Objetivo · Contexto mínimo · Archivos relevantes · Guardrails · Validación esperada · Criterio de parada · Formato de entrega).
4. Si `CHAT_CLOSE`: resolver aquí sin abrir agente.
5. Reportar el plan en una línea antes de actuar.
