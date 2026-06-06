# HISTORIAL_SESIONES — Catenaccio Vintage

Memoria permanente del proyecto. **Append-only. Nunca editar entradas pasadas. Nunca replace_all.**

Cross-referencia con `agent_events.jsonl` para detalle de eventos.

---

## Formato de entrada

```
---
**Sesión [N]** — [YYYY-MM-DD]  
**Agente:** [ChatGPT Orquestador / Opus / Sonnet / Codex]  
**Modo:** [LITE / NORMAL / FULL]  
**Tipo:** [docs / impl / fix / strategic / cierre]  
**Tarea:** [descripción breve de la tarea]

**Decisiones clave:**
- [Decisión 1]
- [Decisión 2]

**Qué se validó:** [cómo se sabe que funcionó]  
**Qué NO se tocó:** [explícito]  
**Siguiente paso:** [una acción concreta o DEFER_STOP]  
**agent_events ref:** [ID o timestamp del evento en .jsonl]
---
```

---

<!-- APPEND ENTRADAS AQUÍ — no modificar lo de arriba -->

---
**Sesión 0** — 2026-06-06  
**Agente:** lafabrica-template  
**Modo:** LITE  
**Tipo:** init  
**Tarea:** Creación del repo desde lafabrica-template + SEED

**Decisiones clave:**
- Stack seleccionado: Pendiente de discovery, Pendiente de discovery, Preferencia inicial Vercel, pendiente de validar
- Proyecto arrancado con lafabrica v0.2 (SEED → `lafabrica_new.py` → repo)

**Qué se validó:** Docs base generados con placeholders del SEED  
**Qué NO se tocó:** Código del proyecto, GitHub, deploy  
**Siguiente paso:** Sesión 1 con Opus — validación del SEED  
**agent_events ref:** —
---
