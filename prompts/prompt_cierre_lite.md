# Prompt: Cierre LITE

**Uso:** Para cerrar sesiones de tipo docs-only, backlog, síntesis o cuando la sesión anterior no cerró limpia.  
**Cuándo usar:** La tarea ya está hecha; solo falta documentar y commitear.  
**Agente:** Sonnet (o el agente que ejecutó la sesión)  
**Modo:** LITE  
**Clasificación:** DOCS_ONLY

---

```
Soy el usuario / builder del proyecto. Proyecto: Catenaccio Vintage.

Objetivo de esta sesión:
Cierre LITE de la sesión [N] — [título de la tarea].

La tarea principal ya está completada. Esta sesión es solo para cerrar limpio.

Qué se hizo en la sesión:
[RESUMEN_DE_LO_QUE_SE_HIZO]

Qué se validó:
[COMO_SE_SABE_QUE_FUNCIONO — o "sin validación en esta sesión"]

Qué NO se tocó:
[EXPLICITO — no "nada fuera del scope"]

Archivos modificados en la sesión:
- [ARCHIVO_1]
- [ARCHIVO_2]

Tarea de esta sesión (cierre):

1. Hacer git status y reportar qué cambió
2. Actualizar CONTEXTO.md — append de una línea con este patrón exacto:
   "Sesión [N] (2026-06-06, lafabrica_new.py): LITE / [tipo]. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó]."
3. Agregar entrada completa en HISTORIAL_SESIONES.md (append-only)
4. Actualizar BACKLOG.md — mover ítem [ITEM] de NOW a DONE
5. Registrar en agent_events.jsonl:
   {"timestamp": "[ISO8601]", "session": [N], "agent": "lafabrica_new.py", "type": "[tipo]",
    "stage": "close", "title": "[título]", "description": "[descripción]",
    "points": [0-3], "impact": "[none/low/medium/high]", "validated": [true/false]}
6. git add [solo los archivos específicos]
7. git commit -m "docs: cierre s[N] Catenaccio Vintage — [descripción breve]"
8. Reportar: SESIÓN / RESULTADO / QUÉ SE HIZO / SIGUIENTE PASO

Guardrails:
- No tocar código del proyecto
- No abrir nuevas tareas
- Si encontrás algo roto → anotarlo en BACKLOG, no resolverlo ahora
- Append-only en CONTEXTO.md e HISTORIAL_SESIONES.md

Criterio de parada:
CONTEXTO.md actualizado + HISTORIAL actualizado + commit hecho + reporte enviado.
```

---

## Versión ultra-rápida (si solo hay que commitear)

```
git status
git add [archivos específicos]
git commit -m "docs: [descripción]"
```

Agregar entrada mínima en HISTORIAL_SESIONES.md y CONTEXTO.md antes del commit.

---

## Cuándo usar LITE vs NORMAL vs FULL

| Si la sesión... | Usar |
|-----------------|------|
| Solo tocó docs, backlog, prompts | LITE |
| Tocó código pero sin deploy | NORMAL |
| Tocó runtime, DB, config, o deployó | FULL |
| No está seguro | Elegir el modo más seguro (arriba) |
