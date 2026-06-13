# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [x] **TARGET_OPTIONS preparado** — 2026-06-13 (Sesión 005). Ver `docs/discovery/TARGET_OPTIONS.md`. Veredicto: APPROVE Opción A (WP+WC sin Elementor Pro). Pendiente de aprobación del operador.
- [ ] **[BLOQUEANTE] Operador aprueba TARGET Opción A** — responder a la pregunta de la sección 9 de TARGET_OPTIONS.md. Si aprueba → generar RECOMMENDED_IMPLEMENTATION_PLAN.md + SEED.
- [ ] **Auditoría Elementor Pro templates** — listar los 19 items en elementor_library y clasificar cuáles usan widgets Pro exclusivos. Paso 0 de la implementación de Opción A. Hacerlo en WP Admin (read-only).
- [ ] Verificar páginas Carrito y Mi Cuenta en el front-end (PROB-13 — parte de la auditoría de Opción A).
- [ ] Arreglar OPcache lleno (PROB-09) — aumentar `opcache.memory_consumption` en cPanel o solicitar a Raiola. Urgente: nuevos archivos PHP no se cachean.

---

## NEXT — Próximo mes

- [ ] Migrar Cart y Mi Cuenta a WooCommerce Blocks (parte de Opción A — tras aprobación del operador).
- [ ] Reemplazar mini-cart override de Elementor Pro (PROB-11) — solución nativa WC.
- [ ] Evaluar páginas de catálogo (shop, categorías, producto): identificar cuáles usan Loop Grid Pro y proponer alternativa con bloques WC o template PHP nativo.
- [ ] Habilitar WPS Hide Login (PROB-12) — 10 minutos en WP Admin.
- [ ] Investigar webhook de PayPal (PROB-14) — verificar en WC → PayPal → webhooks.
- [ ] Subir 10-20 productos nuevos con workflow AI-first (foto → Claude → WP Admin). Objetivo: 50 productos en 30 días.

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
