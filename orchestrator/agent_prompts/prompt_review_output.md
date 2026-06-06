# Revisión de output — Catenaccio Vintage

Plantilla para revisar desde el chat el output que devuelve el agente
implementador. La aplica el orquestador, no el agente.

---

**Proyecto:** Catenaccio Vintage
**Sesión:** [N]
**Fecha:** [TODAY]
**Tarea original:** [TAREA]

## Output recibido

[Pega aquí el output del agente: diff resumen, lista de archivos, comando de
validación, observaciones. Si es muy largo, pega solo los bloques que el
chat necesita para juzgar.]

## Veredicto del orquestador

Aplica uno y solo uno:

- `APPROVE` — el output cumple la validación esperada. Se cierra la sesión
  según `SESSION_CLOSE_PROMPT.md`.
- `FIX_BLOCKER_FIRST` — hay un bloqueo concreto que el agente debe resolver
  antes de cerrar. Devolver al agente con la corrección listada.
- `STOP` — el output no es aceptable y no se puede arreglar en esta sesión.
  Mover el ítem a BLOCKED en BACKLOG y cerrar la sesión sin commit.
- `DEFER_30D` — el resultado es aceptable pero la decisión final puede
  esperar. Mover a NEXT en BACKLOG.
- `KILL` — la línea de trabajo no debería continuar. Documentar la decisión
  en DECISIONS.md y cerrar.

## Si `FIX_BLOCKER_FIRST`

Devuelve al agente exactamente:

- Qué está mal (1-3 bullets).
- Qué se espera (1 bullet, accionable).
- Qué no debe tocar (si aplica).

No re-explicas el objetivo. No re-pegas archivos.

## Si `APPROVE`

Continúa con `SESSION_CLOSE_PROMPT.md`.

## Si `STOP` o `KILL`

- Añade entrada a BACKLOG (`BLOCKED` o nota de cierre) o a DECISIONS.md
  según corresponda.
- Aplica cierre LITE (la sesión no produjo cambios commit-eables).

---

**Lo que NO se hace al revisar:**

- No se re-implementa el código desde el chat.
- No se pide al agente que "haga lo que pueda" sin criterio claro.
- No se aprueba sin haber leído al menos el diff resumen.
