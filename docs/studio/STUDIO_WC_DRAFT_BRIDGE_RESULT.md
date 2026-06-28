# STUDIO_WC_DRAFT_BRIDGE_RESULT — S022C

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-28  
**Sesión:** S022C — STUDIO_WC_DRAFT_BRIDGE  
**Modo:** IMPL / DRAFT_ONLY / NO_PUBLISH / NO_CONFIG_CHANGE  
**Agente:** Claude Code (Sonnet)  
**Estado:** READY_FOR_PABLO_WC_DRAFT_TEST  
**Depende de:** `STUDIO_WC_BRIDGE_CONTRACT.md`, `STUDIO_WC_PAYLOAD_SPEC.md`, `WC_API_WRITE_ACCESS_TEST_RESULT.md`, `PABLO_MANUAL_CONTENT_OK`

---

## 1. Resumen

S022C implementa el puente Studio → WooCommerce completo. Cuando una camiseta tiene contenido SEO aprobado en `ai_suggestions` (status `aprobado` o `editado_aprobado`), aparece el panel "Borrador WooCommerce" en la ficha del item con el botón **"Crear borrador en WooCommerce"**.

El botón ejecuta un Server Action que valida todas las precondiciones, construye el payload WooCommerce siguiendo `STUDIO_WC_PAYLOAD_SPEC.md`, llama a `POST /wp-json/wc/v3/products` con `status=draft` hardcoded, y registra el resultado en Supabase.

---

## 2. Archivos creados

| Archivo | Rol |
|---------|-----|
| `studio/lib/wc/client.ts` | WC REST API client (server-side). Construye Basic Auth, llama fetch, sanitiza errores, guard DRAFT_ONLY. |
| `studio/lib/wc/bridge.ts` | Bridge service. Valida precondiciones, carga datos de Supabase, construye payload, llama client, actualiza `inventory_items` + `item_lifecycle_events`. |
| `studio/app/inventory/[id]/wc-actions.ts` | Server Action Next.js. Wrapper thin sobre bridge. Llama `revalidatePath` en éxito. |
| `studio/components/WcDraftPanel.tsx` | Componente UI React (client). Muestra estado del borrador, botón de creación, mensajes de error/éxito, hint. |

## 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/lib/types.ts` | Añadidos `wc_product_id: number \| null` y `wc_error: string \| null` a `InventoryItem`. |
| `studio/app/inventory/[id]/page.tsx` | Import `WcDraftPanel`. Renderiza panel debajo de `ManualSeoPanel` solo cuando hay `approvedSuggestion`. |
| `studio/.env.example` | Añadidas `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` con comentarios. Sin valores. |
| `studio/styles/globals.css` | Añadidos estilos `.wc-draft-*`. |

---

## 4. Flujo de datos

```
Pablo pulsa "Crear borrador en WooCommerce"
  → WcDraftPanel (client) llama createWcDraft(itemId) [Server Action]
  → wc-actions.ts llama createWcDraftForItem(itemId) [bridge.ts]
  → bridge.ts:
      1. Valida auth (supabase.auth.getUser)
      2. Carga item + football_shirt_details (RLS owner_id)
      3. Idempotencia: wc_product_id IS NULL → STOP si no null
      4. Valida precondiciones (precio, referencia, equipo, temporada, talla, condicion)
      5. Carga última ai_suggestion aprobada/editado_aprobada
      6. Valida titulo_seo y descripcion_larga
      7. Construye payload (status=draft hardcoded)
      8. Llama createWcDraftProduct() [client.ts]
      9. client.ts: Basic Auth, fetch POST /wc/v3/products, guard status=draft en response
     10. Éxito → actualiza inventory_items (wc_product_id, wc_status=borrador_creado, status=borrador_web)
                → inserta lifecycle event wc_sync_ok
     11. Error → actualiza inventory_items (wc_status=error_sync, wc_error sanitizado)
               → inserta lifecycle event wc_sync_error
               → item.status NO cambia
```

---

## 5. Payload WooCommerce

```json
{
  "name": "<titulo_seo de ai_suggestions>",
  "type": "simple",
  "status": "draft",
  "regular_price": "<formatWcRegularPrice(precio_publicado_web)>",
  "description": "<descripcion_larga de ai_suggestions>",
  "short_description": "",
  "stock_status": "instock",
  "manage_stock": false,
  "meta_data": [
    { "key": "liga",                    "value": "<shirt.liga ?? ''>" },
    { "key": "equipo",                  "value": "<shirt.equipo>" },
    { "key": "ano_temporada",           "value": "<shirt.temporada>" },
    { "key": "talla",                   "value": "<shirt.talla>" },
    { "key": "condicion",               "value": "<shirt.condicion>" },
    { "key": "jugador",                 "value": "<shirt.jugador ?? ''>" },
    { "key": "descripcion_del_producto","value": "<descripcion_larga>" }
  ]
}
```

- `status=draft` hardcoded en `WcProductPayload` type y guard en client.ts
- `regular_price` formateado por `formatWcRegularPrice()`: enteros → `"45"`, con céntimos → `"44.99"`, rechaza ≤0/NaN/null
- `equipo` y `temporada` son term IDs ya resueltos en `football_shirt_details` (guardados por el form action vía `resolveTermId`). Validados como strings numéricos no vacíos antes de construir el payload.
- `liga` y `jugador` pueden ser `""` (nacional sin liga / sin jugador específico). Si son no vacíos, deben ser numéricos.
- `talla` y `condicion` son strings directos (no term IDs, confirmado en probe S007)

---

## 6. Precondiciones validadas (server-side)

| Condición | Código de error si falla |
|-----------|--------------------------|
| Usuario autenticado | `auth_required` |
| Item pertenece al owner (RLS) | `item_not_found` |
| `wc_product_id IS NULL` | `IDEMPOTENCY_STOP` |
| `referencia` no vacía | `VALIDATION_ERROR: name_required` |
| `precio_publicado_web` > 0 (vía `formatWcRegularPrice`) | `VALIDATION_ERROR: price_invalid` |
| `football_shirt_details` existe | `VALIDATION_ERROR: shirt_details_missing` |
| `talla` no vacía | `VALIDATION_ERROR: talla_required` |
| `condicion` no vacía | `VALIDATION_ERROR: condicion_required` |
| `equipo`: string numérico no vacío | `VALIDATION_ERROR: equipo_term_id_required` |
| `temporada`: string numérico no vacío | `VALIDATION_ERROR: temporada_term_id_required` |
| `liga`: numérico o `""` | `VALIDATION_ERROR: liga_term_id_invalid` |
| `jugador`: numérico o `""` | `VALIDATION_ERROR: jugador_term_id_invalid` |
| Existe ai_suggestion aprobada | `VALIDATION_ERROR: name_required` |
| `titulo_seo` ≥ 5 chars | `VALIDATION_ERROR: name_required` |
| `descripcion_larga` ≥ 20 chars | `VALIDATION_ERROR: description_required` |

### Persistencia post-WC (HTTP 201)

| Situación | Comportamiento |
|-----------|---------------|
| `inventory_items` update OK + lifecycle OK | `ok: true`, `wcProductId` devuelto |
| `inventory_items` update **FALLA** | `ok: false`, code `WC_CREATED_SUPABASE_UPDATE_FAILED`. El mensaje incluye el WC product ID y `STOP_DO_NOT_RETRY`. Pablo actualiza `wc_product_id` manualmente en Supabase. |
| `inventory_items` update OK, lifecycle **FALLA** | `ok: true` (la idempotencia está garantizada). Warning en `console.warn`, no bloquea al usuario. |

---

## 7. DRAFT_ONLY — guardrails implementados

1. `WcProductPayload.status` está tipado como literal `'draft'` — TypeScript no acepta otro valor.
2. `createWcDraftProduct()` rechaza cualquier payload donde `status !== 'draft'` antes de hacer fetch.
3. `createWcDraftProduct()` comprueba que la respuesta de WC tenga `status === 'draft'` y devuelve error crítico si no.
4. `status=draft` nunca es configurable desde UI. El componente `WcDraftPanel` no acepta ningún parámetro de status.

---

## 8. Idempotencia

- El bridge comprueba `wc_product_id IS NULL` antes de cualquier llamada a WC API.
- Si `wc_product_id` ya está seteado: retorna `IDEMPOTENCY_STOP` sin llamar a WC.
- La UI muestra el estado actual del borrador si ya existe, sin botón de re-creación.

---

## 9. Seguridad / Secretos

- `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD` solo en `process.env.*` server-side.
- Ninguna de estas variables es `NEXT_PUBLIC_*`.
- `createWcDraftProduct()` construye Basic Auth en servidor; nunca pasa al cliente.
- `sanitizeMessage()` en client.ts reemplaza user/password en mensajes de error antes de guardar.
- `wc_payload_snapshot` no incluye headers ni credenciales — solo payload enviado + respuesta WC.
- Secret scan del diff: ningún secreto impreso ni guardado.

---

## 10. Validaciones técnicas

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 páginas) |
| `npm run lint` | PASS (0 warnings, 0 errors) |
| `git diff --check` | PASS |
| Secret scan | CLEAN — ningún secret en diff |
| DRAFT_ONLY guard | PASS — status tipado como literal 'draft' |
| Idempotencia | PASS — check `wc_product_id IS NULL` antes de WC call |

---

## 11. Qué NO se tocó

- WooCommerce settings (impuestos, envíos, métodos de pago, emails)
- WordPress settings o plugins
- Órdenes, clientes, otros productos
- Supabase schema (no ALTER TABLE)
- Variables de entorno reales (`.env.local`)
- Vercel
- cPanel
- Taxonomías WC (no se crearon términos)

---

## 12. Prueba funcional — pendiente de Pablo

Para validar el E2E con 1 camiseta real:

1. `cd studio && npm run dev`
2. Abrir ficha de una camiseta que tenga contenido SEO guardado (`status=editado_aprobado` en `ai_suggestions`)
3. Verificar que aparece la sección "Borrador WooCommerce" con el botón "Crear borrador en WooCommerce"
4. Pulsar el botón **una sola vez**
5. Verificar en Studio:
   - `wc_product_id` está guardado (visible en panel con "ID: XXXX")
   - `wc_status = borrador_creado`
   - `status = borrador_web`
   - `wc_error = null`
6. Pablo verifica en **WP Admin → Productos → Borradores** que el producto aparece con `status=draft`
7. Confirmar que el producto NO está publicado
8. NO crear un segundo borrador del mismo item

**Prerequisitos:**
- `.env.local` en `studio/` con `WP_SITE_URL`, `WP_APP_USER`, `WP_APP_PASSWORD`
- Item con `precio_publicado_web` definido
- Item con `football_shirt_details.equipo` y `football_shirt_details.temporada` con term IDs resueltos (≠ `""`)
- Item con `ai_suggestions` con `status=editado_aprobado`

---

## 13. Posibles blockers conocidos

| Blocker | Causa probable | Acción |
|---------|----------------|--------|
| `equipo_term_id_required` | Equipo guardado no tiene term ID en `wc-terms-mvp.ts` | Añadir term ID para ese equipo en `wc-terms-mvp.ts`, re-editar el item, reintentar |
| `temporada_term_id_required` | Temporada sin term ID | Mismo proceso |
| `price_invalid` | `precio_publicado_web` no definido en el item | Editar item → añadir precio web |
| HTTP 401 desde WC | Credenciales incorrectas en `.env.local` | Pablo verifica `WP_APP_USER` y `WP_APP_PASSWORD` en `.env.local` |
| HTTP 403 desde WC | `catenaccio-studio-agent` no puede POST /products | Revisar rol en WP Admin (debería ser `shop_manager`) |

---

## 14. Veredicto

`READY_FOR_PABLO_WC_DRAFT_TEST`

La implementación técnica está completa y validada (typecheck/build/lint PASS). La prueba funcional con 1 borrador real en WooCommerce queda pendiente de Pablo. Si Pablo valida el borrador en WP Admin, el veredicto sube a `APPROVE_E2E_LOOP_PROVEN` y se abre `GATE_STUDIO_MVP`.

---

*Sesión S022C — 2026-06-28 — Claude Code (Sonnet). IMPL / DRAFT_ONLY / NO_PUBLISH / NO_CONFIG_CHANGE.*
