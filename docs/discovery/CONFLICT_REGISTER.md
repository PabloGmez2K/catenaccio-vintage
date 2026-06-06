# CONFLICT_REGISTER — [NOMBRE_PROYECTO]

Registro de contradicciones detectadas entre fuentes durante el Discovery Intake. Los conflictos no resueltos bloquean el avance a la siguiente fase.

**Proyecto:** [NOMBRE_PROYECTO]  
**Última actualización:** [FECHA]

---

## Estados de conflicto

| Estado | Significado |
|--------|-------------|
| `DETECTADO` | Contradicción identificada, sin resolución todavía |
| `EN_REVISIÓN` | La persona usuaria está revisando el conflicto |
| `RESUELTO` | El conflicto tiene una resolución validada |
| `ACEPTADO_COMO_INCÓGNITA` | No se puede resolver con la información disponible; se documenta como incógnita del AS-IS |
| `DESCARTADO` | El conflicto no era real; ambas fuentes son compatibles en contexto |

## Niveles de impacto

| Nivel | Descripción |
|-------|-------------|
| `CRÍTICO` | Bloquea la generación del SEED; requiere resolución antes de avanzar |
| `ALTO` | Afecta decisiones de diseño TARGET; debe resolverse antes de aprobar TARGET |
| `MEDIO` | Afecta la comprensión del AS-IS pero no bloquea el diseño |
| `BAJO` | Detalle menor que no afecta las decisiones principales |

---

## Registro de conflictos

### CONF-[NNN] — [Título breve del conflicto]

**Estado:** [DETECTADO / EN_REVISIÓN / RESUELTO / ACEPTADO_COMO_INCÓGNITA / DESCARTADO]  
**Impacto:** [CRÍTICO / ALTO / MEDIO / BAJO]  
**Detectado:** [FECHA]  
**Resuelto:** [FECHA o "pendiente"]

**Dato conflictivo:**  
[Describe la contradicción de forma concreta. Ejemplo: "SRC-01 dice que el proceso tiene 3 pasos; SRC-03 describe 5 pasos para el mismo proceso."]

**Fuentes implicadas:**  
- [SRC-XX]: [qué dice]
- [SRC-YY]: [qué dice]

**Hipótesis de resolución:**  
[Posibles explicaciones de por qué existe la contradicción. Ej: diferente periodo temporal, diferente definición del proceso, error en una de las fuentes.]

**Resolución:**  
[Descripción de la resolución, una vez que la persona usuaria la haya validado. Si es ACEPTADO_COMO_INCÓGNITA, describir el rango de incertidumbre que queda.]

**Validado por:** [persona / agente]  
**Impacto sobre el AS-IS:** [qué cambia en AS_IS_UNDERSTANDING.md tras la resolución]

---

## Conflictos pendientes de resolución

Lista rápida de conflictos en estado DETECTADO o EN_REVISIÓN para facilitar el seguimiento:

| ID | Título | Impacto | Estado | Bloqueante para |
|----|--------|---------|--------|----------------|
| CONF-001 | [título] | [impacto] | [estado] | [AS-IS / TARGET / SEED / ninguno] |

---

## Notas

- Un conflicto CRÍTICO sin resolución **bloquea** la validación del AS-IS.
- Un conflicto ALTO sin resolución **bloquea** la aprobación del TARGET.
- Los conflictos ACEPTADOS_COMO_INCÓGNITA deben quedar reflejados como incógnitas en `AS_IS_UNDERSTANDING.md`.
- Registrar la **ausencia de conflictos** también es útil: si no se encontraron contradicciones entre fuentes, anotar esa observación.
