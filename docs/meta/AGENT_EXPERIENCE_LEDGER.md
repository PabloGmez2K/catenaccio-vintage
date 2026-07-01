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

## MEDIA_UPLOAD_BROWSER_TO_STORAGE_PATTERN — Subida de imágenes/archivos en Studio (Next.js)

- **Aplica a:** cualquier flujo de subida de archivos binarios desde el navegador en Studio (Next.js App Router + Supabase).
- **Camino conocido:** (1) subir el archivo directo del navegador a Supabase Storage con el cliente browser (`studio/lib/supabase/browser.ts`); (2) dejar la Server Action solo para registrar metadata ligera (`registerUploadedItemImage`), nunca el binario; (3) optimizar client-side antes de subir (WebP, lado máx. 2200px, calidad 0.86, Canvas API nativa, fallback al original si el navegador no soporta WebP); (4) reverificar `owner_id = user.id` sobre `inventory_items` antes de tocar `media_assets`/Storage; (5) limpiar el objeto de Storage si el insert en DB falla.
- **Callejones sin salida:** subir el binario a través de una Server Action → choca con el límite por defecto de ~1 MB de `serverActions.bodySizeLimit`. **NO** ampliar `bodySizeLimit` para meter binarios grandes: cambiar la arquitectura a browser→storage.
- **Pitfalls:** el cliente Supabase de browser puede existir en el repo pero estar sin uso; nunca exponer `service_role` en cliente (usar anon key + cookies de sesión); mantener `storage_path`/`mime_type`/`size_bytes` reflejando el archivo final optimizado, no el original.
- **Cadena/agente recomendado:** Sonnet para la implementación local; Antigravity para validación visual del panel de imágenes; Pablo prueba manual antes de cerrar.
- **Ref ganadora:** `docs/studio/STUDIO_IMAGE_PIPELINE_LOCAL_STORAGE_RESULT.md`, `docs/studio/STUDIO_IMAGE_PIPELINE_SCHEMA.sql`, `studio/app/inventory/image-actions.ts`.
- **Historia:** S026A — primera versión vía Server Action falló en 1 MB → refactor a browser→storage + WebP client-side → `PABLO_IMAGE_STORAGE_FINAL_OK`.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-07-01 — S026A

---

## VISUAL_UX_NOT_DONE_UNTIL_USER_FEELS_IT — Cierre de capacidades con interfaz visible

- **Aplica a:** cualquier bloque que entregue UI visible u operativa (formularios, backoffice, paneles, flujos con espera).
- **Camino conocido:** (1) build/typecheck/lint PASS es condición necesaria, no suficiente; (2) exigir prueba manual del operador (`PABLO_VISUAL_OK` / `*_OK`) antes de cerrar; (3) toda acción que tarde >1–2 s debe tener loading state antes de cerrar; (4) si cambia el comportamiento funcional, revisar el microcopy relacionado en la misma pasada; (5) tratar la fricción de flujo que reporta el operador como señal de producto, no polish opcional.
- **Callejones sin salida:** cerrar con "validación técnica PASS" tapando fricción real de producto; aceptar como deuda una pieza que es parte del flujo mínimo útil (p. ej. la optimización WebP en S026A); cerrar antes de que el operador toque la UI.
- **Pitfalls:** los textos de UI quedan desalineados tras cambios funcionales (copy viejo); acciones que tardan segundos parecen colgadas sin spinner (S026B create+attach).
- **Cadena/agente recomendado:** Antigravity como surface de validación visual/UX (copy viejo, loading states, modales nativos, selects, mobile/desktop); Sonnet para el micro-fix; cierre por Pablo.
- **Ref ganadora:** `docs/studio/STUDIO_WP_MEDIA_ATTACH_RESULT.md`, commits `691dc0f` (loading feedback) y `c4ded65` (copy fix).
- **Historia:** S026A/S026B — se tendió a cerrar antes de que Pablo detectara UX/copy; dos micro-fixes posteriores lo corrigieron.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-07-01 — S026A/S026B

---

## SHADOW_FIRST_WOO_ATTACH_PATTERN — Escritura hacia canal externo vivo tras flag

- **Aplica a:** integraciones que escriben a un canal externo vivo (Woo/WP) desde Studio y quieren ship en shadow antes de activar.
- **Camino conocido:** (1) gate por feature flag server-side default OFF (`STUDIO_WC_ATTACH_IMAGES_ENABLED`, mismo patrón que `STUDIO_AI_ENABLED`, sin `NEXT_PUBLIC_*`); (2) incluir el payload extra (`images:[{src:public_url,position}]`) solo si el flag está ON y hay datos; (3) tras el 201, mapear la respuesta por índice hacia el registro local (`media_assets.wc_media_id`/`upload_status`) best-effort, **nunca** revertir el recurso ya creado si el conteo no cuadra; (4) preservar idempotencia (STOP antes de tocar imágenes si `wc_product_id` ya existe); (5) Pablo activa el flag en `.env.local` (no el agente) y prueba con 1 borrador real.
- **Callejones sin salida:** activar por defecto; revertir el draft creado por un fallo en el mapeo secundario; el agente tocando `.env.local`.
- **Pitfalls:** sideload de URL pública requiere que Storage sea accesible; el create+attach tarda varios segundos → necesita loading state (ver `VISUAL_UX_NOT_DONE_UNTIL_USER_FEELS_IT`).
- **Cadena/agente recomendado:** Sonnet ASK→CODE para la integración; Antigravity para validar el resultado en WP Admin como usuario; Codex para el cierre determinista.
- **Ref ganadora:** `docs/studio/STUDIO_WP_MEDIA_ATTACH_RESULT.md`, `studio/lib/wc/bridge.ts` (v2.2), `studio/lib/media/item-images.ts`.
- **Historia:** S026B — attach en el create bajo flag OFF; `PABLO_WP_MEDIA_ATTACH_OK`; pendiente cierre documental formal.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-07-01 — S026B

---

## ANTIGRAVITY_VISUAL_VALIDATION_GATE — Cuándo entra Antigravity

- **Aplica a:** cualquier bloque de Studio con interfaz visible que necesite validación visual/UX antes o después del patch.
- **Camino conocido:** Antigravity entra en (a) diagnóstico visual de formularios/backoffice; (b) validación mobile/desktop; (c) detección de copy viejo, loading states, modales nativos, selects incómodos; (d) revisión pre-deploy de Studio como usuario en URL real (después de Codex/infra). Complementa la prueba manual de Pablo, no la sustituye.
- **Callejones sin salida:** usar Antigravity para patches quirúrgicos (eso es Sonnet); usarlo en sesiones docs-only; saltárselo en bloques con UX visual (déficit detectado hoy).
- **Pitfalls:** no integrarlo deja que fricción de UX/copy se descubra tarde (post-cierre), como en S026A/S026B.
- **Cadena/agente recomendado:** Antigravity como surface visual; Sonnet patch; Opus decisiones de backlog/arquitectura; Codex cierres/validaciones deterministas.
- **Ref ganadora:** este ledger + `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md SLT-009`.
- **Historia:** Regla derivada del day-close 2026-07-01 (Pablo señaló infrautilización de Antigravity). Aún sin sesión de reuso.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-07-01 — Day-close S025/S026

---

## STUDIO_MVP_FEATURE_DONE_GATE — Cuándo una feature Studio visible está DONE

- **Aplica a:** cualquier bloque MVP de Studio que entregue una capacidad con interfaz visible u operativa. Gate de cierre, no de implementación.
- **Checklist DONE (todas obligatorias):** una feature Studio visible solo está DONE si:
  1. validaciones técnicas PASS (typecheck/build/lint/diff-check/secret scan);
  2. flujo real probado por Pablo (`*_VISUAL_OK` / `PABLO_*_OK`) **o** Antigravity visual pass;
  3. estados loading/success/error visibles (loading para toda acción >1–2 s);
  4. microcopy coherente con el comportamiento real;
  5. sin texto antiguo que contradiga el comportamiento nuevo;
  6. siguiente paso operativo claro;
  7. sin deuda crítica disfrazada de polish (si es parte del flujo mínimo útil, no es deuda).
- **Protocolo de prompt inicial (para no descubrir esto tarde):** todo prompt de feature visible declara desde el inicio (a) UX states empty/loading/success/error; (b) microcopy afectado; (c) mobile/desktop si aplica; (d) autosave o save explícito; (e) comportamiento en flujos lentos; (f) rollback/error state; (g) definición visual de DONE. Agrupar microfixes relacionados dentro del bloque antes de cerrar; no cerrar tras el primer PASS técnico si Pablo aún no probó el flujo completo.
- **Objetivo de velocidad por bloque MVP:** 1 sesión ASK/readiness (si hay incertidumbre) + 1 CODE + 1 visual QA/patch (si hay UI) + 1 cierre LITE. Si se supera → `STOP_AND_REPLAN`: revisar si el prompt inicial fue pobre, si faltó Antigravity o si el bloque estaba mal cortado.
- **Callejones sin salida:** cerrar con solo build/lint verde; cerrar antes de que el operador toque el flujo; dejar copy falso o UX ambigua; aceptar como deuda algo que es parte del flujo mínimo útil.
- **Cadena/agente recomendado:** Sonnet CODE → Antigravity visual QA (si hay UI) → prueba manual de Pablo → Codex cierre LITE determinista. Opus solo para decisiones de backlog/arquitectura.
- **Ref ganadora:** `docs/meta/SESSION_LEARNING_TRANSFER_QUEUE.md SLT-009`; entradas `VISUAL_UX_NOT_DONE_UNTIL_USER_FEELS_IT` y `ANTIGRAVITY_VISUAL_VALIDATION_GATE` de este ledger.
- **Historia:** Derivada del day-close 2026-07-01. Motivo: S026A/S026B superaron el objetivo de velocidad por prompts sin Definición de DONE visual y sin Antigravity (no por bloque mal cortado). Aún sin sesión de reuso.
- **Estado:** PROVISIONAL
- **Actualizado:** 2026-07-01 — Day-close S025/S026

---

## Historial del Ledger

| Fecha | Cambio |
|-------|--------|
| 2026-06-24 | Creado. Sesión 014 (meta-alineación). 4 entradas de tareas pasadas + 2 placeholders para flujos futuros de email y hooks WC. |
| 2026-07-01 | Day-close S025/S026. +5 entradas: MEDIA_UPLOAD_BROWSER_TO_STORAGE_PATTERN, VISUAL_UX_NOT_DONE_UNTIL_USER_FEELS_IT, SHADOW_FIRST_WOO_ATTACH_PATTERN, ANTIGRAVITY_VISUAL_VALIDATION_GATE, STUDIO_MVP_FEATURE_DONE_GATE (todas PROVISIONAL). Incluye protocolo de prompt visual y objetivo de velocidad por bloque MVP. |
