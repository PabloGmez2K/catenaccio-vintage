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

---
**Sesión 004** — 2026-06-10  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** docs / as-is-validation  
**Tarea:** Cerrar la validación del AS-IS de Catenaccio Vintage: cambiar estado de AS_IS_UNDERSTANDING.md a VALIDADO_POR_USUARIO y registrar la validación formal.

**Decisiones clave:**
- El operador valida explícitamente el AS-IS como suficientemente correcto para avanzar a TARGET_OPTIONS.
- Las incógnitas residuales (backlog_v6.xlsx, buscador AJAX, presencia Vinted) no bloquean la decisión de arquitectura.
- El workflow de discovery avanza de `DISCOVERY_ABIERTO` a `AS_IS_VALIDADO`.
- Próxima sesión: TARGET_OPTIONS con deadline ~2026-07-01 (expiración Elementor Pro).

**Qué se validó:** AS_IS_UNDERSTANDING.md estado → VALIDADO_POR_USUARIO. VALIDATION_RECORD.md con VAL-004 y checklist AS-IS marcado. BACKLOG.md con validación en DONE y TARGET_OPTIONS como prioridad NOW. CONTEXTO.md con siguiente paso actualizado y sesión 004 registrada. HISTORIAL_SESIONES.md con esta entrada. agent_events.jsonl con evento as_is_validated. Commit docs-only.  
**Qué NO se tocó:** Código, WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS. No se preparó TARGET_OPTIONS. No se tomaron decisiones de arquitectura.  
**Siguiente paso:** Sesión 005 — TARGET_OPTIONS. Comparar mínimo 4 opciones con deadline ~2026-07-01. El operador aprueba la opción y se genera el SEED.  
**agent_events ref:** 2026-06-10T11:00:00Z (as_is_validated)
---

---
**Sesión 005c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / marketplace-north-star  
**Tarea:** Incorporar la visión de marketplace multi-vendor a largo plazo en TARGET_OPTIONS, sin cambiar la recomendación inmediata A0+B1.

**Decisiones clave:**
- Marketplace declarado como NORTH_STAR / DEFER (PEND-2 en DECISIONS.md). No es el MVP.
- 4 fases documentadas: Fase 1 (tienda estable) → Fase 2 (Studio interno) → Fase 3 (catálogo robusto) → Fase 4 (marketplace si hay tracción).
- Gates explícitos para Fase 4: 100+ productos, workflow ≤10 min, tráfico orgánico, ventas recurrentes, propuesta de valor clara frente a Vinted, sistema de autenticidad, modelo económico.
- Implicaciones de diseño ahora: `owner_id` en modelo de producto, auth con JWT (no hardcoded), URLs sin asumir seller subdomains. Sin features de marketplace en MVP.
- Recomendación A0+B1 sin cambios — sigue siendo la decisión pendiente de aprobación del operador.

**Qué se validó:** TARGET_OPTIONS.md con §11 Marketplace North Star + §12 QUÉ NO HACER actualizado + §14-15 renumerados. DECISIONS.md con PEND-2. BACKLOG.md con MARKETPLACE_NORTH_STAR_VALIDATION en LATER. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, pagos, código. Recomendación A0+B1 no modificada. No se creó Application Password. No se pusheó.  
**Siguiente paso:** Operador aprueba A0+B1 → Sesión 006.  
**agent_events ref:** 2026-06-13T14:00:00Z (marketplace_north_star_added)
---

---
**Sesión 005b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / root-cause-reframe  
**Tarea:** Revisión y corrección de TARGET_OPTIONS.md tras contexto adicional del operador sobre la fricción real de Catenaccio. Añadir Root Cause y corregir el veredicto de "Opción A (Gutenberg)" a "A0 + B1 (Studio)".

**Decisiones clave:**
- Root Cause documentada: 5 bloqueantes reales (Elementor, backoffice caótico, arquitectura catálogo, performance, visión de app/platform).
- Veredicto corregido: APPROVE A0 + B1. A0 = continuidad WordPress (deadline 2026-07-01). B1 = Catenaccio Studio, backoffice/PIM AI-first (Next.js + WC REST API + Claude).
- Insight estratégico: el cuello de botella no es el frontend — es el backoffice. Reemplazar Elementor por Gutenberg no cambia la dinámica de publicación. Studio sí la cambia.
- Modelo de acceso sin SSH definido: Application Password, usuario limitado, modos READ_ONLY / DRAFT_ONLY / APPLY_WITH_APPROVAL.
- Track 3 (storefront público moderno) DEFER hasta 100+ productos y evidencia de tráfico.
- WooPayments como razón de STOP para headless: no soporta headless checkout en producción en 2026.

**Qué se validó:** TARGET_OPTIONS.md reescrito con Root Cause + estrategia A0+B1 + modelo API + plan 7/30/90. DECISIONS.md con DEC-8 corregida. BACKLOG.md con nuevas tareas STUDIO_MVP_DESIGN, PRODUCT_WORKFLOW_DESIGN, WC_API_ACCESS_MODEL, ATTRIBUTE_TAXONOMY_SEO, PERFORMANCE_HOSTING_DECISION. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código, Elementor Pro. No se generó SEED ni plan de implementación. No se creó Application Password (solo se definió el modelo).  
**Siguiente paso:** Operador aprueba A0 + B1 → Sesión 006: Track 0 (auditoría elementor_library + migración) + Track 1 (Application Password + scaffold Studio).  
**agent_events ref:** 2026-06-13T13:00:00Z (target_options_reframed)
---

---
**Sesión 005** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / target-options  
**Tarea:** Preparar TARGET_OPTIONS.md con comparativa estratégica completa y recomendación para el deadline de Elementor Pro (~2026-07-01).

**Decisiones clave:**
- Veredicto APPROVE Opción A: mantener WordPress + WooCommerce y eliminar la dependencia de Elementor Pro antes del 2026-07-01.
- Insight crítico documentado: el Checkout ya fue migrado a Gutenberg Checkout Blocks en febrero 2026. El riesgo de pagos al quitar Elementor Pro es prácticamente cero.
- Opción B (headless) STOP: WooPayments no soporta headless en producción.
- Opción C (migración completa) DEFER: inviable antes del deadline. Reevaluar con evidencia en 6-12 meses.
- Opción D (aplazar) DEFER condicional: solo si Opción A resulta más compleja de lo esperado.
- Opción E (Shopify) STOP: pérdida de activos reales sin justificación.
- PEND-1 avanzada a recomendación fuerte DEC-8 en DECISIONS.md (pendiente de aprobación del operador).

**Qué se validó:** TARGET_OPTIONS.md generado con 11 secciones (veredicto, contexto, opciones, comparativa, riesgos, recomendación binaria, plan 7/30/90, qué no hacer, pregunta al operador, cambios documentales, cierre). BACKLOG.md con TARGET_OPTIONS marcado DONE, nuevas tareas de auditoría e implementación. DECISIONS.md con DEC-8 propuesta. CONTEXTO.md e HISTORIAL_SESIONES.md actualizados. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código, Elementor Pro. No se generó SEED ni plan de implementación. No se inició ninguna tarea técnica.  
**Siguiente paso:** Operador aprueba Opción A → Sesión 006: generar RECOMMENDED_IMPLEMENTATION_PLAN.md + SEED + auditoría elementor_library en WP Admin.  
**agent_events ref:** 2026-06-13T00:00:00Z (target_options_ready)
---

---
**Sesión 004c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** LITE  
**Tipo:** docs / repo-os-sync  
**Tarea:** Sincronizar el sistema operativo documental de Catenaccio con aprendizajes genéricos recientes de Bijuymoda Suite, antes de abrir TARGET_OPTIONS.

**Decisiones clave:**
- Aprendizajes transferidos como principios operativos adaptados a Catenaccio (WP/WC, sin SSH, Elementor deadline).
- No copiados: workflow SSH de Bijuymoda, política Gemini-first, reglas PrestaShop, Company Brain, transferencia a lafabrica.
- TARGET_OPTIONS no iniciado — desbloqueado pero pendiente de Sesión 005.

**Qué se validó:** ORCHESTRATOR.md, AGENTS.md y CHATGPT_PROJECT_INSTRUCTIONS.md actualizados con stack real y reglas operativas. Bijuymoda Suite no modificado. git diff --check limpio.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, TARGET_OPTIONS. Bijuymoda Suite: solo lectura.  
**Siguiente paso:** Sesión 005 — TARGET_OPTIONS. Usar Opus para evaluación final y veredicto APPROVE/STOP.  
**agent_events ref:** 2026-06-13T00:00:00Z (repo_os_sync)
---
