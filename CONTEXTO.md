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

**ORDEN CORRECTO — estado actualizado Sesión 008:**
1. ✅ Acceso confirmado: `catenaccio-studio-agent` (shop_manager), WC REST API v3 operativo.
2. ✅ Probe completo: 28 productos, 7 atributos, Elementor Pro activo (`isExpired:false`), 14 templates listados.
3. ✅ Hallazgo crítico: productos usan ACF meta fields (no WC attributes[]). Studio escribe en `meta_data`.
4. ✅ A0_ELEMENTOR_DEPENDENCY_AUDIT completo. Widget-level: 15/20 elementos requieren migración. CRÍTICOS: header (653), producto (100), archive (129). Carrito/Mi Cuenta usan Pro. Checkout en Blocks ✅. Ver `ELEMENTOR_DEPENDENCY_AUDIT.md`.
5. ✅ Ventana admin cerrada. `catenaccio-studio-agent` verificado como `shop_manager` (Sesión 008b).
6. ~~**Sesión 010A — SERVER_FILESYSTEM_READONLY_DISCOVERY:** intentado vía WebDAV — **BLOCKED** (puertos 2077/2078 bloqueados por Raiola).~~
7. ✅ **Sesión 010B — SERVER_FILESYSTEM_READONLY_DISCOVERY COMPLETADO** vía cPanel UAPI Token. `functions.php` (62KB), `filtro-camisetas.php`, `catenaccio-offcanvas-menu.php` leídos. Veredicto: **APPROVE_A0_MIGRATION_PLAN_PREP**. Script: `scripts/filesystem/cpanel_uapi_probe.py`.
8. **Siguiente acción (agente):** A0_MIGRATION_PLAN — plan técnico completo con código real. Desbloqueado.
9. **Acción Pablo (sin agente, ya posible):** CARRITO_MICUENTA_QUICKWIN — reemplazar widgets Pro en Carrito y Mi Cuenta por shortcodes `[woocommerce_cart]` y `[woocommerce_my_account]` en WP Admin → Elementor. 10 min.

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

Sesión 009 (2026-06-14, Claude Code Sonnet): DOCS_ONLY / GSC_API_READONLY_CONNECTOR_CLOSE. **GSC_API_READONLY_CONNECTOR validado localmente en modo read-only, sin secretos versionados.** Google Search Console API integrada: proyecto Google Cloud creado, API habilitada, OAuth Desktop completado, token local generado, propiedad `https://catenacciovintage.com/` detectada como siteOwner, `searchanalytics.query` devolvió datos reales. `.secrets/` y `.env.local` correctamente ignorados. Script `scripts/seo/gsc_probe.py` y `requirements-gsc.txt` versionados. Documentación creada: `SEARCH_CONSOLE_API_READONLY.md` + `GOOGLE_SEARCH_CONSOLE_READONLY_CONNECTOR_PATTERN.md`. Patrón reusable candidato para lafabrica y Bijuymoda Suite: `LAFABRICA_TRANSFER_GSC_CONNECTOR_PATTERN`. BACKLOG.md y HISTORIAL_SESIONES.md actualizados. No se tocó WordPress, producción, Google Cloud, Search Console, Bijuymoda Suite ni lafabrica.

Sesión 010A (2026-06-14, Claude Code Sonnet): READ_ONLY / SERVER_FILESYSTEM_READONLY_DISCOVERY. **BLOCKED_WEBDAV_CONNECTION.** Web Disk configurado en cPanel pero puertos 2077/2078 bloqueados por firewall Raiola. Subdominio `webdisk.catenacciovintage.com` sin DNS. Puerto 443 devuelve 403 a PROPFIND (WebDAV no habilitado). Script `scripts/filesystem/webdav_probe.py` creado y ejecutado. No se ejecutó ninguna escritura. Ningún secreto impreso ni commiteado. Documento `SERVER_FILESYSTEM_READONLY_DISCOVERY.md` creado con diagnóstico completo, mapa A0 con datos disponibles, y dos rutas de desbloqueo (Ruta A: cPanel File Manager manual; Ruta B: corregir URL WebDAV). Veredicto: FIX_BLOCKER_FIRST. CARRITO_MICUENTA_QUICKWIN disponible sin bloqueo.

Sesión 010C (2026-06-15, Claude Code Sonnet): DOCS_ONLY / NO_SSH_SHADOW_RELEASE_DECISION. **DEC-10 registrada.** Patrón operativo NO_SSH_SHADOW_RELEASE_FLOW documentado en DECISIONS.md. Superficie sombra definida: tema paralelo inactivo `catenaccio-a0-child`. Flujo completo: ventana temporal de acceso → sync a carpeta sombra → validación visual Antigravity → promoción manual Pablo → rollback → cierre de acceso. Acceso cPanel API aprobado solo para READ_ONLY y escritura en carpeta sombra aislada. BACKLOG.md actualizado: CPANEL_TOKEN_REVOCATION (Pablo, sin agente), shadow release track (sesiones 012-015+RELEASE). Patrón no extraído a lafabrica hasta validar con A0 real. No se tocó servidor, WordPress, cPanel, .env.local ni código.

Sesión 010B (2026-06-14, Claude Code Sonnet): READ_ONLY / CPANEL_API_FILESYSTEM_READONLY_PROBE. **CPANEL_API_READONLY_DISCOVERY_COMPLETED.** Pablo creó token de API cPanel. Acceso UAPI Fileman exitoso: `list_files` + `get_file_content` en modo estrictamente read-only. Leídos: `functions.php` (62KB, ~1712 líneas), `style.css`, `filtro-camisetas.php` (39KB, plugin Filtro Camisetas Pro v3.0.0), `catenaccio-offcanvas-menu.php` (14KB, Off-Canvas Menu v2.2.0). 22 plugins listados. mu-plugins vacío. Sin woocommerce/ override directory. Hallazgos críticos: (1) Off-Canvas Menu es shortcode 100% independiente de Elementor — riesgo ELIMINADO; (2) Filtro Camisetas core es WC-nativo — riesgo reducido a BAJO; (3) ACF solo FREE; (4) Todas las shortcodes custom son independientes de Elementor. Veredicto: **APPROVE_A0_MIGRATION_PLAN_PREP**. Script reutilizable `scripts/filesystem/cpanel_uapi_probe.py` para futuras sesiones. No se escribió nada en el servidor. Ningún secreto impreso ni commiteado.

