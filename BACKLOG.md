# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [x] **TARGET_OPTIONS APROBADO** — 2026-06-13 (Sesión 005d). Operador aprueba A0 + B1. Marketplace = NORTH_STAR / DEFER. Ver `docs/discovery/TARGET_OPTIONS.md`.
- [ ] **A0_ELEMENTOR_AUDIT** — auditar los 19 items de elementor_library: clasificar cuáles usan widgets Pro exclusivos vs. widgets Free o migrables a Gutenberg/WooCommerce Blocks. Sesión 007. Prerequisito: Pablo entrega lista o capturas del Elementor Library.
- [x] **B1_STOCK_OPERATIONS_MODEL** — modelo operativo de stock definido en `docs/operations/STOCK_OPERATIONS_MODEL.md` (Sesión 006c). Ciclo de vida de producto (11 estados), campos mínimos Studio, recomendación imágenes locales (Opción A→C), guía migración Excel. Ver §8 para tareas derivadas.
- [ ] **B1_CATENACCIO_STUDIO_SEED** — arrancar el diseño de Catenaccio Studio: formulario, campos, stack Next.js, scaffold inicial. Parallel a Track 0.
- [x] **CMS_API_ACCESS_MODEL_READONLY** — modelo de acceso sin SSH definido en `docs/operations/ACCESS_MODEL_NO_SSH.md` (Sesión 006). Guía paso a paso lista en §6. **Pendiente de ejecución por Pablo** (crear usuario + Application Password — 10-15 min en WP Admin). Prerequisito para Studio.
- [ ] **Auditoría Elementor Pro templates (Track 0)** — listar los 19 items en elementor_library y clasificar cuáles usan widgets Pro exclusivos. WP Admin read-only. Urgente: deadline 2026-07-01.
- [ ] Arreglar OPcache (PROB-09) — solicitar a Raiola aumentar `opcache.memory_consumption`.

---

## NEXT — Próximo mes

**Track 0 (continuidad Elementor):**
- [ ] Migrar Cart y Mi Cuenta a WooCommerce Blocks si están en Elementor.
- [ ] Reemplazar mini-cart override de Elementor Pro (PROB-11).
- [ ] Evaluar catálogo (shop, categorías, producto): Loop Grid Pro → template PHP nativo si necesario.
- [ ] Habilitar WPS Hide Login (PROB-12) — 10 minutos en WP Admin.
- [ ] Investigar webhooks de PayPal (PROB-14).

**Track 1 (Catenaccio Studio):**
- [ ] **STUDIO_MVP_DESIGN** — diseñar formulario Studio con campos exactos de camiseta vintage. Decidir stack (Next.js + WC REST API). Scaffold inicial. Ver campos en `docs/operations/STOCK_OPERATIONS_MODEL.md §3`.
- [ ] **PRODUCT_WORKFLOW_DESIGN** — documentar el flujo completo: foto → Studio → Claude → borrador WC → aprobación Pablo → publicado. Ver flujo principal en `STOCK_OPERATIONS_MODEL.md §7`.
- [ ] **WC_API_ACCESS_MODEL** — Application Password, usuario limitado, endpoints necesarios. Testar `POST /wp-json/wc/v3/products` con atributos custom (pa_liga, pa_equipo, etc.).
- [ ] **EXCEL_STOCK_IMPORT_MAPPING** — Pablo comparte columnas reales de `STOCK.xlsx`. Preparar plantilla CSV compatible con Studio para migración futura. Prerequisito: ver `STOCK_OPERATIONS_MODEL.md §5`.
- [ ] **LOCAL_IMAGE_FOLDER_WORKFLOW** — confirmar ruta y estructura de carpetas locales de fotos. Implementar campo `carpeta_local` en Studio. Evaluar cuando añadir upload directo (Opción C).
- [ ] **VINTED_PUBLICATION_TRACKING** — diseñar recordatorio de Vinted en Studio: qué camisetas están en `PUBLICADA_WEB` sin url_vinted. UI de alerta o lista de pendientes Vinted.
- [ ] **STUDIO_PRODUCT_STATUS_PIPELINE** — implementar vista de tabla de inventario en Studio con 11 estados, filtros por estado, columnas: Referencia / Estado / Fotos / Web / Vinted / Coste / Precio / Días en stock.
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

- [ ] **Studio API access** — Studio no puede arrancar hasta que Pablo ejecute la guía §6 de `docs/operations/ACCESS_MODEL_NO_SSH.md` (crear usuario limitado + Application Password). Estimado: 10-15 min manual en WP Admin. Sesión 008.



_(sin bloqueos activos — TARGET aprobado, implementación desbloqueada)_

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
