# STUDIO_WP_MEDIA_ATTACH_RESULT — S026B

**Resultado:** `READY_FOR_PABLO_WP_MEDIA_ATTACH_SHADOW_TEST`
**Fecha:** 2026-07-01
**Modo:** ASK→CODE / SHADOW_FIRST / LOCAL_CODE / WP_MEDIA_ATTACH / WOO_DRAFT_ONLY / NO_PUBLISH / NO_DEPLOY
**Agente:** Claude Code (Sonnet 5)
**Depende de:** S026A (`DONE / APPROVE_READY_FOR_S026B`), `STUDIO_WC_BRIDGE_CONTRACT.md`, `STUDIO_WC_PAYLOAD_SPEC.md`

---

## 1. Objetivo

Adjuntar las imágenes de Studio (`media_assets`, S026A) al borrador WooCommerce en el momento de creación, sin publicar y sin tocar productos existentes.

## 2. Técnica elegida

**Opción A — `images: [{ src: public_url, position }]`.** Woo hace sideload de la URL pública de Supabase Storage al crear el producto; no requiere `POST /wp/v2/media` propio. Si el `POST /wc/v3/products` falla, no queda ninguna media suelta en WordPress.

## 3. Cambios

- `studio/lib/media/item-images.ts` (nuevo) — `loadItemImagesForBridge()` lee `media_assets` por `item_id`, ordenadas por `sort_order`, filtradas a filas con `public_url`. `isWcImageAttachEnabled()` lee el flag.
- `studio/lib/wc/client.ts` — `WcProductPayload.images?: Array<{ src, position?, name? }>`; `WcProductResponse.images?: Array<{ id, src?, position? }>`.
- `studio/lib/wc/bridge.ts` (`BRIDGE_VERSION` → `v2.2`) — carga imágenes vía el helper; si `STUDIO_WC_ATTACH_IMAGES_ENABLED==='true'` y hay imágenes, las añade al payload con `position` = índice de `sort_order` (la primera imagen = position 0 = destacada). Tras 201, mapea `response.images[]` por índice hacia `media_assets` (`wc_media_id`, `upload_status='wc_assigned'`), solo si el conteo enviado/recibido coincide; si no coincide, no mapea y deja warning en consola — **nunca revierte el borrador ya creado**.
- `studio/lib/preflight/product-preflight.ts` — nuevo campo `attachImagesEnabled` en `PreflightInput`; con 0 fotos y flag ON, el warning dice explícitamente que el borrador saldrá sin imágenes. Severidad sin cambios (sigue siendo warning, nunca blocker).
- `studio/components/WcDraftPanel.tsx` — nuevas props `imageCount`/`attachImagesEnabled`; muestra cuántas fotos hay listas y si el attach está ON/OFF (shadow); tras crear el borrador, muestra "Imágenes adjuntadas: N/N" o aviso si el mapeo no pudo completarse.
- `studio/app/inventory/[id]/page.tsx` — lee el flag server-side, lo pasa a preflight y al panel.
- `studio/.env.example` — documenta `STUDIO_WC_ATTACH_IMAGES_ENABLED` (sin valor, sin tocar `.env.local`).

## 4. SHADOW_FIRST

Flag `STUDIO_WC_ATTACH_IMAGES_ENABLED` (mismo patrón que `STUDIO_AI_ENABLED`), leído server-side, **default OFF** (`undefined`/cualquier valor ≠ `'true'`). Con el flag OFF el flujo de creación de borrador es idéntico al de antes de esta sesión — no se envía `images[]`, no hay writes extra a `media_assets`. El agente no modificó `.env.local`.

## 5. Idempotencia y guardrails

- Si `wc_product_id` ya existe, el bridge para en el paso de idempotencia (sin cambios) — no se reintenta el attach de imágenes sobre un item ya drafteado.
- `status` sigue siendo literal `'draft'`, sin PUT, sin DELETE, sin cambios en la lógica de validación existente.
- El mapeo de `wc_media_id` es best-effort: si falla o no cuadra el conteo, el borrador creado permanece intacto y solo se pierde la trazabilidad del ID de media (Pablo puede revisarlo en WP Admin igualmente).

## 6. Validaciones

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 rutas) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan del diff | CLEAN |

## 7. Qué NO se tocó

Ningún `POST/PUT/DELETE` real a WooCommerce ejecutado por el agente. Sin SQL. Sin `.env.local`. Sin deploy. Sin cambios en Vinted, S025D, ni cleanup de borradores.

## 8. Prueba real — pendiente de Pablo

1. Confirmar que el agente no tocó `.env.local`.
2. En `studio/.env.local`, añadir `STUDIO_WC_ATTACH_IMAGES_ENABLED=true` (Pablo, manual).
3. `cd studio && npm run dev`.
4. Abrir/crear una camiseta sin `wc_product_id`, con datos completos + SEO/precio + 2-4 imágenes.
5. Crear **un único** borrador Woo.
6. Verificar en WP Admin: producto en Borrador, imágenes adjuntas, primera imagen = primera de la galería, no publicado.
7. Verificar en Studio: `media_assets.wc_media_id` relleno, `upload_status='wc_assigned'` donde el mapeo funcionó.
8. Confirmar `PABLO_WP_MEDIA_ATTACH_OK`.

## 9. Veredicto

`READY_FOR_PABLO_WP_MEDIA_ATTACH_SHADOW_TEST`. S026B no se cierra en esta sesión — queda pendiente de la prueba real de Pablo con el flag habilitado localmente.
