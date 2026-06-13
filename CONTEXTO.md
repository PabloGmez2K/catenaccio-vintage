# CONTEXTO.md — Catenaccio Vintage

Estado vivo del proyecto. **Append-only. Nunca replace_all. Nunca editar entradas pasadas.**

Actualizar al cierre de cada sesión. Si no se actualizó → la sesión no cerró limpia.

---

## Fase actual

**Fase:** Arranque  
**Desde:** 2026-06-06  
**Descripción:** Repo recién generado desde SEED. Sin sesiones reales todavía.

---

## Experimento activo

**Hipótesis:** Catenaccio Vintage puede beneficiarse de una migración hacia un stack más moderno y compatible con el workflow de lafabrica.  
**Inicio:** 2026-06-06  
**Criterio de éxito:** Tener el AS-IS de Catenaccio Vintage validado, las fuentes principales registradas, una opción TARGET aprobada y un PROJECT_SEED implementable para iniciar la reconstrucción o migración técnica.  
**Criterio de fallo:** _(completar)_  
**Rollback:** _(completar)_  
**Fecha límite de decisión:** 2026-06-06

---

## Riesgos activos

| Riesgo | Impacto | Estado | Última revisión |
|--------|---------|--------|-----------------|
| Copiar archivos brutos al repo | Alto/Medio/Bajo | Activo/Mitigado | 2026-06-06 |
| Decidir stack antes de entender el proyecto | Alto/Medio/Bajo | Activo/Mitigado | 2026-06-06 |

Hipótesis no verificadas del SEED:
- : pendiente validación
- : pendiente validación

---

## Siguiente paso recomendado

**ORDEN CORRECTO — estado actualizado Sesión 007b:**
1. ✅ Acceso confirmado: `catenaccio-studio-agent` (shop_manager), WC REST API v3 operativo.
2. ✅ Probe completo: 28 productos, 7 atributos, Elementor Pro activo (`isExpired:false`), 14 templates listados.
3. **Hallazgo crítico documentado:** productos usan ACF meta fields (no WC attributes[]). Studio debe escribir en `meta_data`. Ver `API_READONLY_PROBE_RESULT.md §5 y §8`.
4. **Sesión 008 — A0_ELEMENTOR_DEPENDENCY_AUDIT:** 12/14 templates ya clasificados como Pro por tipo. Para widget-level: decidir si se crea App Password de Admin o se hace audit visual en WP Admin.
5. **Sesión 009 — Studio MVP:** formulario Next.js con selectores via `wc/v3/products/attributes/{id}/terms`. Escribir en `meta_data`. `POST /wc/v3/products` con `status:draft`.

---

## Sesiones recientes (mantener últimas 5)

<!-- APPEND AQUÍ — no editar entradas anteriores -->
<!-- Formato: Sesión N (YYYY-MM-DD, Agente): MODO / tipo. [Qué se hizo]. [Qué se validó]. [Qué NO se tocó]. -->

Sesión 0 (YYYY-MM-DD, lafabrica-template): LITE / init. Template aplicado desde SEED. Docs base generados. No se tocó código del proyecto.

Sesión 1 (2026-06-06, Claude Code Sonnet): DOCS_ONLY / strategic. Registrado nuevo driver estratégico: suscripción de Elementor Pro cancelada. La dependencia de Elementor Pro pasa a ser un factor a evaluar en AS-IS y TARGET. No se decide migración ni arquitectura. Próximo bloque recomendado: revisar AS-IS con el impacto de Elementor incluido, luego preparar TARGET_OPTIONS.

Sesión 002 (2026-06-06, Claude Code Sonnet): LITE / DOCS_ONLY / security-sync. SEC-001 y SEC-002 marcados RESUELTOS por confirmación manual del operador. AS_IS_UNDERSTANDING.md actualizado con versiones confirmadas (WP 7.0, WooCommerce 10.8.1), hosting server (com1014, cPanel 134.0, Apache 2.4.67, MariaDB 11.4.10-cll-lve), matiz Elementor Pro (caduca en semanas), LiteSpeed como problema (ralentiza la web), hipótesis workflow/AI-first validada, Bloque 3 validado. BACKLOG.md: bloqueante SEC eliminado, nueva tarea SERVER_CONTEXT_CHECK_READONLY añadida. No se tocó código, WordPress, producción, credenciales, hosting, Google Cloud ni dominio.

Sesión 003 (2026-06-10, Claude Code Sonnet): API_FAST_DISCOVERY / SERVER_CONTEXT_CHECK_READONLY. Evidencias recopiladas vía WP Admin (Salud del sitio + WooCommerce System Status) sin SSH. Confirmados: WP 7.0, PHP 8.3.31, servidor HTTP LiteSpeed (no Apache — corrección AS-IS), 28 productos, HPOS activo, WooPayments live, 19 plugins activos, 3 inactivos. **Dato crítico: Elementor Pro expira ~2026-07-01, operador NO renueva** — pasa a ser el driver y deadline de TARGET_OPTIONS. Riesgos detectados: OPcache lleno (16 bytes libres), WP_MEMORY_LIMIT=40M, mini-cart override Elementor desactualizado, WPS Hide Login inactivo. AS_IS_UNDERSTANDING.md actualizado con todos los datos confirmados, 7 nuevos PROBs añadidos (09-15). BACKLOG.md actualizado. No se tocó código, WordPress, producción, credenciales ni hosting.

Sesión 004 (2026-06-10, Claude Code Sonnet): DOCS_ONLY / as-is-validation. **AS-IS validado por el operador.** AS_IS_UNDERSTANDING.md cambiado de BORRADOR a VALIDADO_POR_USUARIO. VALIDATION_RECORD.md con VAL-004. BACKLOG.md, CONTEXTO.md, HISTORIAL_SESIONES.md y agent_events.jsonl actualizados. Workflow pasa a AS_IS_VALIDADO. Siguiente sesión: TARGET_OPTIONS con deadline ~2026-07-01. No se tocó código, WordPress ni producción.

Sesión 004c (2026-06-13, Claude Code Sonnet): LITE / DOCS_ONLY / repo-os-sync. Transferencia de aprendizajes genéricos de Bijuymoda Suite al sistema operativo documental de Catenaccio. Actualizado ORCHESTRATOR.md (stack real, lectura proporcional +git step 0, guardrails de dominio, tabla de agentes, §16 WORKSTREAM_ANCHOR, §17 TARGET binario), AGENTS.md (tabla de superficies específica, guardrails de dominio, stop-loss con clasificación, microparches WP), CHATGPT_PROJECT_INSTRUCTIONS.md (estado actual, agentes, workstream anchor). No se tocó WordPress, producción, TARGET_OPTIONS ni Bijuymoda Suite.

Sesión 005 (2026-06-13, Claude Code Sonnet): DOCS_ONLY / strategic / TARGET_OPTIONS. TARGET_OPTIONS.md completado con comparativa A/B/C/D/E, tabla comparativa, riesgos, plan 7/30/90 días. Veredicto inicial: APPROVE Opción A — WP+WC sin Elementor Pro. [CORREGIDO en 005b]

Sesión 005b (2026-06-13, Claude Code Sonnet): DOCS_ONLY / strategic / ROOT_CAUSE_AND_TARGET_REFRAME. TARGET_OPTIONS.md reescrito con causa raíz de la fricción real (5 bloqueantes: Elementor, backoffice, catálogo, performance, visión). Veredicto corregido: APPROVE A0 + B1. Modelo de acceso sin SSH definido.

Sesión 005c (2026-06-13, Claude Code Sonnet): DOCS_ONLY / strategic / MARKETPLACE_NORTH_STAR. Marketplace multi-vendor añadido como visión a largo plazo (NORTH_STAR). Fases 1-4 documentadas. Gates explícitos para abrir Fase 4. Implicaciones de diseño ahora sin construir el marketplace. DECISIONS.md con PEND-2. BACKLOG.md con MARKETPLACE_NORTH_STAR_VALIDATION en LATER. Recomendación A0+B1 sin cambios. No se tocó WordPress, producción, pagos ni código.

Sesión 005d (2026-06-13, Claude Code Sonnet): DOCS_ONLY / approve + push. **TARGET A0 + B1 APROBADO** por el operador ("APPROVE A0 + B1. Marketplace queda como NORTH_STAR / DEFER."). TARGET_OPTIONS.md → OPCIÓN_APROBADA. VALIDATION_RECORD.md con VAL-005. DECISIONS.md DEC-8 cerrada. BACKLOG.md bloqueo levantado, nuevas tareas NOW (A0_IMPLEMENTATION_PLAN, B1_CATENACCIO_STUDIO_SEED, CMS_API_ACCESS_MODEL_READONLY). Commits 005/005b/005c/005d pusheados a origin/main. Workflow: TARGET_APROBADO. No se tocó WordPress, producción, pagos ni código.

Sesión 006 (2026-06-13, Claude Code Sonnet): DOCS_ONLY / ACCESS_MODEL_NO_SSH. Modelo de acceso sin SSH definido: 4 capas (sin acceso servidor / WP Admin manual / WP+WC REST API / cPanel+Raiola), 6 modos de operación (READ_ONLY, API_READ_ONLY, DRAFT_ONLY, APPLY_WITH_APPROVAL, MANUAL_BY_PABLO, BLOCKED_WITHOUT_STAGING), matriz completa tarea→canal→permisos→riesgo, guía App Password + WC API Key, modelo de revocación, operaciones bloqueadas sin staging + procedimiento microfix, plan OPcache/Raiola. DECISIONS.md DEC-9. BACKLOG.md actualizado. Siguiente: Sesión 007 (auditoría Elementor Library) + Sesión 008 (Pablo crea credenciales según §6 del modelo). No se tocó WordPress, producción, credenciales, cPanel ni código.

Sesión 007b (2026-06-13, Claude Code Sonnet): READ_ONLY / WP_WC_API_AUTH_PROBE. Probe autenticado completo. Usuario `catenaccio-studio-agent` (id=16, rol=shop_manager) verificado. WC REST API v3: 28 productos, 7 atributos (pa_liga×6 terms, pa_equipo×21 terms), categorías. **Hallazgo crítico: productos usan ACF meta fields con term IDs (no WC attributes[]).** Studio debe escribir en meta_data: `liga`/`equipo`/`ano_temporada` como IDs de término, `talla`/`condicion` como strings. Elementor: Pro `isExpired:false`, 14 templates listados (12/14 son Pro por tipo), contenido de cada template requiere Administrator (shop_manager recibe 403 en elementor/v1/post y wp/v2/elementor_library context=edit). `API_READONLY_PROBE_RESULT.md` actualizado con hallazgos completos. Ningún write al sitio.

Sesión 007 (2026-06-13, Claude Code Sonnet): READ_ONLY / WP_WC_API_READONLY_PROBE. Probe público completado. Endpoints sin auth: `/wp-json/` 200 OK (37 namespaces, elementor-pro/v1 activo, confirma Pro en servidor), `wp/v2/types` 200 OK (elementor_library visible como post type), `wc/store/v1/products` 200 OK (28 productos confirmados, 4 categorías, precios EUR). Endpoints autenticados: todos 401 — `.env.local` vacío. Bloqueante: Pablo completa `.env.local` con WP_APP_USER (Shop Manager) y WP_APP_PASSWORD. Descubrimiento clave: elementor_library auditable 100% por API con auth (`wp/v2/elementor_library?context=edit`), sin capturas manuales. WC Store API no expone atributos custom — se necesita wc/v3 con auth. `API_READONLY_PROBE_RESULT.md` creado. No se tocó WP, no se hizo ningún write.

Sesión 006d (2026-06-13, Claude Code Sonnet): DOCS_ONLY / REORDER_ACCESS_FIRST. Orden operativo corregido: access-first es la política activa. Añadido ACCESS_MODEL_ACTIVATION_READONLY como primera acción en BACKLOG NOW. Añadido WP_WC_API_READONLY_PROBE como segunda acción. A0_ELEMENTOR_DEPENDENCY_AUDIT pasa a ser vía agente con acceso real (no depende de lista manual de Pablo como vía principal). B1_CATENACCIO_STUDIO_SEED movido de NOW a NEXT. Tareas stock/Excel/Vinted/imágenes confirman posición NEXT (no acción inmediata de Pablo). CONTEXTO.md siguiente paso actualizado con orden correcto 4 pasos. STOCK_OPERATIONS_MODEL.md con nota de que no bloquea A0. DEC-9 con nota access-first como política operativa. No se tocó WordPress, producción, código ni credenciales.

Sesión 006c (2026-06-13, Claude Code Sonnet): DOCS_ONLY / B1_STOCK_OPERATIONS_MODEL_CAPTURE. Operativa real de stock modelada en `docs/operations/STOCK_OPERATIONS_MODEL.md`. Catenaccio Studio definido como PIM + gestor de estados + asistente de publicación. 11 estados del ciclo de vida de una camiseta. 8 bloques de campos mínimos Studio (identificación, compra/coste, precio/margen, atributos WC, contenido Claude, imágenes, estado/publicación, ubicación). Recomendación imágenes: Opción A en MVP (carpetas locales + ruta), escalar a C (upload directo WC API) cuando Studio esté en uso. Guía migración Excel en 3 pasos: no importar todavía, entender columnas reales, plantilla CSV futura. Qué NO construir en MVP. BACKLOG.md con 5 tareas derivadas nuevas (EXCEL_STOCK_IMPORT_MAPPING, LOCAL_IMAGE_FOLDER_WORKFLOW, VINTED_PUBLICATION_TRACKING, STUDIO_PRODUCT_STATUS_PIPELINE, +). No se tocó WordPress, producción, código ni credenciales.

