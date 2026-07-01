# STUDIO_COMPLETENESS_PREFLIGHT_RESULT — S024

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-01
**Sesión:** S024 — COMPLETENESS / PREFLIGHT
**Modo:** ASK→CODE / LOCAL_CODE / NO_WC_WRITE_BY_AGENT / NO_PRODUCT_WRITE / NO_PUBLISH / NO_DEPLOY
**Agente:** Claude Code (Opus 4.8)
**Veredicto:** `APPROVE_READY_FOR_S025`

---

## Objetivo

Antes de crear un borrador Woo, Studio indica claramente si la camiseta está lista o qué falta:
checklist agrupado por bloques, estado global, y botón «Crear borrador WooCommerce» protegido.

## Qué se implementó

1. **Helper puro** `studio/lib/preflight/product-preflight.ts` — `evaluateProductPreflight(input)`.
   Sin Supabase, sin Woo, sin red, sin escrituras. Refleja fielmente las reglas de bloqueo del
   bridge (`createWcDraftForItem`) + añade avisos de completitud del listing (gaps del audit).
   Devuelve: `status` global, `groups[]` (6 bloques), cada check con `id/label/status/message/fixHint`,
   `counts`, `canCreateDraft`, `alreadyDrafted`.
2. **Panel** `studio/components/ProductPreflightPanel.tsx` (cliente) — banner de estado con contadores,
   bloques colapsables (los que tienen blocker/warning abiertos; los todo-PASS colapsados), link
   «Editar item» cuando hay accionables. Se renderiza siempre en `/inventory/[id]`.
3. **Protección del botón** en `WcDraftPanel.tsx` — recibe `preflightStatus` + `blockerMessages`:
   BLOCKED → botón deshabilitado + lista de bloqueos; WARNING → habilitado con aviso; READY → normal.
4. **CSS** en `styles/globals.css` — bloque `.preflight-*` reutilizando la paleta existente.

## Estado global (3 estados)

- `READY_TO_CREATE_DRAFT` — 0 bloqueos, 0 avisos.
- `WARNING_REVIEW_RECOMMENDED` — 0 bloqueos, ≥1 aviso (crea, pero revisar).
- `BLOCKED_MISSING_REQUIRED_FIELDS` — ≥1 bloqueo (no se puede crear).

## Bloques y severidad

| Bloque | BLOCKER | WARNING |
|--------|---------|---------|
| Identificación | referencia, detalles de camiseta | tipo sin definir |
| Taxonomías Woo | equipo/año sin term ID; liga/jugador no numérico; jugador con ID sin display* | equipo/año/liga con ID sin display (bridge resuelve desde cache) |
| Categoría Woo | — | nudge «¿Leyendas?» si hay jugador y categoría automática |
| SEO y precio | SEO no aprobado; título <5; descripción <20; precio ≤0 | — |
| Estado físico y medidas | talla vacía; condición vacía | medidas ancho/largo ausentes |
| Publicabilidad Woo | — (idempotencia/draft/inventario informativos) | — |

\* El bridge no tiene fallback de cache para jugador → sin display es BLOCKER (fiel al bridge).

## Decisión de diseño clave

La preflight **espeja las reglas del bridge** (fuente de verdad de creabilidad) para ser predictor
fiel, pero es **advisory**: el bridge sigue siendo la barrera dura server-side. Se implementó como
función pura sobre datos ya cargados en la página (item + `football_shirt_details` + `ai_suggestions`
aprobada + precio) → cero llamadas nuevas, cero remoto vivo, cero Woo.

## Quality pass

- **Scope:** 2 archivos nuevos + 3 modificados (`page.tsx`, `WcDraftPanel.tsx`, `globals.css`).
- **Sin SQL, sin schema, sin bridge, sin client Woo write, sin actions.** `bridge.ts` intacto → DRAFT_ONLY intacto.
- **Regresión:** S023B/C/D/E, S024A taxonomy UX y categoría intactos (no se tocaron sus módulos).
- **Datos:** no inventa términos, no llama Woo, no depende de estado remoto vivo; usa datos locales/cacheados.

## Validaciones

typecheck PASS · build PASS (8/8 rutas, `/inventory/[id]` 5.18 kB) · lint PASS (0 issues) ·
`git diff --check` PASS · secret scan CLEAN.

## Validacion manual de Pablo

Pablo confirma `PABLO_PREFLIGHT_OK`: caso incompleto validado con blockers correctos; SEO/precio bloquea la creacion de borrador y medidas queda como warning, no blocker.
Caso listo/ya con borrador validado: READY, 0 bloqueos, 0 avisos; la nota de idempotencia aparece visible cuando ya existe borrador Woo.
Borrador existente ID 1861 visible. No se publico producto y no se reporta regresion S023B/C/D/E/S024A.

## Confirmaciones

`wc_api_called_by_agent=false` · `wc_post_products_called_by_agent=false` ·
`products_modified_by_agent=false` · `published=false` · `supabase_remote_modified_by_agent=false` ·
`env_local_modified=false` · `sql_modified=false`.

## Test real de Pablo

1. `cd studio && npm run dev`.
2. Abrir una camiseta incompleta → comprobar blockers (SEO, precio, talla…) y botón deshabilitado.
3. Completar campos → los blockers pasan a pass/warning; el estado global sube.
4. Abrir una camiseta lista → preflight muestra READY (o solo warnings) y el botón se habilita.
5. Crear **un único** borrador Woo si la preflight lo permite.
6. WP Admin: confirmar Borrador, taxonomías/categoría/SEO/precio OK. No publicar.

## Siguiente paso

S025 (imagenes) queda como siguiente bloque recomendado, no abierto.
