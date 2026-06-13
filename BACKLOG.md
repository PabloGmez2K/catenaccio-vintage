# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [x] **TARGET_OPTIONS APROBADO** — 2026-06-13 (Sesión 005d). Operador aprueba A0 + B1. Marketplace = NORTH_STAR / DEFER. Ver `docs/discovery/TARGET_OPTIONS.md`.
- [x] **CMS_API_ACCESS_MODEL_READONLY** — modelo de acceso sin SSH definido en `docs/operations/ACCESS_MODEL_NO_SSH.md` (Sesión 006). Guía paso a paso lista en §6.
- [x] **B1_STOCK_OPERATIONS_MODEL** — modelo operativo de stock definido en `docs/operations/STOCK_OPERATIONS_MODEL.md` (Sesión 006c). Contexto capturado para B1 — no bloquea A0 ni la activación del acceso.
- [ ] **ACCESS_MODEL_ACTIVATION_READONLY** ⟵ **PRIMERA ACCIÓN** — Pablo crea el usuario WP limitado + Application Password siguiendo `docs/operations/ACCESS_MODEL_NO_SSH.md §6`. Estimado: 10-15 min en WP Admin, sin agente. Prerequisito para TODO lo que sigue: auditoría Elementor, Studio, probe API. Ver también: ticket a Raiola sobre OPcache siguiendo §9 del mismo doc.
- [ ] **WP_WC_API_READONLY_PROBE** — primera llamada de solo lectura a WC REST API tras credenciales creadas: `GET /wp-json/wc/v3/products` + `GET /wp-json/wc/v3/products/attributes`. Confirma que el acceso funciona antes de auditar Elementor. El agente ejecuta esto, no Pablo.
- [ ] **A0_ELEMENTOR_DEPENDENCY_AUDIT** — auditar los 19 items de elementor_library vía WP Admin / API (no requiere lista manual de Pablo si hay acceso activo). Clasificar widgets Pro exclusivos vs. Free o migrables a Gutenberg/WooCommerce Blocks. Urgente: deadline 2026-07-01.
- [ ] **Arreglar OPcache (PROB-09)** — Pablo abre ticket a Raiola para aumentar `opcache.memory_consumption`. Acción paralela, sin agente.

---

## NEXT — Próximo mes

**Track 0 (continuidad Elementor) — después de A0_ELEMENTOR_DEPENDENCY_AUDIT:**
- [ ] Migrar Cart y Mi Cuenta a WooCommerce Blocks si están en Elementor.
- [ ] Reemplazar mini-cart override de Elementor Pro (PROB-11).
- [ ] Evaluar catálogo (shop, categorías, producto): Loop Grid Pro → template PHP nativo si necesario.
- [ ] Habilitar WPS Hide Login (PROB-12) — 10 minutos en WP Admin.
- [ ] Investigar webhooks de PayPal (PROB-14).

**Track 1 (Catenaccio Studio) — después de WP_WC_API_READONLY_PROBE confirmado:**
- [ ] **B1_CATENACCIO_STUDIO_SEED** — arrancar el diseño de Catenaccio Studio: formulario, campos, stack Next.js, scaffold inicial. Parallel a Track 0 una vez el acceso API esté activo.
- [ ] **STUDIO_MVP_DESIGN** — diseñar formulario Studio con campos exactos de camiseta vintage. Decidir stack (Next.js + WC REST API). Scaffold inicial. Ver campos en `docs/operations/STOCK_OPERATIONS_MODEL.md §3`.
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

- [ ] Generar SEED implementable final.
- [ ] Iniciar implementación técnica.
- [ ] **MARKETPLACE_NORTH_STAR_VALIDATION** — evaluar si Catenaccio tiene tracción suficiente para abrir a vendedores externos. Solo activar cuando se cumplan TODOS los gates de TARGET_OPTIONS.md §11: 100+ productos propios, workflow ≤10 min, tráfico orgánico, ventas recurrentes, propuesta de valor clara frente a Vinted, sistema de autenticidad definido. Ver DECISIONS.md PEND-2.

---

## BLOCKED — No avanzar hasta que...

- [ ] **Toda operación API / auditoría Elementor / Studio** — bloqueada hasta que Pablo complete `ACCESS_MODEL_ACTIVATION_READONLY` (ver NOW): crear usuario limitado + Application Password en WP Admin siguiendo `ACCESS_MODEL_NO_SSH.md §6`. 10-15 min, sin agente.

_(sin otros bloqueos activos — TARGET aprobado, implementación desbloqueada, orden corregido en Sesión 006d)_

- [x] ~~Implementación técnica bloqueada hasta AS-IS validado y TARGET aprobado.~~ — DESBLOQUEADO 2026-06-13 (TARGET APROBADO)

---

## DONE — Completado

| Ítem | Fecha | Sesión |
|------|-------|--------|
| Init desde lafabrica-template | 2026-06-06 | Sesión 0 |
| SEC-001 resuelto — OAuth Google / Nextend Social Login rotado por operador | 2026-06-06 | Sesión 002 |
| SEC-002 resuelto — WP secret keys rotadas en servidor por operador | 2026-06-06 | Sesión 002 |
| SERVER_CONTEXT_CHECK_READONLY completado — evidencia via WP Admin/WC Status (no SSH) | 2026-06-10 | Sesión 003 |
| AS_IS_UNDERSTANDING.md actualizado con datos reales del servidor (plugins, versiones, HPOS, OPcache, Elementor Pro deadline) | 2026-06-10 | Sesión 003 |
| AS_IS_UNDERSTANDING.md validado por operador — estado cambiado a VALIDADO_POR_USUARIO | 2026-06-10 | Sesión 004 |
| ACCESS_MODEL_NO_SSH.md creado — modelo de acceso sin SSH completo: capas, matriz, modos, credenciales, guía App Password, revocación, staging, OPcache/Raiola | 2026-06-13 | Sesión 006 |
| STOCK_OPERATIONS_MODEL.md creado — ciclo de vida de producto (11 estados), campos mínimos Studio (8 bloques), recomendación imágenes (A→C), guía migración Excel, tareas derivadas | 2026-06-13 | Sesión 006c |
| TARGET_OPTIONS.md preparado — comparativa A/B/C/D/E, veredicto APPROVE Opción A, plan 7/30/90 días | 2026-06-13 | Sesión 005 |
| TARGET_OPTIONS.md corregido — Root Cause añadida, veredicto corregido a A0+B1 (Catenaccio Studio), modelo acceso API | 2026-06-13 | Sesión 005b |
| TARGET_OPTIONS.md — Marketplace North Star añadido: fases 1-4, gates, implicaciones de diseño | 2026-06-13 | Sesión 005c |
| **TARGET A0 + B1 APROBADO** por el operador. VALIDATION_RECORD.md con VAL-005. DECISIONS.md DEC-8 cerrada. Implementación desbloqueada. | 2026-06-13 | Sesión 005d |
