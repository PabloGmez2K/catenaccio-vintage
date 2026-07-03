# STUDIO_STOCK_MANAGER_FOUNDATION_RESULT — Catenaccio Studio

Primer slice del nuevo MVP real: Studio como **gestor operativo de stock**, no solo creador de borradores Woo.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-07-03
**Sesión:** STOCK_MANAGER_FOUNDATION_SLICE_WITH_FABLE
**Agente:** Claude Code (Fable 5)
**Modo:** HIGH_AUTONOMY_PRODUCT_BUILD / CODE_ALLOWED / LOCAL_ONLY / READONLY_WOO / NO_DEPLOY / NO_PUSH
**Estado:** IMPLEMENTADO LOCAL — pendiente `PABLO_STOCK_MANAGER_FOUNDATION_OK` (prueba visual con datos reales)

---

## 1. Redefinición del MVP (contexto)

Pablo redefine el MVP: no es "subir borradores a la web", es **gestor de stock y estado de las camisetas** — subir a la web, editarlas, marcarlas vendidas, ver stock web, ver stock Vinted, saber por cuánto se vendió cada una y llevar control. Lo que hoy hace entre Vinted, un Excel y WooCommerce, junto en Studio.

Este bloque entrega la **foundation visible**: catálogo Woo read-only vivo, linking Studio ↔ Woo, venta local y tracking manual de Vinted. No es el ERP completo.

## 2. Qué se construyó

### A. Catálogo web read-only — nueva ruta `/inventory/woo`

- **Lectura viva GET-only** de `GET /wp-json/wc/v3/products` con `status=any` (paginado, `per_page=100`, `_fields` para payload mínimo) + segunda llamada best-effort con `status=trash` (si el rol no puede listar papelera, la pantalla lo avisa y sigue).
- Por producto: nombre, imagen principal (miniatura), estado real (publicado/borrador/pendiente/privado/papelera), stock status (+cantidad si `manage_stock`), precio, fecha de alta, enlace frontend (solo publicados) y enlace WP Admin.
- **Resumen operativo** (tiles de conteo): camisetas en Studio, productos en la web, publicados, borradores, agotados, sin vincular. Tiles clicables → filtro correspondiente.
- **"Revisar primero"**: cola de atención ordenada — errores de sync, huérfanos Studio→Woo, publicados agotados (candidatos a marcar vendida), productos web sin ficha Studio, borradores pendientes de publicar.
- **Filtros server-side** vía `?filter=` (mismo patrón que `/inventory`): todos / publicados / borradores / agotados / sin vincular / vinculados / papelera.
- **Estados**: `loading.tsx` propio (el GET externo tarda), error operativo con reintento si Woo no responde (el inventario Studio sigue funcionando), aviso parcial si falla la lectura de Studio o de la papelera.

**Justificación de ruta:** hermana de `/inventory` en vez de extenderla, porque esta pantalla depende de un GET externo vivo en cada render. Separarla mantiene el work queue rápido y local (base aprobada intacta, delta y no rediseño) y da al catálogo sus propios estados de carga/error/filtrado. Nav nueva "Catálogo web" en el header.

### B. Linking Studio ↔ Woo

- Cada producto Woo muestra su ficha Studio vinculada (link) o el badge **"Sin vincular"**.
- Sección **"Camisetas de Studio sin producto en la web"** (huérfanos): fichas cuyo `wc_product_id` no aparece en el catálogo (borrado, papelera inaccesible u otro entorno), con enlace a la ficha.
- Derivaciones puras en `studio/lib/inventory/stock-overview.ts` (sin I/O, mismo patrón que `operational-view.ts`): linking por `wc_product_id`, conteos y cola de revisión testables.

### C. Venta local — panel "Venta" en la ficha + acción "Vender"

- `markItemSold`: canal (web/vinted/otro), precio vendido, fecha (default hoy), notas opcionales → `status='vendida'` + columnas `canal_venta`/`precio_vendido`/`fecha_venta` + evento `sold` en `item_lifecycle_events` (las **notas de venta viven en el audit trail** — no hay columna dedicada y el evento es su sitio natural; decisión sin SQL).
- Vendida → el panel muestra canal, precio, fecha, **margen real** (precio_vendido − coste, verde/rojo), notas, y recuerda que la web no se toca desde ahí ("actualiza WP Admin si el producto sigue visible").
- **Editar venta** (evento `sale_updated`) y **Deshacer venta** (evento `sale_undone`, recupera el estado previo del audit trail como el restore de archivo, limpia los campos de venta).
- Si el canal es `vinted`, `vinted_status` pasa a `vendida_vinted` (coherencia local entre bloques; deshacer NO lo revierte — se corrige a mano en el panel Vinted, documentado como limitación).
- Row action **"Vender"** en `/inventory` → ancla `#venta` de la ficha (la venta necesita precio/canal, no cabe en un confirm de fila).
- Confirm antes de marcar, loading state, error visible. Archivada → hay que restaurar antes de vender.

### D. Vinted manual — panel "Vinted" en la ficha

- Estado (No aplica / Pendiente de subir / Publicada / Vendida en Vinted / Retirada), precio, fecha de publicación (se precarga hoy al pasar a Publicada), URL del anuncio (validada http/https, con "Ver anuncio ↗") y notas.
- Escribe las columnas `vinted_*` que existían desde S019/S020D sin uso desde código + evento `vinted_updated`. **Sin API, sin scraping, sin login**: tracking 100% manual.

### E. Work queue `/inventory` (delta mínimo)

- Nueva columna **Vinted** (badge solo si hay tracking; "—" si no aplica).
- **Margen** ahora es margen real (precio vendido) en vendidas y margen esperado (precio web) en el resto, con `title` que lo aclara. La columna "Precio web" queda pura (no se mezcla el precio de venta bajo esa etiqueta).
- Select ampliado con `canal_venta, precio_vendido, fecha_venta, vinted_status`.

## 3. Qué NO hace (a propósito)

- **Cero writes a Woo**: no POST/PUT/PATCH/DELETE, no borradores nuevos, no papelera, no publicar, no stock. Marcar vendida NO reduce stock web ni cambia estado Woo — recordatorio operativo en el panel.
- No hay cache Supabase del catálogo Woo (GET vivo en cada render; con ~28 productos es 1–2 requests). Cache = decisión futura si el catálogo crece.
- No hay drift comparado campo a campo (título/precio Studio vs Woo) — eso sigue siendo S030.
- No se tocaron `bridge.ts`, `client.ts` (create), `actions.ts` ni la idempotencia DRAFT_ONLY.
- Sin dependencias nuevas, sin tokens globales nuevos, sin SQL.

## 4. SQL / Supabase

**SQL creado: NO — no hace falta.** Hallazgo clave: el schema aplicado en S020D (`STUDIO_SUPABASE_SCHEMA_MVP.sql`) ya incluye TODAS las columnas de venta y Vinted (`canal_venta`, `precio_vendido`, `fecha_venta`, `vinted_status/url/price/published_at/notes`, `precio_publicado_vinted`) y los enums `sale_channel`/`vinted_status`. Estaban diseñadas desde S019 y nunca llegaron a `types.ts` ni a la UI. Este bloque solo las expone. **Pablo no tiene que aplicar nada antes de probar.**

Nota de modelo: existen `vinted_price` y `precio_publicado_vinted` (redundantes); el panel usa `vinted_price` (bloque Vinted). Unificar = decisión futura de modelo, no de este slice.

## 5. Archivos

**Nuevos:**
| Archivo | Qué es |
|---|---|
| `studio/lib/wc/product-catalog.ts` | GET-only Woo products (paginado, `_fields`, trash best-effort, credenciales saneadas en errores) |
| `studio/lib/inventory/stock-overview.ts` | Derivaciones puras: linking, conteos, filtros, "revisar primero" |
| `studio/app/inventory/woo/page.tsx` | Pantalla catálogo web (resumen + revisar primero + filtros + tabla + huérfanos) |
| `studio/app/inventory/woo/loading.tsx` | Estado de carga del GET externo |
| `studio/components/WooCatalogTable.tsx` | Tabla del catálogo (reusa clases `inventory-table` → densidad desktop + cards móvil gratis) |
| `studio/app/inventory/sales-actions.ts` | Server actions: `markItemSold`, `undoItemSale`, `updateVintedTracking` (Supabase-only, RLS, audit trail) |
| `studio/components/SalePanel.tsx` | Panel Venta en la ficha |
| `studio/components/VintedPanel.tsx` | Panel Vinted en la ficha |

**Modificados:** `types.ts` (+`SaleChannel`, campos venta/Vinted), `operational-view.ts` (+`deriveVintedChannel`), `/inventory/page.tsx` (select), `InventoryTable.tsx` (columna Vinted + margen real), `InventoryRowActions.tsx` (+Vender), `[id]/page.tsx` (paneles + notas de venta del audit trail), `AppShell.tsx` (nav), `globals.css` (sección aditiva).

## 6. Validación

| Check | Resultado |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 issues) |
| `npm run build` | PASS (9 rutas, `/inventory/woo` 667 B) |
| `git diff --check` | PASS |
| Secret scan diff + archivos nuevos | CLEAN |
| Smoke runtime | `/inventory/woo` existe y redirige a `/login` sin auth (middleware `/inventory/:path*` la cubre; sin auth no se ejecuta ningún GET a Woo) |
| Woo writes por el agente | **0** (tampoco GETs: el smoke se hizo sin autenticar) |

## 7. Riesgos y limitaciones

- **Rendimiento**: GET vivo a Woo en cada render de `/inventory/woo` (~1–2 requests con catálogo actual). Si crece >200 productos o la tienda va lenta, considerar cache en tabla Supabase (SQL aditivo futuro) o `revalidate` corto.
- **Papelera**: depende de permisos del rol `shop_manager` para `status=trash`; si falla, la pantalla lo declara (no simula).
- **Imágenes**: miniaturas servidas directas del WP (hotlink `<img>`); sin proxy ni next/image (patrón ya usado en ItemImagesPanel).
- **Deshacer venta con canal vinted** no revierte `vinted_status` (manual, documentado en §2.C).
- **Copy de error del catálogo** incluye el mensaje HTTP saneado (sin credenciales) como línea de detalle — mismo nivel de deuda que `ErrorState`, no lo amplía.

## 8. Qué falta para cerrar Stock Manager MVP

1. **Validación visual de Pablo** de este slice (`PABLO_STOCK_MANAGER_FOUNDATION_OK`): catálogo real, linking correcto, marcar una venta real, tracking Vinted de una camiseta real. Antigravity visual pass opcional (STUDIO_MVP_FEATURE_DONE_GATE).
2. **Métricas de venta**: total vendido/margen por periodo, histórico (hoy solo por camiseta).
3. **Filtro "Vendidas" enriquecido** en `/inventory` (mostrar canal/precio/fecha en la vista filtrada o vista dedicada de ventas).
4. **Drift real campo a campo** (S030) y **PUT/resync** (S025D) — editar en Studio lo ya subido.
5. **Cleanup de borradores de prueba** (S025C, con gate).
6. **Sincronizar venta → web** (bajar stock/estado Woo al marcar vendida) — hoy manual a propósito; sería el primer write nuevo a Woo y requiere su propio bloque con gate.
7. Decisión de modelo: unificar `vinted_price` vs `precio_publicado_vinted`.

---

*Sesión STOCK_MANAGER_FOUNDATION_SLICE_WITH_FABLE — 2026-07-03 — Claude Code (Fable 5).*
