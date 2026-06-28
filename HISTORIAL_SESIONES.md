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
**Sesión 022A.1B** — 2026-06-28
**Agente:** Antigravity
**Modo:** READ_ONLY_COMPETITOR_PRODUCT_MODEL_AUDIT / NO_CODE / NO_REMOTE_WRITE
**Tipo:** audit / model-design
**Tarea:** Auditar Classic Football Shirts para ajustar el modelo de producto del formulario de Catenaccio Studio y redefinir S022A.2.

**Decisiones clave:**
- Veredicto: `ADJUST_S022A2_MODEL_FIRST`. Es necesario ajustar el modelo y el schema de la DB local antes de implementar la UI en S022A.2.
- Renombrar el campo temporal `version_camisa` a `shirt_version` (en inglés) y separarlo de `product_type` (tipo de prenda), `authenticity_type` (tipo de autenticidad: Replica/Player Issue/Match Worn), `sleeve_length` (manga corta/larga) y `sponsor`.
- Diseñar el patrón de título en inglés con la talla al final entre paréntesis: `[Temporada] [Equipo] [Versión] Shirt – [Jugador] #[Dorsal] – ([TALLA])` para que Pablo la visualice en listados, y se adapte automáticamente a porteros (GK Shirt), manga larga (L/S Shirt), entrenamiento, selecciones nacionales y prendas premium.
- Estructurar el formulario de Studio en 4 bloques de entrada (identificación, especificación, detalles y datos internos) y definir la lógica de selects, autocomplete datalists, texto libre y campos derivados.
- Modificar localmente `STUDIO_SUPABASE_SCHEMA_MVP.sql` e instruir a Pablo a aplicar el ALTER TABLE con las nuevas columnas en Supabase SQL Editor como prerrequisito para S022A.2.
- S022B y S022C permanecen bloqueados. S022A.2 puede realizarse de forma local y offline, sin integraciones a Woo o Anthropic en esta fase de formulario.

**Qué se validó:** git status y preflight git PASS (0 ahead / 0 behind, working tree limpio, HEAD en 2e4b9cd). Audit visual pública de CFS terminada (estructuras, listados, filtros, titles, fichas de producto). Audit pública de Catenaccio y probe de API de WooCommerce inspeccionado (`API_READONLY_PROBE_RESULT.md`). Creado `docs/studio/CLASSIC_FOOTBALL_SHIRTS_PRODUCT_MODEL_AUDIT.md`. Modificado `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`. Backlog y Contexto actualizados. Sin código tocado. Sin secretos. Sin remoto.
**Qué NO se tocó:** studio/ (código de Next.js), base de datos de producción o Supabase remota, plugins o temas activos en WordPress, cPanel, Vercel, tokens o variables `.env.local`.
**Siguiente paso:** S022A.2 — FORM_DOMAIN_UX_PATCH (Secuencia: S022A.2A Pablo ejecuta ALTER TABLE en Supabase, luego S022A.2B sesión CODE local de UI y Server Action).
**agent_events ref:** 2026-06-28T10:56:00Z (classic_football_shirts_product_model_audit)
---
**Sesión 022A.1** — 2026-06-28
**Agente:** Claude Code (Sonnet)
**Modo:** READ_ONLY_DIAGNOSIS / NO_CODE / NO_REMOTE_WRITE
**Tipo:** diagnosis / plan / ask
**Tarea:** Diagnosticar los blockers UX/dominio de S022A y definir el plan ejecutable para S022A.2 CODE.

**Decisiones clave:**
- Veredicto: `FIX_BLOCKER_FIRST_WITH_PLAN`. S022A técnico funciona pero el formulario no es usable como producto.
- 6 blockers identificados: IDs técnicos visibles, pérdida de form state, sin edición, sin opciones canónicas, sin título auto-generado, sin campo Versión.
- Ruta 4 (híbrida) elegida: `wc-terms-mvp.ts` con term IDs conocidos del probe S007 + listas hardcoded. Sin credenciales WC en S022A. Resolución de IDs pendientes → S022C.
- Pablo NUNCA ve term IDs. Resolución interna en Server Action.
- Liga → SELECT 7 opciones. Equipo → datalist 21+ opciones. Jugador → texto libre. Temporada → input + datalist. Marca → SELECT. Versión → SELECT nuevo campo (Home/Away/Third/GK/Training/Pre-match/Edición especial).
- Título autogenerado: patrón EN `[Temporada] [Equipo] [Versión] Shirt – [Jugador] #[Número] – ([Talla])`. Se guarda en `referencia`. Override manual permitido.
- Form state: Server Action devuelve `{ fieldErrors, formKey, values }`. `<form key={formKey}>` fuerza remount con defaultValues del estado.
- Edición mínima: ruta `/inventory/[id]/edit` + `updateInventoryItem` action. Blocker de S022A.2.
- Schema change requerido: `ALTER TABLE football_shirt_details ADD COLUMN version_camisa TEXT;` — Pablo ejecuta manualmente antes de S022A.2 CODE.
- Productos existentes de WC: no bloquea S022A.2. Importación diferida a S025+.
- S022B permanece BLOQUEADO hasta PABLO_LOCAL_FORM_OK tras S022A.2.

**Qué se validó:** git preflight PASS (main, 0 ahead/0 behind, HEAD d94a9fd). Lectura proporcional completa: STUDIO_DATA_MODEL.md, STUDIO_WC_BRIDGE_CONTRACT.md, STUDIO_WC_PAYLOAD_SPEC.md, STUDIO_WC_TERM_ID_RESOLUTION_PLAN.md, DECISIONS.md (DEC-13, DEC-14), BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl, ItemForm.tsx, actions.ts, STUDIO_CREATE_ITEM_FORM_RESULT.md. Plan emitido. Sin código tocado. Sin secretos. Sin remote write.
**Qué NO se tocó:** studio/ (ningún archivo de código), SQL canónico, .env.local, WooCommerce, WordPress, Supabase remoto, Vercel, credenciales.
**Siguiente paso:** S022A.2 — FORM_DOMAIN_UX_PATCH. Prerequisito manual de Pablo: ALTER TABLE en Supabase. Luego sesión CODE.
**agent_events ref:** 2026-06-28T00:00:00Z (studio_form_domain_ux_fix_plan)
---

---
**Sesión 019** — 2026-06-27  
**Agente:** Claude Code (Sonnet)  
**Modo:** LOCAL_SCHEMA_DESIGN_ONLY / DOCS_AND_SQL_PLAN / NO_REMOTE_WRITE  
**Tipo:** strategic / data-model-design  
**Tarea:** Diseñar el modelo de datos MVP de Catenaccio Studio en Supabase/Postgres. Separar capa genérica (reutilizable por lafabrica) de extensión específica Catenaccio. AI-first model. Preparar bridge WooCommerce.

**Decisiones clave:**
- Schema Supabase MVP definido: 6 tablas, 7 enums, 15 índices, triggers updated_at, vista inventory_margins, RLS completo.
- Capa genérica: workspaces, inventory_items, ai_suggestions, item_lifecycle_events, media_assets.
- Capa específica Catenaccio: football_shirt_details (1:1 con inventory_items), con term IDs de WC y display cache.
- AI-first: ai_suggestions versionadas (versión 1, 2… tras rechazos), item_lifecycle_events con triggered_by ('pablo'/'agente'/'sistema'), input_context JSONB en ai_suggestions para reproducibilidad.
- Imágenes MVP: Opción A (carpeta_local + photo_status). Supabase Storage diferido (Opción C).
- WC bridge preparado: campos wc_product_id, wc_status, wc_error, wc_payload_snapshot en inventory_items. Mapeo meta_data documentado (liga/equipo/temporada → term IDs; talla/condicion → strings directos).
- Margenes calculados en vista, no columnas (evita inconsistencias).
- RLS MVP: `auth.uid() = owner_id` (simple, correcto para single-user). workspace_members diferido.
- Sin variantes (cada camiseta vintage es única — 1 item = 1 fila).
- DEC-13 actualizada a APROBADA — confirmación literal de Pablo 2026-06-27.
- PABLO_CONFIRM_ROUTE_D cerrado.

**Qué se validó:** git status limpio. git diff --check OK. Sin secretos. Sin llamadas remotas. SQL estático revisado (PKs, owner_id en todas las tablas, FK, enums, índices, RLS). Markdown sin bloques rotos. 5 documentos creados, 4 docs operativos actualizados.  
**Qué NO se tocó:** WordPress, WP Admin, cPanel, APIs externas, Supabase remoto, Vercel, DB producción, plugins, temas activos, pagos, .env.local. No se creó app Next.js. No se hizo deploy.  
**Siguiente paso:** S020 — STUDIO_WC_BRIDGE_CONTRACT. Prerequisitos: Pablo crea cuenta Supabase + Vercel (tier gratuito). Pablo revoca token cPanel de S017.  
**agent_events ref:** 2026-06-27T20:00:00Z (studio_data_model_designed)
---

---
**Sesión 020** — 2026-06-27  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY / CONTRACT_DESIGN / NO_REMOTE_WRITE  
**Tipo:** strategic / contract-design  
**Tarea:** Diseñar el contrato técnico completo del puente Catenaccio Studio → WooCommerce. Definir autenticación, endpoints, payload exacto, mapeo meta_data, resolución de term IDs, idempotencia, error handling y plan de test controlado. Registrar DEC-14.

**Decisiones clave:**
- DEC-14 registrada: DRAFT_ONLY hardcoded, Application Password / Basic Auth / shop_manager, meta_data ACF (no attributes[]), idempotencia por wc_product_id IS NULL, PATTERN-08 activo, cPanel token DEFERRED_BY_OPERATOR.
- Payload exacto definido: status="draft" fijo, meta_data con liga/equipo/ano_temporada (term IDs) + talla/condicion (strings directos) + descripcion_del_producto.
- Term IDs confirmados del probe S007: pa_liga id=5 (LaLiga=72, Premier=95, Serie A=51, Eredivisie=177), pa_equipo id=4 (Francia=129), pa_ano id=7 (2014-15=139). Resto pendiente de resolución en WC_API_WRITE_ACCESS_TEST.
- Imágenes diferidas: MVP no sube fotos. Pablo añade manualmente en WP Admin.
- Test plan WC_API_WRITE_ACCESS_TEST diseñado con producto dummy inequívoco: "[STUDIO TEST] Catenaccio Bridge Draft — DELETE ME", precio €1, cleanup manual por Pablo.
- CPANEL_TOKEN_REVOCATION marcado DEFERRED_BY_OPERATOR / RISK_ACCEPTED.
- SUPABASE_VERCEL_ACCOUNTS marcado completado (Pablo creó ambas cuentas).
- S020 cerrado en BACKLOG.md. WC_API_WRITE_ACCESS_TEST añadido como gate antes de S021.

**Qué se validó:** git status limpio (0 ahead/0 behind, HEAD en c4544bd antes de S020). git diff --check OK. Sin secretos. Sin llamadas remotas. Sin código ejecutable. 5 docs creados, 5 archivos operativos actualizados. Markdown sin bloques rotos.  
**Qué NO se tocó:** WordPress, WP Admin, cPanel, Supabase remoto, Vercel, APIs externas, DB producción, plugins, temas activos, pagos, productos WC, .env.local. No se creó app Next.js. No se ejecutó ninguna llamada WC API.  
**Siguiente paso:** WC_API_WRITE_ACCESS_TEST — ejecutar test controlado de 1 producto dummy con Pablo presente; si PASS → S021 desbloqueado.  
**agent_events ref:** 2026-06-27T21:00:00Z (studio_wc_bridge_contract_designed)
---

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
**Sesión 005d** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** approve + push  
**Tarea:** Registrar aprobación formal del operador para A0 + B1, cerrar TARGET_OPTIONS como aprobado, y pushear los commits pendientes a GitHub.

**Decisiones clave:**
- TARGET_OPTIONS.md → estado `OPCIÓN_APROBADA`. Opción aprobada: A0 + B1.
- Aprobación literal del operador: "APPROVE A0 + B1. Marketplace queda como NORTH_STAR / DEFER."
- Workflow de discovery avanza: AS_IS_VALIDADO → TARGET_APROBADO.
- VALIDATION_RECORD.md con VAL-005. DECISIONS.md DEC-8 cerrada como APROBADA. DEC-8 / PEND-2 marketplace confirmado como NORTH_STAR/DEFER.
- BACKLOG.md: bloqueo de implementación levantado. Nuevas tareas NOW: A0_IMPLEMENTATION_PLAN, B1_CATENACCIO_STUDIO_SEED, CMS_API_ACCESS_MODEL_READONLY.
- 4 commits (005, 005b, 005c, 005d) pusheados a origin/main.

**Qué se validó:** TARGET_OPTIONS.md OPCIÓN_APROBADA. VALIDATION_RECORD.md VAL-005. DECISIONS.md DEC-8 APROBADA. BACKLOG.md actualizado. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Push a GitHub completado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, DNS, pagos, código. No se implementó código. No se creó Application Password.  
**Siguiente paso:** Sesión 006 — Track 0: auditoría elementor_library + migración + fixes (deadline 2026-07-01). Track 1 paralelo: Application Password + scaffold Studio.  
**agent_events ref:** 2026-06-13T15:00:00Z (target_approved_and_pushed)
---

---
**Sesión 007b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** api-probe / authenticated  
**Tarea:** Probe autenticado completo usando Application Password de `catenaccio-studio-agent`. Verificar acceso WC REST API v3, Elementor, y auditar modelo de datos real de productos.

**Decisiones clave:**
- Credenciales verificadas: usuario id=16, slug `catenaccio-studio-agent`, rol `shop_manager` = "Gestor de la tienda". Capacidad `manage_woocommerce` confirmada.
- **Hallazgo crítico:** todos los productos tienen `attributes: []` (vacío) en WC REST API. Los atributos se almacenan en `meta_data` como ACF fields: `liga`/`equipo`/`jugador`/`ano_temporada` como IDs de término WC, `talla`/`condicion` como strings. Studio debe escribir en `meta_data`, no en `attributes[]`.
- Elementor Pro: `isExpired: false`. Licencia activa con ~18 días restantes.
- 14 templates en elementor_library (no 19 como decía el AS_IS — 5 menos, posiblemente eliminados). 12/14 son Pro-dependientes por tipo de template (loop-item, product-archive, product, header, footer, search-results, error-404). Solo `single-page` podría no requerir Pro.
- Límite de shop_manager: puede listar templates pero no leer su contenido JSON. Para widget-level audit se necesita Application Password de Administrator.
- pa_equipo: 21 términos confirmados. pa_liga: 6 términos (Bundesliga, Eredivisie, LaLiga, Ligue 1, Premier League, Serie A).

**Qué se validó:** `API_READONLY_PROBE_RESULT.md` actualizado con todos los hallazgos autenticados. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Ningún write al sitio.  
**Qué NO se tocó:** WordPress, producción, ninguna escritura. `.env.local` no mostrado ni cometteado.  
**Siguiente paso:** Sesión 008 — A0_ELEMENTOR_DEPENDENCY_AUDIT. Decidir si crear App Password de Admin para widget-level audit, o hacer auditoría visual en WP Admin. 12/14 templates ya clasificados como Pro por tipo.  
**agent_events ref:** 2026-06-13T20:00:00Z (api_auth_probe_complete)
---

---
**Sesión 007** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** api-probe / access-verification  
**Tarea:** Probar acceso de solo lectura a WordPress/WooCommerce. Confirmar qué endpoints funcionan sin auth, cuáles requieren Application Password, y si elementor_library puede auditarse por API.

**Decisiones clave:**
- `.env.local` está vacío — Pablo creó el archivo pero no lo completó. Probe autenticado bloqueado hasta completarlo.
- Endpoints públicos funcionan correctamente. 28 productos confirmados vía Store API. Elementor Pro namespace activo (`elementor-pro/v1`).
- `elementor_library` es post type registrado y visible públicamente (wp/v2/types). Sus items requieren auth.
- La auditoría de elementor_library es factible 100% por API con `GET /wp-json/wp/v2/elementor_library?context=edit` — sin capturas manuales de Pablo.
- WC Store API (público) no expone atributos custom. WC REST API v3 con auth es la vía para pa_liga, pa_equipo, etc.
- El usuario limitado debe tener rol `Shop Manager` para acceso completo a WC REST API v3. `Author` no es suficiente.
- Precios en WC están en EUR cents (4500 = €45.00).

**Qué se validó:** `API_READONLY_PROBE_RESULT.md` creado con resultados completos. BACKLOG.md actualizado. CONTEXTO.md con estado y nuevo orden. HISTORIAL_SESIONES.md con esta entrada. agent_events.jsonl con evento. Ningún write al sitio WordPress. `.env.local` no cometteado ni leído en contenido.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, código, credenciales. Ningún POST/PUT/PATCH/DELETE ejecutado.  
**Siguiente paso:** Pablo completa `.env.local` (WP_SITE_URL, WP_APP_USER con rol Shop Manager, WP_APP_PASSWORD) → Sesión 007b: probe autenticado (usuario, WC atributos, elementor_library 19 items, licencia Pro).  
**agent_events ref:** 2026-06-13T19:00:00Z (api_readonly_probe_executed)
---

---
**Sesión 006d** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** reorder / access-first  
**Tarea:** Corregir el orden operativo tras 006c: access-first como primera acción real, no pedir listas manuales a Pablo antes de probar el acceso.

**Decisiones clave:**
- `ACCESS_MODEL_ACTIVATION_READONLY` pasa a ser la primera acción en NOW — Pablo crea usuario limitado + Application Password (guía `ACCESS_MODEL_NO_SSH.md §6`). Prerequisito para todo lo que sigue.
- `WP_WC_API_READONLY_PROBE` — segunda acción: el agente verifica el acceso con una llamada GET de solo lectura. Confirma antes de auditar Elementor.
- `A0_ELEMENTOR_DEPENDENCY_AUDIT` — tercera acción: el agente audita los 19 items de elementor_library vía WP Admin / API. No depende de lista manual de Pablo como vía principal (solo fallback).
- `B1_CATENACCIO_STUDIO_SEED` movido de NOW a NEXT — Studio no arranca hasta que el acceso API esté verificado.
- Tareas stock/Excel/fotos/Vinted confirman posición en NEXT — no son acción inmediata de Pablo, no bloquean A0.
- `STOCK_OPERATIONS_MODEL.md` se mantiene íntegro como contexto B1 — añadida nota de que no bloquea A0 ni la activación del acceso.
- DEC-9 actualizada con nota: access-first es la política operativa activa.

**Qué se validó:** BACKLOG.md NOW reordenado — access-first como prioridad explícita. CONTEXTO.md siguiente paso con orden correcto 4 pasos. HISTORIAL_SESIONES.md con 006d. agent_events.jsonl con access_first_reordered. DECISIONS.md DEC-9 con nota policy. STOCK_OPERATIONS_MODEL.md con nota "no bloquea A0".  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, código. STOCK_OPERATIONS_MODEL.md contenido no modificado (solo nota añadida). No se creó Application Password. No se auditó Elementor.  
**Siguiente paso:** Pablo ejecuta `ACCESS_MODEL_ACTIVATION_READONLY` (WP Admin, 10-15 min) → Sesión 007: WP_WC_API_READONLY_PROBE → Sesión 008: A0_ELEMENTOR_DEPENDENCY_AUDIT.  
**agent_events ref:** 2026-06-13T18:00:00Z (access_first_reordered)
---

---
**Sesión 006c** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** strategic / stock-operations-model  
**Tarea:** Modelar la operativa real de stock de Pablo para que Catenaccio Studio sea un sistema operativo de inventario, no solo un formulario de publicación.

**Decisiones clave:**
- Catenaccio Studio definido explícitamente como PIM + gestor de estados + asistente de publicación web/Vinted + base futura de marketplace (sin construirlo).
- 11 estados del ciclo de vida de una camiseta: COMPRADA → PENDIENTE_FOTOS → FOTOS_HECHAS → PENDIENTE_DESCRIPCION → BORRADOR_WEB → PENDIENTE_WEB → PUBLICADA_WEB → PENDIENTE_VINTED → PUBLICADA_VINTED → RESERVADA → VENDIDA → ARCHIVADA.
- 8 bloques de campos mínimos definidos: identificación, compra/coste, precio/margen (con cálculo automático de margen_esperado y margen_real), atributos WC (pa_liga, pa_equipo, etc.), contenido Claude (título SEO, descripción, precio sugerido), imágenes (carpeta_local, estado_fotos), estado operativo/publicación (id_woocommerce, url_web, url_vinted, canal_venta), ubicación física y notas.
- Recomendación imágenes: Opción A en MVP (registrar ruta de carpeta local, sin mover fotos), escalar a Opción C (upload directo a WC Media Library vía `POST /wp-json/wp/v2/media`) cuando Studio esté en uso.
- No importar Excel todavía. Primer paso: Pablo comparte columnas reales de STOCK.xlsx. Segundo paso: plantilla CSV futura compatible con Studio. Tercer paso: importador en iteración posterior.
- 5 tareas derivadas añadidas al BACKLOG: EXCEL_STOCK_IMPORT_MAPPING, LOCAL_IMAGE_FOLDER_WORKFLOW, VINTED_PUBLICATION_TRACKING, STUDIO_PRODUCT_STATUS_PIPELINE, STUDIO_MVP_DESIGN actualizado con referencia a este documento.
- Qué NO construir en MVP: marketplace, multi-vendor, sincronización Vinted automática, publicación sin revisión, sistema de pagos propio, gestión pedidos, import automático precios mercado, app móvil.

**Qué se validó:** `docs/operations/STOCK_OPERATIONS_MODEL.md` creado. BACKLOG.md con B1_STOCK_OPERATIONS_MODEL marcado done + 5 tareas derivadas añadidas + registro en DONE. CONTEXTO.md y HISTORIAL_SESIONES.md con Sesión 006c. agent_events.jsonl con evento stock_operations_model_defined.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, hosting, dominio, pagos, código, Excel de Pablo. No se creó Application Password. No se implementó código.  
**Siguiente paso:** Sesión 007 (auditoría Elementor Library) + Pablo comparte columnas de STOCK.xlsx (acción sin agente) + Sesión 008 (Pablo crea credenciales ACCESS_MODEL §6) + Sesión 009 (Studio MVP).  
**agent_events ref:** 2026-06-13T17:00:00Z (stock_operations_model_defined)
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

---
**Sesión 006** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** docs / access-model / operations  
**Tarea:** Definir el modelo operativo de acceso a WordPress/WooCommerce sin SSH (Raiola Inicio SSD 2.0) para Catenaccio Vintage, prerequisito para Catenaccio Studio (Track 1).

**Decisiones clave:**
- Modelo de acceso en 4 capas: sin acceso servidor (siempre activo para el agente) / WP Admin manual (Pablo) / WP+WC REST API (agente con credenciales limitadas) / cPanel+Raiola Soporte (Pablo, excepcional).
- 6 modos de operación definidos: READ_ONLY, API_READ_ONLY, DRAFT_ONLY, APPLY_WITH_APPROVAL, MANUAL_BY_PABLO, BLOCKED_WITHOUT_STAGING.
- Modo por defecto del agente: DRAFT_ONLY. El agente prepara borradores — Pablo publica.
- Credencial recomendada para Studio: Application Password de usuario limitado `catenaccio-studio-agent`. Alternativa: WC API Key.
- Credenciales prohibidas: contraseña admin, wp-config.php, cPanel, pasarelas de pago.
- Regla de oro: credenciales en `.env.local` local — nunca en repo, nunca en chat.
- Modelo de revocación documentado (por nombre de password, por key, por usuario).
- Operaciones bloqueadas sin staging: functions.php, tema hijo, plugins custom — solo microfix con procedimiento autorizado.
- Opciones de staging en Raiola documentadas (subdominio manual, WP Duplicator, upgrade, entorno local).
- Plan OPcache/Raiola: valores recomendados (`opcache.memory_consumption=128`, `max_accelerated_files=4000`), texto de ticket para Raiola, fix de `WP_MEMORY_LIMIT` en wp-config.php.
- DEC-9 añadida en DECISIONS.md.

**Qué se validó:** `docs/operations/ACCESS_MODEL_NO_SSH.md` creado. DECISIONS.md con DEC-9. BACKLOG.md actualizado (CMS_API_ACCESS_MODEL_READONLY marcado completado-pendiente-ejecución, nuevas entradas, DONE actualizado). CONTEXTO.md con sesión 006 y nuevo siguiente paso. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento. git diff --check limpio.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, cPanel, hosting, dominio, DNS, pagos, código, Elementor. No se creó ninguna credencial. No se entró en WP Admin.  
**Siguiente paso:** Sesión 007 — Track 0: Pablo entrega capturas/lista de elementor_library (19 items) → auditoría Elementor con Antigravity o Sonnet. Acción inmediata sin agente: Pablo abre ticket Raiola (OPcache) siguiendo §9 del ACCESS_MODEL_NO_SSH.md.  
**agent_events ref:** 2026-06-13T16:00:00Z (access_model_no_ssh_defined)
---

---
**Sesión 008** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY (ventana temporal de Administrator)  
**Tipo:** audit / A0_ELEMENTOR_DEPENDENCY_AUDIT  
**Tarea:** Auditoría widget-level de todos los templates Elementor con credenciales de Administrador. Pablo elevó temporalmente `catenaccio-studio-agent` a Administrator para esta sesión. Crear `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md`.

**Decisiones clave:**
- Widget-level audit completado via `wp/v2/elementor_library/{id}?context=edit` — método que funciona con Admin (vs. 403 con shop_manager).
- 17 templates de elementor_library + 2 páginas WC (Carrito, Mi Cuenta) auditados.
- **CRÍTICOS (3):** Cabecera (653) con nav-menu + woocommerce-menu-cart, Producto individual (100) con 5 widgets WC Pro, Archivo productos (129) con loop-grid.
- **ALTO impacto (8+):** footer form, loop items ×5, resultados búsqueda, popup menú, carrito y mi cuenta.
- **Hallazgo correctivo:** Carrito (id=25) y Mi Cuenta (id=27) usan widgets Pro (`woocommerce-cart`, `woocommerce-my-account`). No estaban en WooCommerce Blocks como indicaban notas previas.
- **Finalizar Compra (id=1548) SÍ está en Blocks** — único elemento de checkout ya migrado.
- id=1414 posiblemente inactivo en uso real — conditions excluyen shop/cat/search.
- Quick win disponible: Carrito + Mi Cuenta reemplazables por shortcodes en WP Admin en ~10 min.
- Plan de migración A0 definido en 4 prioridades (P1 crítico, P2 alto, P3 medio, P4 bajo).

**Qué se validó:** `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md` creado con tabla completa, catálogo de 17 widgets Pro, mapa de impacto por sección, plan de migración priorizado. `API_READONLY_PROBE_RESULT.md` actualizado con nota de sesión 008 y hallazgo Carrito/Mi Cuenta. BACKLOG.md: A0_ELEMENTOR_DEPENDENCY_AUDIT ✅, A0_MIGRATION_PLAN + CARRITO_MICUENTA_QUICKWIN añadidos a NOW. CONTEXTO.md siguiente paso actualizado. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, configuración, Elementor templates, páginas, plugins. Ningún write al sitio. Ningún POST/PUT/PATCH/DELETE ejecutado.  
**Siguiente paso:** (1) Pablo revierte `catenaccio-studio-agent` a Gestor de la tienda. (2) Pablo hace quickwin Carrito + Mi Cuenta (10 min en WP Admin). (3) Sesión 009: A0_MIGRATION_PLAN — plan técnico child theme para P1-A/B/C.  
**agent_events ref:** 2026-06-13T22:00:00Z (elementor_dependency_audit_complete)
---

---
**Sesión 009** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** DOCS_ONLY  
**Tipo:** integration-close / seo-connector  
**Tarea:** Cerrar correctamente en el repo la integración local validada de Google Search Console API en modo read-only. Documentar el patrón reusable para lafabrica y Bijuymoda Suite.

**Decisiones clave:**
- GSC_API_READONLY_CONNECTOR marcado como validado localmente. No se abre sesión de implementación — el estado ya era funcional.
- Script `scripts/seo/gsc_probe.py` revisado: correcto sin cambios necesarios (scope readonly, carga `.env.local`, `sites.list()` + `searchanalytics.query`, token en `.secrets/`).
- `requirements-gsc.txt` correcto sin cambios.
- `.gitignore`: las reglas para `.secrets/`, `**/token*.json`, `**/client_secret*.json`, `**/credentials*.json` ya estaban añadidas por Pablo (M en git status). Se versiona tal cual.
- Patrón reusable documentado en `GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md` con 9 pasos y checklist de seguridad.
- Patrón registrado como candidato `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN` para lafabrica.
- Instrucciones específicas para Bijuymoda Suite incluidas en el patrón (sin tocar el repo de Bijuymoda en esta sesión).
- SERVER_FILESYSTEM_READONLY_DISCOVERY se mantiene como siguiente tarea principal de A0.

**Qué se validó:**
- `python scripts/seo/gsc_probe.py` ejecutado correctamente: propiedad `https://catenacciovintage.com/` detectada como siteOwner, datos reales devueltos (queries, páginas, clicks, impressions, CTR, posición).
- `git status --short --ignored` confirmado: `.env.local` → `!!`, `.secrets/` → `!!`, `.venv/` → `!!`. Ningún secreto como `??` o `M`.
- Búsqueda de señales de secretos en archivos versionables: solo referencias a nombres de archivo y patrones de código — sin valores reales.

**Qué NO se tocó:** WordPress, WooCommerce, producción, Google Cloud (solo se documentó), Search Console (solo lectura ya validada por Pablo), Bijuymoda Suite, lafabrica, credenciales.  
**Siguiente paso:** Sesión 010 — SERVER_FILESYSTEM_READONLY_DISCOVERY: mapear child theme, plugins custom, archivos Elementor override vía cPanel File Manager (read-only) o FTP readonly. Prerequisito para A0_MIGRATION_PLAN.  
**agent_events ref:** 2026-06-14T12:00:00Z (gsc_readonly_connector_closed)
---

---
**Sesión 010A** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** discovery / filesystem / blocked  
**Tarea:** SERVER_FILESYSTEM_READONLY_DISCOVERY — conectar al filesystem real de WordPress vía Web Disk/WebDAV (read-only) y mapear child theme, plugins custom y overrides Elementor antes de A0_MIGRATION_PLAN.

**Decisiones clave:**
- Web Disk de cPanel configurado por Pablo (cv-readonly@catenacciovintage.com, directorio: public_html/wp-content, permisos: solo lectura). Credenciales presentes en `.env.local`.
- **BLOCKED_WEBDAV_CONNECTION:** puertos 2077/2078 bloqueados por firewall de Raiola en planes compartidos. Subdominio `webdisk.catenacciovintage.com` sin entrada DNS. Puerto 443 devuelve 403 a PROPFIND (WebDAV no habilitado en el webserver del dominio).
- No se ejecutó ninguna escritura (PUT/POST/DELETE/MKCOL) en ningún momento. Read-only no verificado por write attempt — asumido por configuración cPanel.
- Script `scripts/filesystem/webdav_probe.py` creado y ejecutado — funcional, reutilizable si se desbloquea el acceso.
- Mapa A0 documentado con datos disponibles de sesiones anteriores: riesgos de rewrite rules, Filtro Camisetas Pro vs loop-grid, Off-Canvas Menu widget dependency.
- Veredicto: **FIX_BLOCKER_FIRST**. Ruta A (más rápida): Pablo pega 4 ficheros desde cPanel File Manager.
- CARRITO_MICUENTA_QUICKWIN no bloqueado — Pablo puede hacerlo YA en WP Admin (10 min).

**Qué se validó:** `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` creado. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Script de probe en `scripts/filesystem/webdav_probe.py`. Ningún write al sitio. Ningún secreto impreso ni commiteado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, credenciales, cPanel, Elementor, base de datos, archivos del servidor. Ningún método WebDAV de escritura ejecutado.  
**Siguiente paso:** Pablo elige ruta de desbloqueo (ver `SERVER_FILESYSTEM_READONLY_DISCOVERY.md §5`): Ruta A (cPanel File Manager, 20-30 min) o Ruta B (corregir URL WebDAV en .env.local). Luego Sesión 010B: A0_MIGRATION_PLAN con código real.  
**agent_events ref:** 2026-06-14T16:xx:xx (filesystem_discovery_blocked_webdav)

---
**Sesión 013** — 2026-06-20
**Agente:** Claude Code (Sonnet)
**Modo:** LOCAL_CODE_ONLY / IMPLEMENT_SHADOW_THEME / NO_SERVER
**Tipo:** impl / tema sombra / local
**Tarea:** THEME_SHADOW_IMPLEMENT — crear localmente el tema sombra `catenaccio-a0-child/` con los 9 archivos del árbol aprobado en Sesión 012. Sin acceso al servidor.

**Decisiones clave:**
- Gate de fuente exacta (TAREA 1): functions.php del activo no está en el repo — solo análisis. Shortcodes `cv_*` implementados en versión MINIMAL con campos ACF documentados (talla, medida_axila, medida_largo, condicion, defectos) y taxonomías conocidas (pa_equipo, pa_liga, pa_ano). Comportamiento exacto puede diferir del activo — validar en Sesión 015.
- 4 BLOCKERS identificados para sesión 013b: (A) IVA 21% en envío — CRÍTICO, no inventar lógica fiscal; (B) URLs limpias de producto — sistema de rewrite complejo, no inventar; (C) Breadcrumbs personalizados — WC nativo es suficiente para validación visual; (D) Carrusel home en stock — no bloqueante de ventas.
- Veredicto parcial: APPROVE_READY_FOR_SYNC para estructura y layout visual. FIX_BLOCKER_FIRST para activación en producción (especialmente BLOCKER-A IVA).
- content-product.php mantiene clases WC estándar (`products > li.product`) para compatibilidad con AJAX del plugin filtro-camisetas.
- cv-a0.js implementa trampa de foco en el panel off-canvas (accesibilidad A11y).
- Para desbloquear 013b: Pablo sube functions.php del activo al repo (rama/carpeta reference/), pega los fragmentos en el chat, o solicita nuevo token cPanel para re-leerlo.

**Qué se validó:** 9 archivos creados: style.css (header correcto, Template: hello-elementor), functions.php (enqueue + menus + shortcodes MINIMAL + BLOCKERS documentados), header.php (logo + nav + mini-cart + off-canvas), footer.php, woocommerce/single-product.php, woocommerce/archive-product.php, woocommerce/content-product.php, assets/css/cv-a0.css (layout completo responsive), assets/js/cv-a0.js (toggle off-canvas + trampa de foco + archive-intro toggle). `git diff --check` limpio. Sin secretos, tokens ni credenciales. docs/operations/THEME_SHADOW_IMPLEMENT.md creado con veredicto, blockers, checklist visual y próximos pasos.
**Qué NO se tocó:** Servidor, WordPress, WooCommerce, cPanel, Elementor, plugins activos, tema activo `hello-elementor-child`, functions.php real, wp-config.php, pasarelas de pago, SEO, credenciales, `.env.local`. No se hizo deploy, no se activó ningún tema, no se hizo flush de caché ni de permalinks.
**Siguiente paso:** Sesión 013b — THEME_SHADOW_COMPLETE_BLOCKERS: Pablo aporta fragments exactos de functions.php del activo (IVA, rewrite rules, breadcrumbs). Luego Sesión 014 — THEME_SHADOW_SYNC con nuevo token cPanel.
**agent_events ref:** 2026-06-20T14:00:00Z (theme_shadow_implement_complete)
---

---
**Sesión 012** — 2026-06-20
**Agente:** Claude Code (Sonnet)
**Modo:** DOCS_ONLY / SCAFFOLD_PLAN / READ_ONLY
**Tipo:** docs / contrato técnico / scaffold
**Tarea:** THEME_SHADOW_SCAFFOLD — diseñar la estructura completa del tema sombra `catenaccio-a0-child` como contrato técnico para Sesión 013. Sin implementar código. Sin acceso al servidor.

**Decisiones clave:**
- APPROVE_MINIMAL_PORT aprobado como estrategia de functions.php del tema sombra: portar solo las 7 categorías críticas (register_nav_menus, rewrite rules producto, breadcrumbs, IVA envío, pre_get_posts, enqueue assets, shortcodes propios). No copiar functions.php completo del activo (62KB, 1712 líneas). No usar require_once del activo. Guards `!shortcode_exists()` como defensa contra doble registro.
- Árbol de archivos aprobado: 9 archivos bajo `catenaccio-a0-child/` (style.css, functions.php, header.php, footer.php, woocommerce/{single-product, archive-product, content-product}.php, assets/{css/cv-a0.css, js/cv-a0.js}).
- Clases CSS propias definidas: `.cv-header`, `.cv-mini-cart`, `.cv-offcanvas-*`, `.cv-product-*`, `.cv-archive-*`, `.cv-product-card`. Reemplazan `.elementor-menu-cart__*` y `.elementor-button--*`.
- Estado JS off-canvas definido: `body.cv-offcanvas-open`, `aria-hidden`, `aria-expanded`. Toggle propio en cv-a0.js sin dependencia Elementor.
- 10 shortcodes mapeados a templates. Todos conservados sin cambios. Shortcodes de plugins (offcanvas, filtro-camisetas) activos independientemente del tema.
- 12 riesgos documentados con mitigación. Blocker principal identificado: JS de filtro-camisetas puede buscar clases Elementor — auditar antes de Sesión 013.
- Auditoría DOM/JS definida: 9 páginas a inspeccionar, selectores críticos a observar, estados de breakpoint a registrar.

**Qué se validó:** `docs/operations/THEME_SHADOW_SCAFFOLD.md` creado (13 secciones). Árbol de archivos aprobado. Inventario de funciones/hooks clasificado (CRÍTICO/IMPORTANTE/NO PORTAR). Estrategia functions.php con veredicto APPROVE_MINIMAL_PORT. Scaffolds HTML/PHP de referencia para header, single-product, archive-product, content-product. Clases CSS/JS propuestas. Checklist auditoría DOM (9 páginas). Checklist auditoría JS (5 módulos). 12 riesgos con mitigación. Checklist visual para Sesión 015. Criterios de aceptación Sesión 013 definidos. BACKLOG.md actualizado. CONTEXTO.md appendeado. agent_events.jsonl appendeado. git status limpio antes del commit.
**Qué NO se tocó:** Servidor, WordPress, WooCommerce, cPanel, Elementor, plugins, tema activo `hello-elementor-child`, functions.php real, wp-config.php, pasarelas de pago, SEO, credenciales, `.env.local`. No se creó carpeta `catenaccio-a0-child`. No se implementó ningún archivo PHP/CSS/JS. No se hizo deploy ni flush de caché. DECISIONS.md no modificado (no hay decisión nueva — la sesión desarrolla DEC-10 y DEC-8 existentes).
**Siguiente paso:** Sesión 013 — THEME_SHADOW_IMPLEMENT: (1) auditoría DOM/JS del sitio activo con DevTools read-only; (2) crear localmente `catenaccio-a0-child/` con los 9 archivos del árbol aprobado siguiendo el contrato técnico de THEME_SHADOW_SCAFFOLD.md.
**agent_events ref:** 2026-06-20T12:00:00Z (theme_shadow_scaffold_complete)
---

---
**Sesión 011** — 2026-06-20
**Agente:** Claude Code (Sonnet)
**Modo:** DOCS_ONLY / PLAN_ONLY
**Tipo:** docs / plan técnico
**Tarea:** A0_MIGRATION_PLAN — crear plan técnico completo para migrar dependencias críticas de Elementor Pro manteniendo WP+WC. Sin implementación. Sin acceso al servidor.

**Decisiones clave:**
- No se toma ninguna decisión nueva. El plan desarrolla DEC-10 (NO_SSH_SHADOW_RELEASE_FLOW) y la estrategia A0+B1 (DEC-8). DECISIONS.md no se modifica.
- Enfoque técnico confirmado para P1-A: `header.php` en tema sombra con `wp_nav_menu()`, `woocommerce_mini_cart()`, toggle off-canvas CSS/JS mínimo + `[catenaccio_offcanvas_menu]`.
- Enfoque técnico confirmado para P1-B: `woocommerce/single-product.php` con hooks WC nativos + shortcodes propios conservados.
- Enfoque técnico confirmado para P1-C: `woocommerce/archive-product.php` + `content-product.php` con `woocommerce_product_loop_start/end` + shortcodes filtro conservados.
- P2 (Carrito/Mi Cuenta): acción manual Pablo en WP Admin. Sin sesión de agente.
- 12 riesgos técnicos documentados y con mitigación definida.
- Plan de sesiones 012-015 + RELEASE_MANUAL_PABLO con objetivos explícitos.

**Qué se validó:** `docs/operations/A0_MIGRATION_PLAN.md` creado con 11 secciones. Checklist de aceptación incluido — todos los ítems verificados. Todos los shortcodes conservados. Estrategia respeta DEC-10. BACKLOG.md: A0_MIGRATION_PLAN marcado [x]. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. git diff --check limpio.
**Qué NO se tocó:** Servidor, WordPress, WooCommerce, cPanel, Elementor, plugins, tema activo `hello-elementor-child`, `functions.php` real, wp-config.php, pasarelas de pago, SEO, credenciales, `.env.local`. No se creó carpeta `catenaccio-a0-child`. No se implementó ningún archivo PHP/CSS/JS. No se hizo deploy ni flush de caché. No se mezcló con Bijuymoda Suite, lafabrica ni otros proyectos.
**Siguiente paso:** (1) Pablo ejecuta CARRITO_MICUENTA_QUICKWIN (~10 min en WP Admin — opcional, independiente). (2) Sesión 012 — THEME_SHADOW_SCAFFOLD: diseñar estructura de `catenaccio-a0-child`, auditar JS de filtro-camisetas, capturar CSS breakpoints con Antigravity.
**agent_events ref:** 2026-06-20T00:00:00Z (a0_migration_plan_complete)
---

---
**Sesión 010C** — 2026-06-15
**Agente:** Claude Code (Sonnet)
**Modo:** DOCS_ONLY
**Tipo:** docs / operativa / decisión
**Tarea:** Documentar la decisión operativa DEC-10 — NO_SSH_SHADOW_RELEASE_FLOW como patrón operativo para Catenaccio y candidato futuro para lafabrica.

**Decisiones clave:**
- DEC-10 registrada en DECISIONS.md: patrón shadow-release para Catenaccio sin SSH y sin staging dedicado.
- Superficie sombra definida: tema paralelo inactivo `catenaccio-a0-child`. El agente NUNCA toca `hello-elementor-child` ni plugins activos.
- Flujo aprobado: ventana temporal de acceso → sync a carpeta sombra aislada → validación visual Antigravity (solo lectura) → promoción manual por Pablo → rollback definido (reactivar tema anterior) → cierre de acceso (revocación token).
- cPanel API Token aprobado para: READ_ONLY discovery + escritura en carpeta sombra aislada únicamente. Path guardrail a `public_html/wp-content/themes/catenaccio-a0-child`.
- Antigravity es canal de validación visual, no de edición ni acceso a servidor.
- Patrón NO extraído a lafabrica hasta validarlo con la migración A0 real (sesiones 011-015).
- Prioridad Pablo: revocar token cPanel API de Sesión 010B antes de cualquier acceso siguiente.
- Orden de próximas sesiones documentado: 011 A0_MIGRATION_PLAN → 012 THEME_SHADOW_SCAFFOLD → 013 implementación → 014 sync → 015 validación → RELEASE manual.

**Qué se validó:** DECISIONS.md DEC-10 registrada. BACKLOG.md con CPANEL_TOKEN_REVOCATION (acción Pablo) y track shadow release (sesiones 012-015). CONTEXTO.md append con sesión 010C. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento. git status limpio, .env.local no trackeado.
**Qué NO se tocó:** Servidor, WordPress, WooCommerce, cPanel, token cPanel, .env.local, Elementor, código, plugins, producción. No se inició A0_MIGRATION_PLAN.
**Siguiente paso:** (1) Pablo revoca token cPanel API de 010B. (2) Sesión 011 — A0_MIGRATION_PLAN — plan técnico PHP child theme (sin acceso servidor).
**agent_events ref:** 2026-06-15T10:00:00Z (no_ssh_shadow_release_decision)
---

---
**Sesión 010B** — 2026-06-14  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** discovery / filesystem / cpanel-api  
**Tarea:** SERVER_FILESYSTEM_READONLY_DISCOVERY vía cPanel API Token. Leer filesystem real del servidor en modo estrictamente read-only usando UAPI Fileman (list_files + get_file_content).

**Decisiones clave:**
- **Canal de acceso:** cPanel UAPI Token (`Authorization: cpanel {user}:{token}`) — exitoso donde WebDAV había fallado. Script reutilizable: `scripts/filesystem/cpanel_uapi_probe.py`.
- **Off-Canvas Menu:** 100% independiente de Elementor. Es un shortcode (`[catenaccio_offcanvas_menu]`) con assets propios. NO registra widgets Elementor. Riesgo eliminado.
- **Filtro Camisetas Pro v3.0.0:** Core WC-nativo. Hook `elementor/query/filtro_camisetas` solo se activa si hay Loop Grid activo — al reemplazarlo, este hook queda inerte. Riesgo reducido a BAJO.
- **functions.php (62KB, ~1712 líneas):** Shortcodes custom (cv_product_meta, cv_explorar, cv_archive_title, cv_archive_intro, cv_short_description, cv_search_latest_products) — todos independientes de Elementor. URL rewrite system robusto con transients. Mini-cart JS usa selectores Elementor Pro que se vuelven no-op al desactivar Pro.
- **Sin woocommerce/ override directory** en child theme — confirmado. Sin template overrides WC.
- **mu-plugins vacío** — Raiola no instala mu-plugins en este plan.
- **ACF solo FREE** — no hay dependencias ACF Pro.
- **Veredicto:** APPROVE_A0_MIGRATION_PLAN_PREP.

**Qué se validó:** `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md` actualizado con estado CPANEL_API_READONLY_DISCOVERY_COMPLETED, inventario completo, análisis de dependencias, riesgos actualizados y veredicto. BACKLOG.md: SERVER_FILESYSTEM_READONLY_DISCOVERY ✅, A0_MIGRATION_PLAN desbloqueado. CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados. Ninguna escritura al servidor. Token no impreso ni commiteado.  
**Qué NO se tocó:** WordPress, WooCommerce, producción, configuración, credenciales, archivos del servidor. Ningún método de escritura UAPI ejecutado.  
**Siguiente paso:** A0_MIGRATION_PLAN — plan técnico completo con el código real disponible. Estimado: 45-60 min sesión siguiente.  
**agent_events ref:** 2026-06-14T21:30:00Z (cpanel_api_readonly_discovery_completed)

---
**Sesión 008b** — 2026-06-13  
**Agente:** Claude Code (Sonnet)  
**Modo:** READ_ONLY  
**Tipo:** close / role-verify / sync  
**Tarea:** Cerrar ventana admin de Sesión 008. Verificar que `catenaccio-studio-agent` volvió a `shop_manager`. Pushear commit documental de Sesión 008. Añadir SERVER_FILESYSTEM_READONLY_DISCOVERY al backlog como prerequisito de A0_MIGRATION_PLAN.

**Decisiones clave:**
- `catenaccio-studio-agent` verificado como `shop_manager` via `GET /wp/v2/users/me?context=edit` → roles: `["shop_manager"]`. Ventana admin cerrada correctamente.
- La migración real no puede planificarse sin conocer la estructura del servidor: child theme existente, archivos Elementor override, plugins custom. Se añade SERVER_FILESYSTEM_READONLY_DISCOVERY como prerequisito antes de A0_MIGRATION_PLAN.
- CARRITO_MICUENTA_QUICKWIN no requiere agente — Pablo puede hacerlo directamente en WP Admin (10 min).
- Commit de Sesión 008 pusheado a origin/main.

**Qué se validó:** rol `shop_manager` confirmado por API GET. `.env.local` confirmado ignorado (`.gitignore:6`). Commit `97d470c` de Sesión 008 pusheado. BACKLOG.md con SERVER_FILESYSTEM_READONLY_DISCOVERY añadido como prerequisito. CONTEXTO.md siguiente paso actualizado. HISTORIAL_SESIONES.md esta entrada. agent_events.jsonl con evento.  
**Qué NO se tocó:** WordPress, configuración, roles, templates, páginas, producción. No se modificó ningún documento de Sesión 008. Ningún write al sitio.  
**Siguiente paso:** Sesión 009 — SERVER_FILESYSTEM_READONLY_DISCOVERY: mapear child theme, plugins custom, archivos override del servidor (vía cPanel File Manager read-only o FTP readonly). Luego A0_MIGRATION_PLAN con contexto real.  
**agent_events ref:** 2026-06-13T23:00:00Z (admin_window_closed_role_verified)
---

---
**Sesión 013b** (2026-06-24, Claude Code Sonnet)

**Modo:** CPANEL_UAPI_READONLY + LOCAL_PATCH / NO_SERVER_WRITE  
**Tipo:** close / blockers / patch  
**Tarea:** Completar los 4 BLOCKERS del tema sombra A0 con código exacto del functions.php activo vía UAPI read-only.

**Decisiones clave:**
- Nuevo token cPanel UAPI activo. Probe OK: `list_files` + `get_file_content` en `hello-elementor-child/functions.php` (1711 líneas, 62501 bytes).
- BLOCKER-A portado: `woocommerce_package_rates` — IVA 21% (riesgo fiscal crítico resuelto).
- BLOCKER-B portado: sistema completo de URLs limpias (13 funciones/hooks: transient 12h categorías + transient 12h productos + reglas top + catch-all bottom + flush diferido + CDN purge + Elementor compat + after_switch_theme + flush_rewrite_rules_hard).
- BLOCKER-C portado: `cv_woo_breadcrumbs_fix_tax_labels` + `cv_custom_single_product_breadcrumb` — lógica Leyendas / Selecciones / Liga+Equipo / Fallback.
- BLOCKER-D portado: `pre_get_posts` carrusel home solo en stock.
- Extras portados: rank_math SEO (description + og:image), búsqueda header (AJAX + shortcode cv_search_latest_products + script enqueue).

**Qué se validó:** `git diff --check` OK. Solo `catenaccio-a0-child/functions.php` modificado (+538 líneas). Sin secretos en archivos. BACKLOG.md THEME_SHADOW_COMPLETE_BLOCKERS marcado ✅. THEME_SHADOW_IMPLEMENT.md §13 añadido.  
**Qué NO se tocó:** servidor, WordPress, wp-config.php, .htaccess, DB, tema activo remoto, plugins activos remotos, hello-elementor-child, .env.local.  
**Siguiente paso:** Sesión 014 — THEME_SHADOW_SYNC: subir `catenaccio-a0-child/` al servidor vía cPanel UAPI write (Fileman/save_file_content) o ZIP manual Pablo.  
**agent_events ref:** 2026-06-24T00:00:00Z (theme_shadow_complete_blockers)
---

---
**Sesión 014-sync** — 2026-06-27
**Agente:** Codex
**Modo:** CPANEL_UAPI_WRITE_TO_SHADOW_ONLY / NO_ACTIVE_SITE_WRITE
**Tipo:** AGENT_REQUIRED / server-sync / shadow-theme
**Tarea:** THEME_SHADOW_SYNC — sincronizar el paquete local `catenaccio-a0-child/` al servidor como tema sombra inactivo.

**Decisiones clave:**
- Se ejecuto el sync solo bajo `public_html/wp-content/themes/catenaccio-a0-child/`.
- No se activo el tema y no se uso WordPress Admin.
- `HEAD == origin/main` al inicio, con `e634a4a` como commit vigente. El prompt esperaba `cb8703a`, pero la diferencia era un commit documental posterior (`docs/meta/LAFABRICA_ADOPTION.md`) ya sincronizado en `origin/main`, sin divergencia.
- `save_file_content` produjo mismatch determinista en `header.php` por normalizacion del `<meta charset>` en read-back; `upload_files` no sobrescribio existentes. El sync final verificado uso API2 `Fileman::savefile` y hash read-back.
- Se ajusto localmente `header.php` a `<meta charset="utf-8">` para hash determinista. Cambio limitado al tema sombra inactivo.

**Qué se validó:** repo limpio/sin divergencia antes del sync; paquete local con exactamente 9 archivos; `style.css` local/remoto con `Theme Name: Catenaccio A0 Child` y `Template: hello-elementor`; `.env.local` ignorado y no trackeado; variables cPanel presentes sin imprimir valores; UAPI read-only OK; 9 archivos remotos con hashes local/remoto OK; `hello-elementor-child` intacto (nombres, tamaños y mtime iguales).
**Qué NO se tocó:** tema activo `hello-elementor-child`, WordPress Admin, activacion de tema, DB, plugins, `wp-config.php`, `.htaccess`, uploads, WooCommerce settings, pagos, `.env.local`. No se hicieron deletes, chmod, rename ni move.
**Siguiente paso:** THEME_SHADOW_VISUAL_VALIDATION con Antigravity.
**agent_events ref:** 2026-06-27T00:00:00Z (theme_shadow_sync_completed)
---

---
**Sesión 015** — 2026-06-27  
**Agente:** Antigravity  
**Modo:** ANTIGRAVITY_VISUAL_READONLY  
**Tipo:** READ_ONLY / shadow-theme-validation  
**Tarea:** Validar visualmente el tema sombra inactivo `catenaccio-a0-child` ya sincronizado en servidor, sin activarlo.

**Decisiones clave:**
- El Customizer de WordPress (`wp-admin/customize.php?theme=catenaccio-a0-child`) no se pudo cargar desde el navegador headless por bloqueo del firewall del proveedor de hosting Raiola Networks (error de seguridad por petición de login incorrecta).
- El parámetro de preview en la URL del frontend `?theme=catenaccio-a0-child` es ignorado por WordPress para usuarios no autenticados, sirviendo el tema activo por defecto (`hello-elementor-child`).
- Se confirmó mediante llamadas directas HTTPS (200 OK) que los archivos del tema sombra (`style.css` y `assets/css/cv-a0.css`) están correctamente subidos e intactos en el servidor.
- Veredicto: **STOP**. El agente no puede previsualizar de forma segura el tema sombra sin activarlo. La validación visual final debe ser realizada manualmente por el operador (Pablo) desde su navegador autenticado.

**Qué se validó:** El repositorio local está limpio (HEAD esperado `9789693`). Los archivos del tema sombra existen y se acceden en el servidor. Capturadas capturas de pantalla de la denegación del Customizer y de la home.
**Qué NO se tocó:** tema activo, activación de tema, WordPress Admin settings, Elementor, plugins, WooCommerce settings, pagos, DB, cPanel, archivos servidor, .env.local.
**Siguiente paso:** Pablo realiza la validación visual manualmente usando customize URL en su navegador y procede al release manual.
**agent_events ref:** 2026-06-27T13:30:00Z (theme_shadow_validation_blocked)
---

---
**Sesión 016** — 2026-06-27  
**Agente:** Claude Code (Sonnet)  
**Modo:** LOCAL_CODE_ONLY / SHADOW_THEME_VISUAL_FIX  
**Tipo:** fix / visual-polish  
**Tarea:** Corregir blockers visuales del tema sombra `catenaccio-a0-child` detectados por Pablo en preview manual (Sesión 015 / STOP).

**Decisiones clave:**
- Mini-cart: `woocommerce_mini_cart()` se movió de inline a dropdown contenido con trigger button (icono + contador). La causa raíz era que la función vuelca contenido de carrito directamente en el header, no como widget/dropdown.
- Toggle off-canvas en desktop: se añadió `@media (min-width: 769px) { display: none !important; }` para beat de estilos del parent theme en preview del Customizer.
- Off-canvas overflow: `overflow-x: hidden` en panel + word-break en headings/links del inner.
- `functions.php` no modificado — todos los fixes resueltos con CSS/markup/JS según preferencia del proyecto.
- PHP lint NOT_AVAILABLE (PHP CLI no en PATH), declarado explícitamente.

**Qué se validó:** `git diff --check` PASS. 3 archivos modificados, todos dentro de scope (`catenaccio-a0-child/`). Secret scan CLEAN. Ningún shortcode literal añadido. Sin dependencias Elementor. Sin referencias absolutas locales.  
**Qué NO se tocó:** `hello-elementor-child`, `functions.php`, servidor, cPanel, WP Admin, DB, plugins, WooCommerce settings, pagos, `.env.local`, woocommerce templates (archive/content/single).  
**Siguiente paso:** Resync a servidor de 3 archivos modificados (Codex) → Pablo repite preview manual → si PASS → RELEASE_MANUAL_PABLO.  
**agent_events ref:** 2026-06-27T16:00:00Z (theme_shadow_visual_blockers_fix)
---

---
**Sesión 017** — 2026-06-27
**Agente:** Codex
**Modo:** CPANEL_UAPI_WRITE_TO_SHADOW_ONLY / 3_FILE_RESYNC / NO_ACTIVE_SITE_WRITE
**Tipo:** server-sync / shadow-theme / visual-fix-resync
**Tarea:** THEME_SHADOW_VISUAL_FIX_RESYNC — resincronizar al servidor solo los 3 archivos modificados por la Sesión 016 dentro del tema sombra `catenaccio-a0-child`.

**Decisiones clave:**
- Gate Git exacto confirmado tras `git fetch`: rama `main`, working tree limpio, `main...origin/main [ahead 2]`, commits pendientes `8816843` y `4b10102`, `origin/main` inicial en `9789693`.
- Push inicial OK: `origin/main` quedo en `4b10102`.
- Sync remoto limitado a `public_html/wp-content/themes/catenaccio-a0-child/` y a 3 archivos: `header.php`, `assets/css/cv-a0.css`, `assets/js/cv-a0.js`.
- Variables cPanel presentes sin imprimir valores; `CPANEL_ALLOWED_ROOT` validado como `public_html/wp-content`.
- Se uso API2 `Fileman::savefile` y UAPI `Fileman/get_file_content` para read-back hash.

**Qué se validó:** hashes local/remoto OK para los 3 archivos (`11217427cc76`, `95e766686d5f`, `07ce8a905e4a`); `style.css` remoto mantiene `Theme Name: Catenaccio A0 Child` y `Template: hello-elementor`; `hello-elementor-child` intacto por nombres, tamaños y mtime.
**Qué NO se tocó:** tema activo `hello-elementor-child`, activación de tema, WP Admin, DB, plugins, WooCommerce settings, pagos, `wp-config.php`, `.htaccess`, uploads, `.env.local`.
**Siguiente paso:** Pablo repite preview manual en Customizer con tema `catenaccio-a0-child`.
**agent_events ref:** 2026-06-27T17:00:00Z (theme_shadow_visual_fix_resync)
---

---
**Sesión 018** — 2026-06-27
**Agente:** Claude Code (Opus 4.8)
**Modo:** STRATEGIC / DOCS_ONLY — STRATEGIC_ROADMAP_OPUS
**Tipo:** strategic
**Tarea:** Decidir la hoja de ruta estratégica 30/60/90 días de Catenaccio Vintage tras el `KILL_CURRENT_A0_RELEASE_LINE` del orquestador y la renovación de hosting/dominio.

**Decisiones clave:**
- **Veredicto: `APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE` (RUTA D).** Construir Catenaccio Studio (backoffice propio Supabase + Next.js/Vercel) primero; WooCommerce/WooPayments se mantienen como tienda+checkout; Studio publica borradores vía WC API (puente DEC-9). Storefront público en Next.js diferido hasta tracción. DEC-13 registrada.
- **A0 CONGELADO** (no borrado): `catenaccio-a0-child` queda como referencia/aprendizaje y contingencia. Bucle de validación visual detenido (consumió ~7 sesiones sin converger — RULE-01).
- **Insight 1:** la causa raíz de la fricción de Pablo es el **backoffice** (Sesión 005b), no el frontend. Las sesiones 011–017 pulieron el frontend que no dolía.
- **Insight 2:** Elementor Pro caduca pero **no rompe la tienda** (los widgets ya colocados siguen renderizando; deadline blando). Esto des-urgentiza y hace segura la pausa de A0. No se renueva.
- **Arquitectura:** Supabase = fuente de verdad del inventario; WooCommerce = destino de publicación; Vercel = app interna YA, storefront público DESPUÉS.
- **Token budget:** Opus (estrategia/arquitectura/gates), Sonnet (grueso impl. + docs), Codex (código mecánico con spec), Antigravity (QA visual del Studio — ahora viable en Vercel, sin firewall Raiola). Gate duro: revisión fría a 3 sesiones sin publicar 1 camiseta E2E; STOP_AND_REPLAN a ~4 sesiones sin MVP usable.

**Qué se validó:** repo limpio, sin divergencia remota (`0/0` ahead/behind tras `git fetch`); lectura proporcional (CONTEXTO, DECISIONS, BACKLOG, STOCK_OPERATIONS_MODEL, LAFABRICA_ADOPTION, THEME_SHADOW_VISUAL_FIX_RESYNC, HISTORIAL tail); 5 rutas (A–E) evaluadas y descartadas las 4 alternativas con razón explícita.
**Qué NO se tocó:** WordPress, WP Admin, cPanel, servidor, DB, plugins, temas (`catenaccio-a0-child` y `hello-elementor-child` intactos), WooCommerce settings, pagos, `.env.local`; no deploy; no se creó código de Studio (solo documentación estratégica); no se creó Supabase ni Vercel.
**Siguiente paso:** Pablo confirma DEC-13 → S019 STUDIO_DATA_MODEL (esquema Supabase). Push pendiente de OK explícito de Pablo (cierre documental).
**agent_events ref:** 2026-06-27T19:00:00Z (strategic_roadmap_opus_route_d)
---

SesiÃ³n 020B (2026-06-27, Codex): CODEX_CONTROLLED_PRODUCTION_TEST / DRAFT_ONLY / NO_CONFIG_CHANGE / WC_API_WRITE_ACCESS_TEST. **Test controlado de escritura WooCommerce completado por API.** Precheck: `.env.local` presente, `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` presentes sin imprimir valores; `GET /wp-json/wp/v2/users/me?context=edit` HTTP 200 con `catenaccio-studio-agent` y rol/capacidad WooCommerce validos. Term IDs: `pa_liga` id=5 con LaLiga=72, `pa_equipo` id=4 con Francia=129, `pa_ano` id=7 con 2014-15=139. Write: se ejecuto exactamente 1 `POST /wp-json/wc/v3/products`, HTTP 201, producto ID 1853, `status=draft`, nombre `[STUDIO TEST]...`, `regular_price="1"` y `meta_data` requerida confirmada. Post-write: `GET /wp-json/wc/v3/products/1853` HTTP 200 confirmo `status=draft` y `meta_data` completa. No se ejecuto DELETE ni cleanup automatico. Veredicto: APPROVE_WC_API_WRITE_ACCESS_TEST_PASSED. Pendiente: Pablo verifica en WP Admin -> Productos -> Borradores y elimina manualmente el producto test ID 1853 antes de S021. No se tocaron WordPress settings, WooCommerce settings, pagos, pedidos, clientes, productos reales, plugins, temas, cPanel, Supabase remoto, Vercel, `.env.local` ni credenciales.

---
**Sesión 020C** — 2026-06-27
**Agente:** Codex
**Modo:** SUPABASE_SCHEMA_APPLY_MVP / CONTROLLED_REMOTE_DB_WRITE / NO_APP_CODE
**Tipo:** gate / remote-db-apply-precheck
**Tarea:** Aplicar de forma controlada el schema MVP de Catenaccio Studio en Supabase o parar si no existe vía segura sin secretos.

**Resultado:** BLOCKED — STOP_MANUAL_APPLY_REQUIRED.

**Qué se hizo:** Se validó estáticamente `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`: 7 enums, 6 tablas, 18 índices, 1 vista (`inventory_margins`), 6 `ENABLE ROW LEVEL SECURITY`, 6 policies owner; sin SQL destructivo activo ni secretos reales. Se creó `scripts/studio/verify_supabase_schema_mvp.sql` para verificación read-only post-apply y `docs/studio/SUPABASE_SCHEMA_APPLY_MVP_RESULT.md`.

**Qué se validó:** repo limpio y sincronizado al inicio (`main`, 0 ahead/0 behind, HEAD `5216896`); Supabase CLI ausente; `psql` ausente; `.env.local` no leído ni modificado; cleanup del producto test ID 1853 documentado como completado por confirmación manual de Pablo; `agent_events.jsonl` parseable.

**Qué NO se tocó:** WordPress, WooCommerce, productos reales, pedidos, clientes, pagos, plugins, temas, cPanel, Vercel, app Next.js, `.env.local`, credenciales, `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`.

**Siguiente paso:** Pablo aplica manualmente `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql` en Supabase SQL Editor y devuelve success/error; si success, ejecuta `scripts/studio/verify_supabase_schema_mvp.sql` y devuelve solo PASS/FAIL.
**agent_events ref:** 2026-06-27T23:00:00Z (supabase_schema_apply_mvp_manual_required)

---
**Sesión 020D** — 2026-06-27
**Agente:** Codex
**Modo:** DOCS_ONLY / MANUAL_APPLY_CLOSE / NO_REMOTE_WRITE
**Tipo:** close-gate / operator-confirmed-manual-apply
**Tarea:** Cerrar documentalmente `SUPABASE_SCHEMA_APPLY_MVP` tras aplicación manual por Pablo en Supabase SQL Editor.

**Resultado:** COMPLETED — APPROVE_READY_FOR_S021_MVP_SCAFFOLD.

**Qué se hizo:** Se registró que Pablo aplicó manualmente `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql` en Supabase SQL Editor con resultado SUCCESS y ejecutó manualmente `scripts/studio/verify_supabase_schema_mvp.sql` con resultado `OPERATOR_CONFIRMED_PASS`. Se actualizó `docs/studio/SUPABASE_SCHEMA_APPLY_MVP_RESULT.md`, BACKLOG, CONTEXTO, HISTORIAL y `agent_events.jsonl`.

**Qué se validó:** preflight git limpio en `main`, 0 ahead/0 behind, HEAD `c9f78f7`; `git fetch --dry-run` sin divergencia; agent_events JSONL parseable; secret scan sobre diff sin secretos reales; scope limitado a los archivos permitidos.

**Qué NO se tocó:** Supabase remoto por agente, SQL ejecutado por agente, Supabase CLI, psql, WordPress, WooCommerce, productos WC, pedidos, clientes, pagos, Vercel, cPanel, app Next.js, `.env.local`, credenciales, SQL canónico y script verificador.

**Siguiente paso:** S021 — STUDIO_MVP_SCAFFOLD.
**agent_events ref:** 2026-06-27T23:30:00Z (supabase_schema_apply_mvp_manual_confirmed)

---
**Sesión 021** — 2026-06-27  
**Agente:** Claude Code (Sonnet)  
**Modo:** LOCAL_APP_IMPLEMENTATION / NO_DEPLOY / NO_WC_WRITE  
**Tipo:** impl / scaffold  
**Tarea:** Crear el scaffold MVP local de Catenaccio Studio — app Next.js en `studio/` con auth Supabase, vista de inventario protegida, empty/error state, y cierre documental completo.

**Decisiones clave:**
- App aislada en `studio/` (Next.js 15.5.19, App Router, TypeScript strict, React 19).
- Auth via Supabase magic link (OTP email) — sin hardcoding de usuario, sin contraseñas.
- `@supabase/ssr` 0.5.2 para server/browser client separation limpia.
- Middleware en `studio/middleware.ts` protege `/inventory/*` — redirige a `/login` si no hay sesión.
- `CookieOptions` importado de `@supabase/ssr` para resolver implicit any en TypeScript strict.
- CSS puro (sin Tailwind, sin shadcn) — MVP backoffice claro y rápido de arrancar.
- `/inventory/[id]` implementado como read-only — S022 añadirá edición y publicación.
- Next.js 15.3.4 tenía CVE-2025-66478 — actualizado a 15.5.19 (patched).
- postcss CVE transitiva aceptada para MVP local (fix requeriría downgrade a Next 9).

**Qué se validó:** typecheck PASS (0 errores). build PASS (7 rutas). lint PASS (0 warnings). git diff --check OK. Secret scan: CLEAN. Scope check: CLEAN. Solo `studio/`, docs de cierre y archivos operativos permitidos modificados.  
**Qué NO se tocó:** WordPress, WooCommerce API, productos/pedidos/clientes/pagos, cPanel, Vercel remoto, Supabase schema/SQL, service_role key, .env.local, temas, plugins, wp-config.php, .htaccess, catenaccio-a0-child.  
**Siguiente paso:** S022 — STUDIO_CREATE_AND_PUBLISH. Antes: Pablo lanza Studio local, hace login con magic link, verifica empty state y confirma APPROVE_READY.  
**agent_events ref:** 2026-06-27T23:59:00Z (studio_mvp_scaffold_completed)
---

---
**Sesion 021B** - 2026-06-27
**Agente:** Codex
**Modo:** DOCS_AND_SCHEMA_PATCH_ONLY / NO_REMOTE_WRITE / NO_APP_CODE
**Tipo:** close-gate / visual-review / schema-doc-patch
**Tarea:** STUDIO_VISUAL_REVIEW_AND_RLS_GRANTS_CLOSE - documentar el PASS visual local de Pablo y corregir el SQL canonico con GRANTs para `authenticated`.

**Resultado:** COMPLETED - APPROVE_READY_FOR_S022_CREATE_AND_PUBLISH.

**Que se hizo:** Se registro `STUDIO_VISUAL_REVIEW_PABLO = PASS`, se creo `docs/studio/STUDIO_VISUAL_REVIEW_RESULT.md`, se agrego el bloque `GRANTS` a `docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql`, y se actualizaron docs de RLS, scaffold, runbook, apply result, BACKLOG, CONTEXTO y `agent_events.jsonl`.

**Que se valido:** preflight git limpio y sincronizado en `main`, HEAD `de1c384`; `git diff --check` PASS; `agent_events.jsonl` parseable; secret scan CLEAN; scope check CLEAN; SQL contiene GRANTs a `authenticated`, no contiene GRANT a `anon`, RLS sigue enabled y las policies owner-based siguen presentes.

**Que NO se toco:** Supabase remoto por agente, SQL ejecutado por agente, app code, WordPress, WooCommerce, Vercel, cPanel, `.env.local`, credenciales.

**Siguiente paso:** S022 - STUDIO_CREATE_AND_PUBLISH.
**agent_events ref:** 2026-06-27T23:59:30Z (studio_visual_review_and_rls_grants_closed)
---

---
**Sesion 021C** - 2026-06-27
**Agente:** Codex
**Modo:** DOCS_ONLY / MANUAL_SEED_CLOSE / NO_REMOTE_WRITE
**Tipo:** close-gate / manual-seed / docs-only
**Tarea:** WORKSPACE_SEED_MANUAL_CLOSE - registrar el PASS manual del seed de workspace sin pedir ni registrar auth.uid.

**Resultado:** COMPLETED - APPROVE_READY_FOR_S022_CREATE_AND_PUBLISH.

**Que se hizo:** Se registro `WORKSPACE_SEED_MANUAL = PASS`, se creo `docs/studio/WORKSPACE_SEED_MANUAL_RESULT.md`, se marco `WORKSPACE_SEED_MANUAL` como completado en BACKLOG y se dejo S022 como NEXT / UNBLOCKED.

**Que se valido:** preflight git limpio y sincronizado en `main`, HEAD `b7ea49f`; `git diff --check` PASS; `agent_events.jsonl` parseable; secret scan CLEAN; scope check CLEAN; no auth.uid real registrado.

**Que NO se toco:** Supabase remoto por agente, SQL ejecutado por agente, app code, WordPress, WooCommerce, Vercel, cPanel, `.env.local`, credenciales, auth.uid.

**Siguiente paso:** S022 - STUDIO_CREATE_AND_PUBLISH.
**agent_events ref:** 2026-06-27T23:59:45Z (workspace_seed_manual_closed)
---

---
**Sesión 021D** - 2026-06-27
**Agente:** Claude Code Opus
**Modo:** READ_ONLY_STRATEGIC_REVIEW / NO_IMPLEMENTATION / NO_REMOTE_WRITE
**Tipo:** revisión estratégica / pre-S022 / veredicto binario
**Tarea:** STUDIO_STRATEGIC_REVIEW_BEFORE_S022 - revisar si la ruta Studio + Supabase + Woo Draft Bridge sigue alineada con las necesidades reales antes de construir S022, y emitir veredicto estratégico único.

**Resultado:** COMPLETED - veredicto `ADJUST_BEFORE_S022`.

**Qué se hizo:** Revisión proporcional read-only de DECISIONS (DEC-13/DEC-14), BACKLOG, CONTEXTO, contrato del puente WC, scaffold MVP, runbook, modelo AI-first, y verificación del baseline de seguridad directamente en el código del scaffold (`studio/lib/supabase/server.ts`, `middleware.ts`, `.env.example`, `package.json`). Conclusión: la ruta DEC-13/DEC-14 es correcta y está ejecutada al pie de la letra (sin deriva, sin deuda que justifique replantear); el único problema es el **tamaño de S022**, que agrupa 3 clases de riesgo (insert local + Anthropic API + escritura WC a producción) y 2 secretos nuevos en un solo bloque. Se divide S022 en S022A (formulario→Supabase) → S022B (Claude shadow-only) → S022C (Woo Draft DRAFT_ONLY, única sesión que escribe en `catenacciovintage.com`); deploy Vercel **diferido** a después del E2E (S020B ya probó acceso WC desde local → deploy no de-riesga el puente). Creado `docs/studio/STUDIO_STRATEGIC_REVIEW_BEFORE_S022.md` (10 secciones); BACKLOG dividido en S022A/B/C/D con criterios de parada y veredictos esperados; CONTEXTO y agent_events appendeados.

**Qué se validó:** preflight git limpio y sincronizado en `main`, HEAD `a0c73d6`, 0 ahead / 0 behind; baseline de seguridad CLEAN en código (anon key + RLS owner-based; sin `service_role`, `ANTHROPIC_API_KEY` ni `WP_APP_*` en el árbol de la app); alineación total con DEC-13 (Studio-first, Woo bridge, A0 congelado, storefront diferido) y DEC-14 (DRAFT_ONLY, Application Password server-side, meta_data ACF, idempotencia). `git diff --check` PASS; `agent_events.jsonl` parseable; secret scan CLEAN; scope check CLEAN.

**Qué NO se tocó:** `studio/` (app code), SQL canónico, Supabase remoto, WooCommerce, WordPress, WP Admin, cPanel, Vercel, `.env.local`, credenciales. No se ejecutó SQL, ni deploy, ni llamadas remotas, ni implementación.

**Decisión de secuencia:** S022A es la siguiente sesión (superficie Sonnet/Codex, local, sin deploy). Frontera dura: solo S022C escribe en producción y va sola. Fusión S022A+S022B permitida si el formulario es pequeño. Guardrails reafirmados: DRAFT_ONLY, SHADOW_FIRST, secretos server-side only, idempotencia, progreso lineal (bucle de rework → STOP_AND_REPLAN), no Opus para implementación.

**Siguiente paso:** S022A - STUDIO_CREATE_ITEM_FORM.
**agent_events ref:** 2026-06-28T00:30:00Z (studio_strategic_review_before_s022)
---

Sesión 022A (2026-06-28, Claude Code Sonnet): LOCAL_APP_IMPLEMENTATION / NO_DEPLOY / NO_WC / NO_AI — STUDIO_CREATE_ITEM_FORM. **Primer flujo operativo real de Catenaccio Studio implementado.** Rutas: `/inventory/new` (creada), `/inventory` (actualizada — botón nueva camiseta, query ampliada), `/inventory/[id]` (actualizada — precio objetivo, jugador, dorsal, características, notas). Archivos creados: `studio/app/inventory/actions.ts` (Server Action), `studio/app/inventory/new/page.tsx`, `studio/components/ItemForm.tsx` (Client Component useActionState React 19), `docs/studio/STUDIO_CREATE_ITEM_FORM_RESULT.md`. Archivos modificados: `studio/lib/types.ts` (FootballShirtDetails, InventoryItemWithDetails añadidos), `studio/app/inventory/page.tsx`, `studio/app/inventory/[id]/page.tsx`, `studio/components/EmptyState.tsx` (link nueva camiseta), `studio/styles/globals.css` (clases formulario), `studio/eslint.config.mjs` (ignores .next/**). Escribe en `inventory_items` + `football_shirt_details` vía anon key + RLS owner-based. Validaciones técnicas: typecheck PASS, build PASS (8.7s, 8 rutas), lint PASS (0 errores), git diff --check PASS, JSONL VALID, secret scan CLEAN, scope CLEAN (solo studio/). Veredicto: READY_FOR_PABLO_LOCAL_FORM_OK. No se tocó: WooCommerce, WordPress, Anthropic, Vercel, cPanel, SQL, service_role, .env.local, credenciales, producción. Siguiente: Pablo valida localmente → PABLO_LOCAL_FORM_OK → S022B.

---
**Sesion 022A.2A** - 2026-06-28
**Agente:** Codex
**Modo:** DOCS_ONLY / MANUAL_SCHEMA_PATCH_CLOSE / NO_REMOTE_WRITE
**Tipo:** close-gate / manual-schema-patch / docs-only
**Tarea:** STUDIO_DOMAIN_SCHEMA_PATCH_CLOSE - registrar que Pablo ejecuto manualmente el schema patch de dominio para football_shirt_details.

**Resultado:** COMPLETED - APPROVE_READY_FOR_S022A2B_UI_PATCH.

**Que se hizo:** Se registro S022A.2A_SCHEMA_PATCH: PASS confirmado por Pablo. Se creo docs/studio/STUDIO_DOMAIN_SCHEMA_PATCH_RESULT.md, se marco S022A.2A como completado en BACKLOG, se dejo S022A.2B como NEXT / UNBLOCKED y se mantuvo S022B bloqueado hasta PABLO_LOCAL_FORM_OK.

**Que se valido:** preflight git limpio y sincronizado en main, HEAD 469f39f; docs/studio/STUDIO_SUPABASE_SCHEMA_MVP.sql contiene product_type, shirt_version, authenticity_type, sleeve_length y sponsor; version_camisa queda descartado; CFS queda documentado como referencia comparativa, no fuente de verdad; Catenaccio Vintage sigue como estructura base.

**Que NO se toco:** studio/, Supabase remoto por agente, SQL ejecutado por agente, Supabase CLI, psql, WooCommerce API, WordPress, WP Admin, cPanel, Vercel, Anthropic API, .env.local, credenciales, secretos.

**Siguiente paso:** S022A.2B - FORM_DOMAIN_UX_PATCH local/no Woo/no AI.
**agent_events ref:** 2026-06-28T09:10:00Z (studio_domain_schema_patch_closed)
---

---
**Sesion 022A.2B** - 2026-06-28
**Agente:** Claude Code Sonnet
**Modo:** LOCAL_APP_IMPLEMENTATION / NO_DEPLOY / NO_WC / NO_AI
**Tipo:** impl / form-domain-ux-patch / create-edit
**Tarea:** STUDIO_FORM_DOMAIN_UX_PATCH

**Resultado:** READY_FOR_PABLO_VALIDATION. Veredicto READY_FOR_PABLO_LOCAL_FORM_OK.

**Que se hizo:**
- studio/lib/wc-terms-mvp.ts creado: opciones canonicas (liga, equipo 60+, temporada 36 seasons, marca, talla, condicion, productType, shirtVersion, authenticityType, sleeveLength) + resolveTermId().
- studio/lib/title-builder.ts creado: buildTitle() puro. Regla: [Season] [Team] [Auth-if-not-Replica] [Version] [L/S] [Shirt/GK-Shirt/ProductType] - [Player] #[Number] - ([Size]).
- studio/components/ItemForm.tsx reescrito: inputs controlados React useState, 4 secciones, selects/datalists por campo, titulo autogenerado en tiempo real, override manual con badge, boton Regenerar, mode create/edit.
- studio/app/inventory/actions.ts: createInventoryItem refactorizado + updateInventoryItem anadido (owner_id + RLS).
- studio/app/inventory/[id]/edit/page.tsx creado: ruta de edicion.
- studio/app/inventory/[id]/page.tsx: boton Editar + campos nuevos.
- studio/styles/globals.css: estilos title-preview, btn-regenerate, manual-badge, detail-top-row.

**Que se valido:** typecheck PASS, build PASS (8 rutas), lint PASS, diff --check PASS, secret scan CLEAN, scope CLEAN.

**Que NO se toco:** WooCommerce, WordPress, Anthropic, Vercel, cPanel, Supabase SQL, .env.local, service_role, produccion.

**Siguiente paso:** Pablo valida local -> PABLO_LOCAL_FORM_OK -> S022B desbloqueado.
**agent_events ref:** 2026-06-28T12:00:00Z (studio_form_domain_ux_patch)
---

---
**Sesion 022A.2C** - 2026-06-28
**Agente:** Claude Code Sonnet
**Modo:** LOCAL_APP_PATCH / NO_DEPLOY / NO_WC / NO_AI
**Tipo:** patch / form-domain-labels-options / ux-refinement
**Tarea:** STUDIO_FORM_DOMAIN_LABELS_AND_CANONICAL_OPTIONS_FIX

**Resultado:** READY_FOR_PABLO_VALIDATION. Veredicto: READY_FOR_PABLO_LOCAL_FORM_OK.

**Que se hizo:**
- studio/lib/wc-terms-mvp.ts: TermOption extendida (value?, titleLabel?, helpText?); "Replica" → "Original retail / Fan version" con value:'Replica'; "No determinado" anadido; "Deadstock / BNWT" y "Player Issue / Authentic" con titleLabels. Todas las listas ordenadas alfabeticamente (excepto tallaOptions por escala). PSV Eindhoven titleLabel:'PSV', PSG titleLabel:'PSG'. getTitleLabel() exportada.
- studio/lib/title-builder.ts: comentario actualizado; logica de filtraje 'Replica' mantenida como fallback.
- studio/components/ItemForm.tsx: Liga convertida a datalist libre, Marca convertida a datalist libre. Select Autenticidad usa value={o.value ?? o.label}. computedTitle usa getTitleLabel() para equipo y autenticidad. Helpers anadidos: selecciones nacionales, autenticidad, terminos manuales. .field-help via CSS.
- studio/app/inventory/actions.ts: esReplica reconoce 'Replica' y 'Original retail / Fan version'.
- studio/styles/globals.css: clase .field-help anadida.
- docs/studio/STUDIO_FORM_DOMAIN_LABELS_OPTIONS_FIX_RESULT.md creado.
- BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md, agent_events.jsonl actualizados.

**Que se valido:** typecheck PASS (0 errores), build PASS (8 rutas), lint PASS (0 warnings/errors), git diff --check exit 0, secret scan CLEAN, scope CLEAN (sin schema/Woo/WP/Anthropic/deploy/.env.local).

**Que NO se toco:** WooCommerce, WordPress, Anthropic, Vercel, cPanel, Supabase SQL, .env.local, service_role, produccion, S022B (sigue bloqueado).

**Siguiente paso:** Pablo valida local: formulario /inventory/new, comprueba "Original retail / Fan version", entrada manual de liga/marca, titulo con "PSV" para PSV Eindhoven. Responde PABLO_LOCAL_FORM_OK o blockers concretos. Si OK → S022B desbloqueado.
**agent_events ref:** 2026-06-28 (studio_form_domain_labels_options_fix)
---
