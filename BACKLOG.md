# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [x] **TARGET_OPTIONS APROBADO** — 2026-06-13 (Sesión 005d). Operador aprueba A0 + B1. Marketplace = NORTH_STAR / DEFER. Ver `docs/discovery/TARGET_OPTIONS.md`.
- [x] **CMS_API_ACCESS_MODEL_READONLY** — modelo de acceso sin SSH definido en `docs/operations/ACCESS_MODEL_NO_SSH.md` (Sesión 006). Guía paso a paso lista en §6.
- [x] **B1_STOCK_OPERATIONS_MODEL** — modelo operativo de stock definido en `docs/operations/STOCK_OPERATIONS_MODEL.md` (Sesión 006c). Contexto capturado para B1 — no bloquea A0 ni la activación del acceso.
- [x] **ACCESS_MODEL_ACTIVATION_READONLY** — completado. Usuario `catenaccio-studio-agent` con rol `shop_manager`. `.env.local` configurado y verificado. Acceso WC REST API v3 confirmado.
- [x] **WP_WC_API_READONLY_PROBE** — probe completo (público + autenticado). Sesiones 007/007b. Credenciales OK: `catenaccio-studio-agent`, rol `shop_manager`. 28 productos, 7 atributos WC, Elementor Pro `isExpired:false`, 14 templates listados. **Hallazgo crítico: productos usan ACF meta fields (no WC attributes[]).** Ver `docs/operations/API_READONLY_PROBE_RESULT.md`.
- [x] **A0_ELEMENTOR_DEPENDENCY_AUDIT** — completado sesión 008. Widget-level audit completo: 17 templates + 2 páginas WC auditadas. 15/20 requieren migración. Ver `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md`. Hallazgo: Carrito/Mi Cuenta usan Pro (no Blocks); Finalizar Compra SÍ está en Blocks ✅.
- [x] **GSC_API_READONLY_CONNECTOR / SEARCH_CONSOLE_API_READONLY** — completado Sesión 009 (2026-06-14). Google Search Console API integrada en modo read-only. Script, requirements y docs versionados. `.secrets/` ignorado. Patrón reusable candidato para lafabrica: `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN`. Ver `docs/operations/SEARCH_CONSOLE_API_READONLY.md`.
- [x] **SERVER_FILESYSTEM_READONLY_DISCOVERY** — **COMPLETADO** vía cPanel UAPI Token (Sesión 010B, 2026-06-14). 4 archivos leídos: `functions.php` (62KB), `style.css`, `filtro-camisetas.php` (39KB), `catenaccio-offcanvas-menu.php` (14KB). 22 plugins listados. Inventario completo en `docs/operations/SERVER_FILESYSTEM_READONLY_DISCOVERY.md`. **Veredicto: APPROVE_A0_MIGRATION_PLAN_PREP.** Script reutilizable: `scripts/filesystem/cpanel_uapi_probe.py`.
- [ ] **CPANEL_TOKEN_REVOCATION** — Pablo revoca el token cPanel API usado en Sesión 010B. Acción manual sin agente. Prerequisito antes de cualquier siguiente acceso servidor. (Acción Pablo, sin agente)
- [x] **A0_MIGRATION_PLAN** — plan técnico PHP child theme para P1-A (header), P1-B (producto individual), P1-C (archivo productos). **COMPLETADO** sesión 011 (2026-06-20). Ver `docs/operations/A0_MIGRATION_PLAN.md`.
- [ ] **CARRITO_MICUENTA_QUICKWIN** — Pablo reemplaza widgets Pro (`woocommerce-cart`, `woocommerce-my-account`) por shortcodes en Elementor. 10 min en WP Admin. Ver audit §6 P2-B/C. No requiere agente.
- [ ] **Arreglar OPcache (PROB-09)** — Pablo abre ticket a Raiola para aumentar `opcache.memory_consumption`. Acción paralela, sin agente.

---

## NEXT — Próximo mes

**Alineación Operating Brain + Lafabrica (completado sesión 014 — referencia para próximas sesiones):**
- [x] **ALIGN_WITH_OPERATING_BRAIN_AND_LAFABRICA_V1** — absorbidas RULE-01 a RULE-05, DEC-PABLO-01 a DEC-PABLO-03, PATTERN-05 a PATTERN-09. Archivos modificados: ORCHESTRATOR.md §19, AGENTS.md, DECISIONS.md DEC-12, BACKLOG.md, CONTEXTO.md. Creado: `docs/meta/AGENT_EXPERIENCE_LEDGER.md`. (Sesión 014, 2026-06-24)
- [ ] **ACTIVE_CONTEXT_PACK_AND_READING_RECIPES** — crear `docs/meta/ACTIVE_CONTEXT_PACK.md` y `docs/meta/READING_RECIPES.md` (PATTERN-05). Activar cuando el proyecto supere 25-30 sesiones o cuando el arranque consuma >20% del presupuesto de tokens. No urgente ahora.
- [ ] **WP_MAIL_SMTP_GATE_SETUP** — antes de cualquier tarea de email transaccional WooCommerce (confirmaciones de pedido, activación de cuenta): verificar si WP Mail SMTP está instalado y configurado en producción. Si no → esa es la primera tarea. Prerequisito de PRODUCTION_ONLY_VALIDATION. (DEC-12 / RULE-03)

**Shadow Release (flujo NO_SSH — después de A0_MIGRATION_PLAN):**
- [x] **THEME_SHADOW_SCAFFOLD** — contrato técnico del tema sombra `catenaccio-a0-child` completado. Árbol de archivos aprobado, inventario de hooks/shortcodes a portar, estrategia functions.php (APPROVE_MINIMAL_PORT), scaffolds de header/single-product/archive con HTML de referencia, clases CSS/JS propuestas, auditoría DOM/JS pendiente, 12 riesgos documentados. Ver `docs/operations/THEME_SHADOW_SCAFFOLD.md`. (Sesión 012, 2026-06-20)
- [x] **THEME_SHADOW_IMPLEMENT** — implementado localmente (Sesión 013, 2026-06-20). 9 archivos creados en `catenaccio-a0-child/`. Veredicto: APPROVE_READY_FOR_SYNC (layout) + FIX_BLOCKER_FIRST (producción). Ver `docs/operations/THEME_SHADOW_IMPLEMENT.md`.
- [x] **THEME_SHADOW_COMPLETE_BLOCKERS** — completado sesión 013b (2026-06-24). CPANEL UAPI token nuevo activado. Probe read-only exitoso. Portados BLOCKER-A (woocommerce_package_rates IVA 21%), BLOCKER-B (sistema URLs limpias completo con transients), BLOCKER-C (breadcrumbs ×2), BLOCKER-D (pre_get_posts carrusel), + rank_math, búsqueda header (AJAX + shortcode + script). functions.php: 538 líneas añadidas. Veredicto: APPROVE_READY_FOR_SYNC_REAL.
- [ ] **THEME_SHADOW_SYNC** — sync controlado del paquete local a la carpeta sombra en servidor con acceso temporal. (Sesión 014)
- [ ] **THEME_SHADOW_VISUAL_VALIDATION** — validación visual con Antigravity sobre tema sombra inactivo. (Sesión 015)
- [ ] **RELEASE_MANUAL_PABLO** — Pablo activa tema sombra en WP Admin + verifica + rollback definido si falla.

**Track 0 (continuidad Elementor) — después de A0_ELEMENTOR_DEPENDENCY_AUDIT:**
- [ ] Migrar Cart y Mi Cuenta a WooCommerce Blocks si están en Elementor.
- [ ] Reemplazar mini-cart override de Elementor Pro (PROB-11).
- [ ] Evaluar catálogo (shop, categorías, producto): Loop Grid Pro → template PHP nativo si necesario.
- [ ] Habilitar WPS Hide Login (PROB-12) — 10 minutos en WP Admin.
- [ ] Investigar webhooks de PayPal (PROB-14).

**Track 1 (Catenaccio Studio) — después de WP_WC_API_READONLY_PROBE confirmado:**
- [ ] **B1_CATENACCIO_STUDIO_SEED** — arrancar el diseño de Catenaccio Studio: formulario, campos, stack Next.js, scaffold inicial. Parallel a Track 0 una vez el acceso API esté activo.
- [ ] **STUDIO_MVP_DESIGN** — diseñar formulario Studio. **Cambio de diseño confirmado por probe:** escribir en `meta_data` (no en `attributes[]`). Selectores de liga/equipo/año via `GET /wc/v3/products/attributes/{id}/terms`. `talla` y `condicion` como strings directos. Ver `API_READONLY_PROBE_RESULT.md §8` y `STOCK_OPERATIONS_MODEL.md §3`.
- [ ] **PRODUCT_WORKFLOW_DESIGN** — documentar el flujo completo: foto → Studio → Claude → borrador WC → aprobación Pablo → publicado. Ver flujo principal en `STOCK_OPERATIONS_MODEL.md §7`.
- [ ] **WC_API_WRITE_ACCESS_TEST** — testar `POST /wp-json/wc/v3/products` con status=draft y atributos custom (pa_liga, pa_equipo, etc.). Prerequisito: probe de solo lectura confirmado.
- [ ] **EXCEL_STOCK_IMPORT_MAPPING** — Pablo comparte columnas reales de `STOCK.xlsx` cuando Studio esté en marcha. Preparar plantilla CSV compatible con Studio para migración futura. Ver `STOCK_OPERATIONS_MODEL.md §5`. No urgente — no bloquea A0.
- [ ] **LOCAL_IMAGE_FOLDER_WORKFLOW** — confirmar ruta y estructura de carpetas locales de fotos. Implementar campo `carpeta_local` en Studio MVP. Ver `STOCK_OPERATIONS_MODEL.md §3.6`.
- [ ] **VINTED_PUBLICATION_TRACKING** — diseñar recordatorio de Vinted en Studio. Ver `STOCK_OPERATIONS_MODEL.md §7`. No urgente — post MVP.
- [ ] **STUDIO_PRODUCT_STATUS_PIPELINE** — vista de tabla de inventario con 11 estados, filtros, columnas Referencia/Estado/Fotos/Web/Vinted/Coste/Precio. Ver `STOCK_OPERATIONS_MODEL.md §7`.
- [ ] Publicar primeras 5 camisetas usando Studio (prueba real de velocidad).

**Track 2 (catálogo SEO — después de Track 1):**
- [ ] **ATTRIBUTE_TAXONOMY_SEO_ARCHITECTURE** — auditar archive templates de WooCommerce para pa_liga, pa_equipo. Configurar RankMath en archive pages. Rate limiting para crawlers en .htaccess.

**Operación:**
- [ ] **PERFORMANCE_CACHE_HOSTING_DECISION** — evaluar si Raiola Inicio SSD 2.0 es suficiente con 100+ productos. Revisar opciones de upgrade o cambio de plan.
- [ ] Subir 10-20 productos usando workflow AI-first (paralelo al desarrollo de Studio).

---

## LATER — Sin fecha comprometida

- [ ] **AGENT_EXPERIENCE_LEDGER_REVIEW** — revisar `docs/meta/AGENT_EXPERIENCE_LEDGER.md` periódicamente: promover entradas de PROVISIONAL a CONFIRMED_BY_REUSE cuando se reusen con éxito; añadir nuevas entradas al cerrar tareas recurrentes. Sin fecha — se hace al cierre de sesiones relevantes.
- [ ] **SESSION_LEARNING_TRANSFER_REVIEW_LOOP** — revisar `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md` periódicamente y decidir qué entradas promover a lafabrica o Brain. Ejecutar cuando Pablo active `DIRECT_BRAIN_WRITE_ALLOWED` o cuando se acumulen 3+ entradas `CANDIDATE`. Ver DEC-11.
- [ ] Generar SEED implementable final.
- [ ] Iniciar implementación técnica.
- [ ] **MARKETPLACE_NORTH_STAR_VALIDATION** — evaluar si Catenaccio tiene tracción suficiente para abrir a vendedores externos. Solo activar cuando se cumplan TODOS los gates de TARGET_OPTIONS.md §11: 100+ productos propios, workflow ≤10 min, tráfico orgánico, ventas recurrentes, propuesta de valor clara frente a Vinted, sistema de autenticidad definido. Ver DECISIONS.md PEND-2.
- [ ] **LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN** — transferir el conector `GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR` a lafabrica como asset reutilizable. Prerequisito: validar en un segundo proyecto (Bijuymoda Suite). Ver `docs/operations/GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md §8`.

---

## BLOCKED — No avanzar hasta que...

- [ ] **Toda operación API / auditoría Elementor / Studio** — bloqueada hasta que Pablo complete `ACCESS_MODEL_ACTIVATION_READONLY` (ver NOW): crear usuario limitado + Application Password en WP Admin siguiendo `ACCESS_MODEL_NO_SSH.md §6`. 10-15 min, sin agente.

_(sin otros bloqueos activos — TARGET aprobado, implementación desbloqueada, orden corregido en Sesión 006d)_

- [x] ~~Implementación técnica bloqueada hasta AS-IS validado y TARGET aprobado.~~ — DESBLOQUEADO 2026-06-13 (TARGET APROBADO)

---

## DONE — Completado

| Ítem | Fecha | Sesión |
|------|-------|--------|
| GSC_API_READONLY_CONNECTOR validado — script, docs, patrón reusable. `.secrets/` ignorado. | 2026-06-14 | Sesión 009 |
| Init desde lafabrica-template | 2026-06-06 | Sesión 0 |
| SEC-001 resuelto — OAuth Google / Nextend Social Login rotado por operador | 2026-06-06 | Sesión 002 |
| SEC-002 resuelto — WP secret keys rotadas en servidor por operador | 2026-06-06 | Sesión 002 |
| SERVER_CONTEXT_CHECK_READONLY completado — evidencia via WP Admin/WC Status (no SSH) | 2026-06-10 | Sesión 003 |
| AS_IS_UNDERSTANDING.md actualizado con datos reales del servidor (plugins, versiones, HPOS, OPcache, Elementor Pro deadline) | 2026-06-10 | Sesión 003 |
| AS_IS_UNDERSTANDING.md validado por operador — estado cambiado a VALIDADO_POR_USUARIO | 2026-06-10 | Sesión 004 |
| ACCESS_MODEL_NO_SSH.md creado — modelo de acceso sin SSH completo: capas, matriz, modos, credenciales, guía App Password, revocación, staging, OPcache/Raiola | 2026-06-13 | Sesión 006 |
| API_READONLY_PROBE_RESULT.md creado — probe public endpoints OK (28 productos, 37 namespaces, elementor-pro/v1 activo). Auth endpoints requieren .env.local completo. | 2026-06-13 | Sesión 007 |
| STOCK_OPERATIONS_MODEL.md creado — ciclo de vida de producto (11 estados), campos mínimos Studio (8 bloques), recomendación imágenes (A→C), guía migración Excel, tareas derivadas | 2026-06-13 | Sesión 006c |
| TARGET_OPTIONS.md preparado — comparativa A/B/C/D/E, veredicto APPROVE Opción A, plan 7/30/90 días | 2026-06-13 | Sesión 005 |
| TARGET_OPTIONS.md corregido — Root Cause añadida, veredicto corregido a A0+B1 (Catenaccio Studio), modelo acceso API | 2026-06-13 | Sesión 005b |
| TARGET_OPTIONS.md — Marketplace North Star añadido: fases 1-4, gates, implicaciones de diseño | 2026-06-13 | Sesión 005c |
| **TARGET A0 + B1 APROBADO** por el operador. VALIDATION_RECORD.md con VAL-005. DECISIONS.md DEC-8 cerrada. Implementación desbloqueada. | 2026-06-13 | Sesión 005d |
