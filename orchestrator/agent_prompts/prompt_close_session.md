# Cierre desde el agente — Catenaccio Vintage

Plantilla para que el agente implementador cierre limpia su propia sesión,
sin pasar primero por el chat. Solo se usa cuando el orquestador no está
disponible y el agente debe dejar el repo y el chat listos para la siguiente
sesión.

---

**Proyecto:** Catenaccio Vintage
**Repo local:** C:\Projects\catenaccio-vintage
**Superficie:** claude-code
**Sesión:** [N]
**Fecha:** [TODAY]

## Modo de cierre

Elige uno según el peso del trabajo:

- **LITE** — sin cambios commit-eables. Solo CONTEXTO + HISTORIAL +
  agent_events.jsonl.
- **NORMAL** — hay cambios commit-eables. LITE + BACKLOG + commit local.
- **FULL** — hay cambios commit-eables más una decisión de arquitectura.
  NORMAL + entrada en DECISIONS.md.

Si dudas entre dos, elige el menor.

## 1. Append a CONTEXTO.md

Una sola línea:

```
- [FECHA] · Sesión [N] · [CLASIFICACION] · [RESULTADO_CORTO]
```

## 2. Append a HISTORIAL_SESIONES.md

```
## Sesión [N] — [FECHA]

**Clasificación:** [CLASIFICACION]
**Superficie:** claude-code
**Modo de cierre:** [LITE / NORMAL / FULL]
**Tarea:** [Descripción corta]

**Resultado:**
[1-5 líneas: qué hiciste, qué no, por qué.]

**Siguiente paso recomendado:**
[Una acción concreta o "NA".]
```

## 3. Append a agent_events.jsonl

```json
{"ts":"[ISO8601]","session":[N],"classification":"[X]","surface":"claude-code","mode":"[LITE/NORMAL/FULL]","result":"[corto]"}
```

## 4. BACKLOG.md

- Ítems completados → DONE con fecha y número de sesión.
- Ítems descubiertos → NOW / NEXT / LATER según prioridad.
- Bloqueos descubiertos → BLOCKED con razón.

## 5. Commit local (NORMAL / FULL)

```
git add .
git commit -m "<tipo>: <descripcion corta>"
```

Sin push remoto. Sin `--no-verify`. Sin `--amend` de commits previos.

## 6. DECISIONS.md (solo FULL)

Si la sesión generó una decisión de arquitectura o veredicto, añade una
entrada con el formato del repo. Si no hay decisión, **no** abras este
archivo.

## 7. Reporte final

Una línea, al final de la sesión:

```
[RESULTADO] en [N] minutos. Siguiente paso: [accion].
```

## Checklist

- [ ] CONTEXTO.md tiene una línea nueva.
- [ ] HISTORIAL_SESIONES.md tiene la entrada de la sesión.
- [ ] agent_events.jsonl tiene la línea JSON.
- [ ] BACKLOG.md refleja el estado real.
- [ ] Commit local hecho (NORMAL/FULL).
- [ ] DECISIONS.md tocado solo si FULL con decisión real.
- [ ] Línea de reporte enviada.

Si algún check no se cumple, no cierres todavía.
