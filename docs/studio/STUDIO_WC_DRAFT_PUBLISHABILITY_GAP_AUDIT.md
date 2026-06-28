# STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT — S022C.5

---

## CONFIRMACIÓN ACF — S022C.8

Pablo confirmó en WP Admin / ACF que los campos `Liga`, `Equipo`, `Jugador` y `Año` son campos ACF de tipo **Taxonomía**:

| Campo | Tipo ACF | Crear términos | Guardar términos | Cargar términos | Retorno | Apariencia |
|-------|----------|----------------|------------------|-----------------|---------|------------|
| Liga | Taxonomía | Activado | Activado | Activado | ID de término | Select / UI ACF |
| Equipo | Taxonomía | Activado | Activado | Activado | ID de término | Select / UI ACF |
| Jugador | Taxonomía | Activado | Activado | Activado | ID de término | Select / UI ACF |
| Año | Taxonomía | Activado | Activado | Activado | ID de término | Casilla de verificación |

Implicación: escribir solo `wp_postmeta` mediante `meta_data` no basta para que ACF muestre los términos seleccionados cuando `save_terms/load_terms` están activos. Además del valor ACF en meta, el producto necesita relaciones reales en `wp_term_relationships`. S022C.8 añade `attributes[]` al payload WooCommerce como mecanismo complementario para que WooCommerce cree esas relaciones al crear el borrador.

S023 debe reemplazar el mapa estático `studio/lib/wc-terms-mvp.ts` por una sincronización real de términos/categorías WooCommerce desde Studio.

**Proyecto:** Catenaccio Vintage  
**Fecha:** 2026-06-28  
**Sesión:** S022C.5 — READ_ONLY_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT  
**Modo:** READ_ONLY / NO_CODE / NO_WRITE / NO_WC_UPDATE / NO_PUBLISH  
**Agente:** Claude Code (Sonnet)  
**Depende de:** `STUDIO_WC_DRAFT_BRIDGE_RESULT.md`, `STUDIO_WC_PAYLOAD_SPEC.md`, `STUDIO_DATA_MODEL.md`

---

## SESIÓN

S022C.5 — Auditoría de publicabilidad del borrador WooCommerce 1854 vs producto referencia 1731 (Rivaldo).

---

## MODO

READ_ONLY. Solo GET a WooCommerce API. Sin código, sin escrituras, sin PUT/PATCH/POST, sin publicación, sin cambios en Supabase, sin tocar .env.local, sin imprimir secretos.

---

## RESULTADO

Auditoría completada. Ambos productos obtenidos vía GET read-only. 10 gaps documentados, clasificados por prioridad. ACF field keys confirmados desde la referencia. `ano_temporada` array format descubierto como bug crítico.

---

## VEREDICTO

`READY_FOR_S022C6_PAYLOAD_PATCH`

El borrador 1854 fue creado correctamente por el puente S022C. El problema no es el puente en sí, sino que el payload MVP está incompleto: faltan ACF field reference keys, medidas, defectos, categoria, y el formato de `ano_temporada` es incorrecto. S022C.6 puede corregir todos estos gaps en el bridge sin tocar la arquitectura.

---

## HITO VALIDADO

- Studio → WooCommerce API: **FUNCIONA** (producto 1854 existe en WC con status=draft)
- Precio €80: **CORRECTO**
- Term IDs liga/equipo/temporada: **CORRECTOS** (177/179/180)
- talla/condicion: **CORRECTOS** (XXL/Excelente)
- DRAFT_ONLY guard: **CORRECTO** (status=draft confirmado en respuesta WC)
- Idempotencia: **CORRECTA**

---

## PRODUCTO 1854 — ESTADO

**WooCommerce ID:** 1854  
**Título:** 2007-09 PSV Away Shirt (XXL)  
**Estado:** draft  
**Precio:** €80  
**Slug:** `""` (vacío — comportamiento normal de borradores, se genera al publicar)  
**Permalink:** `https://catenacciovintage.com/?post_type=product&p=1854` (no-SEO, propio de borradores)  

**Campos raíz:**
- `type`: simple ✓
- `catalog_visibility`: visible ✓
- `stock_status`: instock ✓
- `manage_stock`: **false** ← GAP (referencia usa `true` + `stock_quantity=1`)
- `sold_individually`: false (referencia también false — no es gap vs referencia)
- `sku`: "" (diferido per spec — aceptado MVP)
- `categories`: `[{id:17, "Sin categorizar"}]` ← GAP CRÍTICO
- `images`: `[]` ← aceptado como manual en MVP
- `attributes`: `[]` ✓ (Catenaccio usa ACF meta, no WC attributes)

**meta_data presente en 1854:**
```
rank_math_internal_links_processed = "1"  ✓ (auto)
liga = "177"  ✓
equipo = "179"  ✓
ano_temporada = "180"  ← GAP: debería ser ["180"] (array)
talla = "XXL"  ✓
condicion = "Excelente"  ✓
jugador = ""  ✓
descripcion_del_producto = "Camiseta alternativa del PSV..."  ← GAP: texto plano sin <p>
```

**meta_data ausente en 1854 (presente en referencia):**
```
_liga, _equipo, _jugador, _ano_temporada, _talla, _condicion  ← ACF field keys
_descripcion_del_producto  ← ACF field key
medida_axila, _medida_axila  ← medida ancho
medida_largo, _medida_largo  ← medida largo
defectos, _defectos  ← defectos/notas condición
rank_math_seo_score  ← auto-generado por RM al guardar
rank_math_primary_product_cat  ← vinculado a category ID
```

---

## PRODUCTO REFERENCIA — 1731 (Rivaldo)

**WooCommerce ID:** 1731  
**Título:** 2000-01 FC Barcelona Home Shirt Rivaldo #10 - (M) Signed  
**Estado:** publish  
**Precio:** €169  
**Categoría:** Leyendas (id:149)  
**Imágenes:** 7 fotos subidas  
**manage_stock:** true / stock_quantity: 1  

**ACF Field Keys descubiertos** (estáticos — no cambian):

| ACF meta key | Field key value |
|-------------|----------------|
| `_liga` | `field_6919a5df21a63` |
| `_equipo` | `field_6919a6e721a64` |
| `_jugador` | `field_692af8bd4913e` |
| `_ano_temporada` | `field_6919aae821a65` |
| `_talla` | `field_66b9ef77d1372` |
| `_medida_axila` | `field_6919a35c21a61` |
| `_medida_largo` | `field_6919a57921a62` |
| `_condicion` | `field_66b9efd3d1373` |
| `_defectos` | `field_66b9f060d1374` |
| `_descripcion_del_producto` | `field_66b9f077d1375` |

**`ano_temporada` en referencia:** `["172"]` ← ARRAY (no string)

---

## GAPS DETECTADOS

| # | Gap | Severidad | Causa | Efecto |
|---|-----|-----------|-------|--------|
| G1 | ACF `_fieldname` keys ausentes | CRÍTICO | Bridge no los envía | Campos Liga/Equipo/Año/Talla/Condición no aparecen en bloque "Detalles del Producto" en WP Admin |
| G2 | `ano_temporada` en string en vez de array `["180"]` | CRÍTICO | Bridge envía string, ACF espera PHP serialized array | Filtro Camisetas Pro no encuentra el producto por temporada; WP Admin muestra campo vacío |
| G3 | `medida_axila` ausente | ALTO | Bridge no lee `football_shirt_details.ancho_cm` | Medida axila-a-axila no aparece en listing frontend |
| G4 | `medida_largo` ausente | ALTO | Bridge no lee `football_shirt_details.largo_cm` | Medida largo no aparece en listing frontend |
| G5 | `defectos` ausente | ALTO | Bridge no lee `football_shirt_details.condicion_notas` | Notas de condición/defectos no aparecen en listing |
| G6 | `categories: [{id:17, "Sin categorizar"}]` | ALTO | Bridge no envía `categories` en payload | Producto cae en categoría basura; filtros de tienda no funcionan; "Explorar más" por categoría roto |
| G7 | `descripcion_del_producto` sin HTML `<p>` | MEDIO | Bridge envía texto plano; WC no auto-envuelve meta (sí envuelve `description`) | Descripción en frontend sin saltos de párrafo correctos |
| G8 | `manage_stock: false` sin `stock_quantity` | MEDIO | Bridge hardcodea `manage_stock: false` | Tras venta, camiseta sigue visible como disponible; requiere retirada manual |
| G9 | `rank_math_primary_product_cat` ausente | BAJO | Necesita category ID primero (G6 dependencia) | RM no puede calcular primary category para SEO |
| G10 | Imágenes ausentes | INFO | Diferido a manual en MVP per spec | Sin foto en listing; Pablo las añade manualmente en WP Admin |

---

## MATRIZ CAMPO A CAMPO

| Campo | Dónde vive en Woo | Referencia 1731 | Borrador 1854 | Gap | Cómo debe enviarlo Studio | Riesgo |
|-------|------------------|-----------------|---------------|-----|--------------------------|--------|
| `name` | root | "2000-01 FC Barcelona..." | "2007-09 PSV Away Shirt (XXL)" ✓ | Ninguno | `ai_suggestions.titulo_seo` (ya funciona) | Ninguno |
| `slug` | root | "2000-01-fc-barcelona-..." | "" | Normal en draft | Auto-generado por WC al publicar | Ninguno |
| `status` | root | publish | draft ✓ | Ninguno | Hardcoded `draft` (ya funciona) | Ninguno |
| `regular_price` | root | "169" | "80" ✓ | Ninguno | `precio_publicado_web` (ya funciona) | Ninguno |
| `description` | root | "" (vacío en ref) | `<p>Camiseta alternativa...</p>` | Ref vacía, 1854 tiene contenido — OK | `ai_suggestions.descripcion_larga` (WC auto-envuelve) | Ninguno |
| `short_description` | root | `\n` | "" | Insignificante | `""` (ya funciona) | Ninguno |
| `catalog_visibility` | root | visible | visible ✓ | Ninguno | Default WC (ya funciona) | Ninguno |
| `sold_individually` | root | **false** | **false** | Ninguno (ambos false) | No es el mecanismo correcto — ver `manage_stock` | Ninguno |
| `manage_stock` | root | **true** / qty=1 | **false** / qty=null | G8 | `manage_stock: true, stock_quantity: 1` | MEDIO: doble-venta posible sin gestión de stock |
| `stock_status` | root | instock | instock ✓ | Ninguno | Hardcoded (ya funciona) | Ninguno |
| `sku` | root | "" | "" | Diferido MVP | `referencia` en S023 | Bajo |
| `categories` | root | [{id:149, "Leyendas"}] | [{id:17, "Sin categorizar"}] | G6 ALTO | Añadir `categories: [{id: X}]` con mapeo | ALTO: filtros y nav rotos |
| `images` | root | 7 imágenes | [] | G10 INFO (manual MVP) | Upload pipeline S023 | Info |
| `attributes` | root | [] | [] ✓ | Ninguno | Catenaccio usa ACF meta | Ninguno |
| `liga` (meta) | meta_data | "72" | "177" ✓ | Valor correcto; ACF key ausente | Ya funciona — añadir `_liga` ACF key | Medio (G1) |
| `_liga` (ACF key) | meta_data | "field_6919a5df21a63" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `equipo` (meta) | meta_data | "170" | "179" ✓ | Valor correcto; ACF key ausente | Ya funciona — añadir `_equipo` ACF key | Medio (G1) |
| `_equipo` (ACF key) | meta_data | "field_6919a6e721a64" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `jugador` (meta) | meta_data | "171" | "" ✓ | Opcional — OK | Ya funciona — añadir `_jugador` ACF key | Medio (G1) |
| `_jugador` (ACF key) | meta_data | "field_692af8bd4913e" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `ano_temporada` (meta) | meta_data | **["172"]** (array) | **"180"** (string) | G2 CRÍTICO | Cambiar a `["<termId>"]` JSON array | CRÍTICO: filtro temporada roto |
| `_ano_temporada` (ACF key) | meta_data | "field_6919aae821a65" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `talla` (meta) | meta_data | "M" | "XXL" ✓ | Valor correcto; ACF key ausente | Ya funciona — añadir `_talla` ACF key | Medio (G1) |
| `_talla` (ACF key) | meta_data | "field_66b9ef77d1372" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `medida_axila` (meta) | meta_data | "55" (cm) | AUSENTE | G3 ALTO | `football_shirt_details.ancho_cm` → string | ALTO: medida no aparece |
| `_medida_axila` (ACF key) | meta_data | "field_6919a35c21a61" | AUSENTE | G1+G3 | Añadir entrada estática | ALTO |
| `medida_largo` (meta) | meta_data | "73" (cm) | AUSENTE | G4 ALTO | `football_shirt_details.largo_cm` → string | ALTO: medida no aparece |
| `_medida_largo` (ACF key) | meta_data | "field_6919a57921a62" | AUSENTE | G1+G4 | Añadir entrada estática | ALTO |
| `condicion` (meta) | meta_data | "Muy bueno" | "Excelente" ✓ | Valor correcto; ACF key ausente | Ya funciona — añadir `_condicion` ACF key | Medio (G1) |
| `_condicion` (ACF key) | meta_data | "field_66b9efd3d1373" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `defectos` (meta) | meta_data | "Dorsal con algo de desgaste" | AUSENTE | G5 ALTO | `football_shirt_details.condicion_notas` | ALTO: notas condición no aparecen |
| `_defectos` (ACF key) | meta_data | "field_66b9f060d1374" | AUSENTE | G1+G5 | Añadir entrada estática | ALTO |
| `descripcion_del_producto` (meta) | meta_data | HTML `<p class="...">` | Texto plano | G7 MEDIO | Envolver en `<p>...</p>` explícito | Medio: párrafos sin formato |
| `_descripcion_del_producto` (ACF key) | meta_data | "field_66b9f077d1375" | AUSENTE | G1 CRÍTICO | Añadir entrada estática | CRÍTICO |
| `rank_math_seo_score` | meta_data | "7" | AUSENTE | G9 BAJO | Auto-generado por RM — no enviar | Bajo |
| `rank_math_primary_product_cat` | meta_data | "149" | AUSENTE | G9 BAJO | Depende de category ID (G6) | Bajo |
| `rank_math_internal_links_processed` | meta_data | "1" | "1" ✓ | Ninguno | Auto-generado por RM | Ninguno |

---

## NOTA CRÍTICA — `ano_temporada` array format

La referencia almacena `ano_temporada` como `["172"]` (PHP serialized array deserializado por la REST API). Esto indica que el campo ACF `ano_temporada` es un campo de tipo relación/taxonomía multi-valor.

Cuando el bridge envía `"180"` (string simple), WP lo almacena como string y no como array serializado. El Filtro Camisetas Pro probablemente ejecuta queries del tipo:

```php
'meta_query' => [
  ['key' => 'ano_temporada', 'value' => '"180"', 'compare' => 'LIKE']
]
```

El valor serializado correcto sería `a:1:{i:0;s:3:"180";}`, que contiene `"180"` embebido. Un string plano `"180"` **no** contiene `"180"` en formato serializado PHP y la query LIKE falla.

**Fix en S022C.6:** El bridge debe enviar `value` como array JSON `["180"]`. La WC REST API acepta arrays en `meta_data.value` y los almacena correctamente como PHP serialized array que ACF lee.

---

## NOTA — `sold_individually` vs `manage_stock`

El campo `sold_individually` en el producto referencia 1731 es `false`, igual que en el borrador 1854. **No es un gap.**

El mecanismo correcto para camisetas vintage únicas es `manage_stock: true + stock_quantity: 1`. Cuando la camiseta se vende, el stock pasa a 0 y el producto deja de estar disponible automáticamente. Con `manage_stock: false` (situación actual del bridge), WC no controla el stock y el producto permanece visible como disponible tras la venta.

---

## CATEGORÍAS DISPONIBLES EN WOOCOMMERCE

| id | name | slug | count |
|----|------|------|-------|
| 149 | Leyendas | leyendas | 14 |
| 22 | Nuevo | nuevo | 16 |
| 147 | Otros Clubs | otros-clubs | 0 |
| 148 | Selecciones Nacionales | selecciones-nacionales | 9 |
| 17 | Sin categorizar | sin-categorizar | 5 |

**Estrategia de mapeo recomendada para S022C.6:**

| Condición Studio | Categoría WC |
|-----------------|-------------|
| `liga == ""` (sin liga) → equipo es selección nacional | id:148 Selecciones Nacionales |
| `liga != ""` (club con liga) | id:147 Otros Clubs |
| `jugador != ""` (tiene jugador) + valor alto | id:149 Leyendas (decidir manualmente) |
| `condicion` = "Mint" o "Deadstock" | id:22 Nuevo |

Nota: "Leyendas" es una decisión curatorial de Pablo, no automática. Para S022C.6 MVP: mapeo automático entre Selecciones / Otros Clubs; Leyendas permanece como asignación manual en WP Admin hasta que S023 añada selector de categoría en Studio.

---

## PATCH MÍNIMO RECOMENDADO — S022C.6

### MUST — requerido para borrador publicable

| # | Cambio en `bridge.ts` | Fuente de datos | ACF field key (estático) |
|---|----------------------|----------------|--------------------------|
| M1 | Añadir `_liga`, `_equipo`, `_jugador`, `_talla`, `_condicion`, `_descripcion_del_producto` como meta entries | Hardcoded (estático) | Ver tabla ACF keys |
| M2 | Cambiar `ano_temporada` value de `string` a `["string"]` (array JSON) | `shirt.temporada` | `_ano_temporada = "field_6919aae821a65"` |
| M3 | Añadir `_ano_temporada` meta entry | Hardcoded | `"field_6919aae821a65"` |
| M4 | Añadir `medida_axila` + `_medida_axila` | `shirt.ancho_cm?.toString() ?? ""` | `"field_6919a35c21a61"` |
| M5 | Añadir `medida_largo` + `_medida_largo` | `shirt.largo_cm?.toString() ?? ""` | `"field_6919a57921a62"` |
| M6 | Añadir `defectos` + `_defectos` | `shirt.condicion_notas ?? ""` | `"field_66b9f060d1374"` |
| M7 | Añadir `categories: [{id: X}]` en payload | Mapeo liga/equipo → category ID | — |
| M8 | Envolver `descripcion_del_producto` en `<p>...</p>` | `<p>${suggestion.descripcion_larga.trim()}</p>` | — |
| M9 | Cambiar `manage_stock: false` → `manage_stock: true` + `stock_quantity: 1` | Hardcoded | — |

### SHOULD — mejora la completitud del listing

| # | Cambio | Dependencia |
|---|--------|-------------|
| S1 | Añadir `rank_math_primary_product_cat` con el ID de la categoría asignada | Depende de M7 |
| S2 | Estructura HTML de `description` con `<strong>`, `<ul>` cuando la descripción lo sugiera | Formato en ai_suggestions |

### WcProductPayload actualizado (tipo TypeScript para referencia)

```typescript
// Cambios clave en payload
{
  ...
  manage_stock: true,      // cambia de false
  stock_quantity: 1,       // nuevo campo
  categories: [{ id: categoryId }],  // nuevo campo
  meta_data: [
    { key: 'liga', value: ligaValue },
    { key: '_liga', value: 'field_6919a5df21a63' },        // nuevo
    { key: 'equipo', value: shirt.equipo.trim() },
    { key: '_equipo', value: 'field_6919a6e721a64' },      // nuevo
    { key: 'jugador', value: jugadorValue },
    { key: '_jugador', value: 'field_692af8bd4913e' },     // nuevo
    { key: 'ano_temporada', value: [shirt.temporada.trim()] },  // string→array
    { key: '_ano_temporada', value: 'field_6919aae821a65' },    // nuevo
    { key: 'talla', value: shirt.talla.trim() },
    { key: '_talla', value: 'field_66b9ef77d1372' },       // nuevo
    { key: 'medida_axila', value: shirt.ancho_cm?.toString() ?? '' },  // nuevo
    { key: '_medida_axila', value: 'field_6919a35c21a61' },            // nuevo
    { key: 'medida_largo', value: shirt.largo_cm?.toString() ?? '' },  // nuevo
    { key: '_medida_largo', value: 'field_6919a57921a62' },            // nuevo
    { key: 'condicion', value: shirt.condicion.trim() },
    { key: '_condicion', value: 'field_66b9efd3d1373' },   // nuevo
    { key: 'defectos', value: shirt.condicion_notas ?? '' },  // nuevo
    { key: '_defectos', value: 'field_66b9f060d1374' },       // nuevo
    { key: 'descripcion_del_producto', value: `<p>${description}</p>` },  // HTML wrap
    { key: '_descripcion_del_producto', value: 'field_66b9f077d1375' }, // nuevo
  ],
}
```

> **Nota WcProductPayload type:** `manage_stock` cambia de `false` literal a `boolean`; se añade `stock_quantity: number | null`; `categories` se añade como `Array<{id: number}>`.

---

## QUÉ DEBE QUEDAR PARA S023

| Scope S023 | Descripción |
|-----------|-------------|
| Gestión de categorías | Studio UI para seleccionar/crear categorías WC; sincronización bidireccional |
| Gestión de términos | Crear/editar/sincronizar términos pa_equipo, pa_liga, pa_ano, pa_jugador desde Studio |
| Gestión de atributos | Si en el futuro Catenaccio migra de ACF meta a WC attributes nativos |
| Rank Math SEO completo | Envío de `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword` |
| Upload de imágenes | Pipeline de subida de fotos: Supabase Storage → WP Media Library → asignar al producto |
| "Explorar más" links | Rutas de navegación frontend por equipo/liga/año — requiere URL structure de la tienda |
| SKU generation | Generar `sku` desde `referencia` del item |
| Patch de producto 1854 | Aplicar PUT/PATCH sobre 1854 para corregir los gaps G1-G9 (requiere WC write session) |
| Selector categoría en Studio | Campo de categoría en formulario Studio para "Leyendas" vs "Otros Clubs" |

---

## RIESGOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Filtro temporada roto en frontend | ALTA | ALTO | Corregir `ano_temporada` a array en S022C.6 |
| ACF no muestra campos en WP Admin | ALTA | ALTO | Añadir `_fieldname` keys en S022C.6 |
| Doble-venta camiseta vintage | MEDIA | ALTO | Cambiar a `manage_stock: true + stock_quantity: 1` en S022C.6 |
| Categoría incorrecta en producción | ALTA | MEDIO | Mapeo automático Selecciones/Clubs + asignación manual Leyendas |
| Producto 1854 ya en WC con datos incorrectos | — | MEDIO | 1854 es draft; Pablo puede aplicar PATCH manual en WP Admin antes de publicar, o esperar a S023 batch-patch |
| ACF field keys cambian | MUY BAJA | ALTO | Keys son estáticas de la config ACF de la tienda; solo cambian si Pablo reconfigura ACF |

---

## QUÉ NO SE TOCÓ

- Ningún `POST`, `PUT`, `PATCH`, `DELETE` a WooCommerce
- Producto 1854 no fue modificado
- Producto 1731 (referencia) no fue modificado
- WP Admin no fue abierto
- Código del proyecto no fue modificado
- `.env.local` no fue modificado
- Supabase schema no fue modificado
- Secretos no impresos en output (credenciales cargadas desde archivo y usadas en headers únicamente)
- Ningún término, categoría ni atributo creado en WooCommerce

---

## SIGUIENTE PASO

**S022C.6 — PAYLOAD_PATCH_BRIDGE**

Implementar en `studio/lib/wc/bridge.ts` y `studio/lib/wc/client.ts` (WcProductPayload type) los cambios M1–M9 del patch mínimo:

1. Leer `football_shirt_details.ancho_cm`, `largo_cm`, `condicion_notas` en bridge
2. Añadir función `resolveCategoryId(shirt, ligaValue)` → devuelve `148` (Selecciones) o `147` (Otros Clubs)
3. Añadir todas las `_fieldname` ACF keys como entradas estáticas en `meta_data`
4. Cambiar formato `ano_temporada` value a array `[string]`
5. Cambiar `manage_stock: false` → `true` + `stock_quantity: 1`
6. Añadir `categories: [{id: categoryId}]` al payload
7. Envolver `descripcion_del_producto` en `<p>...</p>`
8. Actualizar `WcProductPayload` type para reflejar cambios
9. Typecheck / build / lint / secret scan

**Para el producto 1854 ya creado:** Pablo puede aplicar los campos faltantes manualmente en WP Admin antes de publicarlo, o esperar a que S023 implemente un batch-patch. El borrador no está roto — solo está incompleto.

---

---

## S022C.6 — PATCH IMPLEMENTADO

**Fecha:** 2026-06-28  
**Estado:** PATCH IMPLEMENTADO — pendiente validación funcional por Pablo con nuevo borrador de prueba.

Todos los gaps MUST (M1–M9) implementados en `studio/lib/wc/bridge.ts` y `studio/lib/wc/client.ts`:
- ACF `_fieldname` keys: ✓ añadidas para los 10 campos
- `ano_temporada` array: ✓ `string` → `[string]`
- `medida_axila` + `medida_largo`: ✓ (`ancho_cm` / `largo_cm`)
- `defectos`: ✓ (`condicion_notas`)
- `categories`: ✓ mapeo automático 148/147
- `descripcion_del_producto` HTML: ✓ `<p>` wrapping
- `manage_stock: true` + `stock_quantity: 1`: ✓
- `rank_math_primary_product_cat`: ✓ como meta entry

typecheck / build / lint / diff --check / secret scan: todos **PASS**.

**Producto 1854 (ya creado con payload v1.0):** no fue modificado. Pablo puede parchear los campos faltantes manualmente en WP Admin antes de publicarlo, o crear un nuevo item de prueba para validar el payload v2.0 completo.

*Sesión S022C.5 — 2026-06-28 — Claude Code (Sonnet). READ_ONLY / NO_CODE / NO_WRITE / NO_WC_UPDATE / NO_PUBLISH.*
