# AGENT_EXPERIENCE_LEDGER.md — Catenaccio Vintage

Registro de caminos conocidos por tipo de tarea recurrente. No es el historial (narrativo/cronológico) — es un índice por tipo de tarea con el mejor camino actual + callejones a evitar.

**Patrón base:** PATTERN-06 — AGENT_EXPERIENCE_LEDGER (ver lafabrica-template/docs/orchestrator/ECOSYSTEM_LEARNING_PATTERNS.md)

**Regla:** Consultar antes de ejecutar una tarea de tipo registrado. Actualizar o crear entrada al cerrar tarea con aprendizaje real. Solo si la tarea es **repetible** y hay camino ganador claro, errores relevantes, o mejora real de token economics.

**Capa:** L1 de PATTERN-05 (AI_FIRST_LAYERED_DOCUMENTATION). Consulta rápida antes de abrir agente.

**Estados:**
- `PROVISIONAL` — capturado una vez, aún no reusado.
- `CONFIRMED_BY_REUSE` — funcionó al repetir la tarea.

---

## CSS_THEME_CHILD — Modificaciones en tema hijo WordPress

- **Aplica a:** edición de style.css, functions.php o archivos PHP del tema hijo (`hello-elementor-child` o `catenaccio-a0-child`)
- **Camino conocido:** (1) Leer el archivo remoto vía cPanel UAPI o descarga manual antes de editar; (2) cambio mínimo en rama local; (3) validación visual Pablo en staging/sombra; (4) sync controlado a servidor con token temporal; (5) revocación del token.
- **Callejones sin salida:** editar directamente en WP Admin sin versión controlada local — no hay rollback limpio.
- **Pitfalls:** OPcache puede servir versión antigua tras sync — puede requerir flush manual o esperar expiración.
- **Cadena/agente recomendado:** Sonnet para el patch; Antigravity para validación visual.
- **Ref ganadora:** `docs/operations/THEME_SHADOW_IMPLEMENT.md`, sesión 013.
- **Historia:** S011 plan → S012 scaffold → S013 implementación local → S014 sync pendiente.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-06-20 — Sesión 013

---

## SHADOW_RELEASE_WORDPRESS — Deploy de tema/plugin sombra sin SSH

- **Aplica a:** cualquier cambio que requiera subir archivos al servidor sin SSH (Raiola Inicio SSD 2.0)
- **Camino conocido:** (1) desarrollar localmente contra recurso inactivo (tema sombra); (2) solicitar acceso cPanel API Token solo al momento del sync; (3) sync a carpeta sombra aislada; (4) validación visual Antigravity sobre tema sombra inactivo; (5) Pablo activa el tema sombra en WP Admin; (6) Pablo revoca el token tras la sesión.
- **Callejones sin salida:** WebDAV (puertos 2077/2078 bloqueados por Raiola — Sesión 010A); FTP sin credenciales aprobadas.
- **Pitfalls:** cPanel UAPI token debe ser revocado manualmente por Pablo al cerrar sesión de sync — no olvidar CPANEL_TOKEN_REVOCATION en BACKLOG.
- **Cadena/agente recomendado:** Sonnet para implementación local; cPanel UAPI para sync; Antigravity para validación visual.
- **Ref ganadora:** `docs/operations/ACCESS_MODEL_NO_SSH.md`, `DECISIONS.md DEC-10`, `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md SLT-001`.
- **Historia:** S010A BLOCKED (WebDAV) → S010B OK (cPanel UAPI read-only) → S013 implementación local lista → S014 sync pendiente.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-06-20 — Sesión 013

---

## WC_API_READONLY_PROBE — Probe de la API WooCommerce REST en modo solo lectura

- **Aplica a:** primer acceso autenticado a la WC REST API v3 de un sitio WooCommerce nuevo
- **Camino conocido:** (1) crear usuario limitado con rol `shop_manager` en WP Admin; (2) generar Application Password; (3) guardar en `.env.local` (nunca en el repo); (4) probar `GET /wp-json/wc/v3/products` con autenticación; (5) probar `GET /wp-json/wc/v3/products/attributes` para atributos.
- **Callejones sin salida:** usar la cuenta admin de Pablo — introduce riesgo de compromiso total.
- **Pitfalls:** los productos de Catenaccio usan ACF `meta_data` (no `attributes[]` de WC) — Studio debe escribir en `meta_data`, no en `attributes`.
- **Cadena/agente recomendado:** Codex o Sonnet para scripts de probe; resultado interpretado por orquestador.
- **Ref ganadora:** `docs/operations/API_READONLY_PROBE_RESULT.md`, sesión 007/007b.
- **Historia:** S007 probe público OK → S007b probe autenticado OK → credenciales verificadas.
- **Estado:** CONFIRMED_BY_REUSE
- **Actualizado:** 2026-06-13 — Sesión 007b

---

## ELEMENTOR_DEPENDENCY_AUDIT — Auditoría de dependencias de Elementor Pro

- **Aplica a:** identificar qué templates/páginas usan widgets Pro antes de migraciones
- **Camino conocido:** (1) listar `elementor_library` vía WC API o phpMyAdmin; (2) identificar widget type por `widgetType` en el JSON; (3) clasificar por criticidad (CRÍTICO/MEDIO/OK); (4) separar páginas WC (Cart, Checkout, My Account) de templates globales.
- **Callejones sin salida:** asumir que "toda la web usa Pro" sin auditoría — sobreestima la migración.
- **Pitfalls:** Checkout en Blocks no requiere migración (Catenaccio ya usa Blocks en Finalizar Compra ✅); Cart y Mi Cuenta sí requieren migración o shortcode swap manual.
- **Cadena/agente recomendado:** Antigravity o Sonnet con acceso WC API.
- **Ref ganadora:** `docs/operations/ELEMENTOR_DEPENDENCY_AUDIT.md`, sesión 008.
- **Historia:** S008 audit completo — 17 templates + 2 páginas WC, 15/20 requieren migración.
- **Estado:** CONFIRMED_BY_REUSE
- **Actualizado:** 2026-06-13 — Sesión 008

---

## WC_EMAIL_FLOW — Flujos de email transaccional WooCommerce

- **Aplica a:** emails de confirmación de pedido, activación de cuenta, recuperación de contraseña, notificaciones de estado de pedido
- **Camino conocido:** (placeholder — completar cuando se aborde este tipo de tarea)
  - Declarar PRODUCTION_ONLY_VALIDATION antes de abrir la tarea
  - Verificar SMTP en WP Admin → WooCommerce → Settings → Emails (o WP Mail SMTP si instalado)
  - Staging sin SMTP real no puede validar recepción — declararlo antes, no al cuarto intento
  - TEST B obligatorio: pedido/cuenta real → verificar recepción en bandeja real
- **Callejones sin salida:** cerrar como PASS con "el log no muestra errores" sin TEST B real (ver DEC-PABLO-02).
- **Pitfalls:** WooCommerce puede usar sendmail nativo del hosting (no fiable en Raiola) en lugar de SMTP configurado. WP Mail SMTP es la solución estándar.
- **Cadena/agente recomendado:** Sonnet para diagnóstico/patches; TEST B manual por Pablo.
- **Ref ganadora:** `PATTERN-08` (TRANSACTIONAL_EMAIL_PRODUCTION_GATE), Playbook §2.
- **Historia:** (sin sesiones aún — placeholder)
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-06-24 — Sesión 014 (meta — preparación de Ledger)

---

## WOOCOMMERCE_HOOK_PATCH — Patches de hooks en WooCommerce

- **Aplica a:** modificaciones a hooks de WooCommerce (woocommerce_created_customer, woocommerce_checkout_order_processed, wc_add_to_cart, etc.)
- **Camino conocido:** (placeholder — completar cuando se aborde este tipo de tarea)
  - Identificar el hook por estado del objeto (Order/Customer), NO por contexto de ejecución (URL, controller class)
  - Usar `$order->get_customer_id() > 0` como discriminador estable para cuentas reales
  - Usar `!$order->get_meta('_guest_checkout')` para excluir invitados
  - Separar sesión de diagnóstico (READ_ONLY) de sesión de implementación (APPLY)
  - Backup verificado por hash antes de cualquier cambio
- **Callejones sin salida:** detectar contexto por `is_checkout()`, `$_SERVER['REQUEST_URI']` o nombre de controller — frágil en AJAX/API (ver PATTERN-09).
- **Pitfalls:** `is_checkout()` puede retornar true en contextos inesperados; hooks corren bajo el controller que los invoca, no el que el desarrollador espera.
- **Cadena/agente recomendado:** Sonnet para implementación; Opus solo si hay lógica de negocio crítica o decisión irreversible.
- **Ref ganadora:** `PATTERN-09` (ECOMMERCE_HOOK_STATE_GUARD), Playbook §3.
- **Historia:** (sin sesiones aún — placeholder)
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-06-24 — Sesión 014 (meta — preparación de Ledger)

---

## Historial del Ledger

| Fecha | Cambio |
|-------|--------|
| 2026-06-24 | Creado. Sesión 014 (meta-alineación). 4 entradas de tareas pasadas + 2 placeholders para flujos futuros de email y hooks WC. |
