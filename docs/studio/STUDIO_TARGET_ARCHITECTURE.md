# STUDIO_TARGET_ARCHITECTURE — Catenaccio Studio / Woo / ACF

Arquitectura objetivo de la suite Catenaccio Studio como sistema operativo de catálogo,
stock, taxonomías, categorías, imágenes, SEO y publicación controlada.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-29
**Sesión:** S023-STRATEGY — OPUS_MAX_STUDIO_SUITE_ARCHITECTURE_REVIEW
**Modo:** STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE
**Veredicto:** READY_FOR_S023A_IMPLEMENTATION
**Depende de:** `STUDIO_DATA_MODEL.md`, `STUDIO_WC_PAYLOAD_SPEC.md`, `STUDIO_WC_DRAFT_BRIDGE_RESULT.md`, `STUDIO_WC_DRAFT_PUBLISHABILITY_GAP_AUDIT.md`, `STUDIO_SUITE_BUILD_SYSTEM_LESSONS.md`, `STUDIO_OPUS_STRATEGY_BRIEF.md`, `CATENACCIO_STRATEGIC_ROADMAP.md` (DEC-13)
**Hermanos:** `STUDIO_ROADMAP_S023_S030.md`, `STUDIO_SESSION_GATES.md`

---

## 0. TL;DR (lectura de 60 segundos)

1. **Causa raíz de la sesión sucia S022C:** Studio no tiene conocimiento vivo del vocabulario de
   taxonomías de WooCommerce. El mapa estático `studio/lib/wc-terms-mvp.ts` tiene `termId: ''` en
   ~95% de equipos/temporadas/ligas. Cada camiseta nueva exige: crear término a mano en WP Admin →
   parchear el mapa a mano → re-editar el item → re-guardar → reintentar. Eso es el motor de los
   microparches.
2. **Decisión arquitectónica central:** WooCommerce es la **fuente de verdad de la identidad de
   términos** (IDs/slugs de `pa_liga`, `pa_equipo`, `pa_ano`, `pa_jugador` + categorías). Studio
   **cachea** ese vocabulario en Supabase y lo lee en runtime; **no** hace GET a Woo en cada render.
   Studio pasa a ser la **superficie de autoría**: crea términos nuevos vía WC REST y actualiza la
   caché, eliminando el paso manual de WP Admin.
3. **`wc-terms-mvp.ts` queda DEPRECATED** y se reemplaza por la caché. Se conserva solo como semilla
   de migración con marca explícita.
4. **Datos de producto:** la fuente de verdad sigue siendo Supabase/Studio (DEC-13). Woo es destino.
5. **Publicar sigue siendo manual en WP Admin** (DRAFT_ONLY, DEC-9) hasta S030, donde se introduce
   publicación controlada desde Studio con preflight + confirmación de Pablo + rollback manual.
6. **S023 NO es una sesión:** es una fase. Se descompone en S023A→S023E, una tarea por sesión, con
   gates obligatorios (`STUDIO_SESSION_GATES.md`). El primer bloque implementable es **S023A —
   sincronización read-only del vocabulario WC existente a una caché en Supabase**: máximo valor,
   mínimo riesgo (no escribe en Woo, solo añade tablas en Supabase).

---

## 1. Reconstrucción de la línea S022 → S022C

### 1.1 Qué se intentó

Construir el puente Studio → WooCommerce para que Pablo cree **borradores publicables** de camisetas
desde Studio en lugar de teclearlas a mano en WP Admin (~45 min/camiseta). El recorrido fue:

- S019 data model → S020 contrato de puente → S020B write-access test (producto dummy 1853) →
  S021 scaffold Next.js → S022A formulario + dominio → S022B IA (diferida por coste) →
  S022B.1 SEO manual → **S022C bridge real** (borradores reales) → S022C.2–.8 cadena de fixes.

### 1.2 Qué funcionó (no re-litigar — está validado)

| Hito | Evidencia en repo |
|------|-------------------|
| `DRAFT_ONLY` blindado | `status: 'draft'` literal y guard en `studio/lib/wc/client.ts` + `bridge.ts:326` |
| Idempotencia | check `wc_product_id IS NULL` en `bridge.ts:137` |
| Precio desde flujo SEO manual | `saveManualSeoContent` → `precio_publicado_web` (S022C.1) |
| Talla, condición, medidas, defectos en borrador | `bridge.ts:346-355` |
| Categoría automática (Otros Clubs / Selecciones) | `resolveCategoryId()` `bridge.ts:47` |
| Stock operativo unitario | `manage_stock: true` + `stock_quantity: 1` `bridge.ts:331` |
| **Liga/Equipo/Año hidratados en WP Admin** | `attributes[] + meta_data ACF` v2.1, validado por Pablo (`PABLO_TAXONOMY_DRAFT_OK`) |
| Baseline de seguridad | secretos solo server-side, sanitizeMessage, snapshot sin credenciales |

### 1.3 Qué falló

| Fallo | Capa | Estado |
|-------|------|--------|
| Primer borrador (1854) incompleto: faltaban ACF `_fieldkeys`, `ano_temporada` string en vez de array, sin medidas/defectos/categoría, `manage_stock:false` | payload v1.0 | Corregido en v2.0/v2.1 |
| Term IDs ausentes para casi todo el catálogo | `wc-terms-mvp.ts` | **Deuda viva — núcleo de S023** |
| Jugador/Rivaldo no apareció | `pa_jugador` + label seguro | Diferido → `PLAYER_TERM_RESOLUTION` (S023D) |
| El diagnóstico cambió varias veces durante la implementación | proceso | Capturado como gates |

### 1.4 Qué deuda quedó

1. **`wc-terms-mvp.ts` provisional** — mapa estático mantenido a mano, vacío en ~95% de entradas.
   Es la deuda número 1. (Confirmado leyendo el archivo: solo Eredivisie=177, LaLiga=72,
   Premier=95, Serie A=51, Francia=129, PSV=179, 2007-09=180, 2014-15=139 tienen ID.)
2. **Sin fuente viva de taxonomías/categorías** — la creación de términos es manual en WP Admin.
3. **Jugador sin resolver** (`PLAYER_TERM_RESOLUTION`).
4. **Categorías curatoriales** (Leyendas, Nuevo) asignadas a mano.
5. **Imágenes** diferidas (manual en WP Admin).
6. **Rank Math SEO** completo diferido (solo `rank_math_primary_product_cat`).
7. **SKU/referencia** no se envía.
8. **Productos de prueba 1854/1856** pueden contener datos falsos de equipo/temporada → **no
   publicar**.

### 1.5 Qué aprendizajes deben volverse gates

De `STUDIO_SUITE_BUILD_SYSTEM_LESSONS.md §5`, formalizados en `STUDIO_SESSION_GATES.md`:
`PRODUCT_REFERENCE_DIFF_GATE`, `ACF_CONFIG_GATE`, `DATA_LAYER_MAPPING_GATE`,
`FULL_FIXTURE_TEST_GATE`, `NO_MICROPATCH_LOOP_GATE`. La lección madre: **mapear todas las capas de
persistencia de cada dato antes de escribir el payload**, no descubrir arquitectura durante la
implementación.

---

## 2. Las capas de persistencia (mapa canónico de datos)

Confirmadas en S022C.5/.8. Un dato de camiseta puede vivir en hasta 7 capas. Este mapa es la entrada
obligatoria del `DATA_LAYER_MAPPING_GATE`.

| Capa | Qué contiene | Quién la escribe hoy | Riesgo si se ignora |
|------|--------------|----------------------|---------------------|
| Woo REST root | `name`, `status`, `regular_price`, `manage_stock`, `stock_quantity`, `categories`, `images`, `attributes` | bridge | Producto no publicable / sin categoría |
| `wp_postmeta` (valor ACF) | `liga`, `equipo`, `ano_temporada`, `talla`, `condicion`, `jugador`, medidas, defectos, descripción | bridge `meta_data` | Campo vacío en frontend |
| ACF companion key | `_liga`, `_equipo`, … (`field_xxx`) | bridge `meta_data` | "Detalles del Producto" vacío en WP Admin |
| ACF Taxonomy (`save_terms`/`load_terms`) | Liga/Equipo/Jugador/Año como term IDs | requiere relación real | Term no aparece seleccionado |
| `wp_term_relationships` | vínculo real producto↔término | Woo vía `attributes[]` | ACF no muestra selección; filtros rotos |
| Woo categories | `categories: [{id}]` | bridge | Cae en "Sin categorizar" |
| Rank Math meta | primary category, title, description, focus kw | parcial (solo primary cat) | SEO incompleto |

> **Implicación de diseño:** `meta_data` ACF **no basta**. Para ACF Taxonomy con `save_terms` activo,
> el producto necesita la relación real en `wp_term_relationships`, que Woo crea cuando recibe
> `attributes[]` con `options` = nombre/slug del término. Por eso el bridge v2.1 envía **ambos**.

---

## 3. Decisiones arquitectónicas TARGET

### DEC-A1 — Fuente de verdad partida (data vs identity)

| Dominio | Fuente de verdad | Razón |
|---------|------------------|-------|
| **Datos de producto** (contenido, precio, medidas, estado, SEO) | **Supabase / Studio** | DEC-13: los datos nacen en Studio; Woo es destino |
| **Identidad de términos** (term IDs, slugs de `pa_*` + category IDs) | **WooCommerce** | ACF Taxonomy, Filtro Camisetas Pro y los archives indexan por term ID de WC. Quien asigna el ID es WC, no Studio |

No hay contradicción con "Supabase = fuente de verdad" del data model: Supabase es maestro del
**contenido**; WC es maestro de la **identidad de la taxonomía**. Studio reconcilia ambos vía caché.

### DEC-A2 — Caché de taxonomías en Supabase, no lectura runtime a Woo

**Decisión:** Studio mantiene una **caché sincronizada** del vocabulario WC en Supabase. Lee de la
caché en runtime (formulario, bridge). **No** hace GET a Woo en cada render.

**Por qué caché y no runtime:**
- Latencia y acoplamiento: un GET a Woo por render bloquea la UI y ata Studio a la disponibilidad de
  la tienda.
- Volumen acotado: el vocabulario es pequeño y de baja rotación (21 equipos, 18 temporadas, ~6 ligas,
  N jugadores, 5 categorías). Cachearlo es trivial y correcto.
- Reescritura limpia: las opciones del formulario salen de la caché, no de un `.ts` hardcodeado.

**Por qué no solo-local (sin Woo como maestro):** porque el term ID lo asigna WC y lo consumen ACF +
Filtro Camisetas Pro + archives. Inventar IDs en Studio rompería la tienda.

**Patrón de sincronización (read + write-through):**
```
                       ┌──────────────────────────┐
   GET terms/cats ────►│  Supabase: wc_terms /    │◄──── runtime read (form, bridge)
   (sync job / acción) │  wc_categories (caché)   │
                       └────────────┬─────────────┘
                                    │ write-through tras crear término
   POST .../terms ◄─────────────────┘  (Studio crea término en WC, guarda el ID devuelto)
```

### DEC-A3 — Reemplazo de `wc-terms-mvp.ts`

- `studio/lib/wc-terms-mvp.ts` queda **DEPRECATED** (marca explícita en el archivo).
- Las **opciones de dominio** (label, value, titleLabel, aliases, helpText) que hoy viven en ese
  archivo son **conocimiento de presentación legítimo** y se conservan; lo que se elimina es el
  **mapeo manual `label → termId`**, que pasa a resolverse contra la caché por slug/label/alias.
- Migración: la caché se siembra desde Woo (S023A); las opciones de presentación se mantienen y se
  enlazan a la caché por `slug`/`aliases`. El `.ts` no se borra de golpe: se vacía de term IDs y se
  marca como capa de presentación, o se sustituye por datos servidos desde la caché. Decisión fina en
  S023B según lo que minimice duplicación (ver `STUDIO_PRODUCT_FORM_MODELING_PLAYBOOK.md`
  `DomainOption`).

### DEC-A4 — Creación controlada de términos desde Studio

Cuando Pablo introduce un equipo/temporada/jugador/liga que no está en la caché:
1. Studio busca en caché por label/slug/alias (dedupe).
2. Si no existe, ofrece **crear el término** vía `POST /wc/v3/products/attributes/{id}/terms`.
3. Con el ID devuelto, escribe en la caché (write-through).
4. El item queda con term ID resuelto sin tocar WP Admin ni el `.ts`.

Guardas: una creación por acción explícita; nunca creación implícita/batch silenciosa; el nombre se
normaliza y se chequea contra duplicados antes del POST.

### DEC-A5 — Categorías: selección, no creación

Las categorías son un set curatorial pequeño y fijo (Leyendas 149, Nuevo 22, Otros Clubs 147,
Selecciones 148, Sin categorizar 17). Studio **selecciona** de la caché; **no** crea categorías nuevas
de forma automática. Heurística por defecto (liga vacía → Selecciones; con liga → Otros Clubs) +
**override manual** para Leyendas/Nuevo. `rank_math_primary_product_cat` sigue a la categoría elegida.

### DEC-A6 — Imágenes: pipeline propio, validación visual obligatoria

Local → Supabase Storage (Opción C del data model) → upload a WP Media Library
(`POST /wp/v2/media`) → asignación al producto (`images: [{id}]`). Fase aislada (S025). Validación
visual obligatoria (RULE-02): no se cierra por typecheck.

### DEC-A7 — Stock operativo

Para uniques vintage el modelo es simple: 1 unidad. El bridge ya pone `manage_stock:true`/`qty:1`.
Lo operativo (S026) es el **ciclo de estados** y la **prevención de doble venta web/Vinted**: tras
venta, sincronizar stock→0 y estado; reservas; tracking Vinted manual. No es gestión de almacén.

### DEC-A8 — Frontera WP Admin ↔ Studio

| Responsabilidad | Hoy | TARGET |
|-----------------|-----|--------|
| Autoría de datos de producto | Studio | Studio |
| Contenido SEO (título/desc/precio) | Studio (manual SEO) | Studio |
| Selección de términos | Studio (mapa manual) | **Studio (caché)** |
| Creación de términos | **WP Admin manual** | **Studio (S023C)** |
| Selección de categoría | bridge auto + WP Admin manual | **Studio (S023E)** |
| Jugador | no resuelto | **Studio (S023D)** |
| Imágenes | WP Admin manual | **Studio (S025)** |
| Config del grupo ACF (definición de campos) | WP Admin | **WP Admin (permanece)** |
| Config WooCommerce / taxonomías / archives | WP Admin | **WP Admin (permanece)** |
| Storefront / tema | WP/Elementor (A0 congelado) | **WP (permanece)** |
| **Publicar (draft→publish)** | **WP Admin manual** | **WP Admin manual hasta S030** |

### DEC-A9 — Publicar: cuándo desde Studio vs WP Admin

- **MVP → S029:** publicar es **manual en WP Admin**. Studio crea el borrador; Pablo revisa y publica.
  Es DEC-9 + DRAFT_ONLY y no se toca.
- **S030:** se introduce **publish-from-Studio controlado**, detrás de un **preflight de
  publicabilidad** (checklist todo-verde: términos resueltos, categoría, imágenes, SEO, stock) +
  **confirmación explícita de Pablo** + **rollback manual documentado**. Incluso entonces, el default
  es draft; publicar es una acción explícita y guardada, nunca automática.

---

## 4. Modelo de datos TARGET — extensión de caché

Tablas nuevas en Supabase (capa genérica reutilizable por lafabrica; aplicar manualmente por Pablo
en SQL Editor, patrón S020D). **Diseño, no implementación** — el SQL canónico se produce en S023A.

```
wc_taxonomies        — catálogo de atributos WC (pa_liga=5, pa_equipo=4, pa_ano=7, pa_jugador=6)
  id (attribute_id WC), slug, name, label_studio

wc_terms             — caché de términos por taxonomía
  id (term_id WC), taxonomy_id → wc_taxonomies, name, slug, count,
  synced_at, source ('wc_sync' | 'studio_created')

wc_categories        — caché de categorías de producto
  id (category_id WC), name, slug, parent, count, is_curatorial (bool), synced_at
```

Principios:
- `id` = el ID real de WC (no UUID) — la caché refleja identidad de WC.
- `source` distingue lo sincronizado de lo creado por Studio (auditoría DEC-A4).
- `synced_at` permite detectar caché obsoleta y drift (S029).
- RLS: lectura para `authenticated`; estas tablas son vocabulario compartido del workspace, no datos
  por-owner (revisar en `STUDIO_RLS_POLICY_PLAN.md` al implementar S023A).
- Sin `ALTER TABLE` a tablas existentes en S023A — solo `CREATE TABLE` aditivo.

El item (`football_shirt_details`) sigue guardando `equipo`/`temporada`/etc. como term ID resuelto +
`*_display` cache. La novedad: el term ID se resuelve contra `wc_terms`, no contra el `.ts`.

---

## 5. Arquitectura de componentes TARGET

```
┌─────────────────────────── CATENACCIO STUDIO (Next.js / Vercel) ───────────────────────────┐
│                                                                                            │
│  FORM / EDIT ────────────► term options desde caché (wc_terms / wc_categories)             │
│      │                         ▲                                                           │
│      │ select-or-create        │ read                                                      │
│      ▼                         │                                                           │
│  TERM MANAGER (S023C/D) ──► POST /wc/v3/.../terms ──► write-through a wc_terms             │
│                                                                                           │
│  TAXONOMY SYNC (S023A) ──► GET /wc/v3/products/attributes/{id}/terms + /categories ──►caché│
│                                                                                           │
│  BRIDGE (existente, evoluciona) ──► payload (root + meta_data ACF + attributes[]) ──► Woo  │
│      │  term IDs y labels resueltos desde caché (ya no desde wc-terms-mvp.ts)              │
│      ▼                                                                                     │
│  PREFLIGHT (S024/S030) ──► checklist de publicabilidad antes de crear/publicar            │
│                                                                                           │
│  IMAGE PIPELINE (S025) ──► Supabase Storage ──► POST /wp/v2/media ──► images:[{id}]        │
│                                                                                           │
│  DRIFT MONITOR (S029) ──► GET producto Woo ──► compara con Studio ──► reporta diferencias  │
└────────────────────────────────────────────────────────────────────────────────────────────┘
                                   │ DRAFT_ONLY (DEC-9)                    ▲ publish manual (→S030)
                                   ▼                                       │
┌────────────────────────── WOOCOMMERCE / WORDPRESS (producción) ───────────────────────────┐
│  Productos (draft→publish manual) · ACF Taxonomy + companion keys · Filtro Camisetas Pro    │
│  Rank Math · Media Library · Storefront (tema; A0 CONGELADO) · WC categories/attributes     │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Evaluación del estado de Studio como suite (semáforo)

| Subsistema | Estado | Dónde está hoy | Fase TARGET |
|------------|--------|----------------|-------------|
| Producto / formulario base | 🟢 OK | `ItemForm.tsx`, edición, detalle (PABLO_LOCAL_FORM_OK) | mantener |
| SEO manual flow | 🟢 OK | `manual-seo-prompt.ts` v2, `saveManualSeoContent` | S027 (Rank Math completo) |
| Woo draft bridge | 🟢 OK (validado) | `bridge.ts` v2.1 | evoluciona con caché |
| ACF meta (companion keys) | 🟢 OK | `ACF_KEYS` en `bridge.ts` | mantener; re-validar tras cambios |
| ACF taxonomy (relaciones reales) | 🟡 Parcial | `attributes[]` v2.1 (Liga/Equipo/Año) | S023 (caché + jugador) |
| Categorías | 🟡 Parcial | auto Selecciones/Otros Clubs | S023E (selector) |
| Inventario / stock unitario | 🟢 OK | `manage_stock:true`/`qty:1` | S026 (operativo) |
| Imágenes | 🔴 Ausente | manual WP Admin | S025 |
| Rank Math SEO | 🟡 Mínimo | solo `primary_product_cat` | S027 |
| Slugs | 🟡 Auto-Woo | Woo genera al publicar | S027/S028 |
| Landings (equipo/liga/año/jugador) | 🔴 No | archives WP (A0 congelado) | S028 |
| Stock operativo (post-venta, Vinted) | 🔴 No | manual | S026 |
| Publicación controlada | 🔴 No (manual WP) | DRAFT_ONLY | S030 |
| **Fuente viva de términos** | 🔴 **Ausente** | `wc-terms-mvp.ts` estático | **S023A/B/C** |
| Jugador | 🔴 No resuelto | — | S023D |

🟢 listo · 🟡 parcial · 🔴 ausente. El cuello de botella que bloquea la operación real es la fila en
negrita: sin vocabulario vivo, casi ninguna camiseta real se puede publicar sin trabajo manual.

---

## 7. Productos existentes — qué corregir vs ignorar

| Producto | Estado | Acción |
|----------|--------|--------|
| 1853 | dummy `[STUDIO TEST]` | eliminado manualmente (S020B) — N/A |
| 1854 | borrador, payload v1.0 incompleto, datos PSV/2007-09 posiblemente reales | **NO publicar**; candidato a batch-PATCH en S024 si los datos son veraces, o descartar |
| 1856 | borrador, datos de prueba | **NO publicar** si contiene datos falsos; descartar o re-generar |
| 1731 (Rivaldo) | publicado, **referencia** | **NO tocar** — es el patrón de oro para `PRODUCT_REFERENCE_DIFF_GATE` |

Regla dura (de `STUDIO_SUITE_BUILD_SYSTEM_LESSONS.md §6`): **no publicar productos de prueba con datos
falsos de equipo/temporada** usados solo por la limitación de IDs.

---

## 8. Fixture canónica para validar fases

Toda fase que toque payload/publicabilidad valida con **una camiseta completa real** (no parcial),
satisfaciendo `FULL_FIXTURE_TEST_GATE`:

```
Equipo: (uno con term ID real en WC, p.ej. FC Barcelona=170)
Liga:   (coherente con el equipo, p.ej. LaLiga=72)  ó  "" si selección nacional
Año:    (uno real, p.ej. 2000-01=172)
Jugador:(opcional; para S023D usar Rivaldo)
Talla / Condición / Medidas (ancho_cm, largo_cm) / Defectos
Categoría: (la que corresponda; Leyendas si curatorial)
Precio web · Contenido SEO aprobado · 1+ imagen (desde S025)
```

Producto **1731 (Rivaldo)** es la referencia publicada contra la que se hace el diff.

---

## 9. Riesgos de la arquitectura

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Caché obsoleta vs WC (drift de términos) | Media | Medio | `synced_at` + re-sync on-demand (S023A) + drift monitor (S029) |
| Creación de término duplicado en WC | Media | Medio | dedupe por slug/label antes de POST (S023C); `source` en caché |
| ACF field keys cambian si Pablo reconfigura ACF | Muy baja | Alto | keys estáticas documentadas; re-validar con `ACF_CONFIG_GATE` |
| Volver a microparches al evolucionar el bridge | Media | Alto | `NO_MICROPATCH_LOOP_GATE` + 1 sola iteración por bloque |
| Bundling de fases (taxonomía + imágenes + stock juntas) | Media | Alto | una tarea por sesión (roadmap); scope cerrado |
| Escribir a WC en una fase pensada read-only | Baja | Alto | guardrails por sesión; S023A es read-only-WC duro |
| Publicar accidentalmente | Baja | Alto | DRAFT_ONLY hardcoded; publish manual hasta S030 |

---

## 10. Qué NO se decide aquí (límites de esta arquitectura)

- No se decide migrar de ACF meta a WC `attributes[]` nativos: Catenaccio sigue con ACF meta +
  `attributes[]` complementario. Revisión futura, no ahora.
- No se decide el storefront Next.js público (sigue diferido; tienda = WooCommerce).
- No se descongela A0 (sigue FROZEN, DEC-13).
- No se diseña el importador de `STOCK.xlsx` (S025+ cuando Pablo comparta columnas reales).
- No se construye marketplace (NORTH_STAR / DEFER, PEND-2).

---

## 11. Veredicto

`READY_FOR_S023A_IMPLEMENTATION`

La arquitectura está cerrada: fuente de verdad partida (DEC-A1), caché de taxonomías (DEC-A2),
reemplazo de `wc-terms-mvp.ts` (DEC-A3), creación controlada (DEC-A4), categorías por selección
(DEC-A5), frontera WP/Studio (DEC-A8) y publicación controlada diferida a S030 (DEC-A9). El primer
bloque implementable —S023A, sync read-only del vocabulario WC a la caché— es el de mayor valor y
menor riesgo y desbloquea todo lo demás. Detalle en `STUDIO_ROADMAP_S023_S030.md`; gates en
`STUDIO_SESSION_GATES.md`.

---

*Sesión S023-STRATEGY — 2026-06-29 — Claude Code (Opus 4.8). STRATEGIC_REQUIRED / DOCS_ONLY / NO_CODE.*
