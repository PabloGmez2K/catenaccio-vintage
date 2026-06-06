# VALIDATION_RECORD — [NOMBRE_PROYECTO]

Registro append-only de todas las validaciones humanas realizadas durante el Discovery Intake. Cada entrada documenta qué se validó, por quién, cuándo y con qué resultado.

**Este registro no se edita hacia atrás.** Si una validación anterior se revisa, se añade una nueva entrada.

**Proyecto:** [NOMBRE_PROYECTO]  
**Última actualización:** [FECHA]

---

## Estados del workflow de discovery

| Estado | Descripción |
|--------|-------------|
| `DISCOVERY_ABIERTO` | El intake ha comenzado pero AS-IS no está validado |
| `AS_IS_VALIDADO` | La persona usuaria aprobó el AS-IS |
| `TARGET_APROBADO` | La persona usuaria aprobó una opción TARGET |
| `SEED_GENERADO` | El PROJECT_SEED fue generado |
| `SEED_APROBADO` | El SEED fue revisado y aprobado para implementación |
| `DISCOVERY_CERRADO` | `lafabrica new` ejecutado; el discovery está completo |

**Estado actual del workflow:** [DISCOVERY_ABIERTO]

---

## Registro de validaciones

### VAL-001 — [Título descriptivo de lo validado]

**Fecha:** [FECHA]  
**Fase del discovery:** [AS-IS / TARGET / SEED / OTRO]  
**Qué se validó:** [descripción concreta de lo que se revisó]  
**Documento validado:** [`AS_IS_UNDERSTANDING.md` / `TARGET_OPTIONS.md` / `PROJECT_SEED.md` / otro]  
**Fuente principal:** [SRC-XX o "información directa de la persona usuaria"]

**Resultado:** [APROBADO / APROBADO_CON_CAMBIOS / RECHAZADO]

**Cambios tras la validación:**  
[Si el resultado fue APROBADO_CON_CAMBIOS: qué se cambió en los documentos afectados.  
Si fue RECHAZADO: qué bloqueó la aprobación y qué debe resolverse.  
Si fue APROBADO sin cambios: "ningún cambio necesario".]

**Estado del workflow tras esta validación:** [nuevo estado]

---

## Checklist de cierre del discovery

El discovery puede cerrarse cuando todos los ítems siguientes están marcados:

- [ ] `LAFABRICA_INTAKE_MANIFEST.md`: todas las preguntas del discovery tienen respuesta documentada.
- [ ] `SOURCE_REGISTRY.md`: todas las fuentes relevantes tienen estado `PROCESADA` o `VALIDADA` (no quedan en `EN_LECTURA`).
- [ ] `CONFLICT_REGISTER.md`: no hay conflictos en estado `DETECTADO` o `EN_REVISIÓN` con impacto CRÍTICO o ALTO.
- [ ] `AS_IS_UNDERSTANDING.md`: estado `VALIDADO_POR_USUARIO`.
- [ ] `TARGET_OPTIONS.md`: estado `OPCIÓN_APROBADA`.
- [ ] `RECOMMENDED_IMPLEMENTATION_PLAN.md`: estado `APROBADO_PARA_IMPLEMENTACIÓN`.
- [ ] `PROJECT_SEED.md`: generado y aprobado.
- [ ] `VALIDATION_RECORD.md`: al menos una entrada VAL para AS-IS y una para TARGET.
- [ ] Estado del workflow: `SEED_APROBADO`.

**Fecha de cierre del discovery:** [pendiente / FECHA]  
**Comando ejecutado:** [`lafabrica new <slug>` / pendiente]
