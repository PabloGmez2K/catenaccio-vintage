# STUDIO_TERM_CACHE_BACKED_OPTIONS_RESULT — S023B

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-30
**Sesión:** S023B — TERM_CACHE_BACKED_OPTIONS
**Modo:** ASK→CODE / LOCAL_CODE / NO_WC_CALL_BY_AGENT / NO_TERM_CREATION / NO_PUBLISH
**Agente:** Claude Code (Sonnet)
**Veredicto:** `READY_FOR_PABLO_CACHE_BACKED_DRAFT_TEST`
**Depende de:** `STUDIO_WC_TAXONOMY_SYNC_RESULT.md` (S023A), `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_SESSION_GATES.md`, `STUDIO_WC_DRAFT_BRIDGE_RESULT.md`

---

## 1. Resultado

S023B conecta el formulario y el puente Studio → WooCommerce a la caché Supabase
(`wc_terms`) creada en S023A, en lugar de depender de `studio/lib/wc-terms-mvp.ts`
como fuente de term IDs.

- `studio/app/inventory/actions.ts` (`createInventoryItem`, `updateInventoryItem`)
  resuelve Liga/Equipo/Año contra `wc_terms` al guardar un item.
- `studio/lib/wc/bridge.ts` resuelve el label de fallback de `attributes[]` contra
  `wc_terms` cuando un item legado no tiene `*_display` cacheado.
- `studio/lib/wc-terms-mvp.ts` queda marcado explícitamente como **no operativo**
  para term IDs de liga/equipo/temporada; se conserva como fuente de
  labels/aliases/titleLabel/helpText (datalist del formulario, alias matching,
  título autogenerado).
- No se creó ningún término nuevo. No se llamó a WooCommerce desde el agente.

---

## 2. Gates

| Gate | Veredicto |
|------|-----------|
| `PRODUCT_REFERENCE_DIFF_GATE` | PASS — el payload (root fields, `meta_data`, `attributes[]`) no cambió de forma; solo cambió la fuente de resolución de labels/term IDs. |
| `ACF_CONFIG_GATE` | PASS — `ACF_KEYS`, formato array de `ano_temporada`, companion keys sin cambios. |
| `DATA_LAYER_MAPPING_GATE` | PASS — ver §3. |
| `NO_MICROPATCH_LOOP_GATE` | PASS — 1 archivo nuevo (`term-cache.ts`) + 2 archivos editados (`actions.ts`, `bridge.ts`) + comentarios de depreciación en `wc-terms-mvp.ts`. Sin capas nuevas no previstas. |

---

## 3. DATA_LAYER_MAPPING_GATE — detalle

| Dato | Fuente de identidad | Capa de lectura runtime | Quién la escribe |
|------|---------------------|--------------------------|-------------------|
| Term ID de Liga/Equipo/Año | `wc_terms` (Supabase, sync S023A) | `studio/lib/wc/term-cache.ts` → `actions.ts` (guardar item), `bridge.ts` (fallback de label) | sync S023A (read-only contra Woo) |
| Label/alias/titleLabel de presentación | `studio/lib/wc-terms-mvp.ts` | `ItemForm.tsx` (datalist, título autogenerado), `term-cache.ts` (resolución de alias → label canónico) | mantenido a mano, ya no fuente de term ID |
| Woo = fuente de verdad de identidad de términos | WooCommerce | — | Pablo / sync |
| Supabase/Studio = datos de producto | `inventory_items`, `football_shirt_details` | sin cambios | Studio |

No hay capa desconocida. No se tocó el esquema de S023A.

---

## 4. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/lib/wc/term-cache.ts` (**nuevo**) | `loadCachedTerms()` lee `wc_terms` por `taxonomy_slug` (RLS `authenticated`). `matchCachedTermId()` resuelve label visible → term ID (match exacto case-insensitive por `name`/`slug`; fallback de alias vía las opciones de `wc-terms-mvp.ts`). `matchCachedTermLabel()` resuelve term ID → nombre cacheado. Nunca inventa IDs — devuelve `''` si no hay match. |
| `studio/app/inventory/actions.ts` | `createInventoryItem`/`updateInventoryItem` cargan `wc_terms` (pa_liga/pa_equipo/pa_ano) y resuelven `ligaTermId`/`equipoTermId`/`temporadaTermId` con `matchCachedTermId()` en vez de `resolveTermId()` sobre el mapa estático. `marca` no tiene taxonomía WC sincronizada y sigue resolviendo contra el mapa local (sin cambio funcional: siempre devolvía `''`). |
| `studio/lib/wc/bridge.ts` | `resolveAttributeOption()` ahora recibe los términos cacheados (`cachedTerms.pa_liga/pa_equipo/pa_ano`) en vez de las listas de `wc-terms-mvp.ts`. Se eliminó el import operativo de `equipoOptions`/`ligaOptions`/`temporadaOptions`/`getTermLabelById`. Mensajes de error actualizados (ya no mencionan `wc-terms-mvp.ts`). |
| `studio/lib/wc-terms-mvp.ts` | Comentario de depreciación explícito: `termId` ya no se lee operativamente para liga/equipo/temporada; el archivo es solo presentación (label/value/aliases/titleLabel/helpText). Se eliminó `getTermLabelById()` por quedar sin uso tras el cambio. |

---

## 5. Qué queda fuera (sin tocar)

- Creación de términos nuevos en WooCommerce — S023C.
- Resolución de `pa_jugador` — sigue sin tocar; `jugador` se sigue guardando como `''` desde el formulario, sin intento de resolución contra caché. S023D.
- Selector de categorías — S023E.
- `studio/components/ItemForm.tsx` — sin cambios. Las opciones visibles (datalist) siguen viniendo de `wc-terms-mvp.ts` por decisión explícita del orquestador (evitar UI churn); la resolución real de term ID ocurre server-side en `actions.ts` al guardar, no en el render del formulario.
- Esquema SQL de S023A — sin `ALTER TABLE`, sin cambios.
- `studio/lib/wc/client.ts`, `studio/lib/wc/taxonomy-sync.ts`, `studio/app/inventory/sync/route.ts` — sin cambios.

---

## 6. Validaciones locales del agente

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 rutas) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan del diff | CLEAN |
| `agent_events.jsonl` | parseable (ver entrada de cierre) |

No se ejecutó sync. No se llamó a WooCommerce. No se tocó Supabase remoto desde el agente. No se llamó a `POST/PUT/PATCH/DELETE` de ningún tipo.

---

## 7. Confirmaciones explícitas

```
wc_api_called_by_agent=false
wc_post_called=false
woocommerce_modified_by_agent=false
wordpress_modified=false
supabase_remote_modified_by_agent=false
env_local_modified=false
products_modified_by_agent=false
terms_created=false
published=false
```

---

## 8. Instrucciones para Pablo (TEST_REAL)

1. `cd studio && npm run dev`.
2. Crear un item nuevo en Studio con un equipo que **ya existía en WooCommerce** pero
   tenía `termId: ''` en `wc-terms-mvp.ts` — por ejemplo:
   - Equipo: `Real Madrid` (o `FC Barcelona`)
   - Liga: `LaLiga`
   - Año: un año real ya sincronizado (p.ej. `2014-15`)
   - Talla, condición, medidas, defectos — cualquier valor real.
3. Guardar el item (esto resuelve los term IDs contra la caché al guardar).
4. Aprobar contenido SEO manual con precio web.
5. Pulsar **"Crear borrador en WooCommerce"** una sola vez.
6. En WP Admin → Productos → Borradores, confirmar:
   - Producto en Borrador, no publicado.
   - Liga, Equipo y Año aparecen seleccionados en "Detalles del Producto".
   - Talla/medidas/condición/defectos siguen OK.
   - Categoría sigue OK (Otros Clubs / Selecciones según liga).
   - Inventario = 1.
   - No se creó ningún término nuevo.
   - Jugador no se evalúa en este test (diferido a S023D).

Si el equipo elegido resuelve su term ID sin haber sido parcheado a mano en
`wc-terms-mvp.ts`, el objetivo de S023B queda validado.

---

## 9. Siguiente paso

- Si Pablo valida PASS → abrir **S023C — CONTROLLED_TERM_CREATION** en una sesión
  nueva.
- Si falla por resolución/caché → `FIX_BLOCKER_FIRST` dentro de S023B (no abrir S023C).
- Si aparece jugador/Rivaldo como bloqueante → diferir a S023D, no mezclar con S023B.

---

*Sesión S023B — 2026-06-30 — Claude Code (Sonnet). ASK→CODE / LOCAL_CODE / NO_WC_CALL_BY_AGENT / NO_TERM_CREATION / NO_PUBLISH.*
