# STUDIO_ROADMAP_S023_S030 — Catenaccio Studio Suite

Hoja de ruta de implementación, una tarea por sesión, con gates, agente recomendado, validación,
criterio de parada y qué queda fuera de cada fase.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesión:** S023-STRATEGY — OPUS_MAX_STUDIO_SUITE_ARCHITECTURE_REVIEW
**Modo:** STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE
**Depende de:** `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_SESSION_GATES.md`, `STUDIO_SUITE_BUILD_SYSTEM_LESSONS.md`

---

## 0. Principios del roadmap

1. **Una tarea por sesión.** S023 NO es una sesión; es una fase (S023A→S023E).
2. **Gates antes de CODE.** Toda sesión que toque payload/taxonomía/UI pasa los gates de
   `STUDIO_SESSION_GATES.md` antes de escribir código.
3. **Progreso lineal.** Cualquier bucle de rework dispara `NO_MICROPATCH_LOOP_GATE` → STOP_AND_REPLAN
   (RULE-01 / PATTERN-07).
4. **DRAFT_ONLY hasta S030.** Publicar es manual en WP Admin hasta que S030 lo cambie con preflight.
5. **Implementar con Sonnet/Codex, no Opus.** Opus solo para estrategia y desbloqueos (DEC-PABLO-01).
6. **Cada bloque cierra con un test real de Pablo**, no con typecheck.

---

## 1. Vista de fase

| Fase | Nombre | Escribe en Woo | Agente | Riesgo | Gate de entrada |
|------|--------|----------------|--------|--------|-----------------|
| **S023A** | WC taxonomy/category READ-SYNC → caché Supabase | **No** (solo GET) | Codex | Bajo | DATA_LAYER_MAPPING |
| S023B | Caché → opciones de formulario + bridge; deprecar `wc-terms-mvp.ts` | No | Sonnet | Medio | PRODUCT_REFERENCE_DIFF |
| S023C | Creación controlada de términos desde Studio | **Sí** (POST terms) | Sonnet (ASK→CODE) | Medio-Alto | ACF_CONFIG + dedupe |
| S023D | `PLAYER_TERM_RESOLUTION` (pa_jugador, Rivaldo) | Sí (POST terms) | Sonnet | Medio | hereda S023C |
| S023E | Selector de categoría en Studio (Leyendas/Nuevo/…) | No (usa caché) | Sonnet + Pablo visual | Bajo | DOMAIN_PRODUCT_MODELING |
| S024 | Product draft completeness + preflight (SKU, fixture, batch-PATCH 1854) | Sí (PUT) | Sonnet | Medio | FULL_FIXTURE + PRODUCT_REFERENCE_DIFF |
| S025 | Image pipeline (Storage → Media → asignar) | Sí (POST media) | Sonnet + Antigravity visual | Medio | validación visual |
| S026 | Stock operations (post-venta, reservas, Vinted) | Sí (PUT stock) | Sonnet | Medio | PRODUCTION_ONLY si toca pedidos |
| S027 | Rank Math / SEO metadata completo | Sí (meta) | Sonnet | Bajo-Medio | PRODUCT_REFERENCE_DIFF (1731) |
| S028 | Landing architecture (equipo/liga/año/jugador, colecciones) | WP-side / docs | Opus plan → Sonnet/Antigravity | Medio | arquitectura previa |
| S029 | Published product sync / drift detection (Woo→Studio) | No (GET) | Codex | Bajo | DATA_LAYER_MAPPING |
| S030 | Controlled publish flow (preflight + confirm + rollback) | **Sí (publish)** | Opus plan → Sonnet | **Alto** | preflight verde + Pablo |

---

## 2. Fase S023 — Taxonomy & Category Manager (descompuesta)

### S023A — WC_TAXONOMY_CATEGORY_READ_SYNC ◄ PRIMER BLOQUE IMPLEMENTABLE

> Detalle exhaustivo en §4. Resumen: tablas de caché en Supabase + sync read-only que ingiere todo el
> vocabulario WC existente. Cero escrituras a Woo. Mata el problema del mapa vacío para todos los
> términos que ya existen.

| Campo | Valor |
|-------|-------|
| Objetivo | Ingerir `pa_liga/pa_equipo/pa_ano/pa_jugador` + categorías a una caché Supabase, read-only contra WC |
| Agente | **Codex** (sync determinista controlado, sin UI — DEC-PABLO-01) |
| Gate de entrada | `DATA_LAYER_MAPPING_GATE` (esquema de caché) |
| Escribe en Woo | **No** — solo `GET` |
| Validación | counts de caché == counts WC (21 equipos, 18 temporadas, ~6 ligas, N jugadores, 5 categorías) |
| Test de Pablo | tras sync, Real Madrid resuelve a 70 / FC Barcelona a 170 sin editar ningún `.ts` |
| Criterio de cierre | caché poblada, counts coinciden, 0 escrituras WC, SQL aplicado manual por Pablo |
| Fuera de scope | tocar el formulario, el bridge, `wc-terms-mvp.ts`, crear términos, publicar |

### S023B — TERM_CACHE_BACKED_OPTIONS

| Campo | Valor |
|-------|-------|
| Objetivo | El formulario y el bridge resuelven términos contra la caché, no contra `wc-terms-mvp.ts`. Deprecar el mapa estático (marca explícita; conservar opciones de presentación) |
| Agente | Sonnet (código tipado, form + bridge) |
| Gate de entrada | `PRODUCT_REFERENCE_DIFF_GATE` (comparar borrador generado vs 1731 tras el cambio) |
| Escribe en Woo | No |
| Validación | typecheck/build/lint PASS + un borrador de fixture sigue hidratando Liga/Equipo/Año en WP Admin igual que v2.1 |
| Test de Pablo | crear borrador de una camiseta cuyo equipo ya existía en WC pero tenía `termId:''` en el `.ts` (p.ej. Real Madrid) → ahora resuelve solo |
| Criterio de cierre | `wc-terms-mvp.ts` ya no aporta term IDs; el borrador real valida en WP Admin |
| Fuera de scope | crear términos nuevos (S023C), jugador (S023D), categorías (S023E) |

### S023C — CONTROLLED_TERM_CREATION

| Campo | Valor |
|-------|-------|
| Objetivo | Crear un término faltante (`pa_equipo/pa_liga/pa_ano`) desde Studio vía `POST /wc/v3/products/attributes/{id}/terms`, con dedupe, y write-through a la caché |
| Agente | Sonnet con patrón **ASK→CODE** (toca WC write — ORCHESTRATOR §6) |
| Gate de entrada | `ACF_CONFIG_GATE` + dedupe spec |
| Escribe en Woo | **Sí** — POST terms (no productos) |
| Validación | crear 1 término de prueba controlado → aparece en WC y en la caché; reintento no duplica |
| Test de Pablo | introducir un equipo nuevo real, crear término desde Studio, verificar en WP Admin → pa_equipo |
| Criterio de cierre | término creado desde Studio sin WP Admin; dedupe probado; caché actualizada |
| Fuera de scope | crear categorías; publicar; batch |

### S023D — PLAYER_TERM_RESOLUTION

| Campo | Valor |
|-------|-------|
| Objetivo | Aplicar caché + creación controlada a `pa_jugador` (attribute id 6); resolver Rivaldo; jugador select-or-create con label seguro |
| Agente | Sonnet |
| Gate de entrada | hereda S023C; `FULL_FIXTURE_TEST_GATE` con jugador |
| Escribe en Woo | Sí (POST terms jugador) |
| Validación | borrador con Rivaldo → Jugador aparece seleccionado en WP Admin (cierra el fallo diferido de S022C.8) |
| Test de Pablo | re-crear el caso Rivaldo y confirmar Jugador en "Detalles del Producto" |
| Criterio de cierre | jugador hidrata como Liga/Equipo/Año; sin mapa manual |
| Fuera de scope | colecciones de Leyendas (S028) |

### S023E — CATEGORY_SELECTOR_IN_STUDIO

| Campo | Valor |
|-------|-------|
| Objetivo | Selector de categoría en el formulario, alimentado por `wc_categories`: Leyendas/Nuevo/Otros Clubs/Selecciones; heurística por defecto + override; `rank_math_primary_product_cat` sigue la selección |
| Agente | Sonnet + **validación visual de Pablo** (RULE-02) |
| Gate de entrada | `DOMAIN_PRODUCT_MODELING_GATE` (es UI de dominio) |
| Escribe en Woo | No (la categoría va en el payload del borrador, ya soportado) |
| Validación | borrador con categoría elegida manualmente (Leyendas) → categoría correcta en WP Admin |
| Test de Pablo | marcar una camiseta como Leyendas desde Studio → verificar categoría + primary cat |
| Criterio de cierre | Pablo asigna categoría sin WP Admin; cierra S023 completa |
| Fuera de scope | landings/colecciones editoriales (S028) |

**Cierre de fase S023:** vocabulario vivo (caché + creación), jugador resuelto, categorías desde
Studio. `wc-terms-mvp.ts` deprecado. Sin mapa manual. → abre S024.

---

## 3. Fases S024 – S030

### S024 — PRODUCT_DRAFT_COMPLETENESS_AND_PREFLIGHT
- **Objetivo:** SKU/referencia en payload; **preflight de publicabilidad** (checklist server-side
  antes de crear borrador); validación con fixture completa; batch-PATCH de borradores incompletos
  (1854) **solo si los datos son veraces**, o descarte.
- **Agente:** Sonnet. **Escribe Woo:** sí (PUT sobre borradores existentes).
- **Gates:** `FULL_FIXTURE_TEST_GATE` + `PRODUCT_REFERENCE_DIFF_GATE` (vs 1731).
- **Validación / test Pablo:** un borrador nuevo pasa el preflight con todo verde; 1854 corregido o
  descartado (no publicado con datos falsos).
- **Stop:** si el batch-PATCH abre 2+ capas nuevas → STOP, reabrir mapa de datos.
- **Fuera:** imágenes, publicar.

### S025 — IMAGE_PIPELINE
- **Objetivo:** fuente local → Supabase Storage → `POST /wp/v2/media` → `images:[{id}]`, orden,
  imagen principal, validación visual obligatoria.
- **Agente:** Sonnet (pipeline) + **Antigravity** (validación visual). **Escribe Woo:** sí (media).
- **Gates:** validación visual como prerequisito de cierre (RULE-02).
- **Validación / test Pablo:** borrador con N fotos en orden correcto, principal correcta, visible en
  WP Admin y en preview.
- **Stop:** si la asignación de imágenes a producto falla 2 veces → STOP_AND_REPLAN.
- **Fuera:** edición/retoque de imágenes; CDN.

### S026 — STOCK_OPERATIONS
- **Objetivo:** estados de venta, unidades únicas, reservas, sincronización tras venta (stock→0 +
  estado), tracking Vinted/manual, prevención de doble venta web/Vinted.
- **Agente:** Sonnet. **Escribe Woo:** sí (PUT stock/estado). **PRODUCTION_ONLY_VALIDATION** si toca
  pedidos/emails (PATTERN-08).
- **Gates:** `ECOMMERCE_HOOK_STATE_GUARD` (PATTERN-09) si se tocan hooks; TEST B real (DEC-PABLO-02).
- **Validación / test Pablo:** marcar una camiseta como vendida en Studio → stock 0 en WC, no
  comprable; coherencia web/Vinted.
- **Fuera:** automatizaciones de email; multi-almacén.

### S027 — RANK_MATH_SEO_METADATA
- **Objetivo:** `rank_math_title`, `rank_math_description`, `rank_math_focus_keyword`, primary
  category; frontera Studio (genera) / manual (ajusta).
- **Agente:** Sonnet. **Escribe Woo:** sí (meta).
- **Gates:** `PRODUCT_REFERENCE_DIFF_GATE` vs 1731 (meta Rank Math real).
- **Validación / test Pablo:** borrador con score Rank Math y meta correctos en WP Admin.
- **Fuera:** estrategia de keywords; contenido editorial.

### S028 — LANDING_ARCHITECTURE
- **Objetivo:** landings por equipo/liga/año/jugador, colecciones editoriales (Leyendas, Selecciones,
  Mundiales, Match Worn), rutas canónicas y filtros. Conecta con
  `FUTURE_COLLECTIONS_AND_LEGENDS_LANDINGS` (BACKLOG LATER) y los archives WP.
- **Agente:** **Opus** define arquitectura (toca SEO + posible tema, A0 congelado) → Sonnet/Antigravity
  ejecuta. **Escribe Woo:** WP-side / mayormente docs + config.
- **Gates:** decisión arquitectónica → Opus primero (no auto-implementar).
- **Validación / test Pablo:** una landing de colección navegable y bien indexada.
- **Fuera:** rediseño del storefront; descongelar A0 salvo decisión explícita.

### S029 — PUBLISHED_PRODUCT_SYNC / DRIFT_DETECTION
- **Objetivo:** sync de estado Woo→Studio (publicado/vendido/stock); detección de drift entre Studio
  y Woo (incluida caché de términos obsoleta).
- **Agente:** Codex (lectura determinista). **Escribe Woo:** no (GET).
- **Gates:** `DATA_LAYER_MAPPING_GATE`.
- **Validación / test Pablo:** un cambio hecho en WP Admin se refleja como drift en Studio.
- **Fuera:** resolución automática de conflictos (solo reporte).

### S030 — CONTROLLED_PUBLISH_FLOW
- **Objetivo:** publicar desde Studio detrás de **preflight de publicabilidad** todo-verde +
  **confirmación explícita de Pablo** + **rollback manual documentado**. Default sigue draft.
- **Agente:** **Opus** define el gate de publicación (irreversible/outward-facing) → Sonnet ejecuta.
  **Escribe Woo:** **sí (publish)** — la única fase que publica.
- **Gates:** preflight verde obligatorio; confirmación literal de Pablo; RULE-02/04.
- **Validación / test Pablo:** publicar 1 camiseta real E2E desde Studio → verificar en tienda →
  abre `GATE_STUDIO_MVP` (medir tiempo/camiseta vs ~45 min).
- **Fuera:** publicación masiva/automática; scheduling.

---

## 4. PRIMER BLOQUE IMPLEMENTABLE — S023A (especificación exacta)

### 4.1 Objetivo
Ingerir el vocabulario de taxonomías y categorías **ya existente** en WooCommerce a una caché en
Supabase, en modo **estrictamente read-only contra WC**. Resultado: Studio conoce los term IDs reales
de todos los términos que hoy existen (Real Madrid=70, FC Barcelona=170, los 21 equipos, 18
temporadas, ligas, jugadores y 5 categorías) sin ningún mapa manual.

### 4.2 Por qué es el primer bloque correcto
- **Máximo valor:** elimina la causa raíz (mapa vacío) para todo el catálogo existente.
- **Mínimo riesgo:** no escribe en Woo (solo `GET`), no toca productos, no publica, no toca el bridge
  ni el formulario; en Supabase es **aditivo** (`CREATE TABLE`, sin `ALTER`).
- **Desbloquea** S023B/C/D/E y reduce la incertidumbre de todas las fases siguientes.
- **Agente correcto:** Codex (sync determinista controlado, sin UI).

### 4.3 Qué archivos tocaría
| Archivo | Acción |
|---------|--------|
| `docs/studio/STUDIO_WC_TERM_CACHE_SCHEMA.sql` | **nuevo** — DDL canónico de `wc_taxonomies`, `wc_terms`, `wc_categories` (+ RLS read para `authenticated`). Aplicado **manualmente por Pablo** (patrón S020D) |
| `studio/lib/wc/taxonomy-sync.ts` | **nuevo** — servicio server-side: GET terms de attrs 4/5/6/7 + GET categories; upsert a caché |
| `studio/app/inventory/sync/route.ts` (o server action equivalente) | **nuevo** — disparador autenticado del sync (sin UI compleja) |
| `studio/lib/types.ts` | tipos de las filas de caché |
| `scripts/studio/verify_wc_term_cache.sql` | **nuevo** — verificador read-only de counts (patrón S020C) |
| `docs/studio/STUDIO_WC_TAXONOMY_SYNC_RESULT.md` | **nuevo** — resultado |
| `BACKLOG.md` / `CONTEXTO.md` / `HISTORIAL_SESIONES.md` / `agent_events.jsonl` | cierre |

### 4.4 Qué NO tocaría
`studio/lib/wc/bridge.ts`, `studio/lib/wc/client.ts` (payload), `studio/components/ItemForm.tsx`,
`studio/lib/wc-terms-mvp.ts` (se deprecará en **S023B**, no aquí), `.env.local`, esquema de tablas
existentes (`inventory_items`, `football_shirt_details`), DRAFT_ONLY, idempotencia, productos WC,
WP Admin, publicación.

### 4.5 Qué fixture usar
La **fixture es el vocabulario completo real de WC** (no parcial): los 21 equipos de `pa_equipo`, las
18 temporadas de `pa_ano`, las ligas de `pa_liga`, los jugadores de `pa_jugador` y las 5 categorías.
Esto satisface `FULL_FIXTURE_TEST_GATE` por construcción.

### 4.6 Qué test real haría Pablo
1. Aplicar `STUDIO_WC_TERM_CACHE_SCHEMA.sql` en Supabase SQL Editor (manual).
2. Disparar el sync desde Studio (acción autenticada).
3. Ejecutar `scripts/studio/verify_wc_term_cache.sql` y confirmar:
   - `wc_terms` para `pa_equipo` = 21 filas; `pa_ano` = 18; categorías = 5.
   - Real Madrid → 70, FC Barcelona → 170, 2014-15 → 139 presentes en la caché.
4. Confirmar `wc_post_called=false` (ninguna escritura a Woo).

### 4.7 Qué resultado cierra el bloque
Caché poblada con todo el vocabulario WC, counts == counts de WC, cero escrituras a Woo, SQL aplicado
manualmente por Pablo, verificador PASS. Veredicto de cierre: `APPROVE_READY_FOR_S023B`.

### 4.8 Criterio de parada de S023A
Si durante el sync aparecen ≥2 capas no previstas (p.ej. paginación rara, atributos extra, jugadores
con cardinalidad inesperada) → **STOP**, documentar, no parchear en caliente
(`NO_MICROPATCH_LOOP_GATE`).

---

## 5. Estrategia anti-sesiones-sucias (resumen operativo)

Detalle completo en `STUDIO_SESSION_GATES.md`. En el roadmap:
- Cada fila de §1 lleva su **gate de entrada**. No se abre CODE sin pasarlo.
- **Cuándo parar y escalar:** 2+ capas nuevas en implementación, o 3 sesiones sin TEST B → STOP →
  COLD_REVIEW (agente distinto) → SIMPLIFY → REPLAN (RULE-01 / PATTERN-07).
- **Cuándo Opus:** decisión arquitectónica/irreversible (S028, S030) o desbloqueo. Nunca para microfix.
- **Cuándo Codex:** sync/validación determinista sin UI (S023A, S029).
- **Cuándo Sonnet:** código tipado de form/bridge, WC writes con ASK→CODE (S023B/C/D/E, S024, S026,
  S027).
- **Cuándo Antigravity:** validación visual (S025, partes de S028).

---

## 6. Veredicto

`READY_FOR_S023A_IMPLEMENTATION`. Abrir S023A como sesión Codex, read-only contra WC, con el gate
`DATA_LAYER_MAPPING_GATE` y la fixture de vocabulario completo. No abrir S023B–E ni S024+ hasta cerrar
cada bloque con el test real de Pablo.

---

*Sesión S023-STRATEGY — 2026-06-29 — Claude Code (Opus 4.8). STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE.*
