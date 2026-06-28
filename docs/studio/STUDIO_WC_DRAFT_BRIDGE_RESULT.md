# STUDIO_WC_DRAFT_BRIDGE_RESULT — S022C

---

### S022C.8 — TAXONOMY_RELATIONSHIP_PAYLOAD_PATCH

**Resultado:** `READY_FOR_PABLO_TAXONOMY_DRAFT_TEST`
**Fecha:** 2026-06-28
**Modo:** IMPL / DRAFT_ONLY / NO_WC_CALL / NO_WC_UPDATE / NO_DEPLOY

#### Causa raíz confirmada

S022C.7 confirmó que el borrador 1856 tenía `meta_data` ACF correcto (`liga=177`, `equipo=179`, `ano_temporada=["180"]` y sus `_field_keys`), pero WP Admin no mostraba los campos ACF Taxonomy seleccionados. Pablo confirmó que Liga, Equipo, Jugador y Año son campos ACF de tipo Taxonomía con `save_terms` y `load_terms` activados y retorno por ID de término.

El ajuste de S022C.8 mantiene los `meta_data` ACF y añade `attributes[]` al payload WooCommerce para que Woo cree también relaciones reales en `wp_term_relationships`.

#### Cambios en payload

**`studio/lib/wc/client.ts`:**
- `WcProductPayload.attributes?: Array<{ id: number; name?: string; options: string[]; visible: boolean; variation: boolean }>`
- `status: 'draft'` se mantiene literal e inmutable.

**`studio/lib/wc/bridge.ts`:**
- `BRIDGE_VERSION` pasa a `v2.1`.
- Se añaden attributes complementarios:
  - Liga: attribute id `5`
  - Equipo: attribute id `4`
  - Año/Temporada: attribute id `7`
  - Jugador: attribute id `6` solo si hay term ID y label seguro
- Todos los attributes van con `visible: false` y `variation: false`.
- `wc_payload_snapshot` incluye ahora `attributes`, además de `categories`, `meta_data`, `manage_stock` y `stock_quantity`.

#### Resolución de labels/options

Woo REST espera `options` como nombres/slugs de términos, no IDs. El bridge resuelve cada opción así:
- Usa primero el display cache del item (`liga_display`, `equipo_display`, `temporada_display`, `jugador_display`) si existe.
- Si falta display cache, usa `wc-terms-mvp.ts` por `termId` mediante `getTermLabelById()`.
- Si no hay label seguro para un term ID requerido, el bridge devuelve `VALIDATION_ERROR` antes de cualquier llamada Woo.

Para el caso PSV validado por Pablo:
- Liga: `Eredivisie`
- Equipo: `PSV`
- Año: `2007-09`

#### Meta_data conservado

Se conservan sin eliminar:
- `liga`, `_liga`
- `equipo`, `_equipo`
- `jugador`, `_jugador`
- `ano_temporada`, `_ano_temporada`
- `talla`, `_talla`
- medidas, condición, defectos, descripción y `rank_math_primary_product_cat`

`attributes[]` es complementario: no reemplaza el contrato ACF meta existente.

#### Validaciones

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 rutas) |
| `npm run lint` | PASS (0 warnings/errors; aviso de deprecación de `next lint`) |

#### Qué NO se tocó

- Ninguna llamada a WooCommerce
- Ningún `POST`, `PUT`, `PATCH` o `DELETE`
- Productos 1854, 1856 y 1731 no modificados
- WP Admin no abierto
- `.env.local` no modificado
- Supabase schema no modificado
- DRAFT_ONLY e idempotencia conservados

#### Riesgo documentado

WooCommerce REST suele aceptar `attributes[]` con `options` por nombre/slug y crear relaciones de taxonomía de producto, pero la validación final requiere un nuevo borrador controlado por Pablo en WP Admin. Si Woo no vincula los términos con esta estructura, S023 deberá resolverlo con sincronización real de términos/categorías y/o endpoint específico.

#### Acción para Pablo

Crear un nuevo item de prueba en Studio, aprobar SEO manual, pulsar **Crear borrador en WooCommerce** una sola vez y verificar en WP Admin que Liga, Equipo y Año aparecen seleccionados en el bloque ACF "Detalles del Producto".

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

## 13. UX del precio — decisión S022C.1

El precio `inventory_items.precio_publicado_web` (que lee el bridge) se fija en el **flujo manual SEO**, no en el formulario inicial del item:

- Pablo copia prompt → ChatGPT devuelve precio recomendado → Pablo introduce ese precio en "Precio web / WooCommerce (€)" al guardar el contenido SEO.
- `saveManualSeoContent` guarda el precio en `ai_suggestions.precio_sugerido` **y** actualiza `inventory_items.precio_publicado_web`.
- El bridge S022C sigue leyendo `precio_publicado_web` sin cambios — el contrato no varía.
- Si el precio no se introduce al guardar SEO, el WcDraftPanel muestra el warning hasta que se guarde de nuevo con precio.

---

## 14. Posibles blockers conocidos

| Blocker | Causa probable | Acción |
|---------|----------------|--------|
| `equipo_term_id_required` | Equipo guardado no tiene term ID en `wc-terms-mvp.ts` | Añadir term ID para ese equipo en `wc-terms-mvp.ts`, re-editar el item, reintentar |
| `temporada_term_id_required` | Temporada sin term ID | Mismo proceso |
| `price_invalid` | `precio_publicado_web` no definido en el item | Editar item → añadir precio web |
| HTTP 401 desde WC | Credenciales incorrectas en `.env.local` | Pablo verifica `WP_APP_USER` y `WP_APP_PASSWORD` en `.env.local` |
| HTTP 403 desde WC | `catenaccio-studio-agent` no puede POST /products | Revisar rol en WP Admin (debería ser `shop_manager`) |

---

## 15. S022C.2 — WC_TERM_ID_GAP_FOR_FIRST_DRAFT

**Resultado:** `STOP`

Durante el test real controlado de S022C, Studio bloqueó correctamente antes de llamar a WooCommerce con:

```text
equipo_term_id_required: el equipo no tiene term ID numérico resuelto. Completa el campo equipo con un valor reconocido.
```

No se creó ningún borrador WooCommerce y no se ejecutó `POST /wc/v3/products`.

**Diagnóstico de sesión:**
- `studio/lib/wc-terms-mvp.ts` mantiene `Francia = 129` y `2014-15 = 139`; el resto de equipos/temporadas del mapa MVP siguen vacíos salvo que se resuelvan explícitamente.
- La lectura local de Supabase con anon key queda bloqueada por RLS (`permission denied for table inventory_items`) y no hay `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`; por tanto no se pudo leer de forma fiable el `equipo_display` / `temporada_display` del item real usado en el test.
- Lectura WooCommerce controlada por `GET /wp-json/wc/v3/products/attributes/4/terms?per_page=100` y `GET /wp-json/wc/v3/products/attributes/7/terms?per_page=100` funcionó. Ejemplos confirmados: `Real Madrid = 70`, `FC Barcelona = 170`, `Manchester United = 164`, `2014-15 = 139`, `2012-13 = 69`, `2000-02 = 66`.

**Decisión:** no se actualiza `wc-terms-mvp.ts` porque falta evidencia fiable del equipo/temporada del primer test. No se inventan term IDs ni se usa fallback textual.

**Acción para Pablo:** devolver el `equipo_display` y `temporada_display` exactos del item que falló, o ejecutar una consulta manual en Supabase sobre ese item y compartir solo esos dos valores no sensibles. Con esos dos valores, la siguiente sesión actualizará únicamente las entradas necesarias en `wc-terms-mvp.ts`; después Pablo deberá abrir `Editar` → `Guardar` para que `updateInventoryItem` reescriba `football_shirt_details.equipo` / `temporada` con los nuevos term IDs antes de intentar crear el borrador una sola vez.

---

## 16. Veredicto

`READY_FOR_PABLO_WC_DRAFT_TEST`

La implementación técnica está completa y validada (typecheck/build/lint PASS). La prueba funcional con 1 borrador real en WooCommerce queda pendiente de Pablo. Si Pablo valida el borrador en WP Admin, el veredicto sube a `APPROVE_E2E_LOOP_PROVEN` y se abre `GATE_STUDIO_MVP`.

---

## 17. S022C.3 — WC_TERM_ID_SYNC_FOR_FIRST_DRAFT_PSV_2007_09

**Resultado:** `TERM_MISSING_STOP`

**Fecha:** 2026-06-28  
**Modo:** READ_ONLY_WC_GET / NO_WC_POST / NO_CODE_CHANGE

### Diagnóstico

Se ejecutaron lecturas GET read-only a WooCommerce para resolver los term IDs del item de prueba:
- Equipo: PSV Eindhoven (`pa_equipo`, atributo 4)
- Temporada: 2007-09 (`pa_ano`, atributo 7)
- Liga: Eredivisie — **confirmada** `termId: '177'` ✓ (ya correcta en `wc-terms-mvp.ts`, sin cambios)

### Términos ausentes en WooCommerce

| Taxonomía | Valor buscado | Estado |
|-----------|--------------|--------|
| `pa_equipo` (attr 4) | PSV / PSV Eindhoven | **NO EXISTE** — 21 equipos en WC, ninguno es PSV |
| `pa_ano` (attr 7) | 2007-09 | **NO EXISTE** — 18 temporadas en WC, ninguna es 2007-09 |

### Términos disponibles en WooCommerce (inventario completo)

**pa_equipo (21 términos):**
AC Milan (73), Ajax (178), Alemania (167), Arsenal F.C. (163), AS Roma (161), Bayern Munich (56), Borussia Dortmund (113), Colombia (75), Escocia (63), FC Barcelona (170), Francia (129), Juventus (100), Lazio (42), Liverpool (93), Málaga (140), Manchester United (164), Paraguay (159), Paris Saint-Germain (107), PSG (108), Real Madrid (70), República Checa (67)

**pa_ano (18 términos):**
1995-97 (99), 1999-00 (49), 2000-01 (172), 2000-02 (66), 2003-04 (62), 2008-09 (92), 2009-10 (128), 2010-11 (166), 2011-12 (160), 2012-13 (69), 2014-15 (139), 2015-16 (174), 2016-17 (74), 2017-18 (106), 2018-19 (112), 2019-20 (175), 2020-21 (55), 2022-23 (176)

### Aviso adicional sobre el formato de temporada

`buildSeasonOptions()` en `wc-terms-mvp.ts` genera etiquetas con el patrón `YYYY-YY` (p.ej. para 2007: `"2007-08"`, para 2008: `"2008-09"`). La etiqueta `"2007-09"` **no es generada por esta función** — no existe en ningún dropdown de Studio ni en WooCommerce. Posibilidades:
- El item tiene almacenado en Supabase un valor `temporada` introducido manualmente como texto libre antes de que existiera el datalist canónico.
- O Pablo se refiere a la temporada 2008-09 (cuando PSV Eindhoven compitió en la Eredivisie).

**Pablo debe confirmar qué valor exacto tiene `football_shirt_details.temporada` para ese item en Supabase** antes de crear el término en WooCommerce y actualizar el mapa.

### Acción requerida de Pablo (manual, sin agente)

**COMPLETADO en S022C.4:**
- PSV Eindhoven creado en WP Admin → pa_equipo → ID 179
- 2007-09 creado en WP Admin → pa_ano → ID 180
- `wc-terms-mvp.ts` parcheado con ambos IDs

**Pendiente — acción Pablo:**
1. Abrir el item en Studio
2. Ir a **Editar**
3. Confirmar que los campos muestran: Equipo = PSV / PSV Eindhoven, Temporada = 2007-09, Liga = Eredivisie
4. **Guardar** (necesario para que `updateInventoryItem` reescriba `football_shirt_details.equipo` y `.temporada` con los nuevos term IDs resueltos por `resolveTermId`)
5. Volver a la ficha del item
6. Pulsar **"Crear borrador en WooCommerce"** una sola vez

### S022C.4 — PATCH_WC_TERM_IDS_PSV_2007_09

**Resultado:** `READY_FOR_PABLO_TERM_REWRITE_TEST`  
**Fecha:** 2026-06-28

`studio/lib/wc-terms-mvp.ts` parcheado:
- `PSV Eindhoven` → `termId: '179'` (alias `'psv'` ya existía; cubre entrada "PSV" guardada en el item)
- `2007-09` → `termId: '180'` (insertado en `buildSeasonOptions()` vía `splice` después de `2008-09`)
- `Eredivisie` → `termId: '177'` sin cambios ✓

typecheck / build / lint / git diff --check / secret scan: todos **PASS**

### Qué NO se modificó

- Ninguna llamada `POST /wc/v3/products`
- Ningún término creado en WooCommerce (Pablo los creó manualmente)
- `.env.local`, secretos, schema Supabase, bridge.ts, productos/pedidos/clientes existentes

---

### S022C.5 — READ_ONLY_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT

**Resultado:** `READY_FOR_S022C6_PAYLOAD_PATCH`  
**Fecha:** 2026-06-28  
**Modo:** READ_ONLY / NO_CODE / NO_WC_UPDATE

Auditoría GET read-only del borrador 1854 vs producto publicado de referencia 1731 (Rivaldo Barcelona). 10 gaps documentados. Ver `docs/studio/STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT.md` para la matriz completa.

Hallazgos críticos:
- Faltan ACF `_fieldname` keys para todos los campos → "Detalles del Producto" vacío en WP Admin.
- `ano_temporada` enviado como string `"180"` → debe ser array `["180"]` para que el Filtro Camisetas Pro haga match.
- Faltan `medida_axila`, `medida_largo`, `defectos`.
- `categories` → "Sin categorizar" (id:17). Categorías reales: Otros Clubs (147), Selecciones (148), Leyendas (149).
- `manage_stock: false` → debe ser `true + stock_quantity: 1`.
- `descripcion_del_producto` sin `<p>` HTML en meta.

---

### S022C.6 — PAYLOAD_PATCH_BRIDGE

**Resultado:** `READY_FOR_PABLO_NEW_DRAFT_TEST`  
**Fecha:** 2026-06-28  
**Modo:** IMPL / DRAFT_ONLY / NO_PUBLISH / NO_WC_UPDATE / NO_PUBLISH

#### Cambios implementados

**`studio/lib/wc/client.ts` — tipo `WcProductPayload`:**
- `manage_stock: boolean` (antes literal `false`)
- Campo nuevo: `stock_quantity?: number | null`
- Campo nuevo: `categories?: Array<{ id: number }>`
- `meta_data.value`: `string | string[]` (antes `string` — necesario para `ano_temporada` array)

**`studio/lib/wc/bridge.ts` — lógica de payload:**
- `BRIDGE_VERSION` → `'v2.0'`
- Constantes `ACF_KEYS` con las 10 field reference keys extraídas del producto 1731
- Constante `WC_CATEGORY_IDS` con `seleccionesNacionales: 148`, `otrosClubs: 147`
- Helper `resolveCategoryId(ligaValue)`: `liga === ''` → 148 (Selecciones), `liga !== ''` → 147 (Otros Clubs)
- `ano_temporada` value: `string` → `[string]` array
- ACF `_fieldname` keys añadidas para todos los campos custom
- Campos nuevos en meta_data: `medida_axila`, `_medida_axila`, `medida_largo`, `_medida_largo`, `defectos`, `_defectos`
- Fuentes: `shirt.ancho_cm`, `shirt.largo_cm`, `shirt.condicion_notas`
- `descripcion_del_producto`: texto plano → `<p>${text}</p>` si no empieza con `<`; HTML preservado si ya tiene markup
- `manage_stock: true` + `stock_quantity: 1`
- `categories: [{ id: categoryId }]`
- `rank_math_primary_product_cat` como meta entry con el `categoryId`
- `wc_payload_snapshot` ampliado: incluye `manage_stock`, `stock_quantity`, `categories`

#### Categorías — decisiones diferidas a S023

- **Leyendas (149):** categoría curatorial, requiere juicio de Pablo → asignación manual en WP Admin
- **Nuevo (22):** para deadstock/BNWT → asignación manual en WP Admin
- **S023** añadirá selector de categoría en Studio UI

#### Validaciones

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 páginas) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan del diff | CLEAN |
| DRAFT_ONLY guard | PASS — status literal 'draft' no modificado |
| Idempotencia | PASS — check `wc_product_id IS NULL` sin cambios |

#### Qué NO se modificó

- Ninguna llamada a WooCommerce (ni POST, ni PUT, ni PATCH)
- Producto 1854 no modificado
- `.env.local`, schema Supabase, DRAFT_ONLY guard, idempotencia, wc-terms-mvp.ts

---

*Sesión S022C — 2026-06-28 — Claude Code (Sonnet). IMPL / DRAFT_ONLY / NO_PUBLISH / NO_CONFIG_CHANGE.*
