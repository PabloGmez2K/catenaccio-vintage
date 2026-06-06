# OPERATIONS_PLAYBOOK.md — Catenaccio Vintage

Protocolo de trabajo. Cómo abrir una sesión, cómo cerrarla, qué hacer si la anterior no cerró limpia.

**Quién define:** Usuario / builder del proyecto.  
**Cuándo actualizar:** Cuando se identifica un error de proceso recurrente.

---

## Regla fundamental

**1 sesión = 1 tarea.**

Una sesión no puede tener dos objetivos. Si durante la sesión aparece una segunda tarea → anotarla en BACKLOG.md y cerrar la sesión actual primero.

---

## Checklist de apertura de sesión

```
[ ] 1. Verificar que la sesión anterior cerró limpia:
        → HISTORIAL_SESIONES.md tiene entrada de la última sesión
        → CONTEXTO.md actualizado (no es de hace 3 sesiones)
        → BACKLOG.md: ítems completados marcados o movidos
        → agent_events.jsonl: evento registrado de la última tarea
        → git status: sin cambios sin commitear inesperados

[ ] 2. Si la sesión anterior NO cerró limpia:
        → Cerrar primero. No abrir nueva sesión hasta cerrar la anterior.
        → Si no es posible cerrar: documentar en HISTORIAL como sesión interrumpida.

[ ] 3. Leer en orden (solo lo necesario):
        → CONTEXTO.md: fase actual y experimento activo (primeras 50 líneas)
        → BACKLOG.md: ítem en NOW que se va a trabajar
        → HISTORIAL_SESIONES.md: últimas 2-3 entradas

[ ] 4. Aplicar Token Economics Gate (TOKEN_ECONOMICS.md §Gate):
        → ¿AGENT_REQUIRED, DOCS_ONLY, CHAT_CLOSE, DEFER_STOP, o STRATEGIC_REQUIRED?
        → Si no es AGENT_REQUIRED ni DOCS_ONLY → no abrir agente.

[ ] 5. Preparar prompt con los 7 campos (ORCHESTRATOR.md §6):
        → Objetivo, Contexto mínimo, Archivos relevantes, Guardrails,
          Validación esperada, Criterio de parada, Formato de entrega
```

---

## Cierre LITE

Para sesiones de tipo: docs, backlog, síntesis, veredictos ya decididos.

```
[ ] git status — ver qué cambió
[ ] Actualizar CONTEXTO.md (append — una línea con el patrón estándar)
[ ] Actualizar HISTORIAL_SESIONES.md (append — entrada completa)
[ ] Mover ítems en BACKLOG.md si corresponde
[ ] Registrar en agent_events.jsonl (un evento mínimo)
[ ] git add [archivos específicos]
[ ] git commit -m "docs: [qué se hizo en una línea]"
[ ] Reportar al orquestador: resultado + siguiente paso
```

---

## Cierre NORMAL

Para sesiones de tipo: patches, tools, tests, observabilidad.

```
[ ] Tests focales: ejecutar solo los tests del componente tocado
[ ] Lint / type check si aplica al stack
[ ] git diff: revisar todos los cambios antes de commitear
[ ] Actualizar CONTEXTO.md (append)
[ ] Actualizar HISTORIAL_SESIONES.md (append)
[ ] Actualizar BACKLOG.md
[ ] Registrar en agent_events.jsonl (evento detallado con validated: true/false)
[ ] git add [archivos específicos — no git add -A ciego]
[ ] git commit -m "[tipo]: [qué se hizo]"
[ ] Si hay deploy: verificar hasta SUCCESS o FAILED documentado
[ ] Reportar al orquestador: resultado + siguiente paso + qué no se tocó
```

---

## Cierre FULL

Para sesiones de tipo: runtime, config env, DB, core, riesgo alto.

```
[ ] Autorización previa del usuario / builder antes de ejecutar
[ ] Precheck: backup si aplica, kill switch verificado
[ ] Ejecutar cambio con confirmación explícita paso a paso
[ ] Tests de integración / smoke test
[ ] Deploy observado hasta SUCCESS o FAILED explícito
[ ] Si FAILED: rollback documentado en HISTORIAL
[ ] Actualizar CONTEXTO.md + HISTORIAL + BACKLOG + agent_events.jsonl
[ ] git commit con mensaje descriptivo de cambio y resultado
[ ] Notificar al usuario / builder: resultado explícito (SUCCESS / FAILED / PARTIAL)
```

---

## Qué hacer si una sesión se interrumpe

1. No dejar cambios a medias en archivos críticos (runtime, DB, config)
2. git stash o commit WIP con mensaje claro: `wip: [descripción]`
3. Agregar entrada en HISTORIAL_SESIONES.md: `Sesión N — INTERRUMPIDA. [Qué quedó pendiente].`
4. Anotar en BACKLOG.md el ítem como BLOCKED con razón: "sesión N interrumpida"
5. La próxima sesión empieza cerrando esta

---

## Señales de que el proceso está roto

| Señal | Acción |
|-------|--------|
| CONTEXTO.md desactualizado por 3+ sesiones | Sesión de cierre antes de nueva tarea |
| Backlog solo en el chat, no en BACKLOG.md | Migrar backlog del chat al archivo |
| Más de 3 sesiones Opus en un día | Budget lock — STOP |
| Agente necesita más contexto del que está en el prompt | Prompt mal construido — reformular |
| Sesión planeada como LITE acabó siendo FULL | Gate pre-agente falló — revisar clasificaciones |
| Commits genéricos ("fix", "update", "changes") | Corregir el próximo commit; no retroactivo |

---

## Modo ChatGPT Orquestador vs modo directo

**Modo ChatGPT Orquestador** (flujo normal):
- ChatGPT recibe la tarea, aplica el gate, prepara el prompt con los 7 campos, revisa el output
- Usar cuando: cualquier tarea que no sea trivialmente evidente
- Ventaja: clasificación correcta, prompts bien construidos

**Modo directo Claude/Codex** (flujo rápido):
- Abrir Claude/Codex directamente con el prompt ya preparado
- Usar cuando: el orquestador ya clasificó y preparó el prompt en una sesión anterior
- Ventaja: menos overhead
- Riesgo: sin gate pre-agente → puede gastar tokens en CHAT_CLOSE tasks
