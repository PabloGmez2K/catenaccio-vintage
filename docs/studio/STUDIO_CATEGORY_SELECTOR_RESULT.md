# STUDIO_CATEGORY_SELECTOR_RESULT — S023E

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-01
**Sesión:** S023E — CATEGORY_SELECTOR_IN_STUDIO
**Modo:** ASK→CODE / CATEGORY_MODELING / NO_WC_CATEGORY_CREATION / NO_PRODUCT_PUBLISH / NO_DEPLOY / QUALITY_PASS_REQUIRED
**Agente:** Claude Code (Opus 4.8)
**Veredicto:** `READY_FOR_PABLO_SQL_APPLY` → tras aplicar SQL: `READY_FOR_PABLO_CATEGORY_SELECTOR_TEST`
**Depende de:** `STUDIO_WC_TAXONOMY_SYNC_RESULT.md` (S023A, caché `wc_categories`), `STUDIO_TARGET_ARCHITECTURE.md` (DEC-A5), `STUDIO_SESSION_GATES.md`, `STUDIO_PLAYER_TERM_RESOLUTION_RESULT.md` (S023D)

---

## 1. Resultado

S023E añade un **selector de categoría WooCommerce** al formulario de Studio, alimentado por la caché
Supabase `wc_categories` (S023A). El selector:

- muestra solo categorías **existentes/cacheadas** (Otros Clubs, Selecciones, Leyendas, Nuevo, Sin
  categorizar);
- mantiene la **heurística por liga** como default (`"Automática"`): liga vacía → Selecciones (148);
  con liga → Otros Clubs (147);
- permite **override manual** explícito (p.ej. **Leyendas** para curatorial);
- el override se **persiste** en `football_shirt_details.categoria` (+ `categoria_display`);
- el bridge envía la categoría correcta y `rank_math_primary_product_cat` **sigue la misma**
  categoría (comparten el mismo `categoryId`).

No se crean categorías nuevas. No se publica nada. No se llama a WooCommerce desde el agente. La
identidad de categoría sigue siendo de WooCommerce (cacheada en S023A); Studio solo **selecciona**.

La heurística se centralizó en **un único sitio** (`studio/lib/wc/category-cache.ts`), consumido por
el bridge (decisión real) y por el hint del formulario (recomendación reactiva). Antes vivía
duplicada/implícita en `bridge.ts`.

**Backward-compat:** `categoria = null` ⇒ el bridge aplica la heurística actual idéntica a hoy. Items
legacy y camisetas sin override no cambian de comportamiento.

---

## 2. Gates (matriz §7 → S023E)

| Gate | Veredicto | Razón |
|------|-----------|-------|
| `DOMAIN_PRODUCT_MODELING_GATE` (crítico) | PASS | Campo modelado explícito: *Categoría WC* = `<select>` mono-valor; fuente `wc_categories`; valor interno = WC category id (int); display = nombre; default = heurística (`null` = seguir liga); override = selección. Bordes: liga vacía → Selecciones; caché vacía → solo "Automática"; valor manipulado → rechazado con field error. No inventa categorías ni IDs. |
| `ACF_CONFIG_GATE` | PASS | La categoría **no es campo ACF**: vive en Woo root `categories[]` + meta Rank Math. No se toca ninguna field key ACF ni companion key. El único meta tocado (`rank_math_primary_product_cat`) ya existía en el bridge y sigue al mismo id. |
| `DATA_LAYER_MAPPING_GATE` | PASS | Ver §3. Sin capa desconocida. |
| `FULL_FIXTURE_TEST_GATE` | PASS (diseño) — pendiente test real de Pablo | Fixture: camiseta completa + override de categoría (Leyendas) → verificar categoría + primary cat en WP Admin. El agente no llama a WooCommerce ni a Supabase remoto. |
| `NO_MICROPATCH_LOOP_GATE` | PASS | Una sola pasada de modelado; scope cerrado (2 nuevos + 7 modificados); sin capas emergentes durante la implementación. |
| `PRODUCT_REFERENCE_DIFF_GATE` | N/A | La matriz §7 lo marca "—" para S023E. El payload de categoría ya existía (1731 cae en Otros Clubs); solo cambia el origen del `categoryId`. |

---

## 3. DATA_LAYER_MAPPING_GATE — detalle

| Dato | Fuente de identidad | Capa de escritura runtime | Quién la escribe |
|------|---------------------|----------------------------|-------------------|
| Categoría elegida (override) | `wc_categories` (Supabase, sync S023A, read-only) | `football_shirt_details.categoria` (int) + `categoria_display` (text) — **columna nueva, SQL aditivo** | Pablo (selección en form) → `actions.ts` |
| Categoría en el borrador | payload Woo `categories: [{ id }]` | `bridge.ts` (override si existe, si no heurística) | bridge |
| Categoría primaria SEO | `rank_math_primary_product_cat` meta | `bridge.ts` — **mismo `categoryId`** que `categories[]` | bridge (alineación garantizada) |
| Relación producto↔categoría (`wp_term_relationships`) | Woo (taxonomía nativa) — la crea al recibir `categories: [{id}]`. No es ACF taxonomy → no requiere `attributes[]`. | Woo | Woo |

No hay capa desconocida. No se tocó `wp_postmeta` ACF, companion keys, `attributes[]`, Filtro
Camisetas Pro, ni Rank Math más allá de la primary category ya existente.

---

## 4. Archivos creados

| Archivo | Rol |
|---------|-----|
| `studio/lib/wc/category-cache.ts` | Helper server-side: `DEFAULT_CATEGORY_IDS` (147/148), `resolveHeuristicCategoryId`, `resolveCategoryId(ligaValue, selected)` (override o heurística, nunca inventa id), `loadCachedCategories`, `findCategoryName`, `getCategorySelectorData` (opciones + nombres recomendados). Única fuente de la heurística. |
| `docs/studio/STUDIO_CATEGORY_SELECTOR_SCHEMA.sql` | SQL **aditivo** canónico: `ADD COLUMN IF NOT EXISTS categoria INTEGER`, `categoria_display TEXT` en `football_shirt_details`. Sin DROP/TRUNCATE/DELETE/UPDATE. **Aplicar manualmente por Pablo.** |
| `docs/studio/STUDIO_CATEGORY_SELECTOR_RESULT.md` | Este resultado/runbook. |

## 5. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/lib/wc/bridge.ts` | Eliminado `WC_CATEGORY_IDS` + `resolveCategoryId` locales; ahora importa `resolveCategoryId` de `category-cache.ts`. `categoryId = resolveCategoryId(ligaValue, shirt.categoria ?? null)`. `categories[]` y `rank_math_primary_product_cat` siguen usando el mismo `categoryId` (sin cambio de alineación). Status DRAFT, idempotencia, stock e imágenes intactos. |
| `studio/app/inventory/actions.ts` | Import `loadCachedCategories`. Nuevo helper `resolveCategorySelection` (valida el override contra la caché; vacío → null; no-en-caché → field error, nunca persiste id inventado). `createInventoryItem` y `updateInventoryItem`: resuelven la categoría y escriben `categoria`/`categoria_display`. Liga/Equipo/Año/Jugador sin cambios. |
| `studio/components/ItemForm.tsx` | Nuevos props `categoryOptions` + `recommendedCategoryNames`. Nuevo estado `categoria` y `<select name="categoria">` en "Identificación y catálogo" (tras Condición): opción "Automática (según liga)" + categorías cacheadas. Hint reactivo: muestra la recomendación por liga cuando está en Automática, "Override manual" cuando hay selección, aviso si la caché está vacía. `categoria` añadido a `ItemFormDefaults`. |
| `studio/app/inventory/new/page.tsx` | Convertido a server component async: carga `getCategorySelectorData` y pasa `categoryOptions`/`recommendedCategoryNames` a `ItemForm`. |
| `studio/app/inventory/[id]/edit/page.tsx` | Carga `getCategorySelectorData`; `categoria` añadido a `defaultValues` (`String(shirt.categoria)`); props pasados a `ItemForm`. |
| `studio/app/inventory/[id]/page.tsx` | Ficha de detalle: fila read-only "Categoría WC" (muestra `categoria_display` o "Automática (según liga)"), para que Pablo verifique antes de crear el borrador. |
| `studio/lib/types.ts` | `FootballShirtDetails`: añadidos `categoria: number \| null` y `categoria_display: string \| null`. |

---

## 6. Heurística (DEC-A5, una sola fuente)

`resolveHeuristicCategoryId(ligaValue)`: `liga` resuelta vacía → **Selecciones (148)**; con liga →
**Otros Clubs (147)**. `resolveCategoryId(ligaValue, selected)`: si `selected` es entero positivo →
override; si no → heurística. El formulario muestra la recomendación de forma reactiva (depende de
liga); el bridge toma la decisión real al construir el payload. Sin IA, sin slugs, sin crear
categorías.

---

## 7. Quality pass (post-CODE)

| Verificación | Resultado |
|---|---|
| Solo archivos de S023E modificados (`git status -sb`) | PASS — 7 modificados + 2 nuevos (helper + SQL) + docs de cierre |
| `bridge.ts` no cambia status (sigue `draft` hardcoded) | PASS |
| `client.ts`, `taxonomy-sync.ts`, `term-cache.ts`, `term-create.ts`, `wc-terms-mvp.ts` sin tocar | PASS |
| `categories[]` y `rank_math_primary_product_cat` usan el mismo `categoryId` | PASS — `bridge.ts:334` y `bridge.ts:359` |
| Todas las categorías usadas vienen de `wc_categories` | PASS — selector poblado desde caché; `actions.ts` valida el id contra la caché |
| No se inventan IDs de categoría | PASS — override no-en-caché → field error; helper ignora valores no numéricos/≤0 |
| No se crean categorías | PASS — no hay POST a `/products/categories` en ningún path |
| Liga/Equipo/Año intactos | PASS — sus líneas de resolución no cambiaron |
| Jugador/Rivaldo intacto | PASS — sin cambios en la resolución de `pa_jugador` |
| Creación controlada de términos intacta | PASS — `term-create.ts`/`TermCreateButton` sin tocar |
| DRAFT_ONLY intacto | PASS — `status: 'draft'` y guard en `client.ts` sin cambios |
| Backward-compat sin override / pre-SQL | PASS — `categoria` null/undefined → heurística idéntica a hoy |

**Regresión potencial documentada (sequencing):** el guardado escribe `categoria`/`categoria_display`.
Si Pablo usa el formulario actualizado **antes** de aplicar el SQL, el guardado fallará con *"column
categoria does not exist"*. Por eso el veredicto es `READY_FOR_PABLO_SQL_APPLY` y el primer paso del
test es aplicar el SQL. El SQL usa `ADD COLUMN IF NOT EXISTS` (idempotente, seguro de re-ejecutar).

---

## 8. Validaciones locales del agente

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 rutas; `/inventory/new` pasa a dinámica por la carga de caché) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan del diff | CLEAN |
| SQL aditivo (sin DROP/TRUNCATE/DELETE/UPDATE destructivo) | PASS |

No se ejecutó ninguna llamada real a WooCommerce ni a Supabase remoto desde el agente.

---

## 9. Confirmaciones explícitas

```
wc_api_called_by_agent=false
wc_post_called_by_agent=false
wc_get_called_by_agent=false
wc_category_created_by_agent=false
wc_product_created_by_agent=false
products_modified_by_agent=false
published=false
supabase_remote_modified_by_agent=false
env_local_modified=false
bridge_status_changed=false
client_ts_modified=false
taxonomy_sync_modified=false
term_cache_modified=false
term_create_modified=false
wc_terms_mvp_modified=false
sql_applied_by_agent=false
```

---

## 10. Instrucciones para Pablo (TEST_REAL)

1. **Aplicar el SQL primero** (obligatorio): en Supabase SQL Editor ejecutar
   `docs/studio/STUDIO_CATEGORY_SELECTOR_SCHEMA.sql`. Solo añade 2 columnas a
   `football_shirt_details`; es idempotente (`ADD COLUMN IF NOT EXISTS`).
2. `cd studio && npm run dev`.
3. (Si hace falta) ejecutar el sync de taxonomías (`POST /inventory/sync`, S023A) para que
   `wc_categories` esté poblada — debería tener 5 filas desde S023A.
4. Crear o editar una camiseta completa (Liga/Equipo/Año/Jugador/Talla/Condición/medidas/SEO+precio).
5. En **Categoría WooCommerce**:
   - dejar **"Automática (según liga)"** y leer la recomendación mostrada; **o**
   - elegir manualmente, p.ej. **Leyendas**.
6. Guardar. En la ficha de detalle, confirmar la fila **"Categoría WC"** (override o "Automática").
7. Crear **un único** borrador Woo ("Crear borrador en WooCommerce").
8. En **WP Admin → Producto borrador**, confirmar:
   - Categoría asignada = la elegida (o la heurística si Automática).
   - **Categoría primaria Rank Math** coincide con esa categoría.
   - Liga/Equipo/Año siguen seleccionados (sin regresión).
   - Jugador sigue seleccionado si aplica.
   - Estado = Borrador. **No publicado.**
9. No publicar el producto de prueba.
10. Si PASS: cierre documental S023E y **fase S023 completa**.

---

## 11. Criterio de parada — no disparado

No hizo falta rediseñar el modelo de producto, crear categorías Woo, tocar WP Admin/producción,
publicar, introducir IA, ni abrir S024/S028. `rank_math_primary_product_cat` se mantiene alineado con
`categories[]` por construcción (mismo `categoryId`), sin decisión arquitectónica. El SQL es aditivo,
no destructivo. Liga/Equipo/Año/Jugador no se rompen.

---

## 12. Mejoras futuras (FUTURE — solo documentadas, no implementadas)

- Tras elegir una categoría, no se recalcula nada hasta guardar (consistente con el resto del form).
- Marcar visualmente categorías curatoriales (Leyendas/Nuevo) en el selector — conecta con
  `STUDIO_TAXONOMY_UNIVERSE_MANAGER` (BACKLOG FUTURE), no abrir aquí.
- Sugerencia inteligente de categoría por jugador/equipo (Leyendas para jugadores históricos) —
  pertenece a `FUTURE_TAXONOMY_SMART_SUGGESTIONS` / S028, fuera de S023E.

---

## 13. Veredicto

`READY_FOR_PABLO_SQL_APPLY` → tras aplicar el SQL aditivo: `READY_FOR_PABLO_CATEGORY_SELECTOR_TEST`.

La implementación técnica está completa y validada localmente (typecheck/build/lint PASS, gates PASS,
quality pass sin hallazgos pendientes), pero requiere que Pablo aplique el SQL aditivo antes de usar
el formulario y ejecute el test real en WP Admin. Cierra S023E (y, con el PASS de Pablo, la fase S023).

---

*Sesión S023E — 2026-07-01 — Claude Code (Opus 4.8). ASK→CODE / CATEGORY_MODELING / NO_WC_CATEGORY_CREATION / NO_PRODUCT_PUBLISH / NO_DEPLOY / QUALITY_PASS_REQUIRED.*
