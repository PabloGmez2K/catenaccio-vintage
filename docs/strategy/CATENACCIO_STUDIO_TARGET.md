# CATENACCIO_STUDIO_TARGET — Arquitectura y MVP

Definición de arquitectura objetivo y MVP de Catenaccio Studio, el backoffice propio.

**Proyecto:** Catenaccio Vintage
**Fecha:** 2026-06-27
**Sesión:** 018 — STRATEGIC_ROADMAP_OPUS
**Estado:** TARGET APROBADO POR EL AGENTE — pendiente confirmación de Pablo
**Depende de:** `CATENACCIO_STRATEGIC_ROADMAP.md` (RUTA D), `STOCK_OPERATIONS_MODEL.md` (modelo de datos), `ACCESS_MODEL_NO_SSH.md` (canal API)

> Este documento define **qué es** Studio en su forma objetivo y **qué entra en el MVP**.
> El modelo de datos detallado (campos, estados) ya está en `docs/operations/STOCK_OPERATIONS_MODEL.md` — aquí no se duplica, se referencia.

---

## 1. Qué es Catenaccio Studio

El **sistema operativo del inventario de Pablo**: la herramienta interna donde nace y vive cada camiseta antes y después de publicarse. No es una tienda; es el backoffice que alimenta a la tienda.

Cuatro funciones (de `STOCK_OPERATIONS_MODEL.md §1`):
- **PIM** — fuente de verdad de cada camiseta (datos, fotos, atributos, precio, coste, margen).
- **Gestor de stock y estados** — pipeline de 11 estados que reemplaza el Excel manual.
- **Asistente de publicación** — prepara borradores para web (y orientación para Vinted) con ayuda de Claude.
- **Base futura de marketplace** — `owner_id` desde el día 1; el modelo lo permite, no se construye aún.

**Inversión del maestro de datos:** hoy WooCommerce es el único registro del catálogo. En la arquitectura objetivo, **Supabase es la fuente de verdad del inventario** y WooCommerce pasa a ser un **destino de publicación**. Esto es lo que convierte el trabajo en un sistema propio acumulativo en vez de en parches sobre WordPress.

---

## 2. Arquitectura objetivo

```
            ┌─────────────────────────────────────────────┐
            │           CATENACCIO STUDIO                  │
            │        (app interna, solo Pablo)             │
            │                                              │
   Pablo ─► │  Next.js en Vercel                           │
            │   • Alta de camiseta (form §3)               │
            │   • Vista inventario (tabla, 11 estados)     │
            │   • "Sugerir con Claude" (título/desc/precio)│
            │   • Botón "Crear borrador en WooCommerce"    │
            └───────────────┬──────────────┬───────────────┘
                            │              │
                  (datos/auth/imágenes)    │ (publicación)
                            │              │
                            ▼              ▼
                 ┌──────────────────┐   ┌────────────────────────────┐
                 │    SUPABASE      │   │       WOOCOMMERCE           │
                 │ (fuente verdad)  │   │   (tienda + checkout)       │
                 │ • Postgres (PIM) │   │ • Producto draft vía WC API │
                 │ • Auth (Pablo)   │   │ • WooPayments (pasarela)    │
                 │ • Storage fotos  │   │ • SEO RankMath / dominio    │
                 └──────────────────┘   └────────────────────────────┘
                                                  │
                                                  ▼
                                          Comprador final
                                       (catenacciovintage.com)
```

**Flujo de una camiseta** (resumen de `STOCK_OPERATIONS_MODEL.md §7`):
`Studio crea ficha → fotos → "Sugerir con Claude" → Studio crea borrador en WC vía API → Pablo aprueba/publica en WC → (recordatorio Vinted) → venta → margen`.

### Componentes y responsabilidades

| Componente | Responsabilidad | Decisión |
|-----------|-----------------|----------|
| **Supabase** | Base de datos (PIM), autenticación (solo Pablo en MVP), almacenamiento de imágenes. Fuente de verdad del inventario. | Base de datos **principal**. |
| **Next.js / Vercel** | App interna del Studio: formularios, tabla de inventario, llamadas a Claude y al puente WC. | Frontend **interno YA**. Storefront público **DIFERIDO**. |
| **WooCommerce + WooPayments** | Tienda pública, checkout, pasarela de pago, SEO, dominio. Destino de publicación de Studio. | Se **mantiene**. No es de quita inminente. |
| **Claude (API)** | Asistente: título SEO, descripción, precio sugerido + razonamiento de tasación. | Modelo más capaz disponible para calidad editorial. |
| **Puente Studio→WC** | Crea producto en `status=draft` vía WC REST API (DEC-9, Application Password, DRAFT_ONLY). Mapea atributos a `meta_data`. | Reusa canal ya construido y probado. |

---

## 3. El puente Studio → WooCommerce

El puente es la pieza que evita el big bang: Studio no reemplaza a WooCommerce, lo **alimenta**.

- **Canal:** WC REST API v3 con Application Password del usuario limitado `catenaccio-studio-agent` (rol `shop_manager`). Definido en `ACCESS_MODEL_NO_SSH.md`, probado en Sesiones 007b/008.
- **Modo:** `DRAFT_ONLY` (DEC-9). Studio crea el producto en `status=draft`. **Pablo aprueba y publica** en WC. El agente nunca publica directo.
- **Mapeo crítico (de `API_READONLY_PROBE_RESULT.md`):** los productos usan **ACF meta fields**, no `attributes[]`. Studio escribe en `meta_data`:
  - `liga`, `equipo`, `temporada(año)` → **term IDs** (resueltos vía `GET /wc/v3/products/attributes/{id}/terms`).
  - `talla`, `condicion` → strings directos.
- **Imágenes (MVP):** Opción A — ruta local registrada en Studio, sin upload (`STOCK_OPERATIONS_MODEL.md §4`). Puerta a Opción C (`POST /wp-json/wp/v2/media`) cuando Studio esté en uso real.

**Gate de seguridad antes de la primera escritura real:** `WC_API_WRITE_ACCESS_TEST` — probar `POST /wc/v3/products` con `status=draft` contra **un** producto de prueba antes de operar de verdad. Si toca configuración WooCommerce/email en algún momento → resolver antes PATTERN-08 (gate de email transaccional, ver `LAFABRICA_ADOPTION.md §4`).

---

## 4. MVP — qué entra

El MVP es el **mínimo que le quita fricción a Pablo**, no el sistema completo.

| # | Capacidad | Detalle |
|---|-----------|---------|
| 1 | **Alta de camiseta** | Formulario con los campos de `STOCK_OPERATIONS_MODEL.md §3` (identificación, compra/coste, precio/margen, atributos, estado). |
| 2 | **Almacén de imágenes** | Opción A: ruta local (`carpeta_local`) + `estado_fotos`. Sin upload en MVP. |
| 3 | **Asistente Claude** | "Sugerir con Claude": `titulo_seo` (EN), `descripcion_larga` (ES), `precio_sugerido_claude` + `notas_tasacion`. Pablo revisa siempre. |
| 4 | **Vista de inventario** | Tabla filtrable por estado: `Referencia | Estado | Fotos | Web | Vinted | Coste | Precio | Días en stock`. Reemplaza el Excel. |
| 5 | **Publicar borrador en WC** | Botón que llama al puente §3 y crea el producto `draft`. Cambia estado a `BORRADOR_WEB`. |
| 6 | **Auth** | Login único de Pablo (Supabase Auth). `owner_id` almacenado desde el día 1. |

**Criterio de aceptación del MVP:** Pablo da de alta una camiseta real, pulsa "Sugerir con Claude", pulsa "Crear borrador en WC", y la camiseta aparece como borrador en WooCommerce — todo sin tocar WP Admin para el alta. (PABLO_VISUAL_OK + TEST B real.)

---

## 5. MVP — qué NO entra (reafirmado)

De `STOCK_OPERATIONS_MODEL.md §6`, sin cambios:

- Storefront público en Next.js (DEFER — gate de tracción).
- Marketplace / multi-usuario (NORTH_STAR / DEFER, PEND-2).
- Sincronización automática con Vinted (Vinted no tiene API pública de publicación → solo recordatorio/estado).
- Import automático del Excel (`STOCK.xlsx`) — primero ver columnas reales.
- Publicación automática sin revisión de Pablo (el modelo es DRAFT_ONLY).
- Gestión de pedidos/envíos en Studio (pedidos siguen en WooCommerce Admin).
- Pagos propios (WooPayments es la pasarela).
- Upload directo de imágenes (Opción C) — segunda iteración.
- App móvil, notificaciones, scraping de precios en tiempo real.

---

## 6. Stack y coste

| Pieza | Servicio | Coste MVP |
|-------|----------|-----------|
| DB + Auth + Storage | Supabase | Tier gratuito suficiente para el MVP (decenas de productos, 1 usuario). |
| Hosting app interna | Vercel | Tier gratuito (Hobby) para una app interna de 1 usuario. |
| Framework | Next.js (App Router) | OSS. |
| IA editorial | Claude API | Pago por uso; volumen bajo (1 llamada por camiseta). |
| Tienda + pagos | WooCommerce + WooPayments (ya existentes) | Hosting Raiola ya renovado. |

Compatible con `lafabrica-template` (Next.js/Vercel/Supabase es su dirección por defecto) y con la preferencia inicial registrada en DEC-5.

---

## 7. Secuencia de construcción (sesiones)

| Sesión | Tarea | Motor sugerido | Entregable |
|--------|-------|----------------|-----------|
| **S019** | `STUDIO_DATA_MODEL` | Sonnet (review Opus) | Esquema Supabase: tablas, enums 11 estados, RLS, bucket imágenes, `owner_id`. |
| **S020** | `STUDIO_WC_BRIDGE_CONTRACT` | Opus/Sonnet | Contrato Studio→WC: endpoints, mapeo `meta_data`, resolución de term IDs, `WC_API_WRITE_ACCESS_TEST` plan. |
| **S021** | `STUDIO_MVP_SCAFFOLD` | Sonnet/Codex | App Next.js + Supabase en Vercel; auth; vista de inventario vacía. |
| **S022** | `STUDIO_CREATE_AND_PUBLISH` | Sonnet/Codex | Formulario de alta + "Sugerir con Claude" + botón "Crear borrador en WC". |
| **gate** | Pablo publica 1 camiseta real E2E → 5–10 camiseta | — | Métrica: tiempo por camiseta. Revisión fría (RULE-01). |

Límite de tokens y STOP_AND_REPLAN: ver `CATENACCIO_STRATEGIC_ROADMAP.md §5`.

---

*Sesión 018 — 2026-06-27 — Claude Code (Opus 4.8). Modo STRATEGIC / DOCS_ONLY.*
*Modelo de datos canónico: `docs/operations/STOCK_OPERATIONS_MODEL.md`. Canal API: `docs/operations/ACCESS_MODEL_NO_SSH.md`. Mapeo meta_data: `docs/operations/API_READONLY_PROBE_RESULT.md`.*
