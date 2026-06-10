# BACKLOG.md — Catenaccio Vintage

Fuente de verdad de qué hacer. **El chat no es el backlog. Este archivo sí.**

Actualizar al cierre de cada sesión. Los ítems completados se mueven a DONE o se tachan.
**Quién mantiene:** Orquestador tras cada sesión, Opus cuando emite veredicto.

---

## NOW — Esta semana / próxima sesión

- [ ] **Preparar TARGET_OPTIONS** — AS-IS validado (2026-06-10). Deadline real: ~2026-07-01 (expiración Elementor Pro). Evaluar mínimo: a) WP+WC sin Elementor Pro; b) WP headless; c) migración a stack moderno; d) aplazar migración y priorizar catálogo.
- [ ] Verificar páginas Carrito y Mi Cuenta en el front-end (PROB-13 — posible falso positivo Elementor).
- [ ] Decidir qué hacer con OPcache lleno (PROB-09) y WP_MEMORY_LIMIT 40M (PROB-10).

---

## NEXT — Próximo mes

- [ ] Sintetizar y aprobar TARGET_OPTIONS.
- [ ] Preparar TARGET_OPTIONS comparando, como mínimo:
  - a) Mantener WordPress/WooCommerce con menor dependencia de Elementor Pro.
  - b) WordPress como backend/headless (frontend desacoplado).
  - c) Reconstrucción/migración a Next.js/React/Vercel u otra arquitectura moderna.
  - d) Aplazar migración y priorizar catálogo/operativa primero.

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
