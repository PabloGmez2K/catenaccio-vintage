# Prompt: Codex / Claude Code — Sesión de implementación

**Uso:** Plantilla reutilizable para sesiones de implementación.  
**Reemplazar:** `[PLACEHOLDERS]` con los valores concretos de la tarea.  
**Cuándo usar:** Código real, tests, scripts, fix de bugs documentados, deploy.  
**Agente:** Codex / Claude Code  
**Modo:** NORMAL (mínimo) o FULL (si toca runtime/DB/config crítico)  
**Clasificación:** AGENT_REQUIRED  
**Prerrequisito:** Veredicto APPROVE_FOR_IMPLEMENTATION de Opus (Sesión 1)

---

```
Soy el usuario / builder del proyecto. Proyecto: Catenaccio Vintage.
Stack: Pendiente de discovery, Pendiente de discovery, Preferencia inicial Vercel, pendiente de validar

Objetivo de esta sesión:
[OBJETIVO_CONCRETO — qué implementar, fix, o test]

Este es el ítem del backlog asignado:
[BACKLOG_ITEM_EXACTO con criterio de parada]

Archivos relevantes (leer solo estos):
- [ARCHIVO_PRINCIPAL]
- [ARCHIVO_TEST_SI_APLICA]
- AGENTS.md — para guardrails y reglas de cierre

Contexto mínimo (solo lo que no se puede inferir del repo):
[CONTEXTO_NO_INFERABLE]

Guardrails:
- NO tocar: [ARCHIVOS_O_COMPONENTES_INTOCABLES]
- NO introducir dependencias nuevas sin decisión en DECISIONS.md
- NO hacer refactor mientras resolvés el ítem (scope creep)
- NO deployar sin completar el cierre NORMAL/FULL
- _(completar al primer cierre)_

Default features nuevas: OFF hasta decisión explícita.
Kill switch: Sin deploy productivo en el arranque. Kill switch lógico: variable de entorno `PROJECT_DISABLED=1` en `.env` local que cualquier entrypoint debe respetar antes de tocar datos reales. Confirmar antes de cualquier sesión FULL.

Validación esperada:
[COMO_SE_SABE_QUE_LA_TAREA_ESTA_TERMINADA]
[TEST_ESPECIFICO / OUTPUT_VERIFICABLE / METRICA_OBSERVABLE]

Criterio de parada:
[CUANDO_CERRAR_AUNQUE_NO_ESTE_TODO]
Si encontrás un problema más grande de lo esperado → reportar y cerrar. No expandir scope.

Formato de entrega:
[QUE_DEBE_DEVOLVER — diff / resumen / output de tests / reporte al orquestador]

Al cerrar la sesión (modo [NORMAL / FULL]):
[ ] Tests focales ejecutados: [COMANDO_EXACTO]
[ ] git diff revisado antes de commitear
[ ] CONTEXTO.md actualizado (append — una línea)
[ ] HISTORIAL_SESIONES.md actualizado (append — entrada completa)
[ ] BACKLOG.md actualizado — ítem movido
[ ] agent_events.jsonl — evento registrado con validated: true/false
[ ] git commit: "[tipo]: [descripción breve del cambio y por qué]"
[ ] Reporte al orquestador: SESIÓN / MODO / RESULTADO / QUÉ SE HIZO / QUÉ NO SE TOCÓ / SIGUIENTE PASO
```

---

## Qué hacer si el scope crece durante la sesión

1. **Parar.** No expandir.
2. Anotar el problema nuevo en BACKLOG.md como NOW o NEXT según urgencia.
3. Cerrar la sesión actual con lo que estaba planeado.
4. Abrir nueva sesión para el problema nuevo.

## Qué hacer si el bug es más profundo de lo esperado

1. Reportar al orquestador: descripción exacta del problema real encontrado.
2. Si requiere decisión arquitectónica → escalar a Opus antes de continuar.
3. No parchear sin entender la causa raíz.

## Plantilla de reporte de cierre al orquestador

```
SESIÓN: [N] — [título de la tarea]
MODO: NORMAL / FULL
RESULTADO: COMPLETED / PARTIAL / BLOCKED
QUÉ SE HIZO: [una línea]
QUÉ SE VALIDÓ: [una línea]
QUÉ NO SE TOCÓ: [explícito]
SIGUIENTE PASO: [una acción concreta]
```
