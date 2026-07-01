# STUDIO_POST_S024_ROADMAP_REORDER — Operaciones antes de imágenes

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-01
**Sesión:** S025-STRATEGY — ROADMAP_REORDER_OPERATIONS_CONTROL (Opus 4.8)
**Modo:** STRATEGIC_REQUIRED / NO_CODE / NO_WC_WRITE / NO_SUPABASE_WRITE / NO_DEPLOY
**Veredicto:** `REORDER_TO_S025A_OPERATIONS_CONTROL`
**Hermanos:** `STUDIO_ROADMAP_S023_S030.md`, `STUDIO_TARGET_ARCHITECTURE.md`, `STUDIO_SESSION_GATES.md`

---

## 0. Decisión

**Imágenes NO ahora.** Se inserta una fase **S025 — Operaciones de Studio** antes de imágenes.
Motivo confirmado en código: Studio **crea** items y borradores Woo, pero no controla su ciclo de
vida. Superficie actual (verificada): `createInventoryItem`, `updateInventoryItem` (solo local),
`createWcDraft` (create-only, idempotente por `wc_product_id IS NULL`, DRAFT_ONLY). **No existe**
archivar/borrar, transición de estados, update/PUT a Woo, ni lectura de estado real de Woo (grep
limpio en `actions.ts` + `lib/wc/`). Hay borradores de prueba acumulados (1854/1856/1861) sin
limpieza desde Studio. Añadir imágenes sobre esto multiplica borradores que no se pueden editar,
limpiar ni resincronizar. Además, el flujo móvil que quiere Pablo exige **deploy** (Studio hoy es
local, `STUDIO_VERCEL_DEPLOY_MINIMAL` diferido) → imágenes-en-móvil está detrás de deploy + lifecycle,
no delante.

Alternativas descartadas: `S025_IMAGES_NOW` (compone deuda), `WOO_SYNC_READONLY` (es solo el primer
bloque, no toda la fase), `STRATEGIC_SPLIT` (es un reorden lineal, no re-arquitectura),
`STOP_CURRENT_PLAN` (DEC-13/DRAFT_ONLY/gates siguen válidos).

---

## 1. Roadmap reordenado

| Nuevo | Bloque | Escribe Woo | Riesgo | Agente | Antes era |
|-------|--------|-------------|--------|--------|-----------|
| **S025** | **STUDIO OPERATIONS CONTROL** (fase A–F, DRAFT_ONLY intacto) | ver §2 | ver §2 | ver §2 | *(insertado)* |
| S026 | IMAGE_PIPELINE (UX móvil) | Sí (media) | Medio | Sonnet + Antigravity | S025 |
| S027 | STOCK_OPERATIONS (venta, reservas, doble-venta Vinted) | Sí (PUT stock) | Medio | Sonnet | S026 |
| S028 | RANK_MATH_SEO_METADATA | Sí (meta) | Bajo-Medio | Sonnet | S027 |
| S029 | LANDING_ARCHITECTURE (consume auditoría S025E) | WP-side/docs | Medio | Opus→Sonnet/Antigravity | S028 |
| S030 | DRIFT_DETECTION_FULL (base read-only ya en S025A) | No (GET) | Bajo | Codex | S029 |
| S031 | CONTROLLED_PUBLISH_FLOW (habilita publish móvil) | **Sí (publish)** | Alto | Opus→Sonnet | S030 |
| INFRA | STUDIO_VERCEL_DEPLOY_MINIMAL (prerequisito móvil) | No | Medio | infra | *(sin cambio)* |

Renombres/movimientos: todos los bloques de feature se desplazan **+1** (S025→S026 … S030→S031);
la fase S025 pasa a ser Operaciones. La **parte read-only del antiguo S029 (drift)** se adelanta a
S025A. BACKLOG LATER `STUDIO_ARCHIVE_OR_DELETE_ITEM_ACTION` se promueve a **S025B**.

---

## 2. Fase S025 — descomposición por clase de riesgo (read/local → Woo-write)

| Bloque | Nombre | Woo | Riesgo | Agente | Tarea de Pablo que resuelve |
|--------|--------|-----|--------|--------|------------------------------|
| **S025A** | INVENTORY_CONSOLE_AND_WOO_STATE_READONLY | GET | Bajo | **Codex** | ver drafts/subidos, estado real (sync read) |
| S025B | LOCAL_LIFECYCLE_AND_SOFT_ARCHIVE | No (Supabase) | Bajo-Med | Sonnet | archivar/descartar items, estado "dejar preparado", limpiar lado Studio |
| S025C | WOO_DRAFT_CLEANUP_SHADOW_FIRST | DELETE→trash (reversible) | **Alto/destructivo** | Sonnet + gate Opus | limpiar borradores de prueba, gestionar drafts Woo |
| S025D | EDIT_AND_RESYNC_TO_WOO | PUT (update) | Med-Alto | Sonnet ASK→CODE | editar productos ya subidos |
| S025E | FIELD_ATTRIBUTE_AUDIT | No (docs) | Bajo | Opus→Sonnet | "definir todo como atributos y ver cuáles sirven", filtros/landings prep |
| S025F | VINTED_EXPORT_PROMPT | No (local) | Bajo | Sonnet | título/descripción/prompt para Vinted (solo copy; stock/doble-venta = S027) |

Orden obligatorio: **A → B → C → D**; **E** y **F** son paralelizables (no dependen de C/D). Una
tarea por sesión; cada bloque cierra con test real de Pablo. **DRAFT_ONLY y publish manual intactos
hasta S031.**

---

## 3. Distinción crítica (evita accidentes)

- **Borrar item Studio ≠ borrar producto Woo.** S025B = soft-archive local (`status='archivada'`,
  nunca hard delete). S025C = trash del producto Woo (`DELETE ?force=false`, reversible), read-only
  primero (listar candidatos) → confirmar por item → nunca `force=true`, nunca sobre 1731 (referencia
  publicada), nunca sobre productos con datos reales sin confirmación.
- **Edit-after-draft está roto por diseño hoy:** editar el item tras crear el borrador **no** llega a
  Woo (idempotencia create-only). S025D rediseña idempotencia a create|update sobre `wc_product_id`.
- **Flujo móvil (`STUDIO_MOBILE_PHOTO_FINISH_FLOW`)** = S025B (estado "preparado") + DEPLOY + S026
  (imágenes con UX móvil) + S031 (publish). Es un capstone multi-bloque, no una razón para adelantar
  imágenes.

---

## 4. Riesgos por bloque

| Bloque | Riesgo principal | Mitigación |
|--------|------------------|------------|
| S025A | `wc_status` local obsoleto vs Woo real | reconciliación read-only GET; no escribe |
| S025B | archivar item cuyo Woo está publicado | mostrar estado Woo real (S025A) antes de permitir archivar |
| S025C | borrado destructivo en producción | SHADOW_FIRST, trash reversible, confirm por item, allow-list de IDs de prueba, veto sobre 1731 |
| S025D | update pisa datos buenos en Woo | PRODUCT_REFERENCE_DIFF, PUT sobre el mismo id, diff antes de escribir |
| S025E | audit deriva en re-modelado ACF | solo docs; decisión a Opus; no toca payload |
| S025F | claims de autenticidad falsos en copy | reusar reglas SEO (`STUDIO_SEO_CONTENT_RULES.md`) |

---

## 5. Primer bloque implementable — S025A

**Objetivo único:** una consola de inventario **read-only** que muestre el estado real de cada item,
incluida una lectura viva (GET) del producto Woo cuando exista `wc_product_id`. Cero escrituras.
Da la verdad de terreno sobre la que se apoyan S025B/C/D.

Detalle, gates, fixture, test de Pablo, guardrails y prompt completo: ver el prompt de sesión emitido
en el cierre de S025-STRATEGY (respuesta del agente) y esta fila §2. Agente **Codex**; gate
`DATA_LAYER_MAPPING`; sin Woo-write, sin borrar, sin cambiar estado (eso es S025B+).

---

## 6. Veredicto

`REORDER_TO_S025A_OPERATIONS_CONTROL`. Confirma la hipótesis de Pablo. Imágenes se difieren a S026.
Abrir **S025A** (Codex, read-only) como siguiente sesión; no abrir S025B–F ni S026 hasta cerrar cada
bloque con el test real de Pablo.

---

*Sesión S025-STRATEGY — 2026-07-01 — Claude Code (Opus 4.8). STRATEGIC_REQUIRED / NO_CODE.*
