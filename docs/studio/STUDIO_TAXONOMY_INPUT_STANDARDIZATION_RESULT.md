# STUDIO — Taxonomy Input Standardization (S024A)

**Sesión:** S024A · 2026-07-01 · Claude Code Opus 4.8
**Modo:** ASK_TO_CODE / TAXONOMY_UX_STANDARDIZATION / NO_WC_WRITE_BY_AGENT / NO_PUBLISH / NO_DEPLOY
**Veredicto:** `APPROVE_READY_FOR_S024`

## Problema (raíz)

Tras S023A–E la base técnica estaba validada, pero los campos de taxonomía del
formulario eran incoherentes:

- **Liga / Equipo / Año** sugerían desde listas **estáticas** de `wc-terms-mvp.ts`
  (Equipo ~60 entradas → "muchos términos").
- **Jugador** no tenía `<datalist>`: la única sugerencia era el **autocompletado de
  historial del navegador** → por eso "solo aparecía Rivaldo".

La caché `wc_terms` (S023A) **ya contenía** los términos reales (`pa_jugador=18`, incl.
Rivaldo y Ronaldinho, creado por Pablo desde Studio). El desajuste era **de UI**, no de
datos: las listas visibles no leían la caché. La resolución de term IDs **al guardar**
(`actions.ts`, S023B/D) sí usaba la caché y quedó intacta.

## Solución

Una capacidad de producto: *"Taxonomy input standardization"*.

1. **Helper** `studio/lib/wc/term-options.ts` (nuevo)
   - `loadTermOptions(supabase, slugs)` — server; convierte filas `wc_terms` en opciones
     por taxonomía (`id/name/slug/taxonomySlug/source`), alfabetizadas. Reutiliza
     `loadCachedTerms`. No inventa IDs, no llama Woo.
   - `matchTermOption(options, value)` — puro; resuelve el texto escrito a una opción
     cacheada por match exacto case-insensitive de name/slug. `null` = no existe todavía.

2. **Componente** `studio/components/TaxonomyTermField.tsx` (nuevo, reutilizable)
   - Entrada manual libre + datalist desde la caché real.
   - Estado visible por campo: **✓ Existe en Woo · ID** / **Nuevo término** / **Sin caché**.
   - Botón **"Crear término en Woo" solo cuando el término no existe** y hay ≥2 caracteres;
     oculto si ya existe.
   - Fallback a la lista estática **solo si la caché está vacía** (pre-sync).

3. **`TermCreateButton`** — callback opcional `onCreated`: al crear, el campo pasa a
   "existe" **sin refresh** (la action ya hace write-through a `wc_terms`). Endpoint y
   lógica de creación sin cambios.

4. **`ItemForm`** — prop `termOptions`, estado local de términos, y los 4 campos
   (Liga/Equipo/Año/Jugador) renderizados vía `TaxonomyTermField`.

5. **Pages** `new` / `edit` — cargan opciones server-side (`loadTermOptions`, `Promise.all`
   junto a la categoría) y las pasan a `ItemForm`.

## Qué NO se tocó

`actions.ts` (resolución/guardado), `bridge.ts`, `client.ts`, `term-cache.ts`,
`term-create.ts`, `wc-terms-mvp.ts`, SQL, Supabase remoto, `.env.local`, WooCommerce,
publicación. Sin regresión S023B/C/D/E; categoría (S023E) y DRAFT_ONLY intactos.

## Diferido (FUTURE, no implementado)

`FUTURE_TAXONOMY_SMART_SUGGESTIONS` (grafo Liga→Equipo→Temporada→Jugador, filtros
contextuales), `STUDIO_TAXONOMY_UNIVERSE_MANAGER`, atributos Woo nuevos, landings.

## Validaciones

typecheck PASS · build PASS (8/8 rutas) · lint PASS (0 issues) · `git diff --check` PASS ·
secret scan CLEAN · JSONL parseable.

## Test de Pablo

`cd studio && npm run dev` → nueva/editar camiseta. Comprobar en Liga/Equipo/Año/Jugador:
sugerencias desde caché (Jugador muestra Rivaldo/Ronaldinho); texto existente → sin botón
crear; texto nuevo → estado "Nuevo término" + botón crear; crear → usable tras guardar; sin
regresión. No crear borrador Woo si no hace falta; no publicar. Confirmar `PABLO_TAXONOMY_UX_OK`.

Pablo confirmó `PABLO_TAXONOMY_UX_OK`: sugerencias coherentes desde `wc_terms`, Jugador sin dependencia del historial del navegador, Rivaldo/Ronaldinho visibles si están en caché, botón Crear término solo para términos inexistentes y sin regresión S023B/C/D/E. S024 no se abrió.
