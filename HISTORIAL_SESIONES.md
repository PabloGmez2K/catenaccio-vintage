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

---
**Sesión 1** — 2026-06-06  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / strategic  
**Tarea:** Registrar nuevo driver estratégico — cancelación de suscripción Elementor Pro

**Decisiones clave:**
- No se decide arquitectura ni migración en esta sesión.
- La cancelación de Elementor Pro se registra como factor estratégico a evaluar en AS-IS y TARGET.
- TARGET_OPTIONS queda pendiente hasta revisar AS-IS con este nuevo dato incorporado.

**Qué se validó:** Actualización de docs (CONTEXTO, BACKLOG, AS_IS_UNDERSTANDING, LAFABRICA_INTAKE_MANIFEST, TARGET_OPTIONS, DECISIONS, HISTORIAL_SESIONES) sin tocar código, WordPress, producción ni credenciales.  
**Qué NO se tocó:** Código, WordPress, credenciales, dominio, hosting, Vercel, SEC-001, SEC-002, implementación técnica.  
**Siguiente paso:** Sesión de revisión AS-IS con impacto de Elementor Pro incluido. Luego preparar TARGET_OPTIONS.  
**agent_events ref:** —
---

---
**Sesión 002** — 2026-06-06  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / security-sync  
**Tarea:** Sincronizar en el repo la resolución manual confirmada por el operador de SEC-001 y SEC-002; actualizar AS-IS con datos confirmados del stack y validaciones de hipótesis; preparar siguiente tarea de acceso seguro al servidor.

**Decisiones clave:**
- SEC-001 y SEC-002 marcados RESUELTOS por confirmación manual del operador. El agente no verificó técnicamente — la responsabilidad de la rotación es del operador.
- El bloqueante de seguridad que impedía avanzar a TARGET_OPTIONS queda eliminado.
- Bloque 3 (incógnitas del AS-IS) validado: no bloquea el AS-IS, pero justifica una sesión SERVER_CONTEXT_CHECK_READONLY antes de TARGET_OPTIONS.
- Hipótesis workflow/AI-first marcada como VALIDADA por operador.
- Nueva tarea añadida al BACKLOG: SERVER_ACCESS_SAFE_SETUP / SERVER_CONTEXT_CHECK_READONLY.

**Qué se validó:** SECURITY_REVIEW.md actualizado con estado RESUELTO en SEC-001 y SEC-002. VALIDATION_RECORD.md con VAL-003. AS_IS_UNDERSTANDING.md con versiones confirmadas (WP 7.0, WooCommerce 10.8.1), hosting (com1014, cPanel 134.0, Apache 2.4.67, MariaDB 11.4.10-cll-lve, IP 178.211.133.29), Elementor Pro expiry, LiteSpeed problema, hipótesis workflow validada, Bloque 3 validado. BACKLOG.md sin bloqueante SEC, con nueva tarea. CONTEXTO.md e HISTORIAL_SESIONES.md actualizados. agent_events.jsonl con evento de sesión.  
**Qué NO se tocó:** Código, WordPress, wp-config.php, hosting, Google Cloud, OAuth, credenciales, dominio, DNS, Vercel, producción. No se solicitó ni copió ningún secreto. DECISIONS.md no modificado.  
**Siguiente paso:** SESSION SERVER_CONTEXT_CHECK_READONLY — diseñar acceso seguro read-only al servidor para verificar estado real del sitio antes de preparar TARGET_OPTIONS.  
**agent_events ref:** 2026-06-06T12:00:00Z (security_resolved)
---

---
**Sesión 003** — 2026-06-10  
**Agente:** Claude Code (Sonnet)  
**Modo:** API_FAST_DISCOVERY  
**Tipo:** docs / server-context-check  
**Tarea:** Completar SERVER_CONTEXT_CHECK_READONLY vía evidencias del operador (WP Admin Site Health + WooCommerce System Status) sin SSH. Raiola Networks Inicio SSD 2.0 confirmado sin acceso SSH — se acepta como decisión operativa permanente.

**Decisiones clave:**
- SSH no es requisito para discovery en Catenaccio: Raiola no lo ofrece en este plan. Se usa vía WP Admin como método estándar.
- Elementor Pro (v3.35.1) expira ~2026-07-01. Operador confirma que NO renovará. Pasa a ser el driver y deadline central de TARGET_OPTIONS.
- Servidor HTTP real confirmado como LiteSpeed (no Apache 2.4.67 como estaba en el AS-IS). Corrección documentada.
- OPcache completamente lleno (16 bytes libres, cache_full=true) — riesgo activo de rendimiento en producción. Registrado como PROB-09.
- WP_MEMORY_LIMIT = 40M en front-end (no 512M) — registrado como PROB-10.
- WooCommerce usa HPOS (OrdersTableDataStore), sync desactivado.
- WooPayments en modo LIVE con APMs activos: card, bancontact, ideal, multibanco, Apple Pay, Google Pay.
- WPS Hide Login instalado pero inactivo — /wp-admin expuesto. Registrado como PROB-12.
- Mini-cart template de Elementor Pro desactualizado (sin version header, requiere 10.0.0). PROB-11.
- ACF confirmado FREE (no Pro), 16 post types, 20 taxonomías.
- 28 productos confirmados. Sin publicaciones nuevas desde 15/03/2026.

**Qué se validó:** AS_IS_UNDERSTANDING.md actualizado con corrección httpd→LiteSpeed, Elementor Pro expiración con fecha y decisión definitiva, OPcache riesgo, WP_MEMORY_LIMIT, HPOS activo, shop URL /camisetas/, WooPayments live, WPS Hide Login inactivo, ACF FREE, ghost DB tables de 8+ plugins removidos, 7 nuevos PROBs (09-15), hipótesis de productos validada. BACKLOG.md actualizado con urgencia TARGET_OPTIONS y SERVER_CONTEXT_CHECK en DONE. CONTEXTO.md con Sesión 003.  
**Qué NO se tocó:** Código, WordPress, wp-config.php, cPanel, hosting, base de datos, credenciales, dominio, DNS, OAuth, producción. No se solicitaron ni copiaron secretos. No se preparó TARGET_OPTIONS.  
**Siguiente paso:** Operador valida AS_IS_UNDERSTANDING.md → cambia estado a VALIDADO_POR_USUARIO → preparar TARGET_OPTIONS con deadline ~2026-07-01.  
**agent_events ref:** 2026-06-10T10:30:00Z (server_context_check_complete)
---
