# STUDIO_CONTROLLED_TERM_CREATION_RESULT — S023C

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-30
**Sesión:** S023C — CONTROLLED_TERM_CREATION
**Modo:** ASK→CODE / WC_TERM_WRITE_ONLY / NO_PRODUCT_WRITE / NO_PUBLISH / NO_UI_POLISH
**Agente:** Claude Code (Sonnet)
**Veredicto:** `READY_FOR_PABLO_TERM_CREATION_TEST`
**Depende de:** `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_TERM_CACHE_BACKED_OPTIONS_RESULT.md` (S023B), `STUDIO_WC_TAXONOMY_SYNC_RESULT.md` (S023A), `STUDIO_SESSION_GATES.md`

---

## 1. Resultado

S023C permite crear un término faltante de `pa_liga` / `pa_equipo` / `pa_ano` directamente desde
Catenaccio Studio, de forma explícita (botón dedicado, nunca automática), con dedupe en dos capas
antes de cualquier escritura a WooCommerce, y con write-through inmediato a la caché Supabase
`wc_terms` con el ID real devuelto por Woo.

`pa_jugador` queda fuera de alcance de forma estructural: el mapa de taxonomías controladas en
`term-create.ts` solo contiene `pa_liga`, `pa_equipo` y `pa_ano` — no hay forma de invocar creación
de jugador desde este código. Queda para S023D.

No se creó ningún producto. No se publicó nada. No se tocó `pa_jugador`, categorías, ni el bridge de
producto.

---

## 2. Gates

| Gate | Veredicto | Razón |
|------|-----------|-------|
| `ACF_CONFIG_GATE` | PASS | S023C no escribe `meta_data`/ACF. Solo gestiona identidad de término vía `POST .../products/attributes/{id}/terms`. `bridge.ts`, `ACF_KEYS` y el formato array de `ano_temporada` no cambian. |
| `DATA_LAYER_MAPPING_GATE` | PASS | Única capa nueva: identidad de término WC → `wc_terms` (write-through, `source='studio_created'` o `'wc_sync'` si ya existía). No se toca `wp_postmeta`, companion keys, `wp_term_relationships` ni Rank Math. |
| `PRODUCT_REFERENCE_DIFF_GATE` | PASS (N/A funcional) | No hay cambio de payload de producto — `bridge.ts`/`client.ts` no se tocaron, por lo que no hay diff nuevo que clasificar frente a 1731. |
| `NO_MICROPATCH_LOOP_GATE` | PASS | Alcance cerrado: 3 archivos nuevos + 1 archivo editado (adición acotada en `ItemForm.tsx`) + CSS mínimo. Sin capas nuevas no previstas. |

---

## 3. DATA_LAYER_MAPPING_GATE — detalle

| Dato | Fuente de identidad | Quién lo crea | Capa de escritura | No se modifica |
|------|---------------------|----------------|--------------------|-----------------|
| Término nuevo `pa_liga`/`pa_equipo`/`pa_ano` | WooCommerce (`POST .../attributes/{id}/terms`) | Pablo (acción explícita en Studio) | `wc_terms` (Supabase, write-through inmediato) | `wp_postmeta`, ACF companion keys, `wp_term_relationships`, productos |
| Dedupe pre-POST | Caché `wc_terms` + `GET .../attributes/{id}/terms?search=` en vivo | — | lectura, sin escritura | — |
| Resolución de term ID al guardar un item | `wc_terms` (sin cambios desde S023B) | — | `studio/app/inventory/actions.ts` (sin tocar) | — |

No hay capa desconocida. No se tocó el esquema SQL de S023A.

---

## 4. Archivos creados

| Archivo | Rol |
|---------|-----|
| `studio/lib/wc/term-create.ts` | `createControlledTerm(taxonomySlug, name)` — dedupe en 2 capas (caché Supabase, luego GET en vivo a Woo), `POST` solo si ninguna confirma existencia, manejo del caso en que Woo rechaza por nombre duplicado (`data.resource_id`), upsert a `wc_terms` con el ID real. Mapa de taxonomías controladas fijo: `{ pa_liga: 5, pa_equipo: 4, pa_ano: 7 }`. |
| `studio/app/inventory/term-actions.ts` | Server Action `createTermAction(taxonomySlug, name)` — wrapper delgado sobre `createControlledTerm`. Mismo patrón que `wc-actions.ts` (S022C). |
| `studio/components/TermCreateButton.tsx` | Componente cliente: botón "Crear término en Woo" + estado de resultado inline (creado/existente/error). No se dispara solo — únicamente al pulsar. Independiente del guardado del item. |

## 5. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `studio/components/ItemForm.tsx` | Import de `TermCreateButton`. Se añade el botón bajo los campos Liga, Equipo y Temporada (los tres campos con taxonomía WC sincronizada), pasando el valor actualmente tecleado como `label`. Ningún otro campo del formulario cambia. Jugador y Marca no llevan botón (jugador = S023D; marca no tiene taxonomía WC sincronizada). |
| `studio/styles/globals.css` | 3 clases CSS mínimas (`.term-create-action`, `.term-create-result`, `.term-create-error`), mismo patrón visual que `.wc-draft-*` ya existente. Sin rediseño. |

---

## 6. Cómo funciona el dedupe (en orden)

1. **Caché Supabase (`wc_terms`)** — `loadCachedTerms()` (S023A/B, sin cambios) + match exacto
   case-insensitive por `name` o `slug`. Si hay match → `existing=true`, sin llamar a Woo.
2. **GET en vivo a Woo** (`.../attributes/{id}/terms?search=<name>`) — cubre el caso de que el
   término ya exista en WooCommerce pero la caché esté desactualizada (creado manualmente en WP
   Admin después del último sync). Si hay match → se actualiza la caché (`source='wc_sync'`) y se
   devuelve `existing=true`, sin POST.
3. **POST** — solo si ninguna de las dos capas anteriores confirma existencia. Si WooCommerce aun
   así rechaza por nombre duplicado (login HTTP 400 con `data.resource_id` apuntando al término
   existente), se trata como `existing=true` en vez de error — red de seguridad final, no el
   mecanismo principal.

Normalización: `name = rawName.trim().replace(/\s+/g, ' ')` — sin forzar mayúsculas/minúsculas; Woo
genera el slug. La comparación para dedupe usa `trim().toLowerCase()`, igual que `term-cache.ts`.

---

## 7. Qué queda fuera (sin tocar)

- `pa_jugador` / Rivaldo — S023D. No alcanzable desde este código (estructuralmente excluido del mapa).
- Categorías — S023E.
- `studio/lib/wc/bridge.ts`, `studio/lib/wc/client.ts` — sin cambios. El payload de producto no cambia.
- `studio/app/inventory/actions.ts` — sin cambios. La resolución de term ID al guardar el item sigue
  usando `matchCachedTermId()` (S023B); un término recién creado se resuelve solo al guardar porque
  la caché ya tiene la fila nueva.
- `studio/lib/wc/taxonomy-sync.ts`, `studio/app/inventory/sync/route.ts` — sin cambios.
- Creación batch o silenciosa de términos — solo un término por click, explícito.
- Esquema SQL de S023A — sin `ALTER TABLE`.

---

## 8. Validaciones locales del agente

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | PASS |
| `npm run build` | PASS (8/8 rutas) |
| `npm run lint` | PASS (0 issues) |
| `git diff --check` | PASS |
| Secret scan del diff | CLEAN |

No se ejecutó ninguna creación de término real desde el agente. No se llamó a WooCommerce durante
esta sesión de implementación.

---

## 9. Confirmaciones explícitas

```
wc_get_called_by_agent: false
wc_post_terms_called_by_agent: false
wc_post_products_called_by_agent: false
woocommerce_product_modified: false
wordpress_modified_outside_terms: false
supabase_remote_modified_by_agent: false
env_local_modified: false
products_modified: false
terms_created: false
categories_created: false
published: false
```

La implementación está completa y validada localmente, pero ninguna llamada real a WooCommerce se
ejecutó desde el agente. La creación de término real queda para el test de Pablo.

---

## 10. Instrucciones para Pablo (TEST_REAL)

1. `cd studio && npm run dev`.
2. Abrir **Nueva camiseta** (o editar una existente).
3. En el campo **Equipo**, escribir un nombre que sepas que **no existe** en WooCommerce/caché.
   Recomendación para la primera prueba: algo claramente descartable, p.ej. `ZZZ Studio Test Team`
   (fácil de identificar y borrar después en WP Admin sin afectar catálogo real). Alternativa: un
   equipo real que sepas que falta, si prefieres validar con un dato útil.
4. Pulsar **"Crear término en Woo"** bajo ese campo.
5. Confirmar en pantalla:
   - `Creado en WooCommerce — ID <num>` la primera vez.
6. Volver a pulsar el mismo botón con el mismo texto sin recargar la página:
   - Debe devolver `Ya existía en WooCommerce — ID <num>` (mismo ID), **no** un ID nuevo.
7. En **WP Admin → Productos → Atributos → Equipo → Términos**, confirmar que el término aparece una
   sola vez con ese nombre.
8. Revisar (opcional, vía Supabase SQL Editor) que `wc_terms` tiene una fila con ese `id`,
   `taxonomy_slug='pa_equipo'`, `source='studio_created'`.
9. Confirmar:
   - No se creó ningún producto.
   - No se publicó nada.
   - No se tocó jugador ni categorías.
10. Repetir opcionalmente con Liga o Temporada para validar las otras dos taxonomías.
11. Si quieres descartar el término de prueba, bórralo manualmente en WP Admin (Studio no expone
    borrado de términos — fuera de alcance de S023C).

---

## 11. Riesgos documentados

| Riesgo | Mitigación |
|--------|------------|
| Heurística de duplicado en el POST (`data.resource_id`) puede no coincidir exactamente con el shape de error de la versión de WooCommerce instalada | No es el mecanismo principal — las 2 capas de dedupe previas (caché + GET en vivo) cubren la inmensa mayoría de casos antes de llegar al POST |
| Si el upsert a `wc_terms` falla tras un POST exitoso a Woo | Término ya existe en WooCommerce (estado correcto); la caché queda desactualizada para ese término hasta el próximo `POST /inventory/sync` (S023A), que la repara. No bloquea ni revierte la creación. |
| Pablo escribe un nombre con variación menor (espacios, mayúsculas) de un término ya existente | Normalización case-insensitive + trim en las 2 capas de dedupe debería capturarlo antes del POST |

---

## 12. Siguiente paso

Si Pablo confirma en esta sesión: término creado o detectado sin duplicar, caché actualizada, visible
en WP Admin, sin productos ni publicación → **`APPROVE_READY_FOR_S023D`** (PLAYER_TERM_RESOLUTION).

Si el dedupe falla o la caché no se actualiza → `FIX_BLOCKER_FIRST` dentro de S023C.

---

*Sesión S023C — 2026-06-30 — Claude Code (Sonnet). ASK→CODE / WC_TERM_WRITE_ONLY / NO_PRODUCT_WRITE / NO_PUBLISH / NO_UI_POLISH.*
