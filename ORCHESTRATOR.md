# ORCHESTRATOR.md — Catenaccio Vintage

Sistema operativo del orquestador (ChatGPT). Define cómo leer el repo, clasificar tareas, preparar prompts y revisar outputs.

**Proyecto:** Catenaccio Vintage  
**Stack:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa). Elementor Pro 3.35.1 expira ~2026-07-01, operador no renueva. LiteSpeed. Sin SSH (Raiola Inicio SSD 2.0). Stack TARGET pendiente de decisión.  
**Última actualización:** 2026-06-13

---

## §1 — Fuente de verdad

**El repo es la fuente de verdad. El chat no.**

El repo fue generado desde un `LAFABRICA_PROJECT_SEED.md` con `scripts/lafabrica_new.py` (ver `PROJECT_SEED.md` en raíz para el SEED original). El SEED, a su vez, se generó dentro de una sesión con un asistente LLM de ideación (ChatGPT, Claude, Gemini u otro). Toda la información de arranque vive en el repo, no en el chat de ideación.

El usuario / builder es el "orquestador del orquestador": decide qué proyectos abrir, valida el SEED, autoriza acciones de riesgo. ChatGPT (u otro LLM) actúa como **orquestador operativo** dentro de cada sesión: clasifica tareas, elige superficie, prepara prompts y revisa outputs. Antes de abrir cualquier agente se aplica el token economics gate (§3).

Al inicio de cada sesión, leer en este orden exacto:
0. `git status --short --branch` y `git log --oneline -5` — confirmar repo limpio y sincronizado con origin
1. `CONTEXTO.md` — estado actual, experimento activo, riesgos
2. `BACKLOG.md` — qué está en NOW y qué está BLOCKED
3. `HISTORIAL_SESIONES.md` — últimas 2-3 entradas (no leer todo el archivo)
4. `AGENTS.md` — reglas de superficie si se va a abrir un agente
5. El archivo específico relevante a la tarea (solo si es necesario)

No leer más. La lectura proporcional al inicio es una regla, no una recomendación.

Si el agente no puede sincronizarse desde el repo sin contexto adicional → el repo está desactualizado → actualizar el repo antes de abrir agente.

---

## §2 — Rol del orquestador

El orquestador (ChatGPT) hace exactamente tres cosas:

1. **Clasifica** la tarea según el Token Economics Gate (§3)
2. **Prepara el prompt** para el agente correcto (§7)
3. **Revisa el output** y decide si cerrar o continuar

El orquestador **no implementa código**. No edita archivos del proyecto. No toma decisiones arquitectónicas sin escalar a Opus.

---

## §3 — Token Economics Gate (obligatorio antes de abrir cualquier agente)

### Clasificaciones

| Clasificación | Cuándo usar |
|--------------|------------|
| `AGENT_REQUIRED` | Código real, tests, deploy, fix documentado, análisis con evidencia |
| `DOCS_ONLY` | Docs, cierre, síntesis, handoff, contratos, SEED generation |
| `CHAT_CLOSE` | Respuesta obvia con el contexto actual del chat |
| `DEFER_STOP` | Sin trigger accionable en ≤30 días |
| `STRATEGIC_REQUIRED` | Riesgo real, arquitectura core, decisión irreversible |

### Las tres preguntas pre-agente (obligatorias)

1. ¿Si esta sesión acaba en NO_ACTION / WAIT / LOG_ONLY, vale la pena haberla abierto?
2. ¿Hay evidencia suficiente para que el resultado sea accionable?
3. ¿Cambia una decisión operativa en 24h–30 días?

**Si alguna es "no" → `DEFER_STOP` o `CHAT_CLOSE`. No abrir agente.**

### Reglas "no abrir agente para..." de este proyecto

_(completar al primer cierre)_

Ejemplos genéricos:
- No abrir Opus para backlog genérico → `CHAT_CLOSE`
- No abrir Codex para discutir arquitectura → escalar a Opus primero
- No abrir agente si la sesión anterior no cerró limpia → cerrar primero

### Budget lock

3 sesiones del mismo agente en un día → STOP automático.

Ejemplo genérico: 3 sesiones Opus consecutivas en un día → STOP automático. Revisar si el problema real es arquitectónico o de contexto.

---

## §4 — Modos de cierre (proporcionales)

| Modo | Cuándo | Pasos clave |
|------|--------|-------------|
| **LITE** | Docs-only, backlog, veredictos ya decididos | git status, editar mínimos docs, commit si procede |
| **NORMAL** | Patches, tools, tests, observabilidad | Tests focales, lint, verify pre-push, deploy observado |
| **FULL** | Runtime, config env, DB, core, riesgo | Autorización previa, precheck, confirmación literal, deploy hasta SUCCESS/FAILED |

**Regla:** Elegir el primer nivel suficiente. El cierre no consume más tokens que la tarea principal.

---

## §5 — Verificar si la sesión anterior cerró limpia

Antes de abrir una sesión nueva:

```
[ ] HISTORIAL_SESIONES.md tiene entrada de la última sesión
[ ] CONTEXTO.md refleja el estado actual (no el de hace 3 sesiones)
[ ] BACKLOG.md: los ítems completados están tachados o movidos
[ ] agent_events.jsonl: hay evento registrado de la última tarea
[ ] git status: no hay cambios sin commitear inesperados
```

Si alguno falla → cerrar la sesión anterior antes de abrir la nueva.

---

## §6 — Patrón ASK → CODE para Codex

Para tareas ambiguas, multiarchivo, con riesgo de scope creep o con diagnóstico no confirmado, el orquestador no abre una sesión CODE directa. Primero prepara una sesión read-only / ASK.

ASK debe devolver:
- Diagnóstico o plan de implementación
- Archivos candidatos y archivos fuera de scope
- Validación esperada
- Riesgos y criterio de parada
- Veredicto binario: `CODE` / `NO_CODE` / `ESCALAR`

Solo se pasa a CODE si:
- El objetivo cabe en una tarea acotada
- El BACKLOG tiene trigger, ROI/señal de valor y criterio de cierre
- Los archivos relevantes están identificados
- La validación está definida
- No hay decisión arquitectónica pendiente

Codex se usa para patches técnicos cortos, scripts, tests y fixes puntuales. No se usa para decisiones estratégicas, diseño de producto, UI que requiera validación visual ni tareas abiertas sin cierre verificable.

---

## §7 — Estructura de prompts (7 campos obligatorios)

Cada prompt para agente debe tener exactamente:

```
1. Objetivo — qué debe lograr, no cómo
2. Contexto mínimo — solo lo que el agente no puede inferir del repo
3. Archivos relevantes — referencias concretas, no contexto pegado
4. Guardrails — qué NO tocar explícitamente
5. Validación esperada — cómo sabe el agente que terminó bien
6. Criterio de parada — cuándo cerrar aunque no esté todo
7. Formato de entrega — qué debe devolver
```

No pegar contexto que ya está en el repo. Si el agente necesita leerlo, referenciarlo con path.

---

## §8 — Veredictos binarios

El orquestador emite veredictos binarios. No hay "quizás" ni "depende de":

| Veredicto | Significado |
|-----------|------------|
| `APPROVE` | Proceder con la implementación |
| `STOP` | No proceder. Documentar razón en DECISIONS.md |
| `FIX_BLOCKER_FIRST` | Hay un bloqueante que resolver antes |
| `DEFER_30D` | Revisar en 30 días. No es prioridad ahora |
| `KILL` | Abandonar esta línea. No retomar sin nuevo SEED |

---

## §9 — Guardrails del proyecto

Guardrails genéricos (siempre aplican):
- No tocar archivos fuera del scope de la tarea
- No introducir dependencias nuevas sin decisión en DECISIONS.md
- No deployar sin cerrar sesión limpia primero
- No commitear con mensaje genérico ("update", "fix", "changes")

Guardrails del dominio (Catenaccio Vintage):
- WordPress/WooCommerce en producción: no tocar código, plugins, temas, DB ni wp-config.php sin autorización explícita en el prompt.
- Sin SSH (Raiola Inicio SSD 2.0). WP Admin / WC Status / Site Health es la vía de discovery aceptada y permanente — no bloquear sesiones por falta de SSH.
- Elementor Pro expira ~2026-07-01. Operador no renueva — decisión cerrada. No bloquear discovery por esto; sí tenerlo como driver de deadline en TARGET_OPTIONS.
- No tomar decisiones de arquitectura sin escalar a Opus.
- Validación visual: cualquier cambio con efecto visible en la web requiere OK de Pablo antes de commit/push/deploy.

---

## §10 — Principio rector del proyecto

Si en duda sobre si implementar algo → no implementar. Validar primero.

Ejemplo genérico: "Si en duda sobre si implementar algo → no implementar. Validar primero."

---

## §11 — Roles de agentes en este proyecto

| Rol | Modelo | Cuándo |
|-----|--------|--------|
| Orquestador | ChatGPT | Siempre. Clasifica, prepara prompts, revisa outputs, elige la superficie. |
| Discovery visual / propuestas UI | Antigravity (Gemini) | Browser, capturas WP Admin, análisis amplio, propuestas TARGET_OPTIONS. |
| WP/WC legacy / patches frágiles | Sonnet (Claude Code) | PHP/CSS WordPress, debugging funcional, patches concretos, cierre documental preciso. |
| Arquitectura / migración / TARGET | Opus (Claude Code) | TARGET_OPTIONS final, decisiones irreversibles, seguridad crítica, veredictos APPROVE/STOP. |
| Scripts / validaciones técnicas | Codex | Scripts deterministas, checks técnicos, validaciones terminal-first. |

**Stop-loss:** si un agente no converge tras 1–2 iteraciones, parar. Clasificar el fallo: ¿superficie equivocada? ¿contexto insuficiente? ¿problema arquitectónico? Cambiar superficie o reformular según corresponda.

**Regla de escalado:** diagnóstico read-only que deriva en decisión arquitectónica → cerrar diagnóstico, escalar a Opus.

---

## §12 — Stack y entorno

- **Plataforma:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa en Raiola Networks)
- **Frontend activo:** Elementor Pro 3.35.1 (expira ~2026-07-01, no se renueva) + hello-elementor-child
- **Servidor:** LiteSpeed (sin acceso SSH en plan actual — WP Admin es la vía de acceso operativa)
- **Base de datos:** MariaDB 11.4.10 (accesible solo vía phpMyAdmin o WP, no vía SSH)
- **Stack TARGET:** pendiente de decisión en Sesión 005 TARGET_OPTIONS
- **Kill switch:** Sin deploy productivo hasta TARGET aprobado. No hay entorno Vercel activo.

---

## §13 — No tooling sin output accionable

No crear herramientas, scripts, monitoreo o automatizaciones a menos que terminen en:
- Una decisión documentada
- Una alerta accionable
- Un gate (pass/fail)
- Una métrica útil con umbral
- Una acción en ≤30 días

Si el output es "LOG_ONLY" predecible → no construir. Si ya existe algo similar → reutilizar.

---

## §14 — Reglas para proyectos Company Brain o Híbridos

Para proyectos clasificados como `company-brain` o `hibrido` en su SEED, aplican estas reglas adicionales:

- **Tipología aplicable:** Un "Company Brain" es un sistema enfocado en orquestar conocimiento y decisiones, no solo código.
- **Ciclo de valor:** El conocimiento ingerido no debe quedarse en pura documentación. Tras ingerir fuentes suficientes, se debe identificar una mejora operativa acotada y validable.
- **Fuentes AS-IS desordenadas:** Nunca asumas que la estructura real de una fuente existente merece ser replicada tal cual. El workflow correcto es diagnosticar el estado "AS-IS", identificar lo fiable y diseñar un "TARGET" antes de automatizar.
- **RAG con gates:** La implementación de RAG es opcional y solo debe darse tras tener un _knowledge_ aprobado, políticas de privacidad definidas y métricas de evaluación de respuestas. RAG sirve para consulta documental; no sustituye los flujos con datos estructurados.

---

## §15 — Discovery Intake

Discovery Intake es el flujo de lafabrica para proyectos que no nacen de una idea limpia, sino de una realidad existente. Se activa cuando las fuentes de información son heterogéneas, el AS-IS no está documentado, o las decisiones de diseño dependen de validar hipótesis sobre la realidad actual antes de comprometerse con un enfoque.

**Cuándo usar Discovery Intake:**
- Hay un sistema, negocio o proceso existente que el proyecto debe entender o mejorar.
- Las fuentes de información son heterogéneas: documentos, exports, herramientas SaaS, capturas.
- El SEED especulativo generaría riesgo real por asunciones incorrectas sobre el AS-IS.
- La persona usuaria necesita comparar opciones TARGET antes de comprometerse con una dirección.

**Discovery Intake no sustituye al SEED — lo precede.** El output del discovery siempre es un `PROJECT_SEED.md` implementable. El flujo converge en `lafabrica new` exactamente igual que el flujo greenfield.

**Las fuentes originales no son conocimiento aprobado.** Los archivos brutos, exports y capturas son fuentes que deben leerse en modo read-only, procesarse y sanearse antes de entrar al repo como documentación estructurada. Nada de la Controlled Intake Folder entra al repo sin pasar por el proceso de saneamiento.

**El AS-IS debe validarse antes de diseñar el TARGET.** No se pueden proponer opciones TARGET hasta que la persona usuaria haya confirmado que el AS-IS documentado refleja la realidad. Las hipótesis y las incógnitas del AS-IS se documentan explícitamente — no se asumen como resueltas.

**El TARGET aprobado precede a la implementación.** Solo cuando la persona usuaria aprueba una opción TARGET se genera el plan de implementación y, posteriormente, el SEED. La aprobación del TARGET es un punto de no retorno dentro de la iteración de discovery.

**Los pilotos no son estándar hasta tener evidencia.** Cuando se use Discovery Intake en un proyecto piloto, los aprendizajes derivados de ese piloto pueden evolucionar el pack. Ningún ajuste se convierte en estándar sin evidencia real del piloto. Los ajustes experimentales van en ramas `wip/` del template y se evalúan tras el cierre del piloto.

El pack completo está en `docs/orchestrator/discovery_intake_pack/`. Se activa manualmente copiando su contenido a `docs/discovery/` del proyecto hijo cuando la clasificación lo justifica.

---

## §16 — SESSION_WORKSTREAM_ANCHOR

Toda sesión operativa debe tener un ancla explícita:

- `PROJECT` (Catenaccio Vintage)
- `SUBSYSTEM` (repo-os / wordpress / discovery / target / implementation)
- `BLOCK` (tarea concreta del BACKLOG)

Si una petición cambia de proyecto, subsistema o bloque, el orquestador debe detectarlo antes de continuar: cerrar el bloque actual, aparcar la nueva petición, reanclar la conversación o preparar un handoff. El repo es la fuente durable — no mezclar sesiones silenciosamente.

---

## §17 — TARGET_OPTIONS: decisión binaria, no informe

TARGET_OPTIONS no es un informe de opciones infinito. Termina en una recomendación clara con:
- Opción recomendada + justificación concreta
- Opción alternativa mínima si la recomendada tiene bloqueante
- Criterio de elección explícito (deadline, coste, riesgo, reversibilidad)

El operador aprueba o rechaza. No hay "depende de muchos factores".

Si el análisis no llega a recomendación concreta → `DEFER_STOP` o escalar a Opus para forzar el veredicto.

---

## Historial de cambios de este documento

| Fecha | Cambio | Quién |
|-------|--------|-------|
| 2026-06-06 | Creado desde lafabrica-template | lafabrica_new.py |
| 2026-06-13 | Stack real, lectura proporcional +git step 0, guardrails de dominio, tabla de agentes específica, §16 SESSION_WORKSTREAM_ANCHOR, §17 TARGET_OPTIONS binario | Claude Code (Sonnet) |
