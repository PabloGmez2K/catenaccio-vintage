# TOKEN_ECONOMICS.md — Catenaccio Vintage

Gate pre-agente adaptado al proyecto. Clasifica qué merece sesión y qué no.

**Quién mantiene:** Usuario / builder + Orquestador.  
**Cuándo actualizar:** Cuando aparecen patrones nuevos de gasto inútil.

---

## Gate pre-agente (tres preguntas — responder antes de abrir cualquier agente)

1. **¿Si esta sesión acaba en NO_ACTION / WAIT / LOG_ONLY, vale la pena haberla abierto?**
2. **¿Hay evidencia suficiente para que el resultado sea accionable?**
3. **¿Cambia una decisión operativa en las próximas 24h–30 días?**

Si alguna es "no" → no abrir agente. Clasificar como `DEFER_STOP` o `CHAT_CLOSE`.

---

## Clasificaciones del proyecto

| Clasificación | Cuándo usar en Catenaccio Vintage |
|--------------|-------------------------------|
| `AGENT_REQUIRED` | _(completar)_ |
| `DOCS_ONLY` | _(completar)_ |
| `CHAT_CLOSE` | _(completar)_ |
| `DEFER_STOP` | _(completar)_ |
| `STRATEGIC_REQUIRED` | _(completar)_ |

---

## Ejemplos genéricos por clasificación

**`AGENT_REQUIRED`** (abrir Codex o Sonnet):
- Implementar funcionalidad del BACKLOG.NOW con criterio de parada claro
- Fix de bug documentado con evidencia reproducible
- Tests para funcionalidad ya implementada
- Deploy con deploy plan aprobado

**`DOCS_ONLY`** (abrir Sonnet, no Codex ni Opus):
- Generar SEED desde chat de ChatGPT
- Escribir o actualizar CONTEXTO.md, HISTORIAL, BACKLOG
- Síntesis de sesiones anteriores
- Cierre LITE

**`CHAT_CLOSE`** (no abrir agente — responder en el chat):
- Preguntas sobre qué hace una función que ya está en el repo
- Dudas de sintaxis con respuesta obvia
- Backlog genérico sin decisión de arquitectura

**`DEFER_STOP`** (no hacer ahora):
- Features del LATER sin trigger accionable en ≤30 días
- Optimizaciones prematuras antes de validar el MVP
- Integraciones que dependen de validar primero lo básico

**`STRATEGIC_REQUIRED`** (abrir Opus):
- Cambio de arquitectura core con riesgo real
- Decisión irreversible (migración de DB, cambio de plataforma, reestructura de repo)
- Veredicto sobre hipótesis crítica del proyecto

---

## Budget lock pattern

3 sesiones del mismo agente en un día → STOP automático.

**Regla genérica:** 3 sesiones con el mismo agente (especialmente Opus) en el mismo día → STOP automático. Revisar si el problema real está mal definido.

**Señal de alerta:** Si una sesión planificada como LITE termina siendo FULL → el gate pre-agente falló. Documentar por qué y ajustar clasificaciones.

---

## Reglas "no abrir agente para..." en este proyecto

_(completar al primer cierre)_

**Reglas genéricas:**
- No Opus para revisar backlog genérico → `CHAT_CLOSE`
- No Codex para discutir diseño → escalar a Opus primero
- No abrir agente si la sesión anterior no cerró limpia → cerrar primero
- No tooling nuevo sin criterio de output accionable (decisión / alerta / gate / métrica / acción en ≤30d)

---

## Intervenciones manuales en interfaces externas

Para proyectos que requieran intervención en herramientas SaaS vivas o paneles configurados manualmente (Company Brain, integraciones híbridas):
- **Cero paquetes gigantes:** Evitar propuestas de cambios masivos que el usuario deba aplicar manualmente de golpe.
- **Granularidad:** Preferir instrucciones campo a campo o por bloques pequeños.
- **Microcorrecciones:** Usar prompts compactos de continuación en la misma sesión para ajustes menores. No abrir sesiones nuevas por detalles mínimos del mismo bloque.

---

## Historial de patrones de gasto inútil

| Fecha | Patrón identificado | Acción correctiva |
|-------|--------------------|--------------------|
| 2026-06-06 |  |  |
