# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [x] **TARGET_OPTIONS preparado y corregido** — 2026-06-13 (Sesión 005 + 005b). Veredicto: APPROVE A0 + B1. Ver `docs/discovery/TARGET_OPTIONS.md` sección 12.
- [ ] **[BLOQUEANTE] Operador aprueba estrategia A0 + B1** — responder a la pregunta de sección 12 de TARGET_OPTIONS.md. Si aprueba → Sesión 006: Track 0 + arranque Studio.
- [ ] **ROOT_CAUSE_FRICTION_MAP** — validar con el operador que los 5 bloqueantes identificados (Elementor, backoffice, catálogo, performance, visión) son correctos y completos.
- [ ] **Auditoría Elementor Pro templates (Track 0)** — listar los 19 items en elementor_library y clasificar cuáles usan widgets Pro exclusivos. WP Admin read-only.
- [ ] **WC_API_ACCESS_MODEL** — crear Application Password en WP Admin: usuario limitado (Editor de productos), copiar password para Studio. Guía paso a paso en sesión 006.
- [ ] Verificar páginas Carrito y Mi Cuenta en el front-end (PROB-13 — parte del Track 0).
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
- [ ] **STUDIO_MVP_DESIGN** — diseñar formulario Studio con campos exactos de camiseta vintage. Decidir stack (Next.js + WC REST API). Scaffold inicial.
- [ ] **PRODUCT_WORKFLOW_DESIGN** — documentar el flujo completo: foto → Studio → Claude → borrador WC → aprobación Pablo → publicado. Identificar pasos eliminables.
- [ ] **WC_API_ACCESS_MODEL** — Application Password, usuario limitado, endpoints necesarios. Testar `POST /wp-json/wc/v3/products` con atributos custom (pa_liga, pa_equipo, etc.).
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

---

## BLOCKED — No avanzar hasta que...

- [ ] Implementación técnica de nueva arquitectura bloqueada hasta AS-IS validado y TARGET aprobado.

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
| TARGET_OPTIONS.md preparado — comparativa A/B/C/D/E, veredicto APPROVE Opción A, plan 7/30/90 días | 2026-06-13 | Sesión 005 |
| TARGET_OPTIONS.md corregido — Root Cause añadida, veredicto corregido a A0+B1 (Catenaccio Studio), modelo acceso API | 2026-06-13 | Sesión 005b |
