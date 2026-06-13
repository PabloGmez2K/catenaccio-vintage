# AGENTS.md — Catenaccio Vintage

Contrato corto para agentes de implementación (Claude Code / Codex / Antigravity). Equivalente operativo al ORCHESTRATOR.md pero para agentes directos.

**Proyecto:** Catenaccio Vintage  
**Stack:** WordPress 7.0 + WooCommerce 10.8.1 (producción activa). Elementor Pro expira ~2026-07-01, operador no renueva. Sin SSH (Raiola). Stack TARGET pendiente de decisión.

---

## Superficies de implementación soportadas

El orquestador (ChatGPT) elige la superficie según la tarea. El agente ejecuta — no decide la superficie.

| Superficie | Cuándo es la mejor opción | Cuándo evitar |
|------------|--------------------------|---------------|
| **Antigravity (Gemini)** | Discovery visual: capturas WP Admin, Site Health, análisis amplio; propuestas TARGET_OPTIONS; validación visual de UI; browser, integración Google | patches PHP/CSS sin UI |
| **Sonnet (Claude Code)** | WordPress/WooCommerce legacy: PHP, CSS, plugins, templates, debugging funcional, patches frágiles, cierre documental preciso | decisiones arquitectónicas (→ escalar Opus) |
| **Opus (Claude Code)** | TARGET_OPTIONS final, arquitectura core, migración, seguridad crítica, decisiones irreversibles, veredictos APPROVE/STOP | implementación rutinaria o docs (over-spend) |
| **Codex** | Scripts deterministas, validaciones técnicas acotadas, checks de servidor | tareas con contexto amplio o UI |

Reglas:
- Antigravity por defecto cuando el resultado requiere "ver" (browser, capturas, WP Admin, UI, validación visual).
- Sonnet para WP/WC legacy y patches concretos en PHP/CSS/templates.
- Opus solo para decisiones estratégicas o evaluación de bloqueos.
- Codex para scripts y validaciones acotadas sin UI.
- **Stop-loss:** si un agente no converge tras 1–2 iteraciones, parar. Clasificar el fallo: ¿superficie equivocada (→ cambiar agente)? ¿contexto insuficiente (→ reformular prompt)? ¿problema arquitectónico (→ escalar Opus)? No insistir con el mismo agente esperando resultado diferente.

El prompt específico para cada superficie está en `prompts/`. Para Antigravity: `prompts/prompt_antigravity_impl.md`.

---

## Lectura mínima al inicio de sesión

Leer en este orden. No leer más de lo necesario:

1. `CONTEXTO.md` — fase actual y experimento activo (primeras 50 líneas)
2. `BACKLOG.md` — ítem específico asignado en este prompt
3. El archivo relevante a la tarea (solo el necesario)

Si hace falta más contexto del repo para ejecutar la tarea → **parar y pedir al orquestador que reformule el prompt**. El contexto debe estar en el prompt; no es trabajo del agente descubrirlo.

---

## Razonamiento por defecto

- **Reasoning effort:** normal salvo indicación explícita
- **Scope:** el ítem del BACKLOG.md indicado en el prompt, nada más
- **Default para features nuevas:** OFF hasta que haya decisión explícita en DECISIONS.md

---

## Regla Codex ASK → CODE

Si la tarea llega como read-only / ASK, no modificar archivos. Devolver diagnóstico, plan, riesgos, archivos candidatos, validación y veredicto `CODE` / `NO_CODE` / `ESCALAR`. No pasar a implementación en la misma sesión salvo instrucción explícita del orquestador.

---

## Guardrails genéricos (siempre aplican)

- No modificar archivos fuera del scope de la tarea
- No introducir dependencias nuevas sin decisión documentada en DECISIONS.md
- No hacer refactor mientras resolvés un bug (scope creep)
- No commitear cambios sin descripción clara del qué y el por qué
- No implementar "mientras tanto" sin marcar como temporal en el código
- Primero evidencia, luego código: si el problema no está confirmado → no parchear
- Si el diagnóstico read-only deriva en decisión arquitectónica → cerrar y escalar a Opus

---

## Guardrails del dominio

**Catenaccio Vintage — WordPress/WooCommerce activo:**
- No tocar código WordPress, plugins, temas, DB ni wp-config.php sin autorización explícita en el prompt.
- Sin SSH (Raiola Inicio SSD 2.0). WP Admin / WC Status / Site Health es la vía de acceso aceptada y permanente. No bloquear sesiones por falta de SSH.
- Elementor Pro expira ~2026-07-01. Operador no renueva. No bloquear discovery por esto.
- Validación visual: cualquier cambio con efecto visible en la web requiere OK de Pablo antes de commit/push/deploy. Lint y type-check no sustituyen validación visual.
- Microparches WordPress (cuando lleguen): diagnóstico → contrato visual explícito → evidencia controlada (WP Admin / capturas) → cambio mínimo → OK visual Pablo → commit.
- No tomar decisiones de arquitectura sin escalar a Opus.

---

## Modos de operación del proyecto

_(completar si el proyecto tiene modos diferenciados)_

Ejemplo: si el proyecto tiene un modo "observación" y uno "acción", documentar aquí cuándo aplica cada uno y qué puede tocar el agente en cada modo.

---

## Reglas de cierre para agentes

Al finalizar una sesión, el agente debe:

```
[ ] Commitear todos los cambios con mensaje descriptivo
[ ] Actualizar CONTEXTO.md (append — nunca replace_all)
    → Una línea: Sesión N (fecha, Agente): MODO / tipo. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó].
[ ] Agregar entrada en HISTORIAL_SESIONES.md (append-only)
[ ] Registrar evento en agent_events.jsonl
[ ] Actualizar BACKLOG.md: mover ítems completados
[ ] Reportar al orquestador: resultado + siguiente paso recomendado
```

**Regla crítica:** CONTEXTO.md e HISTORIAL_SESIONES.md son append-only. Nunca replace_all, nunca editar entradas pasadas.

---

## Formato de reporte al orquestador

Al cerrar sesión, devolver exactamente:

```
SESIÓN: [N] — [título de la tarea]
MODO: [LITE / NORMAL / FULL]
RESULTADO: [COMPLETED / PARTIAL / BLOCKED]
QUÉ SE HIZO: [una línea]
QUÉ SE VALIDÓ: [una línea o "sin validación en esta sesión"]
QUÉ NO SE TOCÓ: [explícito — no "nada fuera del scope"]
SIGUIENTE PASO: [una acción concreta o DEFER_STOP]
```

---

## Patrón de Workflow "Antigravity 2.0"

Al usar la superficie Antigravity para integraciones web o manipulación de UI, sigue este patrón configurable:
- **Project + Local:** Usa el mismo Project de origen y tu entorno local para trabajo secuencial.
- **Bloque cerrado:** Inicia una nueva conversación solo por cada bloque operativo cerrado.
- **Iteración:** Usa la misma conversación para corrección, validación y cierre de ese bloque. No abras sesiones nuevas para microcorrecciones.
- **New Worktree:** Usa directorios paralelos (New Worktree) solo para trabajo paralelo o ramas experimentales.
- **Implementación y validación:** Utiliza el IDE para la implementación local, el terminal para scripts, y la UI del navegador para validaciones visuales obligatorias.

---

## Guardrails de calidad derivados de proyectos reales

Los siguientes guardrails se derivan de aprendizajes observados en proyectos reales gestionados con lafabrica. Aplican como comportamiento por defecto salvo instrucción explícita en contrario.

**Validación visual como prerequisito de commit cuando hay UI.**
Si la tarea tiene componentes de interfaz de usuario, no commitear hasta haber visto el resultado real en el navegador o la herramienta de destino. Los tests y el type-checking verifican corrección del código, no corrección de la experiencia de usuario.

**Stop-loss tras 1–2 iteraciones fallidas en el mismo punto.**
Si el agente falla dos veces seguidas en el mismo problema sin avance verificable, parar y reportar al orquestador con diagnóstico claro. Clasificar el fallo: ¿superficie equivocada (→ cambiar agente)? ¿contexto insuficiente (→ reformular prompt)? ¿problema arquitectónico (→ escalar Opus)? No continuar escalando el scope de los intentos ni insistir con el mismo agente.

**No crecer mientras el flujo crítico falla.**
Si hay un bloqueo en el flujo principal del proyecto (la funcionalidad central no funciona), no implementar features secundarias ni mejoras de calidad hasta que el flujo crítico esté resuelto. El backlog refleja este orden de prioridades.

**No convertir infraestructura o documentación en el proyecto principal.**
El objetivo de lafabrica es producir proyectos que resuelvan problemas reales. Si la sesión deriva en construir más tooling o documentación en lugar de avanzar el proyecto hijo, reportar al orquestador y reevaluar prioridades.

**No copiar fuentes desordenadas al repo sin saneamiento.**
Los archivos brutos de la Controlled Intake Folder no se copian directamente al repositorio. Solo el conocimiento estructurado, saneado y validado entra como documentación del proyecto. Ver `docs/orchestrator/discovery_intake_pack/DATA_AND_PRIVACY_BOUNDARIES.md`.

**Ramas `wip/*-rejected` para experimentos fallidos si procede.**
Si se inicia una línea de implementación que no funciona y no vale la pena continuar, crear una rama `wip/<descripción>-rejected` con el trabajo experimental antes de descartarla. Esto evita perder el contexto del intento fallido si se quiere revisar más tarde.

---

## Kill switch

Sin deploy productivo en el arranque. Kill switch lógico: variable de entorno `PROJECT_DISABLED=1` en `.env` local que cualquier entrypoint debe respetar antes de tocar datos reales. Confirmar antes de cualquier sesión FULL.

Si el kill switch está activo → no deployar, no modificar runtime, reportar al orquestador y cerrar sesión.

## Guardrails del perfil internal-suite

- No tocar producción sin autorización explícita en el prompt de la sesión.
- No commitear datos reales: trabajar con fixtures en `data/` (que está ignorado por defecto).
- No commitear credenciales bajo ninguna circunstancia. Vivir en `.env` local.
- No conectar contra DB real desde sesiones de implementación: usar export estático o mock.
- No instalar dependencias nuevas sin decisión registrada en DECISIONS.md.
