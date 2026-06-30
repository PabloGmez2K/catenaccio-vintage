# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

### 🧭 REDIRECCIÓN ESTRATÉGICA — Sesión 018 (2026-06-27, Opus) — DEC-13

**Veredicto: `APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE` (RUTA D).** Se construye Catenaccio Studio primero; WooCommerce se mantiene como tienda/checkout; A0 se congela. Ver `docs/strategy/CATENACCIO_STRATEGIC_ROADMAP.md`. **Pendiente: confirmación literal de Pablo.**

- [x] **PABLO_CONFIRM_ROUTE_D** — ✅ COMPLETADO 2026-06-27. Pablo confirma DEC-13 `APPROVE_ROUTE_HYBRID_STUDIO_WOO_BRIDGE`. S019+ desbloqueado. DEC-13 actualizada a APROBADA. (Acción Pablo)
- [ ] **A0_FREEZE_FORMAL** — congelar formalmente la línea A0: tag de git en el estado actual de `catenaccio-a0-child`, nota de FREEZE en sus docs, mover tareas A0 a § FROZEN. No volver a sincronizar. (Agente Sonnet, 1 sesión corta)
- [ ] **CPANEL_TOKEN_REVOCATION** — DEFERRED_BY_OPERATOR / RISK_ACCEPTED. Token cPanel de Sesión 017 sigue activo por decisión explícita de Pablo. No bloqueante. Pablo revocará cuando sea conveniente. No usar en sesiones Studio. (Acción Pablo, sin agente)
- [x] **SUPABASE_VERCEL_ACCOUNTS** — ✅ COMPLETADO. Pablo creó cuenta Supabase (organization: Catenaccio Vintage, project: catenaccio-studio, region: West EU / Ireland) + cuenta Vercel conectada a GitHub. Prerequisito de S021 desbloqueado.
- [x] **S019 — STUDIO_DATA_MODEL** — ✅ COMPLETADO 2026-06-27 (Sonnet). Schema Supabase MVP definido: 6 tablas, 7 enums, índices, triggers, vista de márgenes, RLS. Capa genérica (reutilizable lafabrica) + extensión Catenaccio separadas. AI-first model documentado. WC bridge preparado. Ver `docs/studio/STUDIO_DATA_MODEL.md` + `STUDIO_SUPABASE_SCHEMA_MVP.sql`. Veredicto: `APPROVE_READY_FOR_S020_WC_BRIDGE_CONTRACT`.
- [x] **S020 — STUDIO_WC_BRIDGE_CONTRACT** — ✅ COMPLETADO 2026-06-27 (Sonnet). Contrato Studio→WooCommerce completo: autenticación (Application Password / Basic Auth / DEC-9), endpoints WC REST API v3, DRAFT_ONLY blindado, payload exacto, mapeo meta_data campo por campo, resolución term IDs, idempotencia, error handling, test plan. 5 documentos creados. DEC-14 registrada. Veredicto: `APPROVE_READY_FOR_WC_API_WRITE_ACCESS_TEST`. Ver `docs/studio/STUDIO_WC_BRIDGE_CONTRACT.md`. (Sonnet)
- [x] **WC_API_WRITE_ACCESS_TEST** — ✅ COMPLETADO 2026-06-27 (Codex, S020B). Precheck credenciales OK, term IDs OK, 1 producto dummy creado por WC API con `status=draft` (ID 1853), `meta_data` validada por API. Ver `docs/studio/WC_API_WRITE_ACCESS_TEST_RESULT.md`. PASS técnico → S021 desbloqueado tras verificación/cleanup manual.
- [x] **STUDIO_TEST_PRODUCT_CLEANUP** — ✅ COMPLETADO 2026-06-27. Pablo confirmó manualmente: producto test ID 1853 eliminado manualmente. No se ejecutó DELETE por API.
- [x] **SUPABASE_SCHEMA_APPLY_MVP** — ✅ COMPLETADO 2026-06-27 (S020D). Aplicado manualmente por Pablo en Supabase SQL Editor. Verify script `scripts/studio/verify_supabase_schema_mvp.sql` PASS confirmado por operador (`OPERATOR_CONFIRMED_PASS`). Sin secretos compartidos; ningún agente ejecutó SQL. Veredicto: `APPROVE_READY_FOR_S021_MVP_SCAFFOLD`.
- [x] **S021 — STUDIO_MVP_SCAFFOLD** — ✅ COMPLETADO 2026-06-27 (Sonnet). App Next.js 15.5.19 en `studio/`. Auth magic link Supabase. `/inventory` protegida por middleware. Empty state + error state. typecheck/build/lint PASS. Sin deploy, sin WC, sin schema changes. Veredicto: `APPROVE_READY_FOR_LOCAL_VISUAL_REVIEW`. Ver `docs/studio/STUDIO_MVP_SCAFFOLD_RESULT.md`.
- [x] **STUDIO_VISUAL_REVIEW_PABLO** - COMPLETADO 2026-06-27 (S021B). Pablo valido Studio localmente: magic link PASS, `/inventory` PASS, empty state visible ("No hay camisetas todavia."), sin error rojo tras fix manual.
- [x] **RLS_GRANTS_CANONICAL_FIX** - COMPLETADO 2026-06-27 (S021B, Codex). El bloqueo `permission denied for table inventory_items` se resolvio manualmente por Pablo con GRANTs en Supabase SQL Editor y el SQL canonico quedo actualizado con privilegios para `authenticated` sin conceder permisos a `anon`. RLS sigue activo y owner-based.
- [x] **WORKSPACE_SEED_MANUAL** - COMPLETADO 2026-06-27 (S021C). Pablo confirmo `WORKSPACE_SEED_MANUAL: PASS`; workspace `Catenaccio Vintage` / slug `catenaccio-vintage` creado/asociado manualmente en Supabase SQL Editor. No auth.uid registrado, no secretos, no SQL ejecutado por agente.
### 🧭 REVISIÓN ESTRATÉGICA — Sesión 021D (2026-06-27, Opus) — `ADJUST_BEFORE_S022`

**Veredicto: `ADJUST_BEFORE_S022`.** La ruta DEC-13/DEC-14 es correcta (no hay STOP_AND_REPLAN); se ajusta solo la **granularidad**: S022 (formulario + Claude + Woo en una sesión) agrupaba 3 clases de riesgo y 2 secretos nuevos en un commit. Se divide en S022A → S022B → S022C, frontera de escritura-a-producción aislada en S022C, deploy diferido a después del E2E. Ver `docs/studio/STUDIO_STRATEGIC_REVIEW_BEFORE_S022.md`.

- [~] **S022A — STUDIO_CREATE_ITEM_FORM** — FIX_BLOCKER_FIRST (2026-06-28, Sonnet). Técnico PASS. Pablo validó local y detectó blockers UX/dominio: IDs técnicos visibles, pérdida de form state, sin edición, sin opciones canónicas, sin título autogenerado, sin campo Versión. Estado correcto: READY_FOR_PABLO_VALIDATION → FIX_BLOCKER_FIRST. Ver `docs/studio/STUDIO_CREATE_ITEM_FORM_RESULT.md` + plan de corrección `docs/studio/STUDIO_FORM_DOMAIN_UX_FIX_PLAN.md`.
  - [x] **S022A.1 — DOMAIN_UX_FIX_PLAN** — ✅ COMPLETADO 2026-06-28 (Sonnet). Diagnóstico read-only completo. Plan S022A.2 definido. Ruta 4 (híbrida) elegida. Veredicto: `FIX_BLOCKER_FIRST_WITH_PLAN`. Ver `docs/studio/STUDIO_FORM_DOMAIN_UX_FIX_PLAN.md`.
  - [x] **S022A.1B — COMPETITOR_PRODUCT_MODEL_AUDIT_CFS** — ✅ COMPLETADO 2026-06-28 (Antigravity). Auditoría visual/modelo de CFS y comparación. Ajuste de campos de dominio (renombrar version_camisa a shirt_version, añadir product_type, authenticity_type, sleeve_length, sponsor) y patrón de autotítulo en inglés con talla final. Veredicto: `ADJUST_S022A2_MODEL_FIRST`. Ver `docs/studio/CLASSIC_FOOTBALL_SHIRTS_PRODUCT_MODEL_AUDIT.md`.
  - [x] **S022A.2 — FORM_DOMAIN_UX_PATCH** — COMPLETADO 2026-06-28 por PABLO_LOCAL_FORM_OK. Los blockers UX/dominio quedan cerrados tras validacion local de creacion, edicion y detalle. Ver `docs/studio/STUDIO_FORM_LOCAL_VALIDATION_CLOSE_RESULT.md`.
    - [x] **S022A.2A — SCHEMA_UPDATE** — COMPLETADO 2026-06-28 por ejecucion manual de Pablo en Supabase SQL Editor. Confirmado `S022A.2A_SCHEMA_PATCH: PASS`. Campos confirmados: `product_type`, `shirt_version`, `authenticity_type`, `sleeve_length`, `sponsor`. `version_camisa` descartado.
    - [x] **S022A.2B — UI_PATCH** — COMPLETADO 2026-06-28 (Sonnet). Implementación completa: (1) IDs técnicos eliminados de UI; (2) Resolución interna de termIds vía `wc-terms-mvp.ts`; (3) Campos granulares en UI (product_type, shirt_version, authenticity_type, sleeve_length, sponsor); (4) Título en inglés autogenerado en tiempo real con override manual + botón "↺ Regenerar"; (5) Preservación de form state vía inputs controlados (React useState); (6) Ruta de edición `/inventory/[id]/edit`. typecheck/build/lint PASS. Ver `docs/studio/STUDIO_FORM_DOMAIN_UX_PATCH_RESULT.md`.
    - [x] **S022A.2C — FORM_DOMAIN_LABELS_AND_CANONICAL_OPTIONS_FIX** — COMPLETADO 2026-06-28 (Sonnet). "Replica" → "Original retail / Fan version" (valor interno mantenido). Liga y Marca → datalist libre (entrada manual). getTitleLabel(): PSV → 'PSV', PSG → 'PSG'. Orden alfabético en todas las listas. "No determinado" añadido. Helpers de UX. typecheck/build/lint PASS. Ver `docs/studio/STUDIO_FORM_DOMAIN_LABELS_OPTIONS_FIX_RESULT.md`.
    - [x] **S022A.2D — DETAIL_COPY_AND_AUTH_LABEL_FIX** — COMPLETADO 2026-06-28 por PABLO_LOCAL_FORM_OK. Label "Original" validado en detalle, texto roadmap eliminado, creacion/edicion/ficha detalle OK. Ver `docs/studio/STUDIO_DETAIL_COPY_AND_AUTH_LABEL_FIX_RESULT.md` + `docs/studio/STUDIO_FORM_LOCAL_VALIDATION_CLOSE_RESULT.md`.
    - *Criterio de parada:* PABLO_LOCAL_FORM_OK tras prueba local de creación, edición y visualización de detalle.
- [x] **S022B — STUDIO_AI_SUGGESTIONS_SHADOW** — **IMPLEMENTED / DORMANT / COST_DEFERRED (2026-06-28).** Integración Claude implementada y preparada (contexto sanitizado, prompt `studio_s022b_v1`, server actions, `AiSuggestionsPanel`). Panel oculto por defecto vía feature flag `STUDIO_AI_ENABLED` (server-side, no NEXT_PUBLIC_*). Metadata interna eliminada de UI. Activar en futuro: añadir `STUDIO_AI_ENABLED=true` + `ANTHROPIC_API_KEY` en `.env.local`. **No requiere `PABLO_AI_SHADOW_OK` para desbloquear S022C** — decisión operador: primero validar sistema Studio y puente Woo, IA diferida. Ver `docs/studio/STUDIO_AI_SUGGESTIONS_SHADOW_RESULT.md`.
  - [x] **S022B.1 — MANUAL_SEO_PROMPT_WORKFLOW** — **COMPLETADO 2026-06-28 (Sonnet).** Flujo manual NO-API implementado. Sección "Contenido SEO manual" siempre visible en `/inventory/[id]` (independiente de `STUDIO_AI_ENABLED`). Botón "Copiar prompt SEO" + textarea fallback. Formulario para pegar resultado (título, descripción, precio, notas). Server action `saveManualSeoContent` guarda en `ai_suggestions` con `status=editado_aprobado`, `model_used=manual_external_agent`. Lifecycle event `manual_seo_content_saved`. Muestra "Contenido SEO listo para borrador" cuando hay suggestion aprobada. typecheck/build/lint PASS. Secret scan CLEAN. Ver `docs/studio/STUDIO_MANUAL_SEO_PROMPT_WORKFLOW_RESULT.md`. Pendiente: `PABLO_MANUAL_CONTENT_OK`.
  - [x] **S022B.2 — SEO_CONTENT_RULES_AND_PROMPT_STANDARDIZATION** — **COMPLETADO 2026-06-28 (Sonnet).** Guía canónica de reglas SEO creada (`docs/studio/STUDIO_SEO_CONTENT_RULES.md`): 9 secciones (objetivo, título EN, descripción ES, descripción corta, precio, notas internas, claims sensibles, formato de salida, checklist). Prompt Studio ajustado (`studio/lib/seo/manual-seo-prompt.ts` → `studio_manual_seo_v2`): sección de contexto con referencia al Project ChatGPT "Catenaccio Vintage", lista de docs del repo a revisar, reglas fallback embebidas si no hay acceso a GitHub. typecheck/build/lint PASS. Secret scan CLEAN. Ver `docs/studio/STUDIO_SEO_CONTENT_RULES_AND_PROMPT_STANDARDIZATION_RESULT.md`. Pendiente: `PABLO_MANUAL_CONTENT_OK`.
- [x] **S022C.8 — TAXONOMY_RELATIONSHIP_PAYLOAD_PATCH** — **VALIDADO / APPROVE_S022C8_CLOSED (2026-06-28, Codex + Pablo).** Pablo creó un nuevo borrador WooCommerce desde Studio tras `95b9b49` y validó en WP Admin: Liga, Equipo y Año aparecen seleccionados; talla, medidas, condición y defectos aparecen; categoría = Otros Clubs; inventario = 1; estado = Borrador; no publicado. `attributes[] + meta_data ACF` queda validado para Liga/Equipo/Año. Fallo diferido: Jugador/Rivaldo no apareció → S023 `PLAYER_TERM_RESOLUTION`. No publicar producto de prueba si contiene datos falsos de equipo/temporada por limitación de IDs. Ver `docs/studio/STUDIO_WC_DRAFT_BRIDGE_RESULT.md §S022C.8`.
- [x] **OPUS_STRATEGY_REVIEW_BEFORE_S023_IMPLEMENTATION** — ✅ COMPLETADO 2026-06-29 (Opus 4.8, S023-STRATEGY). Veredicto: `READY_FOR_S023A_IMPLEMENTATION`. Arquitectura target definida: fuente de verdad partida (Supabase=datos / WooCommerce=identidad de términos), **caché de taxonomías en Supabase** (no lectura runtime), reemplazo de `wc-terms-mvp.ts` por la caché, creación controlada de términos desde Studio, categorías por selección, publicación controlada diferida a S030. S023 descompuesta en S023A–E. Gates formalizados. Ver `docs/studio/STUDIO_TARGET_ARCHITECTURE.md`, `docs/studio/STUDIO_ROADMAP_S023_S030.md`, `docs/studio/STUDIO_SESSION_GATES.md`.

#### S023 — TAXONOMY & CATEGORY MANAGER (fase descompuesta — una tarea por sesión)

> **No abrir como una sola sesión.** Cerrar cada bloque con el test real de Pablo antes del siguiente. Gates por bloque en `docs/studio/STUDIO_SESSION_GATES.md §7`. Roadmap completo en `docs/studio/STUDIO_ROADMAP_S023_S030.md`.

- [x] **S023A — WC_TAXONOMY_CATEGORY_READ_SYNC** — **APPROVE_READY_FOR_S023B (2026-06-29, Codex + Pablo).** Caché Supabase (`wc_taxonomies`/`wc_terms`/`wc_categories`) + endpoint autenticado `POST /inventory/sync` + verificador SQL implementados en `5bec3d7`. Pablo aplicó SQL, disparó sync desde Studio y ejecutó verificador SQL: PASS completo. Respuesta sync: `ok=true`, `wc_get_called=true`, `wc_post_called=false`. Counts reales: categorías=5; taxonomías requeridas=4/4; `pa_equipo`=22; `pa_liga`=6; `pa_jugador`=18; `pa_ano`=19. Términos conocidos PASS: Real Madrid→70, FC Barcelona→170, 2014-15→139. No se abrió S023B en esta sesión.
- [x] **S023B — TERM_CACHE_BACKED_OPTIONS** — **APPROVE_READY_FOR_S023C (2026-06-30, Sonnet + Pablo + Codex close).** `studio/lib/wc/term-cache.ts` resuelve Liga/Equipo/Año contra `wc_terms` (Supabase, S023A). `actions.ts` y `bridge.ts` ya no leen `wc-terms-mvp.ts` como fuente de term IDs; el `.ts` queda marcado deprecado y conservado solo como presentación (labels/aliases/titleLabel/helpText). Pablo validó funcionalmente en Studio que Liga/Equipo/Año siguen disponibles y que la resolución real queda conectada a la caché. Sin llamadas a WooCommerce por agente, sin términos creados, sin publicar. Ver `docs/studio/STUDIO_TERM_CACHE_BACKED_OPTIONS_RESULT.md`.
- [x] **S023C — CONTROLLED_TERM_CREATION** — **APPROVE_READY_FOR_S023D (2026-06-30, Sonnet + Pablo + Codex close).** Implementado `studio/lib/wc/term-create.ts` (`createControlledTerm`): dedupe en 2 capas (caché `wc_terms` → `GET` en vivo a Woo) antes de `POST .../products/attributes/{id}/terms`; write-through inmediato a `wc_terms` con el ID real devuelto por Woo (`source='studio_created'`). Pablo validó creación controlada desde Studio, dedupe funcional y validación suficiente de Supabase. Sin producto creado/reportado, sin publicación, sin problema reportado con categorías ni jugador. Ver `docs/studio/STUDIO_CONTROLLED_TERM_CREATION_RESULT.md`.
- [~] **S023D — PLAYER_TERM_RESOLUTION** — **READY_FOR_PABLO_PLAYER_TERM_TEST (2026-07-01, Sonnet).** Implementada resolución de `pa_jugador` contra `wc_terms` (mismo patrón S023B) + creación controlada extendida a `pa_jugador` (mismo patrón S023C, `CONTROLLED_TAXONOMIES.pa_jugador = 6`). Stub `jugador: jugadorDisplay ? '' : null` en `actions.ts` sustituido por `jugador: jugadorTermId || null` en `createInventoryItem`/`updateInventoryItem`. `bridge.ts` no se tocó (ya preparado desde S022C.8). Sin lista estática de jugadores (vocabulario abierto). Pendiente: Pablo valida con Rivaldo en WP Admin. Ver `docs/studio/STUDIO_PLAYER_TERM_RESOLUTION_RESULT.md`.
- [ ] **S023E — CATEGORY_SELECTOR_IN_STUDIO** — selector de categoría (Leyendas/Nuevo/Otros Clubs/Selecciones) desde caché; heurística + override; `rank_math_primary_product_cat` sigue selección. Agente Sonnet + validación visual Pablo. Gate: `DOMAIN_PRODUCT_MODELING`. Cierra fase S023.
- [ ] **S024–S030 — SUITE ROADMAP** — completeness/preflight (S024), imágenes (S025), stock operativo (S026), Rank Math/SEO (S027), landings (S028), drift detection (S029), publicación controlada (S030). Una tarea por sesión, gates por fase. Ver `docs/studio/STUDIO_ROADMAP_S023_S030.md §3` y matriz de gates `docs/studio/STUDIO_SESSION_GATES.md §7`. No abrir hasta cerrar S023.
- [ ] **STUDIO_VERCEL_DEPLOY_MINIMAL** (antes "S022D / S024") — DIFERIDO hasta E2E probado en local. Infra independiente del roadmap S024–S030 (no confundir con S024 completeness). Deploy app probada, migrar env vars a Vercel server-side, configurar redirect URL Supabase, tratar postcss CVE en frontera pública. No de-riesga el puente (S020B ya probó acceso WC desde local) → no precede a Woo. (infra controlada)
- [ ] **GATE_STUDIO_MVP** — Pablo publica 1 camiseta real E2E por Studio → luego 5–10, medir tiempo/camiseta vs. ~45 min. Revisión fría (RULE-01). STOP_AND_REPLAN si no hay MVP usable a ~4 sesiones de impl. **Progreso lineal obligatorio: cualquier bucle de rework dispara STOP_AND_REPLAN.**
- [x] **STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK** — COMPLETADO 2026-06-28 (Codex, DOCS_ONLY). Capturado `DOMAIN_PRODUCT_MODELING_GATE` para evitar microfix spiral en formularios/product UI: spec-before-patch, option pattern, vocabulary ambiguity check, example-driven acceptance y form readiness checklist. Ver `docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`.

> **Mientras tanto:** Pablo sigue vendiendo manualmente por WP Admin como ahora (puente operativo inmediato). No esperar a Studio para vender.

---

### Histórico NOW previo (track A0+B1 original — referencia)

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
- [x] **THEME_SHADOW_SYNC** — sync controlado del paquete local a la carpeta sombra en servidor con acceso temporal. COMPLETADO Sesión 014-sync (2026-06-27). 9 archivos sincronizados a `public_html/wp-content/themes/catenaccio-a0-child/`; hashes local/remoto OK; `hello-elementor-child` intacto. Ver `docs/operations/THEME_SHADOW_SYNC.md`.
- [x] **THEME_SHADOW_VISUAL_BLOCKERS_FIX** — fix quirúrgico de 5 blockers visuales detectados por Pablo en preview manual: mini-cart ahora trigger+dropdown (no inline), toggle off-canvas oculto en desktop con `!important`, off-canvas con `overflow-x:hidden` + word-break, CSS defensivo filtros sidebar, CSS defensivo toolbar. 3 archivos modificados (header.php, cv-a0.css, cv-a0.js) y resincronizados al tema sombra en servidor en Sesión 017. Ver `docs/operations/THEME_SHADOW_VISUAL_BLOCKERS_FIX.md` y `docs/operations/THEME_SHADOW_VISUAL_FIX_RESYNC.md`. (Sesión 016-017, 2026-06-27)
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
- [x] **WC_API_WRITE_ACCESS_TEST** — ✅ COMPLETADO 2026-06-27 (Codex, S020B). `POST /wp-json/wc/v3/products` validado con `status=draft`, producto test ID 1853, `meta_data` requerida confirmada por API. Cleanup manual pendiente en `STUDIO_TEST_PRODUCT_CLEANUP`.
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

## FROZEN — Congelado por DEC-13 (Sesión 018) — no borrar, no iterar

> La línea A0 (tema sombra) se congela como referencia/aprendizaje, **no** como release activable. Confirma `KILL_CURRENT_A0_RELEASE_LINE`. Se descongela solo si Elementor Pro rompe algo real en producción. Ver `docs/strategy/CATENACCIO_STRATEGIC_ROADMAP.md §3`.

- [~] **THEME_SHADOW_VISUAL_VALIDATION** — CONGELADO. El bucle de preview manual + resync consumió ~7 sesiones sin converger (RULE-01).
- [~] **RELEASE_MANUAL_PABLO** (activación del tema sombra) — CONGELADO. No se activa `catenaccio-a0-child`.
- [~] **Track 0 (continuidad Elementor)** — CONGELADO en su mayor parte. Elementor Pro caduca pero no rompe la tienda (deadline blando). Excepciones que siguen siendo quickwins independientes de A0 y que Pablo puede hacer cuando quiera: habilitar WPS Hide Login (PROB-12), investigar webhooks PayPal (PROB-14), ticket OPcache a Raiola (PROB-09).
- [x] **catenaccio-a0-child** — conservado en el repo y en el servidor (carpeta sombra inactiva). Es la librería ya capturada de la lógica crítica del tema activo (IVA 21%, URLs limpias, breadcrumbs, carrusel, RankMath, buscador AJAX) y la contingencia escrita si A0 hace falta.

---

## LATER — Sin fecha comprometida

- [ ] **STUDIO_ARCHIVE_OR_DELETE_ITEM_ACTION** — Futura acción para archivar o descartar items creados en Studio. Recomendación MVP: soft archive via status `archivada`, no hard delete. Requiere confirmación UI + owner_id/RLS. No desbloquea S022B. (Documentado en S022A.2D tras pregunta de Pablo.)
- [ ] **FUTURE_COLLECTIONS_AND_LEGENDS_LANDINGS** — Landings editoriales tipo Leyendas, Mundiales, Player Issue, Match Worn. No implementar como Liga/Equipo. La base actual (jugador_display limpio) permite una futura capa de colección/tag curado. Implementar como editorial collection system o tag curado cuando Catenaccio tenga catálogo suficiente. Documentado en S022A.2C.
- [ ] **FUTURE_TAXONOMY_SUGGESTION_STATUS_BADGES** — Diferenciar en la UI de sugerencias los términos ya existentes en Woo/caché frente a términos pendientes, no creados o no mapeados. Objetivo: que Pablo sepa al elegir un término si ya existe en Woo o si requerirá creación/control posterior. FUTURE/LATER; no implementar en S023B ni mezclar con S023C salvo decisión explícita.
- [ ] **FUTURE_FOOTBALL_KNOWLEDGE_GRAPH_AND_PROGRAMMATIC_LANDINGS** — FUTURE / STRATEGIC / NOT_NOW. Explorador Liga → Equipo → Temporada → Jugadores + agente de análisis de valor/rareza/oportunidad + base para landings programáticas, SEO programático, AI search y catálogo inteligente. Conectado con S028 LANDING_ARCHITECTURE; no mezclar con S023C.
- [ ] **FUTURE_TAXONOMY_SMART_SUGGESTIONS** — FUTURE / UX_INTELLIGENCE / NOT_NOW. Sugerencias del formulario dependientes de contexto: Liga → equipos prioritarios de esa liga; Equipo/Temporada → jugadores relacionados; distinguir visualmente términos existentes en Woo/caché vs sugerencias no creadas; mostrar "Crear término en Woo" solo cuando el texto no exista realmente en la caché/Woo. No meter en S023D.
- [ ] **STUDIO_TAXONOMY_UNIVERSE_MANAGER** — FUTURE / STUDIO_INTERNAL_TOOLING / NOT_NOW. Zona interna de Studio para visualizar atributos, términos, categorías, relaciones Liga → Equipo → Temporada → Jugadores, términos existentes vs pendientes y huecos de catálogo. Conecta con S023E, S028 y S029; no mover por encima del flujo S023D/S023E.
- [ ] **STUDIO_PROMPT_GENERATION_TOOLS** — FUTURE / PROMPT_BASED_AI_WORKFLOW / NOT_NOW. Herramientas internas NO-API para copiar prompts a agentes: analizar universo de términos/categorías, detectar oportunidades de landings, sugerir camisetas de mayor valor por liga/equipo/temporada/jugador, proponer futuras herramientas basadas en contenido real de Studio, SEO programático y AI search. Conecta con S028; no implementar ahora.
- [ ] **DOMAIN_OPTION_PATTERN_STANDARDIZATION** — Estandarizar el patrón `DomainOption` si aparece un segundo uso claro fuera de S022A: `label`, `value`, `titleLabel`, `aliases`, `externalId`, `helpText`, `status`. Mantenerlo como patrón de modelado hasta que reduzca duplicación real. Ver `docs/studio/STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`.
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
