# CLAUDE.md — Catenaccio Vintage

Adaptador mínimo para que Claude Code descubra este repo. No duplica metodología aquí.

Orden de lectura obligatorio:

```
PROJECT_BOOTSTRAP.md -> AGENTS.md -> routing activado -> documentos de la tarea concreta
```

`ORCHESTRATOR.md` y `AGENTS.md` son los contratos vigentes de este proyecto — no reinterpretar
ni repetir su contenido en este archivo.

Reglas:

- Evidencia del repo y del remoto verificado gana siempre a memoria (de sesión, de engram o de
  cualquier otra fuente asistiva).
- Respetar `OUTCOME` / `DONE_BAR` / `STOP_LOSS` / `AUTONOMY` (A0-A3) declarados en el prompt de
  cada tarea — ver `ORCHESTRATOR.md` §28-30.
- No modificar WordPress/WooCommerce en producción, hacer push ni escribir en sistemas externos
  (Woo/Vercel/Supabase) sin autorización explícita nombrando la superficie.

Ver `docs/meta/LAFABRICA_ADOPTION.md` para el estado de adopción metodológica actual.
