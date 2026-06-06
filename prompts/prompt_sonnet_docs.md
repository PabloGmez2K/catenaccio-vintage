# Prompt: Sonnet — Sesión de documentación / síntesis

**Uso:** Plantilla reutilizable para sesiones de documentación.  
**Reemplazar:** `[PLACEHOLDERS]` con los valores concretos de la tarea.  
**Cuándo usar:** Docs, cierres, síntesis, handoffs, contratos, auditorías read-only.  
**Agente:** Claude Sonnet  
**Modo:** LITE (en general) o NORMAL si hay múltiples archivos  
**Clasificación:** DOCS_ONLY

---

```
Soy el usuario / builder del proyecto. Proyecto: Catenaccio Vintage.

Objetivo de esta sesión:
[OBJETIVO_CONCRETO — qué documento generar, actualizar o sintetizar]

Tu rol: Synthesis. No implementás código. No tomás decisiones arquitectónicas.
Si durante la sesión encontrás algo que requiere decisión arquitectónica → pausar y reportar.

Archivos a leer:
- [ARCHIVO_1]
- [ARCHIVO_2]
(solo los archivos necesarios para la tarea — no leer el repo completo)

Tarea específica:
[DESCRIPCION_EXACTA_DE_LA_TAREA]

Guardrails:
- No tocar: [ARCHIVOS_O_COMPONENTES_INTOCABLES]
- No introducir decisiones de arquitectura
- No generar código
- Append-only en CONTEXTO.md e HISTORIAL_SESIONES.md (nunca replace_all)
- Si encontrás información contradictoria en docs → reportar, no resolver solo

Validación esperada:
[COMO_SE_SABE_QUE_LA_TAREA_ESTA_TERMINADA]

Criterio de parada:
[CUANDO_CERRAR_AUNQUE_NO_ESTE_TODO]

Formato de entrega:
[QUE_DEBE_DEVOLVER — archivo completo / diff / resumen / entrada de historial / etc.]

Al cerrar la sesión, actualizar:
[ ] CONTEXTO.md — una línea con patrón estándar (append)
[ ] HISTORIAL_SESIONES.md — entrada completa (append)
[ ] agent_events.jsonl — un evento mínimo
[ ] git commit: "docs: [descripción breve]"
```

---

## Casos de uso comunes

### Cierre de sesión anterior no cerrada
Reemplazar OBJETIVO con: "Cerrar la sesión N que quedó sin cerrar. Revisar qué cambió, actualizar CONTEXTO y HISTORIAL, commitear."

### Síntesis de backlog
Reemplazar OBJETIVO con: "Revisar HISTORIAL_SESIONES y DECISIONS de las últimas N sesiones. Actualizar BACKLOG con el estado real. No cambiar el estado de ítems en DONE."

### Generación de contrato de sesión
Reemplazar OBJETIVO con: "Preparar el prompt para la próxima sesión de implementación usando los 7 campos del ORCHESTRATOR.md §6."

### Auditoría de docs
Reemplazar OBJETIVO con: "Revisar consistencia entre PROJECT_BRIEF, CONTEXTO y BACKLOG. Reportar contradicciones sin resolverlas."
