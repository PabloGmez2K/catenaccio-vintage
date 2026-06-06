# RECOMMENDED_IMPLEMENTATION_PLAN — [NOMBRE_PROYECTO]

Plan de implementación por fases derivado de la opción TARGET aprobada en `TARGET_OPTIONS.md`.

**Este documento no se genera hasta que `TARGET_OPTIONS.md` tiene estado `OPCIÓN_APROBADA`.**

**Proyecto:** [NOMBRE_PROYECTO]  
**Opción TARGET aprobada:** [OPCIÓN-N — nombre]  
**Fecha de aprobación del TARGET:** [FECHA]  
**Fecha del plan:** [FECHA]  
**Estado:** [BORRADOR / APROBADO_PARA_IMPLEMENTACIÓN]

---

## Principio rector

[Una sola frase que define la guía de todo el plan. Debe derivarse directamente del problema principal documentado en `TARGET_OPTIONS.md`.]

---

## Fase 0 — Discovery cerrado

**Objetivo:** Cerrar el proceso de discovery con todos los artefactos validados y el SEED generado.

**Criterio de entrada:** `AS_IS_UNDERSTANDING.md` en estado `VALIDADO_POR_USUARIO`.  
**Criterio de salida:** SEED revisado y aprobado por el orquestador. `lafabrica new` ejecutado.

**Tareas:**
- [ ] Resolver todos los conflictos CRÍTICOS y ALTOS en `CONFLICT_REGISTER.md`.
- [ ] Validar AS-IS con la persona usuaria.
- [ ] Aprobar opción TARGET.
- [ ] Generar `PROJECT_SEED.md` con `prompt_seed_generation.md`.
- [ ] Registrar las validaciones finales en `VALIDATION_RECORD.md`.
- [ ] Ejecutar `lafabrica new <slug>`.

**Tiempo estimado:** [X días]

---

## Fase 1 — Seed e infraestructura base

**Objetivo:** El repo del proyecto existe, tiene la estructura base de lafabrica y el equipo puede trabajar desde él.

**Criterio de entrada:** `lafabrica new` ejecutado correctamente.  
**Criterio de salida:** Primer commit limpio. Orquestador configurado. Primera sesión de trabajo posible.

**Tareas:**
- [ ] Verificar estructura generada por `lafabrica new`.
- [ ] Configurar Orchestrator Pack con los datos del proyecto.
- [ ] Abrir primera sesión de orquestador en ChatGPT Project.
- [ ] Verificar que el repo puede sincronizarse sin contexto adicional.

**Tiempo estimado:** [X días]

---

## Fase 2 — Base técnica

**Objetivo:** La infraestructura técnica mínima necesaria para implementar el MVP está lista.

**Criterio de entrada:** Fase 1 completa.  
**Criterio de salida:** El entorno de desarrollo funciona, las dependencias principales están instaladas, el primer test de humo pasa.

**Tareas:**
- [ ] [Tarea técnica 1]
- [ ] [Tarea técnica 2]
- [ ] [Tarea técnica 3]

**Dependencias de esta fase:** [qué necesita antes de poder empezar]  
**Tiempo estimado:** [X días]

---

## Fase 3 — Implementación del MVP

**Objetivo:** Las funcionalidades del MVP están implementadas y funcionando en entorno de desarrollo.

**Criterio de entrada:** Fase 2 completa. SEED aprobado.  
**Criterio de salida:** Las funcionalidades del MVP pasan sus criterios de éxito verificables.

**Tareas:**
- [ ] [Feature/tarea 1] — criterio: [cómo se verifica]
- [ ] [Feature/tarea 2] — criterio: [cómo se verifica]
- [ ] [Feature/tarea 3] — criterio: [cómo se verifica]

**Dependencias de esta fase:** [qué necesita]  
**Tiempo estimado:** [X días / semanas]

---

## Fase 4 — Validación

**Objetivo:** Las funcionalidades del MVP son validadas por la persona usuaria en condiciones reales o similares.

**Criterio de entrada:** Fase 3 completa.  
**Criterio de salida:** La persona usuaria ha verificado los criterios de éxito del SEED.

**Tareas:**
- [ ] [Validación 1]: [qué se valida, quién lo valida, criterio de éxito]
- [ ] [Validación 2]: [qué se valida, quién lo valida, criterio de éxito]

**Tiempo estimado:** [X días]

---

## Fase 5 — Pilotaje y publicación

**Objetivo:** El proyecto está en uso real o disponible para sus usuarios objetivo.

**Criterio de entrada:** Fase 4 completa con todas las validaciones aprobadas.  
**Criterio de salida:** [definición concreta de "en producción" para este proyecto]

**Tareas:**
- [ ] [Tarea de deploy / publicación]
- [ ] [Comunicación a usuarios]
- [ ] [Monitoreo inicial]

**Tiempo estimado:** [X días]

---

## Criterio de parada

[Condiciones bajo las cuales se pausa o abandona la implementación antes de completarla.]

| Condición | Acción |
|-----------|--------|
| [Condición 1] | Pausar. Escalar a revisión estratégica con Opus antes de continuar. |
| [Condición 2] | Abandonar esta iteración. Abrir nuevo discovery si el problema cambia. |
| [Presupuesto/tiempo excedido en más de X% sin avance verificable] | Revisión obligatoria con la persona usuaria. |

---

## Rollback

[Si aplica: cómo se deshace la implementación si la Fase 5 produce resultados inaceptables.]

- **Reversible hasta:** [qué fase es el punto de no retorno]
- **Cómo revertir:** [pasos o descripciones de qué implicaría un rollback]
- **Tiempo estimado de rollback:** [si aplica]

---

## Notas y dependencias externas

[Cualquier dependencia que esté fuera del control del equipo del proyecto: accesos de terceros, aprobaciones, infraestructura compartida, etc.]

| Dependencia | Estado | Responsable |
|-------------|--------|-------------|
| [dep 1] | [pendiente / resuelta] | [quién la resuelve] |
