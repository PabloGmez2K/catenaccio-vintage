# Cierre de sesión — Catenaccio Vintage

Aplicable al final de cada sesión, independientemente del modo (LITE / NORMAL
/ FULL). El cierre nunca consume más tokens que el trabajo: si la sesión fue
trivial, el cierre también lo es.

---

## 1. Decide el modo de cierre

| Modo | Cuándo | Qué se actualiza |
|---|---|---|
| LITE | Tarea pequeña, sin cambios de arquitectura, sin nuevas decisiones | CONTEXTO.md (una línea), HISTORIAL_SESIONES.md (entrada corta), agent_events.jsonl |
| NORMAL | Tarea media: cambios de código, sesión de docs, sesión de implementación | LITE + BACKLOG.md (mover ítems), commit local |
| FULL | Cambio de arquitectura, decisión irreversible, sesión estratégica | NORMAL + DECISIONS.md (nueva entrada con veredicto Opus si aplica) |

Regla: si tienes dudas entre dos modos, elige el menor. El sobre-cierre se
nota más que el infra-cierre.

---

## 2. Append a CONTEXTO.md

Una sola línea con el patrón:

```
- [FECHA] · Sesión [N] · [CLASIFICACION] · [RESULTADO_CORTO]
```

Ejemplos:
- `- 2026-05-20 · Sesión 12 · CHAT_CLOSE · Aclarada duda sobre el flujo de cierre.`
- `- 2026-05-20 · Sesión 13 · AGENT_REQUIRED · Refactor de utils/formatter, tests pasan.`

Nunca borres ni edites líneas previas. Solo append.

---

## 3. Append a HISTORIAL_SESIONES.md

Entrada con los campos:

```
## Sesión [N] — [FECHA]

**Clasificación:** [AGENT_REQUIRED / CHAT_CLOSE / DEFER_STOP / STRATEGIC_REQUIRED / DOCS_ONLY]
**Superficie:** [chat / opus / sonnet / claude-code / codex / antigravity]
**Modo de cierre:** [LITE / NORMAL / FULL]
**Tarea:** [Descripción corta]

**Resultado:**
[Qué se hizo o por qué no se hizo. 1-5 líneas.]

**Siguiente paso recomendado:**
[Una sola acción concreta o "NA".]
```

Append-only. Si necesitas corregir algo del pasado, abre una nueva entrada y
referencia la previa por número de sesión.

---

## 4. Append a agent_events.jsonl

Una línea JSON por tarea. Esquema mínimo:

```json
{"ts":"[ISO8601]","session":[N],"classification":"[X]","surface":"[Y]","mode":"[Z]","result":"[corto]"}
```

Si una sesión genera varias tareas, registra una línea por tarea.

---

## 5. BACKLOG.md — mover ítems

- Ítems completados pasan de `NOW` a `DONE` con fecha y número de sesión.
- Ítems descubiertos durante la sesión que no se ejecutaron entran a `NOW`,
  `NEXT` o `LATER` según urgencia.
- Si se descubrió un bloqueo, mover el ítem a `BLOCKED` con la razón.

---

## 6. Commit local (modos NORMAL y FULL)

```
git add .
git commit -m "<tipo>: <descripcion corta>"
```

Convención Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`,
`chore:`, `test:`. Nada de force pushes. Sin `--no-verify`. Sin push remoto
si el operador no lo pide.

---

## 7. Reporte a la persona usuaria

Una sola línea o un párrafo corto:

```
[RESULTADO] en [N] minutos / [N] tokens. Siguiente paso: [accion].
```

No resumas lo que ya está en el repo. Solo el delta y el siguiente paso.

---

## Checklist final

- [ ] CONTEXTO.md actualizado con una línea.
- [ ] HISTORIAL_SESIONES.md con entrada de la sesión.
- [ ] agent_events.jsonl con la línea JSON.
- [ ] BACKLOG.md con ítems movidos.
- [ ] Commit local (modos NORMAL/FULL).
- [ ] Línea de reporte enviada.

Si los seis dan sí → la sesión está cerrada. Si no, no cierres.
